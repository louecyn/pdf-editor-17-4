<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

final class DocumentRepository
{
    private string $requestsDir;

    public function __construct(string $requestsDir)
    {
        $basePath = realpath($requestsDir);
        if ($basePath === false) {
            throw new \InvalidArgumentException(sprintf('Requests directory "%s" does not exist.', $requestsDir));
        }
        $this->requestsDir = rtrim($basePath, DIRECTORY_SEPARATOR);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listRequests(): array
    {
        $items = [];
        foreach (scandir($this->requestsDir) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $requestPath = $this->requestsDir . DIRECTORY_SEPARATOR . $entry;
            if (!is_dir($requestPath)) {
                continue;
            }

            $documents = $this->listDocuments($entry);
            $items[] = [
                'id' => $entry,
                'displayName' => str_replace(['_', '-'], [' ', ' '], $entry),
                'documentCount' => count($documents),
            ];
        }

        usort($items, static fn ($a, $b) => strcmp($a['displayName'], $b['displayName']));
        return $items;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listDocuments(string $requestId): array
    {
        $directories = $this->resolveDocumentDirectories($requestId);
        if (!$directories) {
            return [];
        }

        $documents = [];
        foreach ($directories as $directory) {
            $this->collectPdfDocuments($requestId, $directory, $documents);
        }

        $documents = array_values($documents);
        usort($documents, static fn ($a, $b) => strcmp($a['name'], $b['name']));

        return $documents;
    }

    private function collectPdfDocuments(string $requestId, string $directory, array &$documents): void
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                $directory,
                \FilesystemIterator::SKIP_DOTS
            ),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $fileInfo) {
            if (!$fileInfo instanceof \SplFileInfo) {
                continue;
            }

            if (!$fileInfo->isFile()) {
                continue;
            }

            if (strtolower($fileInfo->getExtension()) !== 'pdf') {
                continue;
            }

            $filePath = $fileInfo->getRealPath() ?: $fileInfo->getPathname();
            $fileName = $fileInfo->getFilename();
            $documents[$this->buildDocumentKey($requestId, $fileName, $filePath)] = $this->buildDocumentMeta($requestId, $fileName, $filePath);
        }
    }

    public function getDocumentMeta(string $requestId, string $fileName): array
    {
        foreach ($this->resolveDocumentDirectories($requestId) as $directory) {
            $filePath = $directory . DIRECTORY_SEPARATOR . $fileName;
            if (is_file($filePath)) {
                return $this->buildDocumentMeta($requestId, $fileName, $filePath);
            }
        }

        throw new \RuntimeException('Document introuvable.');
    }

    /**
     * @return array<int, string>
     */
    private function resolveDocumentDirectories(string $requestId): array
    {
        $directories = [];

        $basePath = $this->resolvePath($requestId);
        if ($basePath !== null && is_dir($basePath)) {
            $directories[] = $basePath;
        }

        $uploadsPath = $this->resolvePath($requestId, 'uploads');
        if ($uploadsPath !== null && is_dir($uploadsPath)) {
            $directories[] = $uploadsPath;
        }

        return array_values(array_unique($directories));
    }

    private function resolvePath(string $requestId, string $sub = ''): ?string
    {
        $safe = trim($requestId);
        if ($safe === '' || $safe === '.' || $safe === '..') {
            return null;
        }
        if (!preg_match("~^[\\p{L}0-9 _\\-()'’]+$~u", $safe)) {
            return null;
        }

        $path = $this->requestsDir . DIRECTORY_SEPARATOR . $safe;
        if ($sub !== '') {
            $path .= DIRECTORY_SEPARATOR . $sub;
        }

        $real = realpath($path);
        if ($real === false) {
            return null;
        }

        $normalizedRoot = $this->requestsDir . DIRECTORY_SEPARATOR;
        $normalizedReal = rtrim($real, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (strncmp($normalizedReal, $normalizedRoot, strlen($normalizedRoot)) !== 0) {
            return null;
        }

        return $real;
    }

    private function buildDocumentKey(string $requestId, string $fileName, string $filePath): string
    {
        $canonical = realpath($filePath) ?: $filePath;

        return md5($requestId . '|' . $canonical . '|' . $fileName);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildDocumentMeta(string $requestId, string $fileName, string $filePath): array
    {
        [$relativePath, $publicPath] = $this->buildRelativePaths($filePath);

        return [
            'name' => $fileName,
            'requestId' => $requestId,
            'path' => $publicPath,
            'relativePath' => $relativePath,
            'absolutePath' => $filePath,
            'size' => filesize($filePath),
            'modifiedAt' => date('c', filemtime($filePath)),
        ];
    }

    /**
     * @return array{0: string, 1: string} [relativePath, publicPath]
     */
    private function buildRelativePaths(string $filePath): array
    {
        $requestsRoot = $this->requestsDir . DIRECTORY_SEPARATOR;
        $realPath = realpath($filePath);
        if ($realPath === false || strpos($realPath, $requestsRoot) !== 0) {
            throw new \RuntimeException('Chemin de document invalide.');
        }

        $relative = substr($realPath, strlen($requestsRoot));
        $relative = str_replace(DIRECTORY_SEPARATOR, '/', $relative);

        $relativeWithPrefix = 'data/requests/' . $relative;
        $segments = array_map(static fn (string $part): string => rawurlencode($part), explode('/', $relative));
        $publicPath = 'data/requests/' . implode('/', $segments);

        return [$relativeWithPrefix, $publicPath];
    }
}