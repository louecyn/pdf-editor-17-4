<?php
// install-libs.php
// --------------------------------------------------------
// Script d’installation automatique de FPDF et FPDI
// --------------------------------------------------------

error_reporting(E_ALL);
ini_set('display_errors', 1);

$vendorDir = __DIR__ . '/vendor';
$fpdfDir = $vendorDir . '/setasign/fpdf';
$fpdiDir = $vendorDir . '/setasign/fpdi';

function downloadAndExtract($url, $dest)
{
    $zipPath = $dest . '.zip';
    file_put_contents($zipPath, file_get_contents($url));

    $zip = new ZipArchive();
    if ($zip->open($zipPath) === true) {
        $zip->extractTo($dest);
        $zip->close();
        unlink($zipPath);
        echo "✅ Extraction réussie dans: $dest\n";
    } else {
        echo "❌ Erreur: impossible d’extraire $url\n";
    }
}

// Crée les dossiers nécessaires
@mkdir($vendorDir, 0777, true);
@mkdir(__DIR__ . '/vendor/setasign', 0777, true);

// Téléchargement de FPDF et FPDI depuis GitHub
echo "📦 Téléchargement de FPDF...\n";
downloadAndExtract('https://github.com/setasign/fpdf/archive/refs/heads/master.zip', $fpdfDir);

echo "📦 Téléchargement de FPDI...\n";
downloadAndExtract('https://github.com/Setasign/FPDI/archive/refs/heads/master.zip', $fpdiDir);

echo "✅ Installation terminée !\n";
echo "👉 Tes librairies sont prêtes dans le dossier /vendor/setasign\n";
?>
