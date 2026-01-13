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
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Création de fonctions</title>
    <link rel="stylesheet" href="assets/css/admin-document-editor.css">
    <link rel="stylesheet" href="assets/css/pdf-editor.css">
    <link rel="stylesheet" href="assets/css/template-editor.css">
    <link rel="stylesheet" href="assets/css/question-actions.css">
    <link rel="stylesheet" href="assets/css/question-actions-auto-builder.css">
    <link rel="stylesheet" href="assets/css/function-creation.css">
</head>
<body class="app app--template app--function-creation">
    <header class="app-header function-creation__header">
        <div class="brand">
            <img src="Multi_Prets_logo_Couleurs.png" alt="Logo Multi-Prêts" class="brand-logo" />
            <div class="brand-text">
                <h1>Création de fonctions</h1>
                <p data-role="mode-description">Importez un nouveau document ou modifiez un modèle existant afin de l’ajouter à votre bibliothèque.</p>
            </div>
        </div>
    </header>

    <main class="app-main template-layout function-creation__layout" role="main">
        <aside class="sidebar template-sidebar">
            <div class="sidebar-scroll">
                <section class="sidebar-block template-actions" aria-labelledby="template-actions-label">
                    <header class="sidebar-header">
                        <h2 id="template-actions-label">Document</h2>
                        <p>Importez ou choisissez votre base avant d’ajouter des configurations.</p>
                    </header>
                    <div class="template-action-buttons">
                        <label class="btn primary template-import" for="template-file-input">📄 Importer un PDF</label>
                        <input id="template-file-input" type="file" accept="application/pdf" hidden>
                        <div class="template-new-group">
                            <button id="template-new" class="btn" type="button">Nouveau modèle</button>
                            <button id="template-choose-existing" class="btn template-choose-existing" type="button">Choisir un autre document existant</button>
                        </div>
                    </div>
                </section>

                <section class="sidebar-block template-metadata" aria-labelledby="template-name-label">
                    <header class="sidebar-header">
                        <h2 id="template-name-label">Informations du modèle</h2>
                        <p>Donnez un titre clair pour retrouver facilement votre document.</p>
                    </header>
                    <label class="template-field">Nom du modèle
                        <input id="template-name" type="text" placeholder="Nom du modèle" autocomplete="off">
                    </label>
                </section>

                <section class="sidebar-block template-capacity" aria-labelledby="template-capacity-title">
                    <header class="sidebar-header">
                        <h2 id="template-capacity-title">Capacité du modèle</h2>
                        <p>Déterminez combien de clients peuvent être traités simultanément.</p>
                    </header>
                    <label class="template-field" for="template-max-clients">Nombre maximal de clients
                        <input id="template-max-clients" type="number" min="1" max="10" step="1" value="1" required>
                    </label>
                    <p class="template-capacity-hint">Si ce nombre est supérieur à&nbsp;1, vous pourrez choisir à quel client attribuer chaque variable lors de son insertion.</p>
                    <button type="button" class="btn" id="template-max-clients-config">Configurer…</button>
                </section>

                <section id="variable-panel" class="sidebar-block variables-panel" aria-label="Variables & valeurs">
                    <header class="sidebar-header">
                        <h2>Variables & valeurs</h2>
                        <button type="button" class="btn-icon" id="client-data-toggle" title="Données des clients sélectionnés" aria-label="Données des clients sélectionnés" hidden>👪</button>
                        <p>Insérez rapidement vos informations personnelles et les variables par défaut.</p>
                    </header>
                    <div id="client-data-mini-panel" class="client-data-mini" hidden>
                        <div class="client-data-mini__actions">
                            <button type="button" class="btn-icon" id="client-data-mini-pin" title="Fixer à l’écran" aria-label="Fixer à l’écran">🔐 <span class="btn-icon__label">Fixer à l’écran</span></button>
                            <button type="button" class="btn-icon" id="client-data-mini-shortcuts" title="Sélectionner les items de raccourci" aria-label="Sélectionner les items de raccourci">⚡︎ <span class="btn-icon__label">Sélectionner les items de raccourci</span></button>
                        </div>
                    </div>
                    <div class="variables-content">
                        <section class="variable-group" data-group="admin">
                            <header class="variable-group-header">
                                <h3>Mes coordonnées</h3>
                                <div class="variable-group-actions">
                                    <button type="button" class="btn-icon" data-variable-action="pin" title="Fixer à l’écran" aria-label="Fixer Mes coordonnées à l’écran">🔐</button>
                                    <button type="button" class="btn-icon" data-variable-action="shortcuts" title="Sélectionner les items de raccourci" aria-label="Sélectionner les items de raccourci" hidden>⚡︎</button>
                                </div>
                            </header>
                            <div class="variable-pin-placeholder" aria-live="polite" hidden>Bloc fixé à l’écran. Cliquez sur ↩ pour le ramener ici.</div>
                            <ul class="variable-list" aria-live="polite"></ul>
                        </section>
                        <section class="variable-group" data-group="fused">
                            <header class="variable-group-header">
                                <h3>Dossier général</h3>
                                <div class="variable-group-actions">
                                    <button type="button" class="btn-icon" data-variable-action="pin" title="Fixer à l’écran" aria-label="Fixer Dossier général à l’écran">🔐</button>
                                    <button type="button" class="btn-icon" data-variable-action="shortcuts" title="Sélectionner les items de raccourci" aria-label="Sélectionner les items de raccourci" hidden>⚡︎</button>
                                </div>
                            </header>
                            <div class="variable-pin-placeholder" aria-live="polite" hidden>Bloc fixé à l’écran. Cliquez sur ↩ pour le ramener ici.</div>
                            <ul class="variable-list" aria-live="polite"></ul>
                        </section>
                        <section class="variable-group" data-group="request">
                            <header class="variable-group-header">
                                <h3>Fiche client (valeurs par défaut)</h3>
                                <div class="variable-group-actions">
                                    <button type="button" class="btn-icon" data-variable-action="pin" title="Fixer à l’écran" aria-label="Fixer Fiche client (valeurs par défaut) à l’écran">🔐</button>
                                    <button type="button" class="btn-icon" data-variable-action="shortcuts" title="Sélectionner les items de raccourci" aria-label="Sélectionner les items de raccourci" hidden>⚡︎</button>
                                </div>
                            </header>
                            <div class="variable-pin-placeholder" aria-live="polite" hidden>Bloc fixé à l’écran. Cliquez sur ↩ pour le ramener ici.</div>
                            <ul class="variable-list" aria-live="polite"></ul>
                        </section>
                    </div>
                </section>
            </div>
        </aside>

        <section class="editor-wrapper template-editor-wrapper">
            <div class="template-editor-toolbar">
                <div class="template-name-stack">
                    <span class="template-toolbar-label">Statut</span>
                    <span data-role="status-indicator">Importez un document pour commencer</span>
                </div>
                <div class="template-toolbar-actions">
                    <button id="template-zoom-out" class="btn" type="button" title="Dézoomer">−</button>
                    <span id="template-zoom-level">100%</span>
                    <button id="template-zoom-in" class="btn" type="button" title="Zoomer">+</button>
                </div>
            </div>
            <div class="editor-canvas template-editor-canvas">
                <div id="template-viewer" class="pdf-viewer" data-empty-state="Importez un PDF pour commencer"></div>
            </div>
            <div id="template-editor-feedback" class="editor-feedback" role="status" aria-live="polite"></div>
        </section>

        <aside class="function-creation__builder-sidebar" aria-label="Configurations et actions automatiques">
            <header class="function-creation__builder-sidebar-header">
                <div>
                    <p class="qa-pill qa-pill--accent">Assistant avancé</p>
                    <h2>Tout configurer depuis le même document.</h2>
                    <p>Ajoutez, dupliquez ou déplacez vos règles directement sur le modèle actif.</p>
                </div>
                <div class="function-creation__builder-primary-actions">
                    <button type="button" class="qa-builder-btn" id="client-data-sidebar-trigger" title="Données des clients sélectionnés" hidden>👪 Données clients</button>
                    <button type="button" class="qa-builder-btn qa-builder-btn--primary" data-action="open-walkthrough">Tutoriel interactif</button>
                    <button id="template-save" class="btn success" type="button">💾 Enregistrer</button>
                </div>
            </header>
            <div class="function-creation__builder-tools" aria-label="Outils d’insertion rapide">
                <button id="template-add-text" class="btn" type="button">Ajouter texte</button>
                <div class="function-creation__signature-group">
                    <button id="template-add-signature" class="btn" type="button">Signer</button>
                    <button id="template-floating-signature-library" type="button" class="btn signature-library-btn">Autres signatures</button>
                </div>
            </div>
            <div class="function-creation__builder-panel">
                <?php include __DIR__ . '/question_actions_auto_builder_content.php'; ?>
            </div>
        </aside>
    </main>

    <div id="template-feedback" class="template-feedback" role="status" aria-live="polite"></div>

    <div id="template-library-dialog" class="template-library-dialog" hidden aria-hidden="true">
        <div class="template-library-dialog__backdrop" data-template-library-action="dismiss"></div>
        <div class="template-library-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="template-library-dialog-title" tabindex="-1">
            <header class="template-library-dialog__header">
                <div class="template-library-dialog__titles">
                    <h2 id="template-library-dialog-title">Bibliothèque de modèles</h2>
                    <p>Choisissez un document existant à modifier ou à inspecter.</p>
                </div>
                <button type="button" class="template-library-dialog__close" data-template-library-action="close" aria-label="Fermer la bibliothèque">×</button>
            </header>
            <aside class="document-list template-library" aria-label="Bibliothèque de modèles" data-view-mode="grid">
                <header class="document-list-header">
                    <div class="template-library-controls">
                        <div class="detail-sort">
                            <label for="template-library-dialog-sort">Classer par&nbsp;:</label>
                            <select id="template-library-dialog-sort" data-template-library-sort>
                                <option value="date">Date (du plus récent au plus ancien)</option>
                                <option value="alpha">Ordre alphabétique</option>
                            </select>
                        </div>
                        <div class="view-toggle-group" role="group" aria-label="Changer l'affichage des modèles">
                            <button type="button" data-template-library-view="grid" aria-pressed="true" title="Afficher les miniatures">🖼️ Vue miniatures</button>
                            <button type="button" data-template-library-view="list" aria-pressed="false" title="Afficher la liste détaillée">☰ Liste détaillée</button>
                        </div>
                    </div>
                </header>
                <div class="template-library-content">
                    <div class="template-library-scroll">
                        <ul id="template-list" class="template-card-list" aria-live="polite"></ul>
                        <p id="template-list-empty" class="template-empty" hidden>Aucun modèle disponible pour le moment.</p>
                    </div>
                </div>
            </aside>
        </div>
    </div>

    <div id="template-client-config" class="template-client-config" hidden aria-hidden="true">
        <div class="template-client-config-backdrop" data-template-config-action="close"></div>
        <div class="template-client-config-panel" role="dialog" aria-modal="true" aria-labelledby="template-client-config-title" tabindex="-1">
            <header class="template-client-config-header">
                <h2 id="template-client-config-title">Jusqu’à combien de clients ce document peut-il traiter&nbsp;?</h2>
            </header>
            <form class="template-client-config-body" id="template-client-config-form">
                <label for="template-client-config-input">Nombre maximal de clients permis</label>
                <input id="template-client-config-input" type="number" min="1" max="10" step="1" value="1" required>
                <p class="template-client-config-hint">Ce paramètre permet d’indiquer, lors de l’insertion d’une variable, quel client (Client&nbsp;1, Client&nbsp;2, etc.) est visé.</p>
                <footer class="template-client-config-footer">
                    <button type="button" class="btn" data-template-config-action="cancel">Annuler</button>
                    <button type="submit" class="btn success">Continuer</button>
                </footer>
            </form>
        </div>
    </div>

    <div id="variable-client-dialog" class="variable-client-dialog" hidden aria-hidden="true">
        <div class="variable-client-dialog-backdrop" data-variable-client-action="cancel"></div>
        <div class="variable-client-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="variable-client-dialog-title" tabindex="-1">
            <header class="variable-client-dialog-header">
                <h2 id="variable-client-dialog-title">À quel client attribuer cette variable&nbsp;?</h2>
                <p class="variable-client-dialog-hint" data-variable-client-hint>Choisissez le client ciblé avant d’insérer la variable dans le document.</p>
            </header>
            <div class="variable-client-dialog-body" data-variable-client-list></div>
            <footer class="variable-client-dialog-footer">
                <button type="button" class="btn" data-variable-client-action="cancel">Annuler</button>
            </footer>
        </div>
    </div>

    <div id="variable-shortcut-dialog" class="variable-shortcut-dialog" hidden aria-hidden="true">
        <div class="variable-shortcut-dialog__backdrop" data-variable-shortcut-action="dismiss"></div>
        <div class="variable-shortcut-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="variable-shortcut-title" tabindex="-1">
            <header class="variable-shortcut-dialog__header">
                <h2 id="variable-shortcut-title">Sélectionner les éléments</h2>
                <div class="variable-shortcut-dialog__header-actions">
                    <button type="button" class="btn-icon" data-variable-shortcut-action="toggle" title="Sélectionner les items de raccourci" aria-label="Sélectionner les items de raccourci">⚡︎</button>
                    <button type="button" class="btn-icon" data-variable-shortcut-action="close" aria-label="Fermer">×</button>
                </div>
            </header>
            <div class="variable-shortcut-dialog__body">
                <p class="variable-shortcut-dialog__hint">Choisissez les éléments à conserver dans le bloc fixé. Cliquez sur les boutons ou encadrez plusieurs éléments pour une sélection rapide.</p>
                <div class="variable-shortcut-dialog__list" data-role="shortcut-list" aria-live="polite"></div>
                <div class="variable-shortcut-dialog__selection" hidden></div>
            </div>
            <footer class="variable-shortcut-dialog__footer">
                <button type="button" class="btn" data-variable-shortcut-action="cancel">Annuler</button>
                <button type="button" class="btn primary" data-variable-shortcut-action="apply">Terminer la sélection et fixer le bloc</button>
            </footer>
        </div>
    </div>

    <template id="template-card-template">
        <li class="template-card">
            <button type="button" class="template-card-button">
                <figure>
                    <div class="template-card-preview">
                        <img alt="" loading="lazy">
                    </div>
                    <figcaption>
                        <span class="template-card-name"></span>
                        <span class="template-card-meta" hidden>
                            <time class="template-card-updated" datetime=""></time>
                            <span class="template-card-size"></span>
                        </span>
                    </figcaption>
                </figure>
            </button>
        </li>
    </template>

    <script>
        window.TEMPLATE_EDITOR_CONFIG = {
            apiBaseUrl: 'admin_document_editor_api.php'
        };
        window.PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="assets/js/question-actions-auto-builder.js" defer></script>
    <script type="module" src="assets/js/template-editor.js"></script>
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