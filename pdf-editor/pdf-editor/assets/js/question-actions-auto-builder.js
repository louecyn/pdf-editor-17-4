








(function () {
    const API_BASE_URL = 'admin_document_editor_api.php';

    const DEFAULT_OPTIONS = {
        mode: 'embedded',
        onCreate: null,
        onClose: null,
        onCoordinatePick: null,
        initialRequests: [],
    };

    function broadcastLocalSave(payload) {
        if (!payload) {
            return;
        }
        try {
            window.dispatchEvent(new CustomEvent('qa-auto-selection-persisted', { detail: { payload } }));
        } catch (error) {
            console.error(error);
        }
        try {
            window.postMessage({ type: 'question-classes-updated' }, window.location.origin);
        } catch (error) {
            try {
                window.postMessage({ type: 'question-classes-updated' }, '*');
            } catch (nestedError) {
                console.error(nestedError);
            }
        }
    }

    function createTutorialSteps() {
        const demoRule = {
            label: 'Adresse complète',
            clients: ['Tremblay inc.', 'Coop Nova'],
            requestPath: 'formData.adresses[0].ville',
            detectedValue: '"Québec"',
            conditionTerms: 'QC, Québec',
            valuePath: 'formData.adresses[0].libelle',
            literal: 'Adresse à confirmer',
            coordinate: 'page=2;x=145;y=320',
            fallback: 'Texte temporaire si la donnée est vide',
            notes: 'Note perso : règle testée sur Tremblay, à revoir après signature.',
        };
        return [
            {
                title: 'Charger les clients réels',
                text: 'Cochez un ou plusieurs dossiers présents dans /data/requests pour afficher immédiatement leurs request.json.',
                details: [
                    'Plusieurs clients cochés = plusieurs exemples pour tester la règle.',
                    'Chaque client chargé alimente les actions Analyser / Insérer / Ajouter au filtre.',
                ],
                target: '#qa-tour-clients [data-role="client-search"]',
                anchor: '#qa-tour-clients',
                bubblePosition: { side: 'left', offset: 18, align: 'center' },
                demo: {
                    stage: 'Clients sélectionnés',
                    fields: [
                        { label: 'Clients cochés', value: demoRule.clients.join(', ') },
                        { label: 'request.json analysés', value: '2 dossiers prêts' },
                    ],
                    note: 'Cette vue n’existe pas sur la page Questions/Actions principale.',
                },
                script: [
                    {
                        type: 'click',
                        selector: '.qa-client-list input[type="checkbox"]',
                        ensureDemo: 'client',
                        note: 'Coche Jane Doe pour charger son request.json dans le générateur.',
                    },
                ],
            },
            {
                title: 'Utiliser Analyser / Insérer / Ajouter au filtre',
                text: 'Chaque bouton sert à quelque chose de précis : ce petit tutoriel vous montre où cliquer, pourquoi et avec quel impact (tester, recopier, filtrer).',
                details: [
                    'Analyser : copie automatiquement le chemin (ex. formData.adresses[0].ville) dans « Chemin à analyser » pour que vous puissiez dire « si vide » ou « si contient QC ». Exemple : repérer une ville manquante et prévoir « Ville à confirmer ». ',
                    'Insérer : prépare la source à recopier sans ressaisir le chemin. Exemple : reprendre l’adresse complète ou le numéro de référence interne et l’afficher dans le PDF au bon endroit.',
                    'Ajouter au filtre : remplit la zone « Termes à comparer » avec des exemples (QC, approuvé, taux variable) pour surveiller plusieurs cas en une seule règle. Ici « surveiller » signifie que la règle lit plusieurs termes (provinces, statuts, mots-clés) et réagit différemment selon ce qui est trouvé dans les dossiers. Exemples : adapter un paragraphe si la province vaut QC/ON/NB, ajouter un rappel si le statut contient pré-approbation/approuvé/refusé, ou afficher une alerte si un taux variable ou un mot-clé sensible apparaît.',
                ],
                target: '#qa-tour-explorer',
                anchor: '#qa-tour-explorer',
                demo: {
                    stage: 'Explorateur request.json',
                    fields: [
                        { label: 'Chemin', value: demoRule.requestPath },
                        { label: 'Valeur détectée', value: demoRule.detectedValue },
                        { label: 'Actions', value: 'Analyser • Insérer • Ajouter au filtre' },
                    ],
                    note: 'Tout se passe à partir des données réelles des clients cochés.',
                },
                fill: {
                    requestPath: demoRule.requestPath,
                    label: demoRule.label,
                },
                script: [
                    {
                        type: 'ring',
                        selector: '.qa-demo-explorer .qa-explorer-picker',
                        ensureDemo: 'explorer',
                        note: 'Repérez le bouton ⟟ entouré en bleu sur la ligne « Chemin cartographié ».',
                    },
                    {
                        type: 'show-selection-block',
                        note: 'Affiche le bloc jaune « Coordonnées des clients sélectionnés - Jane Doe ».',
                    },
                    {
                        type: 'ring-actions',
                        selector: '.qa-selection-actions button',
                        ensureDemo: 'selection-block',
                        note: 'Encercle les actions A / I / +F pour montrer leur emplacement.',
                    },
                    {
                        type: 'highlight-detail',
                        detailIndex: 1,
                        note: 'Surligne le texte explicatif du bouton Analyser.',
                    },
                    {
                        type: 'highlight-detail',
                        detailIndex: 2,
                        note: 'Surligne le texte explicatif du bouton Insérer.',
                    },
                    {
                        type: 'highlight-detail',
                        detailIndex: 3,
                        note: 'Surligne le texte explicatif du bouton Ajouter au filtre.',
                    },
                ],
            },
            {
                title: 'Trouver le bon chemin avec la cartographie',
                text: 'En plus des données des clients, vous pouvez ouvrir la cartographie complète des chemins pour repérer la clé exacte à surveiller ou à recopier.',
                details: [
                    'Cliquez sur « Voir la cartographie » pour afficher les chemins détaillés depuis ValuesIdentification.',
                    'Le bloc jaune liste instantanément les boutons A / I / +F pour chaque champ détecté.',
                    'La cartographie agit comme un dictionnaire complet des chemins avec un tutoriel intégré pour rappeler comment s’en servir.',
                    'Utilisez ensuite Analyser pour tester le chemin sur les clients cochés.',
                ],
                target: '[data-action="open-cartography"]',
                anchor: '#qa-tour-request-path',
                demo: {
                    stage: 'Cartographie des chemins',
                    fields: [
                        { label: 'Chemin proposé', value: demoRule.requestPath },
                        { label: 'Source', value: 'ValuesIdentification' },
                    ],
                    note: 'Vous restez dans le flux du générateur tout en consultant les chemins.',
                },
                script: [
                    {
                        type: 'highlight-actions',
                        selector: '.qa-explorer-actions',
                        ensureDemo: 'explorer',
                        note: 'Repère les actions A / I / +F visibles dans le bloc jaune pour la ligne ciblée.',
                    },
                    {
                        type: 'click',
                        selector: '[data-action="open-cartography"]',
                        note: 'Montre le bouton « Voir la cartographie » et ouvre la référence complète.',
                    },
                ],
            },
            {
                title: 'Composer la condition détaillée',
                text: 'Choisissez le type de test (contient, égal, vide…) et listez chaque valeur à détecter ou exclure, séparée par des virgules.',
                details: [
                    'Une seule règle peut couvrir plusieurs provinces, statuts ou codes.',
                    'Chaque terme est testé sur les clients cochés pour valider la pertinence.',
                ],
                target: '#qa-tour-condition',
                anchor: '#qa-tour-condition',
                demo: {
                    stage: 'Condition en cours',
                    fields: [
                        { label: 'Chemin analysé', value: demoRule.requestPath },
                        { label: 'Condition', value: 'Contient' },
                        { label: 'Termes surveillés', value: demoRule.conditionTerms },
                    ],
                    note: 'La zone « Termes » accepte autant de valeurs que nécessaire.',
                },
                fill: {
                    conditionType: 'contains',
                    conditionTerms: demoRule.conditionTerms,
                },
            },
            {
                title: 'Choisir la source de valeur',
                text: 'Décidez si la valeur provient d’un autre champ du request.json ou d’un texte fixe selon que vous voulez synchroniser une donnée ou afficher un message.',
                details: [
                    'Le chemin de valeur se révèle uniquement si « Champ du request.json » est choisi.',
                    'Le texte personnalisé reste immuable et n’impacte pas le dossier source.',
                ],
                target: '#qa-tour-value-source',
                anchor: '#qa-tour-value-source',
                demo: {
                    stage: 'Valeur à insérer',
                    fields: [
                        { label: 'Source', value: 'Champ du request.json' },
                        { label: 'Chemin inséré', value: demoRule.valuePath },
                        { label: 'Texte alternatif', value: demoRule.literal },
                    ],
                    note: 'Les champs visibles changent en fonction de la source choisie.',
                },
                fill: {
                    valueSource: 'request',
                    valuePath: demoRule.valuePath,
                    valueLiteral: demoRule.literal,
                },
            },
            {
                title: 'Prévoir les plans B et le contexte',
                text: 'Activez la valeur alternative pour insérer un plan B si la donnée principale est vide. Ajoutez ensuite vos notes personnelles (pour vous souvenir quand activer/désactiver la règle ou quels cas elle couvre).',
                details: [
                    'La valeur alternative ne s’affiche que si vous activez son interrupteur (elle reste cachée sinon).',
                    'Les notes sont vos rappels personnels visibles uniquement dans Questions/Actions lorsque vous rouvrez la règle.',
                ],
                target: '[data-action="toggle-fallback"]',
                anchor: '#qa-tour-value-source',
                demo: {
                    stage: 'Plans B activés',
                    fields: [
                        { label: 'Valeur principale', value: demoRule.valuePath },
                        { label: 'Valeur alternative', value: demoRule.fallback },
                        { label: 'Notes internes', value: demoRule.notes },
                    ],
                    note: 'Ces champs n’apparaissent pas tant que vous ne les avez pas activés.',
                },
                fill: {
                    fallback: demoRule.fallback,
                    notes: demoRule.notes,
                },
            },
            {
                title: 'Pointer la coordonnée',
                text: 'Utilisez « Choisir sur le document » pour ouvrir le sélecteur PDF, cliquez sur la zone cible puis validez pour récupérer automatiquement la coordonnée.',
                details: [
                    'Le bouton fonctionne uniquement depuis la page Questions/Actions d’origine.',
                    'La coordonnée récupérée est visible et modifiable avant l’envoi.',
                    'Si l’onglet d’origine est fermé, utilisez le PDF d’exemple pour quand même choisir un point.',
                ],
                target: '#qa-tour-coordinate',
                anchor: '#qa-tour-coordinate',
                demo: {
                    stage: 'Coordonnée sélectionnée',
                    fields: [
                        { label: 'Coordonnée', value: demoRule.coordinate },
                        { label: 'Libellé', value: demoRule.label },
                    ],
                    note: 'La bulle se déplace pour entourer la zone cliquée.',
                },
                fill: {
                    coordinate: demoRule.coordinate,
                    label: demoRule.label,
                },
            },
            {
                title: 'Enregistrer et retourner',
                text: 'Validez le formulaire puis cliquez sur « Enregistrer » : la règle est envoyée, visible en direct sur le modèle ouvert et synchronisée dans tous les écrans.',
                details: [
                    'Les notes suivent la règle dans Questions/Actions et restent visibles uniquement pour vous.',
                    'L’enregistrement déclenche l’actualisation de la classe/du document ouvert dans Questions/Actions et dans l’aperçu du modèle.',
                    'Vous pouvez rouvrir cette page plus tard pour créer d’autres règles sans perdre les précédentes.',
                ],
                target: '[data-action="submit-builder"]',
                demo: {
                    stage: 'Envoi confirmé',
                    fields: [
                        { label: 'Destination', value: 'Questions/Actions → Auto' },
                        { label: 'Statut', value: 'Règle transmise' },
                        { label: 'Retour', value: 'Fenêtre fermée après sauvegarde' },
                    ],
                    note: 'Vous pouvez rouvrir cette page à tout moment pour préparer d’autres règles.',
                },
            },
        ];
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function normalizeStandaloneClass(raw) {
        if (!raw || typeof raw !== 'object') {
            return null;
        }
        const id = typeof raw.id === 'string' ? raw.id.trim() : '';
        const title = typeof raw.title === 'string' ? raw.title.trim() : '';
        const code = typeof raw.code === 'string' ? raw.code.trim() : '';
        const documentId = typeof raw.documentId === 'string' ? raw.documentId.trim() : '';
        if (!id || !title || !code || !documentId) {
            return null;
        }
        const metadata = typeof raw.metadata === 'object' && raw.metadata !== null ? { ...raw.metadata } : {};
        delete metadata.autoSelections;
        delete metadata.documentId;
        delete metadata.documentName;
        const autoSelections = Array.isArray(raw.autoSelections)
            ? raw.autoSelections
            : (Array.isArray(raw.metadata?.autoSelections) ? raw.metadata.autoSelections : []);
        return {
            id,
            title,
            code,
            description: typeof raw.description === 'string' ? raw.description : '',
            questions: Array.isArray(raw.questions) ? raw.questions : [],
            responseBlobs: Array.isArray(raw.responseBlobs) ? raw.responseBlobs : (Array.isArray(raw.blobs) ? raw.blobs : []),
            autoSelections,
            metadata,
            documentId,
            documentName: typeof raw.documentName === 'string'
                ? raw.documentName.trim()
                : (typeof raw.metadata?.documentName === 'string' ? raw.metadata.documentName.trim() : ''),
        };
    }

    async function loadStandaloneClass(builderState) {
        if (!builderState) {
            return null;
        }
        const response = await fetch(`${API_BASE_URL}?action=listQuestionClasses`, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Impossible de récupérer la classe cible.');
        }
        const payload = await response.json();
        const classes = Array.isArray(payload.data?.classes) ? payload.data.classes : [];
        const resolvedId = builderState.targetClassId
            || classes.find(item => item?.documentId && item.documentId === builderState.fallbackTemplateId)?.id
            || classes[0]?.id
            || '';
        if (resolvedId && builderState.targetClassId !== resolvedId) {
            builderState.targetClassId = resolvedId;
        }
        if (!resolvedId) {
            return null;
        }
        if (builderState.cachedClass && builderState.cachedClass.id === resolvedId) {
            return builderState.cachedClass;
        }
        const found = classes.find(item => item && item.id === resolvedId);
        const normalized = normalizeStandaloneClass(found);
        if (!normalized) {
            throw new Error('Classe de Questions/Actions introuvable ou incomplète.');
        }
        builderState.cachedClass = normalized;
        return normalized;
    }

    async function persistStandaloneAutoSelection(builderState, payload) {
        const baseClass = await loadStandaloneClass(builderState);
        if (!baseClass) {
            throw new Error('Impossible d’identifier la classe Questions/Actions cible pour enregistrer la règle.');
        }
        const metadata = { ...(baseClass.metadata ?? {}) };
        delete metadata.autoSelections;
        delete metadata.documentId;
        delete metadata.documentName;
        const updated = {
            ...baseClass,
            metadata,
            autoSelections: [...(baseClass.autoSelections ?? []), payload],
        };
        const response = await fetch(`${API_BASE_URL}?action=saveQuestionClass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ class: updated }),
        });
        if (!response.ok) {
            throw new Error('Impossible d’enregistrer la règle automatiquement.');
        }
        const body = await response.json();
        const savedClass = body?.class ?? body?.data?.class ?? null;
        if (!savedClass) {
            throw new Error('Réponse incomplète lors de la sauvegarde.');
        }
        builderState.cachedClass = normalizeStandaloneClass(savedClass) ?? baseClass;
        try {
            window.opener?.postMessage({ type: 'question-classes-updated' }, window.location.origin);
        } catch (error) {
            try {
                window.opener?.postMessage({ type: 'question-classes-updated' }, '*');
            } catch (nestedError) {
                // Ignore cross-origin errors
            }
        }
        return true;
    }

    function resolveDimension(element, key) {
        const candidate = Number(element?.[key]);
        if (Number.isFinite(candidate) && candidate > 0) {
            return candidate;
        }
        const dataSize = Number(element?.data?.size?.[key]);
        if (Number.isFinite(dataSize) && dataSize > 0) {
            return dataSize;
        }
        return undefined;
    }

    function normalizeTemplateElements(elements) {
        if (!Array.isArray(elements)) {
            return [];
        }
        return elements.map(item => {
            const width = resolveDimension(item, 'width');
            const height = resolveDimension(item, 'height');
            const x = Number(item?.x);
            const y = Number(item?.y);
            const pageRaw = Number(item?.page);
            const page = Number.isFinite(pageRaw) ? pageRaw + 1 : undefined;
            return {
                ...item,
                ...(Number.isFinite(x) ? { x } : {}),
                ...(Number.isFinite(y) ? { y } : {}),
                ...(Number.isFinite(page) ? { page } : {}),
                ...(Number.isFinite(width) ? { width } : {}),
                ...(Number.isFinite(height) ? { height } : {}),
            };
        });
    }

    function normalizeClientData(data) {
        if (!data) {
            return { request: {} };
        }
        if (typeof data === 'object' && data.data) {
            return normalizeClientData(data.data);
        }
        if (typeof data === 'object') {
            return {
                request: data.request ?? (data.fused ?? {}),
                fused: data.fused ?? null,
            };
        }
        return { request: {} };
    }

    function mount(root, options = {}) {
        if (!(root instanceof HTMLElement)) {
            return null;
        }
        const settings = { ...DEFAULT_OPTIONS, ...options };
        const doc = root.ownerDocument;
        const elements = {
            clientList: root.querySelector('[data-role="client-list"]'),
            clientEmpty: root.querySelector('[data-role="client-empty"]'),
            clientSearch: root.querySelector('[data-role="client-search"]'),
            dataExplorer: root.querySelector('[data-role="data-explorer"]'),
            explorerEmpty: root.querySelector('[data-role="explorer-empty"]'),
            explorerSearch: root.querySelector('[data-role="explorer-search"]'),
            selectedCount: root.querySelector('[data-role="selected-count"]'),
            selectClientsBtn: root.querySelector('[data-action="focus-clients"]'),
            form: root.querySelector('[data-role="rule-form"]'),
            feedback: root.querySelector('[data-role="rule-feedback"]'),
            conditionTerms: root.querySelector('[data-role="condition-terms"]'),
            valuePath: root.querySelector('[data-role="value-path"]'),
            valueLiteral: root.querySelector('[data-role="value-literal"]'),
            faq: root.querySelector('#qa-builder-faq'),
            tutorial: root.querySelector('[data-role="builder-tutorial"]'),
            tutorialBubble: root.querySelector('[data-role="tutorial-bubble"]'),
            tutorialSpotlight: root.querySelector('[data-role="tutorial-spotlight"]'),
            tutorialStep: root.querySelector('[data-role="tutorial-step"]'),
            tutorialTitle: root.querySelector('[data-role="tutorial-title"]'),
            tutorialText: root.querySelector('[data-role="tutorial-text"]'),
            tutorialExamples: root.querySelector('[data-role="tutorial-examples"]'),
            tutorialSimulation: root.querySelector('[data-role="tutorial-simulation"]'),
            tutorialScriptControls: root.querySelector('[data-role="tutorial-script-controls"]'),
            tutorialScriptNext: root.querySelector('[data-role="tutorial-script-next"]'),
            tutorialScriptStatus: root.querySelector('[data-role="tutorial-script-status"]'),
            tutorialBackdrop: root.querySelector('[data-role="tutorial-backdrop"]'),
            tutorialActionsBtn: root.querySelector('[data-role="tutorial-actions"]'),
            tutorialActionPopover: root.querySelector('[data-role="tutorial-action-popover"]'),
            tutorialActionList: root.querySelector('[data-role="action-list"]'),
            tutorialActionSearch: root.querySelector('[data-role="action-search"]'),
            tutorialActionClose: root.querySelector('[data-role="action-popover-close"]'),
            tutorialQuiz: root.querySelector('[data-role="action-quiz"]'),
            tutorialQuizOptions: root.querySelector('[data-role="action-quiz-options"]'),
            fallbackField: root.querySelector('[data-role="fallback-field"]'),
            notesField: root.querySelector('[data-role="notes-field"]'),
            previewSelect: root.querySelector('[data-role="preview-template"]'),
            previewStatus: root.querySelector('[data-role="preview-status"]'),
            previewBanner: root.querySelector('[data-role="preview-banner"]'),
            previewTemplateLabel: root.querySelector('[data-role="preview-template-label"]'),
            previewPageCount: root.querySelector('[data-role="preview-page-count"]'),
            previewPill: root.querySelector('[data-role="preview-pill"]'),
            previewCanvas: root.querySelector('[data-role="preview-canvas"]'),
            previewOverlay: root.querySelector('[data-role="preview-overlay"]'),
            previewLog: root.querySelector('[data-role="preview-log"]'),
            previewPage: root.querySelector('[data-role="preview-page"]'),
            previewPrev: root.querySelector('[data-action="preview-prev"]'),
            previewNext: root.querySelector('[data-action="preview-next"]'),
            previewWrapper: root.querySelector('[data-role="preview-wrapper"]'),
            postSaveModal: root.querySelector('[data-role="post-save-modal"]'),
            postSaveStay: root.querySelector('[data-action="stay-here"]'),
            postSaveQuit: root.querySelector('[data-action="quit-to-manager"]'),
            postSaveClose: root.querySelector('[data-action="close-post-save"]'),
            coordinateModal: root.querySelector('[data-role="coordinate-modal"]'),
            coordinateCanvas: root.querySelector('[data-role="coordinate-canvas"]'),
            coordinateOverlay: root.querySelector('[data-role="coordinate-overlay"]'),
            coordinatePage: root.querySelector('[data-role="coordinate-page"]'),
            coordinatePrev: root.querySelector('[data-action="coordinate-prev"]'),
            coordinateNext: root.querySelector('[data-action="coordinate-next"]'),
            coordinateUse: root.querySelector('[data-action="confirm-coordinate"]'),
            coordinateSelect: root.querySelector('[data-role="coordinate-template"]'),
            coordinateStatus: root.querySelector('[data-role="coordinate-status"]'),
            coordinateSummary: root.querySelector('[data-role="coordinate-summary"]'),
            coordinateHint: root.querySelector('[data-role="coordinate-hint"]'),
            templateList: root.querySelector('[data-role="template-card-list"]'),
            templateEmpty: root.querySelector('[data-role="template-empty"]'),
            templateCardTemplate: doc.getElementById('qa-template-card-template'),
        };

        const state = {
            clients: [],
            filteredClients: [],
            clientSearchQuery: '',
            explorerSearchQuery: '',
            selectedClientIds: new Set(),
            clientDataCache: new Map(),
            clientSelections: new Map(),
            clientSelectionDraft: new Map(),
            clientEmptyMessage: 'Aucun client trouvé.',
            tutorialSteps: createTutorialSteps(),
            tutorialIndex: 0,
            tutorialPosition: null,
            tutorialSelectionPosition: null,
            targetClassId: '',
            cachedClass: null,
            fallbackTemplateId: '',
            actions: [
                { label: 'Charger les clients', description: 'Lit les dossiers présents dans /data/requests pour afficher les request.json disponibles sans rien deviner.', key: 'clients' },
                { label: 'Analyser un chemin', description: 'Copie le chemin sélectionné dans « Chemin à analyser » pour que vous puissiez dire « si vide » ou « si contient QC ».', key: 'analyser' },
                { label: 'Insérer une valeur', description: 'Prépare la source de valeur (chemin ou texte) à injecter dans le document au bon endroit.', key: 'inserer' },
                { label: 'Ajouter au filtre', description: 'Ajoute des exemples de termes (provinces, statuts, mots) pour surveiller plusieurs cas en une règle.', key: 'filtre' },
                { label: 'Choisir la coordonnée', description: 'Ouvre le sélecteur PDF (ou le PDF d’exemple) pour cibler la zone à remplir.', key: 'coordonnée' },
                { label: 'Ouvrir la cartographie', description: 'Consulte la liste des chemins disponibles dans ValuesIdentification.', key: 'cartographie' },
                { label: 'Enregistrer', description: 'Envoie la règle à la classe active, déclenche l’enregistrement, puis reste sur cette page.', key: 'enregistrer' },
            ],
            filteredActions: [],
        };

        state.filteredActions = [...state.actions];

        const tutorialPlayback = { timers: [], cursor: null, artifacts: [], log: null, queue: [], pointer: 0 };

        const params = new URLSearchParams(window.location.search || '');
        const classIdParam = params.get('class');
        if (classIdParam) {
            state.targetClassId = classIdParam.trim();
        }

        let returnTimer = null;
        const dragState = { active: false, offsetX: 0, offsetY: 0 };
        const popoverDragState = { active: false, offsetX: 0, offsetY: 0 };
        const selectionDragState = { active: false, offsetX: 0, offsetY: 0 };
        let demoSnapshot = null;
        let tutorialSelectionBlock = null;
        const templateState = { templates: [], loading: false };
        const templatePreviewCache = new Map();
        const previewState = { pdfDoc: null, templateId: '', templateName: '', currentPage: 1, pageCount: 0, viewport: null, renderTask: null, summary: null, templateElements: [] };
        const previewMarker = { page: null, vx: null, vy: null };
        const coordinateState = { pdfDoc: null, templateId: '', currentPage: 1, pageCount: 0, viewport: null, renderTask: null, selected: null };
        let pdfLoaderPromise = null;
        let previewPickMode = false;

        function formatValuePreview(value) {
            if (value === null) {
                return 'null';
            }
            if (typeof value === 'string') {
                return value.length > 80 ? `${value.slice(0, 77)}…` : value || '""';
            }
            if (typeof value === 'number' || typeof value === 'boolean') {
                return String(value);
            }
            if (Array.isArray(value)) {
                return `Tableau (${value.length})`;
            }
            if (value && typeof value === 'object') {
                const keys = Object.keys(value);
                return `Objet (${keys.length})`;
            }
            return '';
        }

        function cloneSelectionMap(source) {
            const next = new Map();
            source.forEach((entries, clientId) => {
                const set = new Map();
                entries.forEach((entry, path) => {
                    set.set(path, { ...entry });
                });
                next.set(clientId, set);
            });
            return next;
        }

        function ensureDraftSelection(clientId) {
            let set = state.clientSelectionDraft.get(clientId);
            if (!set) {
                set = new Map();
                state.clientSelectionDraft.set(clientId, set);
            }
            return set;
        }

        function ensureCommittedSelection(clientId) {
            let set = state.clientSelections.get(clientId);
            if (!set) {
                set = new Map();
                state.clientSelections.set(clientId, set);
            }
            return set;
        }

        function pruneSelections() {
            const allowed = state.selectedClientIds;
            [state.clientSelections, state.clientSelectionDraft].forEach(map => {
                Array.from(map.keys()).forEach(clientId => {
                    if (!allowed.has(clientId)) {
                        map.delete(clientId);
                    }
                });
            });
        }

        function setFeedback(message, { error = false } = {}) {
            if (!elements.feedback) {
                return;
            }
            if (!message) {
                elements.feedback.hidden = true;
                elements.feedback.textContent = '';
                elements.feedback.classList.remove('is-error');
                return;
            }
            elements.feedback.hidden = false;
            elements.feedback.textContent = message;
            elements.feedback.classList.toggle('is-error', error);
        }

        function parseCoordinateValue(value) {
            if (typeof value !== 'string') {
                return null;
            }
            const text = value.trim();
            if (!text) {
                return null;
            }
            const pageMatch = text.match(/page\s*[:=]?\s*(\d+)/i);
            const xMatch = text.match(/x\s*[:=]?\s*(-?[0-9]+(?:[.,][0-9]+)?)/i);
            const yMatch = text.match(/y\s*[:=]?\s*(-?[0-9]+(?:[.,][0-9]+)?)/i);
            if (pageMatch && xMatch && yMatch) {
                const page = parseInt(pageMatch[1], 10);
                const x = parseFloat(xMatch[1].replace(',', '.'));
                const y = parseFloat(yMatch[1].replace(',', '.'));
                if (Number.isFinite(page) && Number.isFinite(x) && Number.isFinite(y)) {
                    return { page, x, y };
                }
            }
            return null;
        }

        function ensurePdfjs() {
            if (window.pdfjsLib) {
                configurePdfWorker();
                return Promise.resolve(window.pdfjsLib);
            }
            if (!pdfLoaderPromise) {
                pdfLoaderPromise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                    script.onload = () => {
                        configurePdfWorker();
                        resolve(window.pdfjsLib);
                    };
                    script.onerror = () => reject(new Error('Impossible de charger le module PDF.'));
                    document.head.appendChild(script);
                });
            }
            return pdfLoaderPromise;
        }

        function configurePdfWorker() {
            if (!window.pdfjsLib || !window.pdfjsLib.GlobalWorkerOptions) {
                return;
            }
            if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
        }

        async function fetchTemplates(force = false) {
            if (templateState.templates.length && !force) {
                return templateState.templates;
            }
            templateState.loading = true;
            try {
                const response = await fetch(`${API_BASE_URL}?action=listTemplates`, { credentials: 'same-origin' });
                if (!response.ok) {
                    throw new Error(`Réponse ${response.status}`);
                }
                const payload = await response.json();
                const templates = Array.isArray(payload?.data?.templates)
                    ? payload.data.templates
                    : Array.isArray(payload?.templates)
                        ? payload.templates
                        : [];
                templateState.templates = templates;
                return templates;
            } catch (error) {
                console.error('Impossible de charger les modèles', error);
                return templateState.templates;
            } finally {
                templateState.loading = false;
            }
        }

        function populateTemplateOptions(select, templates, placeholder = 'Choisir un modèle') {
            if (!(select instanceof HTMLSelectElement)) {
                return;
            }
            select.innerHTML = '';
            const empty = document.createElement('option');
            empty.value = '';
            empty.textContent = placeholder;
            select.appendChild(empty);
            templates.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                select.appendChild(option);
            });
        }

        function setActiveTemplateCard(templateId) {
            if (!elements.templateList) {
                return;
            }
            elements.templateList.querySelectorAll('.qa-template-card').forEach(card => {
                const isActive = card.dataset.templateId === templateId;
                card.classList.toggle('is-active', isActive);
            });
        }

        function createTemplateCard(template) {
            if (!template) {
                const fallback = doc.createElement('li');
                fallback.textContent = 'Modèle inconnu';
                return fallback;
            }
            const tpl = elements.templateCardTemplate;
            const node = tpl?.content?.firstElementChild?.cloneNode(true) || doc.createElement('li');
            node.dataset.templateId = template.id;
            const button = node.querySelector('[data-role="template-card-primary"]') || node;
            const name = node.querySelector('[data-role="template-card-name"]');
            const meta = node.querySelector('[data-role="template-card-meta"]');
            const preview = node.querySelector('[data-role="template-card-preview"]');
            if (name) {
                name.textContent = template.name || template.id || 'Document';
            }
            if (meta) {
                meta.textContent = 'Cliquez pour charger ce modèle dans l’aperçu live.';
            }
            if (preview) {
                renderTemplatePreview(template, preview).catch(error => console.error(error));
            }
            button.addEventListener('click', () => {
                if (elements.previewSelect) {
                    elements.previewSelect.value = template.id;
                }
                setActiveTemplateCard(template.id);
                loadPreviewTemplate(template.id);
            });
            return node;
        }

        async function renderTemplatePreview(template, previewSlot) {
            if (!(previewSlot instanceof HTMLElement) || !template?.publicPath) {
                return;
            }
            const cached = templatePreviewCache.get(template.id);
            if (cached) {
                previewSlot.innerHTML = '';
                const img = doc.createElement('img');
                img.src = cached;
                img.alt = '';
                previewSlot.appendChild(img);
                return;
            }
            previewSlot.textContent = 'Prévisualisation…';
            await ensurePdfjs();
            try {
                const pdf = await window.pdfjsLib.getDocument({ url: template.publicPath, withCredentials: false }).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                const targetWidth = 320;
                const scale = Math.min(1.5, targetWidth / viewport.width);
                const scaledViewport = page.getViewport({ scale });
                const canvas = doc.createElement('canvas');
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                const context = canvas.getContext('2d');
                if (!context) {
                    previewSlot.textContent = '';
                    return;
                }
                await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
                const dataUrl = canvas.toDataURL('image/png');
                templatePreviewCache.set(template.id, dataUrl);
                previewSlot.innerHTML = '';
                const img = doc.createElement('img');
                img.src = dataUrl;
                img.alt = '';
                previewSlot.appendChild(img);
            } catch (error) {
                console.error('Impossible de générer la prévisualisation du modèle', error);
                previewSlot.textContent = '';
            }
        }

        function renderTemplateLibrary(templates) {
            if (!elements.templateList || !elements.templateEmpty) {
                return;
            }
            elements.templateList.innerHTML = '';
            const hasTemplates = Array.isArray(templates) && templates.length > 0;
            elements.templateEmpty.hidden = hasTemplates;
            if (!hasTemplates) {
                return;
            }
            templates.forEach(template => {
                elements.templateList.appendChild(createTemplateCard(template));
            });
            setActiveTemplateCard(elements.previewSelect?.value || previewState.templateId || templates[0]?.id || '');
        }

        function setPreviewStatus(message, { error = false, ready = false, templateName = '', pageCount = null } = {}) {
            if (elements.previewStatus) {
                elements.previewStatus.textContent = message;
                elements.previewStatus.classList.toggle('is-error', error);
            }
            const shouldShowBanner = !error && ready;
            if (elements.previewBanner) {
                elements.previewBanner.hidden = !shouldShowBanner;
            }
            if (!shouldShowBanner) {
                return;
            }
            const name = templateName || previewState.templateName || 'Modèle sélectionné';
            const count = typeof pageCount === 'number' ? pageCount : previewState.pageCount;
            if (elements.previewTemplateLabel) {
                elements.previewTemplateLabel.textContent = name;
            }
            if (elements.previewPageCount) {
                elements.previewPageCount.textContent = count ? `· ${count} page${count > 1 ? 's' : ''}` : '';
            }
            if (elements.previewPill) {
                elements.previewPill.textContent = 'Aperçu chargé';
            }
        }

        function setCoordinateStatus(message, { error = false } = {}) {
            if (!elements.coordinateStatus) {
                return;
            }
            elements.coordinateStatus.textContent = message;
            elements.coordinateStatus.classList.toggle('is-error', error);
        }

        function updateSelectedCount() {
            if (!elements.selectedCount) {
                return;
            }
            const count = state.selectedClientIds.size;
            if (count === 0) {
                elements.selectedCount.textContent = 'Sélectionnez des clients dans la colonne de gauche pour activer les actions.';
                elements.selectClientsBtn?.removeAttribute('hidden');
                return;
            }
            elements.selectClientsBtn?.setAttribute('hidden', 'hidden');
            if (count === 1) {
                const id = Array.from(state.selectedClientIds)[0];
                const client = state.clients.find(item => item.id === id);
                elements.selectedCount.textContent = client ? `1 client sélectionné : ${client.displayName}` : '1 client sélectionné.';
                return;
            }
            elements.selectedCount.textContent = `${count} clients sélectionnés.`;
        }

        function focusClientSelector() {
            if (!elements.clientList) {
                return;
            }
            elements.clientList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.setTimeout(() => {
                const checkbox = elements.clientList?.querySelector('input[type="checkbox"]');
                checkbox?.focus({ preventScroll: true });
            }, 400);
        }

        function humanizePath(path) {
            if (!path) {
                return 'Élément sans nom';
            }
            return path
                .replace(/\.(\d+)/g, ' [$1]')
                .replace(/[._]/g, ' ')
                .trim();
        }

        function buildRows(value, path = '') {
            const rows = [];
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const childPath = path ? `${path}.${index}` : String(index);
                    rows.push(...buildRows(item, childPath));
                });
                return rows;
            }
            if (value && typeof value === 'object') {
                Object.keys(value).sort().forEach(key => {
                    const childPath = path ? `${path}.${key}` : key;
                    rows.push(...buildRows(value[key], childPath));
                });
                return rows;
            }
            rows.push({ path: path || '(racine)', label: humanizePath(path || '(racine)'), value });
            return rows;
        }

        function normalizeSearchText(text) {
            if (typeof text !== 'string') {
                return '';
            }
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        function filterExplorerRows(rows) {
            const query = normalizeSearchText(state.explorerSearchQuery?.trim() || '');
            if (!query) {
                return rows;
            }
            return rows.filter(row => {
                const value = typeof row.value === 'string' ? row.value : JSON.stringify(row.value ?? '');
                const haystack = normalizeSearchText(`${row.label} ${row.path} ${value}`);
                return haystack.includes(query);
            });
        }

        function renderDataExplorer({ skipBroadcast = false } = {}) {
            if (!elements.dataExplorer) {
                return;
            }
            pruneSelections();
            elements.dataExplorer.innerHTML = '';
            if (state.selectedClientIds.size === 0) {
                if (elements.explorerEmpty) {
                    elements.explorerEmpty.hidden = false;
                    elements.dataExplorer.appendChild(elements.explorerEmpty);
                }
                broadcastClientSelection();
                return;
            }
            if (elements.explorerEmpty) {
                elements.explorerEmpty.hidden = true;
            }
                state.selectedClientIds.forEach(clientId => {
                    const wrapper = doc.createElement('div');
                    wrapper.className = 'qa-explorer-client';
                    const header = doc.createElement('header');
                    const title = doc.createElement('span');
                    const client = state.clients.find(item => item.id === clientId);
                title.textContent = client ? client.displayName : clientId;
                header.appendChild(title);
                if (client && typeof client.documentCount === 'number') {
                    const count = doc.createElement('span');
                    count.textContent = `${client.documentCount} documents`;
                    header.appendChild(count);
                }
                wrapper.appendChild(header);

                const clientData = state.clientDataCache.get(clientId);
                const selectionDraft = state.clientSelectionDraft.get(clientId) ?? new Map();
                const committedSelection = state.clientSelections.get(clientId) ?? new Map();
                const requestData = clientData?.request && Object.keys(clientData.request).length ? clientData.request : null;
                const fusedData = clientData?.fused && Object.keys(clientData.fused).length ? clientData.fused : null;
                if (!clientData) {
                    const loading = doc.createElement('p');
                    loading.className = 'qa-empty';
                    loading.textContent = 'Chargement des données…';
                    wrapper.appendChild(loading);
                } else if (!requestData && !fusedData) {
                    const empty = doc.createElement('p');
                    empty.className = 'qa-empty';
                    empty.textContent = 'Aucune donnée disponible dans request.json.';
                    wrapper.appendChild(empty);
                } else {
                    const rows = buildRows(requestData ?? fusedData ?? {});
                    const filteredRows = filterExplorerRows(rows);
                    if (rows.length === 0) {
                        const empty = doc.createElement('p');
                        empty.className = 'qa-empty';
                        empty.textContent = 'Aucune donnée exploitable.';
                        wrapper.appendChild(empty);
                    } else if (filteredRows.length === 0) {
                        const empty = doc.createElement('p');
                        empty.className = 'qa-empty';
                        empty.textContent = `Aucun résultat ne correspond à « ${state.explorerSearchQuery} ». Tapez un autre mot pour affiner l’entonnoir.`;
                        wrapper.appendChild(empty);
                    } else {
                        const table = doc.createElement('table');
                        table.className = 'qa-explorer-table';
                        const thead = doc.createElement('thead');
                        const headRow = doc.createElement('tr');
                        ['⟟', 'Élément', 'Réponse de l’utilisateur', 'Boutons d’actions'].forEach(label => {
                            const th = doc.createElement('th');
                            th.textContent = label;
                            headRow.appendChild(th);
                        });
                        thead.appendChild(headRow);
                        table.appendChild(thead);

                        const tbody = doc.createElement('tbody');
                        filteredRows.forEach(row => {
                            const tr = doc.createElement('tr');
                            tr.dataset.clientId = clientId;
                            tr.dataset.path = row.path;
                            const isSelected = selectionDraft.has(row.path) || committedSelection.has(row.path);
                            if (isSelected) {
                                tr.classList.add('qa-explorer-row--selected');
                            }

                            const pickerCell = doc.createElement('td');
                            const picker = doc.createElement('button');
                            picker.type = 'button';
                            picker.className = 'qa-explorer-picker';
                            picker.dataset.action = 'toggle-selection';
                            picker.dataset.clientId = clientId;
                            picker.dataset.path = row.path;
                            picker.dataset.label = row.label;
                            picker.dataset.preview = formatValuePreview(row.value);
                            picker.title = 'Sélectionner cet élément';
                            picker.textContent = '⟟';
                            picker.classList.toggle('is-selected', isSelected);
                            pickerCell.appendChild(picker);

                            const labelCell = doc.createElement('td');
                            labelCell.innerHTML = `<strong>${row.label}</strong><br><small>Chemin : ${row.path}</small>`;
                            const valueCell = doc.createElement('td');
                            valueCell.textContent = formatValuePreview(row.value);
                            const actionsCell = doc.createElement('td');
                            actionsCell.className = 'qa-explorer-actions';
                            tr.dataset.path = row.path;

                            const conditionBtn = doc.createElement('button');
                            conditionBtn.type = 'button';
                            conditionBtn.dataset.action = 'use-condition';
                            conditionBtn.dataset.path = row.path;
                            conditionBtn.dataset.sample = typeof row.value === 'string' ? row.value : '';
                            conditionBtn.textContent = 'Analyser';
                            conditionBtn.title = 'Copie le chemin dans « Chemin à analyser »';
                            actionsCell.appendChild(conditionBtn);

                            const valueBtn = doc.createElement('button');
                            valueBtn.type = 'button';
                            valueBtn.dataset.action = 'use-value';
                            valueBtn.dataset.path = row.path;
                            valueBtn.textContent = 'Insérer';
                            valueBtn.title = 'Prépare la source à copier';
                            actionsCell.appendChild(valueBtn);

                            if (typeof row.value === 'string' && row.value.trim() !== '') {
                                const termBtn = doc.createElement('button');
                                termBtn.type = 'button';
                                termBtn.dataset.action = 'use-term';
                                termBtn.dataset.sample = row.value;
                                termBtn.textContent = 'Ajouter au filtre';
                                termBtn.title = 'Remplit les termes à comparer';
                                actionsCell.appendChild(termBtn);
                            }

                            tr.appendChild(pickerCell);
                            tr.appendChild(labelCell);
                            tr.appendChild(valueCell);
                            tr.appendChild(actionsCell);
                            tbody.appendChild(tr);
                        });
                        table.appendChild(tbody);
                        wrapper.appendChild(table);
                        if (committedSelection.size > 0) {
                            const block = doc.createElement('div');
                            block.className = 'client-data-block';
                            const header = doc.createElement('header');
                            const title = doc.createElement('strong');
                            title.textContent = `Coordonnées des clients sélectionnés - ${client ? client.displayName : clientId}`;
                            header.appendChild(title);
                            block.appendChild(header);
                            const summaryTable = doc.createElement('table');
                            summaryTable.className = 'client-data-selection-table';
                            const summaryHead = doc.createElement('thead');
                            const summaryRow = doc.createElement('tr');
                            ['Chemin', 'Valeur', 'Boutons d’actions'].forEach(text => {
                                const th = doc.createElement('th');
                                th.textContent = text;
                                summaryRow.appendChild(th);
                            });
                            summaryHead.appendChild(summaryRow);
                            summaryTable.appendChild(summaryHead);
                            const summaryBody = doc.createElement('tbody');
                            committedSelection.forEach(entry => {
                                const row = doc.createElement('tr');
                                row.dataset.path = entry.path;
                                const pathCell = doc.createElement('td');
                                pathCell.innerHTML = `<strong>${entry.label || entry.path}</strong><br><small>${entry.path}</small>`;
                                const valueCell = doc.createElement('td');
                                valueCell.textContent = entry.value || '—';
                                const actionCell = doc.createElement('td');
                                actionCell.className = 'qa-selection-actions';
                                [
                                    { label: 'A', title: 'Analyser (copie le chemin dans « Chemin à analyser »)' },
                                    { label: 'I', title: 'Insérer (prépare la source à copier)' },
                                    { label: '+F', title: 'Ajouter au filtre (remplit les termes à comparer)' },
                                ].forEach(config => {
                                    const btn = doc.createElement('button');
                                    btn.type = 'button';
                                    btn.textContent = config.label;
                                    btn.title = config.title;
                                    actionCell.appendChild(btn);
                                });
                                row.appendChild(pathCell);
                                row.appendChild(valueCell);
                                row.appendChild(actionCell);
                                summaryBody.appendChild(row);
                            });
                            summaryTable.appendChild(summaryBody);
                            block.appendChild(summaryTable);
                            wrapper.appendChild(block);
                        }
                    }
                }
                elements.dataExplorer.appendChild(wrapper);
            });
            if (!skipBroadcast) {
                broadcastClientSelection();
            }
        }

        function resetSelectionDraft() {
            state.clientSelectionDraft = cloneSelectionMap(state.clientSelections);
            pruneSelections();
            renderDataExplorer();
        }

        function commitSelectionDraft({ pin = false } = {}) {
            state.clientSelections = cloneSelectionMap(state.clientSelectionDraft);
            broadcastClientSelection();
            renderDataExplorer({ skipBroadcast: true });
            if (pin) {
                doc.getElementById('client-data-pin')?.click();
            }
        }

        window.beginClientSelectionSession = () => {
            resetSelectionDraft();
        };

        window.cancelClientSelectionSession = () => {
            resetSelectionDraft();
        };

        window.commitClientSelectionAndPin = () => {
            commitSelectionDraft({ pin: true });
        };

        function broadcastClientSelection() {
            try {
                pruneSelections();
                const clients = [];
                state.selectedClientIds.forEach(clientId => {
                    const info = state.clients.find(item => item.id === clientId);
                    const cached = state.clientDataCache.get(clientId) ?? {};
                    const selection = state.clientSelections.get(clientId) ?? new Map();
                    const selectedItems = Array.from(selection.values());
                    clients.push({
                        id: clientId,
                        displayName: info?.displayName ?? clientId,
                        request: cached.request ?? {},
                        fused: cached.fused ?? {},
                        selectedItems,
                    });
                });
                window.dispatchEvent(new CustomEvent('qa-clients-changed', { detail: { clients } }));
            } catch (error) {
                console.error(error);
            }
        }

        async function fetchJson(url, options = {}) {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Requête invalide (${response.status})`);
            }
            return response.json();
        }

        async function loadClients() {
            const preloaded = Array.isArray(settings.initialRequests) ? settings.initialRequests : [];
            if (preloaded.length && !state.clients.length) {
                state.clients = preloaded;
                state.filteredClients = [];
                state.clientEmptyMessage = 'Tapez quelques lettres pour rechercher un client.';
                renderClientList();
            }
            try {
                const data = await fetchJson(`${API_BASE_URL}?action=listRequests`);
                const list = Array.isArray(data) ? data : Array.isArray(data?.requests) ? data.requests : [];
                if (list.length) {
                    state.clientEmptyMessage = 'Tapez quelques lettres pour rechercher un client.';
                    state.clients = list;
                    state.filteredClients = [];
                    renderClientList();
                } else if (preloaded.length) {
                    state.clientEmptyMessage = 'Tapez quelques lettres pour rechercher un client (clients préchargés).';
                    state.clients = preloaded;
                    state.filteredClients = [];
                    renderClientList();
                } else {
                    state.clientEmptyMessage = 'Aucun client trouvé dans /data/requests.';
                    state.clients = [];
                    state.filteredClients = [];
                    renderClientList();
                }
            } catch (error) {
                console.error(error);
                if (!state.clients.length && preloaded.length) {
                    state.clientEmptyMessage = 'Tapez quelques lettres pour rechercher un client (API indisponible, clients préchargés).';
                    state.clients = preloaded;
                    state.filteredClients = [];
                    renderClientList();
                } else {
                    state.clientEmptyMessage = 'Impossible de charger la liste des clients.';
                    state.clients = [];
                    state.filteredClients = [];
                    renderClientList();
                }
            }
        }

        async function loadClientData(clientId) {
            if (!clientId || state.clientDataCache.has(clientId)) {
                renderDataExplorer();
                return;
            }
            try {
                const data = await fetchJson(`${API_BASE_URL}?action=getRequestData&request=${encodeURIComponent(clientId)}`);
                state.clientDataCache.set(clientId, normalizeClientData(data));
            } catch (error) {
                console.error(error);
                state.clientDataCache.set(clientId, { request: {} });
            } finally {
                renderDataExplorer();
            }
        }

        function renderClientList() {
            if (!elements.clientList) {
                return;
            }
            elements.clientList.innerHTML = '';
            if (!state.filteredClients.length) {
                if (elements.clientEmpty) {
                    elements.clientEmpty.textContent = state.clientEmptyMessage;
                    elements.clientEmpty.hidden = false;
                }
                return;
            }
            if (elements.clientEmpty) {
                elements.clientEmpty.hidden = true;
            }
            state.filteredClients.forEach(client => {
                const item = doc.createElement('li');
                const checkbox = doc.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = client.id;
                checkbox.checked = state.selectedClientIds.has(client.id);
                    checkbox.addEventListener('change', event => {
                        if (event.currentTarget.checked) {
                            state.selectedClientIds.add(client.id);
                            loadClientData(client.id);
                        } else {
                            state.selectedClientIds.delete(client.id);
                            state.clientSelections.delete(client.id);
                            state.clientSelectionDraft.delete(client.id);
                            renderDataExplorer();
                        }
                        updateSelectedCount();
                    });
                const label = doc.createElement('label');
                const strong = doc.createElement('strong');
                strong.textContent = client.displayName;
                const span = doc.createElement('span');
                span.textContent = client.id;
                label.appendChild(strong);
                label.appendChild(span);
                item.appendChild(checkbox);
                item.appendChild(label);
                elements.clientList.appendChild(item);
            });
            updateSelectedCount();
        }

        function placeTutorialBubble(position) {
            if (!(elements.tutorialBubble instanceof HTMLElement)) {
                return;
            }
            const rect = elements.tutorialBubble.getBoundingClientRect();
            const width = rect.width || 360;
            const height = rect.height || 220;
            const viewportWidth = doc.documentElement.clientWidth;
            const viewportHeight = doc.documentElement.clientHeight;
            const defaultX = Math.max((viewportWidth - width) / 2, 12);
            const defaultY = Math.max((viewportHeight - height) / 2, 12);
            const targetX = typeof position?.x === 'number' ? position.x : defaultX;
            const targetY = typeof position?.y === 'number' ? position.y : defaultY;
            const x = clamp(targetX, 12, Math.max(12, viewportWidth - width - 12));
            const y = clamp(targetY, 12, Math.max(12, viewportHeight - height - 12));
            elements.tutorialBubble.style.left = `${x}px`;
            elements.tutorialBubble.style.top = `${y}px`;
        }

        function placeActionPopover(position) {
            if (!(elements.tutorialActionPopover instanceof HTMLElement)) {
                return;
            }
            const rect = elements.tutorialActionPopover.getBoundingClientRect();
            const width = rect.width || 320;
            const height = rect.height || 280;
            const viewportWidth = doc.documentElement.clientWidth;
            const viewportHeight = doc.documentElement.clientHeight;
            const targetX = typeof position?.x === 'number' ? position.x : rect.left || 12;
            const targetY = typeof position?.y === 'number' ? position.y : rect.top || 12;
            const x = clamp(targetX, 12, Math.max(12, viewportWidth - width - 12));
            const y = clamp(targetY, 12, Math.max(12, viewportHeight - height - 12));
            elements.tutorialActionPopover.style.left = `${x}px`;
            elements.tutorialActionPopover.style.top = `${y}px`;
        }

        function startBubbleDrag(event) {
            if (!(elements.tutorialBubble instanceof HTMLElement) || event.button !== 0) {
                return;
            }
            const rect = elements.tutorialBubble.getBoundingClientRect();
            dragState.active = true;
            dragState.offsetX = event.clientX - rect.left;
            dragState.offsetY = event.clientY - rect.top;
            elements.tutorialBubble.classList.add('is-dragging');
            elements.tutorialBubble.setPointerCapture?.(event.pointerId);
        }

        function moveBubble(event) {
            if (!dragState.active) {
                return;
            }
            placeTutorialBubble({ x: event.clientX - dragState.offsetX, y: event.clientY - dragState.offsetY });
        }

        function endBubbleDrag(event) {
            if (!dragState.active || !(elements.tutorialBubble instanceof HTMLElement)) {
                return;
            }
            dragState.active = false;
            elements.tutorialBubble.classList.remove('is-dragging');
            elements.tutorialBubble.releasePointerCapture?.(event.pointerId);
            const rect = elements.tutorialBubble.getBoundingClientRect();
            state.tutorialPosition = { x: rect.left, y: rect.top };
        }

        function applySearch() {
            const raw = elements.clientSearch?.value ?? '';
            const query = raw.trim().toLowerCase();
            state.clientSearchQuery = query;
            if (!query) {
                state.filteredClients = [];
                state.clientEmptyMessage = 'Tapez quelques lettres pour afficher les clients correspondants.';
                renderClientList();
                return;
            }
            state.filteredClients = state.clients.filter(client => {
                const haystack = `${client.displayName} ${client.id}`.toLowerCase();
                return haystack.includes(query);
            });
            if (!state.filteredClients.length) {
                state.clientEmptyMessage = `Aucun client ne correspond à « ${raw.trim()} ». `;
            } else {
                state.clientEmptyMessage = 'Clients trouvés pour votre recherche.';
            }
            renderClientList();
        }

        function applyExplorerSearch() {
            const query = (elements.explorerSearch?.value ?? '').trim();
            state.explorerSearchQuery = query;
            renderDataExplorer();
        }

        function toggleConditionTerms(type) {
            if (!elements.conditionTerms) {
                return;
            }
            const hidden = type === 'empty' || type === 'not_empty';
            elements.conditionTerms.hidden = hidden;
            if (hidden) {
                const textarea = elements.conditionTerms.querySelector('textarea');
                if (textarea) {
                    textarea.value = '';
                }
            }
        }

        function toggleValueSource(source) {
            if (!elements.valuePath || !elements.valueLiteral) {
                return;
            }
            const useRequest = source === 'request';
            const useLiteral = source === 'literal';
            elements.valuePath.hidden = !useRequest;
            elements.valueLiteral.hidden = !useLiteral;
            if (!useRequest) {
                const pathInput = elements.valuePath.querySelector('input');
                if (pathInput instanceof HTMLInputElement) {
                    pathInput.value = '';
                }
            }
            if (!useLiteral) {
                const literalInput = elements.valueLiteral.querySelector('input');
                if (literalInput instanceof HTMLInputElement) {
                    literalInput.value = '';
                }
            }
        }

        function setOptionalVisibility(type, visible, { preserveValue = false } = {}) {
            let field = null;
            if (type === 'fallback') {
                field = elements.fallbackField;
            } else if (type === 'notes') {
                field = elements.notesField;
            }
            const toggle = root.querySelector(`[data-action="toggle-${type}"]`);
            if (toggle instanceof HTMLInputElement) {
                toggle.checked = visible;
            }
            if (field instanceof HTMLElement) {
                field.hidden = !visible;
                if (!visible && !preserveValue) {
                    const input = field.querySelector('input, textarea');
                    if (input) {
                        input.value = '';
                    }
                }
                if (type === 'fallback') {
                    const marker = field.querySelector('[data-role="fallback-required"]');
                    const helper = field.querySelector('[data-role="fallback-help"]');
                    const input = field.querySelector('input');
                    if (input instanceof HTMLInputElement) {
                        input.required = !!visible;
                    }
                    if (marker instanceof HTMLElement) {
                        marker.hidden = !visible;
                    }
                    if (helper instanceof HTMLElement) {
                        helper.textContent = visible
                            ? '(obligatoire car vous souhaitez une valeur alternative si le champ est vide)'
                            : '(facultatif)';
                    }
                }
            }
        }

        function handleOptionalToggle(event) {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            const type = (input.dataset.action || '').replace('toggle-', '');
            if (!type) {
                return;
            }
            setOptionalVisibility(type, input.checked);
        }

        function updatePreview() {
            const preview = root.querySelector('[data-role="rule-preview"]');
            if (!preview) {
                return;
            }
            const requestInput = getField('request-path');
            const conditionSelect = getField('condition-type');
            const termsField = getField('condition-terms');
            const valueSource = getField('value-source');
            const valuePath = getField('value-path');
            const literal = getField('value-literal');
            const coordinate = getField('coordinate');

            const valueSummary = valueSource?.value === 'request'
                ? `Champ : ${(valuePath?.value || '–')}`
                : `Texte : ${(literal?.value || '–')}`;

            const map = {
                'request-path': requestInput?.value || '–',
                condition: conditionSelect?.options[conditionSelect.selectedIndex]?.textContent || '–',
                terms: termsField?.value || '–',
                'value-source': valueSummary,
                coordinate: coordinate?.value || '–',
            };

            Object.entries(map).forEach(([key, value]) => {
                const slot = preview.querySelector(`[data-preview="${key}"]`);
                if (slot) {
                    slot.textContent = value;
                }
            });

            refreshLivePreview();
        }

        function collectLiveSummary() {
            const requestPath = getField('request-path')?.value.trim() || '–';
            const conditionSelect = getField('condition-type');
            const condition = conditionSelect?.options[conditionSelect.selectedIndex]?.textContent?.trim() || '–';
            const terms = getField('condition-terms')?.value.trim() || '';
            const valueSource = getField('value-source')?.value || '';
            const valuePath = getField('value-path')?.value.trim() || '';
            const literal = getField('value-literal')?.value.trim() || '';
            const coordinateInput = getField('coordinate');
            const coordinate = parseCoordinateValue(coordinateInput?.value || '');

            const valueLabel = valueSource === 'request'
                ? (valuePath ? `{{${valuePath}}}` : 'Champ à définir')
                : (literal || 'Texte personnalisé');

            return { requestPath, condition, terms, valueLabel, coordinate, valueSource, valuePath, literal };
        }

        function updateLiveLog(summary) {
            if (!elements.previewLog) {
                return;
            }
            const steps = [
                `Chemin analysé : ${summary.requestPath || '–'}`,
                `Condition : ${summary.condition}${summary.terms ? ` (termes : ${summary.terms})` : ''}`,
                `Valeur insérée : ${summary.valueLabel}`,
                `Coordonnée : ${summary.coordinate ? `page ${summary.coordinate.page}, x=${summary.coordinate.x}, y=${summary.coordinate.y}` : 'Non définie'}`,
            ];
            elements.previewLog.innerHTML = '';
            steps.forEach(line => {
                const item = document.createElement('li');
                const strong = document.createElement('strong');
                const [label, rest] = line.split(':');
                strong.textContent = `${label.trim()} :`;
                item.appendChild(strong);
                item.append(` ${rest?.trim() ?? ''}`);
                elements.previewLog.appendChild(item);
            });
        }

        function refreshLivePreview() {
            const summary = collectLiveSummary();
            previewState.summary = summary;
            updateLiveLog(summary);
            if (previewState.pdfDoc) {
                renderPreviewPage({ preservePage: true });
            }
        }

        async function initLivePreview(force = false) {
            const templates = await fetchTemplates(force);
            renderTemplateLibrary(templates);
            populateTemplateOptions(elements.previewSelect, templates, '');
            populateTemplateOptions(elements.coordinateSelect, templates, 'Sélectionnez un modèle');
            const defaultId = elements.previewSelect?.value || templates[0]?.id || '';
            if (defaultId) {
                state.fallbackTemplateId = defaultId;
            }
            if (elements.previewSelect && defaultId && !elements.previewSelect.value) {
                elements.previewSelect.value = defaultId;
            }
            if (elements.coordinateSelect && defaultId && !elements.coordinateSelect.value) {
                elements.coordinateSelect.value = defaultId;
            }
            if (!defaultId) {
                setPreviewStatus('Aucun modèle trouvé. Importez un document pour tester vos règles.', { error: true });
                return;
            }
            await loadPreviewTemplate(defaultId);
        }

        async function loadPreviewTemplate(templateId) {
            if (!templateId) {
                setPreviewStatus('Choisissez un modèle pour lancer la prévisualisation.', { error: true });
                return;
            }
            const templates = await fetchTemplates();
            const template = templates.find(item => item.id === templateId);
            if (!template) {
                setPreviewStatus('Modèle introuvable. Actualisez la liste.', { error: true });
                return;
            }
            state.fallbackTemplateId = templateId;
            previewState.templateElements = normalizeTemplateElements(template.elements);
                previewState.templateName = template.name || template.id || '';
            await ensurePdfjs();
            setPreviewStatus('Chargement du modèle en cours…');
            try {
                const doc = await window.pdfjsLib.getDocument({ url: template.publicPath, withCredentials: false }).promise;
                previewState.pdfDoc = doc;
                previewState.templateId = templateId;
                previewState.pageCount = doc.numPages || 0;
                previewState.currentPage = Math.min(previewState.currentPage, previewState.pageCount) || 1;
                if (elements.previewSelect) {
                    elements.previewSelect.value = templateId;
                }
                setActiveTemplateCard(templateId);
                stopPreviewPickMode();
                const plural = previewState.pageCount > 1 ? 's' : '';
                setPreviewStatus(`Aperçu chargé : ${template.name} (${previewState.pageCount} page${plural}).`, {
                    ready: true,
                    templateName: previewState.templateName,
                    pageCount: previewState.pageCount,
                });
                renderPreviewPage({ preservePage: false });
            } catch (error) {
                console.error('Impossible de charger le PDF', error);
                setPreviewStatus('Impossible de charger ce PDF. Vérifiez le document ou réessayez.', { error: true });
            }
        }

        async function renderPreviewPage(options = {}) {
            if (!previewState.pdfDoc || !elements.previewCanvas) {
                return;
            }
            const summary = previewState.summary || collectLiveSummary();
            const targetPage = options.preservePage ? previewState.currentPage : 1;
            const pageNumber = Math.min(Math.max(targetPage, 1), previewState.pageCount || 1);
            previewState.currentPage = pageNumber;
            const page = await previewState.pdfDoc.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1 });
            previewState.viewport = viewport;
            const wrapperWidth = elements.previewWrapper?.clientWidth || viewport.width;
            const cssScale = wrapperWidth > 0 ? clamp(wrapperWidth / viewport.width, 0.25, 2.5) : 1;
            const canvas = elements.previewCanvas;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;
            applyPreviewScale(cssScale, viewport);
            const context = canvas.getContext('2d');
            if (!context) {
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            previewState.renderTask?.cancel?.();
            const task = page.render({ canvasContext: context, viewport });
            previewState.renderTask = task;
            try {
                await task.promise;
            } catch (error) {
                console.warn('Rendu interrompu', error);
            }
            drawPreviewAnnotations(context, viewport, summary);
            updatePreviewPagination();
            updatePreviewMarker(summary);
        }

        function applyPreviewScale(scale, viewport) {
            const clamped = clamp(Number(scale) || 1, 0.25, 2.5);
            const width = viewport?.width || elements.previewCanvas?.width || 0;
            const height = viewport?.height || elements.previewCanvas?.height || 0;
            if (elements.previewWrapper) {
                elements.previewWrapper.style.setProperty('--qa-preview-scale', clamped);
                if (width) {
                    elements.previewWrapper.style.setProperty('--qa-preview-width', `${width}px`);
                }
                if (height) {
                    elements.previewWrapper.style.setProperty('--qa-preview-height', `${height}px`);
                }
            }
            [elements.previewCanvas, elements.previewOverlay].forEach(el => {
                if (!(el instanceof HTMLElement)) {
                    return;
                }
                if (width) {
                    el.style.width = `${width}px`;
                }
                if (height) {
                    el.style.height = `${height}px`;
                }
                el.style.transformOrigin = 'top left';
                el.style.transform = `scale(${clamped})`;
            });
        }

        function getExistingElementsForPage(pageNumber) {
            const items = Array.isArray(previewState.templateElements) ? previewState.templateElements : [];
            return items.filter(item => Number(item?.page) === pageNumber);
        }

        function getPageHeight(viewport) {
            if (!viewport) {
                return null;
            }
            if (viewport.viewBox && Array.isArray(viewport.viewBox) && viewport.viewBox.length >= 4) {
                return viewport.viewBox[3];
            }
            const scale = Number(viewport.scale) || 1;
            return scale !== 0 ? viewport.height / scale : viewport.height;
        }

        function computeViewportRect(viewport, element) {
            if (!viewport || typeof element?.x !== 'number' || typeof element?.y !== 'number') {
                return null;
            }
            const width = typeof element?.width === 'number' && element.width > 0 ? element.width : 120;
            const height = typeof element?.height === 'number' && element.height > 0 ? element.height : 32;
            const pageHeight = getPageHeight(viewport);
            if (!pageHeight) {
                return null;
            }
            const pdfY = pageHeight - element.y - height;
            const rectangle = typeof viewport.convertToViewportRectangle === 'function'
                ? viewport.convertToViewportRectangle([element.x, pdfY, element.x + width, pdfY + height])
                : [
                    ...viewport.convertToViewportPoint(element.x, pdfY),
                    ...viewport.convertToViewportPoint(element.x + width, pdfY + height),
                ];
            if (!Array.isArray(rectangle) || rectangle.length < 4) {
                return null;
            }
            const left = Math.min(rectangle[0], rectangle[2]);
            const top = Math.min(rectangle[1], rectangle[3]);
            const rectWidth = Math.abs(rectangle[2] - rectangle[0]);
            const rectHeight = Math.abs(rectangle[3] - rectangle[1]);
            return { x: left, y: top, width: rectWidth, height: rectHeight };
        }

        function toViewportPointFromTopLeft(viewport, point) {
            if (!viewport || !point || typeof point.x !== 'number' || typeof point.y !== 'number') {
                return null;
            }
            const pageHeight = getPageHeight(viewport);
            if (!pageHeight) {
                return null;
            }
            return viewport.convertToViewportPoint(point.x, pageHeight - point.y);
        }

        function drawPreviewAnnotations(context, viewport, summary) {
            context.save();
            context.fillStyle = 'rgba(14, 165, 233, 0.12)';
            context.fillRect(0, 0, viewport.width, viewport.height);
            const existing = getExistingElementsForPage(previewState.currentPage);
            existing.forEach(item => {
                const rect = computeViewportRect(viewport, item);
                if (!rect) {
                    return;
                }
                context.save();
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(220, 38, 38, 0.95)';
                context.fillStyle = 'rgba(220, 38, 38, 0.06)';
                context.fillRect(rect.x, rect.y, rect.width, rect.height);
                context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                context.fillStyle = '#b91c1c';
                context.font = '13px "Inter", "Segoe UI", sans-serif';
                const label = item.text?.trim()
                    || item.data?.variable?.label
                    || item.data?.variable?.key
                    || 'Configuration existante';
                context.textBaseline = 'top';
                const textY = rect.height > 18 ? rect.y + 6 : rect.y + 2;
                context.fillText(label, rect.x + 6, textY);
                context.restore();
            });
            if (summary.coordinate && summary.coordinate.page === previewState.currentPage) {
                const point = toViewportPointFromTopLeft(viewport, summary.coordinate);
                if (!point) {
                    context.restore();
                    return;
                }
                const [vx, vy] = point;
                context.strokeStyle = '#0ea5e9';
                context.lineWidth = 2.5;
                context.strokeRect(vx - 14, vy - 14, 28, 28);
                context.beginPath();
                context.moveTo(vx - 16, vy);
                context.lineTo(vx + 16, vy);
                context.moveTo(vx, vy - 16);
                context.lineTo(vx, vy + 16);
                context.stroke();
                context.fillStyle = 'rgba(14, 165, 233, 0.9)';
                context.fillRect(vx + 12, vy - 22, 220, 32);
                context.fillStyle = '#fff';
                context.font = '16px "Inter", "Segoe UI", sans-serif';
                context.fillText(`Inséré ici : ${summary.valueLabel}`, vx + 16, vy);
            } else {
                context.fillStyle = 'rgba(14, 165, 233, 0.9)';
                context.fillRect(18, 18, 320, 32);
                context.fillStyle = '#fff';
                context.font = '16px "Inter", "Segoe UI", sans-serif';
                context.fillText(`Valeur à insérer : ${summary.valueLabel}`, 26, 40);
            }
            context.restore();
        }

        function updatePreviewPagination() {
            if (elements.previewPage) {
                elements.previewPage.textContent = `Page ${previewState.currentPage} / ${previewState.pageCount || 0}`;
            }
            if (elements.previewPrev) {
                elements.previewPrev.disabled = previewState.currentPage <= 1;
            }
            if (elements.previewNext) {
                elements.previewNext.disabled = previewState.currentPage >= (previewState.pageCount || 1);
            }
        }

        function changePreviewPage(delta) {
            if (!previewState.pdfDoc) {
                return;
            }
            const next = Math.min(Math.max(previewState.currentPage + delta, 1), previewState.pageCount || 1);
            if (next === previewState.currentPage) {
                return;
            }
            previewState.currentPage = next;
            renderPreviewPage({ preservePage: true });
        }

        function setPreviewMarker(point) {
            if (!(elements.previewOverlay instanceof HTMLElement)) {
                return;
            }
            if (!point || typeof point.vx !== 'number' || typeof point.vy !== 'number') {
                elements.previewOverlay.dataset.markerVisible = 'false';
                elements.previewOverlay.style.removeProperty('--qa-marker-x');
                elements.previewOverlay.style.removeProperty('--qa-marker-y');
                previewMarker.page = null;
                previewMarker.vx = null;
                previewMarker.vy = null;
                return;
            }
            elements.previewOverlay.dataset.markerVisible = 'true';
            elements.previewOverlay.style.setProperty('--qa-marker-x', `${point.vx}px`);
            elements.previewOverlay.style.setProperty('--qa-marker-y', `${point.vy}px`);
            previewMarker.page = previewState.currentPage;
            previewMarker.vx = point.vx;
            previewMarker.vy = point.vy;
        }

        function updatePreviewMarker(summary) {
            if (!summary || summary.coordinate?.page !== previewState.currentPage || !previewState.viewport) {
                setPreviewMarker(null);
                return;
            }
            const point = toViewportPointFromTopLeft(previewState.viewport, summary.coordinate);
            if (!point) {
                setPreviewMarker(null);
                return;
            }
            const [vx, vy] = point;
            setPreviewMarker({ vx, vy });
        }

        function startPreviewPickMode() {
            if (!previewState.pdfDoc || !(elements.previewCanvas instanceof HTMLCanvasElement)) {
                setFeedback('Choisissez un modèle dans « Document réel en aperçu live » pour placer une coordonnée.', { error: true });
                elements.previewSelect?.focus();
                elements.previewWrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            previewPickMode = true;
            setPreviewMarker(null);
            elements.previewWrapper?.classList.add('is-picking');
            elements.previewOverlay?.setAttribute('data-marker-visible', previewMarker.page === previewState.currentPage ? 'true' : 'false');
            elements.previewWrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setFeedback('Cliquez sur l’aperçu pour placer la coordonnée.');
        }

        function stopPreviewPickMode() {
            previewPickMode = false;
            elements.previewWrapper?.classList.remove('is-picking');
        }

        async function openCoordinateModal() {
            if (!(elements.coordinateModal instanceof HTMLElement)) {
                return;
            }
            const templates = await fetchTemplates();
            populateTemplateOptions(elements.coordinateSelect, templates, 'Sélectionnez un modèle');
            const currentId = elements.coordinateSelect?.value || previewState.templateId || templates[0]?.id || '';
            if (elements.coordinateSelect && currentId && !elements.coordinateSelect.value) {
                elements.coordinateSelect.value = currentId;
            }
            elements.coordinateModal.hidden = false;
            elements.coordinateModal.setAttribute('aria-hidden', 'false');
            await loadCoordinateTemplate(currentId);
        }

        function closeCoordinateModal() {
            if (!(elements.coordinateModal instanceof HTMLElement)) {
                return;
            }
            elements.coordinateModal.hidden = true;
            elements.coordinateModal.setAttribute('aria-hidden', 'true');
        }

        async function loadCoordinateTemplate(templateId) {
            if (!templateId || !(elements.coordinateCanvas instanceof HTMLCanvasElement)) {
                setCoordinateStatus('Choisissez un modèle pour pointer une coordonnée.', { error: true });
                return;
            }
            await ensurePdfjs();
            const templates = await fetchTemplates();
            const template = templates.find(item => item.id === templateId);
            if (!template) {
                setCoordinateStatus('Modèle introuvable. Actualisez la liste.', { error: true });
                return;
            }
            setCoordinateStatus('Ouverture du modèle…');
            try {
                const doc = await window.pdfjsLib.getDocument({ url: template.publicPath, withCredentials: false }).promise;
                coordinateState.pdfDoc = doc;
                coordinateState.templateId = templateId;
                coordinateState.pageCount = doc.numPages || 0;
                coordinateState.currentPage = Math.min(coordinateState.currentPage, coordinateState.pageCount) || 1;
                coordinateState.selected = null;
                renderCoordinatePage();
            } catch (error) {
                console.error('Impossible de charger le modèle pour la coordonnée', error);
                setCoordinateStatus('Impossible de charger ce modèle pour choisir une coordonnée.', { error: true });
            }
        }

        async function renderCoordinatePage() {
            if (!coordinateState.pdfDoc || !(elements.coordinateCanvas instanceof HTMLCanvasElement)) {
                return;
            }
            const pageNumber = Math.min(Math.max(coordinateState.currentPage, 1), coordinateState.pageCount || 1);
            coordinateState.currentPage = pageNumber;
            const page = await coordinateState.pdfDoc.getPage(pageNumber);
            const baseViewport = page.getViewport({ scale: 1 });
            const wrapperWidth = elements.coordinateCanvas.parentElement?.clientWidth || baseViewport.width;
            const scale = Math.max(1, wrapperWidth / baseViewport.width);
            const ratio = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: scale * ratio });
            coordinateState.viewport = viewport;
            const canvas = elements.coordinateCanvas;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width / ratio}px`;
            canvas.style.height = `${viewport.height / ratio}px`;
            const context = canvas.getContext('2d');
            if (!context) {
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            coordinateState.renderTask?.cancel?.();
            const task = page.render({ canvasContext: context, viewport });
            coordinateState.renderTask = task;
            try {
                await task.promise;
            } catch (error) {
                console.warn('Rendu interrompu', error);
            }
            updateCoordinateOverlay();
            updateCoordinatePagination();
            setCoordinateStatus(`Page ${coordinateState.currentPage} sur ${coordinateState.pageCount || 0}. Cliquez dans le PDF pour placer la coordonnée.`);
        }

        function updateCoordinatePagination() {
            if (elements.coordinatePage) {
                elements.coordinatePage.textContent = `Page ${coordinateState.currentPage} / ${coordinateState.pageCount || 0}`;
            }
            if (elements.coordinatePrev) {
                elements.coordinatePrev.disabled = coordinateState.currentPage <= 1;
            }
            if (elements.coordinateNext) {
                elements.coordinateNext.disabled = coordinateState.currentPage >= (coordinateState.pageCount || 1);
            }
        }

        function updateCoordinateOverlay() {
            if (!(elements.coordinateOverlay instanceof HTMLElement) || !coordinateState.viewport) {
                return;
            }
            if (!coordinateState.selected || coordinateState.selected.page !== coordinateState.currentPage) {
                elements.coordinateOverlay.dataset.visible = 'false';
                elements.coordinateOverlay.style.removeProperty('--qa-marker-x');
                elements.coordinateOverlay.style.removeProperty('--qa-marker-y');
                return;
            }
            const point = toViewportPointFromTopLeft(coordinateState.viewport, coordinateState.selected);
            if (!point) {
                elements.coordinateOverlay.dataset.visible = 'false';
                elements.coordinateOverlay.style.removeProperty('--qa-marker-x');
                elements.coordinateOverlay.style.removeProperty('--qa-marker-y');
                return;
            }
            const [vx, vy] = point;
            elements.coordinateOverlay.dataset.visible = 'true';
            elements.coordinateOverlay.style.setProperty('--qa-marker-x', `${vx}px`);
            elements.coordinateOverlay.style.setProperty('--qa-marker-y', `${vy}px`);
        }

        function handleCoordinateClick(event) {
            if (!(elements.coordinateCanvas instanceof HTMLCanvasElement) || !coordinateState.viewport) {
                return;
            }
            const rect = elements.coordinateCanvas.getBoundingClientRect();
            const ratio = elements.coordinateCanvas.width / rect.width;
            const x = (event.clientX - rect.left) * ratio;
            const y = (event.clientY - rect.top) * ratio;
            const [pdfX, pdfY] = coordinateState.viewport.convertToPdfPoint(x, y);
            const pageHeight = getPageHeight(coordinateState.viewport);
            const topY = pageHeight ? pageHeight - pdfY : pdfY;
            coordinateState.selected = { page: coordinateState.currentPage, x: Math.round(pdfX), y: Math.round(topY) };
            updateCoordinateOverlay();
            if (elements.coordinateSummary) {
                elements.coordinateSummary.textContent = `page=${coordinateState.selected.page};x=${coordinateState.selected.x};y=${coordinateState.selected.y}`;
            }
            if (elements.coordinateUse) {
                elements.coordinateUse.disabled = false;
            }
        }

        function handlePreviewCanvasClick(event) {
            if (!previewPickMode || !(elements.previewCanvas instanceof HTMLCanvasElement) || !previewState.viewport) {
                return;
            }
            const rect = elements.previewCanvas.getBoundingClientRect();
            const ratio = elements.previewCanvas.width / rect.width;
            const x = (event.clientX - rect.left) * ratio;
            const y = (event.clientY - rect.top) * ratio;
            const [pdfX, pdfY] = previewState.viewport.convertToPdfPoint(x, y);
            const pageHeight = getPageHeight(previewState.viewport);
            const topY = pageHeight ? pageHeight - pdfY : pdfY;
            const coordinate = { page: previewState.currentPage, x: Math.round(pdfX), y: Math.round(topY) };
            const input = getField('coordinate');
            if (input instanceof HTMLInputElement) {
                input.value = `page=${coordinate.page};x=${coordinate.x};y=${coordinate.y}`;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                setFeedback('Coordonnée ajoutée depuis l’aperçu live.');
            }
            const point = toViewportPointFromTopLeft(previewState.viewport, coordinate);
            if (point) {
                const [vx, vy] = point;
                setPreviewMarker({ vx, vy });
            }
            stopPreviewPickMode();
            refreshLivePreview();
        }

        function applySelectedCoordinate() {
            if (!coordinateState.selected) {
                return;
            }
            const input = getField('coordinate');
            if (input instanceof HTMLInputElement) {
                const text = `page=${coordinateState.selected.page};x=${coordinateState.selected.x};y=${coordinateState.selected.y}`;
                input.value = text;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                setFeedback('Coordonnée ajoutée depuis le sélecteur.');
            }
            closeCoordinateModal();
            refreshLivePreview();
        }

        function changeCoordinatePage(delta) {
            if (!coordinateState.pdfDoc) {
                return;
            }
            const next = Math.min(Math.max(coordinateState.currentPage + delta, 1), coordinateState.pageCount || 1);
            if (next === coordinateState.currentPage) {
                return;
            }
            coordinateState.currentPage = next;
            renderCoordinatePage();
        }

        function getField(name) {
            return elements.form?.querySelector(`[data-field="${name}"]`) ?? null;
        }

        function appendConditionTerm(value) {
            const textarea = getField('condition-terms');
            if (!(textarea instanceof HTMLTextAreaElement)) {
                return;
            }
            const current = textarea.value.split(',').map(item => item.trim()).filter(Boolean);
            if (!current.includes(value)) {
                current.push(value);
            }
            textarea.value = current.join(', ');
        }

        function handleExplorerClick(event) {
            if (!(event.target instanceof HTMLButtonElement)) {
                return;
            }
            const action = event.target.dataset.action;
            const path = event.target.dataset.path ?? '';
            const sample = event.target.dataset.sample ?? '';
            if (action === 'toggle-selection') {
                const clientId = event.target.dataset.clientId ?? '';
                if (!clientId || !path) {
                    return;
                }
                const draft = ensureDraftSelection(clientId);
                const committed = ensureCommittedSelection(clientId);
                const entry = {
                    path,
                    label: event.target.dataset.label || path,
                    value: event.target.dataset.preview || '',
                };
                if (draft.has(path)) {
                    draft.delete(path);
                    committed.delete(path);
                } else {
                    draft.set(path, entry);
                    committed.set(path, entry);
                }
                broadcastClientSelection();
                renderDataExplorer({ skipBroadcast: true });
                return;
            }
            if (action === 'use-condition' && path) {
                const requestPathInput = getField('request-path');
                if (requestPathInput instanceof HTMLInputElement) {
                    requestPathInput.value = path;
                    requestPathInput.focus();
                }
            } else if (action === 'use-value' && path) {
                const valueSourceSelect = getField('value-source');
                if (valueSourceSelect instanceof HTMLSelectElement) {
                    valueSourceSelect.value = 'request';
                    toggleValueSource('request');
                }
                const valuePathInput = getField('value-path');
                if (valuePathInput instanceof HTMLInputElement) {
                    valuePathInput.value = path;
                    valuePathInput.dispatchEvent(new Event('input', { bubbles: true }));
                    valuePathInput.focus();
                }
                const requestPathInput = getField('request-path');
                if (requestPathInput instanceof HTMLInputElement && !requestPathInput.value.trim()) {
                    requestPathInput.value = path;
                    requestPathInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else if (action === 'use-term' && sample) {
                appendConditionTerm(sample.trim());
                const conditionSelect = getField('condition-type');
                if (conditionSelect instanceof HTMLSelectElement && conditionSelect.value === 'empty') {
                    conditionSelect.value = 'contains';
                }
            }
            updatePreview();
        }

        function serializeForm() {
            if (!elements.form) {
                return null;
            }
            const labelInput = getField('label');
            const requestPathInput = getField('request-path');
            const conditionSelect = getField('condition-type');
            const conditionTermsInput = getField('condition-terms');
            const valueSourceSelect = getField('value-source');
            const valuePathInput = getField('value-path');
            const valueLiteralInput = getField('value-literal');
            const coordinateInput = getField('coordinate');
            const fallbackInput = getField('fallback');
            const notesInput = getField('notes');

            if (!(labelInput instanceof HTMLInputElement) || !(requestPathInput instanceof HTMLInputElement)) {
                return null;
            }
            if (!(conditionSelect instanceof HTMLSelectElement) || !(valueSourceSelect instanceof HTMLSelectElement)) {
                return null;
            }
            const source = valueSourceSelect.value;
            let valuePath = valuePathInput instanceof HTMLInputElement ? valuePathInput.value.trim() : '';
            let valueLiteral = valueLiteralInput instanceof HTMLInputElement ? valueLiteralInput.value : '';
            if (source !== 'request') {
                valuePath = '';
            }
            if (source !== 'literal') {
                valueLiteral = '';
            }
            return {
                label: labelInput.value.trim(),
                coordinate: coordinateInput instanceof HTMLInputElement ? coordinateInput.value.trim() : '',
                requestPath: requestPathInput.value.trim(),
                conditionType: conditionSelect.value,
                conditionTerms: conditionTermsInput instanceof HTMLTextAreaElement ? conditionTermsInput.value.trim() : '',
                valueSource: source,
                valuePath,
                valueLiteral,
                fallback: fallbackInput instanceof HTMLInputElement ? fallbackInput.value : '',
                notes: notesInput instanceof HTMLTextAreaElement ? notesInput.value : '',
            };
        }

        function validatePayload(payload) {
            if (!payload) {
                return 'Formulaire incomplet.';
            }
            if (!payload.label) {
                return 'Veuillez nommer la règle.';
            }
            if (!payload.requestPath) {
                return 'Veuillez sélectionner un chemin à analyser.';
            }
            if ((payload.conditionType === 'contains' || payload.conditionType === 'not_contains' || payload.conditionType === 'equals' || payload.conditionType === 'not_equals') && !payload.conditionTerms) {
                return 'Indiquez au moins une valeur de comparaison.';
            }
            if (payload.valueSource === 'request' && !payload.valuePath) {
                return 'Spécifiez le chemin de la valeur à insérer.';
            }
            if (payload.valueSource === 'literal' && !payload.valueLiteral.trim()) {
                return 'Renseignez le texte à insérer.';
            }
            return '';
        }

        function resetForm() {
            elements.form?.reset();
            toggleConditionTerms('contains');
            toggleValueSource('request');
            setOptionalVisibility('fallback', false);
            setOptionalVisibility('notes', false);
            setFeedback('');
            stopPreviewPickMode();
            setPreviewMarker(null);
        }

        function sendToParent(payload) {
            if (!payload) {
                return false;
            }
            let handled = false;
            if (typeof settings.onCreate === 'function') {
                try {
                    handled = settings.onCreate(payload, { autoSave: settings.mode === 'standalone' }) === true;
                } catch (error) {
                    console.error(error);
                }
            }
            if (handled) {
                return true;
            }
            let delivered = false;
            try {
                if (window.opener) {
                    window.opener.postMessage({ type: 'qa-auto-selection-created', payload, autoSave: settings.mode === 'standalone' }, window.location.origin);
                    delivered = true;
                }
            } catch (error) {
                try {
                    if (window.opener) {
                        window.opener.postMessage({ type: 'qa-auto-selection-created', payload, autoSave: settings.mode === 'standalone' }, '*');
                        delivered = true;
                    }
                } catch (nestedError) {
                    delivered = false;
                }
            }
            return delivered;
        }

        async function handleSubmit(event) {
            event.preventDefault();
            let payload = serializeForm();

            if (payload && (payload.conditionType === 'contains' || payload.conditionType === 'not_contains' || payload.conditionType === 'equals' || payload.conditionType === 'not_equals') && !payload.conditionTerms) {
                const conditionSelect = getField('condition-type');
                if (conditionSelect instanceof HTMLSelectElement) {
                    conditionSelect.value = 'not_empty';
                    toggleConditionTerms('not_empty');
                }
                payload = { ...payload, conditionType: 'not_empty' };
                updatePreview();
                setFeedback('Aucune valeur de comparaison fournie : la condition a été basculée sur « N’est pas vide ».', { warning: true });
            }

            const error = validatePayload(payload);
            if (error) {
                setFeedback(error, { error: true });
                return;
            }
            const delivered = sendToParent(payload);
            const shouldPersistLocally = settings.mode === 'standalone' || !delivered;
            if (!shouldPersistLocally && delivered) {
                broadcastLocalSave(payload);
                setFeedback('Règle transmise et enregistrée dans la classe Questions/Actions. Que souhaitez-vous faire ensuite ?');
                elements.form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                openPostSaveModal();
                return;
            }
            try {
                setFeedback('Enregistrement en cours...');
                await persistStandaloneAutoSelection(state, payload);
                broadcastLocalSave(payload);
                setFeedback('Règle transmise et enregistrée dans la classe Questions/Actions. Que souhaitez-vous faire ensuite ?');
                elements.form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                openPostSaveModal();
            } catch (saveError) {
                console.error(saveError);
                setFeedback(saveError?.message ?? 'Impossible d’enregistrer la règle.', { error: true });
            }
        }

        function openFaq() {
            if (!elements.faq) {
                return;
            }
            elements.faq.hidden = false;
            elements.faq.setAttribute('aria-hidden', 'false');
            const panel = elements.faq.querySelector('.qa-builder-faq__panel');
            if (panel instanceof HTMLElement) {
                if (!panel.hasAttribute('tabindex')) {
                    panel.setAttribute('tabindex', '-1');
                }
                panel.focus();
            }
        }

        function closeFaq() {
            if (!elements.faq) {
                return;
            }
            elements.faq.hidden = true;
            elements.faq.setAttribute('aria-hidden', 'true');
        }

        function openPostSaveModal() {
            if (!(elements.postSaveModal instanceof HTMLElement)) {
                return;
            }
            elements.postSaveModal.hidden = false;
            elements.postSaveModal.setAttribute('aria-hidden', 'false');
            elements.postSaveStay?.focus();
        }

        function closePostSaveModal() {
            if (!(elements.postSaveModal instanceof HTMLElement)) {
                return;
            }
            elements.postSaveModal.hidden = true;
            elements.postSaveModal.setAttribute('aria-hidden', 'true');
        }

        function handleStayHere() {
            closePostSaveModal();
            resetForm();
            refreshLivePreview();
            getField('label')?.focus();
        }

        function handleQuitToManager() {
            closePostSaveModal();
            closeWindow();
        }

        function renderTutorialStep() {
            if (!elements.tutorial || !elements.tutorialStep || !elements.tutorialTitle || !elements.tutorialText) {
                return;
            }
            clearTutorialArtifacts();
            const total = state.tutorialSteps.length;
            const index = clamp(state.tutorialIndex + 1, 1, total);
            const step = state.tutorialSteps[state.tutorialIndex];
            elements.tutorialStep.textContent = `Étape ${index} / ${total}`;
            if (!step) {
                return;
            }
            elements.tutorialTitle.textContent = step.title;
            elements.tutorialText.textContent = step.text;
            if (elements.tutorialExamples) {
                elements.tutorialExamples.innerHTML = '';
                if (Array.isArray(step.details) && step.details.length) {
                    const list = doc.createElement('ul');
                    step.details.forEach(detail => {
                        const li = doc.createElement('li');
                        li.textContent = detail;
                        list.appendChild(li);
                    });
                    elements.tutorialExamples.appendChild(list);
                    elements.tutorialExamples.hidden = false;
                } else {
                    elements.tutorialExamples.hidden = true;
                }
            }
            renderTutorialSimulation(step);
            applyStepDemo(step);
            runTutorialScript(step);
            focusTutorialOnStep(step);
            if (state.tutorialIndex === 1) {
                showTutorialDataDialog({ ensureExplorerRow: true, ensureSelection: false });
            }
        }

        function renderTutorialSimulation(step) {
            if (!elements.tutorialSimulation) {
                return;
            }
            elements.tutorialSimulation.innerHTML = '';
            tutorialPlayback.log = null;
            if (!step || !step.demo) {
                return;
            }
            const demo = step.demo;
            const card = doc.createElement('div');
            card.className = 'qa-builder-demo';
            if (demo.stage) {
                const stage = doc.createElement('p');
                stage.className = 'qa-builder-demo__stage';
                stage.textContent = demo.stage;
                card.appendChild(stage);
            }
            if (Array.isArray(demo.fields)) {
                const list = doc.createElement('dl');
                list.className = 'qa-builder-demo__fields';
                demo.fields.forEach(field => {
                    const label = doc.createElement('dt');
                    label.textContent = field.label;
                    const value = doc.createElement('dd');
                    value.textContent = field.value;
                    list.appendChild(label);
                    list.appendChild(value);
                });
                card.appendChild(list);
            }
            if (demo.note) {
                const note = doc.createElement('p');
                note.className = 'qa-builder-demo__note';
                note.textContent = demo.note;
                card.appendChild(note);
            }
            const playback = doc.createElement('ol');
            playback.className = 'qa-demo-playback';
            playback.dataset.role = 'tutorial-playback';
            card.appendChild(playback);
            tutorialPlayback.log = playback;
            elements.tutorialSimulation.appendChild(card);
        }

        function ensureTutorialCursor() {
            if (tutorialPlayback.cursor instanceof HTMLElement) {
                return tutorialPlayback.cursor;
            }
            const cursor = doc.createElement('div');
            cursor.className = 'qa-tutorial__cursor is-hidden';
            doc.body.appendChild(cursor);
            tutorialPlayback.cursor = cursor;
            return cursor;
        }

        function logDemoAction(text) {
            if (!text) {
                return;
            }
            if (!(tutorialPlayback.log instanceof HTMLElement)) {
                return;
            }
            const item = doc.createElement('li');
            item.textContent = text;
            tutorialPlayback.log.appendChild(item);
        }

        function moveTutorialCursor(target) {
            const cursor = ensureTutorialCursor();
            if (!(cursor instanceof HTMLElement)) {
                return;
            }
            if (!(target instanceof HTMLElement)) {
                cursor.classList.add('is-hidden');
                return;
            }
            const rect = target.getBoundingClientRect();
            cursor.style.left = `${rect.left + rect.width / 2}px`;
            cursor.style.top = `${rect.top + rect.height / 2}px`;
            cursor.classList.remove('is-hidden');
        }

        function ensureDemoClient({ select = false } = {}) {
            if (!elements.clientList) {
                return null;
            }
            const existing = elements.clientList.querySelector('.qa-demo-client input[type="checkbox"]');
            if (existing) {
                if (select) {
                    state.selectedClientIds.add('DEMO_JANE_DOE');
                }
                return existing;
            }
            const demo = {
                id: 'DEMO_JANE_DOE',
                displayName: 'Jane Doe',
                documentCount: 1,
            };
            if (!state.clients.find(client => client.id === demo.id)) {
                state.clients.push(demo);
            }
            if (select) {
                state.selectedClientIds.add(demo.id);
            }
            const li = doc.createElement('li');
            li.className = 'qa-demo-client';
            const label = doc.createElement('label');
            label.className = 'qa-client-card';
            const checkbox = doc.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = demo.id;
            checkbox.checked = !!select;
            const name = doc.createElement('span');
            name.textContent = `${demo.displayName}`;
            label.appendChild(checkbox);
            label.appendChild(name);
            li.appendChild(label);
            elements.clientList.appendChild(li);
            tutorialPlayback.artifacts.push(() => li.remove());
            return checkbox;
        }

        function ensureDemoExplorerRow() {
            if (!elements.dataExplorer) {
                return null;
            }
            let container = elements.dataExplorer.querySelector('.qa-demo-explorer');
            if (container) {
                return container;
            }
            container = doc.createElement('div');
            container.className = 'qa-explorer-client qa-demo-explorer';
            const header = doc.createElement('header');
            header.textContent = 'Bloc jaune (exemple de données)';
            container.appendChild(header);
            const table = doc.createElement('table');
            table.className = 'qa-explorer-table';
            const head = doc.createElement('thead');
            const headRow = doc.createElement('tr');
            ['⟟', 'Élément', 'Réponse de l’utilisateur', 'Boutons d’actions'].forEach(label => {
                const th = doc.createElement('th');
                th.textContent = label;
                headRow.appendChild(th);
            });
            head.appendChild(headRow);
            table.appendChild(head);
            const body = doc.createElement('tbody');
            const tr = doc.createElement('tr');
            tr.dataset.path = 'formData.adresses[0].ville';
            const picker = doc.createElement('td');
            picker.innerHTML = '<button type="button" class="qa-explorer-picker">⟟</button>';
            const pickerBtn = picker.querySelector('button');
            if (pickerBtn) {
                pickerBtn.dataset.action = 'toggle-selection';
                pickerBtn.dataset.clientId = 'DEMO_JANE_DOE';
                pickerBtn.dataset.path = 'formData.adresses[0].ville';
                pickerBtn.dataset.label = 'Ville de l’emprunteur';
                pickerBtn.dataset.preview = '« Québec »';
            }
            const labelCell = doc.createElement('td');
            labelCell.innerHTML = '<strong>Chemin cartographié</strong><br><small>Chemin : formData.adresses[0].ville</small>';
            const valueCell = doc.createElement('td');
            valueCell.textContent = '« Québec »';
            const actions = doc.createElement('td');
            actions.className = 'qa-explorer-actions';
            [
                { label: 'Analyser', title: 'Copie le chemin dans « Chemin à analyser »' },
                { label: 'Insérer', title: 'Prépare la source à copier' },
                { label: 'Ajouter au filtre', title: 'Remplit les termes à comparer' },
            ].forEach(config => {
                const btn = doc.createElement('button');
                btn.type = 'button';
                btn.textContent = config.label;
                btn.title = config.title;
                actions.appendChild(btn);
            });
            tr.appendChild(picker);
            tr.appendChild(labelCell);
            tr.appendChild(valueCell);
            tr.appendChild(actions);
            body.appendChild(tr);
            table.appendChild(body);
            container.appendChild(table);
            elements.dataExplorer.appendChild(container);
            tutorialPlayback.artifacts.push(() => container.remove());
            return container;
        }

        function ensureDemoSelectionBlock() {
            if (!elements.dataExplorer) {
                return null;
            }
            let block = elements.dataExplorer.querySelector('.client-data-block');
            if (!block) {
                block = doc.createElement('div');
                block.className = 'client-data-block';
                const header = doc.createElement('header');
                const title = doc.createElement('strong');
                title.textContent = 'Coordonnées des clients sélectionnés - Jane Doe';
                header.appendChild(title);
                block.appendChild(header);
                const table = doc.createElement('table');
                table.className = 'client-data-selection-table';
                const thead = doc.createElement('thead');
                const headRow = doc.createElement('tr');
                ['Chemin', 'Valeur', 'Boutons d’actions'].forEach(text => {
                    const th = doc.createElement('th');
                    th.textContent = text;
                    headRow.appendChild(th);
                });
                thead.appendChild(headRow);
                table.appendChild(thead);
                const tbody = doc.createElement('tbody');
                const tr = doc.createElement('tr');
                tr.dataset.path = 'formData.adresses[0].ville';
                const path = doc.createElement('td');
                path.innerHTML = '<strong>formData.adresses[0].ville</strong><br><small>Ville de l’emprunteur</small>';
                const value = doc.createElement('td');
                value.textContent = '« Québec »';
                const actions = doc.createElement('td');
                actions.className = 'qa-selection-actions';
                [
                    { label: 'A', title: 'Analyser (copie le chemin dans « Chemin à analyser »)' },
                    { label: 'I', title: 'Insérer (prépare la source à copier)' },
                    { label: '+F', title: 'Ajouter au filtre (remplit les termes à comparer)' },
                ].forEach(config => {
                    const btn = doc.createElement('button');
                    btn.type = 'button';
                    btn.textContent = config.label;
                    btn.title = config.title;
                    actions.appendChild(btn);
                });
                tr.appendChild(path);
                tr.appendChild(value);
                tr.appendChild(actions);
                tbody.appendChild(tr);
                table.appendChild(tbody);
                block.appendChild(table);
            }
            activateTutorialSelectionBlock(block);
            return block;
        }

        function showTutorialDataDialog({ ensureExplorerRow = false, ensureSelection = false } = {}) {
            const dialog = doc.getElementById('client-data-dialog');
            if (!(dialog instanceof HTMLElement)) {
                return;
            }
            dialog.hidden = false;
            dialog.setAttribute('aria-hidden', 'false');
            const list = doc.getElementById('client-data-list');
            if (list instanceof HTMLElement) {
                list.hidden = true;
            }
            if (elements.explorerEmpty) {
                elements.explorerEmpty.hidden = true;
            }
            if (ensureExplorerRow) {
                ensureDemoExplorerRow();
            }
            if (ensureSelection) {
                ensureDemoSelectionBlock();
            }
            tutorialPlayback.artifacts.push(() => {
                dialog.hidden = true;
                dialog.setAttribute('aria-hidden', 'true');
                if (list instanceof HTMLElement) {
                    list.hidden = true;
                }
            });
        }

        function clearTutorialArtifacts() {
            tutorialPlayback.timers.forEach(timer => window.clearTimeout(timer));
            tutorialPlayback.timers = [];
            tutorialPlayback.artifacts.forEach(cleanup => {
                try { cleanup(); } catch (error) { console.error(error); }
            });
            tutorialPlayback.artifacts = [];
            if (tutorialPlayback.cursor instanceof HTMLElement) {
                tutorialPlayback.cursor.classList.add('is-hidden');
            }
            root.querySelectorAll('.is-qa-highlight').forEach(node => node.classList.remove('is-qa-highlight'));
            root.querySelectorAll('.qa-ring-highlight, .qa-highlight-text').forEach(node => node.classList.remove('qa-ring-highlight', 'qa-highlight-text'));
            tutorialPlayback.queue = [];
            tutorialPlayback.pointer = 0;
        }

        function runTutorialScript(step) {
            clearTutorialArtifacts();
            tutorialPlayback.queue = Array.isArray(step?.script) ? step.script.slice() : [];
            tutorialPlayback.pointer = 0;
            updateTutorialScriptControls();
        }

        function playNextTutorialAction() {
            if (!tutorialPlayback.queue.length) {
                updateTutorialScriptControls();
                return;
            }
            const safeIndex = Math.min(tutorialPlayback.pointer, tutorialPlayback.queue.length - 1);
            const action = tutorialPlayback.queue[safeIndex];
            executeDemoAction(action);
        }

        function executeDemoAction(action) {
            if (!action) {
                return;
            }
            let target = action.selector ? root.querySelector(action.selector) : null;
            let handled = false;
            if (action.ensureDemo === 'client' && !(target instanceof HTMLElement)) {
                target = ensureDemoClient();
            }
            if (action.ensureDemo === 'explorer') {
                ensureDemoExplorerRow();
                target = target || elements.dataExplorer?.querySelector(action.selector || '.qa-demo-explorer');
            }
            if (action.ensureDemo === 'selection-block') {
                ensureDemoSelectionBlock();
                target = target || elements.dataExplorer?.querySelector(action.selector || '.client-data-block');
            }
            if (action.trigger && !(target instanceof HTMLElement)) {
                const trigger = root.querySelector(action.trigger);
                if (trigger instanceof HTMLElement) {
                    trigger.hidden = false;
                    trigger.removeAttribute('hidden');
                    trigger.click();
                }
            }
            if (action.type === 'open-data') {
                const dialog = doc.querySelector(action.selector ?? '#client-data-dialog');
                if (dialog instanceof HTMLElement) {
                    const previous = dialog.hidden;
                    dialog.hidden = false;
                    dialog.setAttribute('aria-hidden', 'false');
                    tutorialPlayback.artifacts.push(() => {
                        dialog.hidden = previous;
                        dialog.setAttribute('aria-hidden', previous ? 'true' : 'false');
                    });
                    moveTutorialCursor(dialog);
                    handled = true;
                }
                target = dialog;
            }
            if (!handled && target instanceof HTMLElement) {
                target.classList.add('is-qa-highlight');
                moveTutorialCursor(target);
                if (action.type === 'scroll') {
                    if (typeof action.scrollTo === 'string') {
                        const anchor = target.querySelector(action.scrollTo);
                        if (anchor instanceof HTMLElement) {
                            anchor.scrollIntoView({ behavior: 'auto', block: 'center' });
                        }
                    } else if (action.value === 'bottom') {
                        target.scrollTop = target.scrollHeight;
                    } else if (Number.isFinite(action.value)) {
                        target.scrollTop = action.value;
                    }
                }
                if (action.type === 'input' && typeof action.value === 'string') {
                    if ('value' in target) {
                        target.value = action.value;
                        target.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                if (action.type === 'click') {
                    target.click();
                }
                if (action.type === 'highlight-actions') {
                    logDemoAction(action.note ?? 'Les boutons A / I / +F sont prêts.');
                }
                if (action.type === 'ring') {
                    highlightRing(target);
                }
                if (action.type === 'ring-actions') {
                    highlightActionGroup(target, action.selector);
                }
                if (action.type === 'highlight-detail') {
                    highlightDetailItem(action.detailIndex);
                }
                if (action.type === 'show-selection-block') {
                    const block = ensureDemoSelectionBlock();
                    if (block instanceof HTMLElement) {
                        moveTutorialCursor(block);
                    }
                }
            }
            if (action.note) {
                logDemoAction(action.note);
            }
            tutorialPlayback.pointer = Math.min(tutorialPlayback.pointer + 1, tutorialPlayback.queue.length);
            updateTutorialScriptControls();
        }

        function clearRingHighlights() {
            root.querySelectorAll('.qa-ring-highlight').forEach(node => node.classList.remove('qa-ring-highlight'));
        }

        function highlightRing(target) {
            clearRingHighlights();
            if (!(target instanceof HTMLElement)) {
                return;
            }
            target.classList.add('qa-ring-highlight');
            tutorialPlayback.artifacts.push(() => target.classList.remove('qa-ring-highlight'));
        }

        function highlightActionGroup(target, selector) {
            clearRingHighlights();
            const scope = target?.closest('.client-data-block') || target || doc;
            const nodes = selector ? Array.from(scope.querySelectorAll(selector)) : [];
            if (!nodes.length && target instanceof HTMLElement) {
                nodes.push(target);
            }
            nodes.forEach(node => {
                node.classList.add('qa-ring-highlight');
                tutorialPlayback.artifacts.push(() => node.classList.remove('qa-ring-highlight'));
            });
        }

        function highlightDetailItem(index) {
            const items = elements.tutorialExamples?.querySelectorAll('li');
            if (!items) {
                return;
            }
            items.forEach(item => item.classList.remove('qa-highlight-text'));
            const target = Number.isFinite(index) ? items[Number(index) - 1] : null;
            if (target) {
                target.classList.add('qa-highlight-text');
                tutorialPlayback.artifacts.push(() => target.classList.remove('qa-highlight-text'));
            }
        }

        function updateTutorialScriptControls() {
            if (!elements.tutorialScriptControls) {
                return;
            }
            elements.tutorialScriptControls.hidden = true;
        }

        function snapshotDemoState() {
            if (demoSnapshot || !elements.form) {
                return;
            }
            const fields = elements.form.querySelectorAll('input, textarea, select');
            const fallbackToggle = root.querySelector('input[data-action="toggle-fallback"]');
            const notesToggle = root.querySelector('input[data-action="toggle-notes"]');
            demoSnapshot = {
                fields: Array.from(fields).map(field => ({
                    field,
                    value: field.value,
                })),
                optionals: {
                    fallbackVisible: elements.fallbackField ? !elements.fallbackField.hidden : false,
                    notesVisible: elements.notesField ? !elements.notesField.hidden : false,
                    fallbackChecked: fallbackToggle instanceof HTMLInputElement ? fallbackToggle.checked : false,
                    notesChecked: notesToggle instanceof HTMLInputElement ? notesToggle.checked : false,
                },
            };
        }

        function restoreDemoState() {
            if (!demoSnapshot) {
                return;
            }
            demoSnapshot.fields.forEach(item => {
                if (!item.field) {
                    return;
                }
                item.field.value = item.value;
                item.field.dispatchEvent(new Event('input', { bubbles: true }));
                if (item.field instanceof HTMLSelectElement) {
                    item.field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            setOptionalVisibility('fallback', !!demoSnapshot.optionals?.fallbackVisible, { preserveValue: true });
            setOptionalVisibility('notes', !!demoSnapshot.optionals?.notesVisible, { preserveValue: true });
            if (demoSnapshot.optionals) {
                const fallbackToggle = root.querySelector('input[data-action="toggle-fallback"]');
                const notesToggle = root.querySelector('input[data-action="toggle-notes"]');
                if (fallbackToggle instanceof HTMLInputElement) {
                    fallbackToggle.checked = demoSnapshot.optionals.fallbackChecked;
                }
                if (notesToggle instanceof HTMLInputElement) {
                    notesToggle.checked = demoSnapshot.optionals.notesChecked;
                }
            }
            demoSnapshot = null;
        }

        function applyStepDemo(step) {
            if (!step?.fill) {
                return;
            }
            snapshotDemoState();
            const map = step.fill;
            const labelInput = getField('label');
            if (labelInput instanceof HTMLInputElement && map.label) {
                labelInput.value = map.label;
            }
            const requestPathInput = getField('request-path');
            if (requestPathInput instanceof HTMLInputElement && map.requestPath) {
                requestPathInput.value = map.requestPath;
            }
            const conditionSelect = getField('condition-type');
            if (conditionSelect instanceof HTMLSelectElement && map.conditionType) {
                conditionSelect.value = map.conditionType;
                toggleConditionTerms(map.conditionType);
            }
            const termsInput = getField('condition-terms');
            if (termsInput instanceof HTMLTextAreaElement && map.conditionTerms) {
                termsInput.value = map.conditionTerms;
            }
            const valueSourceSelect = getField('value-source');
            if (valueSourceSelect instanceof HTMLSelectElement && map.valueSource) {
                valueSourceSelect.value = map.valueSource;
                toggleValueSource(map.valueSource);
            }
            const valuePathInput = getField('value-path');
            if (valuePathInput instanceof HTMLInputElement && map.valuePath) {
                valuePathInput.value = map.valuePath;
            }
            const valueLiteralInput = getField('value-literal');
            if (valueLiteralInput instanceof HTMLInputElement && map.valueLiteral) {
                valueLiteralInput.value = map.valueLiteral;
            }
            if (typeof map.fallback === 'string') {
                setOptionalVisibility('fallback', true);
                const fallbackInput = getField('fallback');
                if (fallbackInput instanceof HTMLInputElement) {
                    fallbackInput.value = map.fallback;
                }
            }
            if (typeof map.notes === 'string') {
                setOptionalVisibility('notes', true);
                const notesInput = getField('notes');
                if (notesInput instanceof HTMLTextAreaElement) {
                    notesInput.value = map.notes;
                }
            }
            const coordinateInput = getField('coordinate');
            if (coordinateInput instanceof HTMLInputElement && map.coordinate) {
                coordinateInput.value = map.coordinate;
            }
        }

        function getStepTarget(step) {
            if (!step || !step.target) {
                return null;
            }
            return root.querySelector(step.target);
        }

        function placeSpotlight(target, padding = 12) {
            if (!(elements.tutorialSpotlight instanceof HTMLElement)) {
                return;
            }
            if (!target) {
                elements.tutorialSpotlight.hidden = true;
                elements.tutorialSpotlight.setAttribute('aria-hidden', 'true');
                return;
            }
            const rect = target.getBoundingClientRect();
            elements.tutorialSpotlight.hidden = false;
            elements.tutorialSpotlight.setAttribute('aria-hidden', 'false');
            elements.tutorialSpotlight.style.width = `${rect.width + padding * 2}px`;
            elements.tutorialSpotlight.style.height = `${rect.height + padding * 2}px`;
            elements.tutorialSpotlight.style.left = `${rect.left - padding}px`;
            elements.tutorialSpotlight.style.top = `${rect.top - padding}px`;
        }

        function focusTutorialOnStep(step) {
            const target = getStepTarget(step);
            if (target instanceof HTMLElement) {
                const sidebarPanel = target.closest('.function-creation__builder-sidebar')?.querySelector('.function-creation__builder-panel')
                    || target.closest('.function-creation__builder-panel');
                if (sidebarPanel instanceof HTMLElement) {
                    const offset = target.offsetTop - sidebarPanel.offsetTop - 24;
                    sidebarPanel.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
                }
                if (step?.anchor) {
                    try {
                        window.location.hash = step.anchor;
                    } catch (error) {
                        console.error(error);
                    }
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
            placeSpotlight(target, step?.spotlightPadding ?? 12);
            if (target instanceof HTMLElement) {
                const rect = target.getBoundingClientRect();
                const bubbleRect = elements.tutorialBubble?.getBoundingClientRect();
                const arrowSide = step?.bubblePosition?.side || 'right';
                const offset = typeof step?.bubblePosition?.offset === 'number' ? step.bubblePosition.offset : 18;
                const align = step?.bubblePosition?.align || 'start';
                let x = rect.right + offset;
                let y = rect.top;
                if (bubbleRect) {
                    if (arrowSide === 'left') {
                        x = rect.left - bubbleRect.width - offset;
                    }
                    if (align === 'center') {
                        y = rect.top + (rect.height / 2) - (bubbleRect.height / 2);
                    }
                }
                if (elements.tutorialBubble instanceof HTMLElement) {
                    elements.tutorialBubble.dataset.position = arrowSide;
                }
                placeTutorialBubble({ x, y });
                state.tutorialPosition = { x, y };
            }
        }

        function refreshTutorialFocus() {
            if (elements.tutorial && elements.tutorial.hidden) {
                return;
            }
            const step = state.tutorialSteps[state.tutorialIndex];
            focusTutorialOnStep(step);
        }

        function renderActionList() {
            if (!elements.tutorialActionList) {
                return;
            }
            elements.tutorialActionList.innerHTML = '';
            state.filteredActions.forEach(action => {
                const wrap = doc.createElement('div');
                wrap.className = 'qa-tutorial__action-items';
                const button = doc.createElement('button');
                button.type = 'button';
                button.textContent = action.label;
                button.addEventListener('click', () => {
                    elements.tutorialActionSearch && (elements.tutorialActionSearch.value = '');
                    closeActionPopover();
                    if (elements.tutorialText) {
                        elements.tutorialText.textContent = `${action.label} : ${action.description}`;
                    }
                });
                const desc = doc.createElement('p');
                desc.className = 'qa-tutorial__text';
                desc.textContent = action.description;
                wrap.appendChild(button);
                wrap.appendChild(desc);
                elements.tutorialActionList.appendChild(wrap);
            });
        }

        function openActionPopover() {
            if (!elements.tutorialActionPopover) {
                return;
            }
            if (elements.tutorialBubble instanceof HTMLElement) {
                const bubbleRect = elements.tutorialBubble.getBoundingClientRect();
                placeActionPopover({ x: bubbleRect.left, y: bubbleRect.bottom + 8 });
            }
            elements.tutorialActionPopover.hidden = false;
            renderActionList();
        }

        function closeActionPopover() {
            if (!elements.tutorialActionPopover) {
                return;
            }
            elements.tutorialActionPopover.hidden = true;
            elements.tutorialActionPopover.classList.remove('is-dragging');
            popoverDragState.active = false;
            if (elements.tutorialActionSearch) {
                elements.tutorialActionSearch.value = '';
            }
            state.filteredActions = [...state.actions];
        }

        function startPopoverDrag(event) {
            if (!(elements.tutorialActionPopover instanceof HTMLElement) || event.button !== 0) {
                return;
            }
            const rect = elements.tutorialActionPopover.getBoundingClientRect();
            popoverDragState.active = true;
            popoverDragState.offsetX = event.clientX - rect.left;
            popoverDragState.offsetY = event.clientY - rect.top;
            elements.tutorialActionPopover.classList.add('is-dragging');
            elements.tutorialActionPopover.setPointerCapture?.(event.pointerId);
        }

        function movePopover(event) {
            if (!popoverDragState.active || !(elements.tutorialActionPopover instanceof HTMLElement)) {
                return;
            }
            placeActionPopover({
                x: event.clientX - popoverDragState.offsetX,
                y: event.clientY - popoverDragState.offsetY,
            });
        }

        function endPopoverDrag(event) {
            if (!popoverDragState.active || !(elements.tutorialActionPopover instanceof HTMLElement)) {
                return;
            }
            popoverDragState.active = false;
            elements.tutorialActionPopover.classList.remove('is-dragging');
            elements.tutorialActionPopover.releasePointerCapture?.(event.pointerId);
            const rect = elements.tutorialActionPopover.getBoundingClientRect();
            placeActionPopover({ x: rect.left, y: rect.top });
        }

        function placeTutorialSelectionBlock(position) {
            if (!(tutorialSelectionBlock instanceof HTMLElement)) {
                return;
            }
            const rect = tutorialSelectionBlock.getBoundingClientRect();
            const width = rect.width || 360;
            const height = rect.height || 220;
            const viewportWidth = doc.documentElement.clientWidth;
            const viewportHeight = doc.documentElement.clientHeight;
            const defaultX = Math.max(viewportWidth - width - 24, 12);
            const defaultY = Math.max(96, 12);
            const targetX = typeof position?.x === 'number' ? position.x : defaultX;
            const targetY = typeof position?.y === 'number' ? position.y : defaultY;
            const x = clamp(targetX, 12, Math.max(12, viewportWidth - width - 12));
            const y = clamp(targetY, 12, Math.max(12, viewportHeight - height - 12));
            tutorialSelectionBlock.style.left = `${x}px`;
            tutorialSelectionBlock.style.top = `${y}px`;
            state.tutorialSelectionPosition = { x, y };
        }

        function startSelectionDrag(event) {
            if (!(tutorialSelectionBlock instanceof HTMLElement) || event.button !== 0) {
                return;
            }
            const rect = tutorialSelectionBlock.getBoundingClientRect();
            selectionDragState.active = true;
            selectionDragState.offsetX = event.clientX - rect.left;
            selectionDragState.offsetY = event.clientY - rect.top;
            tutorialSelectionBlock.classList.add('is-dragging');
            tutorialSelectionBlock.setPointerCapture?.(event.pointerId);
        }

        function moveSelectionBlock(event) {
            if (!selectionDragState.active) {
                return;
            }
            placeTutorialSelectionBlock({
                x: event.clientX - selectionDragState.offsetX,
                y: event.clientY - selectionDragState.offsetY,
            });
        }

        function endSelectionDrag(event) {
            if (!selectionDragState.active || !(tutorialSelectionBlock instanceof HTMLElement)) {
                return;
            }
            selectionDragState.active = false;
            tutorialSelectionBlock.classList.remove('is-dragging');
            tutorialSelectionBlock.releasePointerCapture?.(event.pointerId);
            const rect = tutorialSelectionBlock.getBoundingClientRect();
            state.tutorialSelectionPosition = { x: rect.left, y: rect.top };
        }

        function bindSelectionBlockDrag(block) {
            if (!(block instanceof HTMLElement) || block.dataset.tutorialDragBound === 'true') {
                return;
            }
            const handle = block.querySelector('header');
            if (!handle) {
                return;
            }
            block.dataset.tutorialDragBound = 'true';
            handle.addEventListener('pointerdown', startSelectionDrag);
            block.addEventListener('pointermove', moveSelectionBlock);
            block.addEventListener('pointerup', endSelectionDrag);
            block.addEventListener('pointercancel', endSelectionDrag);
        }

        function activateTutorialSelectionBlock(block) {
            if (!(block instanceof HTMLElement)) {
                return;
            }
            tutorialSelectionBlock = block;
            block.classList.add('qa-tutorial-selection');
            const layer = doc.getElementById('client-data-layer');
            if (layer instanceof HTMLElement) {
                layer.appendChild(block);
                layer.setAttribute('aria-hidden', 'false');
            }
            bindSelectionBlockDrag(block);
            placeTutorialSelectionBlock(state.tutorialSelectionPosition);
            tutorialPlayback.artifacts.push(() => {
                selectionDragState.active = false;
                tutorialSelectionBlock = null;
                block.classList.remove('qa-tutorial-selection');
                block.remove();
                if (layer instanceof HTMLElement) {
                    layer.setAttribute('aria-hidden', 'true');
                }
            });
        }

        function filterActions() {
            const query = (elements.tutorialActionSearch?.value ?? '').toLowerCase();
            state.filteredActions = state.actions.filter(action => {
                return action.label.toLowerCase().includes(query) || action.description.toLowerCase().includes(query);
            });
            renderActionList();
        }

        let tutorialClientSnapshot = null;

        function snapshotClientsForTutorial() {
            if (tutorialClientSnapshot) {
                return;
            }
            tutorialClientSnapshot = {
                clients: [...state.clients],
                filtered: [...state.filteredClients],
                search: state.clientSearchQuery,
                selected: new Set(state.selectedClientIds),
                cache: new Map(state.clientDataCache),
                selections: new Map(state.clientSelections),
                drafts: new Map(state.clientSelectionDraft),
                emptyMessage: state.clientEmptyMessage,
            };
        }

        function restoreClientsFromSnapshot() {
            if (!tutorialClientSnapshot) {
                return;
            }
            state.clients = [...tutorialClientSnapshot.clients];
            state.filteredClients = [...tutorialClientSnapshot.filtered];
            state.clientSearchQuery = tutorialClientSnapshot.search;
            state.selectedClientIds = new Set(tutorialClientSnapshot.selected);
            state.clientDataCache = new Map(tutorialClientSnapshot.cache);
            state.clientSelections = new Map(tutorialClientSnapshot.selections);
            state.clientSelectionDraft = new Map(tutorialClientSnapshot.drafts);
            state.clientEmptyMessage = tutorialClientSnapshot.emptyMessage;
            tutorialClientSnapshot = null;
            renderClientList();
            renderDataExplorer({ skipBroadcast: true });
        }

        function primeTutorialDemo() {
            snapshotClientsForTutorial();
            ensureDemoClient({ select: false });
            if (elements.clientSearch instanceof HTMLInputElement) {
                elements.clientSearch.value = 'Jan';
                state.clientSearchQuery = 'jan';
            }
            state.filteredClients = state.clients.filter(client => `${client.displayName} ${client.id}`.toLowerCase().includes('jan'));
            state.clientEmptyMessage = 'Clients trouvés pour votre recherche.';
            state.clientDataCache.set('DEMO_JANE_DOE', {
                request: {
                    formData: {
                        adresses: [{ ville: 'Québec', libelle: '123 rue de démo, QC' }],
                    },
                    coordonnees: {
                        telephone: '555-123-9876',
                        courriel: 'jane.doe@example.com',
                    },
                },
            });
            state.clientSelections = new Map();
            state.clientSelectionDraft = new Map();
            renderClientList();
            renderDataExplorer({ skipBroadcast: true });
        }

        function openTutorial() {
            if (!elements.tutorial) {
                return;
            }
            primeTutorialDemo();
            elements.tutorial.hidden = false;
            elements.tutorial.setAttribute('aria-hidden', 'false');
            state.tutorialIndex = 0;
            renderTutorialStep();
            refreshTutorialFocus();
            if (elements.tutorialBubble instanceof HTMLElement) {
                elements.tutorialBubble.focus();
            }
        }

        function closeTutorial() {
            if (!elements.tutorial) {
                return;
            }
            elements.tutorial.hidden = true;
            elements.tutorial.setAttribute('aria-hidden', 'true');
            closeActionPopover();
            elements.tutorialSimulation && (elements.tutorialSimulation.innerHTML = '');
            restoreDemoState();
            restoreClientsFromSnapshot();
            clearTutorialArtifacts();
            updateTutorialScriptControls();
            placeSpotlight(null);
            state.tutorialPosition = null;
            state.tutorialSelectionPosition = null;
            tutorialSelectionBlock = null;
        }

        function stepTutorial(delta) {
            const currentQueueRemaining = tutorialPlayback.queue.length - tutorialPlayback.pointer;
            if (delta > 0 && currentQueueRemaining > 0) {
                playNextTutorialAction();
                return;
            }
            if (delta < 0 && tutorialPlayback.pointer > 0) {
                tutorialPlayback.pointer = 0;
                updateTutorialScriptControls();
                return;
            }
            const total = state.tutorialSteps.length;
            state.tutorialIndex = (state.tutorialIndex + delta + total) % total;
            renderTutorialStep();
        }

        function scheduleReturnToManager() {
            if (settings.mode !== 'standalone') {
                return;
            }
            window.clearTimeout(returnTimer);
            returnTimer = window.setTimeout(() => {
                closeWindow();
            }, 1400);
        }

        function closeWindow() {
            if (typeof settings.onClose === 'function' && settings.onClose() === true) {
                return;
            }
            if (settings.mode === 'standalone') {
                if (window.opener && !window.opener.closed) {
                    window.close();
                    return;
                }
                const fallback = new URL('question_actions_manager.php', window.location.href);
                window.location.href = fallback.toString();
                return;
            }
            history.back();
        }

        function handleKeydown(event) {
            if (event.key === 'Escape') {
                if (previewPickMode) {
                    stopPreviewPickMode();
                    return;
                }
                if (elements.tutorialActionPopover && elements.tutorial && !elements.tutorial.hidden && !elements.tutorialActionPopover.hidden) {
                    closeActionPopover();
                    return;
                }
                if (elements.tutorial && !elements.tutorial.hidden) {
                    closeTutorial();
                    return;
                }
                if (elements.faq && !elements.faq.hidden) {
                    closeFaq();
                    return;
                }
                closeWindow();
            }
        }

        function bindEvents() {
            elements.clientSearch?.addEventListener('input', applySearch);
            elements.explorerSearch?.addEventListener('input', applyExplorerSearch);
            elements.dataExplorer?.addEventListener('click', handleExplorerClick);
            doc.getElementById('client-data-dialog-commit')?.addEventListener('click', () => {
                commitSelectionDraft({ pin: true });
            });
            doc.getElementById('client-data-dialog-cancel')?.addEventListener('click', resetSelectionDraft);
            elements.form?.addEventListener('submit', handleSubmit);
            elements.form?.addEventListener('input', updatePreview);
            elements.form?.addEventListener('change', updatePreview);
            const templateSaveBtn = doc.getElementById('template-save');
            templateSaveBtn?.addEventListener('click', event => {
                event.preventDefault();
                elements.form?.requestSubmit();
            });
            const conditionSelect = getField('condition-type');
            if (conditionSelect instanceof HTMLSelectElement) {
                conditionSelect.addEventListener('change', event => {
                    toggleConditionTerms(event.currentTarget.value);
                });
                toggleConditionTerms(conditionSelect.value);
            }
            const valueSourceSelect = getField('value-source');
            if (valueSourceSelect instanceof HTMLSelectElement) {
                valueSourceSelect.addEventListener('change', event => {
                    toggleValueSource(event.currentTarget.value);
                });
                toggleValueSource(valueSourceSelect.value);
            }
            root.querySelectorAll('input[data-action="toggle-fallback"], input[data-action="toggle-notes"]').forEach(input => {
                input.addEventListener('change', handleOptionalToggle);
            });
            const resetBtn = elements.form?.querySelector('[data-action="reset-form"]');
            resetBtn?.addEventListener('click', resetForm);
            root.querySelectorAll('[data-action="open-faq"]').forEach(button => {
                button.addEventListener('click', openFaq);
            });
            root.querySelector('[data-action="close-faq"]')?.addEventListener('click', closeFaq);
            doc.querySelectorAll('[data-action="return-to-qa"]').forEach(button => {
                button.addEventListener('click', closeWindow);
            });
            const walkthroughTriggers = Array.from(doc.querySelectorAll('[data-action="open-walkthrough"]'));
            walkthroughTriggers.forEach(button => button.addEventListener('click', openTutorial));
            elements.tutorial?.querySelector('[data-role="tutorial-close"]')?.addEventListener('click', closeTutorial);
            elements.tutorial?.querySelector('[data-role="tutorial-prev"]')?.addEventListener('click', () => stepTutorial(-1));
            elements.tutorial?.querySelector('[data-role="tutorial-next"]')?.addEventListener('click', () => stepTutorial(1));
            elements.tutorialScriptNext?.addEventListener('click', playNextTutorialAction);
            elements.tutorialActionsBtn?.addEventListener('click', openActionPopover);
            elements.tutorialActionClose?.addEventListener('click', closeActionPopover);
            elements.tutorialActionSearch?.addEventListener('input', filterActions);
            const tutorialHandle = elements.tutorialBubble?.querySelector('.qa-tutorial__bubble-header');
            tutorialHandle?.addEventListener('pointerdown', startBubbleDrag);
            elements.tutorialBubble?.addEventListener('pointermove', moveBubble);
            elements.tutorialBubble?.addEventListener('pointerup', endBubbleDrag);
            elements.tutorialBubble?.addEventListener('pointercancel', endBubbleDrag);
            const popoverHandle = elements.tutorialActionPopover?.querySelector('[data-role="action-popover-header"]');
            popoverHandle?.addEventListener('pointerdown', startPopoverDrag);
            elements.tutorialActionPopover?.addEventListener('pointermove', movePopover);
            elements.tutorialActionPopover?.addEventListener('pointerup', endPopoverDrag);
            elements.tutorialActionPopover?.addEventListener('pointercancel', endPopoverDrag);
            root.querySelector('[data-action="open-cartography"]')?.addEventListener('click', openCartography);
            root.querySelectorAll('[data-action="pick-coordinate"]').forEach(button => {
                button.addEventListener('click', handleCoordinatePick);
            });
            elements.previewSelect?.addEventListener('change', event => {
                const templateId = event.target.value;
                setActiveTemplateCard(templateId);
                loadPreviewTemplate(templateId);
            });
            elements.previewPrev?.addEventListener('click', () => changePreviewPage(-1));
            elements.previewNext?.addEventListener('click', () => changePreviewPage(1));
            elements.previewCanvas?.addEventListener('click', handlePreviewCanvasClick);
            root.querySelector('[data-action="reload-preview"]')?.addEventListener('click', () => initLivePreview(true));
            elements.coordinateSelect?.addEventListener('change', event => {
                loadCoordinateTemplate(event.target.value);
            });
            root.querySelector('[data-action="close-coordinate"]')?.addEventListener('click', closeCoordinateModal);
            root.querySelector('[data-action="reload-templates"]')?.addEventListener('click', () => initLivePreview(true));
            elements.coordinateCanvas?.addEventListener('click', handleCoordinateClick);
            elements.coordinatePrev?.addEventListener('click', () => changeCoordinatePage(-1));
            elements.coordinateNext?.addEventListener('click', () => changeCoordinatePage(1));
            elements.coordinateUse?.addEventListener('click', applySelectedCoordinate);
            elements.postSaveStay?.addEventListener('click', handleStayHere);
            elements.postSaveQuit?.addEventListener('click', handleQuitToManager);
            elements.postSaveClose?.addEventListener('click', closePostSaveModal);
            elements.selectClientsBtn?.addEventListener('click', focusClientSelector);
            elements.tutorialBackdrop?.addEventListener('click', closeTutorial);
            elements.tutorial?.addEventListener('click', event => {
                if (event.target === elements.tutorial) {
                    closeTutorial();
                }
            });
            elements.faq?.addEventListener('click', event => {
                if (event.target === elements.faq) {
                    closeFaq();
                }
            });
            doc.addEventListener('keydown', handleKeydown);
            window.addEventListener('message', handleBridgeMessage);
            window.addEventListener('resize', refreshTutorialFocus);
            doc.addEventListener('scroll', refreshTutorialFocus, true);
        }

        function openCartography(event) {
            event?.preventDefault();
            const origin = window.location.origin && window.location.origin !== 'null'
                ? window.location.origin
                : window.location.href;
            const baseUrl = new URL('/services/ValuesIdentification/paths.php', origin);
            const requestPathInput = getField('request-path');
            if (requestPathInput instanceof HTMLInputElement) {
                const currentPath = requestPathInput.value.trim();
                if (currentPath) {
                    baseUrl.searchParams.set('path', currentPath);
                }
            }
            window.open(baseUrl.toString(), '_blank', 'noopener');
        }

        function handleCoordinatePick(event) {
            event?.preventDefault();
            const coordinateInput = getField('coordinate');
            const pickFromTemplate = typeof window.pickTemplateCoordinate === 'function';
            if (pickFromTemplate && coordinateInput instanceof HTMLInputElement) {
                window.pickTemplateCoordinate()
                    .then(result => {
                        if (!result?.coordinate) {
                            return;
                        }
                        coordinateInput.value = result.coordinate;
                        coordinateInput.dispatchEvent(new Event('input', { bubbles: true }));
                        updatePreview();
                        setFeedback('Coordonnée utilisé avec succès!');
                    })
                    .catch(error => {
                        console.error('Impossible de récupérer la coordonnée depuis le document.', error);
                        startPreviewPickMode();
                    });
                return;
            }
            startPreviewPickMode();
        }

        function requestCoordinateFromParent(contextLabel) {
            const message = {
                type: 'qa-auto-builder:request-coordinate',
                contextLabel,
            };
            const targetOrigin = window.location.origin && window.location.origin !== 'null'
                ? window.location.origin
                : '*';
            let delivered = false;
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage(message, targetOrigin);
                    delivered = true;
                } catch (error) {
                    try {
                        window.opener.postMessage(message, '*');
                        delivered = true;
                    } catch (nestedError) {
                        delivered = false;
                    }
                }
            }
            if (!delivered) {
                const fallbackUrl = new URL('question_actions_manager.php', window.location.href);
                const params = new URLSearchParams(window.location.search || '');
                const classId = params.get('class');
                if (classId) {
                    fallbackUrl.searchParams.set('class', classId);
                }
                const fallbackWindow = window.open(fallbackUrl.toString(), '_blank', 'noopener');
                if (fallbackWindow && !fallbackWindow.closed) {
                    try {
                        fallbackWindow.postMessage(message, fallbackUrl.origin || '*');
                        delivered = true;
                    } catch (error) {
                        try {
                            fallbackWindow.postMessage(message, '*');
                            delivered = true;
                        } catch (nestedError) {
                            delivered = false;
                        }
                    }
                }
            }
            if (!delivered) {
                window.alert('Ouvrez cette page depuis Questions/Actions pour viser une coordonnée automatiquement.');
                return;
            }
            setFeedback('Sélecteur de coordonnées ouvert dans Questions/Actions. Validez le point pour le récupérer ici.');
        }

        function handleBridgeMessage(event) {
            if (!event || typeof event.data !== 'object' || event.data === null) {
                return;
            }
            const origin = event.origin ?? '';
            if (origin && origin !== 'null' && origin !== window.location.origin) {
                return;
            }
            if (event.data.type !== 'qa-auto-builder:set-coordinate') {
                return;
            }
            const coordinate = typeof event.data.coordinate === 'string' ? event.data.coordinate : '';
            const input = getField('coordinate');
            if (input instanceof HTMLInputElement) {
                input.value = coordinate;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                setFeedback('Coordonnée importée depuis Questions/Actions.');
            }
        }

        bindEvents();
        loadClients();
        initLivePreview();
        updatePreview();

        return {
            destroy() {
                doc.removeEventListener('keydown', handleKeydown);
                window.removeEventListener('message', handleBridgeMessage);
            },
        };
    }

    window.QAAutoBuilder = window.QAAutoBuilder || {};
    window.QAAutoBuilder.mount = mount;
})();
