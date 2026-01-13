<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

require_once __DIR__ . '/../app/Vendor/PdfCompat/PdfCompat.php';

use App\Vendor\PdfCompat\PdfCompat;
use RuntimeException;
use setasign\Fpdi\Fpdi;

/**
 * Service responsable de la génération d'un nouveau PDF à partir d'un document existant
 * et des éléments ajoutés par l'administrateur dans l'éditeur.
 */
final class PdfEditorRenderer
{
    private string $projectRoot;

    private bool $dependenciesLoaded = false;

    public function __construct(string $projectRoot)
    {
        $this->projectRoot = rtrim($projectRoot, DIRECTORY_SEPARATOR);
    }

    /**
     * Génère un nouveau fichier PDF en appliquant les éléments demandés sur le document source.
     *
     * @param string $sourceDocument Chemin absolu du PDF original.
     * @param array<int, array<string, mixed>> $elements Liste des éléments à dessiner.
     * @param string|null $fileName Nom de fichier souhaité pour la sortie (optionnel).
     */
    public function render(string $sourceDocument, array $elements, ?string $fileName = null): string
    {
        $this->loadDependencies();

        if (!is_file($sourceDocument) || !is_readable($sourceDocument)) {
            throw new RuntimeException('Le document source est introuvable ou illisible.');
        }

        $outputDir = $this->getOutputDirectory();
        $targetPath = $this->buildTargetPath($outputDir, $sourceDocument, $fileName);

        $normalizedSource = $this->createNormalizedSource($sourceDocument);

        $pdf = new Fpdi();

        try {
            $pageCount = $pdf->setSourceFile($normalizedSource);
            $elementsByPage = $this->groupElementsByPage($elements);

            for ($pageNumber = 1; $pageNumber <= $pageCount; $pageNumber++) {
                $templateId = $pdf->importPage($pageNumber);
                $size = $pdf->getTemplateSize($templateId);
                $orientation = $size['width'] > $size['height'] ? 'L' : 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);

                $pageIndex = $pageNumber - 1;
                if (!isset($elementsByPage[$pageIndex])) {
                    continue;
                }

                foreach ($elementsByPage[$pageIndex] as $element) {
                    $this->drawElement($pdf, $element);
                }
            }

            $pdf->Output($targetPath, 'F');
        } finally {
            if (is_file($normalizedSource)) {
                @unlink($normalizedSource);
            }
        }

        return $targetPath;
    }

    private function createNormalizedSource(string $sourceDocument): string
    {
        $temporary = tempnam(sys_get_temp_dir(), 'pdfcompat_');
        if ($temporary === false) {
            throw new RuntimeException('Impossible de créer un fichier temporaire pour la normalisation PDF.');
        }

        try {
            PdfCompat::normalizeFile($sourceDocument, $temporary);
        } catch (RuntimeException $e) {
            @unlink($temporary);
            throw $e;
        } catch (\Throwable $e) {
            @unlink($temporary);
            throw $e;
        }

        return $temporary;
    }

    private function loadDependencies(): void
    {
        if ($this->dependenciesLoaded) {
            return;
        }

        $autoload = $this->projectRoot . '/pdf-editor/vendor/autoload.php';
        if (!is_file($autoload)) {
            throw new RuntimeException(
                "Le chargeur automatique des dépendances est introuvable. Exécutez 'composer install' à la racine du projet PDF."
            );
        }

        require_once $autoload;

        if (!class_exists(Fpdi::class)) {
            throw new RuntimeException(
                "La bibliothèque FPDI est requise pour générer les PDF. Veuillez installer les dépendances PHP via 'composer install'."
            );
        }

        $this->dependenciesLoaded = true;
    }

    private function getOutputDirectory(): string
    {
        $dir = $this->projectRoot . '/pdf-editor/output';
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException('Impossible de créer le répertoire de sortie.');
        }
        return $dir;
    }

    private function buildTargetPath(string $outputDir, string $sourceDocument, ?string $fileName): string
    {
        if ($fileName !== null && $fileName !== '') {
            $clean = $this->sanitizeFileName($fileName);
        } else {
            $baseName = pathinfo($sourceDocument, PATHINFO_FILENAME);
            $clean = $baseName . '_' . date('Ymd_His');
        }

        if (substr($clean, -4) !== '.pdf') {
            $clean .= '.pdf';
        }

        $target = $outputDir . DIRECTORY_SEPARATOR . $clean;
        if (is_file($target)) {
            $target = $outputDir . DIRECTORY_SEPARATOR . $this->generateUniqueFileName($clean);
        }

        return $target;
    }

    private function sanitizeFileName(string $fileName): string
    {
        $fileName = preg_replace('~[\\/:*?"<>|]+~', '-', $fileName) ?? $fileName;
        $fileName = trim($fileName);
        if ($fileName === '' || $fileName === '.' || $fileName === '..') {
            return 'document_' . date('Ymd_His');
        }
        return $fileName;
    }

    private function generateUniqueFileName(string $fileName): string
    {
        $random = bin2hex(random_bytes(4));
        $base = pathinfo($fileName, PATHINFO_FILENAME);
        return $base . '_' . $random . '.pdf';
    }

    /**
     * @param array<int, array<string, mixed>> $elements
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function groupElementsByPage(array $elements): array
    {
        $grouped = [];
        foreach ($elements as $element) {
            $page = isset($element['page']) ? (int)$element['page'] : 0;
            $grouped[$page] ??= [];
            $grouped[$page][] = $element;
        }
        return $grouped;
    }

    /**
     * @param array<string, mixed> $element
     */
    private function drawElement(Fpdi $pdf, array $element): void
    {
        $type = $element['type'] ?? null;
        if ($type === 'text') {
            $this->drawText($pdf, $element);
        } elseif ($type === 'signature') {
            $this->drawSignature($pdf, $element);
        }
    }

    /**
     * @param array<string, mixed> $element
     */
    private function drawText(Fpdi $pdf, array $element): void
    {
        $text = (string)($element['text'] ?? '');
        if ($text === '') {
            return;
        }

        $fontFamily = $this->resolveFontFamily((string)($element['fontFamily'] ?? 'Helvetica'));
        $text = $this->prepareTextForFont($text, $fontFamily);
        $fontSize = $this->sanitizeFontSize($element['fontSize'] ?? 14);
        $color = $this->parseColor((string)($element['color'] ?? '#111827'));

        $pdf->SetTextColor($color[0], $color[1], $color[2]);
        $this->applyFont($pdf, $fontFamily, $fontSize);

        $x = $this->pointsToMm((float)($element['x'] ?? 0));
        $yTop = $this->pointsToMm((float)($element['y'] ?? 0));
        $lineHeight = $this->pointsToMm($fontSize * 1.2);
        $lines = preg_split("/\r?\n/", $text) ?: [$text];

        foreach ($lines as $index => $line) {
            $baseline = $yTop + $this->pointsToMm($fontSize) + ($lineHeight * $index);
            $pdf->Text($x, $baseline, (string)$line);
        }
    }

    /**
     * @param array{family: string, file: string|null, isCore: bool} $font
     */
    private function prepareTextForFont(string $text, array $font): string
    {
        if ($text === '') {
            return '';
        }
        if (!$font['isCore']) {
            return $text;
        }

        $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT', $text);
        if ($converted === false) {
            return utf8_decode($text);
        }

        return $converted;
    }

    /**
     * @param array<string, mixed> $element
     */
    private function drawSignature(Fpdi $pdf, array $element): void
    {
        $dataUrl = (string)($element['data'] ?? '');
        if ($dataUrl === '') {
            return;
        }

        $binary = $this->decodeDataUrl($dataUrl);
        if ($binary === null) {
            return;
        }

        $width = max(1.0, $this->pointsToMm((float)($element['width'] ?? 120)));
        $height = max(1.0, $this->pointsToMm((float)($element['height'] ?? 40)));
        $x = $this->pointsToMm((float)($element['x'] ?? 0));
        $y = $this->pointsToMm((float)($element['y'] ?? 0));

        $tempFile = tempnam(sys_get_temp_dir(), 'pdfsig_');
        if ($tempFile === false) {
            throw new RuntimeException('Impossible de créer un fichier temporaire pour la signature.');
        }

        file_put_contents($tempFile, $binary);

        try {
            $pdf->Image($tempFile, $x, $y, $width, $height, 'PNG');
        } finally {
            @unlink($tempFile);
        }
    }

    private function sanitizeFontSize(mixed $value): float
    {
        $size = is_numeric($value) ? (float)$value : 14.0;
        return min(max($size, 6.0), 96.0);
    }

    /**
     * @return array{family: string, file: string|null, isCore: bool}
     */
    private function resolveFontFamily(string $font): array
    {
        $normalized = strtolower($font);
        return match ($normalized) {
            'helvetica', 'arial' => ['family' => 'Helvetica', 'file' => null, 'isCore' => true],
            'dejavusans', 'dejavu sans' => ['family' => 'DejaVuSans', 'file' => 'DejaVuSans.ttf', 'isCore' => false],
            default => ['family' => 'Helvetica', 'file' => null, 'isCore' => true],
        };
    }

    private function applyFont(Fpdi $pdf, array $font, float $fontSize): void
    {
        if ($font['isCore']) {
            $pdf->SetFont($font['family'], '', $fontSize);
            return;
        }

        $fontDir = $this->projectRoot . '/pdf-editor/vendor/fonts';
        $fontPath = $fontDir . '/' . $font['file'];
        if (!is_file($fontPath)) {
            $pdf->SetFont('Helvetica', '', $fontSize);
            return;
        }

        $alias = $font['family'];
        static $registeredFonts = [];
        if (!in_array($alias, $registeredFonts, true)) {
            $pdf->AddFont($alias, '', $font['file']);
            $registeredFonts[] = $alias;
        }
        $pdf->SetFont($alias, '', $fontSize);
    }

    /**
     * @return array{0:int,1:int,2:int}
     */
    private function parseColor(string $color): array
    {
        $color = trim($color);
        if ($color === '') {
            return [0, 0, 0];
        }
        if ($color[0] === '#') {
            $color = substr($color, 1);
        }
        if (strlen($color) === 3) {
            $color = $color[0] . $color[0] . $color[1] . $color[1] . $color[2] . $color[2];
        }
        if (strlen($color) !== 6) {
            return [0, 0, 0];
        }
        return [
            hexdec(substr($color, 0, 2)),
            hexdec(substr($color, 2, 2)),
            hexdec(substr($color, 4, 2)),
        ];
    }

    private function pointsToMm(float $value): float
    {
        return $value * 25.4 / 72.0;
    }

    private function decodeDataUrl(string $dataUrl): ?string
    {
        if (!str_contains($dataUrl, ',')) {
            return null;
        }
        [$meta, $data] = explode(',', $dataUrl, 2);
        if (!str_contains($meta, ';base64')) {
            return null;
        }
        $binary = base64_decode($data, true);
        return $binary === false ? null : $binary;
    }
}