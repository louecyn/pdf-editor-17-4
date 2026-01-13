<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bibliothèque des classes Questions/Actions</title>
    <link rel="stylesheet" href="assets/css/question-actions-library.css">
</head>
<body class="qa-library">
    <header class="qa-library__header">
        <div>
            <h1>Configurations Questions/Actions</h1>
            <p>Consultez rapidement toutes les classes, ouvrez-les dans le gestionnaire détaillé ou nettoyez les configurations obsolètes.</p>
        </div>
        <div class="qa-library__actions">
            <a class="qa-library__link" href="question_actions_manager.php" target="_blank" rel="noopener">Gestionnaire avancé</a>
            <button type="button" class="qa-library__refresh" data-action="refresh">Actualiser</button>
        </div>
    </header>
    <main class="qa-library__main">
        <section class="qa-library__panel" aria-labelledby="qa-library-panel-title">
            <header class="qa-library__panel-header">
                <h2 id="qa-library-panel-title">Classes disponibles</h2>
                <div class="qa-library__search">
                    <label for="qa-library-search">Rechercher</label>
                    <input type="search" id="qa-library-search" data-role="search" placeholder="Titre, code ou document">
                </div>
            </header>
            <div class="qa-library__feedback" data-role="feedback" hidden></div>
            <ul class="qa-library__list" data-role="list" aria-live="polite"></ul>
            <p class="qa-library__empty" data-role="empty" hidden>Aucune classe ne correspond à la recherche actuelle.</p>
        </section>
    </main>
    <script src="assets/js/question-actions-library.js" defer></script>
</body>
</html>