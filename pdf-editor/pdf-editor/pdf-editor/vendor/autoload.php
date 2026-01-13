<?php
/**
 * Lightweight fallback autoloader so that the project works out-of-the-box.
 * When deploying, install the real dependencies with Composer:
 *   composer require setasign/fpdf setasign/fpdi
 */
if (file_exists(__DIR__ . '/composer/autoload_real.php')) {
    require __DIR__ . '/composer/autoload_real.php';
    return;
}

spl_autoload_register(function ($class) {
    $prefixes = [
        'setasign\\Fpdi' => __DIR__ . '/setasign/fpdi/src',
        'FPDF' => __DIR__ . '/setasign/fpdf',
    ];
    foreach ($prefixes as $prefix => $baseDir) {
        if (strpos($class, $prefix) !== 0) {
            continue;
        }
        $relative = substr($class, strlen($prefix));
        $relative = str_replace('\\', '/', $relative);
        $file = rtrim($baseDir, '/') . $relative . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }
});