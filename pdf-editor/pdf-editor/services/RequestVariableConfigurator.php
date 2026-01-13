<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

final class RequestVariableConfigurator
{
    private string $requestsDir;

    /**
     * @var array<int, string>
     */
    private array $generalDirectories;

    private string $definitionsPath;

    /**
     * @var array<string, string>
     */
    private array $variableIndex;

    /**
     * @param array<int, string>|null $generalDirectories
     */
    public function __construct(string $requestsDir, ?string $definitionsPath = null, ?array $generalDirectories = null)
    {
        $this->requestsDir = rtrim($requestsDir, DIRECTORY_SEPARATOR);
        $this->definitionsPath = $definitionsPath ?? dirname($this->requestsDir) . DIRECTORY_SEPARATOR . 'variables' . DIRECTORY_SEPARATOR . 'definitions.json';
        $this->generalDirectories = $generalDirectories ?? [
            'Dossier général',
            'Dossier general',
            'Dossier Général',
            'Dossier General',
            'dossier général',
            'dossier general',
            'Dossier_general',
            'DossierGeneral',
        ];
        $this->variableIndex = $this->loadVariableIndex();
    }

    /**
     * @return array<int, string>
     */
    public function getGeneralDirectories(): array
    {
        return $this->generalDirectories;
    }

    /**
     * @param array<string, mixed> $template
     * @param array<int, string>   $clientIds
     *
     * @return array<string, mixed>
     */
    public function prepareForGeneration(array $template, array $clientIds): array
    {
        $normalizedTemplate = $this->normalizeTemplateVariables($template);
        $requirements = $this->collectRequirements($normalizedTemplate);

        foreach ($clientIds as $clientId) {
            $requestDir = $this->resolveRequestDirectory($clientId);
            if ($requestDir === null) {
                continue;
            }
            $requestPath = $requestDir . DIRECTORY_SEPARATOR . 'request.json';
            $requestData = $this->loadJsonFile($requestPath, []);

            $augmented = $this->augmentRequestData($clientId, $requestData, $requirements['request'] ?? []);
            if ($augmented !== null) {
                $this->persistJsonFile($requestPath, $augmented);
                $requestData = $augmented;
            }

            $expanded = $this->expandAllVariables($requestData);
            if ($expanded !== $requestData) {
                $this->persistJsonFile($requestPath, $expanded);
                $requestData = $expanded;
            }

            if (!empty($requirements['fused'])) {
                $this->ensureFusedFile($clientId, $requestDir, $requestData, $requirements['fused']);
            }
        }

        return $normalizedTemplate;
    }

    /**
     * @param array<string, mixed> $values
     */
    public function updateFusedValues(string $requestId, array $values): void
    {
        $directory = $this->resolveRequestDirectory($requestId);
        if ($directory === null) {
            throw new \RuntimeException(sprintf('Dossier client "%s" introuvable.', $requestId));
        }
        $target = $this->resolveFusedTarget($directory);
        $current = is_file($target['path']) ? $this->loadJsonFile($target['path'], []) : [];
        $updated = $current;
        $hasChanges = false;
        foreach ($values as $key => $value) {
            if (!is_string($key) || $key === '') {
                continue;
            }
            if (!array_key_exists($key, $updated) || $updated[$key] !== $value) {
                $updated[$key] = $value;
                $hasChanges = true;
            }
        }
        if (!$hasChanges) {
            return;
        }
        if (!is_dir($target['directory']) && !mkdir($target['directory'], 0775, true) && !is_dir($target['directory'])) {
            throw new \RuntimeException(sprintf('Impossible de préparer le dossier général pour "%s".', $requestId));
        }
        $this->persistJsonFile($target['path'], $updated);
    }

    /**
     * @param array<string, mixed> $values
     *
     * @return array<int, array{key: string, previous: string, value: string}>
     */
    public function applyCommonUpdates(string $requestId, array $values): array
    {
        $directory = $this->resolveRequestDirectory($requestId);
        if ($directory === null) {
            throw new \RuntimeException(sprintf('Dossier client "%s" introuvable.', $requestId));
        }

        $target = $this->resolveFusedTarget($directory);
        $fusedData = is_file($target['path']) ? $this->loadJsonFile($target['path'], []) : [];
        $changes = [];

        foreach ($values as $key => $rawValue) {
            if (!is_string($key) || trim($key) === '') {
                continue;
            }
            $normalizedKey = $this->normalizeKey($key);
            $targetKey = null;
            foreach ($fusedData as $existingKey => $_value) {
                if (is_string($existingKey) && $this->normalizeKey($existingKey) === $normalizedKey) {
                    $targetKey = $existingKey;
                    break;
                }
            }
            if ($targetKey === null) {
                $targetKey = trim($key);
            }
            $value = $this->stringifyValue($rawValue);
            $value = trim($value);
            if ($value === '') {
                continue;
            }
            $previous = array_key_exists($targetKey, $fusedData)
                ? $this->stringifyValue($fusedData[$targetKey])
                : '';
            if ($previous === $value) {
                continue;
            }
            $fusedData[$targetKey] = $value;
            $changes[] = [
                'key' => $targetKey,
                'previous' => $previous,
                'value' => $value,
            ];
        }

        if (!$changes) {
            return [];
        }

        if (!is_dir($target['directory']) && !mkdir($target['directory'], 0775, true) && !is_dir($target['directory'])) {
            throw new \RuntimeException(sprintf('Impossible de préparer le dossier général pour "%s".', $requestId));
        }
        $this->persistJsonFile($target['path'], $fusedData);

        $requestPath = $directory . DIRECTORY_SEPARATOR . 'request.json';
        $requestData = $this->loadJsonFile($requestPath, []);
        $variables = isset($requestData['variables']) && is_array($requestData['variables'])
            ? $requestData['variables']
            : [];
        $requestChanged = false;
        foreach ($changes as $change) {
            $key = $change['key'];
            $value = $change['value'];
            if (!array_key_exists($key, $requestData) || $requestData[$key] !== $value) {
                $requestData[$key] = $value;
                $requestChanged = true;
            }
            if (!array_key_exists($key, $variables) || $variables[$key] !== $value) {
                $variables[$key] = $value;
                $requestChanged = true;
            }
        }
        if ($requestChanged) {
            $requestData['variables'] = $variables;
            $this->persistJsonFile($requestPath, $requestData);
        }

        return $changes;
    }

    /**
     * @param array<int, array<string, mixed>> $entries
     */
    public function recordChangeNotes(string $requestId, array $entries): void
    {
        if ($entries === []) {
            return;
        }

        $filtered = [];
        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $field = isset($entry['field']) ? trim((string) $entry['field']) : '';
            $label = isset($entry['label']) ? trim((string) $entry['label']) : '';
            $previous = isset($entry['previous']) ? (string) $entry['previous'] : '';
            $value = isset($entry['value']) ? (string) $entry['value'] : '';
            if ($field === '' || $value === '') {
                continue;
            }
            $filtered[] = [
                'field' => $field,
                'label' => $label,
                'previous' => $previous,
                'value' => $value,
                'sourceClientId' => isset($entry['sourceClientId']) ? (string) $entry['sourceClientId'] : '',
                'sourceClientName' => isset($entry['sourceClientName']) ? (string) $entry['sourceClientName'] : '',
                'targetClientName' => isset($entry['targetClientName']) ? (string) $entry['targetClientName'] : '',
                'templateId' => isset($entry['templateId']) ? (string) $entry['templateId'] : '',
                'templateName' => isset($entry['templateName']) ? (string) $entry['templateName'] : '',
                'note' => isset($entry['note']) ? (string) $entry['note'] : '',
            ];
        }

        if ($filtered === []) {
            return;
        }

        $directory = $this->resolveRequestDirectory($requestId);
        if ($directory === null) {
            throw new \RuntimeException(sprintf('Dossier client "%s" introuvable.', $requestId));
        }

        $requestPath = $directory . DIRECTORY_SEPARATOR . 'request.json';
        $requestData = $this->loadJsonFile($requestPath, []);
        if (isset($requestData['changement_note_history']) && is_array($requestData['changement_note_history'])) {
            $history = $requestData['changement_note_history'];
        } elseif (isset($requestData['change_note_history']) && is_array($requestData['change_note_history'])) {
            $history = $requestData['change_note_history'];
        } else {
            $history = [];
        }

        foreach ($filtered as $entry) {
            $history[] = [
                'id' => 'chg_' . bin2hex(random_bytes(6)),
                'code' => strtoupper(bin2hex(random_bytes(4))),
                'timestamp' => date('c'),
                'field' => $entry['field'],
                'label' => $entry['label'],
                'previousValue' => $entry['previous'],
                'newValue' => $entry['value'],
                'sourceClientId' => $entry['sourceClientId'],
                'sourceClientName' => $entry['sourceClientName'],
                'targetClientId' => $requestId,
                'targetClientName' => $entry['targetClientName'],
                'templateId' => $entry['templateId'],
                'templateName' => $entry['templateName'],
                'note' => $entry['note'],
            ];
        }

        $requestData['changement_note_history'] = $history;
        $this->persistJsonFile($requestPath, $requestData);
    }

    /**
     * @param array<string, mixed> $requestData
     *
     * @return array<string, mixed>
     */
    public function expandAllVariables(array $requestData): array
    {
        $variables = isset($requestData['variables']) && is_array($requestData['variables'])
            ? $requestData['variables']
            : [];
        $extracted = [];
        $this->collectScalarVariables($requestData, [], $extracted);
        $changed = false;
        foreach ($extracted as $key => $value) {
            if ($value === '') {
                continue;
            }
            $existing = array_key_exists($key, $variables) ? $this->stringifyValue($variables[$key]) : null;
            if ($existing === $value) {
                continue;
            }
            $variables[$key] = $value;
            $changed = true;
        }
        if ($changed) {
            $requestData['variables'] = $variables;
        }

        return $requestData;
    }

    /**
     * @return array<string, string>
     */
    private function loadVariableIndex(): array
    {
        $path = $this->definitionsPath;
        if (!is_file($path)) {
            return [];
        }
        $contents = file_get_contents($path);
        if ($contents === false) {
            return [];
        }
        $decoded = json_decode($contents, true);
        if (!is_array($decoded)) {
            return [];
        }

        $index = [];
        foreach ($decoded['groups'] ?? [] as $group) {
            if (!is_array($group)) {
                continue;
            }
            $groupId = isset($group['id']) ? trim((string) $group['id']) : '';
            if ($groupId === '') {
                continue;
            }
            foreach ($group['fields'] ?? [] as $field) {
                if (!is_array($field)) {
                    continue;
                }
                $key = isset($field['key']) ? trim((string) $field['key']) : '';
                if ($key === '') {
                    continue;
                }
                $index[$key] = $groupId;
            }
        }

        return $index;
    }

    /**
     * @param array<string, mixed> $template
     *
     * @return array<string, mixed>
     */
    private function normalizeTemplateVariables(array $template): array
    {
        if (!isset($template['elements']) || !is_array($template['elements'])) {
            return $template;
        }

        foreach ($template['elements'] as $index => $element) {
            if (!is_array($element)) {
                continue;
            }
            if (($element['type'] ?? 'text') !== 'text') {
                continue;
            }

            $text = (string) ($element['text'] ?? '');
            $variable = isset($element['data']['variable']) && is_array($element['data']['variable'])
                ? $element['data']['variable']
                : null;

            if ($variable === null) {
                $placeholderKey = $this->extractPlaceholderKey($text);
                if ($placeholderKey === null) {
                    continue;
                }
                $variable = $this->buildVariableFromPlaceholder($placeholderKey);
                if ($variable === null) {
                    continue;
                }
                $template['elements'][$index]['data']['variable'] = $variable;
                continue;
            }

            $template['elements'][$index]['data']['variable'] = $this->normalizeVariableMeta($variable);
        }

        return $template;
    }

    private function extractPlaceholderKey(string $text): ?string
    {
        if ($text === '') {
            return null;
        }
        if (!preg_match('~\{\{\s*([A-Za-z0-9_]+)\s*\}\}~u', $text, $matches)) {
            return null;
        }
        $key = trim($matches[1]);
        return $key !== '' ? $key : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function buildVariableFromPlaceholder(string $placeholder): ?array
    {
        $meta = $this->parsePlaceholder($placeholder);
        if ($meta['baseKey'] === '') {
            return null;
        }

        $groupId = strtolower($this->variableIndex[$meta['baseKey']] ?? 'request');
        $rank = $meta['rank'];
        if ($groupId !== 'request') {
            $rank = null;
        } elseif ($rank === null) {
            $rank = 1;
        }

        return [
            'key' => $meta['key'],
            'baseKey' => $meta['baseKey'],
            'groupId' => $groupId,
            'rank' => $rank,
            'label' => $this->buildDefaultLabel($meta['baseKey'], $groupId === 'request' ? $rank : null),
            'placeholder' => '{{' . $meta['key'] . '}}',
        ];
    }

    /**
     * @param array<string, mixed> $variable
     *
     * @return array<string, mixed>
     */
    private function normalizeVariableMeta(array $variable): array
    {
        $normalized = $variable;

        $key = isset($variable['key']) ? trim((string) $variable['key']) : '';
        $baseKey = isset($variable['baseKey']) ? trim((string) $variable['baseKey']) : '';
        if ($baseKey === '') {
            $baseKey = $key;
        }
        $normalized['key'] = $key !== '' ? $key : $baseKey;
        $normalized['baseKey'] = $baseKey;

        $detectedGroup = $this->variableIndex[$baseKey] ?? null;
        $groupId = isset($variable['groupId']) ? strtolower(trim((string) $variable['groupId'])) : '';
        if ($groupId === '') {
            $groupId = $detectedGroup !== null ? strtolower($detectedGroup) : 'request';
        }
        $normalized['groupId'] = $groupId;

        $rank = null;
        if ($groupId === 'request') {
            if (isset($variable['rank']) && is_numeric($variable['rank'])) {
                $rank = max(1, (int) $variable['rank']);
            } elseif (preg_match('~^(.*)_no(\d+)$~u', $normalized['key'], $matches)) {
                $rank = max(1, (int) $matches[2]);
            } else {
                $rank = 1;
            }
            $normalized['rank'] = $rank;
        } else {
            unset($normalized['rank']);
        }

        if (!isset($normalized['label']) || trim((string) $normalized['label']) === '') {
            $normalized['label'] = $this->buildDefaultLabel($baseKey, $groupId === 'request' ? $rank : null);
        }
        if (!isset($normalized['placeholder']) || trim((string) $normalized['placeholder']) === '') {
            $normalized['placeholder'] = '{{' . $normalized['key'] . '}}';
        }

        return $normalized;
    }

    private function buildDefaultLabel(string $baseKey, ?int $rank): string
    {
        $label = str_replace('_', ' ', $baseKey);
        $label = trim($label);
        if ($label === '') {
            $label = $baseKey;
        }
        $label = ucwords($label);
        if ($rank !== null) {
            $label .= ' – Client ' . $rank;
        }
        return $label;
    }

    /**
     * @param string $placeholder
     *
     * @return array{key: string, baseKey: string, rank: ?int}
     */
    private function parsePlaceholder(string $placeholder): array
    {
        $key = trim($placeholder);
        $rank = null;
        $baseKey = $key;
        if (preg_match('~^(.*)_no(\d+)$~u', $key, $matches)) {
            $baseKey = trim($matches[1]);
            $rank = max(1, (int) $matches[2]);
        }

        return [
            'key' => $key,
            'baseKey' => $baseKey,
            'rank' => $rank,
        ];
    }

    /**
     * @param array<string, mixed> $template
     *
     * @return array<string, array<string, mixed>>
     */
    private function collectRequirements(array $template): array
    {
        $requirements = [
            'request' => [],
            'fused' => [],
            'admin' => [],
        ];

        foreach ($template['elements'] ?? [] as $element) {
            if (!is_array($element)) {
                continue;
            }
            $variable = $element['data']['variable'] ?? null;
            if (!is_array($variable)) {
                continue;
            }
            $normalized = $this->normalizeVariableMeta($variable);
            $baseKey = isset($normalized['baseKey']) ? trim((string) $normalized['baseKey']) : '';
            if ($baseKey === '') {
                continue;
            }
            $groupId = strtolower((string) ($normalized['groupId'] ?? 'request'));
            if ($groupId === 'request') {
                $rank = isset($normalized['rank']) && is_numeric($normalized['rank']) ? max(1, (int) $normalized['rank']) : 1;
                if (!isset($requirements['request'][$baseKey])) {
                    $requirements['request'][$baseKey] = [];
                }
                $requirements['request'][$baseKey][$rank] = true;
            } elseif ($groupId === 'fused') {
                $requirements['fused'][$baseKey] = true;
            } else {
                $requirements[$groupId][$baseKey] = true;
            }
        }

        return $requirements;
    }

    /**
     * @param array<string, array<int, bool>> $requirements
     *
     * @return array<string, mixed>|null
     */
    private function augmentRequestData(string $requestId, array $requestData, array $requirements): ?array
    {
        if ($requirements === []) {
            return null;
        }

        $updated = $requestData;
        $variables = isset($requestData['variables']) && is_array($requestData['variables'])
            ? $requestData['variables']
            : [];

        $changed = false;

        foreach ($requirements as $baseKey => $_ranks) {
            $existing = $this->findValue($updated, $baseKey);
            if ($existing === null && array_key_exists($baseKey, $variables)) {
                $existing = $variables[$baseKey];
            }
            if ($existing === null) {
                $existing = $this->deriveValue($baseKey, $updated, $requestId);
            }
            if ($existing === null) {
                continue;
            }
            if (!array_key_exists($baseKey, $variables) || $variables[$baseKey] !== $existing) {
                $variables[$baseKey] = $existing;
                $changed = true;
            }
            if (!array_key_exists($baseKey, $updated) || $updated[$baseKey] !== $existing) {
                $updated[$baseKey] = $existing;
                $changed = true;
            }
        }

        if ($variables !== [] && (!isset($updated['variables']) || $updated['variables'] !== $variables)) {
            $updated['variables'] = $variables;
            $changed = true;
        }

        $expanded = $this->expandAllVariables($updated);
        if ($expanded !== $updated) {
            $updated = $expanded;
            $changed = true;
        }

        return $changed ? $updated : null;
    }

    private function deriveValue(string $baseKey, array $requestData, string $requestId)
    {
        $customerName = isset($requestData['customer']) && is_string($requestData['customer'])
            ? trim($requestData['customer'])
            : '';
        if ($customerName !== '') {
            [$firstName, $lastName] = $this->splitName($customerName);
            if (in_array($baseKey, ['prenom', 'first_name', 'prenom_client'], true)) {
                return $firstName;
            }
            if (in_array($baseKey, ['nom', 'last_name', 'nom_client'], true)) {
                return $lastName !== '' ? $lastName : $customerName;
            }
            if (in_array($baseKey, ['nom_complet', 'full_name', 'customer', 'customer_name'], true)) {
                return $customerName;
            }
        }

        if ($baseKey === 'file_number') {
            $candidates = [
                $requestData['file_number'] ?? null,
                $requestData['fileNumber'] ?? null,
                $requestData['numero_dossier'] ?? null,
            ];
            foreach ($candidates as $candidate) {
                if (is_string($candidate) && trim($candidate) !== '') {
                    return trim($candidate);
                }
            }
            return $this->generateFallbackFileNumber($requestId);
        }

        return null;
    }

    /**
     * @param array<string, mixed>|string $requestData
     *
     * @return array{0: string, 1: string}
     */
    private function splitName(array|string $requestData): array
    {
        if (is_array($requestData)) {
            $name = isset($requestData['customer']) && is_string($requestData['customer']) ? $requestData['customer'] : '';
        } else {
            $name = $requestData;
        }
        $name = trim((string) $name);
        if ($name === '') {
            return ['', ''];
        }
        $parts = preg_split('~\s+~u', $name) ?: [];
        if (count($parts) === 0) {
            return ['', ''];
        }
        $first = array_shift($parts);
        $last = trim(implode(' ', $parts));
        return [$first ?? '', $last];
    }

    private function generateFallbackFileNumber(string $requestId): string
    {
        $normalized = preg_replace('~[^A-Za-z0-9]+~', '-', $requestId) ?? $requestId;
        $normalized = trim($normalized, '-');
        if ($normalized === '') {
            $normalized = 'DOSSIER';
        }
        return strtoupper($normalized);
    }

    /**
     * @param array<string, mixed> $requestData
     */
    private function ensureFusedFile(string $requestId, string $requestDir, array $requestData, array $requirements): void
    {
        $seedData = [];
        $seedLoaded = false;
        foreach ($this->generalDirectories as $subDir) {
            $base = $requestDir . DIRECTORY_SEPARATOR . $subDir;
            foreach (['FusedCustomersFile_request.json', 'request.json'] as $fileName) {
                $candidate = $base . DIRECTORY_SEPARATOR . $fileName;
                if (is_file($candidate)) {
                    $seedData = $this->loadJsonFile($candidate, []);
                    $seedLoaded = true;
                    break 2;
                }
            }
        }

        $target = $this->resolveFusedTarget($requestDir);
        $fusedData = is_file($target['path']) ? $this->loadJsonFile($target['path'], []) : ($seedLoaded ? $seedData : []);
        $original = $fusedData;

        foreach ($requirements as $baseKey => $_flag) {
            $value = $this->findValue($fusedData, $baseKey);
            if ($value === null) {
                $value = $this->findValue($requestData, $baseKey);
            }
            if ($value === null) {
                $value = $this->deriveValue($baseKey, $requestData, $requestId);
            }
            if ($value === null) {
                $value = '';
            }
            if (!array_key_exists($baseKey, $fusedData) || $fusedData[$baseKey] !== $value) {
                $fusedData[$baseKey] = $value;
            }
        }

        if ($fusedData !== $original || !is_file($target['path'])) {
            if (!is_dir($target['directory']) && !mkdir($target['directory'], 0775, true) && !is_dir($target['directory'])) {
                throw new \RuntimeException(sprintf('Impossible de préparer le dossier général pour "%s".', $requestId));
            }
            $this->persistJsonFile($target['path'], $fusedData);
        }
    }

    /**
     * @param array<string, mixed>|\stdClass|null $source
     */
    private function findValue($source, string $targetKey)
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
        $normalizedTarget = $this->normalizeKey($targetKey);
        foreach ($source as $key => $value) {
            if (is_string($key) && $this->normalizeKey($key) === $normalizedTarget) {
                return $value;
            }
        }
        foreach ($source as $value) {
            if ($value instanceof \stdClass) {
                $value = (array) $value;
            }
            if (is_array($value)) {
                $found = $this->findValue($value, $targetKey);
                if ($found !== null) {
                    return $found;
                }
            }
        }
        return null;
    }

    /**
     * @param array<int, string> $segments
     *
     * @return array<int, string>
     */
    private function buildKeyCandidates(array $segments): array
    {
        $segments = array_values(array_filter(array_map(static function ($segment): string {
            return trim((string) $segment);
        }, $segments), static function ($segment): bool {
            return $segment !== '';
        }));
        if ($segments === []) {
            return [];
        }

        $variants = [];
        $raw = implode('_', $segments);
        if ($raw !== '') {
            $variants[] = $raw;
        }

        $snakeSegments = array_map([$this, 'toSnake'], $segments);
        $snake = implode('_', array_filter($snakeSegments, static function ($segment): bool {
            return $segment !== '';
        }));
        if ($snake !== '') {
            $variants[] = $snake;
        }

        $last = $segments[count($segments) - 1];
        if ($last !== '') {
            $variants[] = $last;
        }
        $lastSnake = $this->toSnake($last);
        if ($lastSnake !== '') {
            $variants[] = $lastSnake;
        }

        $trimmed = $this->filterContainerSegments($segments);
        if (count($trimmed) !== count($segments) && $trimmed !== []) {
            $variants = array_merge($variants, $this->buildKeyCandidates($trimmed));
        }

        return array_values(array_unique(array_filter($variants, static function ($value): bool {
            return $value !== '';
        })));
    }

    /**
     * @param array<int, string> $segments
     *
     * @return array<int, string>
     */
    private function filterContainerSegments(array $segments): array
    {
        $containers = [
            'form',
            'form_data',
            'formdata',
            'data',
            'details',
            'information',
            'informations',
            'infos',
            'info',
        ];

        $filtered = [];
        foreach ($segments as $segment) {
            $normalized = $this->toSnake($segment);
            if (in_array($normalized, $containers, true)) {
                continue;
            }
            $filtered[] = $segment;
        }

        return $filtered;
    }

    private function shouldSkipRootSegment(string $segment): bool
    {
        $normalized = $this->toSnake($segment);
        $ignored = ['variables', 'reminders', 'uploaded_docs', 'uploaded_docs_history', 'documents_history'];
        return in_array($normalized, $ignored, true);
    }

    /**
     * @param mixed $source
     * @param array<int, string> $path
     * @param array<string, string> $output
     */
    private function collectScalarVariables($source, array $path, array &$output): void
    {
        if ($source instanceof \Stringable) {
            $source = (string) $source;
        }
        if ($source instanceof \stdClass) {
            $source = (array) $source;
        }

        if (is_array($source)) {
            foreach ($source as $key => $value) {
                $segment = is_string($key) ? trim($key) : (string) $key;
                if ($segment === '') {
                    continue;
                }
                if ($path === [] && $this->shouldSkipRootSegment($segment)) {
                    continue;
                }
                $nextPath = $path;
                $nextPath[] = $segment;
                $this->collectScalarVariables($value, $nextPath, $output);
            }
            return;
        }

        if ($path === []) {
            return;
        }

        if ($source === null) {
            return;
        }
        if (!is_scalar($source)) {
            return;
        }

        $stringValue = $this->stringifyValue($source);
        if ($stringValue === '') {
            return;
        }

        $candidates = $this->buildKeyCandidates($path);
        foreach ($candidates as $candidate) {
            if ($candidate === '') {
                continue;
            }
            if (!array_key_exists($candidate, $output)) {
                $output[$candidate] = $stringValue;
            }
        }
    }

    private function toSnake(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }
        $value = preg_replace('~([a-z0-9])([A-Z])~u', '$1_$2', $value) ?? $value;
        $value = preg_replace('~[\s\\-\/]+~u', '_', $value) ?? $value;
        $value = preg_replace('~[^\pL\pN_]+~u', '_', $value) ?? $value;
        $value = preg_replace('~_+~', '_', $value) ?? $value;
        return strtolower(trim($value, '_'));
    }

    private function normalizeKey(string $value): string
    {
        return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
    }

    /**
     * @param string $requestDir
     *
     * @return array{directory: string, path: string}
     */
    private function resolveFusedTarget(string $requestDir): array
    {
        foreach ($this->generalDirectories as $subDir) {
            $directory = $requestDir . DIRECTORY_SEPARATOR . $subDir;
            $path = $directory . DIRECTORY_SEPARATOR . 'FusedCustomersFile_request.json';
            if (is_file($path)) {
                return ['directory' => $directory, 'path' => $path];
            }
        }
        $primary = $this->generalDirectories[0] ?? 'Dossier général';
        $directory = $requestDir . DIRECTORY_SEPARATOR . $primary;
        $path = $directory . DIRECTORY_SEPARATOR . 'FusedCustomersFile_request.json';
        return ['directory' => $directory, 'path' => $path];
    }

    private function resolveRequestDirectory(string $requestId): ?string
    {
        $safe = trim($requestId);
        if ($safe === '' || $safe === '.' || $safe === '..') {
            return null;
        }
        if (!preg_match("~^[\\p{L}0-9 _\\-()'’]+$~u", $safe)) {
            return null;
        }
        $candidate = $this->requestsDir . DIRECTORY_SEPARATOR . $safe;
        $real = realpath($candidate);
        if ($real === false || !is_dir($real)) {
            return null;
        }
        $normalizedRoot = $this->requestsDir . DIRECTORY_SEPARATOR;
        $normalizedReal = rtrim($real, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (strncmp($normalizedReal, $normalizedRoot, strlen($normalizedRoot)) !== 0) {
            return null;
        }
        return $real;
    }

    /**
     * @template T
     * @param T $default
     * @return T|array<string, mixed>
     */
    private function loadJsonFile(string $path, $default)
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

    /**
     * @param array<string, mixed> $data
     */
    private function persistJsonFile(string $path, array $data): void
    {
        $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($encoded === false) {
            throw new \RuntimeException('Impossible d\'encoder les données.');
        }
        if (file_put_contents($path, $encoded) === false) {
            throw new \RuntimeException(sprintf('Impossible d\'écrire le fichier "%s".', $path));
        }
    }

    private function stringifyValue($value): string
    {
        if ($value === null) {
            return '';
        }
        if (is_string($value)) {
            return $value;
        }
        if (is_numeric($value) || is_bool($value)) {
            return (string) $value;
        }
        return '';
    }
}