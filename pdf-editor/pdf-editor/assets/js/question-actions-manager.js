



const API_BASE_URL = 'admin_document_editor_api.php';

const classListEl = document.querySelector('[data-role="class-list"]');
const classEmptyEl = document.querySelector('[data-role="class-empty"]');
const classSearchInput = document.querySelector('[data-role="class-search"]');
const reloadBtn = document.querySelector('[data-action="reload"]');
const newClassBtn = document.querySelector('[data-action="new-class"]');
const tutorialTrigger = document.querySelector('[data-action="open-tutorial"]');
const tutorialEl = document.getElementById('qa-tutorial');
const tutorialCloseBtn = tutorialEl?.querySelector('[data-role="tutorial-close"]') ?? null;
const tutorialBackdrop = tutorialEl?.querySelector('[data-role="tutorial-backdrop"]') ?? null;
const tutorialSpotlight = tutorialEl?.querySelector('[data-role="tutorial-spotlight"]') ?? null;
const tutorialBubble = tutorialEl?.querySelector('[data-role="tutorial-bubble"]') ?? null;
const tutorialStepLabel = tutorialEl?.querySelector('[data-role="tutorial-step"]') ?? null;
const tutorialTitleEl = tutorialEl?.querySelector('[data-role="tutorial-title"]') ?? null;
const tutorialBodyEl = tutorialEl?.querySelector('[data-role="tutorial-body"]') ?? null;
const tutorialTextEl = tutorialEl?.querySelector('[data-role="tutorial-text"]') ?? null;
const tutorialExamplesEl = tutorialEl?.querySelector('[data-role="tutorial-examples"]') ?? null;
const tutorialSimulationEl = tutorialEl?.querySelector('[data-role="tutorial-simulation"]') ?? null;
const tutorialPrevBtn = tutorialEl?.querySelector('[data-role="tutorial-prev"]') ?? null;
const tutorialNextBtn = tutorialEl?.querySelector('[data-role="tutorial-next"]') ?? null;
const tutorialActionsBtn = tutorialEl?.querySelector('[data-role="tutorial-actions"]') ?? null;
const tutorialActionPopover = tutorialEl?.querySelector('[data-role="tutorial-action-popover"]') ?? null;
const tutorialActionHeader = tutorialActionPopover?.querySelector('[data-role="action-popover-header"]') ?? null;
const tutorialActionSearch = tutorialActionPopover?.querySelector('[data-role="action-search"]') ?? null;
const tutorialActionList = tutorialActionPopover?.querySelector('[data-role="action-list"]') ?? null;
const tutorialQuizEl = tutorialActionPopover?.querySelector('[data-role="action-quiz"]') ?? null;
const tutorialQuizOptions = tutorialQuizEl?.querySelector('[data-role="action-quiz-options"]') ?? null;
const formEl = document.querySelector('[data-role="class-form"]');
const placeholderEl = document.querySelector('[data-role="editor-placeholder"]');
const formTitleEl = formEl?.querySelector('[data-role="form-title"]');
const formSubtitleEl = formEl?.querySelector('[data-role="form-subtitle"]');
const formDocumentContextEl = formEl?.querySelector('[data-role="document-context"]') ?? null;
const classIdInput = formEl?.querySelector('[data-role="class-id"]');
const classTitleInput = formEl?.querySelector('[data-role="class-title"]');
const classCodeInput = formEl?.querySelector('[data-role="class-code"]');
const classDescriptionInput = formEl?.querySelector('[data-role="class-description"]');
const classCodeDisplay = formEl?.querySelector('[data-role="class-code-display"]');
const questionListEl = formEl?.querySelector('[data-role="question-list"]');
const blobListEl = formEl?.querySelector('[data-role="blob-list"]');
const autoListEl = formEl?.querySelector('[data-role="auto-list"]');
const feedbackEl = formEl?.querySelector('[data-role="form-feedback"]');
const addQuestionBtn = formEl?.querySelector('[data-action="add-question"]');
const addBlobBtn = formEl?.querySelector('[data-action="add-blob"]');
const openAutoBuilderBtn = formEl?.querySelector('[data-action="open-auto-builder"]');
const addAutoSelectionBtn = formEl?.querySelector('[data-action="add-auto-selection"]');
const openAutoFaqBtn = formEl?.querySelector('[data-action="open-auto-faq"]');
const cancelBtn = formEl?.querySelector('[data-action="cancel-edit"]');
const saveBtn = formEl?.querySelector('button[type="submit"]') ?? null;
const deleteBtn = formEl?.querySelector('[data-action="delete-class"]');
const duplicateBtn = formEl?.querySelector('[data-action="duplicate-class"]');
const cancelBtnDefaultLabel = cancelBtn?.textContent ?? 'Annuler';

const questionTemplate = document.getElementById('qa-question-template');
const optionTemplate = document.getElementById('qa-option-template');
const blobTemplate = document.getElementById('qa-blob-template');
const autoTemplate = document.getElementById('qa-auto-selection-template');
const categoryTemplate = document.getElementById('qa-category-template');
const dynamicMaxTemplate = document.getElementById('qa-dynamic-max-template');
const dynamicRequestTemplate = document.getElementById('qa-dynamic-request-template');
const coordinateItemTemplate = document.getElementById('qa-coordinate-item-template');
const autoFaqEl = document.getElementById('qa-auto-faq');
const autoFaqCloseBtn = autoFaqEl?.querySelector('[data-role="auto-faq-close"]') ?? null;
const autoFaqPanel = autoFaqEl?.querySelector('.qa-auto-faq__panel') ?? null;
const tabButtons = formEl ? Array.from(formEl.querySelectorAll('[data-role="qa-tab"]')) : [];
const tabPanels = formEl ? Array.from(formEl.querySelectorAll('[data-tab-panel]')) : [];
const gatedTabButtons = formEl ? Array.from(formEl.querySelectorAll('[data-visibility="requires-class"]')) : [];
const hoverHelpRegistry = new WeakSet();
const sidebarEl = document.querySelector('[data-role="qa-sidebar"]');
const sidebarRevealBtn = document.querySelector('[data-action="reveal-sidebar"]');
const sidebarCollapseBtn = document.querySelector('[data-action="collapse-sidebar"]');
const openConfigLibraryBtn = document.querySelector('[data-action="open-config-library"]');
const configLibraryEl = document.getElementById('qa-config-library');
const configLibraryList = configLibraryEl?.querySelector('[data-role="config-library-list"]') ?? null;
const configLibraryPanel = configLibraryEl?.querySelector('.qa-config-library__panel') ?? null;
const configLibraryHeader = configLibraryEl?.querySelector('[data-role="config-library-header"]') ?? null;
const configLibraryToggleBtn = document.querySelector('[data-action="reopen-config-library"]');
const coordinatePickerEl = document.getElementById('qa-coordinate-picker');
const coordinatePickerBackdrop = coordinatePickerEl?.querySelector('[data-role="picker-dismiss"]') ?? null;
const coordinatePickerPanel = coordinatePickerEl?.querySelector('[data-role="picker-panel"]') ?? null;
const coordinatePickerFileInput = coordinatePickerEl?.querySelector('[data-role="picker-file"]') ?? null;
const coordinatePickerCanvas = coordinatePickerEl?.querySelector('[data-role="picker-canvas"]') ?? null;
const coordinatePickerMarker = coordinatePickerEl?.querySelector('[data-role="picker-marker"]') ?? null;
const coordinatePickerEmpty = coordinatePickerEl?.querySelector('[data-role="picker-empty"]') ?? null;
const coordinatePickerContext = coordinatePickerEl?.querySelector('[data-role="picker-context"]') ?? null;
const coordinatePickerInfo = coordinatePickerEl?.querySelector('[data-role="picker-info"]') ?? null;
const coordinatePickerPageInput = coordinatePickerEl?.querySelector('[data-role="picker-page"]') ?? null;
const coordinatePickerPageTotal = coordinatePickerEl?.querySelector('[data-role="picker-page-total"]') ?? null;
const coordinatePickerZoomInput = coordinatePickerEl?.querySelector('[data-role="picker-zoom"]') ?? null;
const coordinatePickerApplyBtn = coordinatePickerEl?.querySelector('[data-action="picker-apply"]') ?? null;
const coordinatePickerCancelBtn = coordinatePickerEl?.querySelector('[data-action="picker-cancel"]') ?? null;
const coordinatePickerCloseBtn = coordinatePickerEl?.querySelector('[data-action="picker-close"]') ?? null;
const coordinatePickerResetBtn = coordinatePickerEl?.querySelector('[data-action="picker-reset"]') ?? null;
const coordinatePickerTemplateSelect = coordinatePickerEl?.querySelector('[data-role="picker-template"]') ?? null;
const coordinatePickerTemplateRefresh = coordinatePickerEl?.querySelector('[data-action="picker-refresh-templates"]') ?? null;
const coordinatePickerOverlay = coordinatePickerEl?.querySelector('[data-role="picker-overlay"]') ?? null;

const variableBrowserEl = document.getElementById('qa-variable-browser');
const variableBrowserSearch = variableBrowserEl?.querySelector('[data-role="variable-search"]') ?? null;
const variableBrowserResults = variableBrowserEl?.querySelector('[data-role="variable-results"]') ?? null;
const variableBrowserEmpty = variableBrowserEl?.querySelector('[data-role="variable-empty"]') ?? null;
const variableBrowserCloseButtons = variableBrowserEl ? Array.from(variableBrowserEl.querySelectorAll('[data-action="close-variable-browser"]')) : [];
const documentSummaryEl = document.querySelector('[data-role="document-summary"]');
const documentNameEl = document.querySelector('[data-role="document-name"]');
const documentChangeBtn = document.querySelector('[data-action="change-document"]');
const documentSelect = document.querySelector('[data-role="document-select"]');
const documentOpenBtn = document.querySelector('[data-action="document-open"]');
const documentRefreshBtn = document.querySelector('[data-action="document-refresh"]');
const documentImportBtn = document.querySelector('[data-action="document-import"]');
const documentEmptyMessage = document.querySelector('[data-role="document-empty"]');

let classes = [];
let filteredClasses = [];
let activeClassId = null;
let isDirty = false;
let suppressDirtyWarning = false;
let activeTab = 'questions';
let activeClassMetadata = {};
let tooltipEl = null;
let tooltipActiveTarget = null;
const ALLOWED_HELP_TAGS = new Set(['A', 'BR', 'CODE', 'EM', 'STRONG', 'SPAN']);
const transientClassCodes = new Set();
let activeTransientClassCode = null;
let activeDocumentId = '';
let activeDocument = null;
let templateLibrary = [];
let templateLibraryLoaded = false;
let templateLibraryPromise = null;
let isPreviewMode = false;
let previewSourceDocumentId = '';
let previewSourceDocumentName = '';

let variableDefinitionsData = { groups: [] };
let variableBrowserLoaded = false;
let variableBrowserSearchTerm = '';
let variableBrowserTargetInput = null;

function isCoordinatePickerOpen() {
    return Boolean(coordinatePickerEl && !coordinatePickerEl.hidden);
}

let coordinateTemplateLibrary = [];
let coordinateTemplateLoaded = false;
let coordinateTemplatePromise = null;

const coordinatePickerState = {
    pdfDoc: null,
    currentPage: 1,
    scale: 1.2,
    viewport: null,
    targetInput: null,
    remoteTarget: null,
    targetContext: '',
    lastPick: null,
    pendingPick: null,
    fileName: '',
    templateId: '',
    templateName: '',
    overlayMarkers: [],
    templateAssignments: [],
};

let tutorialSteps = [];
let tutorialIndex = 0;
let tutorialStepLookup = new Map();
let tutorialGroups = new Map();
let tutorialActive = false;
let tutorialLayoutScheduled = false;
let tutorialSimulationTimers = [];
let tutorialSearchTerm = '';
let tutorialDemoContext = null;
const questionMetadataMap = new WeakMap();
const autoSelectionMetadataMap = new WeakMap();
const hiddenClassIds = new Set();
const pinnedClassIds = new Set();
let sidebarCollapsed = false;
let configLibraryOpen = false;
let configLibraryPosition = null;
let configLibraryDragState = null;
const SIDEBAR_STORAGE_KEYS = {
    hidden: 'qa_sidebar_hidden_classes',
    pinned: 'qa_sidebar_pinned_classes',
    collapsed: 'qa_sidebar_collapsed',
};

function clampTutorialPosition(left, top, width, height) {
    const margin = 12;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
        left: Math.min(Math.max(left, margin), maxLeft),
        top: Math.min(Math.max(top, margin), maxTop),
    };
}

function clampConfigLibraryPosition(top, left, width, height) {
    const margin = 16;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
        top: Math.min(Math.max(top, margin), maxTop),
        left: Math.min(Math.max(left, margin), maxLeft),
    };
}

function getConfigLibraryDimensions() {
    if (!(configLibraryPanel instanceof HTMLElement)) {
        const fallbackWidth = Math.min(window.innerWidth - 32, 520);
        const fallbackHeight = Math.min(window.innerHeight - 32, 520);
        return { width: fallbackWidth, height: fallbackHeight };
    }
    const rect = configLibraryPanel.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : Math.min(window.innerWidth - 32, 520);
    const height = rect.height > 0 ? rect.height : Math.min(window.innerHeight - 32, 520);
    return { width, height };
}

function applyConfigLibraryPosition() {
    if (!configLibraryEl || !configLibraryPosition) {
        return;
    }
    const { width, height } = getConfigLibraryDimensions();
    const clamped = clampConfigLibraryPosition(configLibraryPosition.top, configLibraryPosition.left, width, height);
    configLibraryPosition = clamped;
    configLibraryEl.style.top = `${Math.round(clamped.top)}px`;
    configLibraryEl.style.left = `${Math.round(clamped.left)}px`;
}

function sortTemplatesForSelection(list = []) {
    return Array.from(list).sort((a, b) => {
        const nameA = (a?.name ?? a?.title ?? a?.fileName ?? a?.id ?? '').toString();
        const nameB = (b?.name ?? b?.title ?? b?.fileName ?? b?.id ?? '').toString();
        const diff = nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
        if (diff !== 0) {
            return diff;
        }
        return (a?.id ?? '').toString().localeCompare((b?.id ?? '').toString(), 'fr', { sensitivity: 'base' });
    });
}

async function loadTemplateLibrary(options = {}) {
    const response = await fetch(`${API_BASE_URL}?action=listTemplates`, { cache: options.cache ?? 'no-cache' });
    if (!response.ok) {
        throw new Error('Réponse invalide');
    }
    const payload = await response.json();
    const templates = Array.isArray(payload.data?.templates)
        ? payload.data.templates.filter(item => item && typeof item === 'object' && item.id)
        : [];
    templateLibrary = templates.map(template => {
        const normalizedName = template.name ?? template.title ?? template.fileName ?? template.id;
        const normalizedTitle = template.title ?? template.name ?? normalizedName ?? template.id;
        const normalizedFileName = template.fileName ?? template.name ?? '';
        return {
            ...template,
            id: template.id,
            name: normalizedName,
            title: normalizedTitle,
            fileName: normalizedFileName,
            updatedAt: template.updatedAt ?? template.createdAt ?? '',
            sourcePath: template.sourcePath ?? template.file?.path ?? '',
        };
    });
    templateLibraryLoaded = true;
    populateDocumentSelect();
    return templateLibrary;
}

function ensureTemplateLibrary(force = false) {
    if (force) {
        templateLibraryLoaded = false;
        templateLibraryPromise = null;
    }
    if (templateLibraryLoaded && !force) {
        return Promise.resolve(templateLibrary);
    }
    if (!templateLibraryPromise) {
        templateLibraryPromise = loadTemplateLibrary({ cache: force ? 'no-cache' : 'default' })
            .catch(error => {
                templateLibraryLoaded = false;
                templateLibraryPromise = null;
                throw error;
            })
            .finally(() => {
                templateLibraryPromise = null;
            });
    }
    return templateLibraryPromise;
}

function updateDocumentSelectionState(knownCount = null) {
    if (!documentSelect && !documentOpenBtn) {
        return;
    }
    let hasDocuments = false;
    if (typeof knownCount === 'number') {
        hasDocuments = knownCount > 0;
    } else if (documentSelect) {
        hasDocuments = Array.from(documentSelect.options).some(option => option.value);
    }
    if (documentSelect) {
        documentSelect.disabled = !hasDocuments;
        if (!hasDocuments) {
            documentSelect.value = '';
        }
    }
    if (documentOpenBtn) {
        const value = documentSelect?.value ?? '';
        documentOpenBtn.disabled = !hasDocuments || !value;
    }
}

function populateDocumentSelect() {
    if (!documentSelect) {
        return;
    }
    const previous = documentSelect.value;
    documentSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Sélectionnez un modèle';
    placeholder.disabled = true;
    placeholder.selected = !activeDocumentId;
    documentSelect.appendChild(placeholder);
    const sorted = sortTemplatesForSelection(templateLibrary);
    sorted.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name ?? template.id;
        documentSelect.appendChild(option);
    });
    if (documentEmptyMessage) {
        documentEmptyMessage.hidden = sorted.length > 0;
    }
    if (activeDocumentId) {
        documentSelect.value = activeDocumentId;
    } else if (sorted.some(item => item.id === previous)) {
        documentSelect.value = previous;
    } else {
        documentSelect.selectedIndex = 0;
    }
    updateDocumentSelectionState(sorted.length);
}

function updateDocumentSummary() {
    if (!documentSummaryEl) {
        return;
    }
    if (!activeDocumentId) {
        documentSummaryEl.hidden = true;
        documentSummaryEl.setAttribute('aria-hidden', 'true');
        if (documentNameEl) {
            documentNameEl.textContent = '';
        }
        if (documentChangeBtn) {
            documentChangeBtn.disabled = false;
        }
        updateDocumentControls();
        return;
    }
    const label = activeDocument?.name ?? activeDocument?.title ?? activeDocumentId;
    documentSummaryEl.hidden = false;
    documentSummaryEl.setAttribute('aria-hidden', 'false');
    if (documentNameEl) {
        documentNameEl.textContent = label;
    }
    if (documentChangeBtn) {
        documentChangeBtn.disabled = false;
    }
    updateDocumentControls();
}

function updateDocumentControls() {
    const hasDocument = Boolean(activeDocumentId);
    if (newClassBtn) {
        newClassBtn.disabled = !hasDocument;
    }
    if (classSearchInput) {
        classSearchInput.disabled = !hasDocument;
        if (!hasDocument) {
            classSearchInput.value = '';
        }
    }
    if (formEl && !hasDocument) {
        hideForm();
    }
}

function refreshDocumentContext() {
    if (!formDocumentContextEl) {
        return;
    }
    if (isPreviewMode) {
        const label = previewSourceDocumentName || previewSourceDocumentId || 'Document inconnu';
        formDocumentContextEl.textContent = `Aperçu – ${label}`;
        formDocumentContextEl.classList.add('is-preview');
        return;
    }
    if (!activeDocumentId) {
        formDocumentContextEl.textContent = 'Sélectionnez un document pour commencer.';
        formDocumentContextEl.classList.remove('is-preview');
        return;
    }
    const label = activeDocument?.name ?? activeDocument?.title ?? activeDocumentId;
    formDocumentContextEl.textContent = `Document actif : ${label}`;
    formDocumentContextEl.classList.remove('is-preview');
}

function focusDocumentSelector(options = {}) {
    if (!documentSelect) {
        return;
    }
    const { focus = true, scroll = true } = options;
    const section = documentSelect.closest('.qa-sidebar__document');
    if (scroll) {
        section?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (section) {
        section.classList.add('is-highlighted');
        window.setTimeout(() => {
            section.classList.remove('is-highlighted');
        }, 1600);
    }
    if (focus) {
        requestAnimationFrame(() => {
            documentSelect.focus({ preventScroll: !scroll });
        });
    }
}

function getVisibleClasses() {
    if (!activeDocumentId) {
        return [];
    }
    return classes.filter(item => (item?.documentId ?? '') === activeDocumentId);
}

function updateDocumentHistory() {
    const params = new URLSearchParams(window.location.search);
    if (activeDocumentId) {
        params.set('document', activeDocumentId);
    } else {
        params.delete('document');
    }
    if (!activeClassId) {
        params.delete('class');
    }
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, document.title, next);
}

function setActiveDocument(template, options = {}) {
    const nextId = template?.id ?? '';
    if (!nextId) {
        if (!options.silent) {
            window.alert('Sélectionnez un document valide.');
        }
        return false;
    }
    if (isDirty && options.confirm !== false && !suppressDirtyWarning) {
        const proceed = window.confirm('Vous avez des modifications non sauvegardées. Changer de document annulera ces modifications. Continuer ?');
        if (!proceed) {
            if (documentSelect) {
                documentSelect.value = activeDocumentId ?? '';
            }
            return false;
        }
    }
    activeDocumentId = nextId;
    activeDocument = template ?? null;
    filteredClasses = [];
    activeClassId = null;
    hideForm();
    updateDocumentSummary();
    refreshDocumentContext();
    if (classSearchInput?.value?.trim()) {
        applySearch();
    } else {
        renderClassList();
    }
    updateDocumentHistory();
    if (documentSelect) {
        documentSelect.value = activeDocumentId;
    }
    updateDocumentSelectionState();
    return true;
}

function setActiveDocumentById(documentId, options = {}) {
    if (!documentId) {
        return false;
    }
    const template = templateLibrary.find(item => item.id === documentId);
    if (!template) {
        window.alert('Document introuvable. Actualisez la liste et réessayez.');
        return false;
    }
    return setActiveDocument(template, options);
}

function applyInitialDocumentSelection() {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('document');
    if (target) {
        const template = templateLibrary.find(item => item.id === target);
        if (template) {
            setActiveDocument(template, { confirm: false, silent: true });
            return;
        }
    }
    updateDocumentSummary();
    refreshDocumentContext();
    updateDocumentSelectionState();
    focusDocumentSelector({ focus: false, scroll: false });
}

function ensureConfigLibraryPosition() {
    if (!configLibraryEl) {
        return;
    }
    const { width, height } = getConfigLibraryDimensions();
    if (!configLibraryPosition) {
        const defaultTop = Math.max(24, window.innerHeight * 0.15);
        const defaultLeft = Math.max(24, (window.innerWidth - width) / 2);
        configLibraryPosition = clampConfigLibraryPosition(defaultTop, defaultLeft, width, height);
    }
    applyConfigLibraryPosition();
}

function releaseConfigLibraryDrag() {
    if (!configLibraryDragState) {
        return;
    }
    window.removeEventListener('pointermove', handleConfigLibraryDragMove);
    window.removeEventListener('pointerup', stopConfigLibraryDrag);
    window.removeEventListener('pointercancel', stopConfigLibraryDrag);
    document.body.style.userSelect = configLibraryDragState.originalUserSelect ?? '';
    configLibraryDragState = null;
}

function handleConfigLibraryDragMove(event) {
    if (!configLibraryDragState || event.pointerId !== configLibraryDragState.pointerId) {
        return;
    }
    const nextTop = event.clientY - configLibraryDragState.offsetY;
    const nextLeft = event.clientX - configLibraryDragState.offsetX;
    const clamped = clampConfigLibraryPosition(nextTop, nextLeft, configLibraryDragState.width, configLibraryDragState.height);
    configLibraryPosition = clamped;
    applyConfigLibraryPosition();
}

function stopConfigLibraryDrag(event) {
    if (!configLibraryDragState || event.pointerId !== configLibraryDragState.pointerId) {
        return;
    }
    releaseConfigLibraryDrag();
}

function startConfigLibraryDrag(event) {
    if (!configLibraryEl || !configLibraryPanel) {
        return;
    }
    if (typeof event.button === 'number' && event.button !== 0) {
        return;
    }
    const target = event.target;
    if (target instanceof Element && target.closest('button')) {
        return;
    }
    const rect = configLibraryEl.getBoundingClientRect();
    const { width, height } = getConfigLibraryDimensions();
    configLibraryDragState = {
        pointerId: event.pointerId ?? 0,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width,
        height,
        originalUserSelect: document.body.style.userSelect ?? '',
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleConfigLibraryDragMove);
    window.addEventListener('pointerup', stopConfigLibraryDrag);
    window.addEventListener('pointercancel', stopConfigLibraryDrag);
    event.preventDefault();
}

function configurePdfWorker() {
    if (typeof window === 'undefined') {
        return;
    }
    const pdfjs = window.pdfjsLib ?? null;
    if (!pdfjs) {
        return;
    }
    const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }
}

configurePdfWorker();

function safeLocalStorage() {
    try {
        return window.localStorage ?? null;
    } catch (error) {
        return null;
    }
}

function loadSidebarPreferences() {
    const storage = safeLocalStorage();
    if (!storage) {
        applySidebarCollapsedState();
        return;
    }
    try {
        const hiddenRaw = storage.getItem(SIDEBAR_STORAGE_KEYS.hidden);
        if (hiddenRaw) {
            const parsed = JSON.parse(hiddenRaw);
            if (Array.isArray(parsed)) {
                hiddenClassIds.clear();
                parsed.filter(item => typeof item === 'string').forEach(id => hiddenClassIds.add(id));
            }
        }
    } catch (error) {
        hiddenClassIds.clear();
    }
    try {
        const pinnedRaw = storage.getItem(SIDEBAR_STORAGE_KEYS.pinned);
        if (pinnedRaw) {
            const parsed = JSON.parse(pinnedRaw);
            if (Array.isArray(parsed)) {
                pinnedClassIds.clear();
                parsed.filter(item => typeof item === 'string').forEach(id => pinnedClassIds.add(id));
            }
        }
    } catch (error) {
        pinnedClassIds.clear();
    }
    try {
        const collapsedRaw = storage.getItem(SIDEBAR_STORAGE_KEYS.collapsed);
        if (collapsedRaw === 'true') {
            sidebarCollapsed = true;
        } else if (collapsedRaw === 'false') {
            sidebarCollapsed = false;
        }
    } catch (error) {
        sidebarCollapsed = false;
    }
    applySidebarCollapsedState();
}

function saveSidebarPreferences() {
    const storage = safeLocalStorage();
    if (!storage) {
        return;
    }
    try {
        storage.setItem(SIDEBAR_STORAGE_KEYS.hidden, JSON.stringify(Array.from(hiddenClassIds)));
        storage.setItem(SIDEBAR_STORAGE_KEYS.pinned, JSON.stringify(Array.from(pinnedClassIds)));
        storage.setItem(SIDEBAR_STORAGE_KEYS.collapsed, sidebarCollapsed ? 'true' : 'false');
    } catch (error) {
        console.warn('Impossible de sauvegarder les préférences du panneau Questions/Actions.', error);
    }
}

function applySidebarCollapsedState() {
    if (sidebarEl) {
        if (sidebarCollapsed) {
            sidebarEl.setAttribute('data-collapsed', 'true');
        } else {
            sidebarEl.removeAttribute('data-collapsed');
        }
    }
    if (sidebarRevealBtn) {
        if (sidebarCollapsed) {
            sidebarRevealBtn.hidden = false;
        } else {
            sidebarRevealBtn.hidden = true;
        }
    }
}

function setSidebarCollapsed(collapsed) {
    sidebarCollapsed = collapsed;
    applySidebarCollapsedState();
    saveSidebarPreferences();
}

function ensureSidebarVisible() {
    if (sidebarCollapsed) {
        setSidebarCollapsed(false);
    }
}

function isClassHidden(id) {
    return hiddenClassIds.has(id);
}

function isClassPinned(id) {
    return pinnedClassIds.has(id);
}

function hideClass(id) {
    if (!id) {
        return;
    }
    hiddenClassIds.add(id);
    pinnedClassIds.delete(id);
    saveSidebarPreferences();
    renderClassList();
}

function showClass(id) {
    if (!id) {
        return;
    }
    if (hiddenClassIds.delete(id)) {
        saveSidebarPreferences();
        renderClassList();
    }
}

function togglePinnedClass(id) {
    if (!id) {
        return;
    }
    if (pinnedClassIds.has(id)) {
        pinnedClassIds.delete(id);
    } else {
        pinnedClassIds.add(id);
        hiddenClassIds.delete(id);
    }
    saveSidebarPreferences();
    renderClassList();
}

function slugify(value) {
    if (typeof value !== 'string') {
        return '';
    }
    let normalized = value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    normalized = normalized.replace(/[^A-Za-z0-9]+/g, '_');
    normalized = normalized.replace(/^_+|_+$/g, '');
    normalized = normalized.replace(/_{2,}/g, '_');
    return normalized.toLowerCase();
}

function cloneMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return {};
    }
    try {
        return JSON.parse(JSON.stringify(metadata));
    } catch (error) {
        return { ...metadata };
    }
}

function setupCoordinateList(container, values = [], contextResolver = () => '') {
    if (!(container instanceof HTMLElement)) {
        return;
    }
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'qa-coordinate-list-items';
    container.appendChild(list);
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'qa-btn qa-btn--ghost';
    addBtn.dataset.action = 'add-coordinate';
    addBtn.textContent = 'Ajouter une coordonnée';
    container.appendChild(addBtn);

    const addCoordinate = (value = '') => {
        if (!coordinateItemTemplate) {
            return;
        }
        const clone = coordinateItemTemplate.content.firstElementChild?.cloneNode(true);
        if (!(clone instanceof HTMLElement)) {
            return;
        }
        const input = clone.querySelector('[data-role="coordinate-value"]');
        const pickBtn = clone.querySelector('[data-action="pick-coordinate"]');
        const removeBtn = clone.querySelector('[data-action="remove-coordinate"]');
        if (input instanceof HTMLInputElement) {
            input.value = value ?? '';
            input.addEventListener('input', markDirtyAndRefreshOverlay);
        }
        attachCoordinatePicker(pickBtn, input, () => {
            const resolved = contextResolver();
            return resolved ? `Coordonnée – ${resolved}` : 'Coordonnée';
        });
        removeBtn?.addEventListener('click', () => {
            clone.remove();
            markDirtyAndRefreshOverlay();
        });
        list.appendChild(clone);
    };

    const normalized = Array.isArray(values) && values.length ? values : [''];
    normalized.forEach(item => addCoordinate(item));

    addBtn.addEventListener('click', () => {
        addCoordinate('');
        markDirtyAndRefreshOverlay();
    });

}

function readCoordinateList(container) {
    if (!(container instanceof HTMLElement)) {
        return [];
    }
    const values = [];
    container.querySelectorAll('[data-coordinate-item]').forEach(item => {
        const input = item.querySelector('[data-role="coordinate-value"]');
        const value = input?.value?.trim();
        if (value) {
            values.push(value);
        }
    });
    return values;
}

function setTabAvailability(visible) {
    gatedTabButtons.forEach(element => {
        if (!(element instanceof HTMLElement)) {
            return;
        }
        if (visible) {
            element.hidden = false;
            element.setAttribute('aria-hidden', 'false');
        } else {
            element.hidden = true;
            element.setAttribute('aria-hidden', 'true');
        }
    });
}

function ensureTooltipElement() {
    if (tooltipEl) {
        return tooltipEl;
    }
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'qa-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.hidden = false;
    document.body.appendChild(tooltipEl);
    return tooltipEl;
}

function sanitizeHelpHtml(text) {
    const raw = String(text ?? '').trim();
    if (!raw) {
        return '';
    }
    const template = document.createElement('template');
    template.innerHTML = raw;
    const nodes = Array.from(template.content.querySelectorAll('*'));
    nodes.forEach(node => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (!ALLOWED_HELP_TAGS.has(node.tagName)) {
            const fallback = document.createTextNode(node.textContent ?? '');
            node.replaceWith(fallback);
            return;
        }
        if (node.tagName === 'A') {
            const href = node.getAttribute('href') ?? '';
            const safeHref = href.startsWith('/') || /^https?:\/\//i.test(href);
            if (!safeHref) {
                node.replaceWith(document.createTextNode(node.textContent ?? ''));
                return;
            }
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
        }
        Array.from(node.attributes).forEach(attr => {
            const name = attr.name.toLowerCase();
            if (node.tagName === 'A' && (name === 'href' || name === 'target' || name === 'rel')) {
                if (name === 'href') {
                    const href = node.getAttribute('href') ?? '';
                    if (!(href.startsWith('/') || /^https?:\/\//i.test(href))) {
                        node.removeAttribute('href');
                    }
                }
                return;
            }
            node.removeAttribute(attr.name);
        });
    });
    return template.innerHTML;
}

function positionTooltip(target, event) {
    if (!tooltipEl || !target) {
        return;
    }
    const margin = 12;
    const viewportWidth = document.documentElement?.clientWidth ?? window.innerWidth ?? 0;
    const viewportHeight = document.documentElement?.clientHeight ?? window.innerHeight ?? 0;
    let targetRect = null;
    let left;
    let top;
    if (event instanceof MouseEvent) {
        left = event.clientX;
        top = event.clientY + margin;
    } else {
        targetRect = target.getBoundingClientRect();
        left = targetRect.left + targetRect.width / 2;
        top = targetRect.bottom + margin;
    }
    let anchorLeft = left;
    let anchorTop = top;
    tooltipEl.classList.remove('qa-tooltip--above');

    const applyPosition = () => {
        tooltipEl.style.left = `${anchorLeft}px`;
        tooltipEl.style.top = `${anchorTop}px`;
    };

    const clampHorizontal = () => {
        const rect = tooltipEl.getBoundingClientRect();
        const overflowLeft = margin - rect.left;
        const overflowRight = rect.right - (viewportWidth - margin);
        if (overflowLeft > 0) {
            anchorLeft += overflowLeft;
        }
        if (overflowRight > 0) {
            anchorLeft -= overflowRight;
        }
        tooltipEl.style.left = `${anchorLeft}px`;
    };

    applyPosition();
    clampHorizontal();

    let rect = tooltipEl.getBoundingClientRect();
    if (viewportHeight > 0 && rect.bottom > viewportHeight - margin) {
        tooltipEl.classList.add('qa-tooltip--above');
        if (event instanceof MouseEvent) {
            anchorTop = event.clientY - margin;
        } else {
            targetRect = targetRect ?? target.getBoundingClientRect();
            anchorTop = targetRect.top - margin;
        }
        applyPosition();
        clampHorizontal();
        rect = tooltipEl.getBoundingClientRect();
        if (rect.top < margin) {
            tooltipEl.classList.remove('qa-tooltip--above');
            targetRect = targetRect ?? target.getBoundingClientRect();
            anchorTop = event instanceof MouseEvent ? event.clientY + margin : targetRect.bottom + margin;
            applyPosition();
            clampHorizontal();
        }
    }
}

function showTooltip(target, text, event) {
    if (!(target instanceof HTMLElement) || !text) {
        return;
    }
    const tooltip = ensureTooltipElement();
    const sanitized = sanitizeHelpHtml(text);
    tooltip.innerHTML = sanitized || '';
    if (tooltip.innerText) {
        tooltip.setAttribute('aria-label', tooltip.innerText);
    } else {
        tooltip.removeAttribute('aria-label');
    }
    tooltip.classList.add('is-visible');
    tooltipActiveTarget = target;
    positionTooltip(target, event);
}

function hideTooltip(target) {
    if (!tooltipEl) {
        return;
    }
    if (target && tooltipActiveTarget && target !== tooltipActiveTarget) {
        return;
    }
    tooltipEl.classList.remove('is-visible');
    tooltipActiveTarget = null;
}

function registerHoverHelp(element) {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    if (hoverHelpRegistry.has(element)) {
        return;
    }
    const text = element.dataset.help?.trim();
    if (!text) {
        return;
    }
    const handleEnter = event => {
        showTooltip(element, element.dataset.help?.trim() ?? text, event instanceof MouseEvent ? event : undefined);
    };
    const handleMove = event => {
        if (tooltipActiveTarget === element) {
            positionTooltip(element, event instanceof MouseEvent ? event : undefined);
        }
    };
    const handleLeave = () => {
        hideTooltip(element);
    };
    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('focus', handleEnter);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);
    element.addEventListener('blur', handleLeave);
    hoverHelpRegistry.add(element);
}

function registerHoverHelpsWithin(root) {
    if (!root) {
        return;
    }
    if (root instanceof HTMLElement) {
        if (root.matches('[data-help]')) {
            registerHoverHelp(root);
        }
        root.querySelectorAll?.('[data-help]').forEach(registerHoverHelp);
    } else if (root instanceof Document || root instanceof DocumentFragment) {
        root.querySelectorAll?.('[data-help]').forEach(registerHoverHelp);
    }
}

function bindHoverHelps() {
    registerHoverHelpsWithin(document);
    document.addEventListener('pointerdown', () => hideTooltip());
    window.addEventListener('scroll', () => hideTooltip(), true);
}

function clampPage(value) {
    if (!coordinatePickerState.pdfDoc) {
        return 1;
    }
    const min = 1;
    const max = coordinatePickerState.pdfDoc.numPages;
    if (Number.isNaN(value)) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}

function clampScale(value) {
    const min = 0.5;
    const max = 2.5;
    if (Number.isNaN(value)) {
        return 1.2;
    }
    return Math.min(Math.max(value, min), max);
}

async function ensureVariableDefinitions(force = false) {
    if (variableBrowserLoaded && !force) {
        return variableDefinitionsData;
    }
    try {
        const response = await fetch(`${API_BASE_URL}?action=listVariables`, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Réponse invalide du serveur');
        }
        const payload = await response.json();
        const definitions = payload.data?.definitions ?? payload.definitions ?? {};
        if (Array.isArray(definitions?.groups)) {
            variableDefinitionsData = { groups: definitions.groups };
        } else {
            variableDefinitionsData = { groups: [] };
        }
        variableBrowserLoaded = true;
    } catch (error) {
        variableDefinitionsData = { groups: [] };
        variableBrowserLoaded = false;
        throw error;
    }
    return variableDefinitionsData;
}

function renderVariableBrowserResults() {
    if (!variableBrowserResults) {
        return;
    }
    variableBrowserResults.innerHTML = '';
    const groups = Array.isArray(variableDefinitionsData?.groups) ? variableDefinitionsData.groups : [];
    const term = variableBrowserSearchTerm.trim().toLowerCase();
    let count = 0;
    groups.forEach(group => {
        const fields = Array.isArray(group.fields) ? group.fields : [];
        const groupLabel = String(group.label ?? group.id ?? 'Variables');
        const normalizedGroup = groupLabel.toLowerCase();
        const filtered = fields.filter(field => {
            const label = String(field.label ?? '').toLowerCase();
            const key = String(field.key ?? '').toLowerCase();
            if (!term) {
                return true;
            }
            return label.includes(term) || key.includes(term) || normalizedGroup.includes(term);
        });
        if (!filtered.length) {
            return;
        }
        count += filtered.length;
        const section = document.createElement('section');
        section.className = 'qa-variable-browser__group';
        const header = document.createElement('div');
        header.className = 'qa-variable-browser__group-header';
        const title = document.createElement('h4');
        title.textContent = groupLabel;
        header.appendChild(title);
        const amount = document.createElement('span');
        amount.textContent = `${filtered.length} élément${filtered.length > 1 ? 's' : ''}`;
        header.appendChild(amount);
        section.appendChild(header);
        const list = document.createElement('ul');
        list.className = 'qa-variable-browser__list';
        filtered.forEach(field => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'qa-variable-browser__item';
            const label = document.createElement('span');
            label.className = 'qa-variable-browser__item-label';
            const fieldLabel = String(field.label ?? field.key ?? 'Variable');
            label.textContent = fieldLabel;
            button.appendChild(label);
            const description = document.createElement('span');
            description.className = 'qa-variable-browser__item-description';
            const key = String(field.key ?? '').trim();
            if (key) {
                description.textContent = `Utilise la variable « ${fieldLabel} » provenant du groupe « ${groupLabel} » (clé ${key}).`;
            } else {
                description.textContent = `Utilise la variable « ${fieldLabel} » provenant du groupe « ${groupLabel} ».`;
            }
            button.appendChild(description);
            if (key) {
                const code = document.createElement('code');
                code.className = 'qa-variable-browser__item-code';
                code.textContent = key;
                button.appendChild(code);
            }
            button.addEventListener('click', () => {
                const target = variableBrowserTargetInput;
                if (target instanceof HTMLInputElement) {
                    target.value = key;
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                    target.focus({ preventScroll: true });
                }
                closeVariableBrowser();
            });
            item.appendChild(button);
            list.appendChild(item);
        });
        section.appendChild(list);
        variableBrowserResults.appendChild(section);
    });
    if (variableBrowserEmpty) {
        variableBrowserEmpty.hidden = count > 0;
    }
    if (!count) {
        variableBrowserResults.innerHTML = '';
    }
}

async function openVariableBrowser(targetInput) {
    if (!variableBrowserEl) {
        return;
    }
    variableBrowserTargetInput = targetInput ?? null;
    try {
        await ensureVariableDefinitions();
    } catch (error) {
        console.error('Unable to load variable definitions', error);
        window.alert('Impossible de charger la liste des variables disponibles.');
        return;
    }
    variableBrowserSearchTerm = '';
    if (variableBrowserSearch instanceof HTMLInputElement) {
        variableBrowserSearch.value = '';
    }
    renderVariableBrowserResults();
    variableBrowserEl.hidden = false;
    variableBrowserEl.setAttribute('aria-hidden', 'false');
    if (!variableBrowserEl.hasAttribute('tabindex')) {
        variableBrowserEl.setAttribute('tabindex', '-1');
    }
    variableBrowserEl.focus({ preventScroll: true });
}

function closeVariableBrowser() {
    if (!variableBrowserEl) {
        return;
    }
    variableBrowserEl.hidden = true;
    variableBrowserEl.setAttribute('aria-hidden', 'true');
    const target = variableBrowserTargetInput;
    variableBrowserTargetInput = null;
    if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
    }
}

function handleVariableBrowserSearch(event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
        return;
    }
    variableBrowserSearchTerm = event.currentTarget.value ?? '';
    renderVariableBrowserResults();
}

function updateCoordinatePickerInfo() {
    if (!coordinatePickerInfo) {
        return;
    }
    const infoParts = [];
    const hasDocument = Boolean(coordinatePickerState.pdfDoc);
    if (coordinatePickerEmpty) {
        coordinatePickerEmpty.hidden = hasDocument;
        coordinatePickerEmpty.setAttribute('aria-hidden', hasDocument ? 'true' : 'false');
    }
    if (coordinatePickerState.templateName) {
        const markerCount = Array.isArray(coordinatePickerState.overlayMarkers) ? coordinatePickerState.overlayMarkers.length : 0;
        const suffix = markerCount > 0 ? ` – ${markerCount} coordonnée${markerCount > 1 ? 's' : ''} détectée${markerCount > 1 ? 's' : ''}` : '';
        infoParts.push(`Modèle : ${coordinatePickerState.templateName}${suffix}.`);
    }
    if (!hasDocument) {
        infoParts.push('Sélectionnez un modèle ou importez un PDF pour choisir une coordonnée.');
        coordinatePickerApplyBtn?.setAttribute('disabled', 'disabled');
        coordinatePickerInfo.textContent = infoParts.join(' ');
        return;
    }
    if (!coordinatePickerState.lastPick) {
        infoParts.push('Cliquez sur la page pour enregistrer une coordonnée.');
        coordinatePickerApplyBtn?.setAttribute('disabled', 'disabled');
        coordinatePickerInfo.textContent = infoParts.join(' ');
        return;
    }
    const x = Math.round(coordinatePickerState.lastPick.pdfX);
    const y = Math.round(coordinatePickerState.lastPick.pdfY);
    infoParts.push(`Coordonnée : page ${coordinatePickerState.lastPick.page} – X ${x} pt / Y ${y} pt.`);
    coordinatePickerInfo.textContent = infoParts.join(' ');
    coordinatePickerApplyBtn?.removeAttribute('disabled');
}

function updateCoordinatePickerMarker() {
    if (!coordinatePickerMarker) {
        return;
    }
    if (!coordinatePickerState.lastPick || coordinatePickerState.lastPick.page !== coordinatePickerState.currentPage || !coordinatePickerState.viewport) {
        coordinatePickerMarker.hidden = true;
        renderCoordinateOverlay();
        return;
    }
    const viewport = coordinatePickerState.viewport;
    const cssX = coordinatePickerState.lastPick.pdfX * coordinatePickerState.scale;
    const cssY = coordinatePickerState.lastPick.pdfY * coordinatePickerState.scale;
    coordinatePickerMarker.style.left = `${cssX}px`;
    coordinatePickerMarker.style.top = `${cssY}px`;
    coordinatePickerMarker.hidden = false;
    renderCoordinateOverlay();
}

async function renderCoordinatePickerPage({ preserveMarker = true } = {}) {
    if (!coordinatePickerCanvas || !coordinatePickerState.pdfDoc) {
        return;
    }
    coordinatePickerState.scale = clampScale(coordinatePickerState.scale);
    const ctx = coordinatePickerCanvas.getContext('2d');
    if (!ctx) {
        return;
    }
    const pageIndex = clampPage(coordinatePickerState.currentPage);
    coordinatePickerState.currentPage = pageIndex;
    try {
        const page = await coordinatePickerState.pdfDoc.getPage(pageIndex);
        const viewport = page.getViewport({ scale: coordinatePickerState.scale });
        coordinatePickerState.viewport = viewport;
        const pixelRatio = window.devicePixelRatio || 1;
        coordinatePickerCanvas.width = viewport.width * pixelRatio;
        coordinatePickerCanvas.height = viewport.height * pixelRatio;
        coordinatePickerCanvas.style.width = `${viewport.width}px`;
        coordinatePickerCanvas.style.height = `${viewport.height}px`;
        const renderContext = {
            canvasContext: ctx,
            viewport,
        };
        if (pixelRatio !== 1) {
            renderContext.transform = [pixelRatio, 0, 0, pixelRatio, 0, 0];
        }
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, coordinatePickerCanvas.width, coordinatePickerCanvas.height);
        ctx.restore();
        await page.render(renderContext).promise;
        if (coordinatePickerEmpty) {
            coordinatePickerEmpty.hidden = true;
        }
        if (coordinatePickerPageInput) {
            coordinatePickerPageInput.value = String(pageIndex);
        }
        if (coordinatePickerZoomInput) {
            coordinatePickerZoomInput.value = String(coordinatePickerState.scale);
        }
        if (coordinatePickerPageTotal) {
            coordinatePickerPageTotal.textContent = `/ ${coordinatePickerState.pdfDoc.numPages}`;
        }
        if (!preserveMarker) {
            coordinatePickerState.lastPick = null;
        }
        updateCoordinatePickerMarker();
        updateCoordinatePickerInfo();
        renderCoordinateOverlay();
    } catch (error) {
        console.error('Unable to render PDF page', error);
        if (coordinatePickerInfo) {
            coordinatePickerInfo.textContent = 'Impossible d\'afficher la page sélectionnée.';
        }
    }
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

function renderCoordinateOverlay() {
    if (!coordinatePickerOverlay) {
        return;
    }
    coordinatePickerOverlay.innerHTML = '';
    const markers = Array.isArray(coordinatePickerState.overlayMarkers) ? coordinatePickerState.overlayMarkers : [];
    if (!coordinatePickerState.viewport || !markers.length) {
        coordinatePickerOverlay.setAttribute('aria-hidden', 'true');
        return;
    }
    const currentPage = coordinatePickerState.currentPage;
    const pageMarkers = markers.filter(marker => marker.page === currentPage);
    if (!pageMarkers.length) {
        coordinatePickerOverlay.setAttribute('aria-hidden', 'true');
        return;
    }
    coordinatePickerOverlay.removeAttribute('aria-hidden');
    pageMarkers.forEach(marker => {
        const node = document.createElement('div');
        node.className = 'qa-picker-overlay__marker';
        if (marker.category === 'current') {
            node.classList.add('qa-picker-overlay__marker--current');
        } else if (marker.category === 'target') {
            node.classList.add('qa-picker-overlay__marker--target');
        } else {
            node.classList.add('qa-picker-overlay__marker--assigned');
        }
        const cssX = marker.x * coordinatePickerState.scale;
        const cssY = marker.y * coordinatePickerState.scale;
        node.style.left = `${cssX}px`;
        node.style.top = `${cssY}px`;
        if (marker.label) {
            node.title = marker.label;
        }
        coordinatePickerOverlay.appendChild(node);
    });
}

function collectCurrentClassStructure() {
    if (!formEl || formEl.hidden) {
        return null;
    }
    const questions = [];
    if (questionListEl) {
        questionListEl.querySelectorAll('[data-question]').forEach(node => {
            try {
                const question = readQuestionElement(node);
                if (question) {
                    questions.push(question);
                }
            } catch (error) {
                console.warn('Impossible de lire la question pour l’aperçu des coordonnées.', error);
            }
        });
    }
    const autoSelections = [];
    if (autoListEl) {
        autoListEl.querySelectorAll('[data-auto-selection]').forEach(node => {
            try {
                const selection = readAutoSelectionElement(node);
                if (selection) {
                    autoSelections.push(selection);
                }
            } catch (error) {
                console.warn('Impossible de lire la sélection automatique pour l’aperçu des coordonnées.', error);
            }
        });
    }
    return {
        id: classIdInput?.value?.trim() ?? '',
        title: classTitleInput?.value?.trim() ?? '',
        questions,
        autoSelections,
    };
}

function extractMarkersFromClassData(classData, options = {}) {
    if (!classData || typeof classData !== 'object') {
        return [];
    }
    const markers = [];
    const dedupe = new Set();
    const classId = typeof options.classId === 'string' ? options.classId : (classData.id ?? '');
    const classTitle = typeof options.classTitle === 'string' && options.classTitle ? options.classTitle : (classData.title ?? 'Configuration');
    const category = options.category ?? 'assigned';

    function addMarker(value, label, meta = {}) {
        const parsed = parseCoordinateValue(value);
        if (!parsed) {
            return;
        }
        const key = `${classId}|${meta.type ?? ''}|${meta.id ?? ''}|${parsed.page}|${parsed.x}|${parsed.y}`;
        if (dedupe.has(key)) {
            return;
        }
        dedupe.add(key);
        markers.push({
            page: parsed.page,
            x: parsed.x,
            y: parsed.y,
            label,
            classId,
            classTitle,
            type: meta.type ?? '',
            itemId: meta.id ?? '',
            category,
        });
    }

    const questions = Array.isArray(classData.questions) ? classData.questions : [];
    questions.forEach(question => {
        const questionLabel = question.label ?? question.id ?? 'Question';
        if (question.coordinate) {
            addMarker(question.coordinate, `Question « ${questionLabel} » – ${classTitle}`, { type: 'question', id: question.id ?? '' });
        }
        const optionsList = Array.isArray(question.options) ? question.options : [];
        optionsList.forEach(option => {
            if (!option.coordinate) {
                return;
            }
            const optionLabel = option.label ?? option.id ?? 'Option';
            addMarker(option.coordinate, `Option « ${optionLabel} » (question « ${questionLabel} »)`, { type: 'option', id: option.id ?? '' });
        });
        const metadata = question.metadata ?? {};
        const categories = Array.isArray(metadata.categories) ? metadata.categories : [];
        categories.forEach(entry => {
            const coords = Array.isArray(entry.coordinates) ? entry.coordinates : [];
            const catLabel = entry.label ?? entry.id ?? 'Catégorie';
            coords.forEach((coord, index) => {
                addMarker(coord, `Catégorie « ${catLabel} » (question « ${questionLabel} »)`, { type: 'category', id: `${entry.id ?? ''}:${index}` });
            });
        });
        const noteSection = metadata.noteSection;
        if (noteSection && noteSection.enabled && noteSection.coordinate) {
            const noteLabel = noteSection.title || `Bloc de notes – ${questionLabel}`;
            addMarker(noteSection.coordinate, noteLabel, { type: 'note', id: `${question.id ?? ''}:note` });
        }
    });

    const autoSelections = Array.isArray(classData.autoSelections) ? classData.autoSelections : [];
    autoSelections.forEach(auto => {
        const autoLabel = auto.label ?? auto.id ?? 'Sélection automatique';
        if (auto.coordinate) {
            addMarker(auto.coordinate, `Sélection auto « ${autoLabel} »`, { type: 'auto', id: auto.id ?? '' });
        }
        const metadata = auto.metadata ?? {};
        const dynamic = metadata.dynamicCoordinates ?? {};
        if (dynamic.enabled) {
            if (dynamic.mode === 'maxClients') {
                const entries = Array.isArray(dynamic.maxClients) ? dynamic.maxClients : [];
                entries.forEach(entry => {
                    const coords = Array.isArray(entry.coordinates) ? entry.coordinates : [];
                    const label = entry.label || (entry.count ? `${entry.count} client${entry.count > 1 ? 's' : ''}` : 'Variante');
                    coords.forEach((coord, index) => {
                        addMarker(coord, `Sélection auto « ${autoLabel} » – ${label}`, { type: 'autoDynamic', id: `${auto.id ?? ''}:max:${entry.count ?? ''}:${index}` });
                    });
                });
            } else {
                const cases = Array.isArray(dynamic.requestValues?.cases) ? dynamic.requestValues.cases : [];
                cases.forEach(entry => {
                    const coords = Array.isArray(entry.coordinates) ? entry.coordinates : [];
                    const label = entry.label || (entry.value ? `Valeur ${entry.value}` : 'Valeur détectée');
                    coords.forEach((coord, index) => {
                        addMarker(coord, `Sélection auto « ${autoLabel} » – ${label}`, { type: 'autoDynamic', id: `${auto.id ?? ''}:case:${entry.value ?? ''}:${index}` });
                    });
                });
                const fallbackCoords = Array.isArray(dynamic.requestValues?.fallback) ? dynamic.requestValues.fallback : [];
                fallbackCoords.forEach((coord, index) => {
                    addMarker(coord, `Sélection auto « ${autoLabel} » – Valeur par défaut`, { type: 'autoDynamicFallback', id: `${auto.id ?? ''}:fallback:${index}` });
                });
            }
        }
    });

    return markers;
}

function updateCoordinateOverlayMarkers() {
    const markers = [];
    const assignments = Array.isArray(coordinatePickerState.templateAssignments) ? coordinatePickerState.templateAssignments : [];
    const usedClassIds = new Set();

    assignments.forEach(assignment => {
        const classId = typeof assignment.id === 'string' ? assignment.id : '';
        if (!classId) {
            return;
        }
        let classData = null;
        let category = 'assigned';
        if (classId === activeClassId) {
            classData = collectCurrentClassStructure();
            category = 'current';
        } else {
            classData = classes.find(item => item.id === classId) ?? null;
        }
        if (!classData) {
            return;
        }
        const title = classData.title ?? assignment.title ?? `Classe ${classId}`;
        const extracted = extractMarkersFromClassData(classData, { classId, classTitle: title, category });
        extracted.forEach(marker => markers.push(marker));
        usedClassIds.add(classId);
    });

    const currentStructure = collectCurrentClassStructure();
    if (currentStructure) {
        const currentId = currentStructure.id ?? '';
        if (!currentId || !usedClassIds.has(currentId)) {
            const currentMarkers = extractMarkersFromClassData(currentStructure, {
                classId: currentId || 'current',
                classTitle: currentStructure.title ?? 'Configuration en cours',
                category: 'current',
            });
            currentMarkers.forEach(marker => markers.push(marker));
        }
    }

    const target = coordinatePickerState.targetInput;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const parsed = parseCoordinateValue(target.value);
        if (parsed) {
            markers.push({
                page: parsed.page,
                x: parsed.x,
                y: parsed.y,
                label: 'Coordonnée actuelle du champ',
                classId: currentStructure?.id ?? '',
                classTitle: currentStructure?.title ?? '',
                type: 'target',
                itemId: '',
                category: 'target',
            });
        }
    }

    coordinatePickerState.overlayMarkers = markers;
    renderCoordinateOverlay();
}

async function ensureCoordinateTemplateLibrary(force = false) {
    if (force) {
        coordinateTemplateLoaded = false;
        coordinateTemplatePromise = null;
    }
    if (coordinateTemplateLoaded && !force) {
        renderCoordinateTemplateOptions();
        return coordinateTemplateLibrary;
    }
    if (coordinateTemplatePromise && !force) {
        return coordinateTemplatePromise;
    }
    coordinateTemplatePromise = ensureTemplateLibrary(force)
        .then(library => {
            coordinateTemplateLibrary = library.slice();
            coordinateTemplateLoaded = true;
            renderCoordinateTemplateOptions();
            return coordinateTemplateLibrary;
        })
        .catch(error => {
            coordinateTemplateLoaded = false;
            coordinateTemplateLibrary = [];
            renderCoordinateTemplateOptions();
            throw error;
        })
        .finally(() => {
            coordinateTemplatePromise = null;
        });
    return coordinateTemplatePromise;
}

function renderCoordinateTemplateOptions(selectedId) {
    if (!(coordinatePickerTemplateSelect instanceof HTMLSelectElement)) {
        return;
    }
    const currentValue = typeof selectedId === 'string' && selectedId
        ? selectedId
        : (coordinatePickerTemplateSelect.value || coordinatePickerState.templateId || '');
    coordinatePickerTemplateSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choisissez un modèle';
    coordinatePickerTemplateSelect.appendChild(placeholder);
    const sorted = coordinateTemplateLibrary.slice().sort((a, b) => {
        const aLabel = String(a.name ?? a.id ?? '').toLowerCase();
        const bLabel = String(b.name ?? b.id ?? '').toLowerCase();
        return aLabel.localeCompare(bLabel, 'fr', { sensitivity: 'base' });
    });
    sorted.forEach(template => {
        if (!template || typeof template !== 'object' || !template.id) {
            return;
        }
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name ?? template.id;
        coordinatePickerTemplateSelect.appendChild(option);
    });
    if (currentValue && sorted.some(template => template.id === currentValue)) {
        coordinatePickerTemplateSelect.value = currentValue;
    } else {
        coordinatePickerTemplateSelect.value = '';
    }
}

function extractTemplateAssignments(template) {
    if (!template || typeof template !== 'object') {
        return [];
    }
    const rawAssignments = template.questionSettings?.classes;
    if (!Array.isArray(rawAssignments)) {
        return [];
    }
    return rawAssignments
        .map(entry => {
            if (!entry || typeof entry !== 'object') {
                return null;
            }
            const classId = typeof entry.id === 'string' ? entry.id.trim() : '';
            if (!classId) {
                return null;
            }
            return {
                id: classId,
                required: entry.required === true,
                notes: typeof entry.notes === 'string' ? entry.notes : '',
                title: typeof entry.title === 'string' ? entry.title : '',
            };
        })
        .filter(Boolean);
}

async function loadCoordinateTemplate(template) {
    if (!template || typeof template !== 'object' || !template.id) {
        return;
    }
    if (!window.pdfjsLib) {
        throw new Error('PDF.js n’est pas disponible.');
    }
    try {
        const response = await fetch(template.sourcePath, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Impossible de charger le document du modèle.');
        }
        const data = await response.arrayBuffer();
        coordinatePickerState.pdfDoc = await window.pdfjsLib.getDocument({ data }).promise;
        coordinatePickerState.templateId = template.id ?? '';
        coordinatePickerState.templateName = template.name ?? template.fileName ?? template.id ?? '';
        coordinatePickerState.fileName = template.fileName ?? template.name ?? template.id ?? '';
        coordinatePickerState.templateAssignments = extractTemplateAssignments(template);
        const pendingPick = coordinatePickerState.pendingPick
            ? {
                page: coordinatePickerState.pendingPick.page,
                x: coordinatePickerState.pendingPick.x,
                y: coordinatePickerState.pendingPick.y,
            }
            : null;
        coordinatePickerState.currentPage = clampPage(pendingPick?.page ?? coordinatePickerState.lastPick?.page ?? 1);
        coordinatePickerState.lastPick = null;
        coordinatePickerState.pendingPick = null;
        await renderCoordinatePickerPage({ preserveMarker: false });
        if (pendingPick) {
            coordinatePickerState.lastPick = {
                page: coordinatePickerState.currentPage,
                pdfX: pendingPick.x,
                pdfY: pendingPick.y,
            };
            updateCoordinatePickerMarker();
        }
        updateCoordinateOverlayMarkers();
        updateCoordinatePickerInfo();
    } catch (error) {
        coordinatePickerState.pdfDoc = null;
        coordinatePickerState.templateId = '';
        coordinatePickerState.templateName = '';
        coordinatePickerState.fileName = '';
        coordinatePickerState.viewport = null;
        coordinatePickerState.templateAssignments = [];
        coordinatePickerState.overlayMarkers = [];
        coordinatePickerState.lastPick = null;
        coordinatePickerState.pendingPick = null;
        renderCoordinateOverlay();
        updateCoordinatePickerInfo();
        throw error;
    }
}

function deriveTemplateName(fileName) {
    if (typeof fileName !== 'string' || !fileName.trim()) {
        return 'Document importé';
    }
    const withoutExtension = fileName.replace(/\.[^.]+$/, '');
    const cleaned = withoutExtension.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
        return 'Document importé';
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Lecture du fichier impossible.'));
            }
        };
        reader.readAsDataURL(file);
    });
}

async function importCoordinateTemplateFromFile(file) {
    if (!file) {
        return;
    }
    if (coordinatePickerInfo) {
        coordinatePickerInfo.textContent = 'Importation du modèle en cours…';
    }
    try {
        const dataUrl = await readFileAsDataURL(file);
        const name = deriveTemplateName(file.name ?? '');
        const response = await fetch(`${API_BASE_URL}?action=saveTemplate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, pdfData: dataUrl }),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide du serveur');
        }
        const body = await response.json();
        const saved = body.data?.template ?? body.template ?? body.data ?? null;
        if (!saved || typeof saved !== 'object' || !saved.id) {
            throw new Error('Réponse incomplète lors de l’import du modèle.');
        }
        notifyTemplateSaved(saved.id);
        await ensureCoordinateTemplateLibrary(true);
        renderCoordinateTemplateOptions(saved.id);
        if (coordinatePickerTemplateSelect instanceof HTMLSelectElement) {
            coordinatePickerTemplateSelect.value = saved.id;
        }
        await loadCoordinateTemplate(saved);
        updateCoordinateOverlayMarkers();
        updateCoordinatePickerInfo();
    } catch (error) {
        if (coordinatePickerInfo) {
            const message = error?.message ?? 'Impossible d’importer le modèle.';
            coordinatePickerInfo.textContent = message;
        }
        throw error;
    } finally {
        if (coordinatePickerFileInput instanceof HTMLInputElement) {
            coordinatePickerFileInput.value = '';
        }
    }
}

function notifyTemplateSaved(templateId) {
    if (!templateId) {
        return;
    }
    try {
        window.opener?.postMessage({ type: 'template-saved', templateId }, window.location.origin);
    } catch (error) {
        try {
            window.opener?.postMessage({ type: 'template-saved', templateId }, '*');
        } catch (nestedError) {
            // Ignoré.
        }
    }
}

async function loadPickerFile(file) {
    await importCoordinateTemplateFromFile(file);
}

function resetCoordinatePicker() {
    coordinatePickerState.lastPick = null;
    updateCoordinatePickerMarker();
    updateCoordinatePickerInfo();
    updateCoordinateOverlayMarkers();
}

function closeCoordinatePicker({ restoreFocus = true } = {}) {
    if (!coordinatePickerEl) {
        return;
    }
    coordinatePickerEl.hidden = true;
    coordinatePickerEl.setAttribute('aria-hidden', 'true');
    if (restoreFocus && coordinatePickerState.targetInput instanceof HTMLElement) {
        coordinatePickerState.targetInput.focus({ preventScroll: true });
    }
    coordinatePickerState.remoteTarget = null;
}

function formatCoordinateOutput(pick) {
    if (!pick) {
        return '';
    }
    const x = Math.round(pick.pdfX);
    const y = Math.round(pick.pdfY);
    return `page=${pick.page};x=${x};y=${y}`;
}

function applyCoordinateSelection() {
    if (!coordinatePickerState.lastPick) {
        return;
    }
    const value = formatCoordinateOutput(coordinatePickerState.lastPick);
    let applied = false;
    const target = coordinatePickerState.targetInput;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.value = value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        applied = true;
    }
    if (!applied && coordinatePickerState.remoteTarget?.source) {
        const message = { type: 'qa-auto-builder:set-coordinate', coordinate: value };
        const targetOrigin = coordinatePickerState.remoteTarget.origin ?? '*';
        try {
            coordinatePickerState.remoteTarget.source.postMessage(message, targetOrigin);
        } catch (error) {
            try {
                coordinatePickerState.remoteTarget.source.postMessage(message, '*');
            } catch (nestedError) {
                // ignore
            }
        }
        applied = true;
    }
    coordinatePickerState.remoteTarget = null;
    if (applied) {
        closeCoordinatePicker();
    }
}

function handlePickerCanvasClick(event) {
    if (!coordinatePickerCanvas || !coordinatePickerState.viewport) {
        return;
    }
    const rect = coordinatePickerCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pdfX = x / coordinatePickerState.scale;
    const pdfY = y / coordinatePickerState.scale;
    coordinatePickerState.lastPick = {
        page: coordinatePickerState.currentPage,
        pdfX,
        pdfY,
    };
    updateCoordinatePickerMarker();
    updateCoordinatePickerInfo();
}

function openCoordinatePicker(targetInput, contextLabel) {
    if (!coordinatePickerEl) {
        return;
    }
    coordinatePickerState.targetInput = targetInput ?? null;
    coordinatePickerState.targetContext = contextLabel ?? '';
    if (coordinatePickerContext) {
        coordinatePickerContext.textContent = contextLabel ? `Coordonnée pour : ${contextLabel}` : 'Sélectionnez un emplacement sur le document.';
    }
    const existing = targetInput instanceof HTMLInputElement || targetInput instanceof HTMLTextAreaElement ? parseCoordinateValue(targetInput.value) : null;
    if (existing) {
        coordinatePickerState.pendingPick = existing;
    } else {
        coordinatePickerState.pendingPick = null;
    }
    const initialSelectionId = activeDocumentId || coordinatePickerState.templateId || '';
    renderCoordinateTemplateOptions(initialSelectionId);
    updateCoordinateOverlayMarkers();
    coordinatePickerEl.hidden = false;
    coordinatePickerEl.setAttribute('aria-hidden', 'false');
    coordinatePickerEl.focus({ preventScroll: true });
    if (coordinatePickerState.pdfDoc) {
        if (coordinatePickerState.pendingPick) {
            coordinatePickerState.currentPage = clampPage(coordinatePickerState.pendingPick.page);
            renderCoordinatePickerPage({ preserveMarker: false }).then(() => {
                coordinatePickerState.lastPick = {
                    page: coordinatePickerState.currentPage,
                    pdfX: coordinatePickerState.pendingPick?.x ?? 0,
                    pdfY: coordinatePickerState.pendingPick?.y ?? 0,
                };
                coordinatePickerState.pendingPick = null;
                updateCoordinatePickerMarker();
                updateCoordinatePickerInfo();
            });
        } else {
            renderCoordinatePickerPage({ preserveMarker: true });
        }
    } else {
        if (coordinatePickerEmpty) {
            coordinatePickerEmpty.hidden = false;
        }
        updateCoordinatePickerInfo();
    }
    ensureCoordinateTemplateLibrary()
        .then(() => {
            const desiredSelectionId = activeDocumentId || coordinatePickerState.templateId || '';
            renderCoordinateTemplateOptions(desiredSelectionId);
            if (!activeDocumentId) {
                if (!coordinatePickerState.pdfDoc && coordinatePickerEmpty) {
                    coordinatePickerEmpty.hidden = false;
                }
                updateCoordinatePickerInfo();
                return;
            }
            const activeTemplate = coordinateTemplateLibrary.find(item => item.id === activeDocumentId);
            if (!activeTemplate) {
                return;
            }
            if (coordinatePickerEmpty) {
                coordinatePickerEmpty.hidden = true;
            }
            if (!coordinatePickerState.pdfDoc || coordinatePickerState.templateId !== activeTemplate.id) {
                loadCoordinateTemplate(activeTemplate).catch(error => {
                    console.error('Unable to load active document for picker', error);
                    if (coordinatePickerEmpty) {
                        coordinatePickerEmpty.hidden = false;
                    }
                });
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function attachCoordinatePicker(button, input, labelResolver) {
    if (!button || !input) {
        return;
    }
    button.addEventListener('click', () => {
        const label = typeof labelResolver === 'function' ? labelResolver() : labelResolver;
        openCoordinatePicker(input, label);
    });
}

function clearTutorialSimulation() {
    tutorialSimulationTimers.forEach(timerId => clearTimeout(timerId));
    tutorialSimulationTimers = [];
    if (tutorialSimulationEl) {
        tutorialSimulationEl.innerHTML = '';
    }
}

function buildTutorialSimulationScript(step) {
    const lines = [];
    const groupLabel = step.group ? `🎯 ${step.group}` : '🎯 Questions/Actions';
    lines.push(groupLabel);
    if (step.summary) {
        lines.push(`🖱️ ${step.summary}`);
    }
    step.examples.slice(0, 4).forEach(example => {
        lines.push(`✨ ${example}`);
    });
    if (lines.length === 1 && step.help) {
        lines.push(`📝 ${step.help}`);
    }
    return lines;
}

function runTutorialSimulation(step) {
    if (!tutorialSimulationEl) {
        return;
    }
    clearTutorialSimulation();
    const script = buildTutorialSimulationScript(step);
    script.forEach((line, index) => {
        const span = document.createElement('span');
        span.textContent = line;
        tutorialSimulationEl.appendChild(span);
        const timerId = window.setTimeout(() => {
            span.classList.add('is-visible');
        }, 180 * (index + 1));
        tutorialSimulationTimers.push(timerId);
    });
}

function populateTutorialExamples(step) {
    if (!tutorialExamplesEl) {
        return;
    }
    if (!step.examples.length) {
        tutorialExamplesEl.hidden = true;
        tutorialExamplesEl.innerHTML = '';
        return;
    }
    tutorialExamplesEl.hidden = false;
    tutorialExamplesEl.innerHTML = '';
    const title = document.createElement('h3');
    title.textContent = 'Exemples de codes à utiliser';
    tutorialExamplesEl.appendChild(title);
    const list = document.createElement('ul');
    list.className = 'qa-tutorial__example-list';
    step.examples.forEach((example, index) => {
        const item = document.createElement('li');
        item.className = 'qa-tutorial__example-item';
        const dashParts = example.split(/\s*[–—-]\s+/u, 2);
        let codeText = dashParts[0]?.trim() ?? example.trim();
        let descriptionText = dashParts[1]?.trim() ?? '';
        if (!descriptionText) {
            const colonParts = example.split(/\s*:\s+/u, 2);
            if (colonParts.length === 2) {
                codeText = colonParts[0].trim();
                descriptionText = colonParts[1].trim();
            }
        }
        const line = document.createElement('div');
        line.className = 'qa-tutorial__example-line';
        const indexLabel = document.createElement('span');
        indexLabel.className = 'qa-tutorial__example-index';
        indexLabel.textContent = `${index + 1})`;
        line.appendChild(indexLabel);
        const code = document.createElement('code');
        code.className = 'qa-tutorial__example-code';
        code.textContent = codeText;
        line.appendChild(code);
        item.appendChild(line);
        if (descriptionText) {
            const description = document.createElement('span');
            description.className = 'qa-tutorial__example-desc';
            description.textContent = descriptionText;
            item.appendChild(description);
        }
        list.appendChild(item);
    });
    tutorialExamplesEl.appendChild(list);
}

function populateTutorialQuiz(step) {
    if (!tutorialQuizEl || !tutorialQuizOptions) {
        return;
    }
    const groupSteps = tutorialGroups.get(step.group) ?? [];
    const options = groupSteps.filter(entry => entry.id !== step.id);
    if (!options.length) {
        tutorialQuizEl.hidden = true;
        tutorialQuizOptions.innerHTML = '';
        return;
    }
    tutorialQuizEl.hidden = false;
    tutorialQuizOptions.innerHTML = '';
    options.slice(0, 6).forEach(entry => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = entry.label;
        button.addEventListener('click', () => {
            goToTutorialStep(entry.id);
            closeActionPopover();
        });
        tutorialQuizOptions.appendChild(button);
    });
}

function updateTutorialNavigation() {
    if (tutorialPrevBtn) {
        tutorialPrevBtn.disabled = tutorialIndex <= 0;
    }
    if (tutorialNextBtn) {
        tutorialNextBtn.disabled = tutorialIndex >= tutorialSteps.length - 1;
    }
    if (tutorialStepLabel) {
        tutorialStepLabel.textContent = `Étape ${tutorialSteps.length ? tutorialIndex + 1 : 0} / ${tutorialSteps.length}`;
    }
}

function parseHelpText(text) {
    const value = String(text ?? '').trim();
    if (!value) {
        return { summary: '', summaryText: '', examples: [], raw: '' };
    }
    const parts = value.split(/Exemples?\s*:/i);
    const summary = parts.shift()?.trim() ?? '';
    const summaryContainer = document.createElement('div');
    summaryContainer.innerHTML = summary;
    const summaryText = summaryContainer.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const exampleText = parts.join(' ').trim();
    const examples = exampleText
        ? exampleText
            .replace(/[.;]$/u, '')
            .split(/[•\n;,]+/u)
            .map(entry => entry.trim())
            .filter(Boolean)
        : [];
    const plainExamples = examples.map(item => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = item;
        return wrapper.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }).filter(Boolean);
    return { summary, summaryText, examples: plainExamples, raw: value };
}

function deriveElementLabel(element) {
    if (!(element instanceof HTMLElement)) {
        return 'Action';
    }
    const datasetLabel = element.dataset.helpTitle?.trim();
    if (datasetLabel) {
        return datasetLabel;
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
        return ariaLabel.trim();
    }
    const title = element.getAttribute('title');
    if (title && title.trim()) {
        return title.trim();
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (element.placeholder && element.placeholder.trim()) {
            return element.placeholder.trim();
        }
        if (element.name && element.name.trim()) {
            return element.name.trim();
        }
    }
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (text) {
        return text.slice(0, 80);
    }
    return 'Action Questions/Actions';
}

function deriveElementGroup(element) {
    if (!(element instanceof HTMLElement)) {
        return 'Interface Questions/Actions';
    }
    const section = element.closest('.qa-section, [data-tab-panel]');
    if (section instanceof HTMLElement) {
        const heading = section.querySelector('h2, h3, h4');
        if (heading && heading.textContent) {
            return heading.textContent.trim();
        }
    }
    const sidebar = element.closest('.qa-sidebar');
    if (sidebar) {
        return 'Colonnes des classes';
    }
    const header = element.closest('.qa-app__header');
    if (header) {
        return 'Barre supérieure';
    }
    return 'Interface Questions/Actions';
}

function isTutorialElementVisible(element) {
    if (!(element instanceof HTMLElement)) {
        return false;
    }
    if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
        return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return false;
    }
    if (element.offsetParent === null && style.position !== 'fixed') {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }
    return true;
}

function collectTutorialSteps() {
    tutorialSteps = [];
    tutorialStepLookup = new Map();
    tutorialGroups = new Map();
    const nodes = Array.from(document.querySelectorAll('[data-help]'));
    const seen = new WeakSet();
    const uniqueKeys = new Set();
    nodes.forEach((element, index) => {
        if (!(element instanceof HTMLElement)) {
            return;
        }
        if (seen.has(element)) {
            return;
        }
        if (!isTutorialElementVisible(element)) {
            return;
        }
        const rawHelp = element.dataset.help?.trim();
        if (!rawHelp) {
            return;
        }
        seen.add(element);
        const parsed = parseHelpText(rawHelp);
        const label = deriveElementLabel(element);
        const group = deriveElementGroup(element);
        const identifier = element.dataset.tutorialId?.trim()
            || (element.dataset.action ? `action:${element.dataset.action}` : `step:${tutorialSteps.length}`);
        const keywords = `${label} ${parsed.summaryText} ${parsed.examples.join(' ')} ${group}`.toLowerCase();
        const step = {
            id: identifier,
            element,
            help: parsed.raw,
            summary: parsed.summaryText,
            summaryHtml: parsed.summary,
            examples: parsed.examples,
            label,
            group,
            keywords,
        };
        const uniqueKey = `${label}::${parsed.summaryText || parsed.raw}`;
        if (uniqueKeys.has(uniqueKey)) {
            return;
        }
        uniqueKeys.add(uniqueKey);
        tutorialStepLookup.set(step.id, tutorialSteps.length);
        if (!tutorialGroups.has(group)) {
            tutorialGroups.set(group, []);
        }
        tutorialGroups.get(group).push(step);
        tutorialSteps.push(step);
    });
    return tutorialSteps;
}

function updateTutorialContent(step) {
    if (tutorialTitleEl) {
        tutorialTitleEl.textContent = step.label;
    }
    if (tutorialTextEl) {
        const summarySource = step.summaryHtml || step.help;
        const summaryHtml = sanitizeHelpHtml(summarySource);
        if (summaryHtml) {
            tutorialTextEl.innerHTML = summaryHtml;
        } else {
            tutorialTextEl.textContent = step.summary || step.help;
        }
    }
    populateTutorialExamples(step);
    runTutorialSimulation(step);
    populateTutorialQuiz(step);
    updateTutorialNavigation();
    if (tutorialBodyEl) {
        tutorialBodyEl.scrollTop = 0;
        tutorialBodyEl.scrollLeft = 0;
    }
}

function showTutorialStep(targetIndex, options = {}) {
    if (!tutorialSteps.length) {
        return;
    }
    const boundedIndex = Math.max(0, Math.min(targetIndex, tutorialSteps.length - 1));
    tutorialIndex = boundedIndex;
    const step = tutorialSteps[boundedIndex];
    if (!step) {
        return;
    }
    if (step.element instanceof HTMLElement) {
        step.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    updateTutorialContent(step);
    if (options.focus && tutorialBubble) {
        tutorialBubble.focus({ preventScroll: true });
    }
    window.setTimeout(() => {
        requestTutorialLayout();
    }, 120);
}

function requestTutorialLayout() {
    if (!tutorialActive || !tutorialEl || tutorialEl.hidden) {
        tutorialLayoutScheduled = false;
        return;
    }
    if (tutorialLayoutScheduled) {
        return;
    }
    tutorialLayoutScheduled = true;
    requestAnimationFrame(() => {
        tutorialLayoutScheduled = false;
        if (!tutorialActive || !tutorialSteps[tutorialIndex]) {
            return;
        }
        positionTutorialHighlight(tutorialSteps[tutorialIndex]);
        if (tutorialActionPopover && !tutorialActionPopover.hidden) {
            positionTutorialActionPopover();
        }
    });
}

function positionTutorialHighlight(step) {
    if (!tutorialSpotlight || !tutorialBubble) {
        return;
    }
    let rect = null;
    if (step.element instanceof HTMLElement) {
        rect = step.element.getBoundingClientRect();
        if (rect && rect.width === 0 && rect.height === 0) {
            const fallbackTarget = step.element.closest('button, .qa-btn, li, .qa-field, .qa-section');
            if (fallbackTarget instanceof HTMLElement) {
                rect = fallbackTarget.getBoundingClientRect();
            }
        }
    }
    if (!rect || Number.isNaN(rect.left) || Number.isNaN(rect.top)) {
        const fallbackWidth = Math.min(260, window.innerWidth - 32);
        const fallbackHeight = Math.min(180, window.innerHeight - 32);
        const fallbackLeft = (window.innerWidth - fallbackWidth) / 2;
        const fallbackTop = (window.innerHeight - fallbackHeight) / 2;
        rect = {
            left: fallbackLeft,
            top: fallbackTop,
            width: fallbackWidth,
            height: fallbackHeight,
            right: fallbackLeft + fallbackWidth,
            bottom: fallbackTop + fallbackHeight,
        };
    }
    const padding = 18;
    const highlightWidth = Math.min(Math.max(rect.width + padding * 2, 96), window.innerWidth - 24);
    const highlightHeight = Math.min(Math.max(rect.height + padding * 2, 96), window.innerHeight - 24);
    const clampedLeft = Math.min(Math.max(rect.left - padding, 12), window.innerWidth - highlightWidth - 12);
    const clampedTop = Math.min(Math.max(rect.top - padding, 12), window.innerHeight - highlightHeight - 12);
    tutorialSpotlight.style.width = `${highlightWidth}px`;
    tutorialSpotlight.style.height = `${highlightHeight}px`;
    tutorialSpotlight.style.left = `${clampedLeft}px`;
    tutorialSpotlight.style.top = `${clampedTop}px`;
    positionTutorialBubble({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
    });
}

function positionTutorialBubble(targetRect) {
    if (!tutorialBubble) {
        return;
    }
    const spacing = 24;
    const bubbleRect = tutorialBubble.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = targetRect.right + spacing;
    let top = targetRect.top + targetRect.height / 2 - bubbleRect.height / 2;
    let position = 'right';

    if (left + bubbleRect.width > viewportWidth - 16) {
        left = targetRect.left - bubbleRect.width - spacing;
        position = 'left';
    }
    if (left < 16) {
        left = Math.min(Math.max(targetRect.left + (targetRect.width - bubbleRect.width) / 2, 16), viewportWidth - bubbleRect.width - 16);
        if (position === 'left') {
            position = 'right';
        }
    }
    if (position === 'right' || position === 'left') {
        if (top < 16) {
            top = targetRect.bottom + spacing;
            position = 'bottom';
        } else if (top + bubbleRect.height > viewportHeight - 16) {
            top = targetRect.top - bubbleRect.height - spacing;
            position = 'top';
        }
    }
    if (position === 'bottom' || position === 'top') {
        if (left + bubbleRect.width > viewportWidth - 16) {
            left = viewportWidth - bubbleRect.width - 16;
        }
        if (left < 16) {
            left = 16;
        }
        if (top + bubbleRect.height > viewportHeight - 16) {
            top = viewportHeight - bubbleRect.height - 16;
        }
        if (top < 16) {
            top = 16;
        }
    }
    tutorialBubble.dataset.position = position;
    tutorialBubble.style.left = `${left}px`;
    tutorialBubble.style.top = `${top}px`;
    updateTutorialArrowOffset(position, targetRect);
}

function updateTutorialArrowOffset(position, targetRect) {
    if (!tutorialBubble) {
        return;
    }
    const bubbleRect = tutorialBubble.getBoundingClientRect();
    let offsetPercent = 50;
    if (position === 'right' || position === 'left') {
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const relativeY = ((targetCenterY - bubbleRect.top) / bubbleRect.height) * 100;
        offsetPercent = Math.max(18, Math.min(82, relativeY));
    } else if (position === 'top' || position === 'bottom') {
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const relativeX = ((targetCenterX - bubbleRect.left) / bubbleRect.width) * 100;
        offsetPercent = Math.max(18, Math.min(82, relativeX));
    }
    tutorialBubble.style.setProperty('--qa-tutorial-arrow-offset', `${offsetPercent}%`);
}

function positionTutorialActionPopover() {
    if (!tutorialActionPopover || tutorialActionPopover.hidden) {
        return;
    }
    const width = tutorialActionPopover.offsetWidth;
    const height = tutorialActionPopover.offsetHeight;
    let left = 24;
    let top = 24;
    if (tutorialBubble) {
        const bubbleRect = tutorialBubble.getBoundingClientRect();
        left = bubbleRect.right + 16;
        top = bubbleRect.top;
    }
    const coords = clampTutorialPosition(left, top, width, height);
    tutorialActionPopover.style.left = `${coords.left}px`;
    tutorialActionPopover.style.top = `${coords.top}px`;
}

function setActionPopoverState(state) {
    if (!tutorialEl) {
        return;
    }
    if (!state) {
        delete tutorialEl.dataset.actionPopoverState;
        return;
    }
    tutorialEl.dataset.actionPopoverState = state;
}

function openActionPopover() {
    if (!tutorialActionPopover) {
        return;
    }
    tutorialActionPopover.hidden = false;
    tutorialActionPopover.setAttribute('aria-hidden', 'false');
    setActionPopoverState('open');
    if (tutorialActionSearch && tutorialSearchTerm) {
        tutorialActionSearch.value = tutorialSearchTerm;
    }
    renderTutorialActionList(tutorialSearchTerm);
    if (tutorialSteps[tutorialIndex]) {
        populateTutorialQuiz(tutorialSteps[tutorialIndex]);
    }
    positionTutorialActionPopover();
    tutorialActionSearch?.focus({ preventScroll: true });
}

function closeActionPopover() {
    if (!tutorialActionPopover || tutorialActionPopover.hidden) {
        setActionPopoverState('hidden');
        return;
    }
    tutorialActionPopover.hidden = true;
    tutorialActionPopover.setAttribute('aria-hidden', 'true');
    setActionPopoverState('hidden');
}

function toggleActionPopover() {
    if (!tutorialActionPopover) {
        return;
    }
    if (tutorialActionPopover.hidden) {
        openActionPopover();
    } else {
        closeActionPopover();
    }
}

function goToTutorialStep(stepId) {
    if (!tutorialStepLookup.has(stepId)) {
        return;
    }
    const target = tutorialStepLookup.get(stepId);
    showTutorialStep(target, { focus: true });
}

function renderTutorialActionList(searchTerm = '') {
    if (!tutorialActionList) {
        return;
    }
    tutorialSearchTerm = searchTerm;
    const normalized = searchTerm.trim().toLowerCase();
    tutorialActionList.innerHTML = '';
    let total = 0;
    const fragment = document.createDocumentFragment();
    const groups = Array.from(tutorialGroups.entries());
    groups.sort((a, b) => a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }));
    groups.forEach(([group, steps]) => {
        const matches = normalized
            ? steps.filter(step => step.keywords.includes(normalized))
            : steps;
        if (!matches.length) {
            return;
        }
        const details = document.createElement('details');
        if (!normalized && tutorialSteps[tutorialIndex]?.group === group) {
            details.open = true;
        }
        const summary = document.createElement('summary');
        summary.textContent = group;
        details.appendChild(summary);
        const list = document.createElement('ul');
        list.className = 'qa-tutorial__action-items';
        matches.forEach(step => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = step.label;
            button.addEventListener('click', () => {
                goToTutorialStep(step.id);
                closeActionPopover();
            });
            item.appendChild(button);
            list.appendChild(item);
            total += 1;
        });
        details.appendChild(list);
        fragment.appendChild(details);
    });
    if (!total) {
        const empty = document.createElement('p');
        empty.textContent = 'Aucune action correspondante.';
        tutorialActionList.appendChild(empty);
        return;
    }
    tutorialActionList.appendChild(fragment);
}

function handleTutorialSearch() {
    if (!tutorialActionSearch) {
        return;
    }
    renderTutorialActionList(tutorialActionSearch.value ?? '');
}

function startActionPopoverDrag(event) {
    if (!tutorialActionPopover || !(event instanceof PointerEvent) || event.button !== 0) {
        return;
    }
    const origin = event.target;
    if (origin instanceof HTMLElement) {
        const interactive = origin.closest('button, a, input, textarea, select');
        if (interactive && interactive !== tutorialActionHeader) {
            return;
        }
    }
    event.preventDefault();
    const rect = tutorialActionPopover.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const handleMove = evt => {
        const width = tutorialActionPopover.offsetWidth;
        const height = tutorialActionPopover.offsetHeight;
        const coords = clampTutorialPosition(evt.clientX - offsetX, evt.clientY - offsetY, width, height);
        tutorialActionPopover.style.left = `${coords.left}px`;
        tutorialActionPopover.style.top = `${coords.top}px`;
    };
    const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp, { once: true });
}

function openTutorial(startStepId) {
    if (!tutorialEl) {
        return;
    }
    if (!ensureTutorialDemo()) {
        return;
    }
    collectTutorialSteps();
    if (!tutorialSteps.length) {
        return;
    }
    tutorialActive = true;
    tutorialEl.hidden = false;
    tutorialEl.setAttribute('aria-hidden', 'false');
    setActionPopoverState('hidden');
    tutorialSearchTerm = '';
    if (tutorialActionSearch) {
        tutorialActionSearch.value = '';
    }
    const initialIndex = startStepId && tutorialStepLookup.has(startStepId)
        ? tutorialStepLookup.get(startStepId)
        : 0;
    showTutorialStep(initialIndex, { focus: true });
    requestTutorialLayout();
}

function closeTutorial() {
    if (!tutorialEl || tutorialEl.hidden) {
        return false;
    }
    tutorialActive = false;
    tutorialEl.hidden = true;
    tutorialEl.setAttribute('aria-hidden', 'true');
    closeActionPopover();
    setActionPopoverState('hidden');
    cleanupTutorialDemo();
    clearTutorialSimulation();
    if (tutorialSpotlight) {
        tutorialSpotlight.style.width = '0px';
        tutorialSpotlight.style.height = '0px';
    }
    return true;
}

function handleTutorialClose(event) {
    if (event) {
        event.preventDefault();
        if ('stopPropagation' in event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
    }
    const closed = closeTutorial();
    if (closed) {
        tutorialTrigger?.focus({ preventScroll: true });
    }
}

function changeTutorialStep(offset) {
    if (!tutorialSteps.length) {
        return;
    }
    const target = tutorialIndex + offset;
    showTutorialStep(target, { focus: false });
}

function buildTutorialDemoClass() {
    const documentName = activeDocument?.name ?? activeDocument?.title ?? activeDocumentId ?? '';
    return {
        id: '__qa_tutorial_demo__',
        title: 'Démo – Parcours Questions/Actions',
        code: 'QA_TUTO_DEMO',
        description: 'Classe fictive générée pour illustrer toutes les étapes du tutoriel interactif.',
        questions: [
            {
                id: 'qa_demo_identification',
                label: 'Identification du client',
                type: 'open',
                coordinate: 'Page 1 – 145,320',
                required: true,
                allowMultiple: false,
                renderMode: 'standard',
                code: 'CLIENT_IDENT',
                notes: 'Demandez et confirmez le nom complet tel qu’il apparaît sur le contrat.',
                options: [],
                auto: {
                    source: 'request',
                    path: 'formData.client.nomComplet',
                    fallback: '',
                },
                metadata: { tutorialDemo: true },
            },
            {
                id: 'qa_demo_adresse',
                label: 'Adresse principale du client',
                type: 'open',
                coordinate: 'Page 1 – 210,382',
                required: true,
                allowMultiple: false,
                renderMode: 'standard',
                code: 'CLIENT_ADRESSE',
                notes: 'Consignez la rue, la ville et le code postal confirmés avec le client.',
                options: [],
                auto: {
                    source: 'request',
                    path: 'formData.adresses[0].adresseComplete',
                    fallback: '',
                },
                metadata: { tutorialDemo: true },
            },
            {
                id: 'qa_demo_couverture',
                label: 'Type de couverture sélectionnée',
                type: 'choice',
                coordinate: 'Page 1 – 286,448',
                required: true,
                allowMultiple: false,
                renderMode: 'standard',
                code: 'COUVERTURE_TYPE',
                notes: 'Sélectionnez la protection validée avec le client avant de poursuivre.',
                options: [
                    {
                        id: 'qa_demo_couverture_individuelle',
                        label: 'Individuelle',
                        coordinate: 'Page 1 – 288,450',
                        value: 'individuelle',
                        required: false,
                        followUps: [],
                        autoPath: 'formData.produits[0].type',
                        metadata: { tutorialDemo: true },
                    },
                    {
                        id: 'qa_demo_couverture_famille',
                        label: 'Familiale',
                        coordinate: 'Page 1 – 302,450',
                        value: 'familiale',
                        required: false,
                        followUps: [],
                        autoPath: 'formData.produits[0].type',
                        metadata: { tutorialDemo: true },
                    },
                ],
                auto: {
                    source: 'request',
                    path: 'formData.produits[0].type',
                    fallback: '',
                },
                metadata: { tutorialDemo: true },
            },
        ],
        responseBlobs: [
            {
                id: 'qa_demo_blob_validation',
                label: 'Bloc – Validation des informations',
                code: 'QA_VALIDATION',
                description: 'Exemple de réponses préremplies pour confirmer les détails du client avec l’équipe.',
                answers: [
                    { questionId: 'qa_demo_identification', value: 'Nom validé avec le client au téléphone', optionIds: [] },
                    { questionId: 'qa_demo_adresse', value: 'Adresse principale confirmée et à jour', optionIds: [] },
                ],
                metadata: { tutorialDemo: true },
            },
        ],
        autoSelections: [
            {
                id: 'qa_demo_auto_ville',
                label: 'Insérer automatiquement la ville détectée',
                requestPath: 'formData.adresses[0].ville',
                conditionType: 'not_empty',
                conditionTerms: [],
                valueSource: 'request',
                valuePath: 'formData.adresses[0].ville',
                valueLiteral: '',
                fallback: 'Ville à confirmer',
                coordinate: 'Page 1 – 362,512',
                notes: 'Place la ville principale directement sur le PDF lorsque la donnée est disponible.',
                metadata: { tutorialDemo: true },
            },
            {
                id: 'qa_demo_auto_rappel',
                label: 'Afficher un rappel pour les couvertures familiales',
                requestPath: 'formData.produits[0].type',
                conditionType: 'equals',
                conditionTerms: ['familiale', 'Familiale'],
                valueSource: 'literal',
                valuePath: '',
                valueLiteral: 'Préparer la documentation familiale additionnelle.',
                fallback: '',
                coordinate: '',
                notes: 'Ajoute une note interne lorsque la couverture familiale est sélectionnée.',
                metadata: { tutorialDemo: true },
            },
        ],
        metadata: {
            tutorialDemo: true,
            documentId: activeDocumentId,
            documentName,
        },
        documentId: activeDocumentId,
        documentName,
    };
}

function ensureTutorialDemo() {
    if (!tutorialEl) {
        return false;
    }
    if (!activeDocumentId) {
        window.alert('Sélectionnez un document avant de lancer le tutoriel interactif.');
        focusDocumentSelector({ focus: true, scroll: true });
        return false;
    }
    if (tutorialDemoContext && classes.some(item => item.id === tutorialDemoContext.demoClassId)) {
        if (tutorialDemoContext.demoClassId !== activeClassId) {
            const previousSuppress = suppressDirtyWarning;
            suppressDirtyWarning = true;
            openClassById(tutorialDemoContext.demoClassId);
            suppressDirtyWarning = previousSuppress;
        }
        return true;
    }
    if (isDirty && !window.confirm('Le tutoriel interactif va ouvrir une classe de démonstration et abandonner les modifications en cours. Voulez-vous continuer ?')) {
        return false;
    }
    const demoClass = buildTutorialDemoClass();
    const existingIndex = classes.findIndex(item => item.id === demoClass.id);
    if (existingIndex >= 0) {
        classes[existingIndex] = demoClass;
    } else {
        classes = classes.concat(demoClass);
    }
    const previousFilteredClasses = Array.isArray(filteredClasses) ? filteredClasses.slice() : [];
    tutorialDemoContext = {
        demoClassId: demoClass.id,
        previousActiveClassId: activeClassId,
        previousFilteredClasses,
    };
    filteredClasses = previousFilteredClasses.filter(item => item?.id !== demoClass.id);
    renderClassList();
    const previousSuppress = suppressDirtyWarning;
    suppressDirtyWarning = true;
    openClassById(demoClass.id);
    suppressDirtyWarning = previousSuppress;
    return true;
}

function cleanupTutorialDemo() {
    if (!tutorialDemoContext) {
        return;
    }
    const { demoClassId, previousActiveClassId, previousFilteredClasses } = tutorialDemoContext;
    const wasActive = activeClassId === demoClassId;
    classes = classes.filter(item => item.id !== demoClassId);
    if (Array.isArray(previousFilteredClasses)) {
        filteredClasses = previousFilteredClasses.filter(item => item && item.id !== demoClassId);
    } else {
        filteredClasses = filteredClasses.filter(item => item && item.id !== demoClassId);
    }
    tutorialDemoContext = null;
    if (wasActive) {
        activeClassId = null;
    }
    renderClassList();
    if (wasActive) {
        if (previousActiveClassId && classes.some(item => item.id === previousActiveClassId)) {
            const previousSuppress = suppressDirtyWarning;
            suppressDirtyWarning = true;
            openClassById(previousActiveClassId);
            suppressDirtyWarning = previousSuppress;
        } else {
            hideForm();
        }
    }
}

function normalizeQuestionOption(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) {
        return null;
    }
    return {
        id,
        label,
        coordinate: typeof raw.coordinate === 'string' ? raw.coordinate.trim() : '',
        value: typeof raw.value === 'string' ? raw.value : (raw.value ?? ''),
        required: raw.required === true,
        followUps: Array.isArray(raw.followUps)
            ? raw.followUps.map(item => String(item).trim()).filter(Boolean)
            : [],
        autoPath: typeof raw.autoPath === 'string' ? raw.autoPath.trim() : '',
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeQuestion(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) {
        return null;
    }
    const type = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : 'open';
    const normalizedType = ['dot', 'choice', 'open', 'auto'].includes(type) ? type : 'open';
    let options = [];
    if (Array.isArray(raw.options)) {
        options = raw.options.map(normalizeQuestionOption).filter(Boolean);
    }
    const auto = typeof raw.auto === 'object' && raw.auto !== null ? raw.auto : {};
    return {
        id,
        label,
        type: normalizedType,
        coordinate: typeof raw.coordinate === 'string' ? raw.coordinate.trim() : '',
        required: raw.required === true,
        allowMultiple: raw.allowMultiple === true,
        renderMode: typeof raw.renderMode === 'string' ? raw.renderMode : (normalizedType === 'dot' ? 'dot' : 'standard'),
        code: typeof raw.code === 'string' ? raw.code.trim() : '',
        notes: typeof raw.notes === 'string' ? raw.notes.trim() : '',
        options,
        auto: {
            source: typeof auto.source === 'string' ? auto.source : 'request',
            path: typeof auto.path === 'string' ? auto.path : '',
            fallback: typeof auto.fallback === 'string' ? auto.fallback : '',
        },
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeBlob(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) {
        return null;
    }
    let answers = [];
    if (Array.isArray(raw.answers)) {
        answers = raw.answers.map(item => {
            if (!item || typeof item !== 'object') {
                return null;
            }
            const questionId = typeof item.questionId === 'string' ? item.questionId.trim() : '';
            if (!questionId) {
                return null;
            }
            const value = item.value ?? null;
            const optionIds = Array.isArray(item.optionIds)
                ? item.optionIds.map(opt => String(opt).trim()).filter(Boolean)
                : [];
            return { questionId, value, optionIds };
        }).filter(Boolean);
    }
    return {
        id: typeof raw.id === 'string' ? raw.id.trim() : '',
        label,
        code: typeof raw.code === 'string' ? raw.code.trim() : '',
        description: typeof raw.description === 'string' ? raw.description.trim() : '',
        answers,
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeAutoSelection(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const requestPath = typeof raw.requestPath === 'string' ? raw.requestPath.trim() : '';
    const allowedConditions = new Set(['contains', 'not_contains', 'equals', 'not_equals', 'empty', 'not_empty']);
    let conditionType = typeof raw.conditionType === 'string' ? raw.conditionType.trim().toLowerCase() : 'contains';
    if (!allowedConditions.has(conditionType)) {
        conditionType = 'contains';
    }
    let conditionTerms = [];
    if (Array.isArray(raw.conditionTerms)) {
        conditionTerms = raw.conditionTerms.map(item => String(item ?? '').trim()).filter(Boolean);
    } else if (typeof raw.conditionTerms === 'string') {
        conditionTerms = raw.conditionTerms
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(Boolean);
    }
    const valueSourceRaw = typeof raw.valueSource === 'string' ? raw.valueSource.trim().toLowerCase() : 'request';
    const valueSource = valueSourceRaw === 'literal' ? 'literal' : 'request';
    return {
        id,
        label,
        requestPath,
        conditionType,
        conditionTerms,
        valueSource,
        valuePath: typeof raw.valuePath === 'string' ? raw.valuePath.trim() : '',
        valueLiteral: typeof raw.valueLiteral === 'string' ? raw.valueLiteral : '',
        fallback: typeof raw.fallback === 'string' ? raw.fallback : '',
        coordinate: typeof raw.coordinate === 'string' ? raw.coordinate.trim() : '',
        notes: typeof raw.notes === 'string' ? raw.notes.trim() : '',
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeQuestionClass(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const title = typeof raw.title === 'string' ? raw.title.trim() : '';
    const code = typeof raw.code === 'string' ? raw.code.trim() : '';
    if (!id || !title || !code) {
        return null;
    }
    return {
        id,
        title,
        code,
        description: typeof raw.description === 'string' ? raw.description.trim() : '',
        questions: Array.isArray(raw.questions) ? raw.questions.map(normalizeQuestion).filter(Boolean) : [],
        responseBlobs: Array.isArray(raw.responseBlobs) ? raw.responseBlobs.map(normalizeBlob).filter(Boolean) : [],
        autoSelections: Array.isArray(raw.autoSelections)
            ? raw.autoSelections.map(normalizeAutoSelection).filter(Boolean)
            : (Array.isArray(raw.metadata?.autoSelections)
                ? raw.metadata.autoSelections.map(normalizeAutoSelection).filter(Boolean)
                : []),
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
        documentId: typeof raw.documentId === 'string' ? raw.documentId.trim() : (typeof raw.metadata?.documentId === 'string' ? raw.metadata.documentId.trim() : ''),
        documentName: typeof raw.documentName === 'string'
            ? raw.documentName.trim()
            : (typeof raw.metadata?.documentName === 'string' ? raw.metadata.documentName.trim() : ''),
    };
}

function setFeedback(message, options = {}) {
    if (!feedbackEl) {
        return;
    }
    if (!message) {
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
        feedbackEl.classList.remove('is-error');
        return;
    }
    feedbackEl.hidden = false;
    feedbackEl.textContent = message;
    feedbackEl.classList.toggle('is-error', options.error === true);
}

function releaseTransientClassCode() {
    if (!activeTransientClassCode) {
        return;
    }
    transientClassCodes.delete(activeTransientClassCode);
    activeTransientClassCode = null;
}

function updateClassCodeDisplay(value) {
    if (!classCodeDisplay) {
        return;
    }
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (normalized) {
        classCodeDisplay.textContent = normalized;
        classCodeDisplay.classList.remove('is-empty');
    } else {
        classCodeDisplay.textContent = 'Saisissez un titre pour générer le code interne.';
        classCodeDisplay.classList.add('is-empty');
    }
    if (formSubtitleEl) {
        formSubtitleEl.textContent = normalized ? `Code interne : ${normalized}` : '';
    }
}

function ensureClassCodeGenerated(options = {}) {
    if (!classCodeInput) {
        return '';
    }
    const currentValue = classCodeInput.value?.trim() ?? '';
    if (currentValue && options.force !== true) {
        updateClassCodeDisplay(currentValue);
        return currentValue;
    }
    const code = generateUniqueClassCode();
    classCodeInput.value = code;
    updateClassCodeDisplay(code);
    transientClassCodes.add(code);
    activeTransientClassCode = code;
    if (options.markDirty === true) {
        classCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return code;
}

function markDirty() {
    if (!formEl || formEl.hidden) {
        return;
    }
    if (!isDirty) {
        isDirty = true;
    }
}

function markDirtyAndRefreshOverlay() {
    markDirty();
    if (isCoordinatePickerOpen()) {
        updateCoordinateOverlayMarkers();
    }
}

function resetDirty() {
    isDirty = false;
}

function generateUniqueClassCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const existingCodes = new Set(classes.map(item => item.code));
    transientClassCodes.forEach(code => existingCodes.add(code));
    for (let attempt = 0; attempt < 40; attempt += 1) {
        let segment = '';
        for (let i = 0; i < 6; i += 1) {
            const index = Math.floor(Math.random() * alphabet.length);
            segment += alphabet[index];
        }
        const candidate = `QA_${segment}`;
        if (!existingCodes.has(candidate)) {
            return candidate;
        }
    }
    return `QA_${Date.now().toString(36).toUpperCase()}`;
}

function normalizeQuestionCode(value) {
    return String(value ?? '').trim().toUpperCase();
}

function collectUsedQuestionCodes(excludeInput = null) {
    const used = new Set();
    if (!questionListEl) {
        return used;
    }
    const inputs = questionListEl.querySelectorAll('[data-question-field="code"]');
    inputs.forEach(input => {
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        if (excludeInput && input === excludeInput) {
            return;
        }
        const normalized = normalizeQuestionCode(input.value);
        if (normalized) {
            used.add(normalized);
        }
    });
    return used;
}

function generateUniqueQuestionCode(excludeInput = null) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const used = collectUsedQuestionCodes(excludeInput);
    for (let attempt = 0; attempt < 40; attempt += 1) {
        let segment = '';
        for (let i = 0; i < 6; i += 1) {
            const index = Math.floor(Math.random() * alphabet.length);
            segment += alphabet[index];
        }
        const candidate = `QQ_${segment}`;
        if (!used.has(candidate)) {
            return candidate;
        }
    }
    return `QQ_${Date.now().toString(36).toUpperCase()}`;
}

function ensureQuestionCodes(options = {}) {
    const markChange = options.markChange === true;
    if (!questionListEl) {
        return;
    }
    const inputs = Array.from(questionListEl.querySelectorAll('[data-question-field="code"]'));
    inputs.forEach(input => {
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        let normalized = normalizeQuestionCode(input.value);
        let changed = false;
        if (normalized && input.value !== normalized) {
            input.value = normalized;
            changed = true;
        }
        if (!normalized || collectUsedQuestionCodes(input).has(normalized)) {
            const replacement = generateUniqueQuestionCode(input);
            if (replacement) {
                input.value = replacement;
                normalized = replacement;
                changed = true;
            }
        }
        input.readOnly = true;
        input.setAttribute('aria-readonly', 'true');
        if (changed && markChange) {
            markDirty();
        }
    });
}

function createButton(label, handler, className = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = className;
    btn.addEventListener('click', handler);
    return btn;
}

function renderClassList() {
    if (!classListEl) {
        return;
    }
    classListEl.innerHTML = '';
    if (!activeDocumentId) {
        if (classEmptyEl) {
            classEmptyEl.hidden = false;
            classEmptyEl.textContent = 'Choisissez un document pour afficher ses configurations.';
        }
        if (configLibraryOpen) {
            renderConfigLibrary();
        }
        return;
    }
    const baseItems = filteredClasses.length ? filteredClasses : getVisibleClasses();
    const visibleItems = baseItems.filter(item => {
        if (!item || typeof item !== 'object') {
            return false;
        }
        const id = typeof item.id === 'string' ? item.id : '';
        if (!id) {
            return false;
        }
        if (isClassPinned(id)) {
            return true;
        }
        return !isClassHidden(id);
    });
    if (!visibleItems.length) {
        if (classEmptyEl) {
            classEmptyEl.hidden = false;
            if (classes.length) {
                classEmptyEl.textContent = 'Toutes les configurations sont masquées. Cliquez sur 🔎 pour les retrouver.';
            } else {
                classEmptyEl.textContent = 'Aucune classe créée pour le moment.';
            }
        }
        if (configLibraryOpen) {
            renderConfigLibrary();
        }
        return;
    }
    if (classEmptyEl) {
        classEmptyEl.hidden = true;
    }
    const sorted = visibleItems.slice().sort((a, b) => {
        const aDemo = a?.metadata?.tutorialDemo === true;
        const bDemo = b?.metadata?.tutorialDemo === true;
        if (aDemo && !bDemo) {
            return -1;
        }
        if (!aDemo && bDemo) {
            return 1;
        }
        const aPinned = isClassPinned(a.id) ? 1 : 0;
        const bPinned = isClassPinned(b.id) ? 1 : 0;
        if (aPinned !== bPinned) {
            return bPinned - aPinned;
        }
        return (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' });
    });
    sorted.forEach(item => {
        const li = document.createElement('li');
        li.tabIndex = 0;
        li.dataset.id = item.id;
        if (item.id === activeClassId) {
            li.classList.add('is-active');
        }
        if (isClassPinned(item.id)) {
            li.classList.add('is-pinned');
        }
        const title = document.createElement('h3');
        title.textContent = item.title;
        const meta = document.createElement('p');
        const parts = [];
        if (item.code) {
            parts.push(item.code);
        }
        const questionCount = item.questions?.length ?? 0;
        parts.push(`${questionCount} question${questionCount > 1 ? 's' : ''}`);
        const autoCount = item.autoSelections?.length ?? 0;
        if (autoCount) {
            parts.push(`${autoCount} sélection${autoCount > 1 ? 's' : ''} auto`);
        }
        meta.textContent = parts.join(' • ');
        li.appendChild(title);
        li.appendChild(meta);
        if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            desc.style.marginTop = '0.25rem';
            desc.style.fontSize = '0.82rem';
            li.appendChild(desc);
        }
        const actions = document.createElement('div');
        actions.className = 'qa-class-actions';
        const pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'qa-btn qa-btn--ghost';
        pinBtn.textContent = isClassPinned(item.id) ? '📌' : '📍';
        pinBtn.title = isClassPinned(item.id)
            ? 'Retirer des accès rapides'
            : 'Épingler dans la barre latérale';
        pinBtn.addEventListener('click', event => {
            event.stopPropagation();
            togglePinnedClass(item.id);
        });
        const hideBtn = document.createElement('button');
        hideBtn.type = 'button';
        hideBtn.className = 'qa-btn qa-btn--ghost';
        hideBtn.textContent = '⛔';
        hideBtn.title = 'Masquer cette configuration de la liste rapide';
        hideBtn.addEventListener('click', event => {
            event.stopPropagation();
            hideClass(item.id);
        });
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'qa-btn qa-btn--ghost qa-class-actions__delete';
        removeBtn.textContent = '🗑️';
        removeBtn.title = 'Supprimer cette règle';
        removeBtn.setAttribute('aria-label', 'Supprimer cette règle');
        removeBtn.dataset.help = 'Supprime complètement la configuration sélectionnée de la barre latérale et de l’éditeur Questions/Actions.';
        removeBtn.dataset.helpTitle = 'Supprimer une classe';
        removeBtn.dataset.tutorialId = `sidebar-delete:${item.id}`;
        removeBtn.addEventListener('click', event => {
            event.stopPropagation();
            deleteClassById(item.id);
        });
        actions.appendChild(pinBtn);
        actions.appendChild(hideBtn);
        actions.appendChild(removeBtn);
        li.appendChild(actions);
        li.addEventListener('click', () => openClassById(item.id));
        li.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openClassById(item.id);
            }
        });
        classListEl.appendChild(li);
    });
    if (configLibraryOpen) {
        renderConfigLibrary();
    }
}

function applySearch() {
    const term = classSearchInput?.value?.trim().toLowerCase() ?? '';
    if (!term) {
        filteredClasses = [];
        renderClassList();
        return;
    }
    filteredClasses = getVisibleClasses().filter(item => {
        const haystack = `${item.title ?? ''} ${item.code ?? ''} ${item.description ?? ''}`.toLowerCase();
        return haystack.includes(term);
    });
    renderClassList();
}

function ensureFormVisible() {
    if (!formEl || !placeholderEl) {
        return;
    }
    placeholderEl.hidden = true;
    formEl.hidden = false;
    setTabAvailability(true);
}

function hideForm() {
    activeClassId = null;
    releaseTransientClassCode();
    setFormPreviewMode(false);
    if (formEl) {
        formEl.hidden = true;
    }
    if (placeholderEl) {
        placeholderEl.hidden = false;
    }
    if (classCodeInput) {
        classCodeInput.value = '';
    }
    updateClassCodeDisplay('');
    setTabAvailability(false);
    if (classListEl) {
        classListEl.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
    }
    resetDirty();
}

function updateQuestionTitles() {
    if (!questionListEl) {
        return;
    }
    const items = Array.from(questionListEl.querySelectorAll('[data-question]'));
    items.forEach((item, index) => {
        const title = item.querySelector('[data-role="question-title"]');
        const idLabel = item.querySelector('[data-role="question-id"]');
        if (title) {
            title.textContent = `Question ${index + 1}`;
        }
        const internalId = item.getAttribute('data-question-id') ?? '';
        if (idLabel) {
            idLabel.textContent = internalId ? `ID: ${internalId}` : 'ID généré automatiquement';
        }
    });
}

function updateBlobTitles() {
    if (!blobListEl) {
        return;
    }
    const items = Array.from(blobListEl.querySelectorAll('[data-blob]'));
    items.forEach((item, index) => {
        const label = item.querySelector('h5');
        const idLabel = item.querySelector('[data-role="blob-id"]');
        if (label) {
            label.textContent = `Bloc ${index + 1}`;
        }
        const blobId = item.getAttribute('data-blob-id') ?? '';
        if (idLabel) {
            idLabel.textContent = blobId ? `ID: ${blobId}` : 'ID généré automatiquement';
        }
    });
}

function createOptionElement(data = {}) {
    if (!optionTemplate) {
        return null;
    }
    const clone = optionTemplate.content.firstElementChild.cloneNode(true);
    const element = /** @type {HTMLElement} */ (clone);
    const labelInput = element.querySelector('[data-option-field="label"]');
    const coordinateInput = element.querySelector('[data-option-field="coordinate"]');
    const coordinateButton = element.querySelector('[data-action="pick-coordinate"]');
    const valueInput = element.querySelector('[data-option-field="value"]');
    const requiredInput = element.querySelector('[data-option-field="required"]');
    const followUpInput = element.querySelector('[data-option-field="follow-ups"]');
    const autoPathInput = element.querySelector('[data-option-field="auto-path"]');

    if (labelInput) {
        labelInput.value = data.label ?? '';
        labelInput.addEventListener('input', markDirty);
    }
    if (coordinateInput) {
        coordinateInput.value = data.coordinate ?? '';
        coordinateInput.addEventListener('input', markDirtyAndRefreshOverlay);
    }
    attachCoordinatePicker(coordinateButton, coordinateInput, () => {
        const label = labelInput?.value?.trim();
        return label ? `Option : ${label}` : 'Option';
    });
    if (valueInput) {
        valueInput.value = data.value ?? '';
        valueInput.addEventListener('input', markDirty);
    }
    if (requiredInput instanceof HTMLInputElement) {
        requiredInput.checked = Boolean(data.required);
        requiredInput.addEventListener('change', markDirty);
    }
    if (followUpInput) {
        followUpInput.value = Array.isArray(data.followUps) ? data.followUps.join(', ') : (data.followUps ?? '');
        followUpInput.addEventListener('input', markDirty);
    }
    if (autoPathInput) {
        autoPathInput.value = data.autoPath ?? '';
        autoPathInput.addEventListener('input', markDirty);
    }
    if (data.id) {
        element.setAttribute('data-option-id', data.id);
    }

    const deleteBtnEl = element.querySelector('[data-action="delete-option"]');
    deleteBtnEl?.addEventListener('click', () => {
        element.remove();
        markDirtyAndRefreshOverlay();
    });

    registerHoverHelpsWithin(element);
    return element;
}

function updateCategoryIdDisplay(categoryElement, id) {
    const label = categoryElement.querySelector('[data-role="category-id"]');
    if (label) {
        label.textContent = id ? `ID : ${id}` : 'ID généré automatiquement';
    }
}

function collectExistingCategoryIds(questionElement, excludeElement = null) {
    const ids = new Set();
    const container = questionElement.querySelector('[data-role="category-list"]');
    container?.querySelectorAll('[data-category]').forEach(element => {
        if (!(element instanceof HTMLElement)) {
            return;
        }
        if (excludeElement && element === excludeElement) {
            return;
        }
        const input = element.querySelector('[data-category-field="id"]');
        const value = input?.value?.trim();
        if (value) {
            ids.add(value);
        }
    });
    return ids;
}

function generateCategoryId(questionElement, baseLabel = 'categorie') {
    const existing = collectExistingCategoryIds(questionElement);
    let base = slugify(baseLabel);
    if (!base) {
        base = 'categorie';
    }
    let candidate = base;
    let index = 1;
    while (existing.has(candidate)) {
        index += 1;
        candidate = `${base}_${index}`;
    }
    return candidate;
}

function addCategoryToQuestion(questionElement, data = {}) {
    if (!categoryTemplate) {
        return null;
    }
    const container = questionElement.querySelector('[data-role="category-list"]');
    if (!(container instanceof HTMLElement)) {
        return null;
    }
    const clone = categoryTemplate.content.firstElementChild?.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
        return null;
    }
    const labelInput = clone.querySelector('[data-category-field="label"]');
    const idInput = clone.querySelector('[data-category-field="id"]');
    const descriptionInput = clone.querySelector('[data-category-field="description"]');
    const coordinatesContainer = clone.querySelector('[data-role="category-coordinates"]');
    const deleteBtn = clone.querySelector('[data-action="delete-category"]');

    const initialLabel = typeof data.label === 'string' ? data.label : '';
    const initialId = typeof data.id === 'string' && data.id ? data.id : generateCategoryId(questionElement, initialLabel || 'categorie');
    const initialDescription = typeof data.description === 'string' ? data.description : '';
    const coordinateValues = Array.isArray(data.coordinates) ? data.coordinates : [];

    if (labelInput instanceof HTMLInputElement) {
        labelInput.value = initialLabel;
        labelInput.addEventListener('input', () => {
            if (idInput instanceof HTMLInputElement && !idInput.value.trim()) {
                const generated = generateCategoryId(questionElement, labelInput.value || 'categorie');
                idInput.value = generated;
                updateCategoryIdDisplay(clone, generated);
            }
            markDirty();
        });
    }
    if (idInput instanceof HTMLInputElement) {
        idInput.value = initialId;
        idInput.addEventListener('input', () => {
            const normalized = slugify(idInput.value);
            idInput.value = normalized;
            updateCategoryIdDisplay(clone, normalized);
            markDirty();
        });
    }
    updateCategoryIdDisplay(clone, initialId);
    if (descriptionInput instanceof HTMLTextAreaElement) {
        descriptionInput.value = initialDescription;
        descriptionInput.addEventListener('input', markDirty);
    }
    if (coordinatesContainer instanceof HTMLElement) {
        setupCoordinateList(coordinatesContainer, coordinateValues, () => {
            const label = labelInput?.value?.trim();
            const idValue = idInput?.value?.trim();
            return label || idValue || 'Catégorie';
        });
    }
    deleteBtn?.addEventListener('click', () => {
        clone.remove();
        markDirtyAndRefreshOverlay();
    });
    registerHoverHelpsWithin(clone);
    container.appendChild(clone);
    return clone;
}

function toggleNoteSection(questionElement, enabled) {
    const fields = [
        questionElement.querySelector('[data-question-advanced="note-title"]'),
        questionElement.querySelector('[data-question-advanced="note-coordinate"]'),
        questionElement.querySelector('[data-question-advanced="note-placeholder"]'),
    ];
    fields.forEach(field => {
        if (!(field instanceof HTMLElement)) {
            return;
        }
        if (enabled) {
            field.removeAttribute('disabled');
        } else {
            field.setAttribute('disabled', 'disabled');
        }
    });
    const pickButton = questionElement.querySelector('[data-question-advanced="note-coordinate"] + [data-action="pick-coordinate"]');
    if (pickButton instanceof HTMLButtonElement) {
        pickButton.disabled = !enabled;
    }
}

function toggleLibrarySection(questionElement, enabled) {
    const fields = [
        questionElement.querySelector('[data-question-advanced="library-key"]'),
        questionElement.querySelector('[data-question-advanced="library-label"]'),
        questionElement.querySelector('[data-question-advanced="library-defaults"]'),
        questionElement.querySelector('[data-question-advanced="library-allow-save"]'),
    ];
    fields.forEach(field => {
        if (!(field instanceof HTMLElement)) {
            return;
        }
        if (enabled) {
            field.removeAttribute('disabled');
        } else {
            field.setAttribute('disabled', 'disabled');
        }
    });
}

function parseLibraryDefaults(rawValue) {
    if (typeof rawValue !== 'string') {
        return [];
    }
    return rawValue
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const [labelPart, ...valueParts] = line.split(':');
            const label = labelPart?.trim() ?? '';
            const value = valueParts.join(':').trim();
            return {
                label,
                value,
            };
        })
        .filter(entry => entry.label || entry.value);
}

function formatLibraryDefaults(entries) {
    if (!Array.isArray(entries) || !entries.length) {
        return '';
    }
    return entries
        .map(entry => {
            const label = entry?.label ?? '';
            const value = entry?.value ?? '';
            if (label && value) {
                return `${label}: ${value}`;
            }
            return label || value;
        })
        .join('\n');
}

function initializeQuestionAdvanced(questionElement, metadata = {}) {
    questionMetadataMap.set(questionElement, cloneMetadata(metadata));
    const storageTargetSelect = questionElement.querySelector('[data-question-advanced="storage-target"]');
    const storageKeyInput = questionElement.querySelector('[data-question-advanced="storage-key"]');
    const addCategoryBtn = questionElement.querySelector('[data-action="add-category"]');
    const storageBrowseBtn = questionElement.querySelector('[data-action="browse-storage-variable"]');
    const categoryContainer = questionElement.querySelector('[data-role="category-list"]');
    const noteEnabledInput = questionElement.querySelector('[data-question-advanced="note-enabled"]');
    const noteTitleInput = questionElement.querySelector('[data-question-advanced="note-title"]');
    const noteCoordinateInput = questionElement.querySelector('[data-question-advanced="note-coordinate"]');
    const notePlaceholderInput = questionElement.querySelector('[data-question-advanced="note-placeholder"]');
    const libraryEnabledInput = questionElement.querySelector('[data-question-advanced="library-enabled"]');
    const libraryKeyInput = questionElement.querySelector('[data-question-advanced="library-key"]');
    const libraryLabelInput = questionElement.querySelector('[data-question-advanced="library-label"]');
    const libraryDefaultsInput = questionElement.querySelector('[data-question-advanced="library-defaults"]');
    const libraryAllowSaveInput = questionElement.querySelector('[data-question-advanced="library-allow-save"]');

    const storageMeta = typeof metadata.storage === 'object' && metadata.storage !== null ? metadata.storage : {};
    if (storageTargetSelect instanceof HTMLSelectElement) {
        storageTargetSelect.value = storageMeta.target ?? 'none';
        storageTargetSelect.addEventListener('change', markDirty);
    }
    if (storageKeyInput instanceof HTMLInputElement) {
        storageKeyInput.value = storageMeta.key ?? '';
        storageKeyInput.addEventListener('input', markDirty);
    }
    if (storageBrowseBtn instanceof HTMLButtonElement) {
        storageBrowseBtn.addEventListener('click', event => {
            event.preventDefault();
            openVariableBrowser(storageKeyInput ?? null);
        });
    }

    const categories = Array.isArray(metadata.categories) ? metadata.categories : [];
    if (categoryContainer instanceof HTMLElement) {
        categoryContainer.innerHTML = '';
        categories.forEach(category => addCategoryToQuestion(questionElement, category));
    }
    addCategoryBtn?.addEventListener('click', () => {
        const newElement = addCategoryToQuestion(questionElement, {});
        if (newElement) {
            const idInput = newElement.querySelector('[data-category-field="id"]');
            if (idInput instanceof HTMLInputElement && !idInput.value) {
                idInput.value = generateCategoryId(questionElement, 'categorie');
                updateCategoryIdDisplay(newElement, idInput.value);
            }
        }
        markDirty();
    });

    const noteMeta = typeof metadata.noteSection === 'object' && metadata.noteSection !== null ? metadata.noteSection : {};
    const noteEnabled = noteMeta.enabled === true;
    if (noteEnabledInput instanceof HTMLInputElement) {
        noteEnabledInput.checked = noteEnabled;
        noteEnabledInput.addEventListener('change', event => {
            const enabled = event.currentTarget.checked;
            toggleNoteSection(questionElement, enabled);
            markDirty();
        });
    }
    if (noteTitleInput instanceof HTMLInputElement) {
        noteTitleInput.value = noteMeta.title ?? '';
        noteTitleInput.addEventListener('input', markDirty);
    }
    if (noteCoordinateInput instanceof HTMLInputElement) {
        noteCoordinateInput.value = noteMeta.coordinate ?? '';
        noteCoordinateInput.addEventListener('input', markDirtyAndRefreshOverlay);
        attachCoordinatePicker(
            questionElement.querySelector('[data-question-advanced="note-coordinate"] + [data-action="pick-coordinate"]'),
            noteCoordinateInput,
            () => 'Bloc de notes'
        );
    }
    if (notePlaceholderInput instanceof HTMLTextAreaElement) {
        notePlaceholderInput.value = noteMeta.placeholder ?? '';
        notePlaceholderInput.addEventListener('input', markDirty);
    }
    toggleNoteSection(questionElement, noteEnabled);

    const libraryMeta = typeof metadata.savedResponses === 'object' && metadata.savedResponses !== null ? metadata.savedResponses : {};
    const libraryEnabled = libraryMeta.enabled === true;
    if (libraryEnabledInput instanceof HTMLInputElement) {
        libraryEnabledInput.checked = libraryEnabled;
        libraryEnabledInput.addEventListener('change', event => {
            const enabled = event.currentTarget.checked;
            toggleLibrarySection(questionElement, enabled);
            markDirty();
        });
    }
    if (libraryKeyInput instanceof HTMLInputElement) {
        libraryKeyInput.value = libraryMeta.key ?? '';
        libraryKeyInput.addEventListener('input', markDirty);
    }
    if (libraryLabelInput instanceof HTMLInputElement) {
        libraryLabelInput.value = libraryMeta.label ?? '';
        libraryLabelInput.addEventListener('input', markDirty);
    }
    if (libraryDefaultsInput instanceof HTMLTextAreaElement) {
        libraryDefaultsInput.value = formatLibraryDefaults(libraryMeta.defaults ?? []);
        libraryDefaultsInput.addEventListener('input', markDirty);
    }
    if (libraryAllowSaveInput instanceof HTMLInputElement) {
        libraryAllowSaveInput.checked = libraryMeta.allowSave !== false;
        libraryAllowSaveInput.addEventListener('change', markDirty);
    }
    toggleLibrarySection(questionElement, libraryEnabled);
}

function collectQuestionMetadata(questionElement) {
    const metadata = cloneMetadata(questionMetadataMap.get(questionElement) ?? {});
    delete metadata.storage;
    delete metadata.categories;
    delete metadata.noteSection;
    delete metadata.savedResponses;

    const storageTargetSelect = questionElement.querySelector('[data-question-advanced="storage-target"]');
    const storageKeyInput = questionElement.querySelector('[data-question-advanced="storage-key"]');
    if (storageTargetSelect instanceof HTMLSelectElement) {
        const target = storageTargetSelect.value ?? 'none';
        const key = storageKeyInput?.value?.trim() ?? '';
        if (target !== 'none' || key) {
            metadata.storage = {
                target,
                key,
            };
        }
    }

    const categories = [];
    const categoryContainer = questionElement.querySelector('[data-role="category-list"]');
    categoryContainer?.querySelectorAll('[data-category]').forEach(categoryElement => {
        const labelInput = categoryElement.querySelector('[data-category-field="label"]');
        const idInput = categoryElement.querySelector('[data-category-field="id"]');
        const descriptionInput = categoryElement.querySelector('[data-category-field="description"]');
        const label = labelInput?.value?.trim() ?? '';
        const idValue = idInput?.value?.trim() ?? '';
        const description = descriptionInput?.value?.trim() ?? '';
        const coordinates = readCoordinateList(categoryElement);
        if (!label && !coordinates.length) {
            return;
        }
        categories.push({
            label,
            id: idValue || generateCategoryId(questionElement, label || 'categorie'),
            description,
            coordinates,
        });
    });
    if (categories.length) {
        metadata.categories = categories;
    }

    const noteEnabledInput = questionElement.querySelector('[data-question-advanced="note-enabled"]');
    if (noteEnabledInput instanceof HTMLInputElement && noteEnabledInput.checked) {
        const noteTitleInput = questionElement.querySelector('[data-question-advanced="note-title"]');
        const noteCoordinateInput = questionElement.querySelector('[data-question-advanced="note-coordinate"]');
        const notePlaceholderInput = questionElement.querySelector('[data-question-advanced="note-placeholder"]');
        metadata.noteSection = {
            enabled: true,
            title: noteTitleInput?.value?.trim() ?? '',
            coordinate: noteCoordinateInput?.value?.trim() ?? '',
            placeholder: notePlaceholderInput?.value?.trim() ?? '',
        };
    }

    const libraryEnabledInput = questionElement.querySelector('[data-question-advanced="library-enabled"]');
    if (libraryEnabledInput instanceof HTMLInputElement && libraryEnabledInput.checked) {
        const libraryKeyInput = questionElement.querySelector('[data-question-advanced="library-key"]');
        const libraryLabelInput = questionElement.querySelector('[data-question-advanced="library-label"]');
        const libraryDefaultsInput = questionElement.querySelector('[data-question-advanced="library-defaults"]');
        const libraryAllowSaveInput = questionElement.querySelector('[data-question-advanced="library-allow-save"]');
        metadata.savedResponses = {
            enabled: true,
            key: libraryKeyInput?.value?.trim() ?? '',
            label: libraryLabelInput?.value?.trim() ?? '',
            defaults: parseLibraryDefaults(libraryDefaultsInput?.value ?? ''),
            allowSave: libraryAllowSaveInput instanceof HTMLInputElement ? libraryAllowSaveInput.checked : true,
        };
    }

    questionMetadataMap.set(questionElement, metadata);
    return metadata;
}

function toggleDynamicPanels(autoElement, mode) {
    const maxPanel = autoElement.querySelector('[data-dynamic-panel="maxClients"]');
    const requestPanel = autoElement.querySelector('[data-dynamic-panel="requestValue"]');
    if (maxPanel instanceof HTMLElement) {
        maxPanel.hidden = mode !== 'maxClients';
    }
    if (requestPanel instanceof HTMLElement) {
        requestPanel.hidden = mode !== 'requestValue';
    }
}

function addDynamicMaxEntry(autoElement, data = {}) {
    if (!dynamicMaxTemplate) {
        return null;
    }
    const list = autoElement.querySelector('[data-role="dynamic-max-list"]');
    if (!(list instanceof HTMLElement)) {
        return null;
    }
    const clone = dynamicMaxTemplate.content.firstElementChild?.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
        return null;
    }
    const countInput = clone.querySelector('[data-dynamic-field="count"]');
    const labelInput = clone.querySelector('[data-dynamic-field="label"]');
    const coordinatesContainer = clone.querySelector('[data-role="dynamic-coordinates"]');
    const deleteBtn = clone.querySelector('[data-action="delete-dynamic"]');

    if (countInput instanceof HTMLInputElement) {
        const value = Number.parseInt(data.count ?? '', 10);
        if (!Number.isNaN(value)) {
            countInput.value = String(value);
        } else {
            countInput.value = '';
        }
        countInput.addEventListener('input', markDirty);
    }
    if (labelInput instanceof HTMLInputElement) {
        labelInput.value = typeof data.label === 'string' ? data.label : '';
        labelInput.addEventListener('input', markDirty);
    }
    if (coordinatesContainer instanceof HTMLElement) {
        setupCoordinateList(coordinatesContainer, Array.isArray(data.coordinates) ? data.coordinates : [], () => {
            const countValue = countInput?.value?.trim();
            return countValue ? `Max clients ${countValue}` : 'Variante clients';
        });
    }
    deleteBtn?.addEventListener('click', () => {
        clone.remove();
        markDirtyAndRefreshOverlay();
    });
    registerHoverHelpsWithin(clone);
    list.appendChild(clone);
    return clone;
}

function addDynamicRequestEntry(autoElement, data = {}) {
    if (!dynamicRequestTemplate) {
        return null;
    }
    const list = autoElement.querySelector('[data-role="dynamic-request-list"]');
    if (!(list instanceof HTMLElement)) {
        return null;
    }
    const clone = dynamicRequestTemplate.content.firstElementChild?.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
        return null;
    }
    const valueInput = clone.querySelector('[data-dynamic-field="value"]');
    const labelInput = clone.querySelector('[data-dynamic-field="label"]');
    const coordinatesContainer = clone.querySelector('[data-role="dynamic-coordinates"]');
    const deleteBtn = clone.querySelector('[data-action="delete-dynamic"]');

    if (valueInput instanceof HTMLInputElement) {
        valueInput.value = typeof data.value === 'string' ? data.value : '';
        valueInput.addEventListener('input', markDirty);
    }
    if (labelInput instanceof HTMLInputElement) {
        labelInput.value = typeof data.label === 'string' ? data.label : '';
        labelInput.addEventListener('input', markDirty);
    }
    if (coordinatesContainer instanceof HTMLElement) {
        setupCoordinateList(coordinatesContainer, Array.isArray(data.coordinates) ? data.coordinates : [], () => {
            const value = valueInput?.value?.trim();
            return value || 'Valeur détectée';
        });
    }
    deleteBtn?.addEventListener('click', () => {
        clone.remove();
        markDirtyAndRefreshOverlay();
    });
    registerHoverHelpsWithin(clone);
    list.appendChild(clone);
    return clone;
}

function initializeAutoSelectionAdvanced(autoElement, metadata = {}) {
    autoSelectionMetadataMap.set(autoElement, cloneMetadata(metadata));
    const enabledInput = autoElement.querySelector('[data-auto-dynamic="enabled"]');
    const modeSelect = autoElement.querySelector('[data-auto-dynamic="mode"]');
    const requestPathInput = autoElement.querySelector('[data-auto-dynamic="request-path"]');
    const maxList = autoElement.querySelector('[data-role="dynamic-max-list"]');
    const requestList = autoElement.querySelector('[data-role="dynamic-request-list"]');
    const fallbackContainer = autoElement.querySelector('[data-role="dynamic-request-fallback"]');
    const addMaxBtn = autoElement.querySelector('[data-action="add-dynamic-max"]');
    const addRequestBtn = autoElement.querySelector('[data-action="add-dynamic-request"]');

    const dynamicMeta = typeof metadata.dynamicCoordinates === 'object' && metadata.dynamicCoordinates !== null
        ? metadata.dynamicCoordinates
        : {};
    const enabled = dynamicMeta.enabled === true;
    const mode = dynamicMeta.mode === 'requestValue' ? 'requestValue' : 'maxClients';

    if (enabledInput instanceof HTMLInputElement) {
        enabledInput.checked = enabled;
        enabledInput.addEventListener('change', event => {
            const checked = event.currentTarget.checked;
            autoElement.classList.toggle('is-dynamic-enabled', checked);
            markDirty();
        });
        autoElement.classList.toggle('is-dynamic-enabled', enabledInput.checked);
    }
    if (modeSelect instanceof HTMLSelectElement) {
        modeSelect.value = mode;
        modeSelect.addEventListener('change', event => {
            const value = event.currentTarget.value;
            toggleDynamicPanels(autoElement, value);
            markDirty();
        });
        toggleDynamicPanels(autoElement, modeSelect.value);
    } else {
        toggleDynamicPanels(autoElement, mode);
    }
    if (requestPathInput instanceof HTMLInputElement) {
        requestPathInput.value = typeof dynamicMeta.requestPath === 'string' ? dynamicMeta.requestPath : '';
        requestPathInput.addEventListener('input', markDirty);
    }
    if (maxList instanceof HTMLElement) {
        maxList.innerHTML = '';
        const entries = Array.isArray(dynamicMeta.maxClients) ? dynamicMeta.maxClients : [];
        entries.forEach(entry => addDynamicMaxEntry(autoElement, entry));
    }
    if (requestList instanceof HTMLElement) {
        requestList.innerHTML = '';
        const entries = Array.isArray(dynamicMeta.requestValues?.cases)
            ? dynamicMeta.requestValues.cases
            : Array.isArray(dynamicMeta.requestValues)
                ? dynamicMeta.requestValues
                : [];
        entries.forEach(entry => addDynamicRequestEntry(autoElement, entry));
    }
    if (fallbackContainer instanceof HTMLElement) {
        const fallbackCoordinates = Array.isArray(dynamicMeta.requestValues?.fallback)
            ? dynamicMeta.requestValues.fallback
            : Array.isArray(dynamicMeta.fallback)
                ? dynamicMeta.fallback
                : [];
        setupCoordinateList(fallbackContainer, fallbackCoordinates, () => 'Valeur par défaut');
    }
    addMaxBtn?.addEventListener('click', () => {
        addDynamicMaxEntry(autoElement, {});
        markDirtyAndRefreshOverlay();
    });
    addRequestBtn?.addEventListener('click', () => {
        addDynamicRequestEntry(autoElement, {});
        markDirtyAndRefreshOverlay();
    });
}

function collectAutoSelectionMetadata(autoElement) {
    const metadata = cloneMetadata(autoSelectionMetadataMap.get(autoElement) ?? {});
    delete metadata.dynamicCoordinates;

    const enabledInput = autoElement.querySelector('[data-auto-dynamic="enabled"]');
    const modeSelect = autoElement.querySelector('[data-auto-dynamic="mode"]');
    const requestPathInput = autoElement.querySelector('[data-auto-dynamic="request-path"]');
    if (!(enabledInput instanceof HTMLInputElement) || !enabledInput.checked) {
        autoSelectionMetadataMap.set(autoElement, metadata);
        return metadata;
    }

    const mode = modeSelect instanceof HTMLSelectElement ? modeSelect.value : 'maxClients';
    const dynamic = {
        enabled: true,
        mode,
    };
    if (requestPathInput instanceof HTMLInputElement && requestPathInput.value.trim()) {
        dynamic.requestPath = requestPathInput.value.trim();
    }

    if (mode === 'maxClients') {
        const entries = [];
        autoElement.querySelectorAll('[data-dynamic-max]').forEach(entryEl => {
            if (!(entryEl instanceof HTMLElement)) {
                return;
            }
            const countInput = entryEl.querySelector('[data-dynamic-field="count"]');
            const labelInput = entryEl.querySelector('[data-dynamic-field="label"]');
            const countValue = Number.parseInt(countInput?.value ?? '', 10);
            const coordinates = readCoordinateList(entryEl);
            if (Number.isNaN(countValue) || countValue < 1 || !coordinates.length) {
                return;
            }
            entries.push({
                count: countValue,
                label: labelInput?.value?.trim() ?? '',
                coordinates,
            });
        });
        if (entries.length) {
            dynamic.maxClients = entries;
        }
    } else {
        const cases = [];
        autoElement.querySelectorAll('[data-dynamic-request]').forEach(entryEl => {
            if (!(entryEl instanceof HTMLElement)) {
                return;
            }
            const valueInput = entryEl.querySelector('[data-dynamic-field="value"]');
            const labelInput = entryEl.querySelector('[data-dynamic-field="label"]');
            const coordinates = readCoordinateList(entryEl);
            const value = valueInput?.value?.trim() ?? '';
            if (!value && !coordinates.length) {
                return;
            }
            cases.push({
                value,
                label: labelInput?.value?.trim() ?? '',
                coordinates,
            });
        });
        const fallbackContainer = autoElement.querySelector('[data-role="dynamic-request-fallback"]');
        const fallbackCoordinates = readCoordinateList(fallbackContainer);
        dynamic.requestValues = {
            cases,
            fallback: fallbackCoordinates,
        };
    }

    metadata.dynamicCoordinates = dynamic;
    autoSelectionMetadataMap.set(autoElement, metadata);
    return metadata;
}

function renderConfigLibrary() {
    if (!configLibraryList) {
        return;
    }
    configLibraryList.innerHTML = '';
    if (!classes.length) {
        const empty = document.createElement('p');
        empty.textContent = 'Aucune configuration enregistrée pour le moment.';
        configLibraryList.appendChild(empty);
        return;
    }
    const sorted = classes.slice().sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' }));
    sorted.forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'qa-config-library__item';
        const details = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = item.title ?? 'Configuration sans titre';
        const meta = document.createElement('p');
        const parts = [];
        if (item.code) {
            parts.push(item.code);
        }
        const questionCount = item.questions?.length ?? 0;
        parts.push(`${questionCount} question${questionCount > 1 ? 's' : ''}`);
        const autoCount = item.autoSelections?.length ?? 0;
        if (autoCount) {
            parts.push(`${autoCount} sélection${autoCount > 1 ? 's' : ''} auto`);
        }
        meta.textContent = parts.join(' • ');
        details.appendChild(title);
        details.appendChild(meta);
        if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            desc.style.marginTop = '0.35rem';
            details.appendChild(desc);
        }
        const actions = document.createElement('div');
        actions.className = 'qa-config-library__item-actions';
        const pinned = isClassPinned(item.id);
        const hidden = isClassHidden(item.id) && !pinned;
        if (hidden) {
            entry.classList.add('is-hidden');
        } else {
            entry.classList.remove('is-hidden');
        }
        const docInfo = document.createElement('p');
        docInfo.className = 'qa-config-library__doc';
        const docLabel = item.documentName || item.documentId;
        docInfo.textContent = docLabel ? `Document : ${docLabel}` : 'Document : (non attribué)';
        details.appendChild(docInfo);
        const pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'qa-btn qa-btn--ghost';
        pinBtn.textContent = '📌';
        pinBtn.title = pinned ? 'Retirer des accès rapides' : 'Épingler dans la barre latérale';
        pinBtn.addEventListener('click', event => {
            event.stopPropagation();
            togglePinnedClass(item.id);
            renderConfigLibrary();
        });
        const hideBtn = document.createElement('button');
        hideBtn.type = 'button';
        hideBtn.className = 'qa-btn qa-btn--ghost';
        hideBtn.textContent = '⛔';
        hideBtn.title = hidden ? 'Réafficher dans la liste rapide' : 'Masquer de la liste rapide';
        hideBtn.addEventListener('click', event => {
            event.stopPropagation();
            if (hidden) {
                showClass(item.id);
            } else {
                hideClass(item.id);
            }
            renderConfigLibrary();
        });
        actions.appendChild(pinBtn);
        actions.appendChild(hideBtn);
        entry.appendChild(details);
        entry.appendChild(actions);
        entry.addEventListener('click', () => {
            ensureSidebarVisible();
            openClassById(item.id);
            closeConfigLibrary({ returnFocus: false });
        });
        entry.addEventListener('dblclick', event => {
            event.stopPropagation();
            duplicateClassForActiveDocument(item);
            closeConfigLibrary({ returnFocus: false });
        });
        configLibraryList.appendChild(entry);
    });
}

function openConfigLibrary() {
    if (!configLibraryEl) {
        return;
    }
    configLibraryOpen = true;
    configLibraryEl.hidden = false;
    configLibraryEl.setAttribute('aria-hidden', 'false');
    if (configLibraryToggleBtn) {
        configLibraryToggleBtn.hidden = true;
        configLibraryToggleBtn.setAttribute('aria-hidden', 'true');
    }
    renderConfigLibrary();
    ensureConfigLibraryPosition();
    if (configLibraryPanel instanceof HTMLElement && !configLibraryPanel.hasAttribute('tabindex')) {
        configLibraryPanel.setAttribute('tabindex', '-1');
    }
    configLibraryPanel?.focus({ preventScroll: true });
}

function closeConfigLibrary(options = {}) {
    if (!configLibraryEl) {
        return;
    }
    configLibraryOpen = false;
    configLibraryEl.hidden = true;
    configLibraryEl.setAttribute('aria-hidden', 'true');
    if (configLibraryToggleBtn) {
        configLibraryToggleBtn.hidden = false;
        configLibraryToggleBtn.setAttribute('aria-hidden', 'false');
    }
    releaseConfigLibraryDrag();
    if (options.returnFocus !== false) {
        openConfigLibraryBtn?.focus({ preventScroll: true });
    }
}

function toggleQuestionType(element, type) {
    const optionsContainer = element.querySelector('[data-role="question-options"]');
    const autoContainer = element.querySelector('[data-role="question-auto"]');
    if (optionsContainer) {
        optionsContainer.hidden = !(type === 'dot' || type === 'choice');
    }
    if (autoContainer) {
        autoContainer.hidden = type !== 'auto';
    }
}

function createQuestionElement(data = {}) {
    if (!questionTemplate) {
        return null;
    }
    const clone = questionTemplate.content.firstElementChild.cloneNode(true);
    const element = /** @type {HTMLElement} */ (clone);
    const labelInput = element.querySelector('[data-question-field="label"]');
    const coordinateInput = element.querySelector('[data-question-field="coordinate"]');
    const coordinateButton = element.querySelector('[data-action="pick-coordinate"]');
    const typeSelect = element.querySelector('[data-question-field="type"]');
    const requiredInput = element.querySelector('[data-question-field="required"]');
    const codeInput = element.querySelector('[data-question-field="code"]');
    const notesInput = element.querySelector('[data-question-field="notes"]');
    const allowMultipleInput = element.querySelector('[data-question-field="allow-multiple"]');
    const autoSourceSelect = element.querySelector('[data-question-field="auto-source"]');
    const autoPathInput = element.querySelector('[data-question-field="auto-path"]');
    const autoFallbackInput = element.querySelector('[data-question-field="auto-fallback"]');
    const optionList = element.querySelector('[data-role="option-list"]');

    if (data.id) {
        element.setAttribute('data-question-id', data.id);
    }

    if (labelInput) {
        labelInput.value = data.label ?? '';
        labelInput.addEventListener('input', markDirty);
    }
    if (coordinateInput) {
        coordinateInput.value = data.coordinate ?? '';
        coordinateInput.addEventListener('input', markDirtyAndRefreshOverlay);
    }
    attachCoordinatePicker(coordinateButton, coordinateInput, () => {
        const label = labelInput?.value?.trim();
        return label ? `Question : ${label}` : 'Question';
    });
    if (typeSelect instanceof HTMLSelectElement) {
        typeSelect.value = data.type ?? 'open';
        typeSelect.addEventListener('change', event => {
            const value = event.currentTarget.value;
            toggleQuestionType(element, value);
            markDirty();
        });
        toggleQuestionType(element, typeSelect.value);
    }
    if (requiredInput instanceof HTMLInputElement) {
        requiredInput.checked = Boolean(data.required);
        requiredInput.addEventListener('change', markDirty);
    }
    if (codeInput) {
        const normalized = normalizeQuestionCode(data.code);
        if (normalized) {
            codeInput.value = normalized;
        } else {
            codeInput.value = generateUniqueQuestionCode(codeInput);
        }
        codeInput.readOnly = true;
        codeInput.setAttribute('aria-readonly', 'true');
    }
    if (notesInput) {
        notesInput.value = data.notes ?? '';
        notesInput.addEventListener('input', markDirty);
    }
    if (allowMultipleInput instanceof HTMLInputElement) {
        allowMultipleInput.checked = Boolean(data.allowMultiple);
        allowMultipleInput.addEventListener('change', markDirty);
    }
    if (autoSourceSelect instanceof HTMLSelectElement) {
        autoSourceSelect.value = data.auto?.source ?? 'request';
        autoSourceSelect.addEventListener('change', markDirty);
    }
    if (autoPathInput) {
        autoPathInput.value = data.auto?.path ?? '';
        autoPathInput.addEventListener('input', markDirty);
    }
    if (autoFallbackInput) {
        autoFallbackInput.value = data.auto?.fallback ?? '';
        autoFallbackInput.addEventListener('input', markDirty);
    }

    if (optionList && Array.isArray(data.options)) {
        data.options.forEach(option => {
            const optionEl = createOptionElement(option);
            if (optionEl) {
                optionList.appendChild(optionEl);
            }
        });
    }

    initializeQuestionAdvanced(element, typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {});

    const addOptionBtnEl = element.querySelector('[data-action="add-option"]');
    addOptionBtnEl?.addEventListener('click', () => {
        const optionEl = createOptionElement();
        if (optionEl && optionList) {
            optionList.appendChild(optionEl);
            markDirtyAndRefreshOverlay();
        }
    });

    const moveUpBtn = element.querySelector('[data-action="move-up"]');
    moveUpBtn?.addEventListener('click', () => {
        const previous = element.previousElementSibling;
        if (previous) {
            element.parentElement.insertBefore(element, previous);
            updateQuestionTitles();
            markDirty();
        }
    });

    const moveDownBtn = element.querySelector('[data-action="move-down"]');
    moveDownBtn?.addEventListener('click', () => {
        const next = element.nextElementSibling?.nextElementSibling;
        if (next) {
            element.parentElement.insertBefore(element, next);
        } else {
            element.parentElement.appendChild(element);
        }
        updateQuestionTitles();
        markDirtyAndRefreshOverlay();
    });

    const deleteBtnEl = element.querySelector('[data-action="delete-question"]');
    deleteBtnEl?.addEventListener('click', () => {
        element.remove();
        updateQuestionTitles();
        markDirtyAndRefreshOverlay();
    });

    registerHoverHelpsWithin(element);
    return element;
}

function createBlobElement(data = {}) {
    if (!blobTemplate) {
        return null;
    }
    const clone = blobTemplate.content.firstElementChild.cloneNode(true);
    const element = /** @type {HTMLElement} */ (clone);
    const labelInput = element.querySelector('[data-blob-field="label"]');
    const codeInput = element.querySelector('[data-blob-field="code"]');
    const descriptionInput = element.querySelector('[data-blob-field="description"]');
    const answersInput = element.querySelector('[data-blob-field="answers"]');

    if (data.id) {
        element.setAttribute('data-blob-id', data.id);
    }
    if (labelInput) {
        labelInput.value = data.label ?? '';
        labelInput.addEventListener('input', markDirty);
    }
    if (codeInput) {
        codeInput.value = data.code ?? '';
        codeInput.addEventListener('input', markDirty);
    }
    if (descriptionInput) {
        descriptionInput.value = data.description ?? '';
        descriptionInput.addEventListener('input', markDirty);
    }
    if (answersInput) {
        if (Array.isArray(data.answers) || typeof data.answers === 'object') {
            answersInput.value = JSON.stringify(data.answers, null, 2);
        } else if (typeof data.answers === 'string') {
            answersInput.value = data.answers;
        } else {
            answersInput.value = '';
        }
        answersInput.addEventListener('input', markDirty);
    }
    const deleteBtnEl = element.querySelector('[data-action="delete-blob"]');
    deleteBtnEl?.addEventListener('click', () => {
        element.remove();
        updateBlobTitles();
        markDirty();
    });
    registerHoverHelpsWithin(element);
    return element;
}

function toggleAutoSelectionCondition(element, type) {
    const requiresTerms = type !== 'empty' && type !== 'not_empty';
    const termsWrapper = element.querySelector('[data-auto-role="condition-terms"]');
    if (termsWrapper instanceof HTMLElement) {
        termsWrapper.hidden = !requiresTerms;
    }
}

function toggleAutoSelectionValueSource(element, source) {
    const pathWrapper = element.querySelector('[data-auto-role="value-path"]');
    const literalWrapper = element.querySelector('[data-auto-role="value-literal"]');
    if (pathWrapper instanceof HTMLElement) {
        pathWrapper.hidden = source !== 'request';
    }
    if (literalWrapper instanceof HTMLElement) {
        literalWrapper.hidden = source !== 'literal';
    }
}

function createAutoSelectionElement(data = {}) {
    if (!autoTemplate) {
        return null;
    }
    const clone = autoTemplate.content.firstElementChild.cloneNode(true);
    const element = /** @type {HTMLElement} */ (clone);
    const labelInput = element.querySelector('[data-auto-field="label"]');
    const coordinateInput = element.querySelector('[data-auto-field="coordinate"]');
    const coordinateButton = element.querySelector('[data-action="pick-coordinate"]');
    const requestPathInput = element.querySelector('[data-auto-field="request-path"]');
    const conditionSelect = element.querySelector('[data-auto-field="condition-type"]');
    const conditionTermsInput = element.querySelector('[data-auto-field="condition-terms"]');
    const valueSourceSelect = element.querySelector('[data-auto-field="value-source"]');
    const valuePathInput = element.querySelector('[data-auto-field="value-path"]');
    const valueLiteralInput = element.querySelector('[data-auto-field="value-literal"]');
    const fallbackInput = element.querySelector('[data-auto-field="fallback"]');
    const notesInput = element.querySelector('[data-auto-field="notes"]');
    const titleEl = element.querySelector('[data-role="auto-title"]');
    const idEl = element.querySelector('[data-role="auto-id"]');

    if (typeof data.id === 'string' && data.id) {
        element.setAttribute('data-auto-selection-id', data.id);
    }
    if (titleEl) {
        titleEl.textContent = 'Sélection automatique';
    }
    if (idEl) {
        idEl.textContent = data.id ? `ID : ${data.id}` : 'ID généré automatiquement';
    }

    if (labelInput) {
        labelInput.value = data.label ?? '';
        labelInput.addEventListener('input', markDirty);
    }
    if (coordinateInput) {
        coordinateInput.value = data.coordinate ?? '';
        coordinateInput.addEventListener('input', markDirty);
    }
    attachCoordinatePicker(coordinateButton, coordinateInput, () => {
        const label = labelInput?.value?.trim();
        return label ? `Sélection automatique : ${label}` : 'Sélection automatique';
    });
    if (requestPathInput) {
        requestPathInput.value = data.requestPath ?? '';
        requestPathInput.addEventListener('input', markDirty);
    }
    if (conditionSelect instanceof HTMLSelectElement) {
        conditionSelect.value = data.conditionType ?? 'contains';
        conditionSelect.addEventListener('change', event => {
            const value = event.currentTarget.value;
            toggleAutoSelectionCondition(element, value);
            markDirty();
        });
        toggleAutoSelectionCondition(element, conditionSelect.value);
    }
    if (conditionTermsInput instanceof HTMLTextAreaElement) {
        if (Array.isArray(data.conditionTerms) && data.conditionTerms.length) {
            conditionTermsInput.value = data.conditionTerms.join(', ');
        } else if (typeof data.conditionTerms === 'string') {
            conditionTermsInput.value = data.conditionTerms;
        } else {
            conditionTermsInput.value = '';
        }
        conditionTermsInput.addEventListener('input', markDirty);
    }
    if (valueSourceSelect instanceof HTMLSelectElement) {
        const source = data.valueSource ?? 'request';
        valueSourceSelect.value = source;
        valueSourceSelect.addEventListener('change', event => {
            const current = event.currentTarget.value;
            toggleAutoSelectionValueSource(element, current);
            markDirty();
        });
        toggleAutoSelectionValueSource(element, valueSourceSelect.value);
    }
    if (valuePathInput) {
        valuePathInput.value = data.valuePath ?? '';
        valuePathInput.addEventListener('input', markDirty);
    }
    if (valueLiteralInput) {
        valueLiteralInput.value = data.valueLiteral ?? '';
        valueLiteralInput.addEventListener('input', markDirty);
    }
    if (fallbackInput) {
        fallbackInput.value = data.fallback ?? '';
        fallbackInput.addEventListener('input', markDirty);
    }
    if (notesInput) {
        notesInput.value = data.notes ?? '';
        notesInput.addEventListener('input', markDirty);
    }

    const moveUpBtn = element.querySelector('[data-action="auto-move-up"]');
    moveUpBtn?.addEventListener('click', () => {
        const previous = element.previousElementSibling;
        if (previous) {
            element.parentElement.insertBefore(element, previous);
            updateAutoSelectionTitles();
            markDirty();
        }
    });

    const moveDownBtn = element.querySelector('[data-action="auto-move-down"]');
    moveDownBtn?.addEventListener('click', () => {
        const next = element.nextElementSibling?.nextElementSibling;
        if (next) {
            element.parentElement.insertBefore(element, next);
        } else {
            element.parentElement.appendChild(element);
        }
        updateAutoSelectionTitles();
        markDirty();
    });

    const deleteBtn = element.querySelector('[data-action="auto-delete"]');
    deleteBtn?.addEventListener('click', () => {
        element.remove();
        updateAutoSelectionTitles();
        markDirtyAndRefreshOverlay();
    });

    initializeAutoSelectionAdvanced(element, typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {});

    registerHoverHelpsWithin(element);
    return element;
}

function updateAutoSelectionTitles() {
    if (!autoListEl) {
        return;
    }
    const items = Array.from(autoListEl.querySelectorAll('[data-auto-selection]'));
    items.forEach((item, index) => {
        const title = item.querySelector('[data-role="auto-title"]');
        if (title) {
            title.textContent = `Sélection automatique ${index + 1}`;
        }
        const idLabel = item.querySelector('[data-role="auto-id"]');
        const autoId = item.getAttribute('data-auto-selection-id') ?? '';
        if (idLabel) {
            idLabel.textContent = autoId ? `ID : ${autoId}` : 'ID généré automatiquement';
        }
    });
}

function readAutoSelectionElement(element) {
    if (!(element instanceof HTMLElement)) {
        return null;
    }
    const labelInput = element.querySelector('[data-auto-field="label"]');
    const requestPathInput = element.querySelector('[data-auto-field="request-path"]');
    const conditionSelect = element.querySelector('[data-auto-field="condition-type"]');
    const conditionTermsInput = element.querySelector('[data-auto-field="condition-terms"]');
    const valueSourceSelect = element.querySelector('[data-auto-field="value-source"]');
    const valuePathInput = element.querySelector('[data-auto-field="value-path"]');
    const valueLiteralInput = element.querySelector('[data-auto-field="value-literal"]');
    const fallbackInput = element.querySelector('[data-auto-field="fallback"]');
    const coordinateInput = element.querySelector('[data-auto-field="coordinate"]');
    const notesInput = element.querySelector('[data-auto-field="notes"]');

    const label = labelInput?.value?.trim() ?? '';
    if (!label) {
        return null;
    }
    const requestPath = requestPathInput?.value?.trim() ?? '';
    const conditionType = conditionSelect instanceof HTMLSelectElement ? conditionSelect.value : 'contains';
    let conditionTerms = [];
    const rawTerms = conditionTermsInput?.value ?? '';
    if (rawTerms) {
        conditionTerms = rawTerms
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(Boolean);
    }
    const valueSource = valueSourceSelect instanceof HTMLSelectElement ? valueSourceSelect.value : 'request';
    const valuePath = valuePathInput?.value?.trim() ?? '';
    const valueLiteral = valueLiteralInput?.value ?? '';
    const fallback = fallbackInput?.value ?? '';
    const coordinate = coordinateInput?.value?.trim() ?? '';
    const notes = notesInput?.value?.trim() ?? '';
    const id = element.getAttribute('data-auto-selection-id') ?? '';

    return {
        id,
        label,
        requestPath,
        conditionType,
        conditionTerms,
        valueSource,
        valuePath,
        valueLiteral,
        fallback,
        coordinate,
        notes,
        metadata: collectAutoSelectionMetadata(element),
    };
}

function addAutoSelection(data = {}, options = {}) {
    if (!autoListEl) {
        return null;
    }
    const element = createAutoSelectionElement(data);
    if (!element) {
        return null;
    }
    autoListEl.appendChild(element);
    updateAutoSelectionTitles();
    if (options.silent !== true) {
        markDirtyAndRefreshOverlay();
    }
    const shouldFocus = options.focus !== false;
    if (shouldFocus) {
        const focusTarget = element.querySelector('input, textarea, select');
        focusTarget?.focus();
    }
    return element;
}

function setActiveTab(tab) {
    activeTab = tab;
    tabButtons.forEach(button => {
        const isTarget = (button.dataset.tab ?? '') === tab;
        button.classList.toggle('is-active', isTarget);
        button.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
    });
    tabPanels.forEach(panel => {
        if (!(panel instanceof HTMLElement)) {
            return;
        }
        const target = panel.getAttribute('data-tab-panel');
        const isActive = target === tab;
        panel.hidden = !isActive;
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
}

function openAutoBuilder(event) {
    if (event) {
        event.preventDefault();
    }
    if (!formEl || formEl.hidden) {
        window.alert('Sélectionnez ou créez une classe Questions/Actions avant d\'ouvrir le générateur automatique.');
        return;
    }
    setActiveTab('auto');
    ensureFormVisible();
    const url = new URL('question_actions_auto_builder.php', window.location.href);
    if (activeClassId) {
        url.searchParams.set('class', activeClassId);
    }
    const newWindow = window.open(url.toString(), '_blank', 'noopener');
    if (!newWindow || newWindow.closed) {
        window.location.href = url.toString();
    }
}

function openAutoFaq() {
    if (!autoFaqEl) {
        return;
    }
    autoFaqEl.hidden = false;
    autoFaqEl.setAttribute('aria-hidden', 'false');
    if (autoFaqPanel instanceof HTMLElement) {
        if (!autoFaqPanel.hasAttribute('tabindex')) {
            autoFaqPanel.setAttribute('tabindex', '-1');
        }
        autoFaqPanel.focus();
    }
}

function closeAutoFaq() {
    if (!autoFaqEl) {
        return;
    }
    autoFaqEl.hidden = true;
    autoFaqEl.setAttribute('aria-hidden', 'true');
    openAutoFaqBtn?.focus();
}

function applyAutoSelectionPayload(payload, options = {}) {
    if (!formEl || formEl.hidden) {
        window.alert('Sélectionnez ou créez une classe Questions/Actions avant d\'ajouter une sélection automatique.');
        return false;
    }
    ensureFormVisible();
    setActiveTab('auto');
    const element = addAutoSelection(payload ?? {}, { focus: options.focus !== false });
    if (element instanceof HTMLElement) {
        element.classList.add('is-highlighted');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => {
            element.classList.remove('is-highlighted');
        }, 2600);
    }
    setFeedback('Sélection automatique ajoutée depuis le générateur.');
    window.setTimeout(() => {
        setFeedback('');
    }, 4000);
    return true;
}

function handleBuilderMessage(event) {
    if (!event || typeof event.data !== 'object' || event.data === null) {
        return;
    }
    const origin = event.origin ?? '';
    if (origin && origin !== 'null' && origin !== window.location.origin) {
        return;
    }
    if (event.data.type === 'qa-auto-builder:request-coordinate') {
        if (!event.source) {
            return;
        }
        coordinatePickerState.remoteTarget = {
            source: event.source,
            origin: origin && origin !== 'null' ? origin : '*',
        };
        const contextLabel = event.data?.contextLabel ?? 'Règle auto depuis le générateur';
        openCoordinatePicker(null, contextLabel);
        return;
    }
    if (event.data.type === 'template-saved') {
        ensureTemplateLibrary(true).catch(error => {
            console.error('Impossible de rafraîchir la liste des documents', error);
        });
        return;
    }
    if (event.data.type !== 'qa-auto-selection-created') {
        return;
    }
    const payload = typeof event.data.payload === 'object' && event.data.payload !== null ? event.data.payload : {};
    const applied = applyAutoSelectionPayload(payload, { focus: true });
    if (applied && event.data.autoSave) {
        formEl?.requestSubmit();
    }
}

function populateForm(questionClass) {
    if (!formEl) {
        return;
    }
    setFormPreviewMode(false);
    releaseTransientClassCode();
    ensureFormVisible();
    suppressDirtyWarning = true;
    formEl.reset();
    suppressDirtyWarning = false;
    activeClassMetadata = {};
    if (questionClass && questionClass.metadata && typeof questionClass.metadata === 'object') {
        try {
            activeClassMetadata = JSON.parse(JSON.stringify(questionClass.metadata));
        } catch (error) {
            activeClassMetadata = { ...questionClass.metadata };
        }
        if (!activeClassMetadata || typeof activeClassMetadata !== 'object') {
            activeClassMetadata = {};
        } else if ('autoSelections' in activeClassMetadata) {
            delete activeClassMetadata.autoSelections;
        }
    }
    classIdInput.value = questionClass.id ?? '';
    classTitleInput.value = questionClass.title ?? '';
    const resolvedCode = typeof questionClass.code === 'string' ? questionClass.code.trim() : '';
    classCodeInput.value = resolvedCode;
    if (resolvedCode) {
        const exists = classes.some(item => item.code === resolvedCode);
        if (!exists) {
            transientClassCodes.add(resolvedCode);
            activeTransientClassCode = resolvedCode;
        }
    }
    updateClassCodeDisplay(resolvedCode);
    classDescriptionInput.value = questionClass.description ?? '';

    if (deleteBtn) {
        deleteBtn.hidden = !(questionClass && questionClass.id);
    }
    if (duplicateBtn) {
        duplicateBtn.hidden = !(questionClass && questionClass.id);
    }

    if (formTitleEl) {
        formTitleEl.textContent = questionClass.title ? `Classe – ${questionClass.title}` : 'Nouvelle classe';
    }
    if (questionListEl) {
        questionListEl.innerHTML = '';
        (questionClass.questions ?? []).forEach(question => {
            const element = createQuestionElement(question);
            if (element) {
                questionListEl.appendChild(element);
            }
        });
        updateQuestionTitles();
        ensureQuestionCodes({ markChange: true });
    }

    if (blobListEl) {
        blobListEl.innerHTML = '';
        (questionClass.responseBlobs ?? []).forEach(blob => {
            const element = createBlobElement(blob);
            if (element) {
                blobListEl.appendChild(element);
            }
        });
        updateBlobTitles();
    }

    if (autoListEl) {
        autoListEl.innerHTML = '';
        const selections = Array.isArray(questionClass.autoSelections) ? questionClass.autoSelections : [];
        selections.forEach(selection => {
            addAutoSelection(selection, { focus: false, silent: true });
        });
        updateAutoSelectionTitles();
    }

    setActiveTab(activeTab === 'auto' ? 'auto' : 'questions');

    resetDirty();
    setFeedback('');
    refreshDocumentContext();
}

function setFormPreviewMode(enabled, options = {}) {
    if (!formEl) {
        return;
    }
    isPreviewMode = enabled === true;
    previewSourceDocumentId = isPreviewMode ? (options.documentId ?? '') : '';
    previewSourceDocumentName = isPreviewMode ? (options.documentName ?? '') : '';
    formEl.classList.toggle('is-preview', isPreviewMode);
    const interactive = formEl.querySelectorAll('input, select, textarea, button');
    interactive.forEach(element => {
        if (!(element instanceof HTMLInputElement
            || element instanceof HTMLTextAreaElement
            || element instanceof HTMLSelectElement
            || element instanceof HTMLButtonElement)) {
            return;
        }
        if (isPreviewMode) {
            if (!element.dataset.originalDisabled) {
                element.dataset.originalDisabled = element.disabled ? 'true' : 'false';
            }
            if (element === cancelBtn) {
                element.disabled = false;
                element.textContent = 'Fermer l’aperçu';
                element.dataset.previewIgnore = 'true';
                return;
            }
            if (element === duplicateBtn || element === deleteBtn || element === saveBtn) {
                element.disabled = true;
                return;
            }
            if (element.dataset.previewIgnore === 'true') {
                element.disabled = false;
                return;
            }
            element.disabled = true;
        } else {
            const wasDisabled = element.dataset.originalDisabled === 'true';
            if (element === cancelBtn) {
                element.textContent = cancelBtnDefaultLabel;
            }
            if (element === duplicateBtn || element === deleteBtn || element === saveBtn) {
                element.disabled = wasDisabled;
            } else if (element.dataset.previewIgnore === 'true') {
                element.disabled = false;
            } else if (!wasDisabled) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
            delete element.dataset.previewIgnore;
            delete element.dataset.originalDisabled;
        }
    });
    if (!isPreviewMode) {
        previewSourceDocumentId = '';
        previewSourceDocumentName = '';
    }
    refreshDocumentContext();
}

function openClassById(id) {
    if (isDirty && !suppressDirtyWarning) {
        const proceed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer sans enregistrer ?');
        if (!proceed) {
            return;
        }
    }
    const questionClass = classes.find(item => item.id === id);
    if (!questionClass) {
        return;
    }
    const belongsToDocument = (questionClass.documentId ?? '') === activeDocumentId;
    if (!belongsToDocument) {
        activeClassId = null;
        if (classListEl) {
            classListEl.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
        }
        populateForm(questionClass);
        setFormPreviewMode(true, {
            documentId: questionClass.documentId ?? '',
            documentName: questionClass.documentName ?? '',
        });
        setFeedback('Classe provenant d’un autre document – mode aperçu. Double-cliquez dans la bibliothèque pour la copier.');
        return;
    }
    activeClassId = id;
    if (classListEl) {
        classListEl.querySelectorAll('li').forEach(li => {
            li.classList.toggle('is-active', li.dataset.id === id);
        });
    }
    populateForm(questionClass);
}

function createEmptyClass() {
    return {
        id: '',
        title: '',
        code: '',
        description: '',
        questions: [],
        responseBlobs: [],
        autoSelections: [],
        metadata: {},
        documentId: activeDocumentId,
        documentName: activeDocument?.name ?? activeDocument?.title ?? '',
    };
}

function startNewClass() {
    if (!activeDocumentId) {
        window.alert('Sélectionnez un document avant de créer une classe.');
        showDocumentGate({ focus: true });
        return;
    }
    if (isDirty && !suppressDirtyWarning) {
        const proceed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer sans enregistrer ?');
        if (!proceed) {
            return;
        }
    }
    activeClassId = null;
    activeTab = 'questions';
    if (classListEl) {
        classListEl.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
    }
    setActiveTab('questions');
    populateForm(createEmptyClass());
    markDirty();
}

function duplicateActiveClass() {
    if (!activeClassId) {
        return;
    }
    const questionClass = classes.find(item => item.id === activeClassId);
    if (!questionClass) {
        return;
    }
    const copy = JSON.parse(JSON.stringify(questionClass));
    copy.id = '';
    copy.title = `${copy.title} (copie)`;
    copy.code = generateUniqueClassCode();
    copy.documentId = activeDocumentId;
    copy.documentName = activeDocument?.name ?? activeDocument?.title ?? '';
    if (Array.isArray(copy.autoSelections)) {
        copy.autoSelections = copy.autoSelections.map(selection => ({
            ...selection,
            id: '',
        }));
    }
    activeTab = 'questions';
    setActiveTab('questions');
    populateForm(copy);
    activeClassId = null;
    if (classListEl) {
        classListEl.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
    }
    markDirty();
}

function duplicateClassForActiveDocument(sourceClass) {
    if (!activeDocumentId) {
        window.alert('Sélectionnez d’abord un document pour y copier cette configuration.');
        showDocumentGate({ focus: true });
        return;
    }
    if (!sourceClass || typeof sourceClass !== 'object') {
        return;
    }
    const copy = JSON.parse(JSON.stringify(sourceClass));
    copy.id = '';
    copy.code = generateUniqueClassCode();
    copy.documentId = activeDocumentId;
    copy.documentName = activeDocument?.name ?? activeDocument?.title ?? '';
    if (copy.title) {
        copy.title = `${copy.title} (copie)`;
    }
    if (Array.isArray(copy.autoSelections)) {
        copy.autoSelections = copy.autoSelections.map(selection => ({
            ...selection,
            id: '',
        }));
    }
    if (Array.isArray(copy.questions)) {
        copy.questions = copy.questions.map(question => {
            const next = { ...question, id: '' };
            if (Array.isArray(next.options)) {
                next.options = next.options.map(option => ({ ...option, id: '' }));
            }
            return next;
        });
    }
    if (Array.isArray(copy.responseBlobs)) {
        copy.responseBlobs = copy.responseBlobs.map(blob => ({ ...blob, id: '' }));
    }
    activeClassId = null;
    if (classListEl) {
        classListEl.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
    }
    setActiveTab('questions');
    populateForm(copy);
    markDirty();
    setFeedback('Copie prête à être adaptée pour ce document.');
    window.setTimeout(() => {
        if (!isPreviewMode) {
            setFeedback('');
        }
    }, 3600);
}

function readOptionElement(element) {
    if (!(element instanceof HTMLElement)) {
        return null;
    }
    const labelInput = element.querySelector('[data-option-field="label"]');
    const coordinateInput = element.querySelector('[data-option-field="coordinate"]');
    const valueInput = element.querySelector('[data-option-field="value"]');
    const requiredInput = element.querySelector('[data-option-field="required"]');
    const followUpInput = element.querySelector('[data-option-field="follow-ups"]');
    const autoPathInput = element.querySelector('[data-option-field="auto-path"]');

    const label = labelInput?.value?.trim() ?? '';
    if (!label) {
        return null;
    }
    const id = element.getAttribute('data-option-id') ?? '';
    const followUps = followUpInput?.value
        ? followUpInput.value.split(',').map(item => item.trim()).filter(Boolean)
        : [];
    return {
        id,
        label,
        coordinate: coordinateInput?.value?.trim() ?? '',
        value: valueInput?.value ?? '',
        required: requiredInput instanceof HTMLInputElement ? requiredInput.checked : false,
        followUps,
        autoPath: autoPathInput?.value?.trim() ?? '',
    };
}

function readQuestionElement(element) {
    if (!(element instanceof HTMLElement)) {
        return null;
    }
    const labelInput = element.querySelector('[data-question-field="label"]');
    const coordinateInput = element.querySelector('[data-question-field="coordinate"]');
    const typeSelect = element.querySelector('[data-question-field="type"]');
    const requiredInput = element.querySelector('[data-question-field="required"]');
    const codeInput = element.querySelector('[data-question-field="code"]');
    const notesInput = element.querySelector('[data-question-field="notes"]');
    const allowMultipleInput = element.querySelector('[data-question-field="allow-multiple"]');
    const autoSourceSelect = element.querySelector('[data-question-field="auto-source"]');
    const autoPathInput = element.querySelector('[data-question-field="auto-path"]');
    const autoFallbackInput = element.querySelector('[data-question-field="auto-fallback"]');

    const label = labelInput?.value?.trim() ?? '';
    if (!label) {
        return null;
    }
    const type = typeSelect instanceof HTMLSelectElement ? typeSelect.value : 'open';

    const options = [];
    if (type === 'dot' || type === 'choice') {
        const optionNodes = element.querySelectorAll('[data-option]');
        optionNodes.forEach(node => {
            const option = readOptionElement(node);
            if (option) {
                options.push(option);
            }
        });
    }

    return {
        id: element.getAttribute('data-question-id') ?? '',
        label,
        type,
        coordinate: coordinateInput?.value?.trim() ?? '',
        required: requiredInput instanceof HTMLInputElement ? requiredInput.checked : false,
        allowMultiple: allowMultipleInput instanceof HTMLInputElement ? allowMultipleInput.checked : false,
        code: normalizeQuestionCode(codeInput?.value ?? ''),
        notes: notesInput?.value?.trim() ?? '',
        options,
        autoSource: autoSourceSelect instanceof HTMLSelectElement ? autoSourceSelect.value : 'request',
        autoPath: autoPathInput?.value?.trim() ?? '',
        autoFallback: autoFallbackInput?.value?.trim() ?? '',
        metadata: collectQuestionMetadata(element),
    };
}

function readBlobElement(element) {
    if (!(element instanceof HTMLElement)) {
        return null;
    }
    const labelInput = element.querySelector('[data-blob-field="label"]');
    const codeInput = element.querySelector('[data-blob-field="code"]');
    const descriptionInput = element.querySelector('[data-blob-field="description"]');
    const answersInput = element.querySelector('[data-blob-field="answers"]');
    const label = labelInput?.value?.trim() ?? '';
    if (!label) {
        return null;
    }
    let answers = [];
    const rawAnswers = answersInput?.value?.trim() ?? '';
    if (rawAnswers) {
        try {
            const parsed = JSON.parse(rawAnswers);
            if (Array.isArray(parsed)) {
                answers = parsed;
            } else if (parsed && typeof parsed === 'object') {
                answers = Object.entries(parsed).map(([questionId, value]) => ({ questionId, value, optionIds: [] }));
            }
        } catch (error) {
            throw new Error(`JSON invalide pour les réponses du bloc « ${label} »`);
        }
    }
    return {
        id: element.getAttribute('data-blob-id') ?? '',
        label,
        code: codeInput?.value?.trim() ?? '',
        description: descriptionInput?.value?.trim() ?? '',
        answers,
    };
}

function serializeForm() {
    ensureQuestionCodes();
    const title = classTitleInput?.value?.trim() ?? '';
    const code = classCodeInput?.value?.trim() ?? '';
    if (!title || !code) {
        throw new Error('Le titre et le code de la classe sont requis.');
    }
    if (!activeDocumentId) {
        throw new Error('Sélectionnez un document avant d’enregistrer.');
    }
    const questions = [];
    if (questionListEl) {
        const nodes = questionListEl.querySelectorAll('[data-question]');
        nodes.forEach(node => {
            const question = readQuestionElement(node);
            if (question) {
                const payload = {
                    id: question.id,
                    label: question.label,
                    type: question.type,
                    coordinate: question.coordinate,
                    required: question.required,
                    allowMultiple: question.allowMultiple,
                    code: question.code,
                    notes: question.notes,
                    options: question.options,
                    autoSource: question.autoSource,
                    autoPath: question.autoPath,
                    autoFallback: question.autoFallback,
                    metadata: question.metadata ?? {},
                };
                questions.push(payload);
            }
        });
    }
    const blobs = [];
    if (blobListEl) {
        const nodes = blobListEl.querySelectorAll('[data-blob]');
        nodes.forEach(node => {
            const blob = readBlobElement(node);
            if (blob) {
                blobs.push(blob);
            }
        });
    }
    const autoSelections = [];
    if (autoListEl) {
        const nodes = autoListEl.querySelectorAll('[data-auto-selection]');
        nodes.forEach(node => {
            const selection = readAutoSelectionElement(node);
            if (selection) {
                autoSelections.push(selection);
            }
        });
    }
    let metadata = {};
    if (activeClassMetadata && typeof activeClassMetadata === 'object') {
        try {
            metadata = JSON.parse(JSON.stringify(activeClassMetadata));
        } catch (error) {
            metadata = { ...activeClassMetadata };
        }
    }
    return {
        id: classIdInput?.value?.trim() ?? '',
        title,
        code,
        description: classDescriptionInput?.value?.trim() ?? '',
        questions,
        responseBlobs: blobs,
        autoSelections,
        metadata,
        documentId: activeDocumentId,
        documentName: activeDocument?.name ?? activeDocument?.title ?? '',
    };
}

async function loadClasses(options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}?action=listQuestionClasses`, {
            cache: options.cache ?? 'no-cache',
        });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        classes = Array.isArray(payload.data?.classes)
            ? payload.data.classes.map(normalizeQuestionClass).filter(Boolean)
            : [];
        renderClassList();
        if (tutorialActive && tutorialDemoContext?.demoClassId) {
            const existsDemo = classes.some(item => item.id === tutorialDemoContext.demoClassId);
            if (!existsDemo) {
                const demoClass = buildTutorialDemoClass();
                classes = classes.concat(demoClass);
                renderClassList();
                const previousSuppress = suppressDirtyWarning;
                suppressDirtyWarning = true;
                openClassById(demoClass.id);
                suppressDirtyWarning = previousSuppress;
            }
        }
        if (activeClassId) {
            const exists = classes.some(item => item.id === activeClassId);
            if (!exists) {
                hideForm();
            }
        }
    } catch (error) {
        console.error(error);
        window.alert('Impossible de charger les classes de Questions/Actions.');
    }
}

async function saveClass(event) {
    event.preventDefault();
    if (!formEl) {
        return;
    }
    if (activeClassMetadata?.tutorialDemo) {
        setFeedback('La classe de démonstration du tutoriel ne peut pas être sauvegardée.', { error: true });
        return;
    }
    try {
        setFeedback('');
        const payload = serializeForm();
        const response = await fetch(`${API_BASE_URL}?action=saveQuestionClass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ class: payload }),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide du serveur');
        }
        const body = await response.json();
        const saved = normalizeQuestionClass(body.data?.class ?? body.class ?? body.data ?? body);
        if (!saved) {
            throw new Error('Réponse incomplète');
        }
        const index = classes.findIndex(item => item.id === saved.id);
        if (index >= 0) {
            classes[index] = saved;
        } else {
            classes.unshift(saved);
        }
        activeClassId = saved.id;
        populateForm(saved);
        renderClassList();
        resetDirty();
        setFeedback('Classe sauvegardée avec succès.');
        try {
            window.opener?.postMessage({ type: 'question-classes-updated' }, window.location.origin);
        } catch (error) {
            window.opener?.postMessage({ type: 'question-classes-updated' }, '*');
        }
    } catch (error) {
        console.error(error);
        setFeedback(error.message ?? 'Impossible d’enregistrer la classe.', { error: true });
    }
}

async function deleteClassById(classId) {
    if (!classId) {
        return false;
    }
    const target = classes.find(item => item.id === classId);
    if (target?.metadata?.tutorialDemo) {
        window.alert('Cette classe de démonstration est supprimée automatiquement lorsque le tutoriel se termine.');
        return false;
    }
    const label = target?.title ? ` « ${target.title} »` : '';
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer la classe${label} ? Cette action est irréversible.`);
    if (!confirmDelete) {
        return false;
    }
    try {
        const response = await fetch(`${API_BASE_URL}?action=deleteQuestionClass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId }),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        classes = classes.filter(item => item.id !== classId);
        if (classId === activeClassId) {
            activeClassId = null;
            hideForm();
        }
        renderClassList();
        try {
            window.opener?.postMessage({ type: 'question-classes-updated' }, window.location.origin);
        } catch (error) {
            window.opener?.postMessage({ type: 'question-classes-updated' }, '*');
        }
        return true;
    } catch (error) {
        console.error(error);
        window.alert('Impossible de supprimer la classe.');
        return false;
    }
}

async function deleteClass() {
    if (!activeClassId) {
        return;
    }
    await deleteClassById(activeClassId);
}

function cancelEdit() {
    if (isPreviewMode) {
        setFormPreviewMode(false);
        hideForm();
        return;
    }
    if (isDirty && !suppressDirtyWarning) {
        const proceed = window.confirm('Voulez-vous annuler les modifications en cours ?');
        if (!proceed) {
            return;
        }
    }
    if (activeClassId) {
        const original = classes.find(item => item.id === activeClassId);
        if (original) {
            populateForm(original);
        } else {
            hideForm();
        }
    } else {
        hideForm();
    }
}

function addQuestion() {
    if (!questionListEl) {
        return;
    }
    const element = createQuestionElement({ type: 'dot', options: [] });
    if (element) {
        questionListEl.appendChild(element);
        updateQuestionTitles();
        ensureQuestionCodes({ markChange: true });
        markDirty();
    }
}

function addBlob() {
    if (!blobListEl) {
        return;
    }
    const element = createBlobElement();
    if (element) {
        blobListEl.appendChild(element);
        updateBlobTitles();
        markDirty();
    }
}

function bindEvents() {
    formEl?.addEventListener('submit', saveClass);
    addQuestionBtn?.addEventListener('click', addQuestion);
    addBlobBtn?.addEventListener('click', addBlob);
    openAutoBuilderBtn?.addEventListener('click', openAutoBuilder);
    addAutoSelectionBtn?.addEventListener('click', () => {
        setActiveTab('auto');
        addAutoSelection();
    });
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab ?? 'questions';
            setActiveTab(tab);
        });
    });
    cancelBtn?.addEventListener('click', cancelEdit);
    deleteBtn?.addEventListener('click', deleteClass);
    duplicateBtn?.addEventListener('click', duplicateActiveClass);
    classSearchInput?.addEventListener('input', applySearch);
    reloadBtn?.addEventListener('click', () => loadClasses({ cache: 'no-cache' }));
    newClassBtn?.addEventListener('click', startNewClass);
    documentChangeBtn?.addEventListener('click', () => {
        focusDocumentSelector({ focus: true, scroll: true });
    });
    documentOpenBtn?.addEventListener('click', () => {
        const value = documentSelect?.value ?? '';
        if (!value) {
            window.alert('Sélectionnez un document dans la liste.');
            return;
        }
        setActiveDocumentById(value);
    });
    documentRefreshBtn?.addEventListener('click', () => {
        ensureTemplateLibrary(true).catch(error => {
            console.error('Impossible de recharger les documents', error);
            window.alert('Impossible de recharger la liste des documents.');
        });
    });
    documentImportBtn?.addEventListener('click', () => {
        const url = new URL('template_editor.php', window.location.href);
        url.searchParams.set('mode', 'register');
        window.open(url.toString(), 'templateEditor', 'width=1200,height=860,scrollbars=yes,resizable=yes');
    });
    documentSelect?.addEventListener('change', () => {
        if (documentSelect.value) {
            documentSelect.classList.remove('is-invalid');
        }
        updateDocumentSelectionState();
        if (documentSelect.value) {
            setActiveDocumentById(documentSelect.value);
        }
    });
    updateDocumentSelectionState();
    tutorialTrigger?.addEventListener('click', () => {
        if (!tutorialEl) {
            return;
        }
        if (tutorialEl.hidden) {
            const startId = tutorialTrigger.dataset.tutorialId ?? undefined;
            openTutorial(startId);
        } else {
            closeTutorial();
        }
    });
    tutorialCloseBtn?.addEventListener('click', handleTutorialClose);
    tutorialCloseBtn?.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleTutorialClose(event);
        }
    });
    tutorialBackdrop?.addEventListener('click', handleTutorialClose);
    tutorialPrevBtn?.addEventListener('click', () => changeTutorialStep(-1));
    tutorialNextBtn?.addEventListener('click', () => changeTutorialStep(1));
    tutorialActionsBtn?.addEventListener('click', toggleActionPopover);
    tutorialActionSearch?.addEventListener('input', handleTutorialSearch);
    tutorialActionHeader?.addEventListener('pointerdown', startActionPopoverDrag);
    tutorialBubble?.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') {
            changeTutorialStep(1);
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            changeTutorialStep(-1);
            event.preventDefault();
        }
    });
    openAutoFaqBtn?.addEventListener('click', openAutoFaq);
    autoFaqCloseBtn?.addEventListener('click', closeAutoFaq);
    autoFaqEl?.addEventListener('click', event => {
        if (event.target === autoFaqEl) {
            closeAutoFaq();
        }
    });

    sidebarCollapseBtn?.addEventListener('click', () => setSidebarCollapsed(true));
    sidebarRevealBtn?.addEventListener('click', () => setSidebarCollapsed(false));
    openConfigLibraryBtn?.addEventListener('click', () => {
        openConfigLibrary();
    });
    configLibraryEl?.querySelectorAll('[data-action="close-config-library"]').forEach(element => {
        element.addEventListener('click', () => {
            closeConfigLibrary();
        });
    });
    configLibraryToggleBtn?.addEventListener('click', () => {
        openConfigLibrary();
    });
    configLibraryHeader?.addEventListener('pointerdown', startConfigLibraryDrag);

    variableBrowserCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeVariableBrowser();
        });
    });
    variableBrowserSearch?.addEventListener('input', handleVariableBrowserSearch);
    variableBrowserEl?.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeVariableBrowser();
        }
    });
    variableBrowserEl?.addEventListener('click', event => {
        if (event.target === variableBrowserEl) {
            closeVariableBrowser();
        }
    });

    window.addEventListener('resize', () => {
        if (configLibraryOpen && configLibraryPosition) {
            applyConfigLibraryPosition();
        }
    });

    if (typeof ResizeObserver === 'function' && configLibraryPanel instanceof HTMLElement) {
        const observer = new ResizeObserver(() => {
            if (configLibraryOpen && configLibraryPosition) {
                applyConfigLibraryPosition();
            }
        });
        observer.observe(configLibraryPanel);
    }

    coordinatePickerCanvas?.addEventListener('click', handlePickerCanvasClick);
    coordinatePickerApplyBtn?.addEventListener('click', applyCoordinateSelection);
    coordinatePickerCancelBtn?.addEventListener('click', () => closeCoordinatePicker());
    coordinatePickerCloseBtn?.addEventListener('click', () => closeCoordinatePicker());
    coordinatePickerBackdrop?.addEventListener('click', () => closeCoordinatePicker({ restoreFocus: true }));
    coordinatePickerResetBtn?.addEventListener('click', resetCoordinatePicker);
    coordinatePickerFileInput?.addEventListener('change', event => {
        const input = event.currentTarget;
        if (!(input instanceof HTMLInputElement) || !input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        importCoordinateTemplateFromFile(file).catch(error => {
            console.error('Unable to import template', error);
            window.alert(error?.message ?? 'Impossible d’importer le modèle.');
        });
    });
    coordinatePickerTemplateSelect?.addEventListener('change', event => {
        const select = event.currentTarget;
        if (!(select instanceof HTMLSelectElement)) {
            return;
        }
        const value = select.value;
        if (!value) {
            coordinatePickerState.pdfDoc = null;
            coordinatePickerState.templateId = '';
            coordinatePickerState.templateName = '';
            coordinatePickerState.fileName = '';
            coordinatePickerState.lastPick = null;
            coordinatePickerState.pendingPick = null;
            coordinatePickerState.viewport = null;
            coordinatePickerState.templateAssignments = [];
            coordinatePickerState.overlayMarkers = [];
            renderCoordinateOverlay();
            updateCoordinatePickerMarker();
            updateCoordinatePickerInfo();
            if (coordinatePickerEmpty) {
                coordinatePickerEmpty.hidden = false;
            }
            return;
        }
        const template = coordinateTemplateLibrary.find(item => item.id === value);
        if (!template) {
            return;
        }
        loadCoordinateTemplate(template).catch(error => {
            console.error('Unable to load template', error);
            window.alert(error?.message ?? 'Impossible de charger le modèle sélectionné.');
        });
    });
    coordinatePickerTemplateRefresh?.addEventListener('click', () => {
        ensureCoordinateTemplateLibrary(true).catch(error => {
            console.error('Unable to refresh templates', error);
            window.alert('Impossible de recharger la liste des modèles.');
        });
    });
    coordinatePickerPageInput?.addEventListener('change', event => {
        const input = event.currentTarget;
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        const value = Number.parseInt(input.value, 10);
        coordinatePickerState.currentPage = clampPage(value);
        renderCoordinatePickerPage({ preserveMarker: true });
    });
    coordinatePickerZoomInput?.addEventListener('input', event => {
        const input = event.currentTarget;
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        const value = Number.parseFloat(input.value);
        coordinatePickerState.scale = clampScale(value);
        renderCoordinatePickerPage({ preserveMarker: true });
    });

    classTitleInput?.addEventListener('input', () => {
        const hasTitle = classTitleInput.value?.trim();
        const hasCode = classCodeInput?.value?.trim();
        if (hasTitle && !hasCode) {
            ensureClassCodeGenerated({ markDirty: true });
        }
    });

    const watchFields = [classTitleInput, classCodeInput, classDescriptionInput];
    watchFields.forEach(input => {
        input?.addEventListener('input', markDirty);
    });

    window.addEventListener('beforeunload', event => {
        if (isDirty && !suppressDirtyWarning) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    window.addEventListener('resize', requestTutorialLayout);
    window.addEventListener('scroll', requestTutorialLayout, true);
    window.addEventListener('message', handleBuilderMessage);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (configLibraryOpen) {
                closeConfigLibrary();
                return;
            }
            if (coordinatePickerEl && !coordinatePickerEl.hidden) {
                closeCoordinatePicker();
                return;
            }
            if (tutorialActionPopover && !tutorialActionPopover.hidden) {
                closeActionPopover();
                return;
            }
            if (tutorialEl && !tutorialEl.hidden) {
                closeTutorial();
            }
            if (autoFaqEl && !autoFaqEl.hidden) {
                closeAutoFaq();
            }
        }
    });
    setActiveTab('questions');
    bindHoverHelps();
    setTabAvailability(false);
}

function openInitialClassFromQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
        if (activeDocumentId) {
            startNewClass();
        }
        return;
    }
    const target = params.get('class');
    if (target) {
        const questionClass = classes.find(item => item.id === target);
        if (questionClass) {
            const docId = questionClass.documentId ?? '';
            if (docId && docId !== activeDocumentId) {
                const template = templateLibrary.find(item => item.id === docId);
                if (template) {
                    setActiveDocument(template, { confirm: false, silent: true });
                }
            }
            if (!docId || docId === activeDocumentId) {
                openClassById(target);
            }
        }
    }
}

function init() {
    loadSidebarPreferences();
    bindEvents();
    Promise.all([ensureTemplateLibrary(), loadClasses()])
        .then(() => {
            applyInitialDocumentSelection();
            openInitialClassFromQuery();
        })
        .catch(error => {
            console.error('Initialisation partielle incomplète', error);
            applyInitialDocumentSelection();
        });
}

init();