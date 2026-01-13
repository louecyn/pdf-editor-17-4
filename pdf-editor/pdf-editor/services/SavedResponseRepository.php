<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

final class SavedResponseRepository
{
    private string $filePath;

    public function __construct(string $baseDir)
    {
        $directory = rtrim($baseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'questions';
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new \RuntimeException('Impossible de préparer le répertoire des réponses sauvegardées.');
        }
        $this->filePath = $directory . DIRECTORY_SEPARATOR . 'saved_responses.json';
        if (!is_file($this->filePath)) {
            $this->persistData([
                'libraries' => [],
            ]);
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function listLibraries(): array
    {
        $data = $this->loadData();
        $libraries = $data['libraries'] ?? [];
        if (!is_array($libraries)) {
            return [];
        }
        return $libraries;
    }

    /**
     * @return array<string, mixed>
     */
    public function getLibrary(string $key): array
    {
        $safeKey = $this->sanitizeKey($key);
        $data = $this->loadData();
        $libraries = $data['libraries'] ?? [];
        if (!is_array($libraries)) {
            return ['entries' => []];
        }
        $library = $libraries[$safeKey] ?? ['entries' => []];
        if (!isset($library['entries']) || !is_array($library['entries'])) {
            $library['entries'] = [];
        }
        return $library;
    }

    /**
     * @param array<string, mixed> $entry
     * @return array<string, mixed>
     */
    public function appendEntry(string $libraryKey, array $entry): array
    {
        $safeKey = $this->sanitizeKey($libraryKey);
        if ($safeKey === '') {
            throw new \RuntimeException('Identifiant de bibliothèque invalide.');
        }
        $label = isset($entry['label']) && is_string($entry['label']) ? trim($entry['label']) : '';
        $value = isset($entry['value']) && is_string($entry['value']) ? trim($entry['value']) : '';
        if ($label === '' && $value === '') {
            throw new \RuntimeException('Impossible d’enregistrer une réponse vide.');
        }
        $data = $this->loadData();
        if (!isset($data['libraries']) || !is_array($data['libraries'])) {
            $data['libraries'] = [];
        }
        if (!isset($data['libraries'][$safeKey]) || !is_array($data['libraries'][$safeKey])) {
            $data['libraries'][$safeKey] = ['entries' => []];
        }
        if (!isset($data['libraries'][$safeKey]['entries']) || !is_array($data['libraries'][$safeKey]['entries'])) {
            $data['libraries'][$safeKey]['entries'] = [];
        }

        $entries = $data['libraries'][$safeKey]['entries'];
        $normalized = [
            'id' => $this->generateEntryId(),
            'label' => $label,
            'value' => $value,
            'createdAt' => (new \DateTimeImmutable())->format(DATE_ATOM),
        ];
        $entries[] = $normalized;
        $data['libraries'][$safeKey]['entries'] = array_values($entries);
        $this->persistData($data);

        return $normalized;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadData(): array
    {
        if (!is_file($this->filePath)) {
            return ['libraries' => []];
        }
        $contents = file_get_contents($this->filePath);
        if ($contents === false || $contents === '') {
            return ['libraries' => []];
        }
        $decoded = json_decode($contents, true);
        return is_array($decoded) ? $decoded : ['libraries' => []];
    }

    /**
     * @param array<string, mixed> $data
     */
    private function persistData(array $data): void
    {
        $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($encoded === false) {
            throw new \RuntimeException('Impossible d\'encoder les réponses sauvegardées.');
        }
        if (file_put_contents($this->filePath, $encoded) === false) {
            throw new \RuntimeException('Impossible d\'enregistrer les réponses sauvegardées.');
        }
    }

    private function sanitizeKey(string $key): string
    {
        $normalized = trim($key);
        $normalized = preg_replace('~[^A-Za-z0-9_\-]+~', '_', $normalized) ?? '';
        return strtolower(trim($normalized, '_-'));
    }

    private function generateEntryId(): string
    {
        return 'sr_' . bin2hex(random_bytes(5));
    }
}