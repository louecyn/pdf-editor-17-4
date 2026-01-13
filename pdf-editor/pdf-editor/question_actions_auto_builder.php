<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Générateur de sélections automatiques</title>
    <link rel="stylesheet" href="assets/css/question-actions.css">
    <link rel="stylesheet" href="assets/css/question-actions-auto-builder.css">
</head>
<body class="qa-app qa-app--builder">
<?php
    $preloadedRequests = [];
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        require_once __DIR__ . '/pdf-editor/php/pdf_editor_document_utils.php';
        $repository = new DemandeEnLigne\PdfEditor\DocumentRepository(__DIR__ . '/data/requests');
        $preloadedRequests = $repository->listRequests();
    } catch (Throwable $e) {
        $preloadedRequests = [];
    }
?>
    <header class="qa-app__header qa-builder-page__header">
        <div class="qa-app__brand">
            <h1>Assistant Sélections automatiques</h1>
            <p>Débloquez les configurations avancées déclenchées par le bouton « + Créer des sélections automatiques basées sur les clients choisis » et travaillez dans une page complète dédiée.</p>
        </div>
        <div class="qa-app__actions">
            <button type="button" class="qa-btn qa-btn--ghost" data-action="open-walkthrough" title="Lancer le tutoriel interactif">📚</button>
            <button type="button" class="qa-btn" data-action="return-to-qa">Retourner à Questions/Actions</button>
        </div>
    </header>
    <main class="qa-app__main qa-builder-page__main" data-role="builder-scroll">
        <?php include __DIR__ . '/question_actions_auto_builder_content.php'; ?>
    </main>
    <script src="assets/js/question-actions-auto-builder.js" defer></script>
    <script>
        window.addEventListener('DOMContentLoaded', function () {
            if (window.QAAutoBuilder && typeof window.QAAutoBuilder.mount === 'function') {
                const root = document.querySelector('[data-role="auto-builder-root"]');
                if (root) {
                    window.QAAutoBuilder.mount(root, {
                        mode: 'standalone',
                        initialRequests: <?php echo json_encode($preloadedRequests, JSON_UNESCAPED_UNICODE); ?>
                    });
                }
            }
        });
    </script>
</body>
</html>