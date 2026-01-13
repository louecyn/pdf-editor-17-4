<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

if (empty($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Accès refusé.';
    exit;
}

$file = isset($_GET['file']) ? (string)$_GET['file'] : '';
if ($file === '') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Fichier manquant.';
    exit;
}

$elementsDir = __DIR__ . DIRECTORY_SEPARATOR . 'elements';
$normalized = basename($file);
$elementsRealPath = realpath($elementsDir);
$targetPath = $elementsRealPath !== false ? realpath($elementsDir . DIRECTORY_SEPARATOR . $normalized) : false;

if ($elementsRealPath === false || $targetPath === false || strpos($targetPath, $elementsRealPath) !== 0 || !is_file($targetPath)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Fichier introuvable.';
    exit;
}

header('Content-Type: text/plain; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . basename($targetPath) . '"');
header('Content-Length: ' . (string)filesize($targetPath));

readfile($targetPath);
exit;