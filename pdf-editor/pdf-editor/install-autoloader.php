<?php
// install-autoloader.php
// --------------------------------------------------------
// Script d'installation de l'autoloader Composer pour FPDI
// --------------------------------------------------------

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/plain; charset=utf-8');

echo "=== Initialisation de l'installation de l'autoloader ===\n";

$projectRoot = __DIR__;
$composerJson = $projectRoot . '/composer.json';
$autoloadPath = $projectRoot . '/vendor/autoload.php';

if (!is_file($composerJson)) {
    http_response_code(500);
    echo "❌ Fichier composer.json introuvable dans " . $projectRoot . "\n";
    exit(1);
}

if (is_file($autoloadPath)) {
    require_once $autoloadPath;
    if (class_exists(\setasign\Fpdi\Fpdi::class)) {
        echo "✅ L'autoloader Composer est déjà présent et FPDI est disponible.\n";
        exit(0);
    }

    echo "ℹ️ L'autoloader existe mais FPDI est introuvable. Tentative de réinstallation…\n";
}

function commandExists(string $command): bool
{
    $checkCommand = stripos(PHP_OS, 'WIN') === 0 ? 'where ' . $command : 'command -v ' . $command;
    $output = [];
    exec($checkCommand, $output, $exitCode);
    return $exitCode === 0;
}

/**
 * @param array<string, string> $env
 */
function runProcess(string $command, string $cwd, array $env = []): array
{
    $descriptors = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    if ($env === []) {
        $environment = null;
    } else {
        $baseEnv = $_ENV;
        $currentEnv = getenv();
        if (\is_array($currentEnv)) {
            $baseEnv = array_merge($currentEnv, $baseEnv);
        }
        $environment = array_merge($baseEnv, $env);
    }

    $process = proc_open($command, $descriptors, $pipes, $cwd, $environment);

    if (!\is_resource($process)) {
        return ['exitCode' => 1, 'stdout' => '', 'stderr' => "Impossible d'initialiser le processus."];
    }

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);

    return ['exitCode' => $exitCode, 'stdout' => $stdout, 'stderr' => $stderr];
}

$composerHome = $projectRoot . '/var/composer-home';
if (!is_dir($composerHome)) {
    if (!mkdir($composerHome, 0775, true) && !is_dir($composerHome)) {
        http_response_code(500);
        echo "❌ Impossible de créer le dossier COMPOSER_HOME : $composerHome\n";
        exit(1);
    }
}

putenv('COMPOSER_HOME=' . $composerHome);
putenv('HOME=' . $composerHome);
$envOverrides = [
    'COMPOSER_HOME' => $composerHome,
    'HOME' => $composerHome,
];

$commandsToTry = [];

if (commandExists('composer')) {
    $commandsToTry[] = 'composer install --no-dev --optimize-autoloader';
}

if (is_file($projectRoot . '/composer.phar')) {
    $commandsToTry[] = 'php composer.phar install --no-dev --optimize-autoloader';
}

if ($commandsToTry === []) {
    http_response_code(500);
    echo "❌ Impossible de trouver Composer. Installez-le ou placez composer.phar à la racine du projet.\n";
    exit(1);
}

$installSuccessful = false;
foreach ($commandsToTry as $command) {
    echo "▶️ Exécution de : $command\n";
    $result = runProcess($command, $projectRoot, $envOverrides);

    echo $result['stdout'];
    if ($result['stderr'] !== '') {
        echo "[stderr]\n" . $result['stderr'] . "\n";
    }

    if ($result['exitCode'] === 0 && is_file($autoloadPath)) {
        $installSuccessful = true;
        break;
    }
}

if (!$installSuccessful) {
    http_response_code(500);
    echo "❌ L'installation de Composer a échoué. Consultez les messages ci-dessus.\n";
    exit(1);
}

echo "✅ vendor/autoload.php généré avec succès.\n";

require_once $autoloadPath;

if (class_exists(\setasign\Fpdi\Fpdi::class)) {
    echo "🎉 FPDI est maintenant disponible. Le rendu PDF peut fonctionner sans erreur.\n";
    exit(0);
}

echo "⚠️ vendor/autoload.php est présent mais FPDI reste introuvable. Vérifiez vos dépendances.\n";
http_response_code(500);
exit(1);