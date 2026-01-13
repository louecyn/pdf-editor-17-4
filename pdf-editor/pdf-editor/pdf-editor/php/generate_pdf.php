<?php
declare(strict_types=1);

use App\Vendor\PdfCompat\PdfCompat;
use DemandeEnLigne\PdfEditor\DocumentRepository;
use DemandeEnLigne\PdfEditor\PdfEditorRenderer;

require_once __DIR__ . '/pdf_editor_document_utils.php';
require_once dirname(__DIR__, 2) . '/app/Vendor/PdfCompat/PdfCompat.php';
require_once dirname(__DIR__, 2) . '/services/PdfEditorRenderer.php';

header('Content-Type: application/json; charset=utf-8');

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

try {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        throw new RuntimeException('Requête vide.');
    }

    $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($payload)) {
        throw new RuntimeException('Payload invalide.');
    }

    $projectRoot = dirname(__DIR__, 2);
    $requestId = sanitizeRequestId((string)($payload['requestId'] ?? ''));
    $documentName = sanitizeDocumentName((string)($payload['document'] ?? ''));
    $elements = is_array($payload['elements'] ?? null) ? $payload['elements'] : [];
    $fileName = isset($payload['fileName']) ? (string)$payload['fileName'] : null;
    $pdfData = isset($payload['pdfData']) ? (string)$payload['pdfData'] : '';

    $doc = fetchDocumentMeta($projectRoot, $requestId, $documentName);

    if ($pdfData !== '') {
        $target = storePreRenderedPdf($pdfData, $doc, $fileName, $projectRoot);
    } else {
        $renderer = new PdfEditorRenderer($projectRoot);
        $target = $renderer->render($doc['absolutePath'], $elements, $fileName);
    }

    cleanupOldFiles($projectRoot . '/pdf-editor/output');

    echo json_encode([
        'data' => [
            'fileName' => basename($target),
            'downloadUrl' => 'pdf-editor/output/' . basename($target),
        ],
    ]);
} catch (\JsonException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload JSON invalide.']);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} catch (RuntimeException $e) {
    $message = $e->getMessage();
    $code = stripos($message, 'introuvable') !== false ? 404 : 422;
    http_response_code($code);
    echo json_encode(['error' => $message]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne : ' . $e->getMessage()]);
}

function sanitizeRequestId(string $value): string
{
    $value = trim($value);
    if ($value === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $value)) {
        throw new RuntimeException('Identifiant de dossier invalide.');
    }

    return $value;
}

function sanitizeDocumentName(string $value): string
{
    $value = trim($value);
    if ($value === '' || strpos($value, '..') !== false || preg_match('~[\\/]~', $value)) {
        throw new RuntimeException('Nom de document invalide.');
    }

    return $value;
}

/**
 * @return array<string, mixed>
 */
function fetchDocumentMeta(string $projectRoot, string $requestId, string $documentName): array
{
    $repository = new DocumentRepository($projectRoot . '/data/requests');

    return $repository->getDocumentMeta($requestId, $documentName);
}

function cleanupOldFiles(string $directory): void
{
    foreach (glob(rtrim($directory, DIRECTORY_SEPARATOR) . '/*.pdf') ?: [] as $file) {
        if (filemtime($file) < strtotime('-2 days')) {
            @unlink($file);
        }
    }
}

function storePreRenderedPdf(string $encoded, array $doc, ?string $fileName, string $projectRoot): string
{
    $bytes = base64_decode($encoded, true);
    if ($bytes === false) {
        throw new RuntimeException('Flux PDF invalide.');
    }
    $outputDir = ensureOutputDirectory($projectRoot . '/pdf-editor/output');
    $targetName = resolveTargetFileName($fileName, $doc['name'] ?? 'document');
    $targetPath = ensureUniquePath($outputDir, $targetName);
    $normalized = PdfCompat::normalizeBuffer($bytes);
    if (file_put_contents($targetPath, $normalized) === false) {
        throw new RuntimeException('Impossible d’enregistrer le PDF généré.');
    }
    return $targetPath;
}

function ensureOutputDirectory(string $directory): string
{
    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        throw new RuntimeException('Impossible de créer le répertoire de sortie.');
    }
    return $directory;
}

function resolveTargetFileName(?string $requested, string $sourceName): string
{
    $candidate = trim((string)$requested);
    if ($candidate === '') {
        $base = pathinfo($sourceName, PATHINFO_FILENAME);
        if ($base === '') {
            $base = 'document';
        }
        $candidate = $base . '_' . date('Ymd_His');
    }
    $candidate = preg_replace('~[\\/:*?"<>|]+~', '-', $candidate) ?? $candidate;
    $candidate = trim($candidate, " .");
    if ($candidate === '' || $candidate === '.' || $candidate === '..') {
        $candidate = 'document_' . date('Ymd_His');
    }
    if (strtolower(substr($candidate, -4)) !== '.pdf') {
        $candidate .= '.pdf';
    }
    return $candidate;
}

function ensureUniquePath(string $directory, string $fileName): string
{
    $target = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fileName;
    if (!file_exists($target)) {
        return $target;
    }
    $base = pathinfo($fileName, PATHINFO_FILENAME);
    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
    do {
        $suffix = bin2hex(random_bytes(3));
        $candidate = $base . '_' . $suffix;
        if ($extension !== '') {
            $candidate .= '.' . $extension;
        }
        $target = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $candidate;
    } while (file_exists($target));
    return $target;
}