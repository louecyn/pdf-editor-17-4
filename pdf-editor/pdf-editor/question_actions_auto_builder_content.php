<div class="qa-builder-page__content" data-role="auto-builder-root">
    <section class="qa-builder-hero qa-builder-hero--centered">
        <div class="qa-builder-hero__text">
            <p class="qa-pill qa-pill--accent">Page dédiée</p>
            <h2>Construisez une règle auto depuis de vrais clients, sans quitter Questions/Actions.</h2>
            <p>Tout est rassemblé ici : sélection de clients, exploration des <code>request.json</code>, choix de la coordonnée et envoi direct de la règle dans votre classe ouverte.</p>
        </div>
        <div class="qa-builder-hero__cta">
            <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="open-faq">Guide rapide</button>
            <button type="button" class="qa-builder-btn qa-builder-btn--primary" data-action="open-walkthrough">Tutoriel interactif</button>
        </div>
    </section>
    <section class="qa-builder-advantages" aria-label="Fonctionnalités exclusives">
        <h3>Ce que cette page ajoute réellement</h3>
        <ul class="qa-builder-advantages__grid">
            <li>
                <strong>Clients chargés depuis <code>/data/requests</code></strong>
                <p>Vous cochez des dossiers existants et voyez immédiatement leurs données pour bâtir la règle.</p>
            </li>
            <li>
                <strong>Boutons d’actions sur chaque champ</strong>
                <p>Analyser / Insérer / Ajouter au filtre remplissent le formulaire sans copier-coller.</p>
            </li>
            <li>
                <strong>Coordonnée reliée au document actif</strong>
                <p>« Choisir sur le document » déclenche le sélecteur PDF de Questions/Actions.</p>
            </li>
            <li>
                <strong>Envoi et sauvegarde en une étape</strong>
                <p>Le bouton d’enregistrement pousse la règle vers la classe en cours puis revient à Questions/Actions.</p>
            </li>
        </ul>
    </section>
    <section class="qa-builder-context" aria-label="Pourquoi cette page est utile">
        <div>
            <h3>Un outil pensé pour un courtier seul</h3>
            <p>Cette page sert à fabriquer des règles automatiques à partir de vrais dossiers clients. Vous pouvez tester des
                conditions, choisir quoi insérer dans le PDF et où le placer, sans coder ni quitter Questions/Actions. Chaque
                étape est décrite avec des exemples liés au courtage hypothécaire.</p>
        </div>
        <div class="qa-builder-context__examples">
            <div>
                <strong>Exemple rapide</strong>
                <p>Si la province du premier emprunteur est « QC », insérer automatiquement son adresse formatée dans votre
                    document modèle.</p>
            </div>
            <div>
                <strong>Pré-remplissage</strong>
                <p>Si un revenu est manquant, afficher « Revenu à valider » à l’endroit exact du document en un clic.</p>
            </div>
            <div>
                <strong>Rappel automatique</strong>
                <p>Ajouter un rappel « Vérifier la mise de fonds » lorsqu’un code interne spécifique est détecté.</p>
            </div>
        </div>
    </section>
    <section class="qa-builder-actions-help" aria-label="Comprendre Analyser / Insérer / Ajouter au filtre">
        <div>
            <h3>Les trois boutons qui font gagner du temps</h3>
            <p>Dans l’explorateur de données, chaque champ propose Analyser, Insérer et Ajouter au filtre. Passez la souris sur
                les pastilles <span class="qa-help-badge" aria-hidden="true" title="Déplacez votre pointeur ici pour lire une aide rapide">?</span>
                pour un rappel immédiat, ou lisez les exemples ci-dessous. « Surveiller » signifie ici que la règle parcourt plusieurs termes (provinces, statuts, mots-clés) et réagit différemment selon ce qui se trouve dans les dossiers.</p>
        </div>
        <div class="qa-builder-actions-help__grid">
            <article>
                <header><span class="qa-pill">Analyser</span></header>
                <p>Copie le chemin technique (ex. <code>formData.adresses[0].ville</code>) dans « Chemin request.json à analyser »
                    et prépare la condition. Utile quand vous repérez un champ vide ou douteux dans un dossier réel.</p>
                <ul>
                    <li>Repérer que la ville est vide et préparer une règle « si vide → insérer Ville à confirmer ».</li>
                    <li>Pointer un taux promotionnel pour vérifier s’il contient « 0.99 » avant d’afficher un avertissement.</li>
                    <li>Choisir la province pour tester un scénario « QC » vs « ON » sans retaper le chemin.</li>
                </ul>
            </article>
            <article>
                <header><span class="qa-pill qa-pill--value">Insérer</span></header>
                <p>Pré-remplit la partie « Source de la valeur à insérer » avec le même chemin, pour recopier la donnée dans le
                    PDF sans saisie manuelle. Cela sert à synchroniser le document avec une info déjà présente.</p>
                <ul>
                    <li>Reprendre l’adresse complète du client et l’injecter à l’endroit exact du contrat.</li>
                    <li>Afficher automatiquement le montant assuré lorsque le dossier contient déjà cette valeur.</li>
                    <li>Recopier un numéro de référence interne dans un encadré de suivi.</li>
                </ul>
            </article>
            <article>
                <header><span class="qa-pill qa-pill--actions">Ajouter au filtre</span></header>
                <p>Ajoute automatiquement des exemples dans « Termes à comparer » pour surveiller plusieurs mots ou codes en une
                    seule règle. Pensez-y comme une liste de mots à guetter, qui rend possible des règles multi-termes sans
                    retaper chaque variation.</p>
                <ul>
                    <li>Suivre les provinces « QC, ON, NB » pour afficher un paragraphe spécifique selon la région.</li>
                    <li>Détecter les statuts « pré-approbation, approuvé, refusé » afin de choisir une mention adaptée.</li>
                    <li>Tester la présence de « taux variable » ou « renouvellement » pour afficher un rappel contextualisé.</li>
                </ul>
                <p class="qa-field__help">Un terme est simplement une valeur à guetter : une province, un statut, un mot-clé ou
                    un code interne. Pour combiner plusieurs termes dans une règle, listez-les séparés par des virgules ; la
                    condition choisie décidera si la règle passe lorsque l’un des termes est trouvé, lorsqu’aucun n’est présent,
                    ou lorsque la valeur est vide. Exemple complet : « Contient les termes » avec « QC, ON, NB » pour insérer un
                    paragraphe régional, puis une deuxième règle « Est vide » pour afficher « Province manquante » si rien n’a été
                    rempli.</p>
            </article>
        </div>
    </section>
    <section class="qa-builder-templates" aria-label="Modèles pré-enregistrés disponibles">
        <div class="qa-builder-templates__header">
            <div>
                <h3>Vos modèles pré-enregistrés</h3>
                <p>Sélectionnez un document comme dans le tableau de bord, puis lancez l’aperçu live pour tester vos règles sur un vrai modèle.</p>
            </div>
            <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="reload-templates">↻ Actualiser la liste</button>
        </div>
        <div class="qa-template-library" data-role="template-library">
            <ul class="qa-template-card-list" data-role="template-card-list" aria-live="polite"></ul>
            <p class="qa-empty" data-role="template-empty" hidden>Aucun modèle enregistré pour le moment. Enregistrez un document dans le tableau de bord pour le retrouver ici.</p>
        </div>
    </section>
    <template id="qa-template-card-template">
        <li class="qa-template-card">
            <button type="button" class="qa-template-card__surface" data-role="template-card-primary">
                <figure>
                    <div class="qa-template-card__preview" data-role="template-card-preview" aria-hidden="true"></div>
                    <figcaption>
                        <span class="qa-template-card__name" data-role="template-card-name"></span>
                        <span class="qa-template-card__meta" data-role="template-card-meta"></span>
                    </figcaption>
                </figure>
            </button>
        </li>
    </template>
    <section class="qa-builder-demo-doc" aria-label="Document d'exemple" data-tour-target="sample-doc" id="qa-tour-sample-doc">
        <div class="qa-builder-demo-doc__header">
            <div>
                <h3>Document réel en aperçu live</h3>
                <p>Sélectionnez l’un de vos modèles pré-enregistrés et observez en direct l’endroit où votre règle agirait. Les
                    accents (ex. « hypothécaire », « Québec ») sont fidèlement rendus et chaque modification saisie ci-dessous
                    rafraîchit immédiatement l’aperçu sans rien enregistrer dans vos modèles.</p>
                <div class="qa-live-select">
                    <div class="qa-live-select__controls">
                        <select id="qa-template-preview" data-role="preview-template" aria-label="Modèle pour prévisualisation"></select>
                    </div>
                    <p class="qa-field__help" data-role="preview-status">Charge un aperçu sans sauvegarder ; utilisez-le pour
                        jouer avec vos règles avant de viser vos documents officiels.</p>
                    <div class="qa-live-status" data-role="preview-banner" aria-live="polite" hidden>
                        <span class="qa-pill qa-pill--accent" data-role="preview-pill">Aperçu chargé</span>
                        <strong data-role="preview-template-label">Aucun modèle sélectionné</strong>
                        <span data-role="preview-page-count"></span>
                    </div>
                </div>
            </div>
            <div class="qa-builder-demo-doc__actions">
                <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="preview-prev" disabled>◀
                    Page précédente</button>
                <div class="qa-builder-demo-doc__page" data-role="preview-page">Page 0 / 0</div>
                <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="preview-next" disabled>Page
                    suivante ▶</button>
            </div>
        </div>
        <div class="qa-builder-demo-doc__viewer qa-builder-demo-doc__viewer--live">
            <div class="qa-live-preview" data-role="preview-wrapper">
                <canvas data-role="preview-canvas" aria-label="Aperçu PDF interactif"></canvas>
                <div class="qa-live-overlay" aria-hidden="true" data-role="preview-overlay"></div>
            </div>
            <div class="qa-live-log">
                <h4>Étapes appliquées dans cette démo</h4>
                <ul data-role="preview-log">
                    <li>En attente d’un modèle…</li>
                </ul>
                <p class="qa-field__help">Chaque fois que vous modifiez la condition, la valeur ou la coordonnée, l’aperçu se
                    met à jour tout de suite pour montrer la réaction du document sans écrire quoi que ce soit.</p>
            </div>
        </div>
        <p class="qa-preview-note">Les éléments en rouge correspondent aux configurations déjà présentes dans ce document.</p>
        <ul class="qa-builder-demo-doc__legend">
            <li>Choisissez un modèle réel pour vérifier l’affichage avant de cliquer sur « Enregistrer ».</li>
            <li>Les modifications de test (textes insérés, coordonnées surlignées) restent temporaires et ne touchent jamais vos
                fichiers officiels.</li>
            <li>Utilisez cette zone si l’onglet d’origine n’est pas disponible : vous pouvez quand même cliquer, tester et voir
                les pages de tous vos modèles.</li>
        </ul>
    </section>
    <section class="qa-builder-actions" aria-label="Actions disponibles">
        <h3>Quoi faire ici, étape par étape</h3>
        <ol class="qa-builder-actions__list">
            <li><strong>Choisir les clients</strong> : cochez un ou plusieurs dossiers pour charger leurs <code>request.json</code>.</li>
            <li><strong>Explorer les données</strong> : utilisez Analyser / Insérer / Ajouter au filtre sur le champ voulu.</li>
            <li><strong>Configurer la règle</strong> : définissez la condition, les termes, la source de valeur et la coordonnée.</li>
            <li><strong>Prévisualiser</strong> : lisez le récapitulatif et le tutoriel pour vérifier le rendu attendu.</li>
            <li><strong>Enregistrer</strong> : utilisez le bouton « Enregistrer » en haut du panneau pour appliquer la règle sans quitter cette page.</li>
        </ol>
    </section>
    <div class="qa-builder-shell">
        <aside class="qa-builder__sidebar" aria-label="Clients et données request.json">
            <section class="qa-panel" data-tour-target="clients" id="qa-tour-clients">
                <header class="qa-panel__header">
                    <div>
                        <h2>Clients disponibles</h2>
                        <p>Choisissez des dossiers pour alimenter le générateur. Tapez quelques lettres (nom ou identifiant) pour révéler les correspondances.</p>
                    </div>
                    <div class="qa-panel__controls">
                        <input type="search" placeholder="Rechercher un client" data-role="client-search">
                    </div>
                </header>
                <ul class="qa-client-list" data-role="client-list" aria-live="polite"></ul>
                <p class="qa-empty" data-role="client-empty" hidden>Aucun client trouvé.</p>
            </section>
        </aside>
        <section class="qa-builder__content" aria-label="Création de la règle automatique">
            <form class="qa-rule" data-role="rule-form">
                <header class="qa-rule__header">
                    <div>
                        <h2>Définition de la règle</h2>
                    </div>
                    <div class="qa-rule__meta" data-role="selected-meta">
                        <p data-role="selected-count">Sélectionnez des clients dans la colonne de gauche pour activer les actions.</p>
                        <button type="button" class="qa-builder-btn qa-builder-btn--ghost qa-builder-btn--mini" data-action="focus-clients">Choisir des clients</button>
                    </div>
                </header>
                <div class="qa-grid">
                    <label class="qa-field" data-tour-target="rule-name">Nom de la règle
                        <input type="text" name="label" data-field="label" placeholder="Ex. Informations manquantes" required>
                    </label>
                    <label class="qa-field" data-tour-target="coordinate" id="qa-tour-coordinate">Coordonnée d’insertion
                        <div class="qa-field__coordinate">
                            <input type="text" name="coordinate" data-field="coordinate" placeholder="Ex. page=2;x=145;y=320">
                            <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="pick-coordinate">Choisir sur le document</button>
                        </div>
                    </label>
                    <label class="qa-field" data-tour-target="request-path" id="qa-tour-request-path">
                        <span class="qa-field__label-row">Chemin request.json à analyser <span class="qa-help-badge" title="Exemple : formData.adresses[0].ville correspond au champ Ville du premier emprunteur">?</span></span>
                        <button type="button" class="qa-builder-link" data-action="open-cartography">Voir la cartographie</button>
                        <input type="text" name="requestPath" data-field="request-path" placeholder="formData.adresses[0].ville" required>
                        <p class="qa-field__help">Vous pouvez soit cliquer sur le bouton « Analyser » de n’importe quel élément en haut pour recopier automatiquement le chemin ici, soit écrire vous-même le code que vous cherchez après avoir consulté la cartographie.</p>
                    </label>
                    <p class="qa-field__help"><strong>Différence clé</strong> : le « Chemin à analyser » sert à repérer la donnée à tester (condition), tandis que le « Chemin du champ à insérer » désigne la valeur qui sera recopiée ou affichée dans le document.</p>
                    <label class="qa-field">
                        <span class="qa-field__label-row">Condition <span class="qa-help-badge" title="Choisissez le test à appliquer : contient, égal, vide, etc.">?</span></span>
                        <select name="conditionType" data-field="condition-type">
                            <option value="contains">Contient les termes</option>
                            <option value="not_contains">Ne contient pas les termes</option>
                            <option value="equals">Est exactement égal</option>
                            <option value="not_equals">Est différent de</option>
                            <option value="empty">Est vide</option>
                            <option value="not_empty">N’est pas vide</option>
                        </select>
                    </label>
                </div>
                <label class="qa-field" data-role="condition-terms" data-tour-target="condition" id="qa-tour-condition">
                    <span class="qa-field__label-row">Termes ou valeurs à comparer (séparés par des virgules) <span class="qa-help-badge" title="Inscrivez les mots ou codes à repérer, par exemple QC, approuvé, taux variable">?</span></span>
                    <textarea name="conditionTerms" rows="2" data-field="condition-terms" placeholder="Ex. à jour, approuvé"></textarea>
                    <p class="qa-field__help">Écrivez avec des mots simples ce que la règle doit détecter dans le chemin analysé : un mot, un code, une province ou une valeur complète. Chaque terme séparé par une virgule sera testé automatiquement sur les clients cochés pour confirmer que la condition choisie réagit comme prévu. Exemples : « vide » pour repérer une case vide, « QC » pour appliquer une clause spécifique au Québec, « taux variable » pour déclencher un rappel.</p>
                </label>
                <div class="qa-condition-demos" aria-label="Démonstrations des conditions">
                    <h4>Mini-scenarios pour chaque condition</h4>
                    <ul class="qa-condition-demos__grid">
                        <li><strong>Contient les termes</strong> — Saisissez « QC, ON » dans Termes, puis cliquez sur « Analyser » sur la province pour tester un paragraphe régional.</li>
                        <li><strong>Ne contient pas les termes</strong> — Placez « refusé » comme terme ; si le statut ne contient pas ce mot, la règle peut insérer « Statut à confirmer ».</li>
                        <li><strong>Est exactement égal</strong> — Indiquez « pré-approbation » ; si la valeur détectée est strictement identique, insérez un bloc de suivi spécifique.</li>
                        <li><strong>Est différent de</strong> — Comparez « approuvé » ; si le statut diffère, prévoyez un message « Dossier à réviser ».</li>
                        <li><strong>Est vide</strong> — Laissez Termes vide, cliquez sur « Analyser » sur un champ d’adresse ; si aucune valeur, insérez « Adresse manquante ».</li>
                        <li><strong>N’est pas vide</strong> — Utilisez la même adresse ; si une valeur est présente, recopiez-la dans le PDF.</li>
                    </ul>
                    <p class="qa-field__help">Pour créer plusieurs règles, répétez ces étapes autant de fois que nécessaire : configurez la condition, enregistrez avec le bouton principal, puis rouvrez la page pour enchaîner d’autres conditions (Contient, Est vide, etc.).</p>
                </div>
                <div class="qa-grid">
                    <label class="qa-field" data-tour-target="value-source" id="qa-tour-value-source">
                        <span class="qa-field__label-row">Source de la valeur à insérer <span class="qa-help-badge" title="Choisissez soit de copier un champ existant, soit d'écrire un texte fixe">?</span></span>
                        <select name="valueSource" data-field="value-source">
                            <option value="request">Utiliser un autre champ du request.json</option>
                            <option value="literal">Utiliser un texte personnalisé</option>
                        </select>
                        <div class="qa-field__inline-help">
                            <p class="qa-field__help"><strong>Champ du request.json</strong> : recopie une information réelle déjà présente (ex. une adresse officielle) pour garder la donnée synchronisée avec le dossier.</p>
                            <p class="qa-field__help"><strong>Texte personnalisé</strong> : insère une mention fixe (ex. « À vérifier », « Donnée manquante ») utile lorsque vous devez afficher un message d’aide plutôt qu’une valeur existante.</p>
                        </div>
                    </label>
                    <label class="qa-field" data-role="value-path" data-tour-target="value-path">
                        Chemin du champ à insérer
                        <input type="text" name="valuePath" data-field="value-path" placeholder="formData.adresses[0].ville">
                        <p class="qa-field__help">Vous pouvez soit cliquer sur le bouton « Insérer » d’un élément du tableau ci-dessus pour remplir automatiquement ce champ, soit inscrire manuellement le chemin exact que vous souhaitez copier.</p>
                    </label>
                    <label class="qa-field" data-role="value-literal" hidden data-tour-target="value-literal">
                        Texte personnalisé
                        <input type="text" name="valueLiteral" data-field="value-literal" placeholder="Texte à insérer automatiquement">
                    </label>
                </div>
                <div class="qa-optional qa-optional--toggles">
                    <label class="qa-toggle">
                        <input type="checkbox" data-action="toggle-fallback"> Ajouter une valeur alternative facultative <span class="qa-help-badge" title="Plan B inséré seulement si la valeur principale est absente">?</span>
                    </label>
                    <p class="qa-field__help">Cochez pour prévoir un plan B : si le champ principal est vide, la valeur alternative sera inscrite (ex. « Champ à valider »). Laissez décoché pour ne rien insérer lorsque la donnée manque.</p>
                    <label class="qa-toggle">
                        <input type="checkbox" data-action="toggle-notes"> Ajouter des notes internes facultatives <span class="qa-help-badge" title="Vos propres rappels : pourquoi la règle existe, quoi vérifier" aria-hidden="true">?</span>
                    </label>
                    <p class="qa-field__help">Ajoutez vos propres rappels (ex. « Règle testée sur dossier Tremblay », « À désactiver après signature »). Ces notes restent visibles uniquement dans Questions/Actions lorsque vous rouvrez la règle ; elles n’apparaissent jamais dans les documents générés.</p>
                </div>
                <label class="qa-field" data-role="fallback-field" hidden>
                    <span class="qa-field__label-row"><span class="qa-field__label">Valeur alternative (facultatif) <span data-role="fallback-required" hidden>*</span></span></span>
                    <input type="text" name="fallback" data-field="fallback" placeholder="Utilisée si la valeur principale est vide">
                </label>
                <label class="qa-field" data-role="notes-field" hidden>
                    Notes internes (facultatif)
                    <textarea name="notes" data-field="notes" rows="2" placeholder="Ex. Pourquoi cette règle existe, quand la désactiver, quelles données surveiller"></textarea>
                </label>
                <section class="qa-preview" data-role="rule-preview" aria-live="polite">
                    <h4>Prévisualiser avant d’enregistrer</h4>
                    <ul>
                        <li><strong>Chemin analysé</strong> : <span data-preview="request-path">–</span></li>
                        <li><strong>Condition</strong> : <span data-preview="condition">–</span> avec <span data-preview="terms">–</span></li>
                        <li><strong>Valeur à insérer</strong> : <span data-preview="value-source">–</span></li>
                        <li><strong>Coordonnée</strong> : <span data-preview="coordinate">–</span></li>
                    </ul>
                    <p class="qa-field__help">Utilisez cette prévisualisation pour vérifier l’impact avant l’enregistrement. Rien n’est ajouté tant que vous ne validez pas.</p>
                </section>
                <div class="qa-rule__actions">
                    <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="reset-form">Réinitialiser</button>
                    <button type="submit" class="qa-builder-btn qa-builder-btn--primary" data-action="send-rule" data-tour-target="save" hidden>Enregistrer</button>
                </div>
                <p class="qa-field__help">En cliquant sur le bouton « Enregistrer » en haut du générateur, la règle est envoyée et sauvegardée dans la classe Questions/Actions active sans vous rediriger.</p>
                <p class="qa-rule__feedback" data-role="rule-feedback" hidden></p>
            </form>
        </section>
    </div>

    <div class="qa-modal" data-role="coordinate-modal" aria-modal="true" role="dialog" hidden>
        <div class="qa-modal__dialog">
            <header class="qa-modal__header">
                <div>
                    <p class="qa-pill">Coordonnée d’insertion</p>
                    <h3>Choisir une coordonnée dans un modèle</h3>
                    <p class="qa-field__help" data-role="coordinate-status">Sélectionnez un modèle, affichez la page voulue,
                        cliquez sur le point exact puis validez.</p>
                </div>
                <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="close-coordinate" aria-label="Fermer">×</button>
            </header>
            <div class="qa-modal__controls">
                <label>Modèle pré-enregistré
                    <div class="qa-live-select__controls">
                        <select data-role="coordinate-template"></select>
                        <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="reload-templates">Actualiser</button>
                    </div>
                </label>
                <div class="qa-picker-pages">
                    <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="coordinate-prev" disabled>◀ Page précédente</button>
                    <span data-role="coordinate-page">Page 0 / 0</span>
                    <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="coordinate-next" disabled>Page suivante ▶</button>
                </div>
            </div>
            <div class="qa-modal__body">
                <div class="qa-picker">
                    <div class="qa-picker__frame" data-role="coordinate-wrapper">
                        <canvas data-role="coordinate-canvas" aria-label="Sélection de coordonnée"></canvas>
                        <div class="qa-picker__overlay" aria-hidden="true" data-role="coordinate-overlay"></div>
                    </div>
                    <aside class="qa-picker__side">
                        <p data-role="coordinate-hint">Cliquez dans le PDF pour enregistrer la position.</p>
                        <div class="qa-picker__summary" data-role="coordinate-summary">Aucune coordonnée sélectionnée.</div>
                        <button type="button" class="qa-builder-btn qa-builder-btn--primary" data-action="confirm-coordinate" disabled>Utiliser cette coordonnée</button>
                    </aside>
                </div>
            </div>
        </div>
    </div>

    <div id="client-data-layer" class="client-data-layer" aria-hidden="true"></div>
    <div id="client-data-dialog" class="client-data-dialog" hidden aria-hidden="true">
        <div class="client-data-dialog__backdrop" data-client-dialog-action="dismiss" aria-hidden="true"></div>
        <div class="client-data-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="client-data-dialog-title" tabindex="-1">
            <header class="client-data-dialog__header">
                <div>
                    <p class="qa-pill">Données request.json</p>
                    <h2 id="client-data-dialog-title">Clients sélectionnés</h2>
                </div>
                <div class="client-data-dialog__actions">
                    <button type="button" class="btn-icon" id="client-data-shortcuts">⚡︎ <span class="btn-icon__label">Raccourcis</span></button>
                    <button type="button" class="btn-icon" id="client-data-pin">🔐 <span class="btn-icon__label">Fixer à l’écran</span></button>
                    <button type="button" class="btn-icon" id="client-data-dialog-close" aria-label="Fermer">×</button>
                </div>
            </header>
            <p class="client-data-dialog__hint">Choisissez des clients puis cliquez sur « 👪 » dans Variables &amp; valeurs pour ouvrir ce panneau et parcourir leurs données request.json.</p>
            <div id="client-data-list" class="client-data-dialog__body" hidden></div>
            <div class="client-data-dialog__body">
                <section class="qa-panel qa-panel--scroll" data-tour-target="explorer" id="qa-tour-explorer">
                    <header class="qa-panel__header">
                        <div>
                            <h2>Données request.json</h2>
                            <p>Après avoir coché au moins un client, utilisez les boutons Analyser / Insérer / Ajouter au filtre visibles à droite de chaque champ.</p>
                        </div>
                        <div class="qa-panel__tools">
                            <label class="qa-funnel-search">
                                <span aria-hidden="true">🔎</span>
                                <input type="search" data-role="explorer-search" placeholder="Filtrer les données (effet entonnoir)">
                            </label>
                            <div class="qa-panel__legend">
                                <span class="qa-pill">Élément</span>
                                <span class="qa-pill qa-pill--value">Réponse de l’utilisateur</span>
                                <span class="qa-pill qa-pill--actions">Boutons d’actions</span>
                            </div>
                        </div>
                    </header>
                    <div class="qa-data-explorer" data-role="data-explorer" aria-live="polite">
                        <p class="qa-empty" data-role="explorer-empty">Cochez un client pour révéler ses données.</p>
                    </div>
                    <p class="qa-panel__hint">Chaque ligne affiche la question lisible, la réponse captée et les boutons : Analyser copie le chemin technique dans « Chemin à analyser », Insérer prépare la source de valeur, Ajouter au filtre remplit les termes. Les actions utilisent toujours le vrai chemin technique même si la colonne affiche un texte lisible.</p>
                </section>
            </div>
            <footer class="client-data-dialog__footer">
                <button type="button" class="btn" id="client-data-dialog-cancel">Annuler</button>
                <button type="button" class="btn success" id="client-data-dialog-commit">Terminer la sélection et fixer le bloc</button>
            </footer>
        </div>
    </div>

    <div class="qa-modal" data-role="post-save-modal" aria-modal="true" role="dialog" hidden>
        <div class="qa-modal__dialog qa-modal__dialog--narrow">
            <header class="qa-modal__header">
                <div>
                    <p class="qa-pill">Règle sauvegardée</p>
                    <h3>Souhaitez-vous rester pour créer une nouvelle règle&nbsp;?</h3>
                    <p class="qa-field__help">Choisissez de continuer dans le générateur ou de revenir à la page Questions/Actions.</p>
                </div>
                <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="close-post-save" aria-label="Fermer">×</button>
            </header>
            <div class="qa-modal__body qa-modal__body--stacked">
                <div class="qa-postsave__actions">
                    <button type="button" class="qa-builder-btn qa-builder-btn--primary" data-action="stay-here">Rester et continuer</button>
                    <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="quit-to-manager">Quitter</button>
                </div>
            </div>
        </div>
    </div>

    <div class="qa-builder-faq" id="qa-builder-faq" role="dialog" aria-modal="false" aria-hidden="true" hidden tabindex="-1">
        <div class="qa-builder-faq__panel">
            <header class="qa-builder-faq__header">
                <h2>FAQ – Sélections automatiques</h2>
                <button type="button" class="qa-builder-btn qa-builder-btn--ghost" data-action="close-faq" aria-label="Fermer la FAQ">×</button>
            </header>
            <div class="qa-builder-faq__content">
                <p>Les sélections automatiques analysent les champs d’un ou plusieurs <code>request.json</code> pour ajouter, modifier ou pré-remplir automatiquement une zone du document.</p>
                <h3>Fonctionnement général</h3>
                <ul>
                    <li><strong>Sélectionnez des clients</strong> afin de charger leurs données réelles.</li>
                    <li><strong>Choisissez le chemin</strong> à analyser via l’explorateur ou en saisissant un code précis.</li>
                    <li><strong>Définissez la condition</strong> (contient, égalité, vide, etc.) et les valeurs à surveiller.</li>
                    <li><strong>Sélectionnez la source à insérer</strong> : un autre champ ou un texte libre.</li>
                    <li><strong>Marquez la coordonnée</strong> du document à remplir automatiquement.</li>
                </ul>
                <p>Besoin d’aide pour identifier le bon chemin ? Consultez le <a href="/services/ValuesIdentification/paths.php" target="_blank" rel="noopener">Guide des chemins</a>.</p>
                <h3>Exemples rapides</h3>
                <ul>
                    <li><em>Si</em> <code>formData.adresses[0].ville</code> <strong>est vide</strong> <em>alors</em> insérer « Ville à confirmer » à la page 2.</li>
                    <li><em>Si</em> <code>formData.imposition.taxes.tps</code> <strong>contient</strong> « 0 » <em>alors</em> cocher la case « TPS non applicable ».</li>
                    <li><em>Si</em> <code>formData.adresses[0].province</code> <strong>est égal</strong> à « QC » <em>alors</em> insérer la valeur de <code>formData.adresses[0].libelle</code> dans la section Fiscale.</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="qa-tutorial qa-builder-tutorial" data-role="builder-tutorial" role="dialog" aria-modal="false" aria-hidden="true" hidden>
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
                <div class="qa-tutorial__script-controls" data-role="tutorial-script-controls" hidden>
                    <p class="qa-tutorial__script-status" data-role="tutorial-script-status"></p>
                    <button type="button" class="qa-tutorial__script-next" data-role="tutorial-script-next">Suivant</button>
                </div>
            </div>
            <div class="qa-tutorial__controls">
                <button type="button" class="qa-tutorial__control" data-role="tutorial-prev" aria-label="Étape précédente">◀</button>
                <button type="button" class="qa-tutorial__control qa-tutorial__control--accent" data-role="tutorial-actions" aria-label="Actions possibles">+++</button>
                <button type="button" class="qa-tutorial__control" data-role="tutorial-next" aria-label="Étape suivante">▶</button>
            </div>
        </div>
        <div class="qa-tutorial__action-popover" data-role="tutorial-action-popover" hidden>
            <header class="qa-tutorial__action-header" data-role="action-popover-header">
                <h3>Actions disponibles ici</h3>
                <button type="button" class="qa-tutorial__close" data-role="action-popover-close" aria-label="Fermer">×</button>
            </header>
            <div class="qa-tutorial__action-body">
                <input type="search" class="qa-tutorial__action-search" data-role="action-search" placeholder="Rechercher une action ou un mot-clé">
                <div class="qa-tutorial__action-list" data-role="action-list" aria-live="polite"></div>
                <div class="qa-tutorial__quiz" data-role="action-quiz" hidden>
                    <h4>Exemple guidé</h4>
                    <div class="qa-tutorial__quiz-options" data-role="action-quiz-options"></div>
                </div>
            </div>
        </div>
    </div>
</div>