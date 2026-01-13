<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Éditeur de documents pré-enregistrés</title>
    <link rel="stylesheet" href="assets/css/admin-document-editor.css">
    <link rel="stylesheet" href="assets/css/pdf-editor.css">
    <link rel="stylesheet" href="assets/css/template-editor.css">
</head>
<body class="app app--template">
    <header class="app-header">
        <div class="brand">
            <img src="Multi_Prets_logo_Couleurs.png" alt="Logo Multi-Prêts" class="brand-logo" />
            <div class="brand-text">
                <h1>Éditeur de modèles PDF</h1>
                <p data-role="mode-description">Importez, personnalisez et enregistrez vos documents maîtres en quelques clics.</p>
            </div>
        </div>
        <nav class="app-actions" aria-label="Actions principales">
            <label class="btn primary template-import" for="template-file-input">📄 Importer un PDF</label>
            <input id="template-file-input" type="file" accept="application/pdf" hidden>
            <div class="template-new-group">
                <button id="template-new" class="btn" type="button">Nouveau modèle</button>
                <button id="template-choose-existing" class="btn template-choose-existing" type="button">Choisir un autre document existant</button>
            </div>
            <button id="template-add-text" class="btn" type="button">Ajouter texte</button>
            <button id="template-add-signature" class="btn" type="button">Signer</button>
            <button id="template-save" class="btn success" type="button">💾 Enregistrer</button>
        </nav>
    </header>

    <main class="app-main template-layout" role="main">
        <aside class="sidebar template-sidebar">
            <div class="sidebar-scroll">
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
                        <p>Insérez rapidement vos informations personnelles et les variables par défaut.</p>
                    </header>
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

        <aside class="template-mini-panel" aria-label="Questions/Actions">
            <section class="question-action-panel" id="question-action-panel" aria-labelledby="question-action-title">
                <header class="question-action-panel__header">
                    <div class="question-action-panel__titles">
                        <h4 id="question-action-title">Questions/Actions</h4>
                        <p>Ajoutez des classes de questions pour enrichir les informations recueillies lors du remplissage d’un modèle.</p>
                    </div>
                    <div class="question-action-panel__actions">
                        <button type="button" class="btn" data-question-action="create-class">Nouvelle classe</button>
                        <button type="button" class="btn primary" data-question-action="open-manager">Modifier les règles…</button>
                    </div>
                </header>
                <p class="question-action-panel__hint">Sélectionnez les classes pertinentes. Les points noirs indiquent les classes actives pour ce modèle.</p>
                <div class="question-action-panel__list" data-role="question-class-list" aria-live="polite"></div>
                <p class="question-action-panel__empty" data-role="question-class-empty" hidden>Aucune classe disponible pour le moment. Créez-en une pour définir de nouvelles règles Questions/Actions.</p>
            </section>
        </aside>
        <aside id="template-floating-tools" class="floating-tools template-floating-tools" aria-label="Outils rapides">
            <button id="template-floating-add-text" type="button" class="btn">Ajouter texte</button>
            <div class="floating-signature-group">
                <button id="template-floating-add-signature" type="button" class="btn">Signer</button>
                <button id="template-floating-signature-library" type="button" class="btn signature-library-btn is-visible">Autres signatures</button>
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
    <script type="module" src="assets/js/template-editor.js"></script>
</body>
</html>