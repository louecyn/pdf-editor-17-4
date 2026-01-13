<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

require_once __DIR__ . '/../app/Vendor/PdfCompat/PdfCompat.php';

use App\Vendor\PdfCompat\PdfCompat;

final class TemplateRepository
{
    private string $baseDir;

    public function __construct(string $baseDir)
    {
        $this->baseDir = rtrim($baseDir, DIRECTORY_SEPARATOR);
        if (!is_dir($this->baseDir) && !mkdir($this->baseDir, 0775, true) && !is_dir($this->baseDir)) {
            throw new \RuntimeException('Impossible de préparer le répertoire des modèles.');
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listTemplates(): array
    {
        $items = [];
        foreach (scandir($this->baseDir) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $directory = $this->baseDir . DIRECTORY_SEPARATOR . $entry;
            if (!is_dir($directory)) {
                continue;
            }
            $meta = $this->loadMeta($entry);
            if ($meta === null) {
                continue;
            }
            $items[] = $this->formatTemplate($entry, $meta);
        }
        usort($items, static fn(array $a, array $b): int => strcmp($a['name'], $b['name']));
        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    public function getTemplate(string $id): array
    {
        $safeId = $this->sanitizeId($id);
        $meta = $this->loadMeta($safeId);
        if ($meta === null) {
            throw new \RuntimeException('Modèle introuvable.');
        }
        return $this->formatTemplate($safeId, $meta);
    }

    /**
     * @return array<string, mixed>
     */
    public function saveTemplate(string $name, string $pdfBase64, ?string $id = null, array $options = []): array
    {
        $cleanName = $this->sanitizeName($name);
        if ($cleanName === '') {
            throw new \RuntimeException('Le nom du document est requis.');
        }

        $payload = $this->normalizeBase64($pdfBase64);
        $bytes = base64_decode($payload, true);
        if ($bytes === false) {
            throw new \RuntimeException('Données PDF invalides.');
        }

        $normalizedBytes = PdfCompat::normalizeBuffer($bytes);

        $templateId = $id !== null ? $this->sanitizeId($id) : $this->generateId();
        $directory = $this->baseDir . DIRECTORY_SEPARATOR . $templateId;
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new \RuntimeException('Impossible de créer le dossier du modèle.');
        }

        $existingMeta = $this->loadMeta($templateId);
        $createdAt = $existingMeta['createdAt'] ?? date('c');
        $fileName = $existingMeta['fileName'] ?? $this->generateFileName($directory, $cleanName);

        $filePath = $directory . DIRECTORY_SEPARATOR . $fileName;
        if (file_put_contents($filePath, $normalizedBytes) === false) {
            throw new \RuntimeException('Impossible d\'écrire le modèle.');
        }

        $maxClients = $this->sanitizeMaxClients($options['maxClients'] ?? ($existingMeta['maxClients'] ?? 1));
        $variableMappings = $this->sanitizeVariableMappings($options['variableMappings'] ?? ($existingMeta['variableMappings'] ?? []));
        $elements = $this->sanitizeElements($options['elements'] ?? ($existingMeta['elements'] ?? []));
        $questionSettings = $this->sanitizeQuestionSettings($options['questionSettings'] ?? ($existingMeta['questionSettings'] ?? []));

        if (is_array($existingMeta) && array_key_exists('instructions', $existingMeta)) {
            unset($existingMeta['instructions']);
        }

        $meta = array_merge($existingMeta ?? [], [
            'id' => $templateId,
            'name' => $cleanName,
            'fileName' => $fileName,
            'createdAt' => $createdAt,
            'updatedAt' => date('c'),
            'maxClients' => $maxClients,
            'variableMappings' => $variableMappings,
            'elements' => $elements,
            'questionSettings' => $questionSettings,
        ]);
        $this->persistMeta($templateId, $meta);

        return $this->formatTemplate($templateId, $meta);
    }

    public function deleteTemplate(string $id): void
    {
        $safeId = $this->sanitizeId($id);
        $directory = $this->baseDir . DIRECTORY_SEPARATOR . $safeId;
        if (!is_dir($directory)) {
            throw new \RuntimeException('Modèle introuvable.');
        }
        $this->removeDirectory($directory);
    }

    private function sanitizeId(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $trimmed)) {
            throw new \RuntimeException('Identifiant de modèle invalide.');
        }
        return $trimmed;
    }

    private function sanitizeName(string $value): string
    {
        $value = trim($value);
        $value = preg_replace('~\s+~', ' ', $value) ?? $value;
        return $value;
    }

    private function generateId(): string
    {
        do {
            $id = 'tpl_' . bin2hex(random_bytes(4));
            $path = $this->baseDir . DIRECTORY_SEPARATOR . $id;
        } while (is_dir($path));
        return $id;
    }

    private function generateFileName(string $directory, string $name): string
    {
        $base = strtolower($name);
        $base = preg_replace('~[^a-z0-9]+~', '-', $base) ?? '';
        $base = trim($base, '-');
        if ($base === '') {
            $base = 'document';
        }
        $base = substr($base, 0, 60);
        $candidate = $base . '.pdf';
        $index = 2;
        while (file_exists($directory . DIRECTORY_SEPARATOR . $candidate)) {
            $candidate = $base . '_' . $index . '.pdf';
            $index++;
        }
        return $candidate;
    }

    private function sanitizeMaxClients($value): int
    {
        if (is_numeric($value)) {
            $number = (int)$value;
        } else {
            $number = 1;
        }
        if ($number < 1) {
            $number = 1;
        }
        if ($number > 10) {
            $number = 10;
        }
        return $number;
    }

    /**
     * @param mixed $value
     * @return array<int, array<string, mixed>>
     */
    private function sanitizeVariableMappings($value): array
    {
        if (!is_array($value)) {
            return [];
        }
        $result = [];
        foreach ($value as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $key = trim((string)($entry['key'] ?? ''));
            if ($key === '') {
                continue;
            }
            $label = trim((string)($entry['label'] ?? ''));
            $ranks = [];
            if (isset($entry['ranks']) && is_array($entry['ranks'])) {
                foreach ($entry['ranks'] as $rank => $targets) {
                    $rankIndex = (int) $rank;
                    if ($rankIndex < 1) {
                        continue;
                    }
                    $cleanTargets = [];
                    if (is_array($targets)) {
                        foreach ($targets as $target) {
                            if (is_string($target) && $target !== '') {
                                $cleanTargets[] = $target;
                            }
                        }
                    }
                    $ranks[(string) $rankIndex] = $cleanTargets;
                }
            }
            $result[] = [
                'key' => $key,
                'label' => $label,
                'ranks' => $ranks,
            ];
        }
        return $result;
    }

    /**
     * @param mixed $value
     * @return array<int, array<string, mixed>>
     */
    private function sanitizeElements($value): array
    {
        if (!is_array($value)) {
            return [];
        }
        $result = [];
        foreach ($value as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $type = $entry['type'] ?? 'text';
            $cleanType = $type === 'signature' ? 'signature' : 'text';
            $element = [
                'id' => $this->sanitizeElementId($entry['id'] ?? ''),
                'type' => $cleanType,
                'page' => $this->sanitizeElementPage($entry['page'] ?? 0),
                'x' => $this->sanitizeFloat($entry['x'] ?? 0.0),
                'y' => $this->sanitizeFloat($entry['y'] ?? 0.0),
            ];
            if (isset($entry['width']) && is_numeric($entry['width'])) {
                $element['width'] = $this->sanitizeFloat($entry['width']);
            }
            if (isset($entry['height']) && is_numeric($entry['height'])) {
                $element['height'] = $this->sanitizeFloat($entry['height']);
            }
            if ($cleanType === 'text') {
                $element['text'] = isset($entry['text']) ? (string) $entry['text'] : '';
                $element['fontFamily'] = isset($entry['fontFamily']) ? (string) $entry['fontFamily'] : 'Helvetica';
                $element['fontSize'] = $this->sanitizeFloat($entry['fontSize'] ?? 14);
                $element['color'] = isset($entry['color']) ? (string) $entry['color'] : '#111827';
                $element['bold'] = !empty($entry['bold']);
                $element['italic'] = !empty($entry['italic']);
                $element['underline'] = !empty($entry['underline']);
                $element['highlight'] = !empty($entry['highlight']);
                $data = $this->sanitizeElementData($entry['data'] ?? null);
                if (!empty($data)) {
                    $element['data'] = $data;
                }
            } else {
                $element['data'] = is_string($entry['data'] ?? null) ? (string) $entry['data'] : '';
            }
            if ($element['id'] === '') {
                $element['id'] = $this->generateElementId();
            }
            $result[] = $element;
        }
        return $result;
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>
     */
    private function sanitizeElementData($value): array
    {
        if (!is_array($value)) {
            return [];
        }
        $result = [];
        if (isset($value['variable']) && is_array($value['variable'])) {
            $variable = $value['variable'];
            $baseKey = isset($variable['baseKey']) ? trim((string) $variable['baseKey']) : '';
            $key = isset($variable['key']) ? trim((string) $variable['key']) : $baseKey;
            if ($key !== '') {
                $label = isset($variable['label']) ? trim((string) $variable['label']) : $key;
                $placeholder = isset($variable['placeholder']) ? trim((string) $variable['placeholder']) : '';
                $rankRaw = $variable['rank'] ?? null;
                $rank = null;
                if (is_numeric($rankRaw)) {
                    $rank = (int) $rankRaw;
                    if ($rank < 1) {
                        $rank = 1;
                    }
                }
                $result['variable'] = [
                    'key' => $key,
                    'baseKey' => $baseKey !== '' ? $baseKey : $key,
                    'label' => $label,
                    'groupId' => isset($variable['groupId']) ? trim((string) $variable['groupId']) : '',
                    'rank' => $rank,
                    'placeholder' => $placeholder,
                ];
            }
        }
        return $result;
    }

    private function sanitizeElementId($value): string
    {
        $value = trim((string) $value);
        if ($value === '') {
            return '';
        }
        $clean = preg_replace('~[^A-Za-z0-9_-]+~', '', $value) ?? '';
        return substr($clean, 0, 80);
    }

    private function generateElementId(): string
    {
        return 'el_' . bin2hex(random_bytes(4));
    }

    private function sanitizeElementPage($value): int
    {
        $page = (int) $value;
        return $page >= 0 ? $page : 0;
    }

    private function sanitizeFloat($value): float
    {
        if (!is_numeric($value)) {
            return 0.0;
        }
        return (float) $value;
    }

    private function normalizeBase64(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '') {
            return $trimmed;
        }
        if (str_contains($trimmed, ',')) {
            [$meta, $data] = explode(',', $trimmed, 2);
            if (str_contains($meta, ';base64')) {
                return $data;
            }
        }
        return $trimmed;
    }

    private function removeDirectory(string $path): void
    {
        if (!is_dir($path)) {
            if (is_file($path) && !@unlink($path)) {
                throw new \RuntimeException('Impossible de supprimer le fichier du modèle.');
            }
            return;
        }
        $items = scandir($path);
        if ($items === false) {
            throw new \RuntimeException('Impossible de lire le dossier du modèle.');
        }
        foreach ($items as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $target = $path . DIRECTORY_SEPARATOR . $entry;
            if (is_dir($target)) {
                $this->removeDirectory($target);
            } elseif (is_file($target) && !@unlink($target)) {
                throw new \RuntimeException('Impossible de supprimer le fichier du modèle.');
            }
        }
        if (!@rmdir($path)) {
            throw new \RuntimeException('Impossible de supprimer le dossier du modèle.');
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function loadMeta(string $id): ?array
    {
        $path = $this->baseDir . DIRECTORY_SEPARATOR . $id . DIRECTORY_SEPARATOR . 'meta.json';
        if (!is_file($path)) {
            return null;
        }
        $contents = file_get_contents($path);
        if ($contents === false) {
            return null;
        }
        $decoded = json_decode($contents, true);
        return is_array($decoded) ? $decoded : null;
    }

    private function persistMeta(string $id, array $meta): void
    {
        $path = $this->baseDir . DIRECTORY_SEPARATOR . $id . DIRECTORY_SEPARATOR . 'meta.json';
        $encoded = json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($encoded === false) {
            throw new \RuntimeException('Impossible d\'encoder les métadonnées.');
        }
        if (file_put_contents($path, $encoded) === false) {
            throw new \RuntimeException('Impossible d\'enregistrer les métadonnées.');
        }
    }

    /**
     * @param array<string, mixed> $meta
     * @return array<string, mixed>
     */
    private function formatTemplate(string $id, array $meta): array
    {
        $fileName = $meta['fileName'] ?? ($id . '.pdf');
        $relative = 'data/templates/' . $id . '/' . $fileName;
        $public = 'data/templates/' . rawurlencode($id) . '/' . rawurlencode($fileName);
        $filePath = $this->baseDir . DIRECTORY_SEPARATOR . $id . DIRECTORY_SEPARATOR . $fileName;
        $size = null;
        if (is_file($filePath)) {
            $fileSize = filesize($filePath);
            if ($fileSize !== false) {
                $size = (int) $fileSize;
            }
        }
        $updatedAt = $meta['updatedAt'] ?? $meta['createdAt'] ?? date('c');
        $version = (string) (strtotime($updatedAt) ?: time());

        return [
            'id' => $id,
            'name' => $meta['name'] ?? $fileName,
            'fileName' => $fileName,
            'createdAt' => $meta['createdAt'] ?? null,
            'updatedAt' => $updatedAt,
            'relativePath' => $relative,
            'publicPath' => $public . '?v=' . rawurlencode($version),
            'sourcePath' => $public,
            'size' => $size,
            'maxClients' => $this->sanitizeMaxClients($meta['maxClients'] ?? 1),
            'variableMappings' => $this->sanitizeVariableMappings($meta['variableMappings'] ?? []),
            'elements' => $this->sanitizeElements($meta['elements'] ?? []),
            'questionSettings' => $this->sanitizeQuestionSettings($meta['questionSettings'] ?? []),
        ];
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>
     */
    private function sanitizeQuestionSettings($value): array
    {
        if (!is_array($value)) {
            return [
                'classes' => [],
                'selectedBlobs' => [],
            ];
        }

        $classes = [];
        if (isset($value['classes']) && is_array($value['classes'])) {
            foreach ($value['classes'] as $assignment) {
                if (!is_array($assignment)) {
                    continue;
                }
                $classId = isset($assignment['id']) ? trim((string) $assignment['id']) : '';
                if ($classId === '') {
                    continue;
                }
                try {
                    $classId = $this->sanitizeQuestionClassId($classId);
                } catch (\Throwable $e) {
                    continue;
                }
                $required = filter_var($assignment['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $notes = isset($assignment['notes']) ? trim((string) $assignment['notes']) : '';
                $defaultBlobs = [];
                if (isset($assignment['defaultBlobs']) && is_array($assignment['defaultBlobs'])) {
                    foreach ($assignment['defaultBlobs'] as $blobId) {
                        $blob = trim((string) $blobId);
                        if ($blob === '') {
                            continue;
                        }
                        try {
                            $blob = $this->sanitizeQuestionClassId($blob);
                        } catch (\Throwable $e) {
                            continue;
                        }
                        $defaultBlobs[] = $blob;
                    }
                }
                $metadata = is_array($assignment['metadata'] ?? null) ? $assignment['metadata'] : [];
                $classes[] = [
                    'id' => $classId,
                    'required' => $required,
                    'defaultBlobs' => array_values(array_unique($defaultBlobs)),
                    'notes' => $notes,
                    'metadata' => $metadata,
                ];
            }
        }

        $selectedBlobs = [];
        $rawBlobs = [];
        if (isset($value['selectedBlobs']) && is_array($value['selectedBlobs'])) {
            $rawBlobs = $value['selectedBlobs'];
        } elseif (isset($value['blobs']) && is_array($value['blobs'])) {
            $rawBlobs = $value['blobs'];
        }
        foreach ($rawBlobs as $blob) {
            if (!is_array($blob)) {
                continue;
            }
            $classId = isset($blob['classId']) ? trim((string) $blob['classId']) : '';
            $blobId = isset($blob['blobId']) ? trim((string) $blob['blobId']) : '';
            if ($classId === '' || $blobId === '') {
                continue;
            }
            try {
                $classId = $this->sanitizeQuestionClassId($classId);
                $blobId = $this->sanitizeQuestionClassId($blobId);
            } catch (\Throwable $e) {
                continue;
            }
            $label = isset($blob['label']) ? trim((string) $blob['label']) : '';
            $metadata = is_array($blob['metadata'] ?? null) ? $blob['metadata'] : [];
            $selectedBlobs[] = [
                'classId' => $classId,
                'blobId' => $blobId,
                'label' => $label,
                'metadata' => $metadata,
            ];
        }

        return [
            'classes' => $classes,
            'selectedBlobs' => $selectedBlobs,
        ];
    }

    private function sanitizeQuestionClassId(string $value): string
    {
        $value = trim($value);
        if ($value === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $value)) {
            throw new \RuntimeException('Identifiant Questions/Actions invalide.');
        }
        return $value;
    }
}