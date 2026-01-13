<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    if (empty($_SESSION['admin']) || $_SESSION['admin'] !== true) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Accès refusé.';
        exit;
    }
}

require_once __DIR__ . '/ValuesIdentification.php';

$service = new ValuesIdentificationService(dirname(__DIR__, 2));
$dataset = $service->run(true);

$generatedAt = $dataset['generated_at'] ?? date(DATE_ATOM);
$fields = $dataset['fields'] ?? [];

$entries = array_values($fields);

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Rechercher dans le dictionnaire</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background: #f6f8fa; }
        header { background: #1f2937; color: #fff; padding: 24px 32px; }
        header h1 { margin: 0; font-size: 28px; }
        header p { margin: 8px 0 0; color: rgba(255,255,255,0.75); }
        main { padding: 24px 32px 80px; }
        nav { margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
        nav a { text-decoration: none; background: #2563eb; color: #fff; padding: 8px 14px; border-radius: 999px; font-size: 14px; }
        .search-panel { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
        .search-panel h2 { margin: 0 0 12px; font-size: 20px; color: #0f172a; }
        .search-panel p { margin: 0 0 16px; font-size: 14px; color: #475569; }
        .search-control { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #dbe2f1; border-radius: 999px; background: #f8fafc; box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08); }
        .search-control:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18); background: #fff; }
        .search-icon { color: #2563eb; font-size: 18px; }
        .search-input { flex: 1; border: none; background: transparent; font-size: 15px; color: #0f172a; }
        .search-input:focus { outline: none; }
        .search-input::placeholder { color: #94a3b8; }
        .table-wrapper { width: 100%; overflow-x: auto; border-radius: 12px; box-shadow: 0 6px 18px rgba(15,23,42,0.08); background: #fff; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; color: #1d2b4f; min-width: 640px; }
        thead th { background: linear-gradient(135deg, #1f3c88, #3b82f6); color: #fff; padding: 10px 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        tbody td { background: rgba(242, 246, 255, 0.95); padding: 12px 14px; border-bottom: 1px solid rgba(59, 130, 246, 0.22); vertical-align: top; }
        tbody tr:nth-child(even) td { background: rgba(232, 239, 255, 0.95); }
        tbody tr.filtered-out { display: none; }
        details { font-size: 12px; }
        details summary { cursor: pointer; color: #2563eb; }
        pre { margin: 8px 0 0; padding: 12px; background: #0f172a; color: #f8fafc; border-radius: 8px; overflow-x: auto; }
        .meta { font-size: 13px; color: #475569; margin-bottom: 24px; }
        @media (max-width: 768px) {
            header { padding: 20px; }
            main { padding: 20px; }
            .search-panel { padding: 20px; }
            .search-control { flex-wrap: wrap; border-radius: 16px; }
            .search-input { width: 100%; font-size: 14px; }
            table { min-width: 100%; }
        }
    </style>
</head>
<body>
<header>
    <h1>Rechercher dans le dictionnaire</h1>
    <p>Catalogue généré le <?php echo htmlspecialchars($generatedAt, ENT_QUOTES, 'UTF-8'); ?>.</p>
</header>
<main>
    <nav>
        <a href="index.php">Retour à ValuesIdentification</a>
    </nav>

    <section class="search-panel" aria-labelledby="dictionary-search-title">
        <h2 id="dictionary-search-title">Recherche entonnoir</h2>
        <p>Inscrivez quelques lettres ou un mot-clé pour filtrer rapidement tous les codes et définitions correspondants.</p>
        <div class="search-control">
            <span class="search-icon" aria-hidden="true">&#128269;</span>
            <input type="search" id="dictionary-search" name="dictionary-search" class="search-input" placeholder="Ex. prenom, adresse, repeatable..." autocomplete="off" />
        </div>
    </section>

    <p class="meta">Le dictionnaire présente chaque champ tel que défini dans le formulaire, incluant son code, son libellé, sa section et les paramètres détaillés de configuration.</p>

    <div class="table-wrapper">
        <table aria-describedby="dictionary-search-title">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Libellé</th>
                    <th>Section</th>
                    <th>Type</th>
                    <th>Parent</th>
                    <th>Définition</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($entries as $entry):
                $definition = $entry['definition'] ?? [];
                $definitionJson = json_encode($definition, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
                $searchPayload = trim(($entry['key'] ?? '') . ' ' . ($entry['label'] ?? '') . ' ' . ($entry['section'] ?? '') . ' ' . ($entry['type'] ?? '') . ' ' . ($entry['parent'] ?? '') . ' ' . $definitionJson);
            ?>
                <tr data-search-text="<?php echo htmlspecialchars($searchPayload, ENT_QUOTES, 'UTF-8'); ?>">
                    <td><?php echo htmlspecialchars($entry['key'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($entry['label'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($entry['section'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($entry['type'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($entry['parent'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                    <td>
                        <?php if ($definitionJson !== ''): ?>
                        <details>
                            <summary>Voir la définition</summary>
                            <pre><?php echo htmlspecialchars($definitionJson, ENT_QUOTES, 'UTF-8'); ?></pre>
                        </details>
                        <?php else: ?>
                        <em>Non disponible</em>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</main>
<script>
(function () {
    var input = document.getElementById('dictionary-search');
    if (!input) {
        return;
    }

    var normalize = function (value) {
        return (value || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    var rows = Array.prototype.slice.call(document.querySelectorAll('tbody tr[data-search-text]'));

    var applyFilter = function () {
        var term = normalize(input.value || '');
        rows.forEach(function (row) {
            var source = row.getAttribute('data-search-text') || '';
            var match = !term || normalize(source).indexOf(term) !== -1;
            row.classList.toggle('filtered-out', !match);
        });
    };

    var handleEvent = function (event) {
        if (event && event.type === 'keydown' && event.key === 'Enter') {
            event.preventDefault();
            applyFilter();
            return;
        }

        applyFilter();
    };

    input.addEventListener('input', handleEvent);
    input.addEventListener('change', handleEvent);
    input.addEventListener('search', handleEvent);
    input.addEventListener('keydown', handleEvent);

    applyFilter();
})();
</script>
</body>
</html>