<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Éditeur de PDF – Portail administratif</title>
    <link rel="stylesheet" href="assets/css/admin-document-editor.css">
    <link rel="stylesheet" href="assets/css/pdf-editor.css">
</head>
<body>
    <header class="app-header">
        <div class="brand">
            <img src="Multi_Prets_logo_Couleurs.png" alt="Logo Multi-Prêts" class="brand-logo"/>
            <div class="brand-text">
                <h1>Éditeur de PDF</h1>
                <p>Modifier, signer et exporter vos documents en ligne</p>
            </div>
        </div>
        <div class="app-actions-wrapper">
            <nav class="app-actions" aria-label="Actions principales">
                <button id="open-variable-access" class="btn primary" type="button" aria-haspopup="true" aria-controls="variable-access-popover" aria-expanded="false">Accéder à + de variables</button>
                <button id="add-text" class="btn">Ajouter texte</button>
                <div class="signature-actions">
                    <button id="add-signature" class="btn">Signer</button>
                    <button id="open-signature-library" class="btn signature-library-btn" type="button" hidden>Autres signatures</button>
                </div>
                <button id="toggle-values" class="btn" type="button">Valeurs</button>
                <button id="open-dashboard" class="btn" type="button">Tableau de bord</button>
                <div id="variable-access-popover" class="variable-access-popover" role="dialog" aria-modal="false" aria-labelledby="variable-access-popover-title" aria-hidden="true" hidden>
                    <header class="variable-access-popover__header">
                        <h3 id="variable-access-popover-title">Ajouter une classe de variables</h3>
                        <button type="button" class="variable-access-close" data-action="close-variable-access" aria-label="Fermer">×</button>
                    </header>
                    <p class="variable-access-popover__description">Sélectionnez une classe de variables à ajouter à l’accès rapide.</p>
                    <ul class="variable-access-list" data-role="variable-access-list" aria-live="polite"></ul>
                    <p class="variable-access-empty" data-role="variable-access-empty" hidden>Toutes les classes disponibles sont déjà dans l’accès rapide.</p>
                </div>
            </nav>
            <div id="variable-access-shortcuts" class="variable-access-shortcuts" aria-live="polite" hidden></div>
        </div>
    </header>

    <main class="app-main">
        <aside class="sidebar">
            <div class="sidebar-scroll">
                <section class="sidebar-block">
                    <header class="sidebar-header">
                        <h2>Clients</h2>
                        <div class="search-box">
                            <input type="search" id="customer-search" placeholder="Rechercher un client">
                        </div>
                    </header>
                    <div id="selected-clients" class="selected-clients" hidden>
                        <h3>Clients sélectionnés</h3>
                        <ul aria-live="polite"></ul>
                    </div>
                    <ul id="customers" class="customer-list" aria-live="polite"></ul>
                </section>

                <section id="variable-panel" class="sidebar-block variables-panel" hidden>
                    <header class="sidebar-header">
                        <h2>Variables & valeurs</h2>
                        <button id="collapse-variables" class="collapse-btn" type="button" aria-expanded="true">−</button>
                    </header>
                    <div class="variables-content">
                        <section class="variable-group" data-group="admin">
                            <header><h3>Mes coordonnées</h3></header>
                            <ul class="variable-list" aria-live="polite"></ul>
                        </section>
                        <div id="client-variable-groups" class="client-variable-groups" aria-live="polite"></div>
                    </div>
                </section>

                <section id="document-list" class="document-list" data-view-mode="list" hidden>
                    <header class="document-list-header">
                        <div class="document-list-titles">
                            <div class="document-title-row">
                                <h3>Documents</h3>
                                <div class="document-search" role="search">
                                    <input type="search" id="document-search" placeholder="Rechercher un document">
                                </div>
                            </div>
                            <div id="document-client-tabs" class="document-client-tabs" aria-label="Clients sélectionnés"></div>
                        </div>
                        <div class="document-list-controls">
                            <div class="detail-sort detail-sort--inline">
                                <label for="document-sort">Classer par&nbsp;:</label>
                                <select id="document-sort" data-role="document-sort">
                                    <option value="date">Date (du plus récent au plus ancien)</option>
                                    <option value="alpha">Ordre alphabétique</option>
                                </select>
                            </div>
                            <div class="view-toggle-group document-view-toggle" role="group" aria-label="Changer l'affichage des documents">
                                <button type="button" data-document-view="grid" aria-pressed="false" title="Afficher les miniatures">🖼️ Vue miniatures</button>
                                <button type="button" data-document-view="list" aria-pressed="true" title="Afficher la liste détaillée">☰ Liste détaillée</button>
                            </div>
                            <div class="selection-controls">
                                <button id="clear-document-selection" type="button">Effacer</button>
                            </div>
                        </div>
                    </header>
                    <div class="document-list-body" data-role="document-view-body">
                        <div class="document-view-scroll" data-role="document-view-scroll">
                            <ul aria-live="polite" data-role="document-choices"></ul>
                        </div>
                        <section id="selected-documents" class="selected-documents" hidden>
                            <h4>Documents sélectionnés</h4>
                            <p class="selected-hint">Réorganisez pour définir l'ordre de travail.</p>
                            <ul class="selection-list" aria-live="polite"></ul>
                        </section>
                    </div>
                </section>
            </div>
        </aside>

        <section class="editor-wrapper">
            <div class="editor-toolbar" role="toolbar" aria-label="Outils d'édition">
                <div class="tool-group">
                    <label for="font-family">Police</label>
                    <select id="font-family">
                        <option value="Helvetica">Helvetica</option>
                        <option value="DejaVuSans">DejaVu Sans</option>
                    </select>
                </div>
                <div class="tool-group">
                    <label for="font-size">Taille</label>
                    <input id="font-size" type="number" min="6" max="72" value="10" step="1">
                </div>
                <div class="tool-group tool-history" role="group" aria-label="Historique des modifications">
                    <button id="undo-action" class="btn" type="button" title="Annuler (Ctrl+Z)">↩</button>
                    <button id="redo-action" class="btn" type="button" title="Rétablir (Ctrl+Y)">↪</button>
                </div>
                <div class="tool-group">
                    <button id="zoom-out" class="btn" title="Dézoomer">-</button>
                    <span id="zoom-level">100%</span>
                    <button id="zoom-in" class="btn" title="Zoomer">+</button>
                </div>
                <div class="tool-group tool-save">
                    <button id="toolbar-save" type="button" class="btn success">Sauvegarder</button>
                </div>
            </div>
            <div class="editor-canvas">
                <div id="pdf-viewer" class="pdf-viewer" data-empty-state="Sélectionnez un document pour commencer"></div>
            </div>
        </section>
        <aside id="floating-tools" class="floating-tools" hidden>
            <button id="floating-add-text" type="button" class="btn">Ajouter texte</button>
            <div class="floating-signature-group">
                <button id="floating-add-signature" type="button" class="btn">Signer</button>
                <button id="floating-signature-library" type="button" class="btn signature-library-btn" hidden>Autres signatures</button>
            </div>
            <button id="floating-toggle-values" type="button" class="btn">Valeurs</button>
        </aside>
    </main>

    <template id="customer-item-template">
        <li class="customer-item">
            <button type="button" class="customer-button"></button>
        </li>
    </template>

    <template id="selected-client-template">
        <li>
            <button type="button" class="selected-client-button"></button>
        </li>
    </template>

    <template id="variable-item-template">
        <li>
            <button type="button" class="variable-button"></button>
        </li>
    </template>

    <template id="workspace-template">
        <section class="pdf-workspace" data-doc-key="">
            <header class="pdf-workspace-header">
                <div class="workspace-titles">
                    <h3 data-role="workspace-title"></h3>
                    <p data-role="workspace-client"></p>
                </div>
                <div class="workspace-actions">
                    <button type="button" data-role="workspace-focus" class="btn">Activer</button>
                    <button type="button" data-role="workspace-close" class="btn" aria-label="Fermer">×</button>
                </div>
            </header>
            <div class="pdf-workspace-body">
                <div class="pdf-workspace-canvas"></div>
                <div class="editing-hint" role="status" aria-live="polite"></div>
                <div class="editor-feedback" role="status" aria-live="polite"></div>
            </div>
        </section>
    </template>

    <div id="save-dialog" class="save-dialog" hidden aria-hidden="true">
        <div class="save-dialog-backdrop" data-save-action="cancel"></div>
        <div class="save-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="save-dialog-title" tabindex="-1">
            <header class="save-dialog-header">
                <h2 id="save-dialog-title">Sauvegarder les documents</h2>
                <button type="button" class="save-dialog-close" data-save-action="cancel" aria-label="Fermer">×</button>
            </header>
            <form id="save-form" class="save-dialog-body">
                <section class="save-summary">
                    <h3>Documents sélectionnés</h3>
                    <ul data-role="document-summary"></ul>
                </section>
                <section class="save-option" data-option="existing">
                    <h3>Déposer dans un dossier existant</h3>
                    <p class="save-option-hint">Choisissez un dossier existant pour y déposer les documents.</p>
                    <div data-role="existing-list" class="save-option-list"></div>
                    <p data-role="existing-empty" class="save-option-empty" hidden>Aucun dossier existant trouvé pour le moment.</p>
                </section>
                <section class="save-option" data-option="client">
                    <h3>Déposer dans un dossier client choisi</h3>
                    <p class="save-option-hint">Créez ou utilisez un dossier personnalisé pour ce client (par défaut « Documents générés »).</p>
                    <div data-role="client-list" class="save-option-list"></div>
                    <div class="save-folder-field" data-role="save-folder-field" hidden>
                        <label>
                            <span>Nom du dossier</span>
                            <input type="text" data-role="save-folder-name" placeholder="Documents générés">
                        </label>
                        <p class="save-option-hint">Laissez vide pour utiliser « Documents générés ».</p>
                    </div>
                </section>
                <section class="save-progress" data-role="progress" hidden>
                    <div class="save-progress-bar"><span data-role="progress-bar"></span></div>
                    <p data-role="progress-label">0%</p>
                    <p data-role="progress-message"></p>
                </section>
                <div class="save-feedback" data-role="save-feedback"></div>
                <footer class="save-dialog-footer">
                    <button type="button" class="btn" data-save-action="cancel">Annuler</button>
                    <button type="submit" class="btn success" data-role="submit">Sauvegarder</button>
                </footer>
            </form>
        </div>
    </div>

    <div id="template-generate-dialog" class="template-generate-dialog" hidden aria-hidden="true">
        <div class="template-generate-backdrop" data-template-generate-action="cancel"></div>
        <div class="template-generate-panel" role="dialog" aria-modal="true" aria-labelledby="template-generate-title" tabindex="-1">
            <header class="template-generate-header">
                <h2 id="template-generate-title">Générer un document pré-enregistré</h2>
                <p data-role="template-generate-message"></p>
            </header>
            <div class="template-generate-body">
                <section class="template-generate-section">
                    <h3>Choisissez les clients</h3>
                    <p class="template-generate-hint">Sélectionnez les clients concernés puis réorganisez-les pour définir leur rang.</p>
                    <div class="template-generate-search">
                        <input type="search" data-role="template-generate-search" placeholder="Rechercher un client">
                    </div>
                    <div class="template-generate-columns">
                        <div class="template-generate-column">
                            <h4>Clients disponibles</h4>
                            <ul class="template-generate-list" data-role="template-generate-available" aria-live="polite"></ul>
                            <p class="template-generate-empty" data-role="template-generate-available-empty">Aucun résultat pour cette recherche.</p>
                        </div>
                        <div class="template-generate-column">
                            <h4>Clients sélectionnés</h4>
                            <ol class="template-generate-selected" data-role="template-generate-selected" aria-live="polite"></ol>
                            <p class="template-generate-empty" data-role="template-generate-selected-empty">Aucun client sélectionné pour le moment.</p>
                        </div>
                    </div>
                </section>
                <section class="template-generate-section template-generate-verify" data-role="template-generate-verify" hidden>
                    <h3>Vérification des informations</h3>
                    <p class="template-generate-hint">Vérifiez et mettez à jour les renseignements communs du dossier général qui seront utilisés pour générer le document.</p>
                    <div class="template-conflict-banner" data-role="template-conflict-banner" hidden aria-hidden="true">
                        <button type="button" class="template-conflict-banner__trigger" data-role="template-conflict-trigger" title="Corriger les différences">
                            <span aria-hidden="true">★</span>
                            <span class="template-conflict-banner__label">Corriger</span>
                        </button>
                        <p>Des réponses communes diffèrent entre les clients sélectionnés.</p>
                    </div>
                    <div class="template-conflict-panel" data-role="template-conflict-panel" hidden aria-hidden="true">
                        <div class="template-conflict-panel__card" role="dialog" aria-modal="true" tabindex="-1">
                            <header class="template-conflict-panel__header">
                                <h4>Résolution des réponses communes</h4>
                                <p data-role="template-conflict-message"></p>
                                <button type="button" class="template-conflict-panel__close" data-role="template-conflict-close" aria-label="Fermer">×</button>
                            </header>
                            <div class="template-conflict-panel__body" data-role="template-conflict-list"></div>
                            <footer class="template-conflict-panel__footer">
                                <button type="button" class="btn" data-role="template-conflict-action" data-conflict-action="note">Sauvegarder en note et continuer</button>
                                <button type="button" class="btn danger" data-role="template-conflict-action" data-conflict-action="replace">Remplacer les données et continuer</button>
                            </footer>
                        </div>
                    </div>
                    <div class="template-generate-verify-list" data-role="template-generate-verify-list"></div>
                    <p class="template-generate-empty" data-role="template-generate-verify-empty">Aucun renseignement commun à vérifier pour ce modèle.</p>
                </section>
                <section class="template-generate-section template-generate-questions" data-role="template-generate-questions" hidden>
                    <h3>Questions communes</h3>
                    <p class="template-generate-hint">Répondez aux questions communes du dossier général avant de générer le document.</p>
                    <div class="template-generate-question-list" data-role="template-generate-question-list"></div>
                    <p class="template-generate-empty" data-role="template-generate-question-empty" hidden>Aucune question commune n’est requise pour ce modèle.</p>
                </section>
                <section class="template-generate-section">
                    <h3>Destination du document</h3>
                    <p class="template-generate-hint">Choisissez dans quel dossier client vous souhaitez déposer le document généré.</p>
                    <label class="template-generate-field">Client destinataire
                        <select data-role="template-generate-dest-client"></select>
                    </label>
                    <div class="template-generate-destinations" data-role="template-generate-destinations"></div>
                    <div class="template-generate-folder" data-role="template-destination-folder" hidden>
                        <label>Nom du dossier
                            <input type="text" data-role="template-folder-name" placeholder="Documents générés">
                        </label>
                        <p class="template-generate-hint">Laissez vide pour utiliser « Documents générés ».</p>
                    </div>
                </section>
                <label class="template-generate-download">
                    <input type="checkbox" data-role="template-generate-download">
                    Télécharger le document généré sur mon ordinateur
                </label>
                <div class="template-generate-progress" data-role="template-generate-progress" hidden>
                    <div class="template-generate-progress-track">
                        <div class="template-generate-progress-bar" data-role="template-generate-progress-bar"></div>
                    </div>
                    <div class="template-generate-progress-status">
                        <span class="template-generate-progress-label" data-role="template-generate-progress-label">0%</span>
                        <span class="template-generate-progress-message" data-role="template-generate-progress-message"></span>
                    </div>
                </div>
                <div class="template-generate-feedback" data-role="template-generate-feedback" aria-live="polite"></div>
            </div>
            <footer class="template-generate-footer">
                <button type="button" class="btn" data-template-generate-action="cancel">Annuler</button>
                <button type="button" class="btn success" data-template-generate-action="submit">Générer</button>
            </footer>
        </div>
    </div>

    <div id="folder-browser" class="folder-browser" hidden aria-hidden="true">
        <div class="folder-browser-backdrop" data-folder-action="close"></div>
        <div class="folder-browser-panel" role="dialog" aria-modal="true" aria-labelledby="folder-browser-title" tabindex="-1">
            <header class="folder-browser-header">
                <h2 id="folder-browser-title">Dossier client</h2>
                <div class="folder-browser-header-actions">
                    <button type="button" class="folder-browser-reset" data-folder-action="reset" title="🗘 Effacer la sélection">🗘</button>
                    <button type="button" class="folder-browser-close" data-folder-action="close" aria-label="Fermer">×</button>
                </div>
            </header>
            <div class="folder-browser-body">
                <nav class="folder-browser-tree" aria-label="Arborescence du dossier" data-folder-role="tree"></nav>
                <section class="folder-browser-content">
                    <header class="folder-browser-content-header">
                        <h3 data-folder-role="current-folder"></h3>
                        <p data-folder-role="folder-hint"></p>
                    </header>
                    <ul class="folder-browser-entries" data-folder-role="entries" aria-live="polite"></ul>
                </section>
            </div>
            <footer class="folder-browser-footer">
                <section class="folder-browser-selection" aria-live="polite">
                    <h4>Fichiers sélectionnés</h4>
                    <ul data-folder-role="selection"></ul>
                </section>
                <div class="folder-browser-actions">
                    <button type="button" data-folder-action="cancel">Annuler</button>
                    <button type="button" data-folder-action="submit" class="primary" disabled>Continuer</button>
                </div>
            </footer>
        </div>
    </div>

    <div id="dashboard-modal" class="dashboard-container" hidden aria-hidden="true">
        <div class="dashboard-backdrop" data-dashboard-action="close"></div>
        <div class="dashboard-panel" role="dialog" aria-modal="true" aria-labelledby="dashboard-title" tabindex="-1">
            <header class="dashboard-header">
                <h2 id="dashboard-title">Tableau de bord</h2>
                <button type="button" class="dashboard-close" data-dashboard-action="close" aria-label="Fermer">×</button>
            </header>
            <nav class="dashboard-menu" aria-label="Sections du tableau de bord">
                <button type="button" data-dashboard-section="profile" class="is-active">Mes coordonnées</button>
                <button type="button" data-dashboard-section="prefilled">Obtenir un document pré-enregistré rempli</button>
                <button type="button" data-dashboard-section="fill">Remplir un document pré-enregistré</button>
                <button type="button" data-dashboard-section="register">Pré-enregistrer un document</button>
                <button type="button" data-dashboard-section="manage">Gérer mes documents enregistrés</button>
                <button type="button" data-dashboard-section="edit">Modifier un document créé</button>
                <button type="button" data-dashboard-section="config">Configuration des valeurs</button>
            </nav>
            <div class="dashboard-content">
                <section data-dashboard-panel="profile" class="dashboard-section is-visible">
                    <form id="profile-form">
                        <div class="form-grid">
                            <label>Prénom<input type="text" name="my_first_name"></label>
                            <label>Nom<input type="text" name="my_last_name"></label>
                            <label>Numéro de téléphone<input type="text" name="my_phone_number"></label>
                            <label>Courriel<input type="email" name="my_email"></label>
                            <label>Titre du poste<input type="text" name="my_job_title"></label>
                            <label>Numéro de permis de l’AMF<input type="text" name="my_permit_number"></label>
                            <label>Nom de l’agence<input type="text" name="my_agency_name"></label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn success">Enregistrer</button>
                        </div>
                    </form>
                </section>
                <section data-dashboard-panel="prefilled" class="dashboard-section">
                    <header class="template-section-header">
                        <h3>Obtenir un document pré-enregistré rempli</h3>
                        <p>Sélectionnez un modèle pour générer une version prête à être partagée.</p>
                    </header>
                    <div class="template-library" data-template-section="prefilled" data-view-mode="grid">
                        <div class="template-library-controls">
                            <div class="detail-sort">
                                <label for="template-prefilled-sort">Classer par&nbsp;:</label>
                                <select id="template-prefilled-sort" data-template-sort="prefilled">
                                    <option value="date">Date (du plus récent au plus ancien)</option>
                                    <option value="alpha">Ordre alphabétique</option>
                                </select>
                            </div>
                            <div class="view-toggle-group template-view-toggle" role="group" aria-label="Changer l'affichage des modèles">
                                <button type="button" data-template-view="grid" aria-pressed="true" title="Afficher les miniatures">🖼️ Vue miniatures</button>
                                <button type="button" data-template-view="list" aria-pressed="false" title="Afficher la liste détaillée">☰ Liste détaillée</button>
                            </div>
                        </div>
                        <div class="template-library-content" data-role="template-library-content">
                            <div class="template-library-scroll">
                                <ul class="template-card-list" data-template-role="prefilled-list" aria-live="polite"></ul>
                                <p class="template-empty" data-template-role="prefilled-empty">Aucun modèle n’est encore disponible. Enregistrez-en un dans la section « Pré-enregistrer un document ».</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section data-dashboard-panel="fill" class="dashboard-section">
                    <header class="template-section-header">
                        <h3>Remplir un document pré-enregistré</h3>
                        <p>Choisissez le modèle à compléter avec les informations d’un ou plusieurs clients.</p>
                    </header>
                    <div class="template-library" data-template-section="fill" data-view-mode="grid">
                        <div class="template-library-controls">
                            <div class="detail-sort">
                                <label for="template-fill-sort">Classer par&nbsp;:</label>
                                <select id="template-fill-sort" data-template-sort="fill">
                                    <option value="date">Date (du plus récent au plus ancien)</option>
                                    <option value="alpha">Ordre alphabétique</option>
                                </select>
                            </div>
                            <div class="view-toggle-group template-view-toggle" role="group" aria-label="Changer l'affichage des modèles">
                                <button type="button" data-template-view="grid" aria-pressed="true" title="Afficher les miniatures">🖼️ Vue miniatures</button>
                                <button type="button" data-template-view="list" aria-pressed="false" title="Afficher la liste détaillée">☰ Liste détaillée</button>
                            </div>
                        </div>
                        <div class="template-library-content" data-role="template-library-content">
                            <div class="template-library-scroll">
                                <ul class="template-card-list" data-template-role="fill-list" aria-live="polite"></ul>
                                <p class="template-empty" data-template-role="fill-empty">Aucun modèle enregistré pour le moment.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section data-dashboard-panel="register" class="dashboard-section">
                    <div class="template-register">
                        <div class="template-register-actions">
                            <a class="btn primary" href="template_editor.php" target="_blank" rel="noopener">Ouvrir l’éditeur de documents pré-enregistrés</a>
                            <p>Un nouvel onglet vous permettra d’importer un PDF, de l’annoter puis de l’enregistrer comme modèle réutilisable.</p>
                        </div>
                        <div class="template-register-help">
                            <h3>Comment ça fonctionne ?</h3>
                            <ol>
                                <li>Importez un PDF depuis votre ordinateur.</li>
                                <li>Donnez-lui un nom clair et ajoutez les champs nécessaires.</li>
                                <li>Sauvegardez-le : il apparaîtra automatiquement dans les autres sections.</li>
                            </ol>
                        </div>
                    </div>
                </section>
                <section data-dashboard-panel="manage" class="dashboard-section">
                    <header class="template-section-header">
                        <h3>Gérer mes documents enregistrés</h3>
                        <p>Affichez vos documents pré-enregistrés, ouvrez-les rapidement ou supprimez ceux qui ne sont plus nécessaires.</p>
                    </header>
                    <div class="template-library template-library--manage" data-template-section="manage" data-view-mode="list">
                        <div class="template-library-controls">
                            <div class="detail-sort">
                                <label for="template-manage-sort">Classer par&nbsp;:</label>
                                <select id="template-manage-sort" data-template-sort="manage">
                                    <option value="date">Date (du plus récent au plus ancien)</option>
                                    <option value="alpha">Ordre alphabétique</option>
                                </select>
                            </div>
                            <div class="view-toggle-group template-view-toggle" role="group" aria-label="Changer l'affichage des documents enregistrés">
                                <button type="button" data-template-view="grid" aria-pressed="false" title="Afficher les miniatures">🖼️ Vue miniatures</button>
                                <button type="button" data-template-view="list" aria-pressed="true" title="Afficher la liste détaillée">☰ Liste détaillée</button>
                            </div>
                        </div>
                        <div class="template-library-content" data-role="template-library-content">
                            <div class="template-library-scroll">
                                <ul class="template-card-list" data-template-role="manage-list" aria-live="polite"></ul>
                                <p class="template-empty" data-template-role="manage-empty">Aucun document enregistré pour le moment. Enregistrez vos modèles pour les retrouver rapidement ici.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section data-dashboard-panel="edit" class="dashboard-section">
                    <header class="template-section-header">
                        <h3>Modifier un document créé</h3>
                        <p>Retouchez vos modèles existants pour qu’ils restent à jour.</p>
                    </header>
                    <div class="template-edit-trigger">
                        <button type="button" class="btn" data-template-edit-action="open">Choisir un autre document existant</button>
                    </div>
                    <div class="dashboard-question-actions">
                        <div class="dashboard-question-actions__text">
                            <h4>Modifier les règles de Questions/Actions</h4>
                            <p>Gérez les classes de questions communes et leurs conditions pour les modèles pré-enregistrés.</p>
                        </div>
                        <div class="dashboard-question-actions__buttons">
                            <button type="button" class="btn" data-dashboard-action="open-question-actions">Ouvrir la configuration</button>
                            <a class="btn btn--ghost" href="question_actions_library.php" target="_blank" rel="noopener">Accéder à toutes les configurations/classes</a>
                        </div>
                    </div>
                </section>
                <section data-dashboard-panel="config" class="dashboard-section">
                    <div class="variable-config-panel">
                        <div class="variable-config-controls">
                            <input type="search" data-role="variable-config-search" placeholder="Rechercher une variable">
                            <button type="button" class="btn" data-role="variable-config-add">+ Ajouter</button>
                        </div>
                        <p class="variable-config-helper">Consultez, recherchez et organisez les variables valeurs/désignations disponibles. Utilisez « + Ajouter » pour enrichir le catalogue.</p>
                        <div class="variable-config-list" data-role="variable-config-list" aria-live="polite"></div>
                        <p class="variable-config-empty" data-role="variable-config-empty" hidden>Aucune variable ne correspond à la recherche.</p>
                    </div>
                </section>
            </div>
            <div id="variable-config-dialog" class="dashboard-flyout" hidden aria-hidden="true">
                <form id="variable-config-form" class="dashboard-flyout-card">
                    <h3>Nouvelle variable valeur/désignation</h3>
                    <div class="flyout-field-header">
                        <label>Destination du fichier
                            <select name="groupId" required>
                                <option value="request">Fiche client</option>
                                <option value="fused">Dossier général</option>
                                <option value="admin">Mes coordonnées</option>
                            </select>
                        </label>
                        <button type="button" class="info-button" data-role="variable-config-help" title="Instructions" aria-expanded="false" aria-controls="variable-config-instructions">🛈︎</button>
                    </div>
                    <label>Désignation / phrase complète visible
                        <input type="text" name="label" required placeholder="Libellé pour l'interface">
                    </label>
                    <label>Valeur en codage (générée automatiquement)
                        <input type="text" name="key" readonly required pattern="[A-Za-z0-9_\-\.]+" placeholder="sera générée d'après la désignation">
                    </label>
                    <label>Réponse par défaut (optionnelle)
                        <input type="text" name="defaultValue" placeholder="Valeur initiale si connue">
                    </label>
                    <p class="form-error" data-role="form-error" hidden></p>
                    <div id="variable-config-instructions" class="variable-config-instructions" data-role="variable-config-instructions" hidden>
                        <button type="button" class="variable-config-instructions-close" data-role="variable-config-instructions-close" aria-label="Fermer les instructions">×</button>
                        <div class="variable-config-instructions-body">
                            <p>Utilisez cette fenêtre pour créer une nouvelle variable valeur/désignation disponible partout dans l’éditeur :</p>
                            <ul>
                                <li><strong>Fiche client</strong> ajoute l’information directement dans le fichier <code>request.json</code> du client.</li>
                                <li><strong>Dossier général</strong> classe la valeur dans <code>FusedCustomersFile_request.json</code> et la rend accessible à tous les clients du dossier.</li>
                                <li><strong>Mes coordonnées</strong> enregistre un raccourci personnel dans votre profil administrateur.</li>
                            </ul>
                            <p>La valeur en codage est générée automatiquement d’après la désignation. Chaque désignation et chaque valeur en codage doivent être uniques ; adaptez la formulation si un message d’erreur s’affiche.</p>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn" data-action="cancel-variable-config">Annuler</button>
                        <button type="submit" class="btn success">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <template id="template-card-template">
        <li class="template-card">
            <div class="template-card-surface">
                <button type="button" class="template-card-button" data-role="template-card-primary">
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
                <div class="template-card-actions" data-role="template-card-actions" hidden>
                    <button type="button" class="template-card-action" data-template-command="preview" title="Aperçu du document" aria-label="Aperçu du document">🔎</button>
                    <button type="button" class="template-card-action" data-template-command="edit" title="Modifier dans un nouvel onglet" aria-label="Modifier dans un nouvel onglet">✏️</button>
                    <button type="button" class="template-card-action template-card-action--danger" data-template-command="delete" title="Supprimer ce document" aria-label="Supprimer ce document">✕</button>
                </div>
            </div>
        </li>
    </template>

    <div id="template-edit-picker" class="template-edit-picker" hidden aria-hidden="true">
        <div class="template-edit-picker__backdrop" data-template-edit-action="close"></div>
        <div class="template-edit-picker__panel" role="dialog" aria-modal="true" aria-labelledby="template-edit-picker-title" tabindex="-1">
            <header class="template-edit-picker__header">
                <h3 id="template-edit-picker-title">Choisir un document existant</h3>
                <div class="template-edit-picker__actions">
                    <div class="detail-sort detail-sort--inline" data-template-edit-role="sort-control">
                        <label for="template-edit-sort">Classer par&nbsp;:</label>
                        <select id="template-edit-sort" data-template-edit-role="sort">
                            <option value="date">Date (du plus récent au plus ancien)</option>
                            <option value="alpha">Ordre alphabétique</option>
                        </select>
                    </div>
                    <div class="view-toggle-group template-edit-picker__toggle" role="group" aria-label="Changer l'affichage des modèles enregistrés">
                        <button type="button" data-template-edit-view="grid" aria-pressed="true">🖼️ Vue miniatures</button>
                        <button type="button" data-template-edit-view="list" aria-pressed="false">☰ Liste détaillée</button>
                    </div>
                    <button type="button" class="template-edit-picker__close" data-template-edit-action="close" aria-label="Fermer">×</button>
                </div>
            </header>
            <div class="template-edit-picker__body">
                <p class="template-edit-picker__hint">Sélectionnez le modèle à ouvrir. Vous pouvez afficher la grille d’aperçus ou une liste détaillée.</p>
                <div class="template-edit-picker__views">
                    <div class="template-edit-picker__grid" data-template-edit-view="grid">
                        <ul class="template-card-list" data-template-edit-role="grid-list" aria-live="polite"></ul>
                    </div>
                    <div class="template-edit-picker__list" data-template-edit-view="list" hidden>
                        <ul class="template-edit-picker__details" data-template-edit-role="list-view" aria-live="polite"></ul>
                    </div>
                    <p class="template-edit-picker__empty" data-template-edit-role="empty">Enregistrez un premier modèle pour commencer vos modifications.</p>
                </div>
            </div>
        </div>
    </div>

    <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>

    <script>
        window.PDF_EDITOR_CONFIG = {
            apiBaseUrl: 'admin_document_editor_api.php',
            documentBrowserUrl: 'pdf-editor/php/document_browser.php',
            pdfGeneratorUrl: 'pdf-editor/php/generate_pdf.php',
            uploadUrl: 'pdf-editor/index.php'
        };
        window.PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="assets/js/pdf-editor.js" type="module"></script>
    <script src="assets/js/admin-document-editor.js" type="module"></script>
</body>
</html>