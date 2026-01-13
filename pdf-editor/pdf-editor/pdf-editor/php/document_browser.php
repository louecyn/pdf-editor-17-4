<?php
declare(strict_types=1);

use DemandeEnLigne\PdfEditor\DocumentRepository;

require_once __DIR__ . '/pdf_editor_document_utils.php';

header('Content-Type: application/json; charset=utf-8');

function sanitize_documents(array $documents): array {
    return array_map(static function ($doc) {
        unset($doc['absolutePath']);
        return $doc;
    }, $documents);
}

function sanitize_document(array $doc): array {
    unset($doc['absolutePath']);
    return $doc;
}

$repo = new DocumentRepository(dirname(__DIR__, 2) . '/data/requests');
$request = $_GET['request'] ?? '';

try {
    if ($request !== '') {
        $documents = sanitize_documents($repo->listDocuments($request));
        echo json_encode(['data' => $documents]);
    } else {
        $requests = $repo->listRequests();
        echo json_encode(['data' => $requests]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}