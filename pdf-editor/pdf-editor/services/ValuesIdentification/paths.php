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
$pathGuides = valuesIdentificationBuildPathGuides($dataset);
$requestPaths = $pathGuides['requestPaths'];
$fusedPaths = $pathGuides['fusedPaths'];
$adminPaths = $pathGuides['adminPaths'];

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

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Chemins d'analyse request.json</title>
    <style>
        body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background: #f6f8fa; }
        header { background: #1f2937; color: #fff; padding: 24px 32px; }
        header h1 { margin: 0; font-size: 28px; }
        header p { margin: 8px 0 0; color: rgba(255,255,255,0.75); }
        main { padding: 24px 32px 80px; }
        nav { margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
        nav a { text-decoration: none; background: #2563eb; color: #fff; padding: 8px 14px; border-radius: 999px; font-size: 14px; }
        section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
        .legend-card { border-left: 6px solid #2563eb; background: #eef2ff; color: #111827; box-shadow: 0 8px 18px rgba(79, 70, 229, 0.2); }
        .warning-card { border-left: 6px solid #f97316; background: #fff7ed; color: #7c2d12; box-shadow: 0 8px 18px rgba(249, 115, 22, 0.2); }
        .warning-card .section-heading h2 { color: #7c2d12; }
        .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .section-heading h2 { margin: 0; font-size: 22px; }
        .toggle-btn { border: none; border-radius: 999px; padding: 6px 16px; font-size: 13px; cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease; background: #1f2937; color: #fff; }
        .legend-card .toggle-btn { background: #2563eb; }
        .warning-card .toggle-btn { background: #f97316; color: #fff; }
        .toggle-btn:hover { opacity: 0.9; }
        .collapsible-content[hidden], .collapsible-content.is-hidden { display: none; }
        .legend-card p { margin-bottom: 12px; line-height: 1.55; }
        .legend-list { margin: 0 0 16px 0; padding-left: 20px; }
        .legend-example { background: rgba(37, 99, 235, 0.1); border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
        .warning-card .legend-example { background: rgba(249, 115, 22, 0.12); }
        .legend-example strong { display: block; margin-bottom: 6px; }
        section h2 { margin-top: 0; }
        .table-wrapper { width: 100%; overflow-x: auto; border-radius: 12px; box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
        table.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; color: #1d2b4f; min-width: 520px; }
        table.data-table thead th { background: linear-gradient(135deg, #1f3c88, #3b82f6); color: #fff; padding: 10px 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        table.data-table tbody td { background: rgba(242, 246, 255, 0.95); padding: 10px 14px; border-bottom: 1px solid rgba(59, 130, 246, 0.22); color: #1d2b4f; vertical-align: top; }
        table.data-table tbody tr:nth-child(even) td { background: rgba(232, 239, 255, 0.95); }
        table.data-table tbody tr:hover td { background: rgba(147, 197, 253, 0.25); }
        .search-bar { background: #fff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; box-shadow: 0 8px 18px rgba(15,23,42,0.08); display: flex; flex-direction: column; gap: 8px; }
        .search-bar label { font-weight: 600; color: #1f2937; }
        .search-bar input { max-width: 360px; padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(37, 99, 235, 0.35); font-size: 14px; }
        .search-hint { margin: 0; color: #475569; font-size: 13px; }
        .empty-message { margin-top: 12px; font-size: 13px; color: #475569; font-style: italic; }
        @media (max-width: 768px) {
            header { padding: 20px; }
            main { padding: 20px; }
            table.data-table { min-width: 100%; }
            .search-bar input { width: 100%; }
        }
    </style>
</head>
<body>
<header>
    <h1>Chemins d'analyse</h1>
    <p>Guide généré le <?php echo htmlspecialchars($generatedAt, ENT_QUOTES, 'UTF-8'); ?> pour les sélections automatiques.</p>
</header>
<main>
    <section class="legend-card" id="legend" data-search-group="legend">
        <div class="section-heading">
            <h2>Comment lire les chemins</h2>
            <button type="button" class="toggle-btn" data-toggle-target="legend-content" aria-expanded="true">Cacher</button>
        </div>
        <div id="legend-content" class="collapsible-content">
            <p>Un « chemin » est une suite de mots séparés par des points qui permet de dire « va chercher cette information précise dans le fichier ».</p>
            <ul class="legend-list">
                <li><strong><code>formData</code></strong> signifie « commence par la grande boîte qui contient les réponses du formulaire ».</li>
                <li><strong><code>variables</code></strong> signifie « va voir les valeurs calculées automatiquement après l’envoi ».</li>
                <li><strong>Le point <code>.</code></strong> agit comme une flèche qui te fait ouvrir une nouvelle sous-boîte. Par exemple, <code>formData.identite.nom</code> veut dire « ouvre <code>formData</code>, puis la partie <code>identite</code>, puis lis <code>nom</code> ».</li>
                <li><strong><code>[index]</code></strong> est une case à remplir avec un nombre pour pointer une entrée dans une liste&nbsp;: <code>0</code> pour la première, <code>1</code> pour la deuxième, etc.</li>
            </ul>
            <div class="legend-example">
                <strong>Exemple 1&nbsp;: choisir une adresse précise</strong>
                <p>Chemin&nbsp;: <code>formData.adresses[0].ville</code><br>
                Explication&nbsp;: commence dans <code>formData</code>, ouvre la liste <code>adresses</code>, prends la première entrée (<code>[0]</code>) et lis la propriété <code>ville</code>. Cela renvoie la ville de la première adresse.</p>
            </div>
            <div class="legend-example">
                <strong>Exemple 2&nbsp;: travailler avec un tableau répétable</strong>
                <p>Chemin&nbsp;: <code>formData.actifs_add[1].description</code><br>
                Explication&nbsp;: la section « Actifs » peut contenir plusieurs éléments. Avec <code>[1]</code>, on choisit le deuxième actif et on récupère son texte <code>description</code>. S’il n’y a qu’un seul actif, utilisez <code>[0]</code>.</p>
            </div>
            <div class="legend-example">
                <strong>Exemple 3&nbsp;: lire une valeur calculée</strong>
                <p>Chemin&nbsp;: <code>variables.rapport.score_global</code><br>
                Explication&nbsp;: la zone <code>variables</code> rassemble les informations générées automatiquement. Ici on demande le <code>score_global</code> du rapport calculé après l’analyse.</p>
            </div>
            <p>Si un champ demande d’écrire « Tableau répétable. Utilisez formData.actifs_add.[index] », cela veut dire : remplacez <code>[index]</code> par 0, 1, 2… selon l’élément que tu veux viser. Si tu inscris un numéro qui n’existe pas encore, le système ne trouvera rien (comme chercher un tiroir vide).</p>
            <p>Quand tu vois « Utilisez formData.adresses.[index] », applique la même logique : <code>formData.adresses[0]</code> est la première adresse, <code>formData.adresses[1]</code> la seconde, etc. Tu peux ensuite ajouter <code>.champ</code> pour préciser l’information voulue, par exemple <code>.code_postal</code> pour le code postal.</p>
            <p>Pour les notes qui disent « [index] par la position (0 pour la première entrée) », retiens simplement que l’on compte à partir de zéro. Imagine une rangée de cases numérotées 0, 1, 2… Tu choisis la case qui contient la donnée à utiliser.</p>
            <p>Tu peux combiner plusieurs niveaux pour décrire un chemin complet. Par exemple, pour trouver le prénom principal inscrit au formulaire : <code>formData.prenom</code>. Si tu veux viser une information répétée, ajoute la position correspondante, comme <code>formData.adresses[1].code_postal</code> pour le code postal de la deuxième adresse.</p>
            <p>En résumé : écris exactement les mots du chemin, remplace chaque <code>[index]</code> par le numéro qui correspond à la position désirée, et ajoute le nom du champ final. Le système ira chercher précisément cette information dans le fichier.</p>
        </div>
    </section>

    <section class="warning-card" id="caution">
        <div class="section-heading">
            <h2>Attention&nbsp;: à ne pas faire</h2>
            <button type="button" class="toggle-btn" data-toggle-target="caution-content" aria-expanded="true">Cacher</button>
        </div>
        <div id="caution-content" class="collapsible-content">
            <p>Pour éviter les erreurs, imagine que tu suis une carte. Chaque symbole compte et il faut le recopier exactement comme ça l'est indiqué pour trouver le bon code attitré.</p>
            <ul class="legend-list">
                <li><strong>Ne change jamais l’orthographe.</strong> Si la carte dit <code>formData.type_demande</code>, n’ajoute pas d’espace et ne remplace pas les accents. Sinon, le système cherchera un mauvais tiroir.</li>
                <li><strong>Ne retire pas <code>formData.</code> ou <code>variables.</code>.</strong> Ces mots disent par où commencer la recherche. Sans eux, c’est comme partir sans avoir de plan ni map, ça prend ça initialement pour diriger ta configuration pour qu'elle puisse être capable d'aller chercher la bonne donnée au bon endroit à travers ton système.</li>
                <li><strong>Respecte les crochets <code>[ ]</code>.</strong> Ils servent à dire « prends l’élément numéro X ». Parfois il y a des éléments qui peuvent avoir multiples options et ce # que tu va inscrire va aller indiquer à ton système lequel choisir. Comme par exemple si le client a plusieurs actifs, tu dois inscrire lequel des actifs, est-ce le 1er, le 2e ou autre? Le 1er sera dentifié par le chiffre [0], [1] sera le 2e actif puis [2] sera le 3e actif que le client a indiqué. Sans crochet ou avec un mauvais chiffre, on reçoit une réponse vide.</li>
            </ul>
            <div class="legend-example">
                <strong>Erreur fréquente n°1&nbsp;: orthographe modifiée</strong>
                <p>Écrire <code>formData.Type_Demande</code> avec des majuscules ou des espaces ne fonctionnera pas. Il faut écrire exactement <code>formData.type_demande</code> pour obtenir la valeur du type de demande.</p>
            </div>
            <div class="legend-example">
                <strong>Erreur fréquente n°2&nbsp;: indice oublié</strong>
                <p>Si tu souhaites récupérer le deuxième actif additionnel, n’oublie pas le numéro : <code>formData.actifs_add[1].description</code>. Sans le <code>[1]</code>, le système ne saura pas quel actif choisir.</p>
            </div>
            <p>Astuce&nbsp;: quand tu n’es pas certain du numéro à employer, ouvre ton document à travers la section ''Modifier un dcument créé'' du Tableau de bord Éditeur de PDF pour voir les configurations existantes sur ton document. Et tu peux aussi aller ouvrir des fiches clients dans le Dashboard du portail admin où tu retrouveras ta base de données de clients. Sélectionne le client de ton choix, clique sur le bouton ''Voir les renseignements'' et va vérifier combien il y en a de l'élément que tu recherches. Note-les pour ne pas te tromper.</p>
            <p>Résumé facile&nbsp;: recopier le chemin du code, vérifier chaque point et chaque crochet, et rercherchez rapidement des éléments en inscrivant ce que vous cherchez dans la barre de recherche avec la loupe ci-dessous pour être sûr de viser la bonne donnée.</p>
        </div>
    </section>

    <nav>
        <a href="index.php">Retour à ValuesIdentification</a>
        <a href="#form-paths">Données du formulaire</a>
        <a href="#fused-paths">Dossier général</a>
        <a href="#admin-paths">Profil administrateur</a>
    </nav>

    <div class="search-bar">
        <label for="table-search">Rechercher un chemin</label>
        <input id="table-search" type="search" placeholder="Ex. type_demande, adresse, revenus" data-table-search>
        <p class="search-hint">Tape un mot&nbsp;: seuls les éléments qui le contiennent resteront visibles dans les tableaux.</p>
    </div>

    <section id="form-paths" data-search-scope>
        <h2>Données du formulaire (<code>request.json</code>)</h2>
        <p>Utilisez ces chemins pour renseigner « Chemin request.json à analyser ». Pour les tableaux répétables, remplacez <code>[index]</code> par la position voulue (0 pour la première entrée).</p>
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
        <p class="empty-message" hidden>Aucun élément du formulaire ne correspond à la recherche pour le moment.</p>
    </section>

    <section id="fused-paths" data-search-scope>
        <h2>Dossier général (<code>FusedCustomersFile_request.json</code>)</h2>
        <p>Ces variables sont copiées dans <code>request.json → variables</code> après synchronisation du dossier général.</p>
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
        <p class="empty-message" hidden>Aucune donnée du dossier général ne correspond à cette recherche.</p>
    </section>

    <section id="admin-paths" data-search-scope>
        <h2>Profil administrateur (<code>data/admin_profile.json</code>)</h2>
        <p>Informations internes non exposées dans les <code>request.json</code> par défaut. Leur utilisation requiert un développement spécifique.</p>
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
        <p class="empty-message" hidden>Aucune information administrateur ne correspond pour l’instant.</p>
    </section>
</main>
<script>
document.querySelectorAll('[data-toggle-target]').forEach(function (button) {
    button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-toggle-target');
        var target = document.getElementById(targetId);
        if (!target) {
            return;
        }
        var isHidden = target.hasAttribute('hidden') || target.classList.contains('is-hidden');
        if (isHidden) {
            target.removeAttribute('hidden');
            target.classList.remove('is-hidden');
            button.setAttribute('aria-expanded', 'true');
            button.textContent = 'Cacher';
        } else {
            target.setAttribute('hidden', 'hidden');
            target.classList.add('is-hidden');
            button.setAttribute('aria-expanded', 'false');
            button.textContent = 'Voir';
        }
    });
});

var searchInput = document.querySelector('[data-table-search]');
if (searchInput) {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
    searchInput.addEventListener('input', function () {
        var query = searchInput.value.trim().toLowerCase();
        scopes.forEach(function (section) {
            var rows = section.querySelectorAll('tbody tr');
            var emptyMessage = section.querySelector('.empty-message');
            var visibleCount = 0;
            rows.forEach(function (row) {
                var text = row.textContent || '';
                var matches = query === '' || text.toLowerCase().indexOf(query) !== -1;
                row.style.display = matches ? '' : 'none';
                if (matches) {
                    visibleCount++;
                }
            });
            if (emptyMessage) {
                emptyMessage.hidden = visibleCount !== 0;
            }
        });
    });
}
</script>
</body>
</html>