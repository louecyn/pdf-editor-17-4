
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Modifier les règles Questions/Actions</title>
    <link rel="stylesheet" href="assets/css/question-actions.css">
</head>
<body class="qa-app">
    <header class="qa-app__header">
        <div class="qa-app__brand">
            <h1>Questions/Actions</h1>
            <p>Créez et gérez les classes de questions utilisées par les modèles pré-enregistrés.</p>
        </div>
        <div class="qa-app__actions">
            <button type="button" class="qa-btn qa-btn--ghost" data-action="open-tutorial" data-tutorial-id="intro:tutorial" title="Tutoriel interactif Questions/Actions" data-help="Lance le tutoriel interactif mis à jour pour explorer chaque outil : navigation des classes, blocs réutilisables, sélections automatiques et nouveautés de l’éditeur.">📚</button>
            <button type="button" class="qa-btn" data-action="reload" data-help="Recharge et synchronise les classes Questions/Actions disponibles (dernières sauvegardes, partages d’équipe, favoris et éléments masqués).">Actualiser</button>
            <button type="button" class="qa-btn qa-btn--primary" data-action="new-class" title="Créer une nouvelle configuration en cliquant ici" data-help="Créer une nouvelle configuration en cliquant ici. Préparez-y vos questions, blocs, coordonnées et règles automatiques.">Nouvelle classe</button>
            <a class="qa-btn qa-btn--ghost" href="question_actions_library.php" rel="noopener" data-help="Ouvre la bibliothèque complète des configurations pour les consulter, les épingler, les masquer ou les supprimer rapidement.">Accéder à toutes les configurations/classes</a>
            <a class="qa-btn qa-btn--ghost" href="/services/ValuesIdentification/index.php" target="_blank" rel="noopener" data-help="Ouvre la cartographie des valeurs (guide complet pour visualiser les champs disponibles et leurs correspondances dans les documents).">Cartographie des valeurs</a>
        </div>
        <div class="qa-app__document" data-role="document-summary" hidden aria-hidden="true" tabindex="-1">
            <span class="qa-app__document-label">Document actif :</span>
            <strong class="qa-app__document-name" data-role="document-name"></strong>
            <button type="button" class="qa-btn qa-btn--ghost" data-action="change-document">Changer</button>
        </div>
    </header>
    <main class="qa-app__main">
        <aside class="qa-sidebar" aria-label="Classes de Questions/Actions" data-role="qa-sidebar">
            <section class="qa-sidebar__document" aria-labelledby="qa-sidebar-document-title">
                <header class="qa-sidebar__document-header">
                    <h2 id="qa-sidebar-document-title">Sélectionner un document</h2>
                    <p>Choisissez un modèle pré-enregistré à gérer ou importez-en un nouveau.</p>
                </header>
                <div class="qa-sidebar__document-field">
                    <label for="qa-sidebar-document-select">Ouvrir un document</label>
                    <div class="qa-sidebar__document-controls">
                        <select id="qa-sidebar-document-select" data-role="document-select"></select>
                        <button type="button" class="qa-btn qa-btn--primary" data-action="document-open">Ouvrir</button>
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="document-refresh" title="Actualiser la liste des documents" aria-label="Actualiser la liste des documents">⟳</button>
                    </div>
                    <p class="qa-sidebar__document-empty" data-role="document-empty" hidden>Aucun document n’est disponible pour le moment. Importez un nouveau modèle pour commencer.</p>
                </div>
                <button type="button" class="qa-btn qa-btn--ghost qa-sidebar__document-import" data-action="document-import">Importer un document</button>
            </section>
            <header class="qa-sidebar__header">
                <div>
                    <h2>Configurations existantes</h2>
                    <p class="qa-sidebar__hint">Consultez les exemples pour reproduire rapidement vos scénarios.</p>
                </div>
                <div class="qa-sidebar__header-actions">
                    <button type="button" class="qa-btn qa-btn--ghost qa-sidebar__library" data-action="open-config-library" title="Afficher toutes les configurations sauvegardées" data-help="Affiche la bibliothèque des configurations enregistrées avec aperçu, filtres (favoris, masquées) et rappels pour reproduire chaque scénario.">🔎</button>
                    <button type="button" class="qa-btn qa-btn--ghost qa-sidebar__collapse" data-action="collapse-sidebar" title="Masquer la liste" aria-label="Masquer la liste des configurations">◀</button>
                </div>
            </header>
            <div class="qa-sidebar__search">
                <input type="search" data-role="class-search" placeholder="Rechercher une classe (nom ou code)">
            </div>
            <ul class="qa-class-list" data-role="class-list" aria-live="polite"></ul>
            <p class="qa-class-empty" data-role="class-empty" hidden>Aucune classe créée pour le moment.</p>
        </aside>
        <button type="button" class="qa-sidebar__reveal" data-action="reveal-sidebar" hidden aria-label="Afficher la liste des configurations">▶</button>
        <section class="qa-editor" aria-live="polite">
            <div class="qa-editor__placeholder" data-role="editor-placeholder">
                <h2>Sélectionnez une classe</h2>
                <p>Choisissez une classe existante ou créez-en une nouvelle pour définir ses questions et ses blocs de réponses.</p>
            </div>
            <form class="qa-form" data-role="class-form" hidden>
                <header class="qa-form__header">
                    <div>
                        <h2 data-role="form-title">Nouvelle classe</h2>
                        <p data-role="form-subtitle"></p>
                        <p class="qa-form__document" data-role="document-context">Sélectionnez un document pour commencer.</p>
                    </div>
                    <div class="qa-form__header-actions">
                        <button type="button" class="qa-btn" data-action="duplicate-class" hidden data-help="Crée une copie complète de la configuration active (questions, blocs, sélections automatiques et coordonnées) pour préparer une variante par produit ou province.">Dupliquer</button>
                        <button type="button" class="qa-btn qa-btn--danger" data-action="delete-class" hidden data-help="Supprime définitivement la configuration Questions/Actions, y compris ses règles automatiques et ses favoris associés.">Supprimer</button>
                    </div>
                </header>
                <input type="hidden" name="id" data-role="class-id">
                <div class="qa-form__tabs" data-role="qa-tabs">
                    <button type="button" class="qa-tab is-active" data-role="qa-tab" data-tab="questions" aria-pressed="true" data-visibility="requires-class" hidden data-help="Ouvre la construction détaillée des questions, blocs réutilisables et catégories dynamiques de la configuration active.">Questions &amp; réponses</button>
                    <button type="button" class="qa-tab" data-role="qa-tab" data-tab="auto" aria-pressed="false" data-visibility="requires-class" hidden data-help="Accède aux sélections automatiques liées aux données clients (conditions, valeurs insérées et coordonnées dynamiques).">Sélections automatiques</button>
                </div>
                <div class="qa-grid">
                    <label class="qa-field">Titre de la classe
                        <input type="text" name="title" data-role="class-title" required>
                    </label>
                    <label class="qa-field qa-field--code">Code interne (généré automatiquement)
                        <div class="qa-code-display is-empty" data-role="class-code-display" aria-live="polite">
                            Saisissez un titre pour générer le code interne.
                        </div>
                        <input type="hidden" name="code" data-role="class-code" required>
                    </label>
                </div>
                <label class="qa-field">Description
                    <textarea name="description" data-role="class-description" rows="3" placeholder="Précisez l’objectif de la classe et les documents concernés"></textarea>
                </label>
                <section class="qa-section" data-tab-panel="questions">
                    <header class="qa-section__header">
                        <div>
                            <h3>Questions</h3>
                            <p>Définissez les questions à poser lors de l’obtention ou du remplissage d’un modèle pré-enregistré.</p>
                        </div>
                        <div class="qa-section__header-actions">
                            <button type="button" class="qa-btn qa-btn--ghost" data-action="add-question" data-help="Ajoute une nouvelle question avec ses coordonnées, options et dépendances. Idéal pour couvrir les étapes de préparation ou les vérifications terrain.">Ajouter une question</button>
                            <button type="button" class="qa-btn qa-btn--ghost" data-action="open-auto-builder" data-help="Ouvre l’assistant pas à pas pour bâtir des sélections automatiques à partir des renseignements déjà collectés auprès du client (le système regroupe cette fiche de réponses sous le nom « request.json »). L’outil explique chaque étape : choisir les critères, proposer les insertions automatiques et valider la règle avant de l’enregistrer. Exemples de codes à utiliser : formData.adresses[0].ville — la ville principale du client; formData.date_limite_precise — la date limite de son projet; formData.emplois[0].position — le poste associé à son premier emploi. <a href=&quot;/services/ValuesIdentification/paths.php&quot; target=&quot;_blank&quot; rel=&quot;noopener&quot;>Clique ici pour voir le lexique du guide d’apprentissage des codes à utiliser</a>.">+ Créer des sélections automatiques basées sur les clients choisis</button>
                        </div>
                    </header>
                    <div class="qa-question-list" data-role="question-list"></div>
                    <p class="qa-hint">Les identifiants générés permettent de réutiliser les réponses, de définir des dépendances et d’associer des coordonnées.</p>
                </section>
                <section class="qa-section" data-tab-panel="questions">
                    <header class="qa-section__header">
                        <div>
                            <h3>Blocs de réponses</h3>
                            <p>Préparez des ensembles de réponses réutilisables lors du remplissage d’un modèle.</p>
                        </div>
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="add-blob" data-help="Crée un bloc de réponses réutilisable (avec coordonnées et notes) pour accélérer la préparation de documents répétitifs.">Créer un bloc</button>
                    </header>
                    <div class="qa-blob-list" data-role="blob-list"></div>
                    <p class="qa-hint">Les blocs peuvent être sélectionnés lors de la préparation d’un document pour accélérer la saisie.</p>
                </section>
                <section class="qa-section" data-tab-panel="auto" hidden>
                    <header class="qa-section__header">
                        <div>
                            <h3>Sélections automatiques</h3>
                            <p>Créez des règles basées sur les données des clients pour ajouter automatiquement des éléments lors de la modification d’un document.</p>
                        </div>
                        <div class="qa-section__header-actions">
                            <button type="button" class="qa-btn qa-btn--ghost qa-btn--icon" data-action="open-auto-faq" title="Afficher la FAQ des sélections automatiques" data-help="Affiche le rappel complet sur les sélections automatiques (conditions, valeurs dynamiques, exemples et lien vers le Guide d’appentissage des chemins à utiliser : /services/ValuesIdentification/paths.php).">🗫</button>
                            <button type="button" class="qa-btn qa-btn--primary" data-action="add-auto-selection" data-help="Ajoute une nouvelle règle automatique avec condition, valeur insérée et coordonnées. Convient pour insérer des textes, cocher des cases ou gérer des sections dynamiques.">+ Ajouter une sélection</button>
                </div>
                    </header>
                    <div class="qa-auto-list" data-role="auto-list"></div>
                    <p class="qa-hint">Les sélections automatiques utilisent les informations du fichier <code>request.json</code> des clients choisis pour insérer ou mettre à jour des éléments dans le document.</p>
                </section>
                <div class="qa-form__feedback" data-role="form-feedback" role="status" aria-live="polite" hidden></div>
                <footer class="qa-form__actions">
                    <button type="button" class="qa-btn" data-action="cancel-edit" data-help="Annule les modifications en cours et recharge la configuration publiée (questions, blocs, sélections automatiques).">Annuler</button>
                    <button type="submit" class="qa-btn qa-btn--primary" data-help="Enregistre la configuration complète : questions, blocs, sélections automatiques, coordonnées dynamiques et favoris associés.">Enregistrer</button>
                </footer>
            </form>
        </section>
    </main>

    <template id="qa-question-template">
        <article class="qa-question" data-question>
            <header class="qa-question__header">
                <div>
                    <h4 data-role="question-title">Question</h4>
                    <p data-role="question-id"></p>
                </div>
                <div class="qa-question__actions">
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="move-up" title="Remonter" data-help="Remonte la question pour ajuster l’ordre du questionnaire (groupes thématiques, étapes chronologiques).">↑</button>
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="move-down" title="Descendre" data-help="Descend la question afin de regrouper les étapes similaires ou de placer les options facultatives à la fin.">↓</button>
                    <button type="button" class="qa-btn qa-btn--danger" data-action="delete-question" title="Supprimer" data-help="Supprime la question ainsi que ses coordonnées, options et dépendances associées.">Supprimer</button>
                </div>
            </header>
            <div class="qa-grid qa-grid--questions">
                <label class="qa-field">Intitulé de la question
                    <input type="text" data-question-field="label" required>
                </label>
                <label class="qa-field">Coordonnée principale
                    <div class="qa-field__coordinate">
                        <input type="text" data-question-field="coordinate" placeholder="Ex. Page 3 – Section B">
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="pick-coordinate" data-coordinate-context="question" data-help="Place la question sur le document via le sélecteur PDF (supporte les modèles importés, zoom et coordonnées sauvegardées).">Choisir sur le document</button>
                    </div>
                </label>
                <label class="qa-field">Type de question
                    <select data-question-field="type">
                        <option value="dot">Points (sélection unique)</option>
                        <option value="choice">Choix multiples</option>
                        <option value="open">Réponse ouverte</option>
                        <option value="auto">Remplissage automatique</option>
                    </select>
                </label>
                <div class="qa-field qa-field--checkbox">
                    <label>
                        <input type="checkbox" data-question-field="required">
                        Obligatoire
                    </label>
                </div>
                <label class="qa-field">Code interne (généré automatiquement)
                    <input type="text" data-question-field="code" placeholder="Généré par le système" readonly>
                </label>
            </div>
            <label class="qa-field">Notes internes
                <textarea data-question-field="notes" rows="2" placeholder="Ajoutez un contexte pour l’équipe ou précisez les coordonnées secondaires."></textarea>
            </label>
            <div class="qa-question__options" data-role="question-options" hidden>
                <header class="qa-subheader">
                    <div>
                        <h5>Options</h5>
                        <p>Associez une coordonnée et des règles à chaque option.</p>
                    </div>
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="add-option" data-help="Ajoute une option supplémentaire avec sa coordonnée et ses valeurs automatiques (utile pour les cases à cocher, choix multiples, signatures).">Ajouter une option</button>
                </header>
                <div class="qa-option-list" data-role="option-list"></div>
                <div class="qa-field qa-field--checkbox">
                    <label>
                        <input type="checkbox" data-question-field="allow-multiple">
                        Autoriser plusieurs réponses
                    </label>
                </div>
            </div>
            <div class="qa-question__auto" data-role="question-auto" hidden>
                <header class="qa-subheader">
                    <h5>Remplissage automatique</h5>
                    <p>Définissez où récupérer la valeur automatiquement.</p>
                </header>
                <div class="qa-grid qa-grid--auto">
                    <label class="qa-field">Source des données
                        <select data-question-field="auto-source">
                            <option value="request">Fiche client (request.json)</option>
                            <option value="fused">Informations communes du dossier</option>
                            <option value="admin">Mes coordonnées</option>
                        </select>
                    </label>
                    <label class="qa-field">Chemin ou clé
                        <input type="text" data-question-field="auto-path" placeholder="Ex. formData.adresses[0].ville">
                    </label>
                    <label class="qa-field">Valeur alternative (facultatif)
                        <input type="text" data-question-field="auto-fallback" placeholder="Valeur utilisée si aucune information n’est trouvée">
                    </label>
                </div>
            </div>
            <div class="qa-question__advanced" data-role="question-advanced">
                <header class="qa-subheader">
                    <div>
                        <h5>Paramètres avancés</h5>
                        <p>Préparez les variables, catégories et blocs dynamiques associés à cette question.</p>
                    </div>
                </header>
                <div class="qa-question-advanced__storage">
                    <label class="qa-field">Destination des réponses
                        <select data-question-advanced="storage-target">
                            <option value="none">Sans enregistrement automatique</option>
                            <option value="request">Fiche client (request.json)</option>
                            <option value="fused">Dossier général (valeurs communes)</option>
                            <option value="admin">Variables administratives</option>
                        </select>
                    </label>
                    <label class="qa-field">Clé ou variable associée
                        <div class="qa-field__picker">
                            <input type="text" data-question-advanced="storage-key" placeholder="Ex. dossier.informations.complementaires">
                            <button type="button" class="qa-btn qa-btn--ghost" data-action="browse-storage-variable" title="Explorer les variables disponibles">Parcourir</button>
                        </div>
                    </label>
                </div>
                <section class="qa-question-advanced__categories" data-role="question-categories">
                    <header class="qa-subheader qa-subheader--minor">
                        <div>
                            <h6>Catégories de réponse & coordonnées</h6>
                            <p>Associez des coordonnées distinctes selon la catégorie choisie lorsque la réponse est fournie.</p>
                        </div>
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="add-category" data-help="Ajoute une catégorie avec ses coordonnées dédiées pour adapter l'affichage selon la réponse (par page, par profil client, etc.).">Ajouter une catégorie</button>
                    </header>
                    <div class="qa-category-list" data-role="category-list"></div>
                    <p class="qa-hint">Chaque catégorie peut contenir plusieurs coordonnées qui seront utilisées selon la sélection effectuée lors du remplissage.</p>
                </section>
                <section class="qa-question-advanced__note" data-role="question-note">
                    <header class="qa-subheader qa-subheader--minor">
                        <div>
                            <h6>Bloc de notes facultatif</h6>
                            <p>Activez un espace libre que l’utilisateur pourra compléter au besoin. Il sera ignoré s’il reste vide.</p>
                        </div>
                    </header>
                    <div class="qa-note-grid">
                        <label class="qa-field qa-field--checkbox">
                            <input type="checkbox" data-question-advanced="note-enabled">
                            Activer le bloc de notes facultatif
                        </label>
                        <label class="qa-field">Titre affiché
                            <input type="text" data-question-advanced="note-title" placeholder="Ex. Notes complémentaires">
                        </label>
                        <label class="qa-field">Coordonnée du bloc
                            <div class="qa-field__coordinate">
                                <input type="text" data-question-advanced="note-coordinate" placeholder="Ex. Page 5 – Observations">
                                <button type="button" class="qa-btn qa-btn--ghost" data-action="pick-coordinate" data-coordinate-context="note" data-help="Associe le bloc de notes à une zone du document (annotation, consigne interne, rappel de vérification).">Choisir sur le document</button>
                            </div>
                        </label>
                        <label class="qa-field">Instructions pour l’utilisateur
                            <textarea data-question-advanced="note-placeholder" rows="2" placeholder="Ex. Ajoutez des précisions concernant la situation"></textarea>
                        </label>
                    </div>
                </section>
                <section class="qa-question-advanced__library" data-role="question-library">
                    <header class="qa-subheader qa-subheader--minor">
                        <div>
                            <h6>Bibliothèque de réponses sauvegardées</h6>
                            <p>Permet de sélectionner ou d’enregistrer des textes réutilisables pour les futurs documents.</p>
                        </div>
                    </header>
                    <div class="qa-library-grid">
                        <label class="qa-field qa-field--checkbox">
                            <input type="checkbox" data-question-advanced="library-enabled">
                            Autoriser une bibliothèque de réponses
                        </label>
                        <label class="qa-field">Identifiant de la bibliothèque
                            <input type="text" data-question-advanced="library-key" placeholder="Ex. confirmations_signature">
                        </label>
                        <label class="qa-field">Libellé proposé à l’utilisateur
                            <input type="text" data-question-advanced="library-label" placeholder="Ex. Sélectionnez une réponse sauvegardée">
                        </label>
                        <label class="qa-field">Entrées proposées par défaut (une par ligne)
                            <textarea data-question-advanced="library-defaults" rows="3" placeholder="Nom de l’entrée : texte à insérer"></textarea>
                        </label>
                        <label class="qa-field qa-field--checkbox">
                            <input type="checkbox" data-question-advanced="library-allow-save">
                            Autoriser l’ajout et la sauvegarde de nouvelles réponses
                        </label>
                    </div>
                </section>
            </div>
        </article>
    </template>

    <template id="qa-option-template">
        <article class="qa-option" data-option>
            <header class="qa-option__header">
                <h6>Option</h6>
                <button type="button" class="qa-btn qa-btn--danger" data-action="delete-option" title="Supprimer" data-help="Retire ce choix de réponse, ses coordonnées et ses règles automatiques associées.">Supprimer</button>
            </header>
            <div class="qa-grid qa-grid--options">
                <label class="qa-field">Libellé
                    <input type="text" data-option-field="label" required>
                </label>
                <label class="qa-field">Coordonnée
                    <div class="qa-field__coordinate">
                        <input type="text" data-option-field="coordinate" placeholder="Ex. Page 4 – section D">
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="pick-coordinate" data-coordinate-context="option" data-help="Associe cette option à une position précise du document (cases à cocher, tableaux, signatures multiples).">Choisir sur le document</button>
                    </div>
                </label>
                <label class="qa-field">Valeur à enregistrer
                    <input type="text" data-option-field="value" placeholder="Valeur associée">
                </label>
                <div class="qa-field qa-field--checkbox">
                    <label>
                        <input type="checkbox" data-option-field="required">
                        Choix obligatoire
                    </label>
                </div>
            </div>
            <label class="qa-field">Questions déclenchées (séparer par des virgules)
                <input type="text" data-option-field="follow-ups" placeholder="Identifiants des questions activées">
            </label>
            <label class="qa-field">Chemin automatique (facultatif)
                <input type="text" data-option-field="auto-path" placeholder="Remplissage automatique si la donnée est disponible">
            </label>
        </article>
    </template>

    <template id="qa-blob-template">
        <article class="qa-blob" data-blob>
            <header class="qa-blob__header">
                <div>
                    <h5>Bloc de réponses</h5>
                    <p data-role="blob-id"></p>
                </div>
                <button type="button" class="qa-btn qa-btn--danger" data-action="delete-blob" title="Supprimer" data-help="Supprime ce bloc de réponses réutilisable et retire les favoris qui y étaient liés.">Supprimer</button>
            </header>
            <div class="qa-grid qa-grid--blobs">
                <label class="qa-field">Nom du bloc
                    <input type="text" data-blob-field="label" required>
                </label>
                <label class="qa-field">Code interne
                    <input type="text" data-blob-field="code" placeholder="Ex. BLOC_SIGNATURES">
                </label>
            </div>
            <label class="qa-field">Description
                <textarea data-blob-field="description" rows="2" placeholder="Ex. Réponses standard pour un dossier résidentiel."></textarea>
            </label>
            <label class="qa-field">Réponses prédéfinies (JSON)
                <textarea data-blob-field="answers" rows="4" placeholder='Ex. {"questionId":"valeur"} ou liste détaillée'></textarea>
            </label>
        </article>
    </template>

    <template id="qa-auto-selection-template">
        <article class="qa-auto-selection" data-auto-selection>
            <header class="qa-auto-selection__header">
                <div>
                    <h4 data-role="auto-title">Sélection automatique</h4>
                    <p data-role="auto-id"></p>
                </div>
                <div class="qa-auto-selection__actions">
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="auto-move-up" title="Remonter" data-help="Place la règle plus haut pour qu'elle s'exécute avant les conditions générales ou les valeurs de secours.">↑</button>
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="auto-move-down" title="Descendre" data-help="Décale la règle plus bas afin de laisser les priorités ou exceptions s'exécuter avant elle.">↓</button>
                    <button type="button" class="qa-btn qa-btn--danger" data-action="auto-delete" title="Supprimer" data-help="Supprime la sélection automatique ainsi que ses coordonnées dynamiques et métadonnées.">Supprimer</button>
                </div>
            </header>
            <div class="qa-grid qa-grid--auto-selection">
                <label class="qa-field">Nom de la règle
                    <input type="text" data-auto-field="label" required>
                </label>
                <label class="qa-field">Coordonnée d’insertion
                    <div class="qa-field__coordinate">
                        <input type="text" data-auto-field="coordinate" placeholder="Ex. Page 2 – Signature">
                        <button type="button" class="qa-btn qa-btn--ghost" data-action="pick-coordinate" data-coordinate-context="auto" data-help="Choisit l'emplacement d'insertion de la règle automatique (texte, coche, note) directement sur le PDF.">Choisir sur le document</button>
                    </div>
                </label>
                <label class="qa-field">Chemin request.json à analyser
                    <input type="text" data-auto-field="request-path" placeholder="formData.adresses[0].ville" required>
                </label>
                <label class="qa-field">Condition
                    <select data-auto-field="condition-type">
                        <option value="contains">Contient les termes</option>
                        <option value="not_contains">Ne contient pas les termes</option>
                        <option value="equals">Est exactement égal</option>
                        <option value="not_equals">Est différent de</option>
                        <option value="empty">Est vide</option>
                        <option value="not_empty">N’est pas vide</option>
                    </select>
                </label>
                <label class="qa-field qa-field--wide" data-auto-role="condition-terms">
                    Termes ou valeurs à comparer
                    <textarea data-auto-field="condition-terms" rows="2" placeholder="Séparez les valeurs par une virgule"></textarea>
                </label>
                <label class="qa-field">Source de la valeur à insérer
                    <select data-auto-field="value-source">
                        <option value="request">Utiliser un champ du request.json</option>
                        <option value="literal">Utiliser un texte personnalisé</option>
                        <option value="dot">Insérer un point noir</option>
                        <option value="checkmark">Insérer un crochet ✓</option>
                    </select>
                </label>
                <label class="qa-field" data-auto-role="value-path">
                    Chemin du champ à insérer
                    <input type="text" data-auto-field="value-path" placeholder="formData.adresses[0].ville">
                </label>
                <label class="qa-field" data-auto-role="value-literal" hidden>
                    Texte personnalisé
                    <input type="text" data-auto-field="value-literal" placeholder="Texte à insérer">
                </label>
                <label class="qa-field qa-field--wide">
                    Valeur alternative (facultatif)
                    <input type="text" data-auto-field="fallback" placeholder="Utilisée si la valeur principale est vide">
                </label>
            </div>
            <label class="qa-field">Notes internes
                <textarea data-auto-field="notes" rows="2" placeholder="Ajoutez des précisions facultatives."></textarea>
            </label>
            <section class="qa-auto-selection__dynamic" data-role="auto-dynamic">
                <header class="qa-subheader qa-subheader--minor">
                    <div>
                        <h6>Coordonnées dynamiques</h6>
                        <p>Configurez le placement automatique de cases à cocher ou de textes selon le contexte détecté.</p>
                    </div>
                    <label class="qa-field qa-field--checkbox qa-field--inline">
                        <input type="checkbox" data-auto-dynamic="enabled">
                        Activer les coordonnées dynamiques pour cette règle
                    </label>
                </header>
                <div class="qa-dynamic-grid">
                    <label class="qa-field">Mode de déclenchement
                        <select data-auto-dynamic="mode">
                            <option value="maxClients">Nombre maximal de clients sélectionné</option>
                            <option value="requestValue">Valeur spécifique du request.json</option>
                        </select>
                    </label>
                    <div class="qa-dynamic-panel" data-dynamic-panel="maxClients">
                        <header class="qa-subheader qa-subheader--minor">
                            <div>
                                <h6>Coordonnées par nombre de clients</h6>
                                <p>Ajoutez autant de variantes que nécessaire selon la limite choisie lors de la génération.</p>
                            </div>
                            <button type="button" class="qa-btn qa-btn--ghost" data-action="add-dynamic-max">Ajouter une variante</button>
                        </header>
                        <div class="qa-dynamic-list" data-role="dynamic-max-list"></div>
                    </div>
                    <div class="qa-dynamic-panel" data-dynamic-panel="requestValue" hidden>
                        <header class="qa-subheader qa-subheader--minor">
                            <div>
                                <h6>Coordonnées par type de demande</h6>
                                <p>Associez un ensemble de coordonnées à chaque valeur détectée dans le request.json.</p>
                            </div>
                            <button type="button" class="qa-btn qa-btn--ghost" data-action="add-dynamic-request">Ajouter une valeur</button>
                        </header>
                        <label class="qa-field">Chemin request.json à analyser (optionnel)
                            <input type="text" data-auto-dynamic="request-path" placeholder="Laissez vide pour réutiliser le chemin principal">
                        </label>
                        <div class="qa-dynamic-list" data-role="dynamic-request-list"></div>
                        <label class="qa-field qa-field--wide">Coordonnées par défaut (si aucune valeur ne correspond)
                            <div class="qa-coordinate-group" data-role="dynamic-request-fallback"></div>
                        </label>
                    </div>
                </div>
            </section>
        </article>
    </template>

    <template id="qa-category-template">
        <article class="qa-category" data-category>
            <header class="qa-category__header">
                <div>
                    <h6>Catégorie</h6>
                    <p data-role="category-id"></p>
                </div>
                <button type="button" class="qa-btn qa-btn--danger" data-action="delete-category" title="Supprimer" data-help="Retire cette catégorie de la question.">⛔</button>
            </header>
            <div class="qa-grid qa-grid--category">
                <label class="qa-field">Nom de la catégorie
                    <input type="text" data-category-field="label" placeholder="Ex. Dossier achat">
                </label>
                <label class="qa-field">Identifiant interne
                    <input type="text" data-category-field="id" placeholder="Ex. dossier_achat">
                </label>
            </div>
            <label class="qa-field">Description / rappel
                <textarea data-category-field="description" rows="2" placeholder="Indiquez les consignes à rappeler lors du remplissage"></textarea>
            </label>
            <div class="qa-coordinate-group" data-role="category-coordinates"></div>
        </article>
    </template>

    <template id="qa-dynamic-max-template">
        <article class="qa-dynamic" data-dynamic-max>
            <header class="qa-dynamic__header">
                <h6>Variante clients</h6>
                <button type="button" class="qa-btn qa-btn--danger" data-action="delete-dynamic" title="Supprimer">⛔</button>
            </header>
            <div class="qa-grid qa-grid--dynamic">
                <label class="qa-field">Nombre maximal de clients
                    <input type="number" min="1" max="10" step="1" data-dynamic-field="count" placeholder="Ex. 2">
                </label>
                <label class="qa-field">Description interne
                    <input type="text" data-dynamic-field="label" placeholder="Ex. Deux clients sélectionnés">
                </label>
            </div>
            <div class="qa-coordinate-group" data-role="dynamic-coordinates"></div>
        </article>
    </template>

    <template id="qa-dynamic-request-template">
        <article class="qa-dynamic" data-dynamic-request>
            <header class="qa-dynamic__header">
                <h6>Valeur détectée</h6>
                <button type="button" class="qa-btn qa-btn--danger" data-action="delete-dynamic" title="Supprimer">⛔</button>
            </header>
            <div class="qa-grid qa-grid--dynamic">
                <label class="qa-field">Valeur ou catégorie du request.json
                    <input type="text" data-dynamic-field="value" placeholder="Ex. pre-approval">
                </label>
                <label class="qa-field">Description interne
                    <input type="text" data-dynamic-field="label" placeholder="Ex. Demande pré-approbation">
                </label>
            </div>
            <div class="qa-coordinate-group" data-role="dynamic-coordinates"></div>
        </article>
    </template>

    <template id="qa-coordinate-item-template">
        <div class="qa-coordinate-item" data-coordinate-item>
            <input type="text" data-role="coordinate-value" placeholder="Ex. Page 2 – Signature 1">
            <div class="qa-coordinate-item__actions">
                <button type="button" class="qa-btn qa-btn--ghost" data-action="pick-coordinate" title="Choisir sur le document">📍</button>
                <button type="button" class="qa-btn qa-btn--danger" data-action="remove-coordinate" title="Supprimer">⛔</button>
            </div>
        </div>
    </template>

    <div id="qa-auto-faq" class="qa-auto-faq" role="dialog" aria-modal="false" aria-hidden="true" hidden tabindex="-1">
        <div class="qa-auto-faq__panel">
            <header class="qa-auto-faq__header">
                <h3>FAQ – Sélections automatiques</h3>
                <button type="button" class="qa-auto-faq__close" data-role="auto-faq-close" aria-label="Fermer la FAQ">×</button>
            </header>
            <div class="qa-auto-faq__content">
                <p>Les sélections automatiques analysent les champs d’un <code>request.json</code> et insèrent automatiquement un texte, une coche ou une note sur le document.</p>
                <ul>
                    <li><strong>Chemin request.json</strong> : indiquez la donnée à surveiller (notation par points), ex. <code>formData.adresses[0].ville</code>.</li>
                    <li><strong>Condition</strong> : choisissez le test à appliquer (contient, égal, vide, etc.). Séparez plusieurs termes par une virgule.</li>
                    <li><strong>Valeur à insérer</strong> : récupérez un autre champ du <code>request.json</code> ou saisissez un texte personnalisé avec valeur de secours.</li>
                    <li><strong>Coordonnée</strong> : placez le résultat directement sur le PDF pour une relecture rapide.</li>
                </ul>
                <p>Besoin d’aide pour identifier un chemin ? Consultez le <a href="/services/ValuesIdentification/paths.php" target="_blank" rel="noopener">Guide d’appentissage des chemins à utiliser</a>.</p>
                <p>Utilisez le bouton « + Créer des sélections automatiques basées sur les clients choisis » pour générer une règle à partir des request.json sélectionnés.</p>
            </div>
        </div>
    </div>

    <div id="qa-variable-browser" class="qa-variable-browser" role="dialog" aria-modal="false" aria-hidden="true" hidden tabindex="-1">
        <div class="qa-variable-browser__panel">
            <header class="qa-variable-browser__header">
                <div>
                    <h3>Explorer les variables disponibles</h3>
                    <p>Choisissez une variable pour remplir automatiquement la clé.</p>
                </div>
                <button type="button" class="qa-variable-browser__close" data-action="close-variable-browser" aria-label="Fermer la fenêtre">×</button>
            </header>
            <div class="qa-variable-browser__body">
                <div class="qa-variable-browser__controls">
                    <input type="search" data-role="variable-search" placeholder="Rechercher par nom, clé ou groupe" aria-label="Rechercher une variable">
                </div>
                <div class="qa-variable-browser__results" data-role="variable-results" aria-live="polite"></div>
                <p class="qa-variable-browser__empty" data-role="variable-empty" hidden>Aucune variable ne correspond à cette recherche.</p>
            </div>
            <footer class="qa-variable-browser__footer">
                <button type="button" class="qa-btn" data-action="close-variable-browser">Fermer</button>
            </footer>
        </div>
    </div>

    <div id="qa-coordinate-picker" class="qa-coordinate-picker" role="dialog" aria-modal="true" aria-hidden="true" hidden tabindex="-1" data-help="Permet de positionner précisément chaque élément sur le PDF (questions, options, sélections automatiques) avec zoom, multi-pages et modèles importés.">
        <div class="qa-coordinate-picker__backdrop" data-role="picker-dismiss" aria-hidden="true"></div>
        <div class="qa-coordinate-picker__panel" data-role="picker-panel">
            <header class="qa-coordinate-picker__header">
                <div>
                    <h3>Choisir une coordonnée</h3>
                    <p data-role="picker-context"></p>
                </div>
                <button type="button" class="qa-coordinate-picker__close" data-action="picker-close" aria-label="Fermer le sélecteur">×</button>
            </header>
            <div class="qa-coordinate-picker__toolbar">
                <div class="qa-picker-field qa-picker-field--template" data-help="Sélectionne un modèle pré-enregistré pour afficher et réutiliser ses coordonnées existantes.">
                    <label>Modèle pré-enregistré
                        <select data-role="picker-template">
                            <option value="">Choisissez un modèle</option>
                        </select>
                    </label>
                    <button type="button" class="qa-btn qa-btn--ghost" data-action="picker-refresh-templates" title="Recharger la liste des modèles">Actualiser</button>
                </div>
                <label class="qa-picker-field qa-picker-field--file" data-help="Importe un nouveau PDF afin de créer un modèle pré-enregistré et l'ajouter à la bibliothèque de coordonnées.">
                    <span>Importer un PDF</span>
                    <input type="file" accept="application/pdf" data-role="picker-file">
                    <span class="qa-picker-field__hint">Le document sera ajouté à la bibliothèque de modèles.</span>
                </label>
                <div class="qa-picker-field">
                    <label>Page
                        <input type="number" min="1" value="1" data-role="picker-page">
                    </label>
                    <span class="qa-picker-field__meta" data-role="picker-page-total">/ 1</span>
                </div>
                <div class="qa-picker-field qa-picker-field--compact" data-help="Ajuste le zoom pour viser une case précise ou visualiser la page complète avant de cliquer.">
                    <label>Zoom
                        <input type="range" min="0.5" max="2.5" step="0.1" value="1.2" data-role="picker-zoom">
                    </label>
                </div>
                <button type="button" class="qa-btn qa-btn--ghost" data-action="picker-reset" data-help="Efface le point de sélection actuel pour recommencer immédiatement sur la même page ou un autre modèle.">Réinitialiser</button>
            </div>
            <div class="qa-coordinate-picker__viewer" data-role="picker-viewer">
                <div class="qa-coordinate-picker__stage" data-role="picker-stage">
                    <canvas data-role="picker-canvas" aria-label="Aperçu du document" role="img"></canvas>
                    <div class="qa-coordinate-picker__overlay" data-role="picker-overlay" aria-hidden="true"></div>
                    <div class="qa-coordinate-picker__marker" data-role="picker-marker" hidden></div>
                </div>
                <p class="qa-coordinate-picker__empty" data-role="picker-empty">Sélectionnez un modèle ou importez un PDF pour activer le sélecteur de coordonnées.</p>
            </div>
            <footer class="qa-coordinate-picker__footer">
                <div class="qa-coordinate-picker__info" data-role="picker-info" aria-live="polite"></div>
                <div class="qa-coordinate-picker__actions">
                    <button type="button" class="qa-btn" data-action="picker-cancel" data-help="Ferme le sélecteur sans remplacer la coordonnée actuelle.">Annuler</button>
                    <button type="button" class="qa-btn qa-btn--primary" data-action="picker-apply" disabled data-help="Valide la coordonnée choisie et l’insère dans le formulaire (question, option ou règle automatique).">Utiliser cette coordonnée</button>
                </div>
            </footer>
        </div>
    </div>

    <div id="qa-config-library" class="qa-config-library" role="dialog" aria-hidden="true" hidden tabindex="-1">
        <div class="qa-config-library__panel">
            <header class="qa-config-library__header" data-role="config-library-header">
                <div>
                    <h3>Bibliothèque des configurations</h3>
                    <p>Retrouvez, épinglez et restaurez vos classes favorites sans interrompre votre travail.</p>
                </div>
                <button type="button" class="qa-config-library__close" data-action="close-config-library" aria-label="Fermer la bibliothèque">×</button>
            </header>
            <div class="qa-config-library__body">
                <div class="qa-config-library__list" data-role="config-library-list" aria-live="polite"></div>
            </div>
        </div>
    </div>
    <button type="button" class="qa-config-library__toggle" data-action="reopen-config-library" aria-label="Afficher la bibliothèque des configurations" hidden aria-hidden="true">◀</button>

    <div id="qa-tutorial" class="qa-tutorial" role="dialog" aria-modal="false" aria-hidden="true" hidden>
        <div class="qa-tutorial__backdrop" data-role="tutorial-backdrop" aria-hidden="true"></div>
        <div class="qa-tutorial__spotlight" data-role="tutorial-spotlight" aria-hidden="true"></div>
        <div class="qa-tutorial__bubble" data-role="tutorial-bubble" data-position="right" tabindex="-1">
            <header class="qa-tutorial__bubble-header">
                <p class="qa-tutorial__step" data-role="tutorial-step"></p>
                <button type="button" class="qa-tutorial__close" data-role="tutorial-close" aria-label="Fermer le tutoriel">×</button>
            </header>
            <h2 class="qa-tutorial__title" data-role="tutorial-title"></h2>
            <div class="qa-tutorial__body" data-role="tutorial-body">
                <p class="qa-tutorial__text" data-role="tutorial-text"></p>
                <div class="qa-tutorial__examples" data-role="tutorial-examples" hidden></div>
                <div class="qa-tutorial__simulation" data-role="tutorial-simulation" aria-live="polite"></div>
            </div>
            <div class="qa-tutorial__controls">
                <button type="button" class="qa-tutorial__control" data-role="tutorial-prev" aria-label="Étape précédente">◀</button>
                <button type="button" class="qa-tutorial__control qa-tutorial__control--accent" data-role="tutorial-actions" aria-label="Explorer les actions disponibles">+++</button>
                <button type="button" class="qa-tutorial__control" data-role="tutorial-next" aria-label="Étape suivante">▶</button>
            </div>
        </div>
        <div class="qa-tutorial__action-popover" data-role="tutorial-action-popover" hidden>
            <header class="qa-tutorial__action-header" data-role="action-popover-header">
                <h3>Explorer les actions</h3>
            </header>
            <div class="qa-tutorial__action-body">
                <p>Retrouvez toutes les actions détectées dans l’interface Questions/Actions et lancez un mini-tutoriel ciblé.</p>
                <input type="search" class="qa-tutorial__action-search" data-role="action-search" placeholder="Rechercher une action ou un mot-clé">
                <div class="qa-tutorial__action-list" data-role="action-list" aria-live="polite"></div>
                <div class="qa-tutorial__quiz" data-role="action-quiz" hidden>
                    <h4>Que voulez-vous faire ensuite ?</h4>
                    <div class="qa-tutorial__quiz-options" data-role="action-quiz-options"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" defer crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="assets/js/question-actions-auto-builder.js" defer></script>
    <script src="assets/js/question-actions-manager.js" defer></script>
</body>
</html>
