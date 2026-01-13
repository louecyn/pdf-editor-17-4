<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bibliothèque des configurations Questions/Actions</title>
    <link rel="stylesheet" href="assets/css/question-actions.css">
    <link rel="stylesheet" href="assets/css/question-actions-library.css">
</head>
<body class="qa-library-app">
    <header class="qa-library__header">
        <div>
            <h1>Configurations Questions/Actions</h1>
            <p>Consultez, ouvrez et supprimez les classes enregistrées pour tous les modèles.</p>
        </div>
        <div class="qa-library__actions">
            <a class="qa-btn qa-btn--ghost" href="question_actions_manager.php" rel="noopener">Retour à l'éditeur</a>
        </div>
    </header>
    <main class="qa-library__main">
        <section class="qa-library" aria-live="polite">
            <div class="qa-library__toolbar">
                <label class="qa-library__search">
                    <span class="sr-only">Rechercher une classe</span>
                    <input type="search" placeholder="Rechercher par titre, code ou document" data-role="search">
                </label>
                <div class="qa-library__toolbar-actions">
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="refresh">Actualiser</button>
                    <span class="qa-library__counter" data-role="counter"></span>
                </div>
            </div>
            <p class="qa-library__feedback" data-role="feedback" hidden></p>
            <div class="qa-library__list" data-role="list"></div>
        </section>
    </main>
    <script type="module" src="assets/js/question-actions-library.js"></script>
</body>
</html>