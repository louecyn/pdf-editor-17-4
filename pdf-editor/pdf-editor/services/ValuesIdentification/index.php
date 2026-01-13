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
require_once __DIR__ . '/paths_helper.php';

$service = new ValuesIdentificationService(dirname(__DIR__, 2));
$dataset = $service->run(true);

$generatedAt = $dataset['generated_at'] ?? date(DATE_ATOM);
$fields = $dataset['fields'] ?? [];
$questions = $dataset['questions'] ?? [];
$responses = $dataset['responses'] ?? [];
$usage = $dataset['usage']['fields'] ?? [];
$unknown = $dataset['usage']['unknown'] ?? [];
$sources = $dataset['usage']['sources'] ?? [];
$rootDir = $dataset['root_dir'] ?? dirname(__DIR__, 2);

$maskedResponseFields = [
    'prenom' => ['label' => 'Prénom code prenom', 'value' => 'code prenom'],
    'nom' => ['label' => 'Nom code nom', 'value' => 'code nom'],
    'dob' => ['label' => 'Date de naissance (AAAA/MM/JJ) code dob', 'value' => 'code dob'],
];

foreach ($maskedResponseFields as $maskedFieldKey => $maskedValues) {
    if (!isset($responses[$maskedFieldKey])) {
        continue;
    }

    $responses[$maskedFieldKey]['options'] = [
        [
            'value' => $maskedValues['value'],
            'label' => $maskedValues['label'],
            'defined' => true,
        ],
    ];
    $responses[$maskedFieldKey]['masked'] = true;
}

$pathGuides = valuesIdentificationBuildPathGuides($dataset);
$requestPaths = $pathGuides['requestPaths'];
$fusedPaths = $pathGuides['fusedPaths'];
$adminPaths = $pathGuides['adminPaths'];

if (!function_exists('vi_format_examples_list')) {
    /**
     * @param array<int, string> $examples
     */
    function vi_format_examples_list(array $examples): string
    {
        $filtered = [];
        foreach ($examples as $example) {
            $value = trim((string) $example);
            if ($value === '') {
                continue;
            }
            $filtered[] = $value;
            if (count($filtered) >= 3) {
                break;
            }
        }
        if ($filtered === []) {
            return '';
        }
        $escaped = array_map(static fn(string $item): string => htmlspecialchars($item, ENT_QUOTES, 'UTF-8'), $filtered);
        $count = count($escaped);
        if ($count === 1) {
            return $escaped[0];
        }
        if ($count === 2) {
            return $escaped[0] . ', et ' . $escaped[1];
        }
        return $escaped[0] . ', ' . $escaped[1] . ', et ' . $escaped[2];
    }
}

if (!function_exists('vi_render_request_note')) {
    /**
     * @param array<string, mixed> $row
     */
    function vi_render_request_note(array $row): string
    {
        $parts = [];
        $note = isset($row['note']) ? trim((string) $row['note']) : '';
        if ($note !== '') {
            $parts[] = htmlspecialchars($note, ENT_QUOTES, 'UTF-8');
        }
        $examples = [];
        if (!empty($row['examples']) && is_array($row['examples'])) {
            $examples = $row['examples'];
        }
        if (($row['key'] ?? '') === 'email') {
            $examples = ['janedoe@gmail.com'];
        }
        $exampleList = vi_format_examples_list($examples);
        if ($exampleList !== '') {
            $parts[] = 'Exemples observés : ' . $exampleList . '.';
        }
        if ($parts === []) {
            return '—';
        }
        return implode(' ', $parts);
    }
}

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>ValuesIdentification</title>
    <style>
        body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background: #f6f8fa; }
        header { background: #1f2937; color: #fff; padding: 24px 32px; }
        header h1 { margin: 0; font-size: 28px; }
        header p { margin: 8px 0 0; color: rgba(255,255,255,0.75); }
        main { padding: 24px 32px 80px; }
        nav { margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
        nav a { text-decoration: none; background: #2563eb; color: #fff; padding: 8px 14px; border-radius: 999px; font-size: 14px; }
        section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
        section h2 { margin-top: 0; }
        .table-wrapper { width: 100%; overflow-x: auto; border-radius: 12px; box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
        table.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; color: #1d2b4f; min-width: 520px; }
        table.data-table thead th { background: linear-gradient(135deg, #1f3c88, #3b82f6); color: #fff; padding: 10px 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        table.data-table tbody td { background: rgba(242, 246, 255, 0.95); padding: 10px 14px; border-bottom: 1px solid rgba(59, 130, 246, 0.22); color: #1d2b4f; vertical-align: top; }
        table.data-table tbody tr:nth-child(even) td { background: rgba(232, 239, 255, 0.95); }
        table.data-table tbody tr:hover td { background: rgba(147, 197, 253, 0.25); }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 16px; }
        .stat { background: #f1f5f9; border-radius: 10px; padding: 16px; }
        .stat strong { font-size: 20px; display: block; margin-bottom: 6px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #e0e7ff; color: #3730a3; font-size: 12px; margin-left: 6px; }
        .meta { color: #64748b; font-size: 13px; }
        ul { margin: 0; padding-left: 20px; }
        .file-links a { display: inline-block; margin-right: 12px; font-size: 13px; }
        .unknown { color: #b91c1c; font-weight: 600; }
        .options-list { margin: 0; padding-left: 18px; }
        .options-list li { margin-bottom: 4px; }
        .options-meta { color: #475569; font-size: 12px; margin-left: 6px; }
        @media (max-width: 768px) {
            header { padding: 20px; }
            main { padding: 20px; }
            table.data-table { min-width: 100%; }
        }
    </style>
</head>
<body>
<header>
    <h1>ValuesIdentification</h1>
    <p>Cartographie dynamique générée le <?php echo htmlspecialchars($generatedAt, ENT_QUOTES, 'UTF-8'); ?>.</p>
</header>
<main>
    <nav>
        <a href="#summary">Synthèse</a>
        <a href="#questions">Questions</a>
        <a href="#values">Valeurs &amp; variables</a>
        <a href="#responses">Réponses</a>
        <a href="#unknown">Champs non référencés</a>
        <a href="#sources">Sources analysées</a>
        <a href="paths.php">Chemins d'analyse</a>
        <a href="dictionary.php">Rechercher dans le dictionnaire</a>
    </nav>

    <p class="meta"><strong>Ressource :</strong> <a href="/services/ValuesIdentification/paths.php">Guide d’appentissage des chemins à utiliser</a></p>

    <section id="summary">
        <h2>Synthèse</h2>
        <div class="stat-grid">
            <div class="stat">
                <strong><?php echo number_format(count($fields), 0, '.', ' '); ?></strong>
                Variables recensées
            </div>
            <div class="stat">
                <strong><?php echo number_format(count($questions), 0, '.', ' '); ?></strong>
                Questions uniques
            </div>
            <div class="stat">
                <strong><?php echo number_format(count($responses), 0, '.', ' '); ?></strong>
                Tables de réponses
            </div>
            <div class="stat">
                <strong><?php echo number_format(count($sources), 0, '.', ' '); ?></strong>
                Dossiers de clients analysés
            </div>
        </div>
        <p class="meta file-links">
            <strong>Fichiers générés :</strong>
            <a href="download.php?file=values.txt">values.txt</a>
            <a href="download.php?file=values-meaning.txt">values-meaning.txt</a>
            <a href="download.php?file=questions.txt">questions.txt</a>
            <a href="download.php?file=questions-meaning.txt">questions-meaning.txt</a>
            <a href="download.php?file=responses.txt">responses.txt</a>
            <a href="download.php?file=responses-meaning.txt">responses-meaning.txt</a>
        </p>
    </section>

    <section id="questions" data-search-group="questions">
        <h2>Questions du formulaire</h2>
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Champ</th>
                        <th>Section</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($fields as $entry):
                    $questionSearch = trim(($entry['label'] ?? '') . ' ' . ($entry['key'] ?? '') . ' ' . ($entry['section'] ?? '') . ' ' . ($entry['type'] ?? ''));
                ?>
                    <tr data-search-text="<?php echo htmlspecialchars($questionSearch, ENT_QUOTES, 'UTF-8'); ?>">
                        <td><?php echo htmlspecialchars($entry['label'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo htmlspecialchars($entry['key'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo htmlspecialchars($entry['section'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo htmlspecialchars($entry['type'], ENT_QUOTES, 'UTF-8'); ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

    <section id="values" data-search-group="values">
        <h2>Valeurs &amp; variables</h2>
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Champ</th>
                        <th>Libellé</th>
                        <th>Section</th>
                        <th>Occurrences</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($fields as $entry):
                    $occurrences = $usage[$entry['key']]['occurrences'] ?? 0;
                    $valueSearch = trim(($entry['key'] ?? '') . ' ' . ($entry['label'] ?? '') . ' ' . ($entry['section'] ?? '') . ' ' . (string)$occurrences . ' ' . ($entry['type'] ?? ''));
                ?>
                    <tr data-search-text="<?php echo htmlspecialchars($valueSearch, ENT_QUOTES, 'UTF-8'); ?>">
                        <td><?php echo htmlspecialchars($entry['key'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo htmlspecialchars($entry['label'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo htmlspecialchars($entry['section'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?php echo number_format($occurrences, 0, '.', ' '); ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

    <section id="responses" data-search-group="responses">
        <h2>Réponses et options</h2>
        <?php foreach ($responses as $fieldKey => $info):
            $optionKeywords = [];
            if (!empty($info['options'])) {
                foreach ($info['options'] as $option) {
                    $optionKeywords[] = (string)($option['value'] ?? '');
                    $optionKeywords[] = (string)($option['label'] ?? '');
                }
            }
            $responseSearch = trim($info['label'] . ' ' . $fieldKey . ' ' . ($info['section'] ?? '') . ' ' . implode(' ', $optionKeywords));
        ?>
            <details data-search-text="<?php echo htmlspecialchars($responseSearch, ENT_QUOTES, 'UTF-8'); ?>">
                <summary>
                    <?php echo htmlspecialchars($info['label'], ENT_QUOTES, 'UTF-8'); ?>
                    <span class="badge"><?php echo htmlspecialchars($fieldKey, ENT_QUOTES, 'UTF-8'); ?></span>
                </summary>
                <?php if (!empty($info['options'])): ?>
                    <ul class="options-list">
                        <?php foreach ($info['options'] as $option): ?>
                            <li>
                                <?php if (!empty($info['masked'])): ?>
                                    <?php echo htmlspecialchars($option['label'], ENT_QUOTES, 'UTF-8'); ?>
                                <?php else: ?>
                                    <strong><?php echo htmlspecialchars($option['value'], ENT_QUOTES, 'UTF-8'); ?></strong>
                                    → <?php echo htmlspecialchars($option['label'], ENT_QUOTES, 'UTF-8'); ?>
                                    <span class="options-meta">
                                        <?php echo ($option['defined'] ?? true) ? 'définie' : 'observée'; ?>
                                        <?php if (isset($option['observed'])): ?>• <?php echo 'usage ' . number_format((int)$option['observed'], 0, '.', ' '); ?><?php endif; ?>
                                    </span>
                                <?php endif; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="meta">Aucune option prédéfinie.</p>
                <?php endif; ?>
            </details>
        <?php endforeach; ?>
    </section>

    <section id="unknown" data-search-group="unknown">
        <h2>Champs non référencés</h2>
        <?php if (!$unknown): ?>
            <p class="meta">Tous les champs des request.json correspondent aux définitions connues.</p>
        <?php else: ?>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Champ</th>
                            <th>Occurrences</th>
                            <th>Exemples de valeurs</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($unknown as $fieldKey => $info):
                        $examples = implode(' ', array_slice(array_keys($info['values']), 0, 5));
                        $unknownSearch = trim($fieldKey . ' ' . $examples);
                    ?>
                        <tr data-search-text="<?php echo htmlspecialchars($unknownSearch, ENT_QUOTES, 'UTF-8'); ?>">
                            <td class="unknown"><?php echo htmlspecialchars($fieldKey, ENT_QUOTES, 'UTF-8'); ?></td>
                            <td><?php echo number_format($info['count'], 0, '.', ' '); ?></td>
                            <td><?php echo htmlspecialchars(implode(', ', array_slice(array_keys($info['values']), 0, 5)), ENT_QUOTES, 'UTF-8'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </section>

    <section id="sources" data-search-group="sources">
        <h2>Sources analysées</h2>
        <p class="meta">Liste des request.json pris en compte pour cette cartographie.</p>
        <ul>
            <?php foreach ($sources as $path):
                $relative = str_replace($rootDir, '', $path);
            ?>
                <li data-search-text="<?php echo htmlspecialchars($relative, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($relative, ENT_QUOTES, 'UTF-8'); ?></li>
            <?php endforeach; ?>
        </ul>
    </section>

    <section id="paths">
        <h2>Chemins d'analyse et correspondances</h2>
        <p>Utilisez cette section pour identifier rapidement la valeur à saisir dans le champ « Chemin request.json à analyser » lors de la configuration des sélections automatiques.</p>

        <article>
            <h3>Données du formulaire (<code>request.json</code>)</h3>
            <p>Ces chemins pointent vers les réponses du formulaire enregistrées dans <code>formData</code>. Pour les sections répétables (adresses, emplois, etc.), remplacez <code>[index]</code> par la position désirée : 0 pour la première occurrence, 1 pour la deuxième, et ainsi de suite.</p>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Champ</th>
                            <th>Section</th>
                            <th>Chemin à analyser</th>
                            <th>Remarques</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($requestPaths as $row): ?>
                        <tr>
                            <td>
                                <strong><?php echo htmlspecialchars($row['label'], ENT_QUOTES, 'UTF-8'); ?></strong><br>
                                <code><?php echo htmlspecialchars($row['key'], ENT_QUOTES, 'UTF-8'); ?></code>
                            </td>
                            <td><?php echo htmlspecialchars($row['section'] ?? '-', ENT_QUOTES, 'UTF-8'); ?></td>
                            <td><code><?php echo htmlspecialchars($row['path'], ENT_QUOTES, 'UTF-8'); ?></code></td>
                            <td><?php echo vi_render_request_note($row); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </article>

        <article>
            <h3>Dossier général (<code>FusedCustomersFile_request.json</code>)</h3>
            <p>Ces valeurs proviennent du dossier général (« fused »). Après synchronisation, elles sont copiées dans <code>request.json</code> sous <code>variables</code>, ce qui permet de les analyser via les sélections automatiques.</p>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Chemin request.json</th>
                            <th>Chemin dossier général</th>
                            <th>Remarques</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($fusedPaths as $row): ?>
                        <tr>
                            <td>
                                <strong><?php echo htmlspecialchars($row['label'], ENT_QUOTES, 'UTF-8'); ?></strong><br>
                                <code><?php echo htmlspecialchars($row['key'], ENT_QUOTES, 'UTF-8'); ?></code>
                            </td>
                            <td><code><?php echo htmlspecialchars($row['request_path'], ENT_QUOTES, 'UTF-8'); ?></code></td>
                            <td><code><?php echo htmlspecialchars($row['file_path'], ENT_QUOTES, 'UTF-8'); ?></code></td>
                            <td><?php echo htmlspecialchars($row['note'], ENT_QUOTES, 'UTF-8'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </article>

        <article>
            <h3>Profil administrateur (<code>data/admin_profile.json</code>)</h3>
            <p>Ces informations proviennent du profil interne. Elles ne sont pas incluses dans les <code>request.json</code> par défaut ; l’utilisation dans des sélections automatiques nécessite une exposition spécifique de ces chemins.</p>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Information</th>
                            <th>Chemin cible envisagé</th>
                            <th>Fichier source</th>
                            <th>Remarques</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($adminPaths as $row): ?>
                        <tr>
                            <td>
                                <strong><?php echo htmlspecialchars($row['label'], ENT_QUOTES, 'UTF-8'); ?></strong><br>
                                <code><?php echo htmlspecialchars($row['key'], ENT_QUOTES, 'UTF-8'); ?></code>
                            </td>
                            <td><code><?php echo htmlspecialchars($row['request_path'], ENT_QUOTES, 'UTF-8'); ?></code></td>
                            <td><?php echo htmlspecialchars($row['file_path'], ENT_QUOTES, 'UTF-8'); ?></td>
                            <td><?php echo htmlspecialchars($row['note'], ENT_QUOTES, 'UTF-8'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </article>
    </section>
</main>
</body>
</html>