<?php
declare(strict_types=1);

require_once __DIR__ . '/app/Vendor/PdfCompat/PdfCompat.php';
require_once __DIR__ . '/pdf-editor/php/pdf_editor_document_utils.php';
require_once __DIR__ . '/services/PdfEditorRenderer.php';
require_once __DIR__ . '/services/TemplateRepository.php';
require_once __DIR__ . '/services/QuestionActionRepository.php';
require_once __DIR__ . '/services/RequestVariableConfigurator.php';
require_once __DIR__ . '/services/SavedResponseRepository.php';

use App\Vendor\PdfCompat\PdfCompat;
use DemandeEnLigne\PdfEditor\DocumentRepository;
use DemandeEnLigne\PdfEditor\PdfEditorRenderer;
use DemandeEnLigne\PdfEditor\TemplateRepository;
use DemandeEnLigne\PdfEditor\QuestionActionRepository;
use DemandeEnLigne\PdfEditor\RequestVariableConfigurator;
use DemandeEnLigne\PdfEditor\SavedResponseRepository;

header('Content-Type: application/json; charset=utf-8');

function sanitize_documents($documents) {
    return array_map(static function ($doc) {
        unset($doc['absolutePath']);
        return $doc;
    }, $documents);
}

function sanitize_document($doc) {
    unset($doc['absolutePath']);
    return $doc;
}

$action = $_GET['action'] ?? 'listRequests';
$repo = new DocumentRepository(__DIR__ . '/data/requests');
$templateRepo = new TemplateRepository(__DIR__ . '/data/templates');
$questionRepo = new QuestionActionRepository(__DIR__ . '/data');
$requestConfigurator = new RequestVariableConfigurator(
    __DIR__ . '/data/requests',
    __DIR__ . '/data/variables/definitions.json'
);
$savedResponseRepo = new SavedResponseRepository(__DIR__ . '/data');

function resolve_request_directory(string $requestId): ?string
{
    $safe = trim($requestId);
    if ($safe === '' || $safe === '.' || $safe === '..') {
        return null;
    }
    if (!preg_match("~^[\\p{L}0-9 _\\-()'’]+$~u", $safe)) {
        return null;
    }

    $base = realpath(__DIR__ . '/data/requests');
    if ($base === false) {
        return null;
    }

    $path = $base . DIRECTORY_SEPARATOR . $safe;
    $resolved = realpath($path);
    if ($resolved === false) {
        return null;
    }

    $normalizedBase = $base . DIRECTORY_SEPARATOR;
    $normalizedResolved = rtrim($resolved, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strncmp($normalizedResolved, $normalizedBase, strlen($normalizedBase)) !== 0) {
        return null;
    }

    return $resolved;
}

/**
 * @param array<int, string> $alternateDirectories
 * @param array<int, string> $alternateFileNames
 */
function load_request_payload(string $requestId, string $fileName, array $alternateDirectories = [], array $alternateFileNames = []): array
{
    global $requestConfigurator;
    $directory = resolve_request_directory($requestId);
    if ($directory === null) {
        return [];
    }

    $candidates = [];
    $candidates[] = $directory . DIRECTORY_SEPARATOR . $fileName;

    $normalizedDirectories = [];
    foreach ($alternateDirectories as $subDir) {
        $clean = trim($subDir);
        if ($clean === '') {
            continue;
        }
        $normalizedDirectories[] = $clean;
    }

    $fileNames = $alternateFileNames;
    if (!$fileNames) {
        $fileNames = [$fileName];
    }

    foreach ($normalizedDirectories as $subDir) {
        $base = $directory . DIRECTORY_SEPARATOR . $subDir;
        foreach ($fileNames as $altFile) {
            $candidates[] = $base . DIRECTORY_SEPARATOR . $altFile;
        }
    }

    foreach ($candidates as $path) {
        if (!is_string($path) || $path === '') {
            continue;
        }
        if (!is_file($path)) {
            continue;
        }
        $contents = file_get_contents($path);
        if ($contents === false) {
            continue;
        }
        $decoded = json_decode($contents, true);
        if (is_array($decoded)) {
            if ($fileName === 'request.json') {
                $normalized = ensure_request_full_name($decoded);
                $expanded = $normalized;
                if (isset($requestConfigurator) && $requestConfigurator instanceof RequestVariableConfigurator) {
                    try {
                        $expanded = $requestConfigurator->expandAllVariables($expanded);
                    } catch (\Throwable $expandError) {
                        error_log(sprintf('Impossible d\'indexer les variables pour "%s": %s', $requestId, $expandError->getMessage()));
                    }
                }
                if ($expanded !== $decoded) {
                    $decoded = $expanded;
                    try {
                        persist_json_file($path, $decoded);
                    } catch (\Throwable $persistError) {
                        error_log(sprintf('Impossible de mettre à jour le fichier request.json pour "%s": %s', $requestId, $persistError->getMessage()));
                    }
                }
            }
            return $decoded;
        }
    }

    return [];
}

/**
 * @return array{0: string, 1: string}
 */
function split_customer_name(string $value): array
{
    $name = trim($value);
    if ($name === '') {
        return ['', ''];
    }
    $parts = preg_split('~\s+~u', $name) ?: [];
    if (count($parts) === 0) {
        return ['', ''];
    }
    $first = array_shift($parts);
    $last = trim(implode(' ', $parts));
    return [
        is_string($first) ? $first : '',
        $last,
    ];
}

/**
 * @param array<string, mixed> $data
 *
 * @return array<string, mixed>
 */
function ensure_request_full_name(array $data): array
{
    $variables = isset($data['variables']) && is_array($data['variables']) ? $data['variables'] : [];

    $firstName = '';
    if (isset($data['prenom']) && is_string($data['prenom'])) {
        $firstName = trim($data['prenom']);
    }
    if ($firstName === '' && isset($variables['prenom'])) {
        $firstName = trim((string) $variables['prenom']);
    }

    $lastName = '';
    if (isset($data['nom']) && is_string($data['nom'])) {
        $lastName = trim($data['nom']);
    }
    if ($lastName === '' && isset($variables['nom'])) {
        $lastName = trim((string) $variables['nom']);
    }

    $customer = isset($data['customer']) && is_string($data['customer']) ? trim($data['customer']) : '';
    if (($firstName === '' || $lastName === '') && $customer !== '') {
        [$derivedFirst, $derivedLast] = split_customer_name($customer);
        if ($firstName === '' && $derivedFirst !== '') {
            $firstName = $derivedFirst;
        }
        if ($lastName === '') {
            $lastName = $derivedLast !== '' ? $derivedLast : $customer;
        }
    }

    $fullName = trim($firstName . ' ' . $lastName);
    if ($fullName === '' && $customer !== '') {
        $fullName = $customer;
    }

    if ($fullName === '') {
        return $data;
    }

    if ($firstName !== '') {
        $data['prenom'] = $firstName;
        $variables['prenom'] = $firstName;
    }
    if ($lastName !== '') {
        $data['nom'] = $lastName;
        $variables['nom'] = $lastName;
    }

    $data['nom_complet'] = $fullName;
    $variables['nom_complet'] = $fullName;
    $data['variables'] = $variables;

    return $data;
}

function load_json_file(string $path, array $default = []): array
{
    if (!is_file($path)) {
        return $default;
    }

    $contents = file_get_contents($path);
    if ($contents === false) {
        return $default;
    }

    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : $default;
}

function persist_json_file(string $path, array $data): void
{
    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        throw new \RuntimeException('Impossible d\'encoder les données.');
    }
    if (file_put_contents($path, $encoded) === false) {
        throw new \RuntimeException('Impossible d\'écrire les données.');
    }
}

function normalize_utf8_lower(string $value): string
{
    if (function_exists('mb_strtolower')) {
        return mb_strtolower($value, 'UTF-8');
    }

    return strtolower($value);
}

function sanitize_request_id_param(string $value): string
{
    $value = trim($value);
    if ($value === '' || !preg_match("~^[\\p{L}0-9 _\\-()'’]+$~u", $value)) {
        throw new \RuntimeException('Identifiant de dossier invalide.');
    }

    return $value;
}

function sanitize_document_name_param(string $value): string
{
    $value = trim($value);
    if ($value === '' || strpos($value, '..') !== false || preg_match('~[\\/]~', $value)) {
        throw new \RuntimeException('Nom de document invalide.');
    }

    return $value;
}

function sanitize_template_id_param(string $value): string
{
    $value = trim($value);
    if ($value === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $value)) {
        throw new \RuntimeException('Identifiant de modèle invalide.');
    }

    return $value;
}

function sanitize_question_class_id(string $value): string
{
    $value = trim($value);
    if ($value === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $value)) {
        throw new \RuntimeException('Identifiant de classe Questions/Actions invalide.');
    }

    return $value;
}

function normalize_common_group($value): string
{
    if (!is_string($value)) {
        return '';
    }
    $normalized = preg_replace('~[\s-]+~u', '_', trim($value));
    return strtolower($normalized ?? '');
}

function is_common_group(string $value): bool
{
    $normalized = normalize_common_group($value);
    return in_array($normalized, ['fused', 'dossier_general', 'common', 'common_values', 'valeurs_communes', 'shared'], true);
}

function metadata_indicates_common($metadata): bool
{
    if (!is_array($metadata)) {
        return false;
    }
    if (!empty($metadata['common']) || !empty($metadata['fused'])) {
        return true;
    }
    $keys = ['group', 'targetGroup', 'valueGroup', 'dataset', 'target', 'scope'];
    foreach ($keys as $key) {
        $entry = $metadata[$key] ?? null;
        if (is_string($entry) && is_common_group($entry)) {
            return true;
        }
        if (is_array($entry)) {
            foreach ($entry as $item) {
                if (is_string($item) && is_common_group($item)) {
                    return true;
                }
            }
        }
    }
    if (isset($metadata['groups']) && is_array($metadata['groups'])) {
        foreach ($metadata['groups'] as $item) {
            if (is_string($item) && is_common_group($item)) {
                return true;
            }
        }
    }
    return false;
}

function question_targets_common_group(array $classData, array $assignment, array $question): string
{
    if (metadata_indicates_common($assignment['metadata'] ?? null)) {
        return 'fused';
    }
    if (metadata_indicates_common($classData['metadata'] ?? null)) {
        return 'fused';
    }
    if (metadata_indicates_common($question['metadata'] ?? null)) {
        return 'fused';
    }
    $autoSource = isset($question['auto']['source']) ? strtolower(trim((string) $question['auto']['source'])) : '';
    if ($autoSource !== '' && is_common_group($autoSource)) {
        return 'fused';
    }
    return '';
}

function resolve_question_target_key(array $classData, array $assignment, array $question): string
{
    $sources = [];
    if (isset($assignment['metadata']) && is_array($assignment['metadata'])) {
        $sources[] = $assignment['metadata'];
    }
    if (isset($classData['metadata']) && is_array($classData['metadata'])) {
        $sources[] = $classData['metadata'];
    }
    if (isset($question['metadata']) && is_array($question['metadata'])) {
        $sources[] = $question['metadata'];
    }
    $keyNames = ['targetKey', 'variableKey', 'valueKey', 'key', 'fusedKey', 'dataKey'];
    foreach ($sources as $source) {
        foreach ($keyNames as $keyName) {
            $candidate = $source[$keyName] ?? null;
            if (is_string($candidate)) {
                $trimmed = trim($candidate);
                if ($trimmed !== '') {
                    return $trimmed;
                }
            }
        }
        if (isset($source['targetKeys']) && is_array($source['targetKeys'])) {
            foreach ($source['targetKeys'] as $candidate) {
                if (is_string($candidate)) {
                    $trimmed = trim($candidate);
                    if ($trimmed !== '') {
                        return $trimmed;
                    }
                }
            }
        }
    }
    $code = $question['code'] ?? '';
    if (is_string($code)) {
        $trimmed = trim($code);
        if ($trimmed !== '') {
            return $trimmed;
        }
    }
    $questionId = $question['id'] ?? '';
    return is_string($questionId) ? trim($questionId) : '';
}

/**
 * @param array<string, mixed> $question
 * @param array<string, mixed> $answer
 * @return array{value: mixed, hasValue: bool}
 */
function compute_common_answer_value(array $question, array $answer): array
{
    $type = strtolower(trim((string) ($question['type'] ?? 'open')));
    if ($type === 'choice' || $type === 'dot') {
        $options = [];
        if (isset($question['options']) && is_array($question['options'])) {
            foreach ($question['options'] as $option) {
                if (!is_array($option)) {
                    continue;
                }
                $optionId = isset($option['id']) ? trim((string) $option['id']) : '';
                if ($optionId === '') {
                    continue;
                }
                $options[$optionId] = $option;
            }
        }
        $selected = [];
        $optionIds = isset($answer['optionIds']) && is_array($answer['optionIds']) ? $answer['optionIds'] : [];
        foreach ($optionIds as $optionIdRaw) {
            $optionId = trim((string) $optionIdRaw);
            if ($optionId === '' || !isset($options[$optionId])) {
                continue;
            }
            $option = $options[$optionId];
            $value = $option['value'] ?? null;
            if (is_string($value) || is_numeric($value)) {
                $selected[] = (string) $value;
            } elseif (isset($option['label']) && is_string($option['label'])) {
                $selected[] = $option['label'];
            } else {
                $selected[] = $optionId;
            }
        }
        $allowMultiple = !empty($question['allowMultiple']);
        if (!$selected) {
            return ['value' => $allowMultiple ? [] : '', 'hasValue' => false];
        }
        if ($allowMultiple) {
            return ['value' => array_values($selected), 'hasValue' => true];
        }
        return ['value' => $selected[0], 'hasValue' => true];
    }

    if (array_key_exists('value', $answer)) {
        $raw = $answer['value'];
        if (is_string($raw) || is_numeric($raw)) {
            $trimmed = trim((string) $raw);
            return ['value' => $trimmed, 'hasValue' => $trimmed !== ''];
        }
        if (is_array($raw)) {
            $filtered = array_values(array_filter($raw, static function ($item) {
                if (is_string($item) || is_numeric($item)) {
                    return trim((string) $item) !== '';
                }
                return $item !== null;
            }));
            return ['value' => $filtered, 'hasValue' => count($filtered) > 0];
        }
    }

    return ['value' => '', 'hasValue' => false];
}

function sanitize_relative_folder(string $value): string
{
    $value = trim($value);
    if ($value === '' || strpos($value, '..') !== false) {
        return '';
    }
    $value = str_replace('\\', '/', $value);
    return trim($value, '/');
}

function sanitize_folder_name(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }
    $value = str_replace(['\\', '/'], ' ', $value);
    $value = preg_replace('~[<>:"|?*]+~u', '', $value) ?? '';
    $value = preg_replace('~\s+~u', ' ', $value) ?? '';
    $value = trim($value, " .\t\n\r\0\x0B");
    if ($value === '') {
        return '';
    }
    $maxLength = 80;
    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($value, 'UTF-8') > $maxLength) {
            $value = mb_substr($value, 0, $maxLength, 'UTF-8');
        }
    } else {
        if (strlen($value) > $maxLength) {
            $value = substr($value, 0, $maxLength);
        }
    }
    return trim($value, " .\t\n\r\0\x0B");
}

function ensure_path_within_base(string $base, string $path): void
{
    $baseReal = realpath($base);
    $pathReal = realpath($path);
    if ($baseReal === false || $pathReal === false) {
        throw new \RuntimeException('Chemin invalide.');
    }
    $normalizedBase = rtrim($baseReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    $normalizedPath = rtrim($pathReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strncmp($normalizedPath, $normalizedBase, strlen($normalizedBase)) !== 0) {
        throw new \RuntimeException('Chemin hors du dossier autorisé.');
    }
}

function normalize_variable_group_id(string $groupId): string
{
    $value = strtolower(trim($groupId));
    return match ($value) {
        'fiche', 'fiche_client', 'client', 'request' => 'request',
        'dossier', 'general', 'dossier_general', 'fused' => 'fused',
        'mes', 'coordonnees', 'mes_coordonnees', 'admin' => 'admin',
        default => $value,
    };
}

function default_variable_group_label(string $groupId): string
{
    return match ($groupId) {
        'admin' => 'Mes coordonnées',
        'fused' => 'Dossier général',
        'request' => 'Fiche client',
        default => ucfirst(str_replace('_', ' ', $groupId)),
    };
}

function variable_group_source(string $groupId): string
{
    return match ($groupId) {
        'admin' => 'admin_profile',
        'fused' => 'fused',
        'request' => 'request',
        default => $groupId,
    };
}

function list_signing_directories_for_request(string $requestId): array
{
    $base = resolve_request_directory($requestId);
    if ($base === null) {
        return [];
    }
    $items = [];
    $entries = @scandir($base);
    if (!is_array($entries)) {
        return [];
    }
    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        if ($entry[0] === '.') {
            continue;
        }
        $fullPath = $base . DIRECTORY_SEPARATOR . $entry;
        if (!is_dir($fullPath)) {
            continue;
        }
        $lower = function_exists('mb_strtolower') ? mb_strtolower($entry, 'UTF-8') : strtolower($entry);
        $normalized = str_replace(['_', '-'], ' ', $lower);
        $normalizedAscii = str_replace(['é', 'è', 'ê', 'ë'], 'e', $normalized);
        if (trim($normalized) === 'dossier général' || trim($normalizedAscii) === 'dossier general') {
            continue;
        }
        if (preg_match('~^dossier\s+g[eé]n[ée]ral~u', $normalized) || preg_match('~^dossier\s+general~u', $normalizedAscii)) {
            continue;
        }
        $real = realpath($fullPath);
        if ($real === false) {
            continue;
        }
        try {
            ensure_path_within_base($base, $real);
        } catch (\RuntimeException $e) {
            continue;
        }
        $relative = ltrim(str_replace($base, '', $real), DIRECTORY_SEPARATOR);
        $items[] = [
            'name' => $entry,
            'relativePath' => str_replace(DIRECTORY_SEPARATOR, '/', $relative),
            'updatedAt' => date('c', filemtime($real) ?: time()),
        ];
    }
    usort($items, static fn($a, $b) => strcasecmp($a['name'], $b['name']));
    return $items;
}

function build_target_file_path(string $destinationDir, string $fileName, string $requestId): string
{
    $baseName = trim(pathinfo($fileName, PATHINFO_FILENAME));
    if ($baseName === '') {
        $baseName = 'document';
    }
    $baseName = preg_replace('~[^A-Za-z0-9_\-]+~', '-', $baseName) ?? 'document';
    $clientSlug = preg_replace('~[^A-Za-z0-9_\-]+~', '-', $requestId) ?? 'client';
    $timestamp = date('Ymd_His');
    $base = rtrim($baseName, '-') . '_' . $clientSlug . '_' . $timestamp;
    $target = $destinationDir . DIRECTORY_SEPARATOR . $base . '.pdf';
    $index = 2;
    while (file_exists($target)) {
        $target = $destinationDir . DIRECTORY_SEPARATOR . $base . '_' . $index . '.pdf';
        $index++;
    }

    return $target;
}

function is_list_array(array $value): bool
{
    if (function_exists('array_is_list')) {
        return array_is_list($value);
    }
    $expected = 0;
    foreach ($value as $key => $_) {
        if ($key !== $expected) {
            return false;
        }
        $expected++;
    }
    return true;
}

function extract_entry_payload(array $entry, string $targetKey, string $normalizedTarget)
{
    $identifierKeys = ['key', 'id', 'slug', 'code', 'name', 'identifier', 'field'];
    foreach ($identifierKeys as $identifierKey) {
        if (!array_key_exists($identifierKey, $entry)) {
            continue;
        }
        $candidate = $entry[$identifierKey];
        if (!is_scalar($candidate) && !($candidate instanceof \Stringable)) {
            continue;
        }
        if (normalize_utf8_lower((string) $candidate) !== $normalizedTarget) {
            continue;
        }

        $value = extract_preferred_value($entry, $targetKey, $normalizedTarget);
        if ($value !== null) {
            return $value;
        }
    }

    return null;
}

function extract_preferred_value(array $entry, string $targetKey, string $normalizedTarget)
{
    $valueKeys = ['value', 'values', 'answer', 'answers', 'response', 'responses', 'text', 'content', 'data', 'default'];
    foreach ($valueKeys as $valueKey) {
        if (!array_key_exists($valueKey, $entry)) {
            continue;
        }
        $raw = $entry[$valueKey];
        if (in_array($valueKey, ['values', 'answers', 'responses'], true) && (is_array($raw) || $raw instanceof \stdClass)) {
            $collection = [];
            foreach ((array) $raw as $item) {
                if ($item instanceof \stdClass) {
                    $item = (array) $item;
                }
                if (is_array($item)) {
                    if (array_key_exists('value', $item)) {
                        $collection[] = $item['value'];
                        continue;
                    }
                    if (array_key_exists('label', $item)) {
                        $collection[] = $item['label'];
                        continue;
                    }
                }
                $collection[] = $item;
            }
            if (count($collection) === 1) {
                return $collection[0];
            }
            if (!empty($collection)) {
                return $collection;
            }
            continue;
        }
        if ($raw !== null) {
            return $raw;
        }
    }

    $nestedKeys = ['children', 'fields', 'items', 'options', 'sections', 'steps', 'entries'];
    foreach ($nestedKeys as $nestedKey) {
        if (!array_key_exists($nestedKey, $entry)) {
            continue;
        }
        $nested = $entry[$nestedKey];
        if (is_array($nested) || $nested instanceof \stdClass) {
            $found = extract_value_by_key($nested, $targetKey);
            if ($found !== null) {
                return $found;
            }
        }
    }

    return null;
}

function extract_value_by_key($source, string $targetKey)
{
    if ($source === null) {
        return null;
    }
    if ($source instanceof \stdClass) {
        $source = (array) $source;
    }
    if (!is_array($source)) {
        return null;
    }
    $normalizedTarget = normalize_utf8_lower($targetKey);

    if (!is_list_array($source)) {
        foreach ($source as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $normalizedKey = normalize_utf8_lower($key);
            if ($normalizedKey === $normalizedTarget) {
                return $value;
            }
        }
    }

    foreach ($source as $value) {
        if ($value instanceof \stdClass) {
            $value = (array) $value;
        }
        if (!is_array($value)) {
            continue;
        }

        $matched = extract_entry_payload($value, $targetKey, $normalizedTarget);
        if ($matched !== null) {
            return $matched;
        }

        $found = extract_value_by_key($value, $targetKey);
        if ($found !== null) {
            return $found;
        }
    }

    return null;
}

function stringify_variable_value($value, ?string $contextKey = null): string
{
    if ($value === null) {
        return '';
    }
    if (is_bool($value)) {
        return $value ? 'Oui' : 'Non';
    }
    if ($value instanceof \Stringable) {
        $value = (string) $value;
    }
    if (is_scalar($value)) {
        return (string) $value;
    }
    if ($value instanceof \stdClass) {
        $value = (array) $value;
    }
    if (is_array($value) || $value instanceof \stdClass) {
        $normalizedContext = $contextKey !== null ? normalize_utf8_lower($contextKey) : null;
        if ($normalizedContext !== null && in_array($normalizedContext, ['adresses', 'emplois'], true)) {
            return stringify_address_collection((array) $value);
        }

        $items = [];
        foreach ((array) $value as $entry) {
            $stringified = stringify_variable_value($entry, $contextKey);
            if ($stringified !== '') {
                $items[] = $stringified;
            }
        }
        if (!$items) {
            return json_encode($value, JSON_UNESCAPED_UNICODE) ?: '';
        }
        return implode(', ', $items);
    }
    return (string) $value;
}

/**
 * @return array{page:int,x:float,y:float}|null
 */
function parse_coordinate_string(string $coordinate)
{
    $parts = preg_split('~[;]+~', $coordinate) ?: [];
    $page = null;
    $x = null;
    $y = null;

    foreach ($parts as $part) {
        $pair = explode('=', $part, 2);
        if (count($pair) !== 2) {
            continue;
        }
        $key = normalize_utf8_lower(trim($pair[0]));
        $value = trim($pair[1]);
        if ($key === 'page') {
            $pageValue = filter_var($value, FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE);
            if ($pageValue !== null && $pageValue > 0) {
                $page = (int) $pageValue - 1;
            }
        } elseif ($key === 'x') {
            $x = (float) str_replace(',', '.', $value);
        } elseif ($key === 'y') {
            $y = (float) str_replace(',', '.', $value);
        }
    }

    if ($page === null || $x === null || $y === null) {
        return null;
    }

    if ($page < 0) {
        $page = 0;
    }

    return [
        'page' => $page,
        'x' => $x,
        'y' => $y,
    ];
}

/**
 * @param mixed $source
 */
function extract_value_at_path($source, string $path)
{
    $path = trim($path);
    if ($path === '') {
        return null;
    }
    if ($source instanceof \stdClass) {
        $source = (array) $source;
    }
    if (!is_array($source)) {
        return null;
    }

    $segments = preg_split('~\.+~', $path) ?: [];
    $current = $source;
    foreach ($segments as $segment) {
        $segment = trim((string) $segment);
        if ($segment === '') {
            return null;
        }
        if ($current instanceof \stdClass) {
            $current = (array) $current;
        }
        if (!is_array($current)) {
            return null;
        }
        if (ctype_digit($segment)) {
            $index = (int) $segment;
            if (array_key_exists($index, $current)) {
                $current = $current[$index];
                continue;
            }
            $values = array_values($current);
            if (array_key_exists($index, $values)) {
                $current = $values[$index];
                continue;
            }
            return null;
        }
        $matched = null;
        $normalizedSegment = normalize_utf8_lower($segment);
        foreach ($current as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            if (normalize_utf8_lower($key) === $normalizedSegment) {
                $matched = $value;
                break;
            }
        }
        if ($matched === null) {
            return null;
        }
        $current = $matched;
    }

    return $current;
}

/**
 * @param array<int, array<string, mixed>> $contexts
 * @return array<int, array{rank:int,value:mixed,text:string}>
 */
function collect_request_path_values(array $contexts, string $path): array
{
    $entries = [];
    $path = trim($path);
    $contextKey = '';
    if ($path !== '') {
        $segments = preg_split('~\.+~', $path) ?: [];
        $last = end($segments);
        if (is_string($last)) {
            $contextKey = $last;
        }
    }

    foreach ($contexts as $rank => $context) {
        if (!is_array($context)) {
            continue;
        }
        $requestData = $context['requestData'] ?? null;
        $value = extract_value_at_path($requestData, $path);
        if ($value === null) {
            $value = extract_value_by_key($requestData, $path);
        }
        $text = $value !== null ? stringify_variable_value($value, $contextKey) : '';
        $entries[] = [
            'rank' => (int) $rank,
            'value' => $value,
            'text' => $text,
        ];
    }

    return $entries;
}

/**
 * @param array<int, array{rank:int,value:mixed,text:string}> $entries
 * @param array<int, string> $terms
 * @return array{matched:bool,matchedRanks:array<int,int>}
 */
function evaluate_auto_condition(array $entries, string $type, array $terms): array
{
    $normalizedTerms = [];
    foreach ($terms as $term) {
        $trimmed = trim((string) $term);
        if ($trimmed === '') {
            continue;
        }
        $normalizedTerms[] = normalize_utf8_lower($trimmed);
    }
    $normalizedTerms = array_values(array_unique($normalizedTerms));

    $matchedRanks = [];
    $allRanks = array_map(static fn(array $entry): int => $entry['rank'], $entries);

    $type = strtolower($type);
    if ($type === 'contains') {
        foreach ($entries as $entry) {
            $value = normalize_utf8_lower($entry['text']);
            if ($value === '') {
                continue;
            }
            if (!$normalizedTerms) {
                $matchedRanks[] = $entry['rank'];
                continue;
            }
            foreach ($normalizedTerms as $term) {
                if ($term !== '' && str_contains($value, $term)) {
                    $matchedRanks[] = $entry['rank'];
                    break;
                }
            }
        }
        return [
            'matched' => $matchedRanks !== [],
            'matchedRanks' => array_values(array_unique($matchedRanks)),
        ];
    }

    if ($type === 'equals') {
        foreach ($entries as $entry) {
            $value = normalize_utf8_lower($entry['text']);
            if ($value === '') {
                continue;
            }
            if (!$normalizedTerms) {
                $matchedRanks[] = $entry['rank'];
                continue;
            }
            foreach ($normalizedTerms as $term) {
                if ($term !== '' && $value === $term) {
                    $matchedRanks[] = $entry['rank'];
                    break;
                }
            }
        }
        return [
            'matched' => $matchedRanks !== [],
            'matchedRanks' => array_values(array_unique($matchedRanks)),
        ];
    }

    if ($type === 'not_contains') {
        if (!$normalizedTerms) {
            return ['matched' => true, 'matchedRanks' => array_values(array_unique($allRanks))];
        }
        foreach ($entries as $entry) {
            $value = normalize_utf8_lower($entry['text']);
            foreach ($normalizedTerms as $term) {
                if ($term !== '' && $value !== '' && str_contains($value, $term)) {
                    return ['matched' => false, 'matchedRanks' => []];
                }
            }
        }
        return ['matched' => true, 'matchedRanks' => array_values(array_unique($allRanks))];
    }

    if ($type === 'not_equals') {
        if (!$normalizedTerms) {
            return ['matched' => true, 'matchedRanks' => array_values(array_unique($allRanks))];
        }
        foreach ($entries as $entry) {
            $value = normalize_utf8_lower($entry['text']);
            foreach ($normalizedTerms as $term) {
                if ($term !== '' && $value === $term) {
                    return ['matched' => false, 'matchedRanks' => []];
                }
            }
        }
        return ['matched' => true, 'matchedRanks' => array_values(array_unique($allRanks))];
    }

    if ($type === 'empty') {
        foreach ($entries as $entry) {
            if (trim($entry['text']) !== '') {
                return ['matched' => false, 'matchedRanks' => []];
            }
        }
        return ['matched' => true, 'matchedRanks' => array_values(array_unique($allRanks))];
    }

    if ($type === 'not_empty') {
        foreach ($entries as $entry) {
            if (trim($entry['text']) !== '') {
                $matchedRanks[] = $entry['rank'];
            }
        }
        return [
            'matched' => $matchedRanks !== [],
            'matchedRanks' => array_values(array_unique($matchedRanks)),
        ];
    }

    return ['matched' => false, 'matchedRanks' => []];
}

/**
 * @param array<int, array{rank:int,value:mixed,text:string}> $entries
 * @param array<int, array<string, mixed>> $contexts
 * @param array<int, int> $matchedRanks
 */
/**
 * @param array<string, mixed> $auto
 * @return array<int>
 */
function extract_auto_target_ranks(array $auto): array
{
    $metadata = is_array($auto['metadata'] ?? null) ? $auto['metadata'] : [];
    $candidates = [];
    foreach (['targetRanks', 'contextRanks', 'ranks'] as $key) {
        if (isset($metadata[$key])) {
            $candidates[] = $metadata[$key];
        }
    }
    if (array_key_exists('targetRank', $metadata)) {
        $candidates[] = $metadata['targetRank'];
    }
    if (array_key_exists('contextRank', $metadata)) {
        $candidates[] = $metadata['contextRank'];
    }

    $ranks = [];
    foreach ($candidates as $candidate) {
        if (is_array($candidate)) {
            foreach ($candidate as $entry) {
                if (is_numeric($entry)) {
                    $rank = (int) $entry;
                    if ($rank > 0) {
                        $ranks[] = $rank;
                    }
                } elseif (is_string($entry)) {
                    foreach (preg_split('~[;,]+~', $entry) ?: [] as $segment) {
                        $segment = trim($segment);
                        if ($segment === '') {
                            continue;
                        }
                        if (is_numeric($segment)) {
                            $rank = (int) $segment;
                            if ($rank > 0) {
                                $ranks[] = $rank;
                            }
                        }
                    }
                }
            }
        } elseif (is_numeric($candidate)) {
            $rank = (int) $candidate;
            if ($rank > 0) {
                $ranks[] = $rank;
            }
        } elseif (is_string($candidate)) {
            foreach (preg_split('~[;,]+~', $candidate) ?: [] as $segment) {
                $segment = trim($segment);
                if ($segment === '') {
                    continue;
                }
                if (is_numeric($segment)) {
                    $rank = (int) $segment;
                    if ($rank > 0) {
                        $ranks[] = $rank;
                    }
                }
            }
        }
    }

    if ($ranks === []) {
        return [];
    }

    $unique = array_values(array_unique(array_filter($ranks, static function ($rank): bool {
        return is_int($rank) && $rank > 0;
    })));
    sort($unique);
    return $unique;
}

function resolve_auto_selection_text(array $auto, array $entries, array $contexts, array $matchedRanks): string
{
    $valueSource = strtolower((string) ($auto['valueSource'] ?? 'request'));
    $fallback = trim((string) ($auto['fallback'] ?? ''));

    if ($valueSource === 'literal') {
        $literal = (string) ($auto['valueLiteral'] ?? '');
        if (trim($literal) !== '') {
            return $literal;
        }
        return $fallback;
    }

    if ($valueSource === 'dot') {
        return '●';
    }

    if ($valueSource === 'checkmark') {
        return '✓';
    }

    $paths = [];
    $valuePath = trim((string) ($auto['valuePath'] ?? ''));
    if ($valuePath !== '') {
        $paths[] = $valuePath;
    }
    $requestPath = trim((string) ($auto['requestPath'] ?? ''));
    if ($requestPath !== '') {
        $paths[] = $requestPath;
    }

    $priorities = [];
    foreach ($matchedRanks as $index => $rank) {
        $priorities[$rank] = $index;
    }

    foreach ($paths as $path) {
        $candidates = collect_request_path_values($contexts, $path);
        if ($candidates === []) {
            continue;
        }
        usort($candidates, static function (array $a, array $b) use ($priorities): int {
            $priorityA = $priorities[$a['rank']] ?? PHP_INT_MAX;
            $priorityB = $priorities[$b['rank']] ?? PHP_INT_MAX;
            if ($priorityA === $priorityB) {
                return $a['rank'] <=> $b['rank'];
            }
            return $priorityA <=> $priorityB;
        });
        foreach ($candidates as $candidate) {
            if (trim($candidate['text']) !== '') {
                return $candidate['text'];
            }
        }
    }

    foreach ($entries as $entry) {
        if (trim($entry['text']) !== '') {
            return $entry['text'];
        }
    }

    return $fallback;
}

/**
 * @param mixed $coordinates
 * @return array<int, string>
 */
function extract_coordinate_list($coordinates): array
{
    if (is_string($coordinates)) {
        $trimmed = trim($coordinates);
        return $trimmed !== '' ? [$trimmed] : [];
    }
    if ($coordinates instanceof \stdClass) {
        $coordinates = (array) $coordinates;
    }
    if (!is_array($coordinates)) {
        return [];
    }
    $list = [];
    foreach ($coordinates as $coordinate) {
        if (!is_string($coordinate)) {
            continue;
        }
        $trimmed = trim($coordinate);
        if ($trimmed !== '') {
            $list[] = $trimmed;
        }
    }
    return $list;
}

/**
 * @param array<int, array{rank:int,value:mixed,text:string}> $conditionEntries
 * @param array<int, int> $matchedRanks
 * @param array<int, array<string, mixed>> $contexts
 * @return array<int, string>
 */
function resolve_auto_coordinates(array $auto, array $conditionEntries, array $matchedRanks, array $contexts): array
{
    $metadata = is_array($auto['metadata'] ?? null) ? $auto['metadata'] : [];
    $dynamic = is_array($metadata['dynamicCoordinates'] ?? null) ? $metadata['dynamicCoordinates'] : [];
    $baseCoordinate = trim((string) ($auto['coordinate'] ?? ''));

    if (($dynamic['enabled'] ?? false) !== true) {
        return $baseCoordinate !== '' ? [$baseCoordinate] : [];
    }

    $mode = strtolower((string) ($dynamic['mode'] ?? 'maxClients'));
    if ($mode === 'requestvalue') {
        $path = trim((string) ($dynamic['requestPath'] ?? ''));
        if ($path === '') {
            $path = trim((string) ($auto['requestPath'] ?? ''));
        }
        $referenceEntries = $path !== ''
            ? collect_request_path_values($contexts, $path)
            : $conditionEntries;
        $normalizedValues = [];
        foreach ($referenceEntries as $entry) {
            if (trim($entry['text']) === '') {
                continue;
            }
            $normalizedValues[] = normalize_utf8_lower($entry['text']);
        }
        $normalizedValues = array_values(array_unique($normalizedValues));

        $cases = [];
        if (isset($dynamic['requestValues']['cases']) && is_array($dynamic['requestValues']['cases'])) {
            $cases = $dynamic['requestValues']['cases'];
        } elseif (isset($dynamic['requestValues']) && is_array($dynamic['requestValues'])) {
            $cases = $dynamic['requestValues'];
        }
        foreach ($cases as $case) {
            if (!is_array($case)) {
                continue;
            }
            $caseValue = trim((string) ($case['value'] ?? ''));
            if ($caseValue === '') {
                continue;
            }
            $normalizedCase = normalize_utf8_lower($caseValue);
            if (!in_array($normalizedCase, $normalizedValues, true)) {
                continue;
            }
            $coordinates = extract_coordinate_list($case['coordinates'] ?? []);
            if ($coordinates) {
                return $coordinates;
            }
        }

        $fallbackCoords = [];
        if (isset($dynamic['requestValues']['fallback'])) {
            $fallbackCoords = extract_coordinate_list($dynamic['requestValues']['fallback']);
        } elseif (isset($dynamic['fallback'])) {
            $fallbackCoords = extract_coordinate_list($dynamic['fallback']);
        }
        if ($fallbackCoords) {
            return $fallbackCoords;
        }

        return $baseCoordinate !== '' ? [$baseCoordinate] : [];
    }

    $entries = isset($dynamic['maxClients']) && is_array($dynamic['maxClients'])
        ? $dynamic['maxClients']
        : [];
    $matchedCount = count(array_unique($matchedRanks));
    $bestMatch = [];
    $bestCount = -1;
    foreach ($entries as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $count = isset($entry['count']) && is_numeric($entry['count']) ? (int) $entry['count'] : 0;
        if ($count <= 0) {
            continue;
        }
        $coordinates = extract_coordinate_list($entry['coordinates'] ?? []);
        if (!$coordinates) {
            continue;
        }
        if ($matchedCount === $count) {
            return $coordinates;
        }
        if ($count < $matchedCount && $count > $bestCount) {
            $bestCount = $count;
            $bestMatch = $coordinates;
        }
    }
    if ($bestMatch) {
        return $bestMatch;
    }

    return $baseCoordinate !== '' ? [$baseCoordinate] : [];
}

/**
 * @param array<int, array<string, mixed>> $assignments
 * @param array<string, array<string, mixed>> $classCatalog
 * @param array<int, array<string, mixed>> $contexts
 * @return array<int, array<string, mixed>>
 */
/**
 * @param array<string, mixed> $template
 *
 * @return array<int, array{page:int,x:float,y:float}>
 */
function collect_template_text_coordinates(array $template): array
{
    $coordinates = [];
    foreach ($template['elements'] ?? [] as $element) {
        if (!is_array($element)) {
            continue;
        }
        if (($element['type'] ?? 'text') !== 'text') {
            continue;
        }
        $page = isset($element['page']) && is_numeric($element['page']) ? (int) $element['page'] : 0;
        $x = isset($element['x']) ? (float) $element['x'] : 0.0;
        $y = isset($element['y']) ? (float) $element['y'] : 0.0;
        $coordinates[] = [
            'page' => $page,
            'x' => $x,
            'y' => $y,
        ];
    }

    return $coordinates;
}

/**
 * @param array{page:int,x:float,y:float} $reference
 * @param array<int, array{page:int,x:float,y:float}> $haystack
 */
function template_coordinate_exists(array $reference, array $haystack): bool
{
    foreach ($haystack as $candidate) {
        if ($candidate['page'] !== $reference['page']) {
            continue;
        }
        if (abs($candidate['x'] - $reference['x']) > 0.5) {
            continue;
        }
        if (abs($candidate['y'] - $reference['y']) > 0.5) {
            continue;
        }
        return true;
    }

    return false;
}

function build_auto_selection_elements(array $assignments, array $classCatalog, array $contexts, array $template = []): array
{
    $elements = [];
    $templateCoordinates = collect_template_text_coordinates($template);
    $autoOffsetX = 0.0;
    $autoOffsetY = 3.0;
    $autoFontSize = 12;
    $autoColor = '#000000';

    foreach ($assignments as $assignment) {
        if (!is_array($assignment)) {
            continue;
        }
        $classId = isset($assignment['id']) ? trim((string) $assignment['id']) : '';
        if ($classId === '' || !isset($classCatalog[$classId])) {
            continue;
        }
        $classData = $classCatalog[$classId];
        $autoSelections = is_array($classData['autoSelections'] ?? null)
            ? $classData['autoSelections']
            : [];
        foreach ($autoSelections as $auto) {
            if (!is_array($auto)) {
                continue;
            }
            $label = trim((string) ($auto['label'] ?? ''));
            if ($label === '') {
                continue;
            }
            $requestPath = trim((string) ($auto['requestPath'] ?? ''));
            if ($requestPath === '') {
                continue;
            }
            $conditionType = trim((string) ($auto['conditionType'] ?? 'contains'));
            $conditionTerms = [];
            if (isset($auto['conditionTerms']) && is_array($auto['conditionTerms'])) {
                $conditionTerms = $auto['conditionTerms'];
            }
            $conditionEntries = collect_request_path_values($contexts, $requestPath);
            if ($conditionEntries === []) {
                // Populate empty entries for each context to allow empty/not_empty evaluation.
                foreach ($contexts as $rank => $_context) {
                    $conditionEntries[] = [
                        'rank' => (int) $rank,
                        'value' => null,
                        'text' => '',
                    ];
                }
            }
            $condition = evaluate_auto_condition($conditionEntries, $conditionType, $conditionTerms);
            if ($condition['matched'] !== true) {
                continue;
            }
            $targetRanks = extract_auto_target_ranks($auto);
            $filteredContexts = $contexts;
            $matchedRanks = $condition['matchedRanks'];
            if ($targetRanks !== []) {
                $rankLookup = [];
                foreach ($targetRanks as $rank) {
                    $rankLookup[$rank] = true;
                }

                $conditionEntries = array_values(array_filter($conditionEntries, static function (array $entry) use ($rankLookup): bool {
                    return isset($rankLookup[$entry['rank'] ?? null]);
                }));

                $matchedRanks = array_values(array_filter($matchedRanks, static function ($rank) use ($rankLookup): bool {
                    return isset($rankLookup[$rank]);
                }));

                $filteredContexts = [];
                foreach ($contexts as $rank => $context) {
                    $intRank = (int) $rank;
                    if (isset($rankLookup[$intRank])) {
                        $filteredContexts[$intRank] = $context;
                    }
                }

                if ($conditionEntries === [] || $matchedRanks === [] || $filteredContexts === []) {
                    continue;
                }
            }

            $text = resolve_auto_selection_text($auto, $conditionEntries, $filteredContexts, $matchedRanks);
            if (trim($text) === '') {
                continue;
            }
            $coordinateList = resolve_auto_coordinates($auto, $conditionEntries, $matchedRanks, $filteredContexts);
            foreach ($coordinateList as $coordinateString) {
                $parsed = parse_coordinate_string($coordinateString);
                if ($parsed === null) {
                    continue;
                }
                if (template_coordinate_exists($parsed, $templateCoordinates)) {
                    continue;
                }
                $elements[] = [
                    'type' => 'text',
                    'page' => $parsed['page'],
                    'x' => $parsed['x'] + $autoOffsetX,
                    'y' => $parsed['y'] + $autoOffsetY,
                    'text' => $text,
                    'fontFamily' => 'Helvetica',
                    'fontSize' => $autoFontSize,
                    'color' => $autoColor,
                ];
            }
        }
    }

    return $elements;
}

/**
 * @param array<int|string, mixed> $entries
 */
function stringify_address_collection(array $entries): string
{
    $formatted = [];
    $seenEntries = [];

    foreach ($entries as $entry) {
        if ($entry instanceof \stdClass) {
            $entry = (array) $entry;
        }

        if (!is_array($entry)) {
            $component = stringify_address_piece($entry);
            $normalized = normalize_address_component($component);
            if ($normalized === '' || isset($seenEntries[$normalized])) {
                continue;
            }
            $seenEntries[$normalized] = true;
            $formatted[] = $component;
            continue;
        }

        $entryString = format_address_entry($entry);
        if ($entryString === '') {
            continue;
        }
        $normalizedEntry = normalize_address_component($entryString);
        if ($normalizedEntry === '' || isset($seenEntries[$normalizedEntry])) {
            continue;
        }
        $seenEntries[$normalizedEntry] = true;
        $formatted[] = $entryString;
    }

    return implode(PHP_EOL, $formatted);
}

/**
 * @param array<int|string, mixed> $entry
 */
function format_address_entry(array $entry): string
{
    $components = [];
    $seenTokens = [];

    foreach ($entry as $value) {
        $component = stringify_address_piece($value);
        $normalized = normalize_address_component($component);
        if ($normalized === '') {
            continue;
        }

        $tokens = extract_address_tokens($normalized);
        $hasNewToken = false;
        foreach ($tokens as $token) {
            if (!isset($seenTokens[$token])) {
                $hasNewToken = true;
                break;
            }
        }
        if (!$hasNewToken) {
            continue;
        }

        $components[] = $component;
        foreach ($tokens as $token) {
            $seenTokens[$token] = true;
        }
    }

    return implode(', ', $components);
}

function stringify_address_piece($value): string
{
    if ($value === null) {
        return '';
    }
    if ($value instanceof \Stringable) {
        $value = (string) $value;
    }
    if (is_bool($value)) {
        return $value ? 'Oui' : 'Non';
    }
    if (is_scalar($value)) {
        return trim((string) $value);
    }
    if ($value instanceof \stdClass) {
        $value = (array) $value;
    }
    if (is_array($value)) {
        $parts = [];
        foreach ($value as $part) {
            $stringified = stringify_address_piece($part);
            if ($stringified !== '') {
                $parts[] = $stringified;
            }
        }
        if (!$parts) {
            return '';
        }
        return implode(', ', $parts);
    }

    return trim((string) $value);
}

function normalize_address_component(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }
    $value = preg_replace('~[\s,;]+~u', ' ', $value) ?? $value;
    return normalize_utf8_lower($value);
}

/**
 * @return array<int, string>
 */
function extract_address_tokens(string $normalized): array
{
    if ($normalized === '') {
        return [];
    }

    preg_match_all('~[\p{L}\p{N}]+~u', $normalized, $matches);
    $tokens = [];
    foreach ($matches[0] ?? [] as $token) {
        if ($token === '') {
            continue;
        }
        $tokens[$token] = true;
    }

    return array_keys($tokens);
}

function resolve_template_variable_value(array $variable, array $contexts, array $adminProfile): string
{
    $groupId = strtolower((string) ($variable['groupId'] ?? ''));
    $baseKey = (string) ($variable['baseKey'] ?? ($variable['key'] ?? ''));
    if ($baseKey === '') {
        return '';
    }
    $rank = isset($variable['rank']) && is_numeric($variable['rank']) ? max(1, (int) $variable['rank']) : 1;
    $hasRankContext = array_key_exists($rank, $contexts);
    $rankContext = $hasRankContext ? $contexts[$rank] : null;
    $value = null;

    if ($groupId === 'admin') {
        $value = $adminProfile[$baseKey] ?? null;
    } elseif ($groupId === 'fused') {
        if (is_array($rankContext) && isset($rankContext['fusedData'])) {
            $value = extract_value_by_key($rankContext['fusedData'], $baseKey);
        }
        if ($value === null && $hasRankContext) {
            foreach ($contexts as $index => $context) {
                if ($index === $rank || !is_array($context) || !isset($context['fusedData'])) {
                    continue;
                }
                $value = extract_value_by_key($context['fusedData'], $baseKey);
                if ($value !== null) {
                    break;
                }
            }
        }
    } else {
        if (is_array($rankContext) && isset($rankContext['requestData'])) {
            $value = extract_value_by_key($rankContext['requestData'], $baseKey);
        }
    }

    if ($value === null && $groupId !== 'admin' && ($rank === 1 || $hasRankContext)) {
        if (isset($contexts[1]['requestData'])) {
            $value = extract_value_by_key($contexts[1]['requestData'], $baseKey);
        }
    }

    if ($value === null) {
        return '';
    }

    return stringify_variable_value($value, $baseKey);
}

try {
    switch ($action) {
        case 'listRequests':
            $result = $repo->listRequests();
            break;
        case 'listDocuments':
            $requestId = $_GET['request'] ?? '';
            $result = sanitize_documents($repo->listDocuments($requestId));
            break;
        case 'getDocument':
            $requestId = $_GET['request'] ?? '';
            $document = $_GET['document'] ?? '';
            $result = sanitize_document($repo->getDocumentMeta($requestId, $document));
            break;
        case 'getRequestData':
            $requestId = $_GET['request'] ?? '';
            $generalDirs = $requestConfigurator->getGeneralDirectories();
            $result = [
                'id' => $requestId,
                'displayName' => str_replace(['_', '-'], [' ', ' '], $requestId),
                'request' => load_request_payload($requestId, 'request.json'),
                'fused' => load_request_payload(
                    $requestId,
                    'FusedCustomersFile_request.json',
                    $generalDirs,
                    ['FusedCustomersFile_request.json', 'request.json']
                ),
            ];
            break;
        case 'listVariables':
            $definitionsPath = __DIR__ . '/data/variables/definitions.json';
            $adminProfilePath = __DIR__ . '/data/admin_profile.json';
            $result = [
                'definitions' => load_json_file($definitionsPath, ['groups' => []]),
                'adminProfile' => load_json_file($adminProfilePath, []),
                'questionClasses' => $questionRepo->listClasses(),
            ];
            break;
        case 'listQuestionClasses':
            $result = ['classes' => $questionRepo->listClasses()];
            break;
        case 'listTemplates':
            $result = ['templates' => $templateRepo->listTemplates()];
            break;
        case 'getTemplate':
            $templateId = sanitize_template_id_param((string)($_GET['template'] ?? ''));
            $result = ['template' => $templateRepo->getTemplate($templateId)];
            break;
        case 'saveTemplate':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $name = (string)($payload['name'] ?? '');
            $pdfData = (string)($payload['pdfData'] ?? '');
            if ($name === '' || $pdfData === '') {
                throw new \RuntimeException('Nom et document requis.');
            }
            $templateId = isset($payload['templateId']) && $payload['templateId'] !== ''
                ? sanitize_template_id_param((string)$payload['templateId'])
                : null;
            $maxClients = $payload['maxClients'] ?? 1;
            $variableMappings = isset($payload['variableMappings']) && is_array($payload['variableMappings'])
                ? $payload['variableMappings']
                : [];
            $elements = isset($payload['elements']) && is_array($payload['elements'])
                ? $payload['elements']
                : [];
            $questionSettings = isset($payload['questionSettings']) && is_array($payload['questionSettings'])
                ? $payload['questionSettings']
                : [];
            $result = ['template' => $templateRepo->saveTemplate($name, $pdfData, $templateId, [
                'maxClients' => $maxClients,
                'variableMappings' => $variableMappings,
                'elements' => $elements,
                'questionSettings' => $questionSettings,
            ])];
            break;
        case 'deleteTemplate':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $rawTemplateId = (string)($payload['templateId'] ?? ($payload['id'] ?? ''));
            if ($rawTemplateId === '') {
                throw new \RuntimeException('Identifiant de modèle requis.');
            }
            $templateId = sanitize_template_id_param($rawTemplateId);
            $templateRepo->deleteTemplate($templateId);
            $result = ['success' => true];
            break;
        case 'saveQuestionClass':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $classPayload = isset($payload['class']) && is_array($payload['class']) ? $payload['class'] : $payload;
            $savedClass = $questionRepo->saveClass($classPayload);
            $result = ['class' => $savedClass];
            break;
        case 'deleteQuestionClass':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $classIdRaw = (string)($payload['classId'] ?? ($payload['id'] ?? ''));
            if ($classIdRaw === '') {
                throw new \RuntimeException('Identifiant de classe requis.');
            }
            $classId = sanitize_question_class_id($classIdRaw);
            $questionRepo->deleteClass($classId);
            $result = ['success' => true];
            break;
        case 'listSavedResponseLibraries':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $result = ['libraries' => $savedResponseRepo->listLibraries()];
            break;
        case 'saveSavedResponseEntry':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $libraryKey = isset($payload['libraryKey']) ? trim((string) $payload['libraryKey']) : '';
            if ($libraryKey === '') {
                throw new \RuntimeException('Identifiant de bibliothèque requis.');
            }
            $entryPayload = isset($payload['entry']) && is_array($payload['entry']) ? $payload['entry'] : [];
            $savedEntry = $savedResponseRepo->appendEntry($libraryKey, $entryPayload);
            $result = ['entry' => $savedEntry];
            break;
        case 'generateTemplateDocument':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $templateId = sanitize_template_id_param((string)($payload['templateId'] ?? ''));
            $clientsRaw = $payload['clients'] ?? [];
            if (!is_array($clientsRaw) || !count($clientsRaw)) {
                throw new \RuntimeException('Au moins un client doit être sélectionné.');
            }
            $clientIds = [];
            foreach ($clientsRaw as $clientId) {
                $clientIds[] = sanitize_request_id_param((string) $clientId);
            }
            $template = $templateRepo->getTemplate($templateId);

            $verificationChanges = [];
            if (array_key_exists('verificationUpdates', $payload)) {
                if (!is_array($payload['verificationUpdates'])) {
                    throw new \RuntimeException('Mises à jour de vérification invalides.');
                }
                foreach ($payload['verificationUpdates'] as $updateEntry) {
                    if (!is_array($updateEntry)) {
                        continue;
                    }
                    $rawRequestId = $updateEntry['requestId'] ?? $updateEntry['id'] ?? null;
                    if (!is_string($rawRequestId) || trim($rawRequestId) === '') {
                        continue;
                    }
                    $clientId = sanitize_request_id_param($rawRequestId);
                    if (!in_array($clientId, $clientIds, true)) {
                        continue;
                    }
                    $valuesRaw = $updateEntry['values'] ?? [];
                    if (!is_array($valuesRaw)) {
                        continue;
                    }
                    $cleanValues = [];
                    foreach ($valuesRaw as $valueKey => $valueRaw) {
                        if (!is_string($valueKey) || trim($valueKey) === '') {
                            continue;
                        }
                        if (!is_scalar($valueRaw)) {
                            continue;
                        }
                        $cleanValues[trim($valueKey)] = trim((string) $valueRaw);
                    }
                    if ($cleanValues === []) {
                        continue;
                    }
                    try {
                        $changes = $requestConfigurator->applyCommonUpdates($clientId, $cleanValues);
                    } catch (\Throwable $updateError) {
                        throw new \RuntimeException($updateError->getMessage());
                    }
                    if ($changes) {
                        $verificationChanges[$clientId] = $changes;
                    }
                }
            }

            $commonQuestionEntries = [];
            $assignments = isset($template['questionSettings']['classes']) && is_array($template['questionSettings']['classes'])
                ? $template['questionSettings']['classes']
                : [];
            $classCatalog = [];
            foreach ($questionRepo->listClasses() as $classData) {
                if (!is_array($classData)) {
                    continue;
                }
                $classId = isset($classData['id']) ? trim((string) $classData['id']) : '';
                if ($classId === '') {
                    continue;
                }
                $classCatalog[$classId] = $classData;
            }

            if ($assignments) {
                foreach ($assignments as $assignment) {
                    if (!is_array($assignment)) {
                        continue;
                    }
                    $classId = isset($assignment['id']) ? trim((string) $assignment['id']) : '';
                    if ($classId === '' || !isset($classCatalog[$classId])) {
                        continue;
                    }
                    $classData = $classCatalog[$classId];
                    $assignmentRequired = filter_var($assignment['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    foreach ($classData['questions'] ?? [] as $question) {
                        if (!is_array($question)) {
                            continue;
                        }
                        $questionId = isset($question['id']) ? trim((string) $question['id']) : '';
                        if ($questionId === '') {
                            continue;
                        }
                        $targetGroup = question_targets_common_group($classData, $assignment, $question);
                        if ($targetGroup !== 'fused') {
                            continue;
                        }
                        $questionRequired = $assignmentRequired || filter_var($question['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
                        $targetKey = resolve_question_target_key($classData, $assignment, $question);
                        $commonQuestionEntries[$questionId] = [
                            'classId' => $classId,
                            'question' => $question,
                            'required' => $questionRequired,
                            'targetGroup' => $targetGroup,
                            'targetKey' => $targetKey,
                        ];
                    }
                }
            }

            if ($commonQuestionEntries) {
                $answersRaw = $payload['commonAnswers'] ?? [];
                if ($answersRaw === null) {
                    $answersRaw = [];
                }
                if (!is_array($answersRaw)) {
                    throw new \RuntimeException('Réponses aux questions communes invalides.');
                }

                $answersByQuestion = [];
                foreach ($answersRaw as $answerRaw) {
                    if (!is_array($answerRaw)) {
                        continue;
                    }
                    $questionId = isset($answerRaw['questionId']) ? trim((string) $answerRaw['questionId']) : '';
                    if ($questionId === '' || !isset($commonQuestionEntries[$questionId])) {
                        continue;
                    }
                    $optionIds = [];
                    if (isset($answerRaw['optionIds']) && is_array($answerRaw['optionIds'])) {
                        foreach ($answerRaw['optionIds'] as $optionIdRaw) {
                            $optionId = trim((string) $optionIdRaw);
                            if ($optionId !== '') {
                                $optionIds[] = $optionId;
                            }
                        }
                    }
                    $value = $answerRaw['value'] ?? null;
                    if (is_string($value) || is_numeric($value)) {
                        $value = trim((string) $value);
                    } elseif (!is_array($value)) {
                        $value = null;
                    }
                    $answersByQuestion[$questionId] = [
                        'optionIds' => $optionIds,
                        'value' => $value,
                    ];
                }

                $fusedUpdates = [];
                foreach ($commonQuestionEntries as $questionId => $entry) {
                    $question = $entry['question'];
                    $label = trim((string) ($question['label'] ?? ''));
                    $answer = $answersByQuestion[$questionId] ?? null;
                    if ($answer === null) {
                        if ($entry['required']) {
                            if ($label === '') {
                                $label = $questionId;
                            }
                            throw new \RuntimeException(sprintf('Répondez à la question commune « %s ».', $label));
                        }
                        continue;
                    }

                    $computed = compute_common_answer_value($question, $answer);
                    if ($entry['required'] && !$computed['hasValue']) {
                        if ($label === '') {
                            $label = $questionId;
                        }
                        throw new \RuntimeException(sprintf('Répondez à la question commune « %s ».', $label));
                    }

                    if (!$computed['hasValue']) {
                        continue;
                    }

                    if ($entry['targetGroup'] === 'fused') {
                        $targetKey = trim((string) $entry['targetKey']);
                        if ($targetKey === '') {
                            if ($label === '') {
                                $label = $questionId;
                            }
                            throw new \RuntimeException(sprintf('Impossible de déterminer la destination pour la question commune « %s ».', $label));
                        }
                        $fusedUpdates[$targetKey] = $computed['value'];
                    }
                }

                if ($fusedUpdates) {
                    foreach ($clientIds as $clientId) {
                        $requestConfigurator->updateFusedValues($clientId, $fusedUpdates);
                    }
                }
            }

            $conflictDecisionsRaw = $payload['conflictDecisions'] ?? [];
            if ($conflictDecisionsRaw === null) {
                $conflictDecisionsRaw = [];
            }
            if (!is_array($conflictDecisionsRaw)) {
                throw new \RuntimeException('Résolutions de conflit invalides.');
            }

            if ($conflictDecisionsRaw) {
                foreach ($conflictDecisionsRaw as $decisionRaw) {
                    if (!is_array($decisionRaw)) {
                        continue;
                    }
                    $fieldKey = trim((string) ($decisionRaw['fieldKey'] ?? ''));
                    $value = isset($decisionRaw['value']) ? trim((string) $decisionRaw['value']) : '';
                    if ($fieldKey === '' || $value === '') {
                        continue;
                    }
                    $chosenClientId = sanitize_request_id_param((string) ($decisionRaw['chosenClientId'] ?? ''));
                    if ($chosenClientId === '' || !in_array($chosenClientId, $clientIds, true)) {
                        continue;
                    }
                    $recordNote = filter_var($decisionRaw['recordNote'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    $fieldLabel = trim((string) ($decisionRaw['fieldLabel'] ?? ''));
                    $chosenClientName = trim((string) ($decisionRaw['chosenClientName'] ?? ''));
                    $templateId = isset($decisionRaw['templateId']) ? (string) $decisionRaw['templateId'] : (string) ($template['id'] ?? '');
                    $templateName = isset($decisionRaw['templateName']) ? (string) $decisionRaw['templateName'] : (string) ($template['name'] ?? '');

                    $affectedRaw = isset($decisionRaw['affectedClients']) && is_array($decisionRaw['affectedClients'])
                        ? $decisionRaw['affectedClients']
                        : [];
                    $targets = [];
                    foreach ($affectedRaw as $affectedEntry) {
                        if (!is_array($affectedEntry)) {
                            continue;
                        }
                        $targetId = sanitize_request_id_param((string) ($affectedEntry['clientId'] ?? ''));
                        if ($targetId === '' || !in_array($targetId, $clientIds, true)) {
                            continue;
                        }
                        $targets[] = [
                            'clientId' => $targetId,
                            'clientName' => trim((string) ($affectedEntry['clientName'] ?? '')),
                        ];
                    }
                    if ($targets === []) {
                        continue;
                    }

                    foreach ($targets as $target) {
                        $changes = $requestConfigurator->applyCommonUpdates($target['clientId'], [$fieldKey => $value]);
                        if ($recordNote && $changes) {
                            $entries = [];
                            foreach ($changes as $change) {
                                $entries[] = [
                                    'field' => $change['key'],
                                    'label' => $fieldLabel !== '' ? $fieldLabel : $change['key'],
                                    'previous' => $change['previous'],
                                    'value' => $change['value'],
                                    'sourceClientId' => $chosenClientId,
                                    'sourceClientName' => $chosenClientName,
                                    'targetClientName' => $target['clientName'],
                                    'templateId' => $templateId,
                                    'templateName' => $templateName,
                                ];
                            }
                            if ($entries) {
                                $requestConfigurator->recordChangeNotes($target['clientId'], $entries);
                            }
                        }
                    }
                }
            }

            $template = $requestConfigurator->prepareForGeneration($template, $clientIds);
            $templateMaxClients = (int) ($template['maxClients'] ?? 1);
            if ($templateMaxClients < 1) {
                $templateMaxClients = 1;
            }
            if (count($clientIds) > $templateMaxClients) {
                throw new \RuntimeException('Le modèle ne peut pas traiter autant de clients.');
            }

            $destinationPayload = is_array($payload['destination'] ?? null) ? $payload['destination'] : [];
            $destinationMode = strtolower(trim((string)($destinationPayload['mode'] ?? '')));
            if ($destinationMode !== 'client' && $destinationMode !== 'existing') {
                throw new \RuntimeException('Mode de destination invalide.');
            }
            $destinationRequestId = sanitize_request_id_param((string)($destinationPayload['requestId'] ?? ''));
            if (!in_array($destinationRequestId, $clientIds, true)) {
                throw new \RuntimeException('Le client de destination doit faire partie de la sélection.');
            }
            $existingPath = null;
            if ($destinationMode === 'existing') {
                $existingPath = sanitize_relative_folder((string)($destinationPayload['existingPath'] ?? ''));
                if ($existingPath === '') {
                    throw new \RuntimeException('Dossier de destination invalide.');
                }
            }

            $contexts = [];
            $generalDirs = $requestConfigurator->getGeneralDirectories();
            foreach ($clientIds as $index => $clientId) {
                $rank = $index + 1;
                $contexts[$rank] = [
                    'requestId' => $clientId,
                    'requestData' => load_request_payload($clientId, 'request.json'),
                    'fusedData' => load_request_payload(
                        $clientId,
                        'FusedCustomersFile_request.json',
                        $generalDirs,
                        ['FusedCustomersFile_request.json', 'request.json']
                    ),
                ];
            }
            $adminProfile = load_json_file(__DIR__ . '/data/admin_profile.json', []);

            $renderElements = [];
            foreach ($template['elements'] ?? [] as $element) {
                if (!is_array($element)) {
                    continue;
                }
                $elementCopy = $element;
                if (($elementCopy['type'] ?? 'text') === 'text' && isset($elementCopy['data']['variable']) && is_array($elementCopy['data']['variable'])) {
                    $value = resolve_template_variable_value($elementCopy['data']['variable'], $contexts, $adminProfile);
                    $elementCopy['text'] = $value;
                }
                $renderElements[] = $elementCopy;
            }

            $autoAssignments = $assignments;
            $assignedIds = [];
            foreach ($assignments as $assignment) {
                if (!is_array($assignment)) {
                    continue;
                }
                $assignedId = isset($assignment['id']) ? trim((string) $assignment['id']) : '';
                if ($assignedId !== '') {
                    $assignedIds[$assignedId] = true;
                }
            }
            $templateDocumentId = trim((string) ($template['id'] ?? $templateId));
            foreach ($classCatalog as $classId => $classData) {
                if (isset($assignedIds[$classId])) {
                    continue;
                }
                $classDocumentId = trim((string) ($classData['documentId'] ?? ''));
                if ($classDocumentId === '' || $classDocumentId !== $templateDocumentId) {
                    continue;
                }
                $autoAssignments[] = ['id' => $classId, 'required' => false, 'source' => 'document'];
            }

            $autoElements = build_auto_selection_elements($autoAssignments, $classCatalog, $contexts, $template);
            if ($autoElements) {
                $renderElements = array_merge($renderElements, $autoElements);
            }

            $sourceRelative = $template['relativePath'] ?? '';
            if ($sourceRelative === '') {
                throw new \RuntimeException('Document source du modèle introuvable.');
            }
            $sourcePath = realpath(__DIR__ . '/' . $sourceRelative);
            if ($sourcePath === false) {
                throw new \RuntimeException('Document source du modèle introuvable.');
            }

            $projectRoot = dirname(__DIR__);
            $renderer = new PdfEditorRenderer($projectRoot);
            $temporaryName = $template['fileName'] ?? $template['name'] ?? 'document.pdf';
            $temporaryPath = $renderer->render($sourcePath, $renderElements, $temporaryName);

            $targetDirectoryBase = resolve_request_directory($destinationRequestId);
            if ($targetDirectoryBase === null) {
                throw new \RuntimeException('Dossier client introuvable.');
            }
            if ($destinationMode === 'existing') {
                $candidate = $targetDirectoryBase . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $existingPath);
                $real = realpath($candidate);
                if ($real === false || !is_dir($real)) {
                    @unlink($temporaryPath);
                    throw new \RuntimeException('Dossier de destination introuvable.');
                }
                ensure_path_within_base($targetDirectoryBase, $real);
                $destinationDir = $real;
            } else {
                $folderNameRaw = (string)($destinationPayload['folderName'] ?? '');
                $folderName = sanitize_folder_name($folderNameRaw);
                if ($folderName === '') {
                    $folderName = 'Documents générés';
                }
                $candidate = $targetDirectoryBase . DIRECTORY_SEPARATOR . $folderName;
                if (!is_dir($candidate) && !mkdir($candidate, 0775, true) && !is_dir($candidate)) {
                    @unlink($temporaryPath);
                    throw new \RuntimeException(sprintf('Impossible de préparer le dossier « %s ».', $folderName));
                }
                $destinationDir = realpath($candidate) ?: $candidate;
                ensure_path_within_base($targetDirectoryBase, $destinationDir);
            }

            $targetPath = build_target_file_path($destinationDir, $temporaryName, $destinationRequestId);
            if (!@rename($temporaryPath, $targetPath)) {
                if (!@copy($temporaryPath, $targetPath)) {
                    @unlink($temporaryPath);
                    throw new \RuntimeException('Impossible de déplacer le document généré.');
                }
                @unlink($temporaryPath);
            }

            $requestsRoot = realpath(__DIR__ . '/data/requests');
            $relativePath = null;
            $realTarget = realpath($targetPath);
            if ($requestsRoot && $realTarget !== false && strpos($realTarget, $requestsRoot) === 0) {
                $relativePath = 'data/requests/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($realTarget, strlen($requestsRoot) + 1));
            }

            if ($verificationChanges) {
                try {
                    $historyEntries = [];
                    foreach ($verificationChanges as $clientId => $changes) {
                        $historyEntries[] = [
                            'requestId' => $clientId,
                            'displayName' => str_replace(['_', '-'], [' ', ' '], $clientId),
                            'changes' => array_map(static function (array $change): array {
                                return [
                                    'key' => $change['key'] ?? '',
                                    'previous' => $change['previous'] ?? '',
                                    'value' => $change['value'] ?? '',
                                ];
                            }, $changes),
                        ];
                    }
                    if ($historyEntries) {
                        $timestamp = date('Ymd_His');
                        $historyName = sprintf('Historique_mise_a_jour_PDF_%s.json', $timestamp);
                        $historyPath = $destinationDir . DIRECTORY_SEPARATOR . $historyName;
                        $suffix = 2;
                        while (file_exists($historyPath)) {
                            $historyName = sprintf('Historique_mise_a_jour_PDF_%s_%d.json', $timestamp, $suffix++);
                            $historyPath = $destinationDir . DIRECTORY_SEPARATOR . $historyName;
                        }
                        $historyPayload = [
                            'generatedAt' => date('c'),
                            'template' => [
                                'id' => $template['id'] ?? $templateId,
                                'name' => $template['name'] ?? '',
                            ],
                            'document' => [
                                'fileName' => basename($targetPath),
                                'relativePath' => $relativePath,
                            ],
                            'updates' => $historyEntries,
                        ];
                        persist_json_file($historyPath, $historyPayload);
                    }
                } catch (\Throwable $historyError) {
                    error_log(sprintf('Impossible de créer l’historique de mise à jour pour "%s": %s', $destinationRequestId, $historyError->getMessage()));
                }
            }

            $result = [
                'document' => [
                    'requestId' => $destinationRequestId,
                    'fileName' => basename($targetPath),
                    'relativePath' => $relativePath,
                ],
            ];
            break;
        case 'saveAdminProfile':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $adminProfilePath = __DIR__ . '/data/admin_profile.json';
            $profile = load_json_file($adminProfilePath, []);
            $profile = array_merge($profile, $payload);
            persist_json_file($adminProfilePath, $profile);
            $result = ['success' => true, 'profile' => $profile];
            break;
        case 'addVariableDefinition':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $rawGroupId = trim((string)($payload['groupId'] ?? ''));
            $groupId = normalize_variable_group_id($rawGroupId);
            $key = trim((string)($payload['key'] ?? ''));
            $label = trim((string)($payload['label'] ?? ''));
            $defaultValue = $payload['defaultValue'] ?? null;
            if ($groupId === '' || $key === '' || $label === '') {
                throw new \RuntimeException('Paramètres manquants pour la variable.');
            }
            if (!preg_match('~^[A-Za-z0-9_.\-]+$~', $key)) {
                throw new \RuntimeException('La clé fournie est invalide.');
            }

            $definitionsPath = __DIR__ . '/data/variables/definitions.json';
            $definitions = load_json_file($definitionsPath, ['groups' => []]);
            $groups = $definitions['groups'] ?? [];
            $keyLower = normalize_utf8_lower($key);
            $labelLower = normalize_utf8_lower($label);
            foreach ($groups as $group) {
                foreach (($group['fields'] ?? []) as $existingField) {
                    $existingKey = normalize_utf8_lower((string)($existingField['key'] ?? ''));
                    if ($existingKey === $keyLower) {
                        throw new \RuntimeException('Cette valeur en codage existe déjà dans le système pour un autre élément, veuillez svp changer de Désignation / phrase complète visible.');
                    }
                    $existingLabel = normalize_utf8_lower(trim((string)($existingField['label'] ?? '')));
                    if ($existingLabel !== '' && $existingLabel === $labelLower) {
                        throw new \RuntimeException('Désignation / phrase complète visible existe déjà dans le système pour un autre élément, veuillez svp changer de Désignation / phrase complète visible.');
                    }
                }
            }

            $groupIndex = null;
            foreach ($groups as $index => $group) {
                if (($group['id'] ?? '') === $groupId) {
                    $groupIndex = $index;
                    break;
                }
            }
            $groupLabel = trim((string)($payload['groupLabel'] ?? ''));
            if ($groupLabel === '') {
                $groupLabel = default_variable_group_label($groupId);
            }
            $groupSource = variable_group_source($groupId);
            if ($groupIndex === null) {
                $groups[] = [
                    'id' => $groupId,
                    'label' => $groupLabel,
                    'source' => $groupSource,
                    'fields' => [],
                ];
                $groupIndex = array_key_last($groups);
            } else {
                if ($groupLabel !== '') {
                    $groups[$groupIndex]['label'] = $groupLabel;
                }
                if (!isset($groups[$groupIndex]['source'])) {
                    $groups[$groupIndex]['source'] = $groupSource;
                }
            }

            $fields = $groups[$groupIndex]['fields'] ?? [];

            $fieldData = [
                'key' => $key,
                'label' => $label,
            ];
            if ($defaultValue !== null && $defaultValue !== '') {
                $fieldData['defaultValue'] = $defaultValue;
            }

            $fields[] = $fieldData;

            $groups[$groupIndex]['fields'] = array_values($fields);
            $definitions['groups'] = $groups;
            persist_json_file($definitionsPath, $definitions);

            $result = ['definitions' => $definitions];

            if ($groupId === 'admin') {
                $adminProfilePath = __DIR__ . '/data/admin_profile.json';
                $profile = load_json_file($adminProfilePath, []);
                $shouldUpdateValue = ($defaultValue !== null && $defaultValue !== '');
                if (!array_key_exists($key, $profile) || $shouldUpdateValue) {
                    $profile[$key] = $shouldUpdateValue ? $defaultValue : ($profile[$key] ?? '');
                }
                if (!array_key_exists($key, $profile)) {
                    $profile[$key] = '';
                }
                persist_json_file($adminProfilePath, $profile);
                $result['profile'] = $profile;
            }
            break;
        case 'listSigningDestinations':
            $raw = (string)($_GET['requests'] ?? '');
            $identifiers = array_values(array_filter(array_map('trim', explode(',', $raw)), static fn($item) => $item !== ''));
            $destinations = [];
            foreach ($identifiers as $id) {
                try {
                    $safeId = sanitize_request_id_param($id);
                } catch (\RuntimeException $e) {
                    continue;
                }
                $destinations[] = [
                    'requestId' => $safeId,
                    'displayName' => str_replace(['_', '-'], [' ', ' '], $safeId),
                    'existing' => list_signing_directories_for_request($safeId),
                ];
            }
            $result = ['requests' => $destinations];
            break;
        case 'saveDocuments':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $targetMode = trim((string)($payload['targetMode'] ?? ''));
            $targetRequestId = sanitize_request_id_param((string)($payload['targetRequestId'] ?? ''));
            $documentsPayload = $payload['documents'] ?? [];
            if (!is_array($documentsPayload) || !$documentsPayload) {
                throw new \RuntimeException('Aucun document à sauvegarder.');
            }

            $targetDirectory = resolve_request_directory($targetRequestId);
            if ($targetDirectory === null) {
                throw new \RuntimeException('Dossier client introuvable.');
            }

            if ($targetMode === 'existing') {
                $existingPath = sanitize_relative_folder((string)($payload['existingPath'] ?? ''));
                if ($existingPath === '') {
                    throw new \RuntimeException('Dossier de destination invalide.');
                }
                $candidate = $targetDirectory . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $existingPath);
                $real = realpath($candidate);
                if ($real === false || !is_dir($real)) {
                    throw new \RuntimeException('Dossier de destination introuvable.');
                }
                ensure_path_within_base($targetDirectory, $real);
                $destinationDir = $real;
            } elseif ($targetMode === 'client') {
                $folderNameRaw = (string)($payload['folderName'] ?? '');
                $folderName = sanitize_folder_name($folderNameRaw);
                if ($folderName === '') {
                    $folderName = 'Documents générés';
                }
                $candidate = $targetDirectory . DIRECTORY_SEPARATOR . $folderName;
                if (!is_dir($candidate) && !mkdir($candidate, 0775, true) && !is_dir($candidate)) {
                    throw new \RuntimeException(sprintf('Impossible de créer le dossier « %s ».', $folderName));
                }
                $destinationDir = realpath($candidate) ?: $candidate;
                ensure_path_within_base($targetDirectory, $destinationDir);
            } else {
                throw new \RuntimeException('Mode de sauvegarde invalide.');
            }

            $projectRoot = dirname(__DIR__);
            $renderer = null;
            $requestsRoot = realpath(__DIR__ . '/data/requests');
            $saved = [];
            foreach ($documentsPayload as $document) {
                if (!is_array($document)) {
                    continue;
                }
                $sourceRequestId = sanitize_request_id_param((string)($document['requestId'] ?? ''));
                $documentName = sanitize_document_name_param((string)($document['document'] ?? ''));
                $elements = is_array($document['elements'] ?? null) ? $document['elements'] : [];
                $fileName = isset($document['fileName']) ? (string)$document['fileName'] : $documentName;
                $targetPath = build_target_file_path($destinationDir, $fileName, $sourceRequestId);
                $pdfData = isset($document['pdfData']) && is_string($document['pdfData']) ? $document['pdfData'] : '';
                $writtenFromClient = false;
                if ($pdfData !== '') {
                    $decoded = base64_decode($pdfData, true);
                    if ($decoded !== false) {
                        $normalizedPdf = PdfCompat::normalizeBuffer($decoded);
                        if (file_put_contents($targetPath, $normalizedPdf) === false) {
                            throw new \RuntimeException('Impossible d\'écrire le fichier généré.');
                        }
                        $writtenFromClient = true;
                    }
                }

                if (!$writtenFromClient) {
                    if ($renderer === null) {
                        $renderer = new PdfEditorRenderer($projectRoot);
                    }
                    $meta = $repo->getDocumentMeta($sourceRequestId, $documentName);
                    $temporaryName = 'tmp_' . bin2hex(random_bytes(6)) . '.pdf';
                    $temporaryPath = $renderer->render($meta['absolutePath'], $elements, $temporaryName);
                    if (!@rename($temporaryPath, $targetPath)) {
                        if (!@copy($temporaryPath, $targetPath)) {
                            @unlink($temporaryPath);
                            throw new \RuntimeException('Impossible de déplacer le fichier généré.');
                        }
                        @unlink($temporaryPath);
                    }
                }
                $relativePath = null;
                $realTarget = realpath($targetPath);
                if ($requestsRoot && $realTarget !== false && strpos($realTarget, $requestsRoot) === 0) {
                    $relativePath = 'data/requests/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($realTarget, strlen($requestsRoot) + 1));
                }
                $saved[] = [
                    'requestId' => $targetRequestId,
                    'fileName' => basename($targetPath),
                    'relativePath' => $relativePath,
                ];
            }

            $result = ['saved' => $saved];
            break;
        case 'setVariablePinned':
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
                exit;
            }
            $payload = json_decode(file_get_contents('php://input') ?: '', true);
            if (!is_array($payload)) {
                throw new \RuntimeException('Payload invalide.');
            }
            $groupId = trim((string)($payload['groupId'] ?? ''));
            $key = trim((string)($payload['key'] ?? ''));
            $pinned = filter_var($payload['pinned'] ?? true, FILTER_VALIDATE_BOOLEAN);
            if ($groupId === '' || $key === '') {
                throw new \RuntimeException('Paramètres manquants.');
            }
            $definitionsPath = __DIR__ . '/data/variables/definitions.json';
            $definitions = load_json_file($definitionsPath, ['groups' => []]);
            $updated = false;
            foreach ($definitions['groups'] as &$group) {
                if (($group['id'] ?? '') !== $groupId) {
                    continue;
                }
                if (!isset($group['fields']) || !is_array($group['fields'])) {
                    $group['fields'] = [];
                }
                foreach ($group['fields'] as &$field) {
                    if (($field['key'] ?? '') === $key) {
                        if ($pinned) {
                            unset($field['pinned']);
                        } else {
                            $field['pinned'] = false;
                        }
                        $updated = true;
                        break 2;
                    }
                }
                unset($field);
            }
            unset($group, $field);
            if (!$updated) {
                throw new \RuntimeException('Variable introuvable.');
            }
            persist_json_file($definitionsPath, $definitions);
            $result = ['definitions' => $definitions];
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Action inconnue']);
            exit;
    }

    echo json_encode(['data' => $result]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Une erreur est survenue',
        'details' => $e->getMessage(),
    ]);
}