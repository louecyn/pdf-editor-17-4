


import { createPdfEditor } from './pdf-editor.js';

const config = window.PDF_EDITOR_CONFIG || {};
const viewer = document.getElementById('pdf-viewer');
const fontSizeInput = document.getElementById('font-size');
const fontFamilyInput = document.getElementById('font-family');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const undoButton = document.getElementById('undo-action');
const redoButton = document.getElementById('redo-action');
const customersList = document.getElementById('customers');
const documentList = document.getElementById('document-list');
const documentChoicesList = documentList?.querySelector('[data-role="document-choices"]') ?? null;
const documentViewBody = documentList?.querySelector('[data-role="document-view-body"]') ?? null;
const documentViewModeButtons = {
    grid: documentList?.querySelector('[data-document-view="grid"]') ?? null,
    list: documentList?.querySelector('[data-document-view="list"]') ?? null,
};
const documentSortSelect = documentList?.querySelector('[data-role="document-sort"]') ?? null;
const documentClientTabs = document.getElementById('document-client-tabs');
const documentSearchInput = document.getElementById('document-search');
const searchInput = document.getElementById('customer-search');
const selectedSection = document.getElementById('selected-documents');
const selectedList = selectedSection?.querySelector('.selection-list');
const clearSelectionBtn = document.getElementById('clear-document-selection');
const toggleValuesBtn = document.getElementById('toggle-values');
const variablePanel = document.getElementById('variable-panel');
const collapseVariablesBtn = document.getElementById('collapse-variables');
const variableTemplate = document.getElementById('variable-item-template');
const selectedClientTemplate = document.getElementById('selected-client-template');
const selectedClientsBox = document.getElementById('selected-clients');
const selectedClientsList = selectedClientsBox?.querySelector('ul');
const clientVariableContainer = document.getElementById('client-variable-groups');
const workspaceTemplate = document.getElementById('workspace-template');
const adminVariableList = variablePanel?.querySelector('[data-group="admin"] .variable-list');
const floatingTools = document.getElementById('floating-tools');
const floatingAddText = document.getElementById('floating-add-text');
const floatingAddSignature = document.getElementById('floating-add-signature');
const floatingSignatureLibraryBtn = document.getElementById('floating-signature-library');
const floatingToggleValues = document.getElementById('floating-toggle-values');
const floatingPrevPage = document.getElementById('floating-prev-page');
const floatingNextPage = document.getElementById('floating-next-page');
const variableAccessButton = document.getElementById('open-variable-access');
const variableAccessShortcuts = document.getElementById('variable-access-shortcuts');
const variableAccessPopover = document.getElementById('variable-access-popover');
const variableAccessList = variableAccessPopover?.querySelector('[data-role="variable-access-list"]') ?? null;
const variableAccessEmpty = variableAccessPopover?.querySelector('[data-role="variable-access-empty"]') ?? null;
const variableAccessCloseButton = variableAccessPopover?.querySelector('[data-action="close-variable-access"]') ?? null;
const openSignatureLibraryBtn = document.getElementById('open-signature-library');
const saveDialog = document.getElementById('save-dialog');
const saveForm = document.getElementById('save-form');
const saveSummaryList = saveDialog?.querySelector('[data-role="document-summary"]') ?? null;
const saveExistingList = saveDialog?.querySelector('[data-role="existing-list"]') ?? null;
const saveExistingEmpty = saveDialog?.querySelector('[data-role="existing-empty"]') ?? null;
const saveClientList = saveDialog?.querySelector('[data-role="client-list"]') ?? null;
const saveProgressSection = saveDialog?.querySelector('[data-role="progress"]') ?? null;
const saveProgressBar = saveDialog?.querySelector('[data-role="progress-bar"]') ?? null;
const saveProgressLabel = saveDialog?.querySelector('[data-role="progress-label"]') ?? null;
const saveProgressMessage = saveDialog?.querySelector('[data-role="progress-message"]') ?? null;
const saveFeedback = saveDialog?.querySelector('[data-role="save-feedback"]') ?? null;
const saveSubmitButton = saveDialog?.querySelector('[data-role="submit"]') ?? null;
const saveCancelTargets = saveDialog ? saveDialog.querySelectorAll('[data-save-action="cancel"]') : [];
const saveFolderField = saveDialog?.querySelector('[data-role="save-folder-field"]') ?? null;
const saveFolderNameInput = saveFolderField?.querySelector('[data-role="save-folder-name"]') ?? null;
const dashboardModal = document.getElementById('dashboard-modal');
const dashboardMenu = dashboardModal?.querySelector('.dashboard-menu');
const dashboardSections = dashboardModal?.querySelectorAll('[data-dashboard-panel]');
const dashboardCloseTargets = dashboardModal?.querySelectorAll('[data-dashboard-action="close"]') ?? [];
const dashboardQuestionActionsBtn = dashboardModal?.querySelector('[data-dashboard-action="open-question-actions"]') ?? null;
const templateCardTemplate = document.getElementById('template-card-template');
function resolveTemplateSectionConfig(sectionId) {
    if (!sectionId || !dashboardModal) {
        return {
            list: null,
            empty: null,
            container: null,
            content: null,
            viewButtons: {},
            sortSelect: null,
            hideButton: null,
            showButton: null,
        };
    }
    const container = dashboardModal.querySelector(`.template-library[data-template-section="${sectionId}"]`);
    const list = container?.querySelector(`[data-template-role="${sectionId}-list"]`) ?? null;
    const empty = container?.querySelector(`[data-template-role="${sectionId}-empty"]`) ?? null;
    const content = container?.querySelector('[data-role="template-library-content"]') ?? null;
    const viewButtons = {
        grid: container?.querySelector('[data-template-view="grid"]') ?? null,
        list: container?.querySelector('[data-template-view="list"]') ?? null,
    };
    const sortSelect = container?.querySelector('[data-template-sort]') ?? null;
    return { list, empty, container, content, viewButtons, sortSelect };
}
const templateSections = {
    prefilled: resolveTemplateSectionConfig('prefilled'),
    fill: resolveTemplateSectionConfig('fill'),
    manage: resolveTemplateSectionConfig('manage'),
    edit: resolveTemplateSectionConfig('edit'),
};
const templateGenerateDialog = document.getElementById('template-generate-dialog');
const templateGenerateMessage = templateGenerateDialog?.querySelector('[data-role="template-generate-message"]') ?? null;
const templateGenerateSearch = templateGenerateDialog?.querySelector('[data-role="template-generate-search"]') ?? null;
const templateGenerateAvailableList = templateGenerateDialog?.querySelector('[data-role="template-generate-available"]') ?? null;
const templateGenerateAvailableEmpty = templateGenerateDialog?.querySelector('[data-role="template-generate-available-empty"]') ?? null;
const templateGenerateSelectedList = templateGenerateDialog?.querySelector('[data-role="template-generate-selected"]') ?? null;
const templateGenerateSelectedEmpty = templateGenerateDialog?.querySelector('[data-role="template-generate-selected-empty"]') ?? null;
const templateGenerateDestClientSelect = templateGenerateDialog?.querySelector('[data-role="template-generate-dest-client"]') ?? null;
const templateGenerateDestinations = templateGenerateDialog?.querySelector('[data-role="template-generate-destinations"]') ?? null;
const templateGenerateDownloadCheckbox = templateGenerateDialog?.querySelector('[data-role="template-generate-download"]') ?? null;
const templateGenerateFeedback = templateGenerateDialog?.querySelector('[data-role="template-generate-feedback"]') ?? null;
const templateGenerateSubmit = templateGenerateDialog?.querySelector('[data-template-generate-action="submit"]') ?? null;
const templateGenerateCancelTargets = templateGenerateDialog
    ? templateGenerateDialog.querySelectorAll('[data-template-generate-action="cancel"]')
    : [];
const templateGenerateQuestionSection = templateGenerateDialog?.querySelector('[data-role="template-generate-questions"]') ?? null;
const templateGenerateQuestionList = templateGenerateDialog?.querySelector('[data-role="template-generate-question-list"]') ?? null;
const templateGenerateQuestionEmpty = templateGenerateDialog?.querySelector('[data-role="template-generate-question-empty"]') ?? null;
const templateGenerateVerifySection = templateGenerateDialog?.querySelector('[data-role="template-generate-verify"]') ?? null;
const templateGenerateVerifyList = templateGenerateDialog?.querySelector('[data-role="template-generate-verify-list"]') ?? null;
const templateGenerateVerifyEmpty = templateGenerateDialog?.querySelector('[data-role="template-generate-verify-empty"]') ?? null;
const templateConflictBanner = templateGenerateDialog?.querySelector('[data-role="template-conflict-banner"]') ?? null;
const templateConflictTrigger = templateGenerateDialog?.querySelector('[data-role="template-conflict-trigger"]') ?? null;
const templateConflictPanel = templateGenerateDialog?.querySelector('[data-role="template-conflict-panel"]') ?? null;
const templateConflictList = templateConflictPanel?.querySelector('[data-role="template-conflict-list"]') ?? null;
const templateConflictClose = templateConflictPanel?.querySelector('[data-role="template-conflict-close"]') ?? null;
const templateConflictActions = templateConflictPanel
    ? templateConflictPanel.querySelectorAll('[data-role="template-conflict-action"]')
    : [];
const templateConflictMessage = templateConflictPanel?.querySelector('[data-role="template-conflict-message"]') ?? null;
const templateGenerateProgress = templateGenerateDialog?.querySelector('[data-role="template-generate-progress"]') ?? null;
const templateGenerateProgressBar = templateGenerateDialog?.querySelector('[data-role="template-generate-progress-bar"]') ?? null;
const templateGenerateProgressLabel = templateGenerateDialog?.querySelector('[data-role="template-generate-progress-label"]') ?? null;
const templateGenerateProgressMessage = templateGenerateDialog?.querySelector('[data-role="template-generate-progress-message"]') ?? null;
const templateGenerateFolderField = templateGenerateDialog?.querySelector('[data-role="template-destination-folder"]') ?? null;
const templateGenerateFolderInput = templateGenerateFolderField?.querySelector('[data-role="template-folder-name"]') ?? null;
const profileForm = document.getElementById('profile-form');
const variableConfigSection = dashboardModal?.querySelector('[data-dashboard-panel="config"]') ?? null;
const variableConfigList = variableConfigSection?.querySelector('[data-role="variable-config-list"]') ?? null;
const variableConfigEmpty = variableConfigSection?.querySelector('[data-role="variable-config-empty"]') ?? null;
const variableConfigSearch = variableConfigSection?.querySelector('[data-role="variable-config-search"]') ?? null;
const variableConfigAddButton = variableConfigSection?.querySelector('[data-role="variable-config-add"]') ?? null;
const variableConfigDialog = dashboardModal?.querySelector('#variable-config-dialog') ?? null;
const variableConfigForm = document.getElementById('variable-config-form');
const variableConfigCancel = variableConfigForm?.querySelector('[data-action="cancel-variable-config"]') ?? null;
const variableConfigKeyInput = variableConfigForm?.querySelector('input[name="key"]') ?? null;
const variableConfigLabelInput = variableConfigForm?.querySelector('input[name="label"]') ?? null;
const variableConfigGroupSelect = variableConfigForm?.querySelector('select[name="groupId"]') ?? null;
const variableConfigDefaultValueInput = variableConfigForm?.querySelector('input[name="defaultValue"]') ?? null;
const variableConfigHelpButton = variableConfigForm?.querySelector('[data-role="variable-config-help"]') ?? null;
const variableConfigInstructionsClose = variableConfigForm?.querySelector('[data-role="variable-config-instructions-close"]') ?? null;
const variableConfigInstructions = variableConfigDialog?.querySelector('[data-role="variable-config-instructions"]') ?? null;
const variableConfigError = variableConfigForm?.querySelector('[data-role="form-error"]') ?? null;
const folderBrowserContainer = document.getElementById('folder-browser');
const folderBrowserTree = folderBrowserContainer?.querySelector('[data-folder-role="tree"]') ?? null;
const folderBrowserEntries = folderBrowserContainer?.querySelector('[data-folder-role="entries"]') ?? null;
const folderBrowserSelection = folderBrowserContainer?.querySelector('[data-folder-role="selection"]') ?? null;
const folderBrowserSubmit = folderBrowserContainer?.querySelector('[data-folder-action="submit"]') ?? null;
const folderBrowserCancel = folderBrowserContainer?.querySelector('[data-folder-action="cancel"]') ?? null;
const folderBrowserCloseTargets = folderBrowserContainer
    ? folderBrowserContainer.querySelectorAll('[data-folder-action="close"]')
    : [];
const folderBrowserReset = folderBrowserContainer?.querySelector('[data-folder-action="reset"]') ?? null;
const folderBrowserTitle = folderBrowserContainer?.querySelector('#folder-browser-title') ?? null;
const folderBrowserCurrent = folderBrowserContainer?.querySelector('[data-folder-role="current-folder"]') ?? null;
const folderBrowserHint = folderBrowserContainer?.querySelector('[data-folder-role="folder-hint"]') ?? null;
const templateEditTrigger = dashboardModal?.querySelector('[data-template-edit-action="open"]') ?? null;
const templateEditPicker = document.getElementById('template-edit-picker');
const templateEditBackdrop = templateEditPicker?.querySelector('.template-edit-picker__backdrop') ?? null;
const templateEditCloseButtons = templateEditPicker ? templateEditPicker.querySelectorAll('[data-template-edit-action="close"]') : [];
const templateEditViewButtons = {
    grid: templateEditPicker?.querySelector('[data-template-edit-view="grid"]') ?? null,
    list: templateEditPicker?.querySelector('[data-template-edit-view="list"]') ?? null,
};
const templateEditGridList = templateEditPicker?.querySelector('[data-template-edit-role="grid-list"]') ?? null;
const templateEditListView = templateEditPicker?.querySelector('[data-template-edit-role="list-view"]') ?? null;
const templateEditEmptyState = templateEditPicker?.querySelector('[data-template-edit-role="empty"]') ?? null;
const templateEditSortSelect = templateEditPicker?.querySelector('[data-template-edit-role="sort"]') ?? null;
const toastContainer = document.getElementById('toast-container');

const selectedDocuments = [];
const documentDrafts = new Map();
const selectedClients = new Map();
const workspaces = new Map();
const documentCache = new Map();
const folderTrees = new Map();
const PINNED_STORAGE_KEY = 'pdfEditor.pinnedFolders';
let pinnedFolders = loadPinnedFolders();
const VARIABLE_ACCESS_STORAGE_KEY = 'pdfEditor.variableAccess.classes';
let variableAccessSelections = loadVariableAccessSelections();
const templatePreviewCache = new Map();
const templatePreviewPromises = new Map();
let clientCatalog = [];
let activeDocKey = null;
let activeRequestId = null;

const VARIABLE_CONTAINER_SEGMENTS = new Set([
    'form',
    'form_data',
    'formdata',
    'data',
    'details',
    'information',
    'informations',
    'infos',
    'info',
]);
const HIDDEN_CLIENT_REQUEST_KEY_SET = new Set([
    'bilan_documents_rassembles',
    'bilan_offre_preexistante',
    'bilan_offre',
    'bilan_importance',
    'bilan_process',
    'assurance_vie_conseiller',
    'assurance_habitation_courtier',
    'snapshot_consent',
    'snapshot_snapshot_consent',
]
    .map(key => canonicalizeVariableKey(key))
    .filter(Boolean));
const OPTIONAL_CLIENT_EXCLUDED_KEY_SET = new Set([
    'documents_required',
    'snapshot_consent',
    'snapshot_snapshot_consent',
]
    .map(key => canonicalizeVariableKey(key))
    .filter(Boolean));
const DOCUMENTS_REQUIRED_CANONICAL_PREFIX = 'documents_required';
const OPTIONAL_FIELD_LABEL_CUSTOMIZATIONS = Object.freeze([
    {
        match: canonical => typeof canonical === 'string' && canonical.includes('job_field_experience'),
        transform: label => {
            const target = "Job Années d'expérience";
            if (typeof label === 'string' && label.includes('Job Field Experience')) {
                return label.replace('Job Field Experience', target);
            }
            if (typeof label === 'string' && label.includes("Années d'expérience")) {
                return label;
            }
            return `Job — ${target}`;
        },
    },
    {
        match: canonical => typeof canonical === 'string' && canonical.includes('revenus_checkbox'),
        transform: label => {
            if (typeof label !== 'string' || !label.trim()) {
                return 'Type de revenu';
            }
            if (label.trim() === '0') {
                return 'Type de revenu';
            }
            const replaced = label.replace(/\b0\b/u, 'Type de revenu');
            if (replaced !== label) {
                return replaced;
            }
            return label.replace('0', 'Type de revenu');
        },
    },
]);

function formatFileSize(bytes) {
    if (bytes === null || bytes === undefined) {
        return '';
    }
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) {
        return '';
    }
    const units = [
        { threshold: 1024 ** 4, suffix: 'To' },
        { threshold: 1024 ** 3, suffix: 'Go' },
        { threshold: 1024 ** 2, suffix: 'Mo' },
        { threshold: 1024, suffix: 'Ko' },
    ];
    for (const { threshold, suffix } of units) {
        if (value >= threshold) {
            const scaled = value / threshold;
            const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
            return `${rounded.toString().replace('.', ',')} ${suffix}`;
        }
    }
    const roundedBytes = Math.max(1, Math.round(value));
    return `${roundedBytes} o`;
}

function formatDetailTimestamp(input) {
    if (!input) {
        return null;
    }
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const label = `${year}-${month}-${day} ${hours}:${minutes}`;
    return { iso: date.toISOString(), label };
}

function buildFileDetailContent({ iconText = 'PDF', name = 'Document', updatedAt = null, size = null } = {}) {
    const wrapper = document.createElement('span');
    wrapper.className = 'detail-entry';

    const icon = document.createElement('span');
    icon.className = 'detail-entry__icon';
    icon.textContent = iconText;
    icon.setAttribute('aria-hidden', 'true');

    const body = document.createElement('span');
    body.className = 'detail-entry__body';

    const title = document.createElement('span');
    title.className = 'detail-entry__name';
    title.textContent = name ?? 'Document';
    body.appendChild(title);

    const meta = document.createElement('span');
    meta.className = 'detail-entry__meta';
    const dateInfo = formatDetailTimestamp(updatedAt);
    if (dateInfo) {
        const timeEl = document.createElement('time');
        timeEl.className = 'detail-entry__date';
        timeEl.dateTime = dateInfo.iso;
        timeEl.textContent = dateInfo.label;
        meta.appendChild(timeEl);
    }
    const sizeLabel = formatFileSize(size);
    if (sizeLabel) {
        const sizeEl = document.createElement('span');
        sizeEl.className = 'detail-entry__size';
        sizeEl.textContent = sizeLabel;
        meta.appendChild(sizeEl);
    }
    if (meta.childElementCount > 0) {
        body.appendChild(meta);
    }

    wrapper.append(icon, body);
    return wrapper;
}

function normalizeSortMode(value) {
    return value === 'alpha' ? 'alpha' : 'date';
}

function toTimestamp(input) {
    if (!input) {
        return 0;
    }
    if (input instanceof Date) {
        const time = input.getTime();
        return Number.isFinite(time) ? time : 0;
    }
    const date = new Date(input);
    const time = date.getTime();
    return Number.isFinite(time) ? time : 0;
}

function getItemTimestamp(item) {
    if (!item || typeof item !== 'object') {
        return 0;
    }
    const keys = ['modifiedAt', 'updatedAt', 'createdAt', 'timestamp', 'date'];
    for (const key of keys) {
        const value = item[key];
        const stamp = toTimestamp(value);
        if (stamp) {
            return stamp;
        }
    }
    return 0;
}

function getItemName(item) {
    if (!item || typeof item !== 'object') {
        return '';
    }
    const candidates = [item.name, item.title, item.displayName, item.id];
    for (const candidate of candidates) {
        if (candidate) {
            return String(candidate).trim();
        }
    }
    return '';
}

function compareItems(a, b, mode = 'date') {
    const normalized = normalizeSortMode(mode);
    if (normalized === 'alpha') {
        const nameDiff = getItemName(a).localeCompare(getItemName(b), 'fr', { sensitivity: 'base' });
        if (nameDiff !== 0) {
            return nameDiff;
        }
        const dateDiff = getItemTimestamp(b) - getItemTimestamp(a);
        if (dateDiff !== 0) {
            return dateDiff;
        }
        return (String(a?.id ?? '')).localeCompare(String(b?.id ?? ''), 'fr', { sensitivity: 'base' });
    }
    const diff = getItemTimestamp(b) - getItemTimestamp(a);
    if (diff !== 0) {
        return diff;
    }
    return getItemName(a).localeCompare(getItemName(b), 'fr', { sensitivity: 'base' });
}

function sortItems(list, mode = 'date') {
    return Array.from(list ?? []).sort((a, b) => compareItems(a, b, mode));
}
let lastDocumentsRequestId = null;
let variableDefinitions = { groups: [] };
let adminProfile = {};
let templateLibrary = [];
let templateLibraryLoaded = false;
let navUpdateQueued = false;
let templateGenerationTemplate = null;
let templateGenerationMaxClients = 1;
let templateGenerationSelectedClients = [];
let templateGenerationDestinationsMap = new Map();
let templateGenerationDestClientId = null;
let templateGenerationSubmitting = false;
let templateGenerationSearchTerm = '';
let templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
let templateGenerationCustomFolderName = '';
let questionClassCatalog = [];
let questionClassCatalogLoaded = false;
let questionClassCatalogPromise = null;
let templateGenerationQuestionGroups = [];
let templateGenerationQuestionIndex = new Map();
let templateGenerationHiddenQuestionEntries = [];
let templateGenerationAnswers = new Map();
let savedResponseLibraries = new Map();
let savedResponseLibrariesLoaded = false;
let savedResponseLibrariesPromise = null;
let templateGenerationVerifyFields = [];
const templateGenerationClientData = new Map();
const templateGenerationClientPromises = new Map();
const templateGenerationVerifyValues = new Map();
const templateGenerationSharedVerifyValues = new Map();
const templateGenerationVerifyLoading = new Set();
let templateGenerationConflicts = new Map();
let templateConflictSelections = new Map();
let templateGenerationConflictResolutions = new Map();
let templateConflictPanelMode = { type: 'global', clientId: null };
let templateEditViewMode = 'grid';
let documentListViewMode = documentList?.dataset.viewMode === 'grid' ? 'grid' : 'list';
let documentListSortMode = normalizeSortMode(documentSortSelect?.value);
const templateLibraryViewModes = new Map();
const templateLibrarySortModes = new Map();
let templateGenerationProgressTimer = null;
let templateGenerationProgressValue = 0;
let saveDialogFolderName = '';
let templateEditSortMode = normalizeSortMode(templateEditSortSelect?.value);
const VARIABLE_GROUP_LABELS = {
    admin: 'Mes coordonnées',
    fused: 'Dossier général',
    request: 'Fiche client',
};
const baseEditorConfig = {
    fontSize: Number(fontSizeInput.value),
    fontFamily: fontFamilyInput.value,
};
const globalFeedback = (() => {
    const el = document.createElement('div');
    el.className = 'editor-feedback global-feedback';
    el.setAttribute('aria-live', 'polite');
    el.hidden = true;
    document.body.appendChild(el);
    return el;
})();

async function ensureSavedResponseLibraries(force = false) {
    if (force) {
        savedResponseLibrariesLoaded = false;
        savedResponseLibrariesPromise = null;
    }
    if (savedResponseLibrariesLoaded && !force) {
        return savedResponseLibraries;
    }
    if (!savedResponseLibrariesPromise) {
        const url = `${config.apiBaseUrl}?action=listSavedResponseLibraries`;
        savedResponseLibrariesPromise = fetch(url, { cache: 'no-cache' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Réponse invalide du serveur');
                }
                return response.json();
            })
            .then(body => {
                const libraries = body?.data?.libraries ?? body?.libraries ?? {};
                savedResponseLibraries = new Map();
                if (libraries && typeof libraries === 'object') {
                    Object.entries(libraries).forEach(([key, value]) => {
                        if (typeof key !== 'string' || !value || typeof value !== 'object') {
                            return;
                        }
                        const entries = Array.isArray(value.entries) ? value.entries : [];
                        savedResponseLibraries.set(key, {
                            entries: entries
                                .filter(entry => entry && typeof entry === 'object')
                                .map(entry => ({
                                    id: typeof entry.id === 'string' ? entry.id : '',
                                    label: typeof entry.label === 'string' ? entry.label : '',
                                    value: typeof entry.value === 'string' ? entry.value : '',
                                })),
                        });
                    });
                }
                savedResponseLibrariesLoaded = true;
                return savedResponseLibraries;
            })
            .catch(error => {
                savedResponseLibrariesLoaded = false;
                savedResponseLibrariesPromise = null;
                throw error;
            });
    }
    try {
        const libraries = await savedResponseLibrariesPromise;
        savedResponseLibrariesPromise = null;
        return libraries;
    } catch (error) {
        throw error;
    }
}

function getSavedResponseEntries(libraryKey, defaults = []) {
    const entries = [];
    const defaultsList = Array.isArray(defaults) ? defaults : [];
    defaultsList.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            return;
        }
        const value = typeof item.value === 'string' ? item.value : '';
        const label = typeof item.label === 'string' && item.label ? item.label : value;
        if (!label && !value) {
            return;
        }
        entries.push({
            id: `default-${libraryKey}-${index}`,
            label,
            value,
            origin: 'default',
        });
    });
    const library = savedResponseLibraries.get(libraryKey);
    if (library && Array.isArray(library.entries)) {
        library.entries.forEach(item => {
            if (!item || typeof item !== 'object') {
                return;
            }
            const value = typeof item.value === 'string' ? item.value : '';
            const label = typeof item.label === 'string' && item.label ? item.label : value;
            const id = typeof item.id === 'string' ? item.id : '';
            if (!label && !value) {
                return;
            }
            entries.push({
                id: id || `saved-${libraryKey}-${entries.length}`,
                label,
                value,
                origin: 'saved',
            });
        });
    }
    return entries;
}

async function saveSavedResponseEntry(libraryKey, entry) {
    const url = `${config.apiBaseUrl}?action=saveSavedResponseEntry`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryKey, entry }),
    });
    if (!response.ok) {
        throw new Error('Impossible d’enregistrer la réponse.');
    }
    const body = await response.json();
    const saved = body?.data?.entry ?? body?.entry ?? null;
    if (!saved || typeof saved !== 'object') {
        throw new Error('Réponse inattendue du serveur.');
    }
    await ensureSavedResponseLibraries();
    const library = savedResponseLibraries.get(libraryKey) ?? { entries: [] };
    const sanitized = {
        id: typeof saved.id === 'string' ? saved.id : '',
        label: typeof saved.label === 'string' ? saved.label : '',
        value: typeof saved.value === 'string' ? saved.value : '',
    };
    const entries = Array.isArray(library.entries) ? library.entries.slice() : [];
    entries.push(sanitized);
    savedResponseLibraries.set(libraryKey, { entries });
    return sanitized;
}

function slugifyCategoryId(value) {
    if (typeof value !== 'string') {
        return '';
    }
    let normalized = value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    normalized = normalized.replace(/[^A-Za-z0-9]+/g, '_');
    normalized = normalized.replace(/^_+|_+$/g, '');
    normalized = normalized.replace(/_{2,}/g, '_');
    return normalized.toLowerCase();
}

function normalizeQuestionCategories(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return [];
    }
    const rawCategories = Array.isArray(metadata.categories) ? metadata.categories : [];
    const seen = new Set();
    const result = [];
    rawCategories.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            return;
        }
        const label = typeof item.label === 'string' ? item.label.trim() : '';
        const description = typeof item.description === 'string' ? item.description.trim() : '';
        let id = typeof item.id === 'string' ? item.id.trim() : '';
        if (id) {
            id = slugifyCategoryId(id);
        }
        if (!id) {
            id = slugifyCategoryId(label);
        }
        if (!id) {
            id = `categorie_${index + 1}`;
        }
        let candidate = id;
        let suffix = 2;
        while (seen.has(candidate)) {
            candidate = `${id}_${suffix++}`;
        }
        id = candidate;
        seen.add(id);
        const coordinates = Array.isArray(item.coordinates)
            ? item.coordinates.map(coord => (typeof coord === 'string' ? coord.trim() : '')).filter(Boolean)
            : [];
        result.push({
            id,
            label: label || id,
            description,
            coordinates,
        });
    });
    return result;
}

function findCategoryById(categories, id) {
    if (!Array.isArray(categories) || !categories.length || !id) {
        return null;
    }
    return categories.find(category => category.id === id) ?? null;
}

function openQuestionActionManager(options = {}) {
    const url = new URL('question_actions_manager.php', window.location.href);
    if (options.classId) {
        url.searchParams.set('class', options.classId);
    }
    if (options.createNew) {
        url.searchParams.set('new', '1');
    }
    const features = 'width=1200,height=860,scrollbars=yes,resizable=yes';
    window.open(url.toString(), 'questionActionsManager', features);
}

function normalizeGroupId(groupId) {
    if (!groupId) {
        return '';
    }
    const value = String(groupId).trim().toLowerCase();
    switch (value) {
        case 'fiche':
        case 'fiche_client':
        case 'client':
        case 'request':
            return 'request';
        case 'dossier':
        case 'general':
        case 'dossier_general':
        case 'fused':
            return 'fused';
        case 'mes':
        case 'coordonnees':
        case 'mes_coordonnees':
        case 'admin':
            return 'admin';
        default:
            return value;
    }
}

function getGroupLabel(groupId) {
    if (!groupId) {
        return '';
    }
    return VARIABLE_GROUP_LABELS[groupId] ?? groupId;
}

function normalizeQuestionOption(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label && !id) {
        return null;
    }
    let value = raw.value;
    if (typeof value === 'string') {
        value = value.trim();
    } else if (value !== null && value !== undefined) {
        value = String(value);
    } else {
        value = '';
    }
    return {
        id,
        label,
        value,
        coordinate: typeof raw.coordinate === 'string' ? raw.coordinate.trim() : '',
        required: raw.required === true,
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeQuestion(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label || !id) {
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
            source: typeof auto.source === 'string' ? auto.source.trim().toLowerCase() : '',
            path: typeof auto.path === 'string' ? auto.path : '',
            fallback: typeof auto.fallback === 'string' ? auto.fallback : '',
        },
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
    };
}

function normalizeAutoSelection(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) {
        return null;
    }
    const requestPath = typeof raw.requestPath === 'string' ? raw.requestPath.trim() : '';
    const conditionTypeRaw = typeof raw.conditionType === 'string' ? raw.conditionType.trim().toLowerCase() : 'contains';
    const allowedConditions = ['contains', 'not_contains', 'equals', 'not_equals', 'empty', 'not_empty'];
    const conditionType = allowedConditions.includes(conditionTypeRaw) ? conditionTypeRaw : 'contains';
    let conditionTerms = [];
    if (Array.isArray(raw.conditionTerms)) {
        conditionTerms = raw.conditionTerms.map(item => String(item ?? '').trim()).filter(Boolean);
    } else if (typeof raw.conditionTerms === 'string') {
        conditionTerms = raw.conditionTerms.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
    }
    const valueSourceRaw = typeof raw.valueSource === 'string' ? raw.valueSource.trim().toLowerCase() : 'request';
    const allowedValueSources = ['request', 'literal', 'dot', 'checkmark'];
    const valueSource = allowedValueSources.includes(valueSourceRaw) ? valueSourceRaw : 'request';
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
        responseBlobs: Array.isArray(raw.responseBlobs) ? raw.responseBlobs : [],
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

function normalizeCommonGroup(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function metadataIndicatesCommon(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return false;
    }
    if (metadata.common === true || metadata.fused === true) {
        return true;
    }
    const keys = ['group', 'targetGroup', 'valueGroup', 'dataset', 'target', 'scope'];
    for (const key of keys) {
        const entry = metadata[key];
        if (typeof entry === 'string' && isCommonGroup(entry)) {
            return true;
        }
        if (Array.isArray(entry) && entry.some(item => typeof item === 'string' && isCommonGroup(item))) {
            return true;
        }
    }
    if (Array.isArray(metadata.groups) && metadata.groups.some(item => typeof item === 'string' && isCommonGroup(item))) {
        return true;
    }
    return false;
}

function isCommonGroup(value) {
    const normalized = normalizeCommonGroup(value);
    return ['fused', 'dossier_general', 'common', 'common_values', 'valeurs_communes', 'shared'].includes(normalized);
}

function questionTargetsCommonGroup(classData, assignment, question) {
    if (metadataIndicatesCommon(assignment?.metadata)) {
        return 'fused';
    }
    if (metadataIndicatesCommon(classData?.metadata)) {
        return 'fused';
    }
    if (metadataIndicatesCommon(question?.metadata)) {
        return 'fused';
    }
    const autoSource = typeof question?.auto?.source === 'string' ? question.auto.source.toLowerCase() : '';
    if (isCommonGroup(autoSource)) {
        return 'fused';
    }
    return '';
}

function resolveQuestionTargetKey(classData, assignment, question) {
    const sources = [assignment?.metadata, classData?.metadata, question?.metadata];
    const keyNames = ['targetKey', 'variableKey', 'valueKey', 'key', 'fusedKey', 'dataKey'];
    for (const source of sources) {
        if (!source || typeof source !== 'object') {
            continue;
        }
        for (const key of keyNames) {
            const candidate = source[key];
            if (typeof candidate === 'string' && candidate.trim()) {
                return candidate.trim();
            }
        }
        if (Array.isArray(source.targetKeys)) {
            const match = source.targetKeys.find(item => typeof item === 'string' && item.trim());
            if (match) {
                return match.trim();
            }
        }
    }
    if (question?.auto && typeof question.auto === 'object') {
        const autoPaths = [question.auto.path, question.auto.valuePath, question.auto.requestPath];
        for (const candidate of autoPaths) {
            if (typeof candidate !== 'string') {
                continue;
            }
            const trimmed = candidate.trim();
            if (!trimmed) {
                continue;
            }
            const segments = trimmed.split(/[.\[\]]+/).filter(Boolean);
            if (segments.length) {
                const lastSegment = segments[segments.length - 1].trim();
                if (lastSegment) {
                    return lastSegment;
                }
            }
        }
    }
    if (typeof question.code === 'string' && question.code.trim()) {
        return question.code.trim();
    }
    return '';
}

async function loadQuestionClassCatalog(force = false) {
    if (questionClassCatalogLoaded && !force) {
        return questionClassCatalog;
    }
    const response = await fetch(`${config.apiBaseUrl}?action=listQuestionClasses`, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error('Réponse invalide');
    }
    const payload = await response.json();
    questionClassCatalog = Array.isArray(payload.data?.classes)
        ? payload.data.classes.map(normalizeQuestionClass).filter(Boolean)
        : [];
    questionClassCatalogLoaded = true;
    return questionClassCatalog;
}

async function ensureQuestionClassCatalog(force = false) {
    if (force) {
        questionClassCatalogLoaded = false;
        questionClassCatalogPromise = null;
    }
    if (questionClassCatalogLoaded && !force) {
        return questionClassCatalog;
    }
    if (!questionClassCatalogPromise) {
        questionClassCatalogPromise = loadQuestionClassCatalog(force).catch(error => {
            questionClassCatalogLoaded = false;
            questionClassCatalog = [];
            questionClassCatalogPromise = null;
            throw error;
        });
    }
    try {
        return await questionClassCatalogPromise;
    } finally {
        questionClassCatalogPromise = null;
    }
}

function slugify(text) {
    if (!text) {
        return '';
    }
    let normalized = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    normalized = normalized.toLowerCase();
    normalized = normalized.replace(/[^a-z0-9]+/g, '_');
    normalized = normalized.replace(/^_+|_+$/g, '');
    normalized = normalized.replace(/_{2,}/g, '_');
    return normalized;
}

function generateVariableKey(label) {
    const slug = slugify(label);
    if (slug) {
        return slug;
    }
    const timestamp = Date.now().toString(36);
    return `valeur_${timestamp}`;
}

function setVariableConfigError(message = '') {
    if (!variableConfigError) {
        return;
    }
    if (!message) {
        variableConfigError.textContent = '';
        variableConfigError.hidden = true;
        return;
    }
    variableConfigError.textContent = message;
    variableConfigError.hidden = false;
}

function toggleVariableConfigInstructions(expanded) {
    if (!variableConfigHelpButton || !variableConfigInstructions) {
        return;
    }
    const shouldShow = expanded ?? variableConfigHelpButton.getAttribute('aria-expanded') !== 'true';
    variableConfigHelpButton.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
    variableConfigInstructions.hidden = !shouldShow;
    if (shouldShow && variableConfigInstructions instanceof HTMLElement) {
        if (!variableConfigInstructions.hasAttribute('tabindex')) {
            variableConfigInstructions.setAttribute('tabindex', '-1');
        }
        const scrollable = variableConfigInstructions.querySelector('.variable-config-instructions-body');
        if (scrollable instanceof HTMLElement) {
            scrollable.scrollTop = 0;
        }
        variableConfigInstructions.focus();
    }
}

function loadPinnedFolders() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(PINNED_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.warn('Impossible de charger les dossiers épinglés.', error);
        return {};
    }
}

function savePinnedFolders() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    try {
        window.localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedFolders));
    } catch (error) {
        console.warn('Impossible de sauvegarder les dossiers épinglés.', error);
    }
}

function loadVariableAccessSelections() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(VARIABLE_ACCESS_STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map(item => String(item).trim()).filter(Boolean);
    } catch (error) {
        console.warn('Impossible de charger les classes de variables favorites.', error);
        return [];
    }
}

function saveVariableAccessSelections() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    try {
        window.localStorage.setItem(VARIABLE_ACCESS_STORAGE_KEY, JSON.stringify(variableAccessSelections));
    } catch (error) {
        console.warn('Impossible de sauvegarder les classes de variables favorites.', error);
    }
}

function getPinnedFolderPaths(requestId) {
    if (!requestId || !pinnedFolders?.[requestId]) {
        return [];
    }
    return Object.keys(pinnedFolders[requestId]);
}

function isFolderPinned(requestId, folderPath) {
    if (!requestId || folderPath === undefined || folderPath === null) {
        return false;
    }
    return Boolean(pinnedFolders?.[requestId]?.[folderPath]);
}

function setFolderPinned(requestId, folderPath, pinned) {
    if (!requestId || folderPath === undefined || folderPath === null) {
        return;
    }
    pinnedFolders[requestId] ??= {};
    if (pinned) {
        pinnedFolders[requestId][folderPath] = true;
    } else {
        delete pinnedFolders[requestId][folderPath];
        if (Object.keys(pinnedFolders[requestId]).length === 0) {
            delete pinnedFolders[requestId];
        }
    }
    savePinnedFolders();
}

function normalizeDocumentRelativePath(doc, requestId) {
    const raw = typeof doc?.relativePath === 'string' ? doc.relativePath : '';
    if (!raw) {
        return doc?.name ?? '';
    }
    const prefix = `data/requests/${requestId}/`;
    if (raw.startsWith(prefix)) {
        return raw.slice(prefix.length);
    }
    const fallbackPrefix = 'data/requests/';
    if (raw.startsWith(fallbackPrefix)) {
        const parts = raw.split('/');
        return parts.slice(2).join('/');
    }
    return raw;
}

function buildFolderTreeFromDocuments(requestId, documents = []) {
    const FILE_PREFIX = '__file__:';
    const createDirectoryNode = (name, path, parent = null) => ({
        type: 'directory',
        name,
        displayName: name,
        path,
        parent,
        children: new Map(),
    });

    const rootName = resolveClientLabel(requestId) || requestId;
    const root = createDirectoryNode(rootName, '/');

    for (const doc of documents) {
        const relative = normalizeDocumentRelativePath(doc, requestId);
        const segments = relative.split('/').filter(Boolean);
        const fileName = segments.length ? segments[segments.length - 1] : doc.name;
        let current = root;
        for (let i = 0; i < Math.max(segments.length - 1, 0); i += 1) {
            const segment = segments[i];
            const nextPath = current.path === '/' ? segment : `${current.path}/${segment}`;
            if (!current.children.has(segment)) {
                const node = createDirectoryNode(segment, nextPath, current);
                current.children.set(segment, node);
            }
            current = current.children.get(segment);
        }
        if (!fileName) {
            continue;
        }
        const key = `${FILE_PREFIX}${doc.relativePath ?? `${requestId}/${fileName}`}`;
        current.children.set(key, {
            type: 'file',
            name: fileName,
            displayName: doc.name ?? fileName,
            path: doc.relativePath ?? fileName,
            parent: current,
            document: doc,
        });
    }

    return root;
}

function ensureFolderTree(requestId) {
    if (!requestId) {
        return null;
    }
    if (folderTrees.has(requestId)) {
        return folderTrees.get(requestId);
    }
    const documents = documentCache.get(requestId) ?? [];
    const tree = buildFolderTreeFromDocuments(requestId, documents);
    folderTrees.set(requestId, tree);
    return tree;
}

function refreshFolderTree(requestId) {
    if (!requestId) {
        return;
    }
    folderTrees.delete(requestId);
    ensureFolderTree(requestId);
}

function getSortedChildren(node) {
    if (!node || node.type !== 'directory') {
        return [];
    }
    const directories = [];
    const files = [];
    node.children.forEach(child => {
        if (child.type === 'directory') {
            directories.push(child);
        } else if (child.type === 'file') {
            files.push(child);
        }
    });
    directories.sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr')); 
    files.sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr'));
    return [...directories, ...files];
}

function findFolderNode(tree, folderPath) {
    if (!tree || tree.type !== 'directory') {
        return null;
    }
    if (!folderPath || folderPath === '/') {
        return tree;
    }
    const segments = folderPath.split('/').filter(Boolean);
    let current = tree;
    for (const segment of segments) {
        const next = current.children.get(segment);
        if (!next || next.type !== 'directory') {
            return null;
        }
        current = next;
    }
    return current;
}

function collectFolderFiles(node, accumulator = []) {
    if (!node) {
        return accumulator;
    }
    if (node.type === 'file' && node.document) {
        accumulator.push(node.document);
        return accumulator;
    }
    if (node.type === 'directory') {
        node.children.forEach(child => collectFolderFiles(child, accumulator));
    }
    return accumulator;
}

async function getTemplatePreviewImage(template) {
    const key = template.id;
    if (templatePreviewCache.has(key)) {
        return templatePreviewCache.get(key);
    }
    if (templatePreviewPromises.has(key)) {
        return templatePreviewPromises.get(key);
    }
    const task = (async () => {
        if (!window.pdfjsLib) {
            return '';
        }
        try {
            const loadingTask = window.pdfjsLib.getDocument({ url: template.publicPath, withCredentials: false });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const targetHeight = 220;
            const scale = Math.min(1.4, targetHeight / viewport.height);
            const scaledViewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            templatePreviewCache.set(key, dataUrl);
            return dataUrl;
        } catch (error) {
            console.error('Impossible de générer la prévisualisation du modèle.', error);
            templatePreviewCache.set(key, '');
            return '';
        } finally {
            templatePreviewPromises.delete(key);
        }
    })();
    templatePreviewPromises.set(key, task);
    return task;
}

function createTemplateCardElement(template, action) {
    if (!templateCardTemplate) {
        const li = document.createElement('li');
        li.textContent = template.name;
        return li;
    }
    const node = templateCardTemplate.content.firstElementChild.cloneNode(true);
    const button = node.querySelector('.template-card-button');
    const caption = node.querySelector('figcaption');
    const nameTarget = node.querySelector('.template-card-name');
    const metaTarget = node.querySelector('.template-card-meta');
    const updatedTarget = node.querySelector('.template-card-updated');
    const sizeTarget = node.querySelector('.template-card-size');
    const img = node.querySelector('img');
    const actionsContainer = node.querySelector('[data-role="template-card-actions"]');
    const displayName = template.name ?? template.id ?? 'Document';
    if (nameTarget) {
        nameTarget.textContent = displayName;
    } else if (caption) {
        caption.textContent = displayName;
    }
    const updatedInfo = formatDetailTimestamp(template.updatedAt ?? template.createdAt ?? null);
    if (updatedTarget) {
        if (updatedInfo) {
            updatedTarget.dateTime = updatedInfo.iso;
            updatedTarget.textContent = updatedInfo.label;
            updatedTarget.hidden = false;
        } else {
            updatedTarget.textContent = '';
            updatedTarget.hidden = true;
        }
    }
    const sizeLabel = formatFileSize(template.size ?? null);
    if (sizeTarget) {
        if (sizeLabel) {
            sizeTarget.textContent = sizeLabel;
            sizeTarget.hidden = false;
        } else {
            sizeTarget.textContent = '';
            sizeTarget.hidden = true;
        }
    }
    if (metaTarget) {
        const hasMeta = Boolean(
            (updatedInfo && updatedTarget && !updatedTarget.hidden)
            || (sizeLabel && sizeTarget && !sizeTarget.hidden)
        );
        metaTarget.hidden = !hasMeta;
    }
    if (button) {
        const primaryAction = action === 'manage' ? 'edit' : action;
        button.dataset.templateId = template.id;
        button.dataset.templateAction = primaryAction;
        button.addEventListener('click', () => handleTemplateAction(primaryAction, template));
    }
    if (actionsContainer) {
        const shouldShowActions = action === 'manage';
        if (!shouldShowActions) {
            actionsContainer.remove();
        } else {
            actionsContainer.hidden = false;
            const actionButtons = Array.from(actionsContainer.querySelectorAll('.template-card-action'));
            actionButtons.forEach(btn => {
                if (!(btn instanceof HTMLButtonElement)) {
                    return;
                }
                btn.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const command = btn.dataset.templateCommand ?? '';
                    if (command === 'preview') {
                        openTemplatePreview(template);
                    } else if (command === 'edit') {
                        handleTemplateAction('edit', template);
                    } else if (command === 'delete') {
                        confirmTemplateDeletion(template).catch(error => console.error(error));
                    }
                });
            });
        }
    }
    getTemplatePreviewImage(template).then(url => {
        if (img && url) {
            img.src = url;
        } else if (img && !url) {
            img.remove();
        }
    }).catch(() => {
        if (img) {
            img.remove();
        }
    });
    return node;
}

function openTemplatePreview(template) {
    if (!template) {
        return;
    }
    const path = template.publicPath ?? template.sourcePath ?? template.relativePath ?? '';
    if (!path) {
        return;
    }
    try {
        const url = new URL(path, window.location.href);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error(error);
    }
}

async function confirmTemplateDeletion(template) {
    if (!template || !template.id) {
        return;
    }
    const label = template.name ?? template.id;
    const confirmed = window.confirm(`Supprimer définitivement «\u00a0${label}\u00a0» ?`);
    if (!confirmed) {
        return;
    }
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=deleteTemplate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ templateId: template.id }),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        const success = payload?.success ?? payload?.data?.success ?? false;
        if (!success) {
            const message = payload?.error ?? payload?.details ?? 'Suppression impossible';
            throw new Error(message);
        }
        showToast('Document supprimé.', { type: 'success' });
        await ensureTemplateLibrary(true);
    } catch (error) {
        console.error(error);
        showToast('Impossible de supprimer le document.', { type: 'error' });
    }
}

function renderTemplateLibrary() {
    for (const [section, targets] of Object.entries(templateSections)) {
        const list = targets.list;
        const empty = targets.empty;
        if (!list || !empty) continue;
        list.innerHTML = '';
        const sortMode = templateLibrarySortModes.get(section) ?? normalizeSortMode(targets.sortSelect?.value);
        if (targets.sortSelect) {
            const normalized = normalizeSortMode(sortMode);
            templateLibrarySortModes.set(section, normalized);
            targets.sortSelect.value = normalized;
        }
        if (!templateLibrary.length) {
            empty.hidden = false;
            continue;
        }
        empty.hidden = true;
        const sortedTemplates = sortItems(templateLibrary, sortMode);
        for (const template of sortedTemplates) {
            list.appendChild(createTemplateCardElement(template, section));
        }
        const desiredMode = templateLibraryViewModes.get(section) ?? targets.container?.dataset.viewMode ?? 'grid';
        setTemplateLibraryView(section, desiredMode);
    }
    if (templateEditPicker && !templateEditPicker.hidden) {
        renderTemplateEditPicker();
    }
}

function setDocumentListView(mode) {
    if (!documentList) {
        return;
    }
    const normalized = mode === 'grid' ? 'grid' : 'list';
    documentListViewMode = normalized;
    documentList.dataset.viewMode = normalized;
    if (documentViewModeButtons.grid) {
        documentViewModeButtons.grid.setAttribute('aria-pressed', normalized === 'grid' ? 'true' : 'false');
        documentViewModeButtons.grid.classList.toggle('is-active', normalized === 'grid');
    }
    if (documentViewModeButtons.list) {
        documentViewModeButtons.list.setAttribute('aria-pressed', normalized === 'list' ? 'true' : 'false');
        documentViewModeButtons.list.classList.toggle('is-active', normalized === 'list');
    }
}

function toggleDocumentListVisibility(visible) {
    if (!documentList) {
        return;
    }
    const show = visible !== false;
    documentList.classList.toggle('is-collapsed', !show);
    if (documentViewBody) {
        documentViewBody.hidden = !show;
    }
}

function setTemplateLibraryView(sectionId, mode) {
    const config = templateSections[sectionId];
    if (!config || !config.container) {
        return;
    }
    const normalized = mode === 'list' ? 'list' : 'grid';
    templateLibraryViewModes.set(sectionId, normalized);
    config.container.dataset.viewMode = normalized;
    const { viewButtons } = config;
    if (viewButtons?.grid) {
        viewButtons.grid.setAttribute('aria-pressed', normalized === 'grid' ? 'true' : 'false');
        viewButtons.grid.classList.toggle('is-active', normalized === 'grid');
    }
    if (viewButtons?.list) {
        viewButtons.list.setAttribute('aria-pressed', normalized === 'list' ? 'true' : 'false');
        viewButtons.list.classList.toggle('is-active', normalized === 'list');
    }
}

function toggleTemplateLibraryVisibility(sectionId, visible) {
    const config = templateSections[sectionId];
    if (!config || !config.container) {
        return;
    }
    const show = visible !== false;
    config.container.classList.toggle('is-collapsed', !show);
    if (config.content) {
        config.content.hidden = !show;
    }
}

function setTemplateEditView(mode) {
    if (!templateEditPicker) {
        return;
    }
    const normalized = mode === 'list' ? 'list' : 'grid';
    templateEditViewMode = normalized;
    if (templateEditGridList?.parentElement) {
        templateEditGridList.parentElement.hidden = normalized !== 'grid';
    }
    if (templateEditListView?.parentElement) {
        templateEditListView.parentElement.hidden = normalized !== 'list';
    }
    if (templateEditViewButtons.grid) {
        templateEditViewButtons.grid.setAttribute('aria-pressed', normalized === 'grid' ? 'true' : 'false');
        templateEditViewButtons.grid.classList.toggle('is-active', normalized === 'grid');
    }
    if (templateEditViewButtons.list) {
        templateEditViewButtons.list.setAttribute('aria-pressed', normalized === 'list' ? 'true' : 'false');
        templateEditViewButtons.list.classList.toggle('is-active', normalized === 'list');
    }
}

function renderTemplateEditPicker() {
    if (!templateEditPicker) {
        return;
    }
    const hasTemplates = Array.isArray(templateLibrary) && templateLibrary.length > 0;
    if (templateEditEmptyState) {
        templateEditEmptyState.hidden = hasTemplates;
    }
    const sortMode = normalizeSortMode(templateEditSortMode);
    templateEditSortMode = sortMode;
    if (templateEditSortSelect) {
        templateEditSortSelect.value = sortMode;
    }
    const sortedTemplates = sortItems(templateLibrary, sortMode);
    if (templateEditGridList) {
        templateEditGridList.innerHTML = '';
        if (hasTemplates) {
            sortedTemplates.forEach(template => {
                const card = createTemplateCardElement(template, 'edit');
                const button = card.querySelector('.template-card-button');
                if (button) {
                    button.addEventListener('click', () => {
                        closeTemplateEditPicker();
                    });
                }
                templateEditGridList.appendChild(card);
            });
        }
    }
    if (templateEditListView) {
        templateEditListView.innerHTML = '';
        if (hasTemplates) {
            sortedTemplates.forEach(template => {
                const item = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'template-edit-picker__detail-button';
                button.addEventListener('click', () => {
                    closeTemplateEditPicker();
                    handleTemplateAction('edit', template);
                });
                button.append(
                    buildFileDetailContent({
                        name: template.name ?? template.id ?? 'Document',
                        updatedAt: template.updatedAt ?? template.createdAt ?? null,
                        size: template.size ?? null,
                    })
                );
                item.appendChild(button);
                templateEditListView.appendChild(item);
            });
        }
    }
    setTemplateEditView(templateEditViewMode);
}

async function loadTemplateLibrary(force = false) {
    if (templateLibraryLoaded && !force) {
        return;
    }
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=listTemplates`);
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        templateLibrary = Array.isArray(payload.data?.templates) ? payload.data.templates : [];
        if (force) {
            templatePreviewCache.clear();
            templatePreviewPromises.clear();
        }
        templateLibraryLoaded = true;
        renderTemplateLibrary();
    } catch (error) {
        console.error(error);
    }
}

async function ensureTemplateLibrary(force = false) {
    await loadTemplateLibrary(force);
    renderTemplateLibrary();
}

async function openTemplateEditPicker() {
    if (!templateEditPicker) {
        return;
    }
    try {
        await ensureTemplateLibrary();
    } catch (error) {
        console.error(error);
    }
    renderTemplateEditPicker();
    templateEditPicker.hidden = false;
    templateEditPicker.setAttribute('aria-hidden', 'false');
    const panel = templateEditPicker.querySelector('.template-edit-picker__panel');
    panel?.focus();
}

function closeTemplateEditPicker() {
    if (!templateEditPicker) {
        return;
    }
    templateEditPicker.hidden = true;
    templateEditPicker.setAttribute('aria-hidden', 'true');
}

function handleTemplateAction(action, template) {
    if (!template) {
        return;
    }
    if (action === 'prefilled') {
        openTemplateGenerationDialog(template).catch(error => console.error(error));
        return;
    }
    if (action === 'preview') {
        openTemplatePreview(template);
        return;
    }
    if (action === 'delete') {
        confirmTemplateDeletion(template).catch(error => console.error(error));
        return;
    }
    const params = new URLSearchParams();
    params.set('template', template.id);
    const mode = action === 'manage' ? 'edit' : action;
    params.set('mode', mode);
    try {
        const url = new URL('template_editor.php', window.location.href);
        url.search = params.toString();
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error(error);
    }
}

function updateTemplateGenerationMessage() {
    if (!templateGenerateMessage) {
        return;
    }
    const max = templateGenerationMaxClients;
    const count = templateGenerationSelectedClients.length;
    const maxLabel = max > 1 ? 'clients' : 'client';
    const countLabel = count > 1 ? 'clients' : 'client';
    const suffix = count
        ? ` (${count} ${countLabel} sélectionné${count > 1 ? 's' : ''})`
        : '';
    templateGenerateMessage.textContent = `Vous pouvez sélectionner jusqu’à ${max} ${maxLabel} pour remplir ce document. Choisissez le(s) client(s) que vous souhaitez identifier dans le document.${suffix}`;
}

function clearTemplateGenerateFeedback() {
    if (!templateGenerateFeedback) {
        return;
    }
    templateGenerateFeedback.textContent = '';
    templateGenerateFeedback.classList.remove('is-success');
}

function resetTemplateGenerationQuestions() {
    templateGenerationQuestionGroups = [];
    templateGenerationQuestionIndex = new Map();
    templateGenerationHiddenQuestionEntries = [];
    templateGenerationAnswers = new Map();
    if (templateGenerateQuestionList) {
        templateGenerateQuestionList.innerHTML = '';
    }
    if (templateGenerateQuestionEmpty) {
        templateGenerateQuestionEmpty.hidden = true;
    }
    if (templateGenerateQuestionSection) {
        templateGenerateQuestionSection.hidden = true;
    }
}

function resetTemplateGenerationVerification() {
    templateGenerationVerifyFields = [];
    templateGenerationVerifyValues.clear();
    templateGenerationVerifyLoading.clear();
    templateGenerationSharedVerifyValues.clear();
    templateGenerationConflicts = new Map();
    templateConflictSelections = new Map();
    templateGenerationConflictResolutions = new Map();
    templateConflictPanelMode = { type: 'global', clientId: null };
    if (templateGenerateVerifyList) {
        templateGenerateVerifyList.innerHTML = '';
    }
    if (templateGenerateVerifyEmpty) {
        templateGenerateVerifyEmpty.hidden = true;
    }
    if (templateGenerateVerifySection) {
        templateGenerateVerifySection.hidden = true;
    }
    if (templateConflictBanner) {
        templateConflictBanner.hidden = true;
        templateConflictBanner.setAttribute('aria-hidden', 'true');
    }
    if (templateConflictPanel) {
        templateConflictPanel.hidden = true;
        templateConflictPanel.setAttribute('aria-hidden', 'true');
    }
}

function normalizeCommonKey(key) {
    return String(key ?? '').trim().toLowerCase();
}

const TEMPLATE_CONFLICT_ALLOWED_KEYS = (() => {
    const entries = [
        'file_number',
        'numéro de dossier',
        'numéro de dossier interne',
        'chosen_lender',
        'prêteur choisi',
        'chosen_mortgage_payment',
        'versement hypothécaire',
        'chosen_rate_type',
        'type de taux choisi',
        'chosen_rate_percentage',
        '% du taux choisi',
        'reason_behind_lender_choice',
        'avantages et inconvénients du prêteur',
        'raisons du choix du prêteur',
    ];
    const allowed = new Set();
    entries.forEach(value => {
        const normalized = normalizeCommonKey(value);
        if (normalized) {
            allowed.add(normalized);
        }
    });
    return allowed;
})();

function isAllowedTemplateConflictField(field) {
    if (!field || typeof field !== 'object') {
        return false;
    }
    const normalizedKey = normalizeCommonKey(field.key);
    if (normalizedKey && TEMPLATE_CONFLICT_ALLOWED_KEYS.has(normalizedKey)) {
        return true;
    }
    const normalizedLabel = normalizeCommonKey(field.label ?? '');
    return normalizedLabel && TEMPLATE_CONFLICT_ALLOWED_KEYS.has(normalizedLabel);
}

function normalizeQuestionLabelText(label) {
    if (typeof label !== 'string') {
        return '';
    }
    return label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

const QUESTION_LABEL_EQUIVALENCE = (() => {
    const entries = [
        { canonical: 'Numéro de dossier', aliases: ['Numéro de dossier interne'] },
        { canonical: 'Prêteur choisi', aliases: [] },
        { canonical: 'Versement hypothécaire', aliases: [] },
        { canonical: 'Type de taux choisi', aliases: [] },
        { canonical: '% du taux choisi', aliases: [] },
        { canonical: 'Avantages et inconvénients du prêteur', aliases: ['Raisons du choix du prêteur'] },
    ];
    const map = new Map();
    entries.forEach(entry => {
        const canonical = normalizeQuestionLabelText(entry.canonical);
        if (!canonical) {
            return;
        }
        map.set(canonical, canonical);
        const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
        aliases.forEach(alias => {
            const normalizedAlias = normalizeQuestionLabelText(alias);
            if (normalizedAlias) {
                map.set(normalizedAlias, canonical);
            }
        });
    });
    return map;
})();

function canonicalizeQuestionLabel(label) {
    const normalized = normalizeQuestionLabelText(label);
    if (!normalized) {
        return '';
    }
    if (QUESTION_LABEL_EQUIVALENCE.has(normalized)) {
        return QUESTION_LABEL_EQUIVALENCE.get(normalized);
    }
    return normalized;
}

function tokenizeCanonicalLabel(label) {
    if (!label) {
        return [];
    }
    return label.split(' ').filter(Boolean);
}

function tokensWithinTolerance(baseTokens, candidateTokens) {
    if (!baseTokens.length || !candidateTokens.length) {
        return false;
    }
    const baseSet = new Set(baseTokens);
    const difference = candidateTokens.filter(token => !baseSet.has(token));
    return difference.length <= 1;
}

function areLabelTokensSimilar(aTokens, bTokens) {
    if (!aTokens.length || !bTokens.length) {
        return false;
    }
    if (aTokens.length === bTokens.length && aTokens.every((token, index) => token === bTokens[index])) {
        return true;
    }
    return tokensWithinTolerance(aTokens, bTokens) || tokensWithinTolerance(bTokens, aTokens);
}

function findSimilarLabelInIndex(canonicalLabel, tokens, index) {
    if (!(index instanceof Map) || !canonicalLabel || !tokens.length) {
        return null;
    }
    if (index.has(canonicalLabel)) {
        return canonicalLabel;
    }
    for (const [key, info] of index.entries()) {
        const entryTokens = Array.isArray(info?.tokens) ? info.tokens : [];
        if (entryTokens.length && areLabelTokensSimilar(entryTokens, tokens)) {
            return key;
        }
    }
    return null;
}

function createHiddenQuestionEntry(entry, mirror) {
    return { ...entry, hidden: true, mirror };
}

function stringifyCommonValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(item => stringifyCommonValue(item)).filter(Boolean).join(', ');
    }
    if (typeof value === 'object') {
        return Object.values(value).map(item => stringifyCommonValue(item)).filter(Boolean).join(' ').trim();
    }
    return '';
}

function readObjectValue(source, key) {
    if (!source || typeof source !== 'object') {
        return '';
    }
    const normalized = normalizeCommonKey(key);
    for (const [entryKey, entryValue] of Object.entries(source)) {
        if (normalizeCommonKey(entryKey) === normalized) {
            return entryValue;
        }
    }
    return '';
}

function extractCommonValue(primary, key, fallback) {
    const sources = [
        readObjectValue(primary, key),
        readObjectValue(primary?.variables ?? {}, key),
        readObjectValue(fallback, key),
        readObjectValue(fallback?.variables ?? {}, key),
    ];
    for (const entry of sources) {
        const value = stringifyCommonValue(entry).trim();
        if (value) {
            return value;
        }
    }
    return '';
}

function resolveClientRequestValue(clientData, key) {
    if (!key) {
        return '';
    }
    const request = clientData?.request ?? {};
    const candidates = [
        readObjectValue(request, key),
        readObjectValue(request?.variables ?? {}, key),
    ];
    for (const entry of candidates) {
        const normalized = stringifyCommonValue(entry).trim();
        if (normalized) {
            return entry;
        }
    }
    return '';
}

function resolveCommonLabel(baseKey) {
    const normalized = normalizeCommonKey(baseKey);
    const groups = Array.isArray(variableDefinitions?.groups) ? variableDefinitions.groups : [];
    const fusedGroup = groups.find(group => normalizeCommonKey(group.id) === 'fused');
    if (!fusedGroup) {
        return baseKey;
    }
    const fields = Array.isArray(fusedGroup.fields) ? fusedGroup.fields : [];
    const match = fields.find(field => normalizeCommonKey(field.key) === normalized);
    return match?.label ?? baseKey;
}

function collectTemplateCommonFields(template) {
    const elements = Array.isArray(template?.elements) ? template.elements : [];
    const seen = new Set();
    const fields = [];
    for (const element of elements) {
        if (!element || typeof element !== 'object') {
            continue;
        }
        const variable = element.data?.variable;
        if (!variable || typeof variable !== 'object') {
            continue;
        }
        const groupId = typeof variable.groupId === 'string' ? variable.groupId.trim().toLowerCase() : '';
        if (groupId !== 'fused') {
            continue;
        }
        const baseKey = typeof variable.baseKey === 'string' && variable.baseKey.trim()
            ? variable.baseKey.trim()
            : (typeof variable.key === 'string' ? variable.key.trim() : '');
        if (!baseKey) {
            continue;
        }
        const normalizedKey = normalizeCommonKey(baseKey);
        if (seen.has(normalizedKey)) {
            continue;
        }
        seen.add(normalizedKey);
        fields.push({
            key: baseKey,
            label: resolveCommonLabel(baseKey),
        });
    }
    return fields;
}

function computeTemplateGenerationConflicts() {
    const conflicts = new Map();
    if (!templateGenerationVerifyFields.length || !templateGenerationSelectedClients.length) {
        templateGenerationConflicts = conflicts;
        return conflicts;
    }

    templateGenerationVerifyFields.forEach(field => {
        if (!isAllowedTemplateConflictField(field)) {
            return;
        }
        const values = [];
        const distinctNonEmptyValues = new Set();
        templateGenerationSelectedClients.forEach(client => {
            const entries = templateGenerationVerifyValues.get(client.id);
            const entry = entries?.get(field.key) ?? { value: '', original: '' };
            const current = String(entry.value ?? '').trim();
            const original = String(entry.original ?? '').trim();
            const normalizedValue = current ? current.toLowerCase() : '__empty__';
            if (normalizedValue !== '__empty__') {
                distinctNonEmptyValues.add(normalizedValue);
            }
            values.push({
                clientId: client.id,
                clientName: client.displayName ?? client.id,
                value: current,
                original,
            });
        });
        const hasConflict = distinctNonEmptyValues.size > 1;
        if (hasConflict) {
            conflicts.set(field.key, {
                key: field.key,
                label: field.label ?? field.key,
                values,
            });
        }
    });

    templateGenerationConflicts = conflicts;
    return conflicts;
}

function updateTemplateConflictBanner() {
    if (!templateConflictBanner) {
        return;
    }
    const conflicts = computeTemplateGenerationConflicts();
    const canShowConflicts = templateGenerationSelectedClients.length > 1
        && templateGenerationVerifyLoading.size === 0;
    const hasConflicts = canShowConflicts && conflicts.size > 0;
    templateConflictBanner.hidden = !hasConflicts;
    templateConflictBanner.setAttribute('aria-hidden', hasConflicts ? 'false' : 'true');
    if (!hasConflicts) {
        templateConflictPanelMode = { type: 'global', clientId: null };
        closeTemplateConflictPanel();
    }
}

function ensureTemplateConflictSelections(defaultClientId = null) {
    const selections = new Map();
    templateGenerationConflicts.forEach(entry => {
        if (!entry || !Array.isArray(entry.values) || !entry.values.length) {
            return;
        }
        const resolved = templateGenerationConflictResolutions.get(entry.key);
        let candidateId = templateConflictSelections.get(entry.key)?.clientId
            ?? resolved?.chosenClientId
            ?? null;
        if (defaultClientId && entry.values.some(option => option.clientId === defaultClientId)) {
            candidateId = defaultClientId;
        }
        if (!candidateId || !entry.values.some(option => option.clientId === candidateId)) {
            candidateId = entry.values[0].clientId;
        }
        const selected = entry.values.find(option => option.clientId === candidateId) ?? entry.values[0];
        selections.set(entry.key, {
            clientId: selected.clientId,
            clientName: selected.clientName,
            value: selected.value,
        });
    });
    templateConflictSelections = selections;
}

function updateTemplateConflictMessage() {
    if (!templateConflictMessage) {
        return;
    }
    const entries = Array.from(templateGenerationConflicts.values());
    if (!entries.length) {
        templateConflictMessage.textContent = 'Aucune divergence détectée.';
        return;
    }
    const labels = entries.map(entry => entry.label ?? entry.key).join(', ');
    if (templateConflictPanelMode.type === 'client' && templateConflictPanelMode.clientId) {
        const otherClients = templateGenerationSelectedClients
            .filter(client => client.id !== templateConflictPanelMode.clientId)
            .map(client => client.displayName ?? client.id)
            .join(', ');
        if (otherClients) {
            templateConflictMessage.textContent = `ATTENTION : Êtes-vous certain que vous souhaitez abandonner les informations ${labels} du/des client(s) ${otherClients} ? Si vous continuez, vous perdrez ces données-là pour les éléments qui comportaient des différences. Voulez-vous réellement supprimer les éléments de ce client (irrécupérables)?`;
            return;
        }
    }
    templateConflictMessage.textContent = 'Choisissez quelles informations vous souhaitez garder et quelles informations vous souhaitez cacher pour l’utilisation de ce modèle pré-enregistré. Vous ne pouvez pas avoir différentes réponses à des mêmes questions du dossier général. Veuillez choisir l’une des valeurs à conserver pour chaque question suivante.';
}

function renderTemplateConflictList() {
    if (!templateConflictList) {
        return;
    }
    updateTemplateConflictMessage();
    templateConflictList.innerHTML = '';
    const entries = Array.from(templateGenerationConflicts.values());
    if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'template-conflict-empty';
        empty.textContent = 'Aucune divergence à résoudre.';
        templateConflictList.appendChild(empty);
        return;
    }
    entries.forEach(entry => {
        const article = document.createElement('article');
        article.className = 'template-conflict-item';
        const header = document.createElement('header');
        header.className = 'template-conflict-item__header';
        const title = document.createElement('h4');
        title.textContent = entry.label ?? entry.key;
        header.appendChild(title);
        article.appendChild(header);
        const options = document.createElement('div');
        options.className = 'template-conflict-options';
        const selection = templateConflictSelections.get(entry.key);
        entry.values.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'template-conflict-option';
            button.dataset.conflictOption = 'true';
            button.dataset.fieldKey = entry.key;
            button.dataset.clientId = option.clientId;
            const marker = document.createElement('span');
            marker.className = 'template-conflict-option__marker';
            marker.textContent = '★';
            const client = document.createElement('span');
            client.className = 'template-conflict-option__client';
            client.textContent = option.clientName;
            const value = document.createElement('span');
            value.className = 'template-conflict-option__value';
            value.textContent = option.value || '— Aucune valeur';
            button.append(marker, client, value);
            if (option.original && option.original !== option.value) {
                const original = document.createElement('span');
                original.className = 'template-conflict-option__original';
                original.textContent = `Valeur du dossier : ${option.original}`;
                button.appendChild(original);
            }
            if (selection?.clientId === option.clientId) {
                button.classList.add('is-selected');
            }
            options.appendChild(button);
        });
        article.appendChild(options);
        templateConflictList.appendChild(article);
    });
}

function openTemplateConflictPanel(options = {}) {
    if (!templateConflictPanel) {
        return;
    }
    if (!templateGenerationConflicts.size) {
        computeTemplateGenerationConflicts();
    }
    if (!templateGenerationConflicts.size) {
        return;
    }
    templateConflictPanelMode = {
        type: options.type ?? 'global',
        clientId: options.clientId ?? null,
    };
    ensureTemplateConflictSelections(options.clientId ?? null);
    renderTemplateConflictList();
    templateConflictPanel.hidden = false;
    templateConflictPanel.setAttribute('aria-hidden', 'false');
    const card = templateConflictPanel.querySelector('.template-conflict-panel__card');
    if (card instanceof HTMLElement) {
        requestAnimationFrame(() => card.focus());
    }
}

function closeTemplateConflictPanel() {
    if (!templateConflictPanel) {
        return;
    }
    templateConflictPanel.hidden = true;
    templateConflictPanel.setAttribute('aria-hidden', 'true');
}

function setTemplateConflictSelection(fieldKey, clientId) {
    if (!fieldKey || !clientId) {
        return;
    }
    const entry = templateGenerationConflicts.get(fieldKey);
    if (!entry) {
        return;
    }
    const option = entry.values.find(item => item.clientId === clientId);
    if (!option) {
        return;
    }
    templateConflictSelections.set(fieldKey, {
        clientId: option.clientId,
        clientName: option.clientName,
        value: option.value,
    });
    renderTemplateConflictList();
}

function handleTemplateConflictListClick(event) {
    const target = event.target instanceof HTMLElement
        ? event.target.closest('[data-conflict-option="true"]')
        : null;
    if (!(target instanceof HTMLButtonElement)) {
        return;
    }
    const fieldKey = target.dataset.fieldKey ?? '';
    const clientId = target.dataset.clientId ?? '';
    if (!fieldKey || !clientId) {
        return;
    }
    setTemplateConflictSelection(fieldKey, clientId);
}

function applyTemplateConflictSelections(recordNote) {
    if (!templateGenerationConflicts.size) {
        return;
    }
    ensureTemplateConflictSelections(templateConflictPanelMode.clientId ?? null);
    const resolutions = new Map();
    templateGenerationConflicts.forEach(entry => {
        const selection = templateConflictSelections.get(entry.key);
        if (!selection) {
            return;
        }
        const chosenValue = selection.value;
        templateGenerationSharedVerifyValues.set(entry.key, chosenValue);
        templateGenerationSelectedClients.forEach(client => {
            const values = templateGenerationVerifyValues.get(client.id);
            if (!values) {
                return;
            }
            const current = values.get(entry.key) ?? { value: '', original: '' };
            current.value = chosenValue;
            values.set(entry.key, current);
            const selector = `input[data-client-id="${CSS.escape(client.id)}"][data-verify-key="${CSS.escape(entry.key)}"]`;
            const input = templateGenerateVerifyList?.querySelector(selector);
            if (input instanceof HTMLInputElement) {
                if (input.value !== chosenValue) {
                    input.value = chosenValue;
                }
                const trimmed = chosenValue.trim();
                if (trimmed) {
                    input.classList.remove('is-invalid');
                } else {
                    input.classList.add('is-invalid');
                }
                if (trimmed && trimmed !== (current.original ?? '').trim()) {
                    input.classList.add('is-modified');
                } else {
                    input.classList.remove('is-modified');
                }
            }
            updateTemplateVerifyCardStatus(client.id);
        });
        const affected = entry.values
            .filter(option => option.clientId !== selection.clientId)
            .map(option => ({
                clientId: option.clientId,
                clientName: option.clientName,
                previousValue: option.value,
                originalValue: option.original,
            }));
        resolutions.set(entry.key, {
            fieldKey: entry.key,
            fieldLabel: entry.label ?? entry.key,
            chosenClientId: selection.clientId,
            chosenClientName: selection.clientName,
            chosenValue,
            recordNote: Boolean(recordNote),
            affectedClients: affected,
        });
    });
    templateGenerationConflictResolutions = resolutions;
    computeTemplateGenerationConflicts();
    updateTemplateConflictBanner();
    closeTemplateConflictPanel();
}

function handleTemplateConflictAction(event) {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) {
        return;
    }
    const action = button.dataset.conflictAction ?? '';
    if (action === 'note') {
        applyTemplateConflictSelections(true);
    } else if (action === 'replace') {
        applyTemplateConflictSelections(false);
    }
}

function prepareTemplateGenerationVerification() {
    if (!templateGenerationTemplate) {
        resetTemplateGenerationVerification();
        return;
    }
    templateGenerationVerifyFields = collectTemplateCommonFields(templateGenerationTemplate);
    if (!templateGenerationVerifyFields.length) {
        resetTemplateGenerationVerification();
        return;
    }
    templateGenerationVerifyValues.clear();
    templateGenerationVerifyLoading.clear();
    refreshTemplateGenerationVerification();
}

async function ensureTemplateGenerationClientData(requestId) {
    if (templateGenerationClientData.has(requestId)) {
        return templateGenerationClientData.get(requestId);
    }
    if (templateGenerationClientPromises.has(requestId)) {
        return templateGenerationClientPromises.get(requestId);
    }
    const task = (async () => {
        if (selectedClients.has(requestId)) {
            return selectedClients.get(requestId);
        }
        const { data } = await fetchJson(`${config.apiBaseUrl}?action=getRequestData&request=${encodeURIComponent(requestId)}`);
        return data;
    })().then(data => {
        if (data) {
            templateGenerationClientData.set(requestId, data);
        }
        templateGenerationClientPromises.delete(requestId);
        return data;
    }).catch(error => {
        templateGenerationClientPromises.delete(requestId);
        throw error;
    });
    templateGenerationClientPromises.set(requestId, task);
    return task;
}

function hydrateTemplateVerificationValues(requestId, data) {
    if (!templateGenerationVerifyFields.length) {
        return;
    }
    const fused = data?.fused ?? {};
    const request = data?.request ?? {};
    const values = new Map();
    for (const field of templateGenerationVerifyFields) {
        const current = extractCommonValue(fused, field.key, request);
        let value = current;
        if (templateGenerationSharedVerifyValues.has(field.key)) {
            value = templateGenerationSharedVerifyValues.get(field.key);
        }
        values.set(field.key, {
            value,
            original: current,
        });
    }
    templateGenerationVerifyValues.set(requestId, values);
}

function renderTemplateGenerationVerification() {
    if (!templateGenerateVerifySection || !templateGenerateVerifyList) {
        return;
    }
    if (!templateGenerationVerifyFields.length) {
        templateGenerateVerifySection.hidden = true;
        return;
    }
    templateGenerateVerifySection.hidden = false;
    templateGenerateVerifyList.innerHTML = '';
    if (!templateGenerationSelectedClients.length) {
        if (templateGenerateVerifyEmpty) {
            templateGenerateVerifyEmpty.hidden = false;
        }
        if (templateConflictBanner) {
            templateConflictBanner.hidden = true;
        }
        return;
    }
    if (templateGenerateVerifyEmpty) {
        templateGenerateVerifyEmpty.hidden = true;
    }
    const conflicts = computeTemplateGenerationConflicts();
    const canShowConflicts = templateGenerationSelectedClients.length > 1
        && templateGenerationVerifyLoading.size === 0;
    const conflictsByClient = new Map();
    conflicts.forEach(entry => {
        entry.values.forEach(option => {
            if (!conflictsByClient.has(option.clientId)) {
                conflictsByClient.set(option.clientId, []);
            }
            conflictsByClient.get(option.clientId).push(entry.key);
        });
    });

    templateGenerationSelectedClients.forEach(client => {
        const card = document.createElement('article');
        card.className = 'template-verify-card';
        card.dataset.clientId = client.id ?? '';
        const header = document.createElement('div');
        header.className = 'template-verify-card__header';
        const titleGroup = document.createElement('div');
        titleGroup.className = 'template-verify-card__title-group';
        const title = document.createElement('h4');
        title.className = 'template-verify-card__title';
        title.textContent = client.displayName ?? client.id;
        titleGroup.appendChild(title);
        const conflictButton = document.createElement('button');
        conflictButton.type = 'button';
        conflictButton.className = 'template-verify-conflict-button';
        conflictButton.title = 'Corriger les réponses communes avec ce client';
        conflictButton.innerHTML = '<span aria-hidden="true">★</span><span class="sr-only">Corriger</span>';
        const clientConflicts = canShowConflicts ? (conflictsByClient.get(client.id) ?? []) : [];
        if (!canShowConflicts || !clientConflicts.length) {
            conflictButton.disabled = true;
            conflictButton.classList.add('is-disabled');
        } else {
            conflictButton.addEventListener('click', () => {
                openTemplateConflictPanel({ type: 'client', clientId: client.id });
            });
        }
        titleGroup.appendChild(conflictButton);
        header.appendChild(titleGroup);
        const status = document.createElement('span');
        status.className = 'template-verify-card__status';
        header.appendChild(status);
        card.appendChild(header);

        if (templateGenerationVerifyLoading.has(client.id)) {
            status.textContent = 'Chargement…';
            const loading = document.createElement('p');
            loading.className = 'template-verify-loading';
            loading.textContent = 'Chargement des renseignements…';
            card.appendChild(loading);
        } else {
            const values = templateGenerationVerifyValues.get(client.id) ?? new Map();
            const fieldsContainer = document.createElement('div');
            fieldsContainer.className = 'template-verify-fields';
            let hasMissing = false;
            let hasChanges = false;
            for (const field of templateGenerationVerifyFields) {
                const entry = values.get(field.key) ?? { value: '', original: '' };
                const wrapper = document.createElement('div');
                wrapper.className = 'template-verify-field';
                const label = document.createElement('label');
                label.textContent = field.label ?? field.key;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = entry.value ?? '';
                input.dataset.clientId = client.id;
                input.dataset.verifyKey = field.key;
                if (!String(entry.value ?? '').trim()) {
                    input.classList.add('is-invalid');
                    hasMissing = true;
                }
                if ((entry.value ?? '') !== (entry.original ?? '')) {
                    input.classList.add('is-modified');
                    hasChanges = true;
                }
                input.addEventListener('input', handleVerifyInput);
                label.appendChild(input);
                wrapper.appendChild(label);
                fieldsContainer.appendChild(wrapper);
            }
            status.textContent = hasMissing ? 'À compléter' : (hasChanges ? 'Modifié' : 'À vérifier');
            card.appendChild(fieldsContainer);
        }

        templateGenerateVerifyList.appendChild(card);
    });

    updateTemplateConflictBanner();
}

function refreshTemplateGenerationVerification() {
    if (!templateGenerationVerifyFields.length) {
        resetTemplateGenerationVerification();
        return;
    }
    const selectedIds = new Set(templateGenerationSelectedClients.map(client => client.id));
    for (const id of Array.from(templateGenerationVerifyValues.keys())) {
        if (!selectedIds.has(id)) {
            templateGenerationVerifyValues.delete(id);
        }
    }
    for (const id of Array.from(templateGenerationVerifyLoading)) {
        if (!selectedIds.has(id)) {
            templateGenerationVerifyLoading.delete(id);
        }
    }
    if (!templateGenerationSelectedClients.length) {
        renderTemplateGenerationVerification();
        return;
    }
    templateGenerationSelectedClients.forEach(client => {
        if (templateGenerationVerifyValues.has(client.id) || templateGenerationVerifyLoading.has(client.id)) {
            return;
        }
        templateGenerationVerifyLoading.add(client.id);
        ensureTemplateGenerationClientData(client.id)
            .then(data => {
                hydrateTemplateVerificationValues(client.id, data ?? {});
            })
            .catch(error => {
                console.error(error);
                templateGenerationVerifyValues.set(client.id, new Map());
            })
            .finally(() => {
                templateGenerationVerifyLoading.delete(client.id);
                renderTemplateGenerationVerification();
            });
    });
    renderTemplateGenerationVerification();
}

function validateTemplateGenerationVerification() {
    if (!templateGenerationVerifyFields.length) {
        return true;
    }
    if (templateGenerationVerifyLoading.size) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Chargement des renseignements communs…';
            templateGenerateFeedback.classList.remove('is-success');
        }
        return false;
    }
    let valid = true;
    let firstInvalid = null;
    templateGenerationSelectedClients.forEach(client => {
        const values = templateGenerationVerifyValues.get(client.id);
        if (!values) {
            valid = false;
            return;
        }
        for (const field of templateGenerationVerifyFields) {
            const entry = values.get(field.key) ?? { value: '' };
            const current = String(entry.value ?? '').trim();
            if (!current) {
                valid = false;
                const selector = `input[data-client-id="${CSS.escape(client.id)}"][data-verify-key="${CSS.escape(field.key)}"]`;
                const input = templateGenerateVerifyList?.querySelector(selector);
                if (input) {
                    input.classList.add('is-invalid');
                    if (!firstInvalid) {
                        firstInvalid = input;
                    }
                }
            }
        }
    });
    if (!valid && templateGenerateFeedback) {
        templateGenerateFeedback.textContent = 'Complétez la section « Vérification des informations » avant de continuer.';
        templateGenerateFeedback.classList.remove('is-success');
    }
    if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
    }
    return valid;
}

function exportTemplateVerificationUpdates() {
    if (!templateGenerationVerifyFields.length) {
        return [];
    }
    const updates = [];
    templateGenerationSelectedClients.forEach(client => {
        const values = templateGenerationVerifyValues.get(client.id);
        if (!values) {
            return;
        }
        const payload = {};
        let hasChanges = false;
        for (const field of templateGenerationVerifyFields) {
            const entry = values.get(field.key);
            if (!entry) {
                continue;
            }
            const current = String(entry.value ?? '').trim();
            const original = String(entry.original ?? '').trim();
            if (current && current !== original) {
                payload[field.key] = current;
                hasChanges = true;
            }
        }
        if (hasChanges) {
            updates.push({
                requestId: client.id,
                values: payload,
            });
        }
    });
    return updates;
}

function exportTemplateConflictDecisions() {
    if (!templateGenerationConflictResolutions.size) {
        return [];
    }
    const results = [];
    templateGenerationConflictResolutions.forEach(entry => {
        if (!entry || !entry.fieldKey || !entry.chosenClientId) {
            return;
        }
        const value = typeof entry.chosenValue === 'string' ? entry.chosenValue.trim() : '';
        if (value === '') {
            return;
        }
        const affected = Array.isArray(entry.affectedClients)
            ? entry.affectedClients.filter(item => item && item.clientId)
            : [];
        if (!affected.length) {
            return;
        }
        results.push({
            fieldKey: entry.fieldKey,
            fieldLabel: entry.fieldLabel ?? entry.fieldKey,
            value,
            chosenClientId: entry.chosenClientId,
            chosenClientName: entry.chosenClientName ?? '',
            recordNote: entry.recordNote === true,
            affectedClients: affected.map(item => ({
                clientId: item.clientId,
                clientName: item.clientName ?? '',
                previousValue: item.previousValue ?? '',
                originalValue: item.originalValue ?? '',
            })),
            templateId: templateGenerationTemplate?.id ?? '',
            templateName: templateGenerationTemplate?.name ?? templateGenerationTemplate?.title ?? '',
        });
    });
    return results;
}

function updateTemplateVerifyCardStatus(clientId) {
    if (!templateGenerateVerifyList) {
        return;
    }
    const values = templateGenerationVerifyValues.get(clientId);
    if (!values) {
        return;
    }
    let hasMissing = false;
    let hasChanges = false;
    for (const field of templateGenerationVerifyFields) {
        const currentEntry = values.get(field.key);
        const currentValue = String(currentEntry?.value ?? '').trim();
        if (!currentValue) {
            hasMissing = true;
        }
        if (currentValue && currentValue !== String(currentEntry?.original ?? '').trim()) {
            hasChanges = true;
        }
    }
    const card = templateGenerateVerifyList.querySelector(`.template-verify-card[data-client-id="${CSS.escape(clientId)}"]`);
    const status = card?.querySelector('.template-verify-card__status');
    if (status) {
        status.textContent = hasMissing ? 'À compléter' : (hasChanges ? 'Modifié' : 'À vérifier');
    }
}

function handleVerifyInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
        return;
    }
    const clientId = input.dataset.clientId ?? '';
    const key = input.dataset.verifyKey ?? '';
    if (!clientId || !key) {
        return;
    }
    const values = templateGenerationVerifyValues.get(clientId);
    if (!values) {
        return;
    }
    const entry = values.get(key) ?? { value: '', original: '' };
    entry.value = input.value;
    values.set(key, entry);
    templateGenerationSharedVerifyValues.set(key, input.value);
    const trimmed = input.value.trim();
    if (trimmed) {
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
    }
    if (trimmed && trimmed !== String(entry.original ?? '').trim()) {
        input.classList.add('is-modified');
    } else {
        input.classList.remove('is-modified');
    }
    updateTemplateVerifyCardStatus(clientId);

    if (templateGenerationSelectedClients.length <= 1) {
        templateGenerationConflictResolutions.delete(key);
        templateConflictSelections.delete(key);
        computeTemplateGenerationConflicts();
        updateTemplateConflictBanner();
        return;
    }

    for (const client of templateGenerationSelectedClients) {
        if (!client || client.id === clientId) {
            continue;
        }
        const otherValues = templateGenerationVerifyValues.get(client.id);
        if (!otherValues) {
            continue;
        }
        const otherEntry = otherValues.get(key) ?? { value: '', original: '' };
        otherEntry.value = input.value;
        otherValues.set(key, otherEntry);
        if (!templateGenerateVerifyList) {
            continue;
        }
        const selector = `input[data-client-id="${CSS.escape(client.id)}"][data-verify-key="${CSS.escape(key)}"]`;
        const otherInput = templateGenerateVerifyList.querySelector(selector);
        if (otherInput instanceof HTMLInputElement) {
            otherInput.value = input.value;
            const otherTrimmed = otherInput.value.trim();
            if (otherTrimmed) {
                otherInput.classList.remove('is-invalid');
            } else {
                otherInput.classList.add('is-invalid');
            }
            if (otherTrimmed && otherTrimmed !== String(otherEntry.original ?? '').trim()) {
                otherInput.classList.add('is-modified');
            } else {
                otherInput.classList.remove('is-modified');
            }
        }
        updateTemplateVerifyCardStatus(client.id);
    }

    templateGenerationConflictResolutions.delete(key);
    templateConflictSelections.delete(key);
    computeTemplateGenerationConflicts();
    updateTemplateConflictBanner();
}

function prepareTemplateGenerationQuestions() {
    resetTemplateGenerationQuestions();
    const template = templateGenerationTemplate;
    if (!template || !template.questionSettings) {
        return;
    }
    const verifyKeySet = new Set();
    const verifyLabelIndex = new Map();
    const verifyKeyInfo = new Map();
    collectTemplateCommonFields(template).forEach(field => {
        const normalizedKey = normalizeCommonKey(field.key);
        if (normalizedKey) {
            verifyKeySet.add(normalizedKey);
        }
        const canonicalLabel = canonicalizeQuestionLabel(field.label ?? field.key);
        const tokens = tokenizeCanonicalLabel(canonicalLabel);
        const info = { field, tokens, canonical: canonicalLabel };
        if (canonicalLabel) {
            verifyLabelIndex.set(canonicalLabel, info);
        }
        if (normalizedKey) {
            verifyKeyInfo.set(normalizedKey, info);
        }
    });
    const assignments = Array.isArray(template.questionSettings.classes)
        ? template.questionSettings.classes
        : [];
    const groups = [];
    const questionLabelIndex = new Map();
    assignments.forEach(assignment => {
        if (!assignment || typeof assignment !== 'object') {
            return;
        }
        const classId = typeof assignment.id === 'string' ? assignment.id.trim() : '';
        if (!classId) {
            return;
        }
        const classData = questionClassCatalog.find(item => item.id === classId);
        if (!classData) {
            return;
        }
        const questions = [];
        for (const question of classData.questions) {
            if (!question || typeof question !== 'object') {
                continue;
            }
            const targetGroup = questionTargetsCommonGroup(classData, assignment, question);
            if (targetGroup !== 'fused') {
                continue;
            }
            const entry = {
                classId: classData.id,
                question,
                required: assignment.required === true || question.required === true,
                targetGroup,
                targetKey: resolveQuestionTargetKey(classData, assignment, question),
            };
            const normalizedTargetKey = normalizeCommonKey(entry.targetKey);
            if (entry.targetGroup === 'fused' && normalizedTargetKey && verifyKeySet.has(normalizedTargetKey)) {
                const verifyInfo = verifyKeyInfo.get(normalizedTargetKey) ?? null;
                const hiddenEntry = createHiddenQuestionEntry(entry, {
                    type: 'verify',
                    fieldKey: normalizedTargetKey,
                    canonicalLabel: verifyInfo?.canonical ?? '',
                });
                templateGenerationHiddenQuestionEntries.push(hiddenEntry);
                templateGenerationQuestionIndex.set(question.id, hiddenEntry);
                continue;
            }
            const labelSource = entry.question?.label
                ?? entry.question?.title
                ?? entry.targetKey
                ?? entry.question?.id
                ?? '';
            const canonicalLabel = canonicalizeQuestionLabel(labelSource);
            const tokens = tokenizeCanonicalLabel(canonicalLabel);
            let verifyMatch = findSimilarLabelInIndex(canonicalLabel, tokens, verifyLabelIndex);
            if (!verifyMatch && normalizedTargetKey && verifyKeyInfo.has(normalizedTargetKey)) {
                verifyMatch = verifyKeyInfo.get(normalizedTargetKey)?.canonical ?? null;
            }
            if (verifyMatch) {
                const verifyInfo = verifyLabelIndex.get(verifyMatch) ?? verifyKeyInfo.get(normalizedTargetKey) ?? null;
                const fieldKey = normalizeCommonKey(verifyInfo?.field?.key ?? normalizedTargetKey ?? '');
                if (fieldKey) {
                    const hiddenEntry = createHiddenQuestionEntry(entry, {
                        type: 'verify',
                        fieldKey,
                        canonicalLabel: verifyMatch,
                    });
                    templateGenerationHiddenQuestionEntries.push(hiddenEntry);
                    templateGenerationQuestionIndex.set(question.id, hiddenEntry);
                    continue;
                }
            }
            const duplicateMatch = findSimilarLabelInIndex(canonicalLabel, tokens, questionLabelIndex);
            if (duplicateMatch) {
                const duplicateInfo = questionLabelIndex.get(duplicateMatch);
                const sourceQuestionId = duplicateInfo?.entry?.question?.id ?? '';
                if (sourceQuestionId) {
                    const hiddenEntry = createHiddenQuestionEntry(entry, {
                        type: 'question',
                        sourceQuestionId,
                    });
                    templateGenerationHiddenQuestionEntries.push(hiddenEntry);
                    templateGenerationQuestionIndex.set(question.id, hiddenEntry);
                    continue;
                }
            }
            templateGenerationQuestionIndex.set(question.id, entry);
            if (canonicalLabel) {
                questionLabelIndex.set(canonicalLabel, { tokens, entry });
            }
            questions.push(entry);
        }
        if (questions.length) {
            groups.push({
                classId: classData.id,
                title: classData.title,
                description: classData.description ?? '',
                required: assignment.required === true,
                questions,
            });
        }
    });
    templateGenerationQuestionGroups = groups;
    const requiresSavedResponses = groups.some(group => {
        return group.questions.some(questionEntry => {
            const metadata = questionEntry.question?.metadata;
            if (!metadata || typeof metadata !== 'object') {
                return false;
            }
            const savedConfig = metadata.savedResponses;
            if (!savedConfig || typeof savedConfig !== 'object') {
                return false;
            }
            const enabled = savedConfig.enabled === true;
            const key = typeof savedConfig.key === 'string' ? savedConfig.key.trim() : '';
            return enabled && key !== '';
        });
    });
    renderTemplateGenerationQuestions();
    if (requiresSavedResponses && !savedResponseLibrariesLoaded) {
        ensureSavedResponseLibraries()
            .then(() => {
                renderTemplateGenerationQuestions();
            })
            .catch(error => {
                console.error(error);
            });
    }
}

function renderTemplateGenerationQuestions() {
    if (!templateGenerateQuestionList || !templateGenerateQuestionSection) {
        return;
    }
    templateGenerateQuestionList.innerHTML = '';
    if (!templateGenerationQuestionGroups.length) {
        templateGenerateQuestionSection.hidden = true;
        if (templateGenerateQuestionEmpty) {
            templateGenerateQuestionEmpty.hidden = false;
        }
        return;
    }
    templateGenerateQuestionSection.hidden = false;
    if (templateGenerateQuestionEmpty) {
        templateGenerateQuestionEmpty.hidden = true;
    }
    const fragment = document.createDocumentFragment();
    templateGenerationQuestionGroups.forEach(group => {
        const article = document.createElement('article');
        article.className = 'template-generate-question-class';
        article.dataset.questionClassId = group.classId;
        if (group.title || group.description) {
            const header = document.createElement('header');
            if (group.title) {
                const h4 = document.createElement('h4');
                h4.textContent = group.title;
                header.appendChild(h4);
            }
            if (group.description) {
                const description = document.createElement('p');
                description.textContent = group.description;
                header.appendChild(description);
            }
            article.appendChild(header);
        }
        const list = document.createElement('div');
        list.className = 'template-generate-question-items';
        group.questions.forEach(entry => {
            const node = renderTemplateGenerationQuestion(entry);
            if (node) {
                list.appendChild(node);
            }
        });
        article.appendChild(list);
        fragment.appendChild(article);
    });
    templateGenerateQuestionList.appendChild(fragment);
}

function renderTemplateGenerationQuestion(entry) {
    if (!entry || !entry.question) {
        return null;
    }
    const type = entry.question.type;
    if ((type === 'choice' || type === 'dot') && Array.isArray(entry.question.options) && entry.question.options.length) {
        return renderTemplateGenerationChoiceQuestion(entry);
    }
    return renderTemplateGenerationOpenQuestion(entry);
}

function createQuestionContainer(entry) {
    const container = document.createElement('div');
    container.className = 'template-generate-question';
    container.dataset.questionId = entry.question.id;
    container.dataset.questionType = entry.question.type;
    return container;
}

function renderTemplateGenerationOpenQuestion(entry) {
    const container = createQuestionContainer(entry);
    const inputId = `template-question-${entry.question.id}`;
    const label = document.createElement('label');
    label.className = 'template-generate-question-label';
    label.setAttribute('for', inputId);
    label.textContent = entry.question.label;
    if (entry.required) {
        const required = document.createElement('span');
        required.className = 'template-generate-question-required';
        required.textContent = '*';
        label.appendChild(required);
    }
    container.appendChild(label);

    const metadata = entry.question && entry.question.metadata && typeof entry.question.metadata === 'object'
        ? entry.question.metadata
        : {};
    const existing = templateGenerationAnswers.get(entry.question.id) ?? {};

    const categories = normalizeQuestionCategories(metadata);
    if (categories.length) {
        const categoryField = document.createElement('div');
        categoryField.className = 'template-generate-field template-generate-question-category';
        const categoryLabel = document.createElement('label');
        const categorySelectId = `${inputId}-category`;
        categoryLabel.setAttribute('for', categorySelectId);
        categoryLabel.textContent = 'Catégorie de réponse';
        categoryField.appendChild(categoryLabel);

        const categorySelect = document.createElement('select');
        categorySelect.id = categorySelectId;
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Sélectionnez une catégorie';
        categorySelect.appendChild(placeholderOption);

        const categoriesById = new Map();
        categories.forEach(category => {
            categoriesById.set(category.id, category);
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.label || category.id;
            categorySelect.appendChild(option);
        });

        const categoryHint = document.createElement('p');
        categoryHint.className = 'template-generate-question-hint';
        categoryHint.hidden = true;

        const updateCategoryHint = () => {
            const current = categoriesById.get(categorySelect.value);
            if (current && current.description) {
                categoryHint.textContent = current.description;
                categoryHint.hidden = false;
            } else {
                categoryHint.hidden = true;
                categoryHint.textContent = '';
            }
        };

        if (typeof existing.categoryId === 'string' && categoriesById.has(existing.categoryId)) {
            categorySelect.value = existing.categoryId;
        }
        updateCategoryHint();

        categorySelect.addEventListener('change', () => {
            const current = categoriesById.get(categorySelect.value);
            if (current) {
                setTemplateGenerationAnswer(entry.question.id, {
                    categoryId: current.id,
                    categoryLabel: current.label,
                    categoryDescription: current.description,
                    categoryCoordinates: current.coordinates.slice(),
                }, { preserveError: true });
            } else {
                setTemplateGenerationAnswer(entry.question.id, {
                    categoryId: '',
                    categoryLabel: '',
                    categoryDescription: '',
                    categoryCoordinates: [],
                }, { preserveError: true });
            }
            updateCategoryHint();
        });

        categoryField.appendChild(categorySelect);
        categoryField.appendChild(categoryHint);
        container.appendChild(categoryField);
    }

    const textarea = document.createElement('textarea');
    textarea.id = inputId;
    textarea.rows = 3;
    if (typeof existing.value === 'string') {
        textarea.value = existing.value;
    }
    let isApplyingLibrarySelection = false;
    let saveButton = null;
    let savingLibrary = false;
    const updateSaveButtonState = () => {
        if (!saveButton) {
            return;
        }
        if (savingLibrary) {
            saveButton.disabled = true;
            return;
        }
        const trimmed = textarea.value.trim();
        saveButton.disabled = trimmed === '';
    };
    textarea.addEventListener('input', () => {
        const value = textarea.value;
        const payload = { type: 'open', value };
        if (!isApplyingLibrarySelection) {
            payload.savedEntryId = '';
            payload.savedEntryLabel = '';
            payload.savedEntryValue = '';
        }
        setTemplateGenerationAnswer(entry.question.id, payload);
        updateSaveButtonState();
    });
    container.appendChild(textarea);

    const savedConfigRaw = metadata.savedResponses;
    const libraryEnabled = savedConfigRaw && typeof savedConfigRaw === 'object' && savedConfigRaw.enabled === true;
    const libraryKey = libraryEnabled && typeof savedConfigRaw.key === 'string' ? savedConfigRaw.key.trim() : '';
    if (libraryEnabled && libraryKey) {
        const allowSave = savedConfigRaw.allowSave !== false;
        const defaults = Array.isArray(savedConfigRaw.defaults) ? savedConfigRaw.defaults : [];
        const libraryField = document.createElement('div');
        libraryField.className = 'template-generate-field template-generate-question-library';
        const libraryLabelEl = document.createElement('label');
        const librarySelectId = `${inputId}-library`;
        libraryLabelEl.setAttribute('for', librarySelectId);
        libraryLabelEl.textContent = typeof savedConfigRaw.label === 'string'
            ? savedConfigRaw.label.trim() || 'Réponses sauvegardées'
            : 'Réponses sauvegardées';
        libraryField.appendChild(libraryLabelEl);

        const libraryActions = document.createElement('div');
        libraryActions.className = 'template-generate-question-library-actions';
        const librarySelect = document.createElement('select');
        librarySelect.id = librarySelectId;
        const entries = getSavedResponseEntries(libraryKey, defaults);
        const entriesById = new Map();
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = entries.length ? 'Sélectionnez une réponse' : 'Aucune réponse disponible';
        librarySelect.appendChild(placeholderOption);
        entries.forEach(item => {
            entriesById.set(item.id, item);
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.label || item.value || item.id;
            librarySelect.appendChild(option);
        });
        librarySelect.disabled = entries.length === 0;

        const applyLibraryEntry = (selectedEntry, options = {}) => {
            if (!selectedEntry) {
                setTemplateGenerationAnswer(entry.question.id, {
                    savedEntryId: '',
                    savedEntryLabel: '',
                    savedEntryValue: '',
                    savedLibraryKey: libraryKey,
                }, { preserveError: true });
                return;
            }
            const { focusTextarea = true, skipValueUpdate = false } = options;
            isApplyingLibrarySelection = true;
            if (!skipValueUpdate) {
                textarea.value = selectedEntry.value ?? '';
            }
            updateSaveButtonState();
            setTemplateGenerationAnswer(entry.question.id, {
                type: 'open',
                value: textarea.value,
                savedEntryId: selectedEntry.id ?? '',
                savedEntryLabel: selectedEntry.label ?? '',
                savedEntryValue: selectedEntry.value ?? '',
                savedLibraryKey: libraryKey,
            });
            isApplyingLibrarySelection = false;
            if (focusTextarea && typeof textarea.focus === 'function') {
                textarea.focus({ preventScroll: false });
            }
        };

        librarySelect.addEventListener('change', () => {
            const selected = entriesById.get(librarySelect.value);
            if (selected) {
                applyLibraryEntry(selected);
            } else {
                setTemplateGenerationAnswer(entry.question.id, {
                    savedEntryId: '',
                    savedEntryLabel: '',
                    savedEntryValue: '',
                    savedLibraryKey: libraryKey,
                }, { preserveError: true });
            }
        });

        libraryActions.appendChild(librarySelect);
        if (allowSave) {
            saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'btn';
            saveButton.textContent = 'Enregistrer cette réponse';
            saveButton.disabled = textarea.value.trim() === '';
            saveButton.addEventListener('click', async () => {
                if (savingLibrary) {
                    return;
                }
                const content = textarea.value.trim();
                if (!content) {
                    window.alert('Écrivez une réponse avant de l’enregistrer.');
                    return;
                }
                const suggested = typeof existing.savedEntryLabel === 'string' && existing.savedEntryLabel.trim()
                    ? existing.savedEntryLabel.trim()
                    : (content.length > 60 ? `${content.slice(0, 57)}…` : content);
                let labelPrompt = window.prompt('Nom de la réponse à sauvegarder', suggested || 'Réponse sauvegardée');
                if (labelPrompt === null) {
                    return;
                }
                labelPrompt = labelPrompt.trim();
                if (!labelPrompt) {
                    labelPrompt = suggested || 'Réponse sauvegardée';
                }
                try {
                    savingLibrary = true;
                    updateSaveButtonState();
                    const originalText = saveButton.textContent;
                    saveButton.textContent = 'Enregistrement…';
                    const savedEntry = await saveSavedResponseEntry(libraryKey, { label: labelPrompt, value: content });
                    const refreshedEntries = getSavedResponseEntries(libraryKey, defaults);
                    entriesById.clear();
                    librarySelect.innerHTML = '';
                    const refreshedPlaceholder = document.createElement('option');
                    refreshedPlaceholder.value = '';
                    refreshedPlaceholder.textContent = 'Sélectionnez une réponse';
                    librarySelect.appendChild(refreshedPlaceholder);
                    refreshedEntries.forEach(item => {
                        entriesById.set(item.id, item);
                        const option = document.createElement('option');
                        option.value = item.id;
                        option.textContent = item.label || item.value || item.id;
                        librarySelect.appendChild(option);
                    });
                    librarySelect.disabled = refreshedEntries.length === 0;
                    librarySelect.value = savedEntry.id;
                    applyLibraryEntry(savedEntry, { focusTextarea: true });
                    saveButton.textContent = originalText;
                } catch (error) {
                    console.error(error);
                    saveButton.textContent = 'Enregistrer cette réponse';
                    const message = error?.message ?? 'Impossible d’enregistrer la réponse.';
                    window.alert(message);
                } finally {
                    savingLibrary = false;
                    updateSaveButtonState();
                }
            });
            libraryActions.appendChild(saveButton);
        }
        libraryField.appendChild(libraryActions);
        const libraryHint = document.createElement('p');
        libraryHint.className = 'template-generate-question-hint';
        libraryHint.textContent = allowSave
            ? 'Sélectionnez ou enregistrez des réponses réutilisables pour accélérer le remplissage.'
            : 'Sélectionnez une réponse sauvegardée pour remplir automatiquement ce champ.';
        libraryField.appendChild(libraryHint);
        container.appendChild(libraryField);

        setTemplateGenerationAnswer(entry.question.id, { savedLibraryKey: libraryKey }, { preserveError: true, clearFeedback: false });
        if (typeof existing.savedEntryId === 'string' && entriesById.has(existing.savedEntryId)) {
            librarySelect.value = existing.savedEntryId;
            applyLibraryEntry(entriesById.get(existing.savedEntryId), { focusTextarea: false, skipValueUpdate: true });
        }
        updateSaveButtonState();
    }

    const noteConfigRaw = metadata.noteSection;
    const noteEnabled = noteConfigRaw && typeof noteConfigRaw === 'object' && noteConfigRaw.enabled === true;
    if (noteEnabled) {
        const noteField = document.createElement('div');
        noteField.className = 'template-generate-field template-generate-question-note';
        const noteId = `${inputId}-note`;
        const noteLabel = document.createElement('label');
        noteLabel.setAttribute('for', noteId);
        noteLabel.textContent = typeof noteConfigRaw.title === 'string'
            ? noteConfigRaw.title.trim() || 'Notes complémentaires'
            : 'Notes complémentaires';
        noteField.appendChild(noteLabel);
        const noteTextarea = document.createElement('textarea');
        noteTextarea.id = noteId;
        noteTextarea.rows = 3;
        if (typeof noteConfigRaw.placeholder === 'string' && noteConfigRaw.placeholder.trim()) {
            noteTextarea.placeholder = noteConfigRaw.placeholder.trim();
        }
        noteTextarea.value = typeof existing.note === 'string' ? existing.note : '';
        noteTextarea.addEventListener('input', () => {
            setTemplateGenerationAnswer(entry.question.id, { note: noteTextarea.value }, { preserveError: true });
        });
        noteField.appendChild(noteTextarea);
        const noteHint = document.createElement('p');
        noteHint.className = 'template-generate-question-hint';
        noteHint.textContent = 'Ce bloc facultatif sera ajouté uniquement si des notes sont saisies.';
        noteField.appendChild(noteHint);
        container.appendChild(noteField);
    }

    if (entry.question.notes) {
        const notes = document.createElement('p');
        notes.className = 'template-generate-question-notes';
        notes.textContent = entry.question.notes;
        container.appendChild(notes);
    }

    updateSaveButtonState();
    return container;
}

function renderTemplateGenerationChoiceQuestion(entry) {
    const container = createQuestionContainer(entry);
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = entry.question.label;
    if (entry.required) {
        const required = document.createElement('span');
        required.className = 'template-generate-question-required';
        required.textContent = '*';
        legend.appendChild(required);
    }
    fieldset.appendChild(legend);

    const existing = templateGenerationAnswers.get(entry.question.id);
    const selectedIds = Array.isArray(existing?.optionIds) ? existing.optionIds : [];
    entry.question.options.forEach((option, index) => {
        const optionId = option.id || `${entry.question.id}-opt-${index}`;
        const wrapper = document.createElement('label');
        wrapper.className = 'template-generate-question-option';
        const input = document.createElement('input');
        input.type = entry.question.allowMultiple ? 'checkbox' : 'radio';
        input.name = `template-question-${entry.question.id}`;
        input.value = option.id || optionId;
        input.checked = selectedIds.includes(input.value);
        input.addEventListener('change', () => {
            const ids = Array.from(fieldset.querySelectorAll('input:checked')).map(el => el.value);
            setTemplateGenerationAnswer(entry.question.id, { type: 'choice', optionIds: ids });
        });
        const span = document.createElement('span');
        span.textContent = option.label || option.value || option.id || `Option ${index + 1}`;
        wrapper.append(input, span);
        fieldset.appendChild(wrapper);
    });

    container.appendChild(fieldset);
    if (entry.question.notes) {
        const notes = document.createElement('p');
        notes.className = 'template-generate-question-notes';
        notes.textContent = entry.question.notes;
        container.appendChild(notes);
    }
    return container;
}

function setTemplateGenerationAnswer(questionId, payload = {}, options = {}) {
    if (!questionId) {
        return;
    }
    const current = templateGenerationAnswers.get(questionId) ?? {};
    const next = { ...current };
    let shouldClearError = options.forceClearError === true;
    if (payload.type) {
        next.type = payload.type;
    }
    if (Array.isArray(payload.optionIds)) {
        const unique = [...new Set(payload.optionIds.map(id => String(id)))];
        next.optionIds = unique;
        if (unique.length) {
            shouldClearError = true;
        }
    }
    if (typeof payload.value === 'string') {
        next.value = payload.value;
        if (payload.value.trim() !== '') {
            shouldClearError = true;
        }
    }
    if ('note' in payload) {
        next.note = typeof payload.note === 'string' ? payload.note : '';
    }
    if ('categoryId' in payload) {
        next.categoryId = typeof payload.categoryId === 'string' ? payload.categoryId : '';
        next.categoryLabel = typeof payload.categoryLabel === 'string' ? payload.categoryLabel : '';
        next.categoryDescription = typeof payload.categoryDescription === 'string' ? payload.categoryDescription : '';
        if (Array.isArray(payload.categoryCoordinates)) {
            next.categoryCoordinates = payload.categoryCoordinates.slice();
        } else if ('categoryCoordinates' in payload) {
            next.categoryCoordinates = [];
        }
    }
    if ('savedEntryId' in payload) {
        next.savedEntryId = typeof payload.savedEntryId === 'string' ? payload.savedEntryId : '';
        next.savedEntryLabel = typeof payload.savedEntryLabel === 'string' ? payload.savedEntryLabel : '';
        next.savedEntryValue = typeof payload.savedEntryValue === 'string' ? payload.savedEntryValue : '';
    }
    if ('savedLibraryKey' in payload) {
        next.savedLibraryKey = typeof payload.savedLibraryKey === 'string' ? payload.savedLibraryKey : '';
    }
    templateGenerationAnswers.set(questionId, next);
    if (shouldClearError && options.preserveError !== true) {
        const element = getTemplateGenerationQuestionElement(questionId);
        element?.classList.remove('has-error');
    }
    if (options.clearFeedback !== false) {
        clearTemplateGenerateFeedback();
    }
}

function getTemplateGenerationQuestionElement(questionId) {
    if (!templateGenerateQuestionList || !questionId) {
        return null;
    }
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return templateGenerateQuestionList.querySelector(`[data-question-id="${CSS.escape(questionId)}"]`);
    }
    return templateGenerateQuestionList.querySelector(`[data-question-id="${questionId}"]`);
}

function validateTemplateGenerationQuestions() {
    if (!templateGenerationQuestionGroups.length) {
        return true;
    }
    let firstInvalid = null;
    for (const group of templateGenerationQuestionGroups) {
        for (const entry of group.questions) {
            if (!entry.required) {
                continue;
            }
            const answer = templateGenerationAnswers.get(entry.question.id);
            let filled = false;
            if (!answer) {
                filled = false;
            } else if (entry.question.type === 'choice' || entry.question.type === 'dot') {
                filled = Array.isArray(answer.optionIds) && answer.optionIds.length > 0;
            } else {
                const value = typeof answer.value === 'string' ? answer.value.trim() : '';
                filled = value !== '';
            }
            if (!filled) {
                const element = getTemplateGenerationQuestionElement(entry.question.id);
                if (element) {
                    element.classList.add('has-error');
                }
                if (!firstInvalid) {
                    firstInvalid = { entry, element };
                }
            }
        }
    }
    if (firstInvalid) {
        const message = `Répondez à la question commune « ${firstInvalid.entry.question.label} ». `;
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = message;
            templateGenerateFeedback.classList.remove('is-success');
        }
        if (firstInvalid.element && typeof firstInvalid.element.scrollIntoView === 'function') {
            firstInvalid.element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            const focusable = firstInvalid.element.querySelector('textarea, input');
            focusable?.focus();
        }
        return false;
    }
    return true;
}

function buildTemplateQuestionPayload(entry, answer) {
    if (!entry || !entry.question || !answer) {
        return null;
    }
    const optionIds = Array.isArray(answer.optionIds) ? answer.optionIds.filter(Boolean) : [];
    const rawValue = typeof answer.value === 'string' ? answer.value : '';
    const payload = {
        classId: entry.classId,
        questionId: entry.question.id,
        optionIds,
        value: rawValue,
    };
    if (entry.targetKey) {
        payload.targetKey = entry.targetKey;
    }
    if (entry.targetGroup) {
        payload.targetGroup = entry.targetGroup;
    }
    const extendedMetadata = {};
    const questionMetadata = entry.question && entry.question.metadata && typeof entry.question.metadata === 'object'
        ? entry.question.metadata
        : {};
    if (typeof answer.categoryId === 'string' && answer.categoryId) {
        const categories = normalizeQuestionCategories(questionMetadata);
        const selectedCategory = findCategoryById(categories, answer.categoryId);
        if (selectedCategory) {
            payload.categoryId = selectedCategory.id;
            payload.categoryLabel = selectedCategory.label;
            payload.categoryDescription = selectedCategory.description;
            if (selectedCategory.coordinates.length) {
                payload.categoryCoordinates = selectedCategory.coordinates.slice();
            }
            extendedMetadata.category = {
                id: selectedCategory.id,
                label: selectedCategory.label,
                description: selectedCategory.description,
                coordinates: selectedCategory.coordinates.slice(),
            };
        }
    }
    const noteConfigRaw = questionMetadata.noteSection;
    const noteEnabled = noteConfigRaw && typeof noteConfigRaw === 'object' && noteConfigRaw.enabled === true;
    const noteValue = typeof answer.note === 'string' ? answer.note.trim() : '';
    if (noteEnabled && noteValue) {
        payload.note = noteValue;
        extendedMetadata.note = {
            value: noteValue,
            title: typeof noteConfigRaw.title === 'string' ? noteConfigRaw.title.trim() : '',
            coordinate: typeof noteConfigRaw.coordinate === 'string' ? noteConfigRaw.coordinate.trim() : '',
        };
    }
    const savedEntryId = typeof answer.savedEntryId === 'string' ? answer.savedEntryId : '';
    const savedEntryLabel = typeof answer.savedEntryLabel === 'string' ? answer.savedEntryLabel : '';
    const savedEntryValue = typeof answer.savedEntryValue === 'string' ? answer.savedEntryValue : '';
    const fallbackLibraryKey = questionMetadata.savedResponses && typeof questionMetadata.savedResponses === 'object'
        && typeof questionMetadata.savedResponses.key === 'string'
        ? questionMetadata.savedResponses.key.trim()
        : '';
    const savedLibraryKey = typeof answer.savedLibraryKey === 'string' && answer.savedLibraryKey.trim()
        ? answer.savedLibraryKey.trim()
        : fallbackLibraryKey;
    if (savedEntryId || savedEntryValue) {
        const savedPayload = {
            id: savedEntryId,
            label: savedEntryLabel || savedEntryValue || savedEntryId,
            value: savedEntryValue || rawValue,
            libraryKey: savedLibraryKey,
        };
        payload.savedResponse = savedPayload;
        extendedMetadata.savedResponse = { ...savedPayload };
    }
    if (Object.keys(extendedMetadata).length) {
        payload.metadata = extendedMetadata;
    }
    return payload;
}

function resolveSharedVerifyValue(fieldKey) {
    const normalizedKey = normalizeCommonKey(fieldKey);
    if (!normalizedKey) {
        return '';
    }
    if (templateGenerationSharedVerifyValues.has(normalizedKey)) {
        const shared = templateGenerationSharedVerifyValues.get(normalizedKey);
        if (typeof shared === 'string' && shared.trim()) {
            return shared;
        }
    }
    for (const client of templateGenerationSelectedClients) {
        const values = templateGenerationVerifyValues.get(client.id);
        const entry = values?.get(normalizedKey);
        if (!entry) {
            continue;
        }
        const value = typeof entry.value === 'string' ? entry.value : '';
        if (value.trim()) {
            return value;
        }
    }
    return '';
}

function exportHiddenTemplateQuestionAnswers() {
    if (!Array.isArray(templateGenerationHiddenQuestionEntries) || !templateGenerationHiddenQuestionEntries.length) {
        return [];
    }
    const extras = [];
    templateGenerationHiddenQuestionEntries.forEach(entry => {
        if (!entry || !entry.question) {
            return;
        }
        const mirror = entry.mirror ?? {};
        if (mirror.type === 'question') {
            const sourceId = typeof mirror.sourceQuestionId === 'string' ? mirror.sourceQuestionId : '';
            if (!sourceId) {
                return;
            }
            const sourceAnswer = templateGenerationAnswers.get(sourceId);
            if (!sourceAnswer) {
                return;
            }
            const payload = buildTemplateQuestionPayload(entry, sourceAnswer);
            if (payload) {
                extras.push(payload);
            }
            return;
        }
        if (mirror.type === 'verify') {
            const fieldKey = normalizeCommonKey(mirror.fieldKey ?? '');
            if (!fieldKey) {
                return;
            }
            const value = resolveSharedVerifyValue(fieldKey);
            if (!value || !value.trim()) {
                return;
            }
            const payload = buildTemplateQuestionPayload(entry, { value });
            if (payload) {
                extras.push(payload);
            }
        }
    });
    return extras;
}

function exportTemplateGenerationAnswers() {
    const results = [];
    for (const group of templateGenerationQuestionGroups) {
        for (const entry of group.questions) {
            const answer = templateGenerationAnswers.get(entry.question.id);
            if (!answer) {
                continue;
            }
            const payload = buildTemplateQuestionPayload(entry, answer);
            if (payload) {
                results.push(payload);
            }
        }
    }
    const hiddenResults = exportHiddenTemplateQuestionAnswers();
    if (hiddenResults.length) {
        results.push(...hiddenResults);
    }
    return results;
}

function findClientInCatalog(requestId) {
    return clientCatalog.find(item => item.id === requestId) ?? null;
}

function renderTemplateGenerationAvailableClients() {
    if (!templateGenerateAvailableList) {
        return;
    }
    templateGenerateAvailableList.innerHTML = '';
    if (templateGenerateAvailableEmpty) {
        templateGenerateAvailableEmpty.hidden = true;
    }
    const selectedIds = new Set(templateGenerationSelectedClients.map(item => item.id));
    const term = templateGenerationSearchTerm.trim().toLowerCase();
    const results = [];
    for (const item of clientCatalog) {
        const haystack = `${item.displayName ?? ''} ${item.id ?? ''}`.toLowerCase();
        if (term && !haystack.includes(term)) {
            continue;
        }
        results.push(item);
        if (results.length >= 30) {
            break;
        }
    }
    if (!term && !results.length) {
        results.push(...clientCatalog.slice(0, 30));
    }
    if (!results.length) {
        if (templateGenerateAvailableEmpty) {
            templateGenerateAvailableEmpty.hidden = false;
        }
        return;
    }
    const reachedLimit = templateGenerationSelectedClients.length >= templateGenerationMaxClients;
    for (const item of results) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        const name = item.displayName ?? item.id ?? 'Client';
        const count = typeof item.documentCount === 'number' ? ` (${item.documentCount})` : '';
        button.textContent = `${name}${count}`;
        const alreadySelected = selectedIds.has(item.id);
        if (alreadySelected || reachedLimit) {
            button.disabled = true;
            button.classList.add('template-generate-limit');
        }
        if (!alreadySelected && !reachedLimit) {
            button.addEventListener('click', () => addTemplateGenerationClient(item.id));
        }
        li.appendChild(button);
        templateGenerateAvailableList.appendChild(li);
    }
}

function renderTemplateGenerationSelectedClients() {
    if (!templateGenerateSelectedList) {
        return;
    }
    templateGenerateSelectedList.innerHTML = '';
    if (!templateGenerationSelectedClients.length) {
        if (templateGenerateSelectedEmpty) {
            templateGenerateSelectedEmpty.hidden = false;
        }
        return;
    }
    if (templateGenerateSelectedEmpty) {
        templateGenerateSelectedEmpty.hidden = true;
    }
    templateGenerationSelectedClients.forEach((client, index) => {
        const li = document.createElement('li');
        li.className = 'template-generate-selected-item';
        const label = document.createElement('span');
        label.className = 'template-generate-selected-label';
        label.textContent = `${index + 1}. ${client.displayName ?? client.id}`;
        const actions = document.createElement('div');
        actions.className = 'template-generate-selected-actions';
        if (index > 0) {
            const upBtn = document.createElement('button');
            upBtn.type = 'button';
            upBtn.textContent = '↑';
            upBtn.title = 'Monter';
            upBtn.addEventListener('click', () => moveTemplateGenerationClient(index, -1));
            actions.appendChild(upBtn);
        }
        if (index < templateGenerationSelectedClients.length - 1) {
            const downBtn = document.createElement('button');
            downBtn.type = 'button';
            downBtn.textContent = '↓';
            downBtn.title = 'Descendre';
            downBtn.addEventListener('click', () => moveTemplateGenerationClient(index, 1));
            actions.appendChild(downBtn);
        }
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.title = `Retirer ${client.displayName ?? client.id}`;
        removeBtn.addEventListener('click', () => removeTemplateGenerationClient(index));
        actions.appendChild(removeBtn);
        li.append(label, actions);
        templateGenerateSelectedList.appendChild(li);
    });
}

function renderTemplateGenerationDestClientSelect() {
    if (!templateGenerateDestClientSelect) {
        return;
    }
    templateGenerateDestClientSelect.innerHTML = '';
    if (!templateGenerationSelectedClients.length) {
        templateGenerateDestClientSelect.disabled = true;
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Sélectionnez des clients pour choisir une destination';
        templateGenerateDestClientSelect.appendChild(option);
        templateGenerationDestClientId = null;
        return;
    }
    templateGenerateDestClientSelect.disabled = false;
    const fragment = document.createDocumentFragment();
    for (const client of templateGenerationSelectedClients) {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.displayName ?? client.id;
        fragment.appendChild(option);
    }
    templateGenerateDestClientSelect.appendChild(fragment);
    if (!templateGenerationDestClientId || !templateGenerationSelectedClients.some(client => client.id === templateGenerationDestClientId)) {
        templateGenerationDestClientId = templateGenerationSelectedClients[0].id;
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
    }
    templateGenerateDestClientSelect.value = templateGenerationDestClientId;
}

function syncTemplateGenerationFolderField() {
    if (!templateGenerateFolderField) {
        return;
    }
    const hasDestination = Boolean(templateGenerationDestClientId);
    const shouldShow = hasDestination && templateGenerationDestinationSelection.mode === 'client';
    templateGenerateFolderField.hidden = !shouldShow;
    if (templateGenerateFolderInput) {
        templateGenerateFolderInput.disabled = !shouldShow;
        const desired = templateGenerationCustomFolderName ?? '';
        if (templateGenerateFolderInput.value !== desired) {
            templateGenerateFolderInput.value = desired;
        }
    }
}

function renderTemplateGenerationDestinationOptions() {
    if (!templateGenerateDestinations) {
        return;
    }
    templateGenerateDestinations.innerHTML = '';
    if (!templateGenerationDestClientId) {
        const empty = document.createElement('p');
        empty.className = 'template-generate-empty';
        empty.textContent = 'Sélectionnez un client destinataire pour choisir l’emplacement.';
        templateGenerateDestinations.appendChild(empty);
        if (templateGenerateFolderField) {
            templateGenerateFolderField.hidden = true;
            if (templateGenerateFolderInput) {
                templateGenerateFolderInput.disabled = true;
            }
        }
        return;
    }
    const entry = templateGenerationDestinationsMap.get(templateGenerationDestClientId);
    const fragment = document.createDocumentFragment();

    const defaultOption = document.createElement('label');
    defaultOption.className = 'template-generate-destination-option';
    const defaultRadio = document.createElement('input');
    defaultRadio.type = 'radio';
    defaultRadio.name = 'template-destination';
    defaultRadio.value = 'client';
    defaultRadio.checked = templateGenerationDestinationSelection.mode === 'client';
    defaultRadio.addEventListener('change', () => {
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
        syncTemplateGenerationFolderField();
        if (templateGenerateFolderInput) {
            requestAnimationFrame(() => {
                templateGenerateFolderInput.focus();
                templateGenerateFolderInput.select();
            });
        }
    });
    const defaultLabel = document.createElement('span');
    defaultLabel.textContent = 'Créer ou utiliser un dossier personnalisé pour ce client';
    defaultOption.append(defaultRadio, defaultLabel);
    fragment.appendChild(defaultOption);

    const existingFolders = Array.isArray(entry?.existing) ? entry.existing : [];
    const currentPath = templateGenerationDestinationSelection.mode === 'existing'
        ? templateGenerationDestinationSelection.existingPath
        : null;
    let hasValidSelection = templateGenerationDestinationSelection.mode === 'client';
    for (const folder of existingFolders) {
        const relativePath = typeof folder.relativePath === 'string' && folder.relativePath !== ''
            ? folder.relativePath
            : null;
        if (!relativePath) {
            continue;
        }
        const option = document.createElement('label');
        option.className = 'template-generate-destination-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'template-destination';
        radio.value = `existing:${relativePath}`;
        const isSelected = currentPath === relativePath;
        if (isSelected) {
            hasValidSelection = true;
        }
        radio.checked = isSelected;
        radio.addEventListener('change', () => {
            templateGenerationDestinationSelection = { mode: 'existing', existingPath: relativePath };
            syncTemplateGenerationFolderField();
        });
        const span = document.createElement('span');
        const folderName = folder.name ?? relativePath;
        span.textContent = folderName;
        option.append(radio, span);
        fragment.appendChild(option);
    }

    if (!hasValidSelection) {
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
        defaultRadio.checked = true;
        syncTemplateGenerationFolderField();
    }

    if (!existingFolders.length) {
        const hint = document.createElement('p');
        hint.className = 'template-generate-empty';
        hint.textContent = 'Aucun dossier existant trouvé. Un nouveau dossier sera créé si nécessaire (nom par défaut « Documents générés »).';
        fragment.appendChild(hint);
    }

    templateGenerateDestinations.appendChild(fragment);
    syncTemplateGenerationFolderField();
}

async function refreshTemplateGenerationDestinations() {
    if (!templateGenerationSelectedClients.length) {
        templateGenerationDestinationsMap = new Map();
        templateGenerationDestClientId = null;
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
        templateGenerationCustomFolderName = '';
        renderTemplateGenerationDestinations();
        syncTemplateGenerationFolderField();
        return;
    }
    if (templateGenerateDestinations) {
        templateGenerateDestinations.innerHTML = '<p class="template-generate-empty">Chargement des dossiers disponibles…</p>';
    }
    const ids = templateGenerationSelectedClients.map(client => client.id);
    try {
        const entries = await fetchSigningDestinations(ids);
        templateGenerationDestinationsMap = new Map(entries.map(item => [item.requestId, item]));
    } catch (error) {
        console.error(error);
        templateGenerationDestinationsMap = new Map();
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Impossible de charger les dossiers disponibles.';
            templateGenerateFeedback.classList.remove('is-success');
        }
    }
    if (!templateGenerationDestClientId || !ids.includes(templateGenerationDestClientId)) {
        templateGenerationDestClientId = ids[0] ?? null;
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
    }
    renderTemplateGenerationDestClientSelect();
    renderTemplateGenerationDestinationOptions();
}

function addTemplateGenerationClient(requestId) {
    if (templateGenerationSelectedClients.length >= templateGenerationMaxClients) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = `Vous avez atteint la limite de ${templateGenerationMaxClients} client(s).`;
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    if (templateGenerationSelectedClients.some(client => client.id === requestId)) {
        return;
    }
    const info = findClientInCatalog(requestId);
    if (!info) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Client introuvable dans le catalogue.';
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    templateGenerationSelectedClients.push({
        id: info.id,
        displayName: info.displayName ?? resolveClientLabel(info.id),
    });
    updateTemplateGenerationMessage();
    renderTemplateGenerationSelectedClients();
    renderTemplateGenerationAvailableClients();
    renderTemplateGenerationDestClientSelect();
    refreshTemplateGenerationDestinations().catch(error => console.error(error));
    refreshTemplateGenerationVerification();
    if (templateGenerateFeedback) {
        templateGenerateFeedback.textContent = '';
        templateGenerateFeedback.classList.remove('is-success');
    }
}

function removeTemplateGenerationClient(index) {
    if (index < 0 || index >= templateGenerationSelectedClients.length) {
        return;
    }
    templateGenerationSelectedClients.splice(index, 1);
    if (!templateGenerationSelectedClients.some(client => client.id === templateGenerationDestClientId)) {
        templateGenerationDestClientId = templateGenerationSelectedClients[0]?.id ?? null;
        templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
    }
    updateTemplateGenerationMessage();
    renderTemplateGenerationSelectedClients();
    renderTemplateGenerationAvailableClients();
    renderTemplateGenerationDestClientSelect();
    refreshTemplateGenerationDestinations().catch(error => console.error(error));
    refreshTemplateGenerationVerification();
}

function moveTemplateGenerationClient(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= templateGenerationSelectedClients.length) {
        return;
    }
    const [entry] = templateGenerationSelectedClients.splice(index, 1);
    templateGenerationSelectedClients.splice(target, 0, entry);
    renderTemplateGenerationSelectedClients();
    renderTemplateGenerationDestClientSelect();
    updateTemplateGenerationMessage();
    refreshTemplateGenerationVerification();
}

function resetTemplateGenerationState() {
    templateGenerationTemplate = null;
    templateGenerationMaxClients = 1;
    templateGenerationSelectedClients = [];
    templateGenerationDestinationsMap = new Map();
    templateGenerationDestClientId = null;
    templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
    templateGenerationCustomFolderName = '';
    templateGenerationSubmitting = false;
    templateGenerationSearchTerm = '';
    resetTemplateGenerationQuestions();
    resetTemplateGenerationVerification();
    stopTemplateGenerationProgress(true);
    syncTemplateGenerationFolderField();
}

function renderTemplateGenerationDestinations() {
    renderTemplateGenerationDestClientSelect();
    renderTemplateGenerationDestinationOptions();
}

function closeTemplateGenerationDialog() {
    if (!templateGenerateDialog) {
        return;
    }
    templateGenerateDialog.hidden = true;
    templateGenerateDialog.setAttribute('aria-hidden', 'true');
    resetTemplateGenerationState();
    if (templateGenerateFeedback) {
        templateGenerateFeedback.textContent = '';
        templateGenerateFeedback.classList.remove('is-success');
    }
}

async function openTemplateGenerationDialog(template) {
    if (!templateGenerateDialog) {
        showFeedback('La génération de modèles n’est pas disponible.');
        return;
    }
    resetTemplateGenerationState();
    templateGenerationTemplate = template;
    const rawMax = Number(template?.maxClients ?? 1);
    templateGenerationMaxClients = Number.isFinite(rawMax) && rawMax > 0 ? Math.min(Math.floor(rawMax), 10) : 1;
    if (templateGenerateFeedback) {
        templateGenerateFeedback.textContent = '';
        templateGenerateFeedback.classList.remove('is-success');
    }
    if (templateGenerateDownloadCheckbox) {
        templateGenerateDownloadCheckbox.checked = false;
    }
    if (templateGenerateSearch) {
        templateGenerateSearch.value = '';
    }

    if (!clientCatalog.length) {
        try {
            await loadRequests();
        } catch (error) {
            console.error(error);
            if (templateGenerateFeedback) {
                templateGenerateFeedback.textContent = 'Impossible de charger la liste des clients.';
            }
        }
    }

    if (selectedClients.size) {
        for (const [id, data] of selectedClients.entries()) {
            if (templateGenerationSelectedClients.length >= templateGenerationMaxClients) {
                break;
            }
            templateGenerationSelectedClients.push({
                id,
                displayName: data.displayName ?? resolveClientLabel(id),
            });
        }
    }

    try {
        await ensureQuestionClassCatalog();
    } catch (error) {
        console.error(error);
    }
    prepareTemplateGenerationQuestions();
    prepareTemplateGenerationVerification();

    updateTemplateGenerationMessage();
    renderTemplateGenerationSelectedClients();
    renderTemplateGenerationAvailableClients();
    renderTemplateGenerationDestinations();
    refreshTemplateGenerationVerification();

    templateGenerateDialog.hidden = false;
    templateGenerateDialog.setAttribute('aria-hidden', 'false');
    const panel = templateGenerateDialog.querySelector('.template-generate-panel');
    panel?.focus();
    requestAnimationFrame(() => {
        templateGenerateSearch?.focus();
    });

    await refreshTemplateGenerationDestinations();
}

async function submitTemplateGeneration() {
    if (!templateGenerateDialog || !templateGenerationTemplate) {
        return;
    }
    if (templateGenerationSubmitting) {
        return;
    }
    const clients = templateGenerationSelectedClients.map(client => client.id).slice(0, templateGenerationMaxClients);
    if (!clients.length) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Sélectionnez au moins un client.';
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    if (clients.length > templateGenerationMaxClients) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = `Vous ne pouvez sélectionner que ${templateGenerationMaxClients} client${templateGenerationMaxClients > 1 ? 's' : ''} pour ce modèle.`;
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    if (templateGenerationMaxClients === 1 && clients.length !== 1) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Sélectionnez le client principal pour ce modèle.';
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    if (!templateGenerationDestClientId) {
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = 'Choisissez un client destinataire.';
            templateGenerateFeedback.classList.remove('is-success');
        }
        return;
    }
    if (!validateTemplateGenerationQuestions()) {
        return;
    }
    if (!validateTemplateGenerationVerification()) {
        return;
    }
    const payload = {
        templateId: templateGenerationTemplate.id,
        clients,
        destination: {
            mode: templateGenerationDestinationSelection.mode,
            requestId: templateGenerationDestClientId,
            existingPath: templateGenerationDestinationSelection.mode === 'existing'
                ? templateGenerationDestinationSelection.existingPath
                : null,
        },
    };
    if (templateGenerationDestinationSelection.mode === 'client') {
        payload.destination.folderName = templateGenerationCustomFolderName ?? '';
    }
    const commonAnswers = exportTemplateGenerationAnswers();
    if (commonAnswers.length) {
        payload.commonAnswers = commonAnswers;
    }
    const verificationUpdates = exportTemplateVerificationUpdates();
    if (verificationUpdates.length) {
        payload.verificationUpdates = verificationUpdates;
    }
    const conflictDecisions = exportTemplateConflictDecisions();
    if (conflictDecisions.length) {
        payload.conflictDecisions = conflictDecisions;
    }
    if (templateGenerateDownloadCheckbox?.checked) {
        payload.download = true;
    }

    templateGenerationSubmitting = true;
    if (templateGenerateSubmit) {
        templateGenerateSubmit.disabled = true;
        templateGenerateSubmit.textContent = 'Génération…';
    }
    if (templateGenerateFeedback) {
        templateGenerateFeedback.textContent = '';
        templateGenerateFeedback.classList.remove('is-success');
    }
    startTemplateGenerationProgress();

    try {
        const response = await fetch(`${config.apiBaseUrl}?action=generateTemplateDocument`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        let body = null;
        try {
            body = await response.json();
        } catch (parseError) {
            if (!response.ok) {
                throw new Error('Réponse invalide du serveur.');
            }
        }
        if (!response.ok) {
            const message = body?.details ?? body?.error ?? 'Impossible de générer le document pré-enregistré.';
            const err = new Error(message);
            err.userMessage = message;
            throw err;
        }
        const documentInfo = body?.data?.document ?? null;
        completeTemplateGenerationProgress();
        closeTemplateGenerationDialog();
        showFeedback('Document pré-enregistré généré.');
        showToast('Succès!');
        if (payload.destination?.requestId && payload.destination.requestId === activeRequestId) {
            refreshDocuments(true).catch(error => console.error(error));
        }
        if (payload.download && documentInfo?.relativePath) {
            window.open(documentInfo.relativePath, '_blank', 'noopener');
        }
    } catch (error) {
        console.error(error);
        const message = error?.userMessage ?? 'Impossible de générer le document pré-enregistré.';
        if (templateGenerateFeedback) {
            templateGenerateFeedback.textContent = message;
            templateGenerateFeedback.classList.remove('is-success');
        }
        stopTemplateGenerationProgress(true);
    } finally {
        templateGenerationSubmitting = false;
        if (templateGenerateSubmit) {
            templateGenerateSubmit.disabled = false;
            templateGenerateSubmit.textContent = 'Générer';
        }
        if (!templateGenerateDialog || templateGenerateDialog.hidden) {
            stopTemplateGenerationProgress(true);
        }
    }
}

const pastelPalette = [
    '#A5D8FF',
    '#FFE8A3',
    '#B8F2E6',
    '#D8B4FE',
    '#FFD6E8',
    '#C1F0B0',
    '#BBD0FF',
    '#F6D9FF',
    '#B0E5FF',
    '#FAD4A5',
];

const clientColorAssignments = new Map();

function ensureViewerState() {
    if (!viewer) return;
    viewer.classList.toggle('has-workspaces', workspaces.size > 0);
}

function getActiveWorkspace() {
    return activeDocKey ? workspaces.get(activeDocKey) ?? null : null;
}

function getActiveEditor() {
    return getActiveWorkspace()?.editor ?? null;
}

function showFeedback(message) {
    const editor = getActiveEditor();
    if (editor) {
        editor.feedback(message);
        return;
    }
    if (!message) {
        globalFeedback.textContent = '';
        globalFeedback.classList.remove('is-visible');
        globalFeedback.hidden = true;
        return;
    }
    globalFeedback.textContent = message;
    globalFeedback.classList.add('is-visible');
    globalFeedback.hidden = false;
    clearTimeout(globalFeedback._timeout);
    globalFeedback._timeout = setTimeout(() => {
        globalFeedback.classList.remove('is-visible');
        globalFeedback.hidden = true;
    }, 2400);
}

function setTemplateGenerationProgress(value) {
    templateGenerationProgressValue = Math.max(0, Math.min(100, value));
    if (templateGenerateProgressBar) {
        templateGenerateProgressBar.style.width = `${templateGenerationProgressValue}%`;
    }
    if (templateGenerateProgressLabel) {
        templateGenerateProgressLabel.textContent = `${Math.round(templateGenerationProgressValue)}%`;
    }
}

function startTemplateGenerationProgress() {
    if (!templateGenerateProgress) {
        return;
    }
    templateGenerateProgress.hidden = false;
    setTemplateGenerationProgress(1);
    if (templateGenerateProgressMessage) {
        templateGenerateProgressMessage.textContent = 'Préparation du document…';
    }
    if (templateGenerationProgressTimer) {
        clearInterval(templateGenerationProgressTimer);
    }
    templateGenerationProgressTimer = setInterval(() => {
        if (templateGenerationProgressValue >= 90) {
            return;
        }
        const increment = Math.random() * 6 + 3;
        setTemplateGenerationProgress(Math.min(90, templateGenerationProgressValue + increment));
    }, 320);
}

function completeTemplateGenerationProgress(message = 'Succès!') {
    if (!templateGenerateProgress) {
        return;
    }
    if (templateGenerationProgressTimer) {
        clearInterval(templateGenerationProgressTimer);
        templateGenerationProgressTimer = null;
    }
    setTemplateGenerationProgress(100);
    if (templateGenerateProgressMessage) {
        templateGenerateProgressMessage.textContent = message;
    }
}

function stopTemplateGenerationProgress(reset = false) {
    if (templateGenerationProgressTimer) {
        clearInterval(templateGenerationProgressTimer);
        templateGenerationProgressTimer = null;
    }
    if (!templateGenerateProgress) {
        return;
    }
    if (reset) {
        setTemplateGenerationProgress(0);
        if (templateGenerateProgressMessage) {
            templateGenerateProgressMessage.textContent = '';
        }
        templateGenerateProgress.hidden = true;
    }
}

function showToast(message, options = {}) {
    if (!toastContainer || !message) {
        return;
    }
    const { type = 'success', duration = 3200 } = options;
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'success') {
        toast.classList.add('toast--success');
    } else if (type === 'error') {
        toast.classList.add('toast--error');
    }
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });
    setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 320);
    }, Math.max(1200, duration));
}

function destroyWorkspace(key) {
    const entry = workspaces.get(key);
    if (!entry) return;
    entry.container.remove();
    workspaces.delete(key);
    if (activeDocKey === key) {
        activeDocKey = null;
    }
    ensureViewerState();
    updateHistoryButtons();
}

function updateWorkspaceMetadata(key) {
    const entry = workspaces.get(key);
    if (!entry) return;
    const title = entry.container.querySelector('[data-role="workspace-title"]');
    const clientLabel = entry.container.querySelector('[data-role="workspace-client"]');
    const meta = entry.meta ?? {};
    if (title) {
        title.textContent = meta.name ?? 'Document';
    }
    if (clientLabel) {
        const client = selectedClients.get(meta.requestId ?? '') ?? {};
        const accent = getClientColor(meta.requestId ?? '');
        entry.container.style.setProperty('--client-accent', accent);
        entry.container.style.setProperty('--client-text', deriveTextColor(accent));
        clientLabel.textContent = client.displayName ?? meta.requestId ?? '';
    }
}

function refreshWorkspaceMetadata() {
    for (const key of workspaces.keys()) {
        updateWorkspaceMetadata(key);
    }
}

function applyWorkspaceOrder() {
    if (!viewer || !selectedDocuments.length) {
        return;
    }
    const fragment = document.createDocumentFragment();
    for (const key of selectedDocuments) {
        const entry = workspaces.get(key);
        if (entry?.container?.parentNode === viewer) {
            fragment.appendChild(entry.container);
        } else if (entry?.container) {
            fragment.appendChild(entry.container);
        }
    }
    viewer.appendChild(fragment);
}

function setActiveWorkspace(key) {
    if (activeDocKey === key) {
        return;
    }
    if (activeDocKey && workspaces.has(activeDocKey)) {
        workspaces.get(activeDocKey).container.classList.remove('is-active');
    }
    activeDocKey = key;
    const entry = workspaces.get(key);
    if (entry) {
        entry.container.classList.add('is-active');
        entry.editor.config.fontSize = baseEditorConfig.fontSize;
        entry.editor.config.fontFamily = baseEditorConfig.fontFamily;
        updateZoomLabel();
    }
    toggleFloatingTools(Boolean(entry));
    if (entry?.meta?.requestId && activeRequestId !== entry.meta.requestId) {
        activeRequestId = entry.meta.requestId;
        refreshClientButtons();
        updateSelectedClientsUi();
        refreshDocuments(false).catch(console.error);
    }
    refreshDocumentButtonStates();
    updateSelectedList();
    updateNavigationButtons();
    updateDocumentClientContext();
    updateHistoryButtons();
}

function createWorkspace(meta) {
    const key = getDocumentKey(meta);
    if (workspaces.has(key)) {
        const entry = workspaces.get(key);
        entry.meta = meta;
        updateWorkspaceMetadata(key);
        return entry;
    }
    if (!workspaceTemplate || !viewer) {
        throw new Error('Modèle d’espace de travail introuvable.');
    }
    const fragment = workspaceTemplate.content.cloneNode(true);
    const section = fragment.querySelector('.pdf-workspace');
    section.dataset.docKey = key;
    const focusBtn = section.querySelector('[data-role="workspace-focus"]');
    const closeBtn = section.querySelector('[data-role="workspace-close"]');
    const canvasHost = section.querySelector('.pdf-workspace-canvas');
    const hintEl = section.querySelector('.editing-hint');
    const feedbackEl = section.querySelector('.editor-feedback');
    focusBtn?.addEventListener('click', () => setActiveWorkspace(key));
    closeBtn?.addEventListener('click', () => removeSelection(key));
    section.addEventListener('pointerdown', () => setActiveWorkspace(key));
    section.addEventListener('focusin', () => setActiveWorkspace(key));
    viewer.appendChild(section);
    ensureViewerState();
    let workspaceEntry = null;
    const editor = createPdfEditor(canvasHost, {
        pdfGeneratorUrl: config.pdfGeneratorUrl,
        feedbackEl,
        editingHintEl: hintEl,
        fontOptions: ['Helvetica', 'DejaVuSans', 'Arial', 'Times New Roman'],
        onHistoryChange: history => {
            if (workspaceEntry) {
                workspaceEntry.historyState = history;
            }
            if (activeDocKey === key) {
                updateHistoryButtons(history);
            }
        },
    });
    editor.config.fontSize = baseEditorConfig.fontSize;
    editor.config.fontFamily = baseEditorConfig.fontFamily;
    workspaceEntry = { editor, container: section, meta, loaded: false, historyState: { canUndo: false, canRedo: false } };
    workspaces.set(key, workspaceEntry);
    updateWorkspaceMetadata(key);
    applyWorkspaceOrder();
    updateHistoryButtons();
    return workspaceEntry;
}
function hexToRgba(hex, alpha = 1) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex) {
    if (typeof hex !== 'string') {
        return { r: 189, g: 189, b: 189 };
    }
    const match = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) {
        return { r: 189, g: 189, b: 189 };
    }
    let value = match[1];
    if (value.length === 3) {
        value = value.split('').map(ch => ch + ch).join('');
    }
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
}

function deriveTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const darken = value => Math.max(0, Math.min(255, Math.round(value * 0.33)));
    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
}

function getClientColor(id) {
    if (!id) {
        return pastelPalette[0];
    }
    if (clientColorAssignments.has(id)) {
        return clientColorAssignments.get(id);
    }
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    const used = new Set(clientColorAssignments.values());
    let color = pastelPalette[hash % pastelPalette.length];
    if (used.has(color) && used.size < pastelPalette.length) {
        for (let i = 0; i < pastelPalette.length; i++) {
            const candidate = pastelPalette[(hash + i) % pastelPalette.length];
            if (!used.has(candidate)) {
                color = candidate;
                break;
            }
        }
    }
    clientColorAssignments.set(id, color);
    return color;
}

function resolveClientLabel(id) {
    if (!id) {
        return '';
    }
    const info = selectedClients.get(id);
    if (info?.displayName) {
        return info.displayName;
    }
    return id;
}

function updateDocumentClientContext() {
    if (!documentList) {
        return;
    }
    documentList.style.setProperty('--document-accent', '#76BC21');
    documentList.style.setProperty('--document-accent-soft', 'rgba(181, 228, 135, 0.68)');
    if (!activeRequestId || !selectedClients.has(activeRequestId)) {
        documentList.style.setProperty('--document-client-accent', '#4A8A1A');
        documentList.dataset.clientId = '';
        return;
    }
    const accent = getClientColor(activeRequestId);
    documentList.style.setProperty('--document-client-accent', accent);
    documentList.dataset.clientId = activeRequestId;
}

function updateNavigationButtons() {
    if (!floatingPrevPage && !floatingNextPage) {
        return;
    }
    if (floatingTools?.hidden) {
        if (floatingPrevPage) {
            floatingPrevPage.disabled = true;
        }
        if (floatingNextPage) {
            floatingNextPage.disabled = true;
        }
        return;
    }
    const editor = getActiveEditor();
    const pageCount = typeof editor?.getPageCount === 'function' ? editor.getPageCount() : 0;
    const hasDocument = pageCount > 0;
    const currentIndex = hasDocument && typeof editor?.getFocusedPageIndex === 'function'
        ? editor.getFocusedPageIndex()
        : 0;
    if (floatingPrevPage) {
        floatingPrevPage.disabled = !hasDocument || currentIndex <= 0;
    }
    if (floatingNextPage) {
        floatingNextPage.disabled = !hasDocument || currentIndex >= pageCount - 1;
    }
}

function scheduleNavigationUpdate() {
    if (navUpdateQueued) {
        return;
    }
    navUpdateQueued = true;
    requestAnimationFrame(() => {
        navUpdateQueued = false;
        updateNavigationButtons();
    });
}

function updateHistoryButtons(stateOverride = null) {
    if (!undoButton && !redoButton) {
        return;
    }
    const workspace = getActiveWorkspace();
    const baseState = stateOverride ?? workspace?.historyState ?? { canUndo: false, canRedo: false };
    const hasEditor = Boolean(workspace?.editor);
    if (undoButton) {
        undoButton.disabled = !hasEditor || !baseState.canUndo;
    }
    if (redoButton) {
        redoButton.disabled = !hasEditor || !baseState.canRedo;
    }
}

function toggleFloatingTools(visible) {
    if (!floatingTools) return;
    floatingTools.hidden = !visible;
    if (visible) {
        updateNavigationButtons();
    } else {
        if (floatingPrevPage) {
            floatingPrevPage.disabled = true;
        }
        if (floatingNextPage) {
            floatingNextPage.disabled = true;
        }
    }
}

function refreshDocumentButtonStates() {
    if (!documentList) return;
    for (const btn of documentList.querySelectorAll('.document-button')) {
        const key = getDocumentKey({
            requestId: btn.dataset.requestId,
            name: btn.dataset.documentName,
            relativePath: btn.dataset.documentPath,
        });
        btn.setAttribute('aria-pressed', key === activeDocKey ? 'true' : 'false');
    }
}

function setVariablesCollapsed(collapsed) {
    if (!variablePanel || !collapseVariablesBtn) return;
    variablePanel.classList.toggle('collapsed', collapsed);
    collapseVariablesBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    collapseVariablesBtn.textContent = collapsed ? '+' : '−';
}

function showVariablePanel() {
    if (!variablePanel) return;
    if (variablePanel.hidden) {
        variablePanel.hidden = false;
    }
    setVariablesCollapsed(false);
    variablePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

fontSizeInput.addEventListener('change', () => {
    baseEditorConfig.fontSize = Number(fontSizeInput.value);
    const editor = getActiveEditor();
    if (editor) {
        editor.config.fontSize = baseEditorConfig.fontSize;
    }
});
fontFamilyInput.addEventListener('change', () => {
    baseEditorConfig.fontFamily = fontFamilyInput.value;
    const editor = getActiveEditor();
    if (editor) {
        editor.config.fontFamily = baseEditorConfig.fontFamily;
    }
});

zoomInBtn.addEventListener('click', () => {
    const editor = getActiveEditor();
    if (!editor) return;
    editor.zoom(1.1);
    updateZoomLabel();
});
zoomOutBtn.addEventListener('click', () => {
    const editor = getActiveEditor();
    if (!editor) return;
    editor.zoom(0.9);
    updateZoomLabel();
});

function updateZoomLabel() {
    const zoomLabel = document.getElementById('zoom-level');
    const editor = getActiveEditor();
    const scale = editor ? editor.state.scale : 1;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Erreur réseau');
    }
    return response.json();
}

async function postJson(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    let data = null;
    try {
        data = await response.json();
    } catch (error) {
        if (response.ok) {
            throw new Error('Réponse JSON invalide.');
        }
    }
    if (!response.ok) {
        const message = data?.error ?? 'Erreur lors de la requête.';
        throw new Error(message);
    }
    return data;
}

async function fetchSigningDestinations(requestIds = []) {
    if (!Array.isArray(requestIds) || !requestIds.length) {
        return [];
    }
    const params = new URLSearchParams({
        action: 'listSigningDestinations',
        requests: requestIds.join(','),
    });
    try {
        const { data } = await fetchJson(`${config.apiBaseUrl}?${params.toString()}`);
        const entries = Array.isArray(data?.requests) ? data.requests : [];
        return entries.map(item => ({
            requestId: item.requestId,
            displayName: item.displayName ?? resolveClientLabel(item.requestId),
            existing: Array.isArray(item.existing) ? item.existing : [],
        }));
    } catch (error) {
        console.error(error);
        showFeedback('Impossible de charger les dossiers disponibles.');
        return [];
    }
}

async function loadRequests() {
    const { data } = await fetchJson(`${config.apiBaseUrl}?action=listRequests`);
    clientCatalog = Array.isArray(data) ? data : [];
    renderCustomerSearchResults();
}

function refreshClientButtons() {
    for (const btn of customersList.querySelectorAll('button')) {
        const id = btn.dataset.requestId;
        const isSelected = selectedClients.has(id);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        btn.classList.toggle('is-selected', isSelected);
    }
}

function renderDocumentClientTabs() {
    if (!documentClientTabs) {
        return;
    }
    documentClientTabs.innerHTML = '';
    if (!selectedClients.size) {
        documentClientTabs.hidden = true;
        return;
    }
    documentClientTabs.hidden = false;
    for (const [id, data] of selectedClients.entries()) {
        const wrapper = document.createElement('div');
        wrapper.className = 'document-client-tab-wrapper';

        const folderBtn = document.createElement('button');
        folderBtn.type = 'button';
        folderBtn.className = 'document-client-folder';
        folderBtn.textContent = '📁';
        const label = data.displayName ?? id;
        folderBtn.title = `Ouvrir dossier ${label}`;
        folderBtn.setAttribute('aria-label', `Ouvrir dossier ${label}`);
        folderBtn.addEventListener('click', event => {
            event.stopPropagation();
            openClientFolderBrowser(id);
        });

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'document-client-tab';
        button.textContent = label;
        if (id === activeRequestId) {
            button.classList.add('is-active');
            wrapper.classList.add('is-active');
        }
        button.addEventListener('click', () => {
            if (activeRequestId === id) {
                return;
            }
            activeRequestId = id;
            if (documentSearchInput) {
                documentSearchInput.value = '';
            }
            refreshClientButtons();
            updateSelectedClientsUi();
            refreshDocuments(true).catch(console.error);
        });

        wrapper.append(folderBtn, button);
        documentClientTabs.appendChild(wrapper);
    }
}

function attachSignatureMenu(triggerBtn, menuBtn) {
    if (!triggerBtn || !menuBtn) {
        return null;
    }
    const host = triggerBtn.parentElement;
    let showTimer = null;
    let hideTimer = null;

    const clearShowTimer = () => {
        if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
        }
    };

    const clearHideTimer = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    };

    const hide = () => {
        clearShowTimer();
        clearHideTimer();
        menuBtn.hidden = true;
        menuBtn.classList.remove('is-visible');
        host?.classList.remove('signature-menu-visible');
    };

    const scheduleHideCountdown = () => {
        if (menuBtn.hidden) {
            return;
        }
        clearHideTimer();
        hideTimer = window.setTimeout(() => {
            const active = document.activeElement;
            if (!menuBtn.matches(':hover') && active !== menuBtn) {
                hide();
            }
        }, 4000);
    };

    const reveal = () => {
        clearShowTimer();
        menuBtn.hidden = false;
        menuBtn.classList.add('is-visible');
        host?.classList.add('signature-menu-visible');
        scheduleHideCountdown();
    };

    const startRevealTimer = () => {
        clearShowTimer();
        showTimer = window.setTimeout(reveal, 500);
    };

    const cancelReveal = () => {
        clearShowTimer();
        scheduleHideCountdown();
    };

    triggerBtn.addEventListener('mouseenter', startRevealTimer);
    triggerBtn.addEventListener('focus', startRevealTimer);
    triggerBtn.addEventListener('mouseleave', cancelReveal);
    triggerBtn.addEventListener('blur', cancelReveal);

    menuBtn.addEventListener('mouseenter', clearHideTimer);
    menuBtn.addEventListener('focus', clearHideTimer);
    menuBtn.addEventListener('mouseleave', scheduleHideCountdown);
    menuBtn.addEventListener('blur', scheduleHideCountdown);

    menuBtn.hidden = true;
    return { hide };
}

function updateSelectedClientsUi() {
    if (!selectedClientsList || !selectedClientsBox || !selectedClientTemplate) {
        return;
    }
    selectedClientsList.innerHTML = '';
    if (!selectedClients.size) {
        selectedClientsBox.hidden = true;
        return;
    }
    selectedClientsBox.hidden = false;
    for (const [id, data] of selectedClients.entries()) {
        const node = selectedClientTemplate.content.firstElementChild.cloneNode(true);
        const button = node.querySelector('button');
        button.textContent = data.displayName ?? id;
        const accent = getClientColor(id);
        button.style.setProperty('--client-accent', accent);
        button.style.setProperty('--client-text', deriveTextColor(accent));
        if (id === activeRequestId) {
            button.classList.add('is-active');
        }
        button.addEventListener('click', () => {
            activeRequestId = id;
            refreshClientButtons();
            updateSelectedClientsUi();
            refreshDocuments(false).catch(console.error);
        });
        selectedClientsList.appendChild(node);
    }
    updateDocumentClientContext();
    renderDocumentClientTabs();
}

function getAvailableVariableClasses() {
    const groups = Array.isArray(variableDefinitions?.groups) ? variableDefinitions.groups : [];
    return groups
        .map(group => {
            if (!group || typeof group !== 'object') {
                return null;
            }
            const id = typeof group.id === 'string' ? group.id.trim() : '';
            if (!id) {
                return null;
            }
            const labelRaw = typeof group.label === 'string' ? group.label.trim() : '';
            const label = labelRaw || id;
            return { id, label };
        })
        .filter(Boolean);
}

function renderVariableAccessMenu() {
    if (!variableAccessList) {
        return;
    }
    variableAccessList.innerHTML = '';
    const options = getAvailableVariableClasses().filter(item => !variableAccessSelections.includes(item.id));
    if (variableAccessEmpty) {
        variableAccessEmpty.hidden = options.length !== 0;
    }
    if (!options.length) {
        return;
    }
    const fragment = document.createDocumentFragment();
    options.forEach(item => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = item.label;
        button.addEventListener('click', () => addVariableAccessClass(item.id));
        li.appendChild(button);
        fragment.appendChild(li);
    });
    variableAccessList.appendChild(fragment);
}

function renderVariableAccessShortcuts() {
    if (!variableAccessShortcuts) {
        return;
    }
    const available = new Map();
    for (const entry of getAvailableVariableClasses()) {
        available.set(entry.id, entry);
    }
    const normalized = [];
    variableAccessShortcuts.innerHTML = '';
    for (const classId of variableAccessSelections) {
        if (!available.has(classId)) {
            continue;
        }
        const info = available.get(classId);
        normalized.push(classId);
        const chip = document.createElement('div');
        chip.className = 'variable-access-chip';
        chip.dataset.groupId = info.id;
        const labelButton = document.createElement('button');
        labelButton.type = 'button';
        labelButton.className = 'variable-access-chip-label';
        labelButton.textContent = info.label;
        labelButton.addEventListener('click', () => focusVariableGroup(info.id));
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'variable-access-chip-remove';
        removeButton.setAttribute('aria-label', `Retirer ${info.label} de l’accès rapide`);
        removeButton.textContent = '×';
        removeButton.addEventListener('click', event => {
            event.stopPropagation();
            removeVariableAccessClass(info.id);
        });
        chip.append(labelButton, removeButton);
        variableAccessShortcuts.appendChild(chip);
    }
    if (normalized.length !== variableAccessSelections.length) {
        variableAccessSelections = normalized;
        saveVariableAccessSelections();
    }
    variableAccessShortcuts.hidden = normalized.length === 0;
    if (variableAccessPopover && !variableAccessPopover.hidden) {
        renderVariableAccessMenu();
    }
}

function handleVariableAccessOutside(event) {
    if (!variableAccessPopover || variableAccessPopover.hidden) {
        return;
    }
    if (variableAccessPopover.contains(event.target) || variableAccessButton?.contains(event.target)) {
        return;
    }
    toggleVariableAccessPopover(false);
}

function handleVariableAccessKeydown(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        if (variableAccessPopover && !variableAccessPopover.hidden) {
            event.stopPropagation();
            toggleVariableAccessPopover(false);
            variableAccessButton?.focus();
        }
    }
}

function toggleVariableAccessPopover(show) {
    if (!variableAccessPopover || !variableAccessButton) {
        return;
    }
    const shouldShow = show === undefined ? variableAccessPopover.hidden : show;
    if (shouldShow) {
        renderVariableAccessMenu();
        variableAccessPopover.hidden = false;
        variableAccessButton.setAttribute('aria-expanded', 'true');
        variableAccessPopover.setAttribute('aria-hidden', 'false');
        document.addEventListener('mousedown', handleVariableAccessOutside);
        document.addEventListener('keydown', handleVariableAccessKeydown, true);
        const initialTarget = variableAccessList?.querySelector('button') ?? variableAccessCloseButton ?? variableAccessButton;
        initialTarget?.focus();
    } else {
        variableAccessPopover.hidden = true;
        variableAccessButton.setAttribute('aria-expanded', 'false');
        variableAccessPopover.setAttribute('aria-hidden', 'true');
        document.removeEventListener('mousedown', handleVariableAccessOutside);
        document.removeEventListener('keydown', handleVariableAccessKeydown, true);
    }
}

function addVariableAccessClass(classId) {
    const normalized = typeof classId === 'string' ? classId.trim() : '';
    if (!normalized) {
        return;
    }
    if (!variableAccessSelections.includes(normalized)) {
        variableAccessSelections.push(normalized);
        saveVariableAccessSelections();
        renderVariableAccessShortcuts();
    }
    toggleVariableAccessPopover(false);
    focusVariableGroup(normalized);
}

function removeVariableAccessClass(classId) {
    const normalized = typeof classId === 'string' ? classId.trim() : '';
    if (!normalized) {
        return;
    }
    const next = variableAccessSelections.filter(id => id !== normalized);
    if (next.length === variableAccessSelections.length) {
        return;
    }
    variableAccessSelections = next;
    saveVariableAccessSelections();
    renderVariableAccessShortcuts();
}

function focusVariableGroup(groupId) {
    if (!groupId) {
        return;
    }
    showVariablePanel();
    let target = null;
    if (groupId === 'admin') {
        target = adminVariableList?.parentElement ?? variablePanel?.querySelector('[data-group="admin"]');
    } else {
        target = variablePanel?.querySelector(`[data-variable-group="${groupId}"]`) ?? variablePanel?.querySelector(`[data-group="${groupId}"]`);
    }
    if (target instanceof HTMLElement) {
        if (target instanceof HTMLDetailsElement) {
            target.open = true;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        highlightVariableGroup(target);
    }
}

function highlightVariableGroup(element) {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    element.classList.add('variable-highlight');
    window.setTimeout(() => {
        element.classList.remove('variable-highlight');
    }, 1600);
}

function getGroupDefinition(id) {
    return variableDefinitions?.groups?.find(group => group.id === id) ?? null;
}

function toSnakeCase(value) {
    if (!value) {
        return '';
    }
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s\-\/]+/gu, '_')
        .replace(/[^\p{L}\p{N}_]+/gu, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
}

function canonicalizeVariableKey(key) {
    if (!key) {
        return '';
    }
    const snake = toSnakeCase(key);
    if (!snake) {
        return '';
    }
    const segments = snake.split('_').filter(Boolean);
    if (!segments.length) {
        return snake;
    }
    while (segments.length && VARIABLE_CONTAINER_SEGMENTS.has(segments[0])) {
        segments.shift();
    }
    return segments.length ? segments.join('_') : snake;
}

function isDocumentsRequiredCanonical(canonical) {
    if (!canonical) {
        return false;
    }
    return canonical.startsWith(DOCUMENTS_REQUIRED_CANONICAL_PREFIX);
}

function getClientDocumentsRequiredList(clientData) {
    const documents = clientData?.request?.documents_required;
    return Array.isArray(documents) ? documents : [];
}

function normalizeDocumentsRequiredValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value.trim();
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(item => normalizeDocumentsRequiredValue(item)).filter(Boolean).join(' ');
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return '';
        }
    }
    return '';
}

function matchesDocumentsRequiredValue(clientData, value) {
    const normalizedValue = normalizeDocumentsRequiredValue(value);
    if (!normalizedValue) {
        return false;
    }
    const documents = getClientDocumentsRequiredList(clientData);
    if (!documents.length) {
        return false;
    }
    return documents.some(entry => normalizeDocumentsRequiredValue(entry) === normalizedValue);
}

function isDocumentsRequiredEntry(clientData, key, value, canonicalHint) {
    const canonical = canonicalHint ?? canonicalizeVariableKey(key ?? '');
    if (isDocumentsRequiredCanonical(canonical)) {
        return true;
    }
    if (!canonical) {
        return matchesDocumentsRequiredValue(clientData, value);
    }
    if (/^[0-9]+$/.test(canonical)) {
        return matchesDocumentsRequiredValue(clientData, value);
    }
    return false;
}

function shouldHideClientRequestField(clientData, key, value) {
    const canonical = canonicalizeVariableKey(key ?? '');
    if (isDocumentsRequiredEntry(clientData, key, value, canonical)) {
        return true;
    }
    if (!canonical) {
        return false;
    }
    return HIDDEN_CLIENT_REQUEST_KEY_SET.has(canonical);
}

function shouldExcludeClientOptionalField(clientData, key, value) {
    const canonical = canonicalizeVariableKey(key ?? '');
    if (isDocumentsRequiredEntry(clientData, key, value, canonical)) {
        return true;
    }
    if (!canonical) {
        return false;
    }
    return OPTIONAL_CLIENT_EXCLUDED_KEY_SET.has(canonical);
}

function humanizeVariableKey(key) {
    if (!key) {
        return '';
    }
    const prepared = key
        .replace(/[_\.]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    const words = prepared
        .split(/\s+/)
        .map(word => word.trim())
        .filter(Boolean)
        .map(word => {
            if (/^[0-9]+$/.test(word)) {
                return word;
            }
            if (word.length <= 2) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
    if (!words.length) {
        return key;
    }
    return words.join(' ');
}

function computeAutoKeyScore(key, canonical) {
    if (!key) {
        return 3;
    }
    if (key === canonical) {
        return 0;
    }
    const snake = toSnakeCase(key);
    if (snake === canonical) {
        return 1;
    }
    return 2;
}

function deriveAutoGroupId(canonical) {
    if (!canonical) {
        return 'autres';
    }
    const segments = canonical.split('_').filter(Boolean);
    if (segments.length <= 1) {
        return 'autres';
    }
    const first = segments[0];
    if (!first || /^[0-9]+$/.test(first)) {
        const fallback = segments.find(segment => !/^[0-9]+$/.test(segment));
        return fallback ?? 'autres';
    }
    return first;
}

function formatAutoGroupLabel(id) {
    if (!id || id === 'autres') {
        return 'Autres';
    }
    return humanizeVariableKey(id);
}

function collectDiscoveredVariableGroups(clientData, knownCanonicalKeys) {
    const request = clientData?.request ?? {};
    const variableMap = request.variables && typeof request.variables === 'object'
        ? request.variables
        : {};
    const canonicalEntries = new Map();
    for (const [key, rawValue] of Object.entries(variableMap)) {
        if (!key) {
            continue;
        }
        const canonical = canonicalizeVariableKey(key);
        if (!canonical || (knownCanonicalKeys && knownCanonicalKeys.has(canonical))) {
            continue;
        }
        const candidate = {
            key,
            canonical,
            label: humanizeVariableKey(key),
            value: rawValue,
            score: computeAutoKeyScore(key, canonical),
        };
        const existing = canonicalEntries.get(canonical);
        if (!existing
            || candidate.score < existing.score
            || (candidate.score === existing.score && candidate.key.length < existing.key.length)
            || (candidate.score === existing.score && candidate.key.length === existing.key.length && candidate.key < existing.key)
        ) {
            canonicalEntries.set(canonical, candidate);
        }
    }

    if (!canonicalEntries.size) {
        return { groups: [], total: 0 };
    }

    const grouped = new Map();
    let total = 0;
    for (const entry of canonicalEntries.values()) {
        const groupId = deriveAutoGroupId(entry.canonical);
        let bucket = grouped.get(groupId);
        if (!bucket) {
            bucket = { id: groupId, label: formatAutoGroupLabel(groupId), items: [] };
            grouped.set(groupId, bucket);
        }
        bucket.items.push(entry);
        total += 1;
    }

    const groups = Array.from(grouped.values());
    for (const group of groups) {
        group.items.sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));
    }
    groups.sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));

    return { groups, total };
}

function formatDiscoveredFieldLabel(group, entry) {
    const baseLabel = entry.label ?? humanizeVariableKey(entry.key);
    if (!group || group.id === 'autres' || !group.label) {
        return baseLabel;
    }
    const lowerId = group.id.toLowerCase();
    if ((lowerId === 'actifs' || lowerId === 'passifs') && entry.canonical) {
        const segments = entry.canonical.split('_').filter(Boolean);
        if (segments.length >= 2 && /^[0-9]+$/.test(segments[1])) {
            const rawIndex = Number.parseInt(segments[1], 10);
            const displayIndex = Number.isNaN(rawIndex) ? segments[1] : rawIndex + 1;
            const suffixKey = segments.slice(2).join('_');
            const suffixLabel = (suffixKey ? humanizeVariableKey(suffixKey) : baseLabel) || baseLabel;
            if (lowerId === 'passifs') {
                return `${suffixLabel} #${displayIndex}`;
            }
            return `${group.label} ${displayIndex} — ${suffixLabel}`;
        }
    }
    return `${group.label} — ${baseLabel}`;
}

function formatClientOptionalLabelFromKey(key, fallbackLabel) {
    const canonical = canonicalizeVariableKey(key ?? '');
    if (!canonical) {
        return fallbackLabel;
    }
    const segments = canonical.split('_').filter(Boolean);
    if (segments.length >= 2) {
        const [groupId, indexSegment] = segments;
        if ((groupId === 'actifs' || groupId === 'passifs') && /^[0-9]+$/.test(indexSegment)) {
            const rawIndex = Number.parseInt(indexSegment, 10);
            const displayIndex = Number.isNaN(rawIndex) ? indexSegment : rawIndex + 1;
            const suffixKey = segments.slice(2).join('_');
            const groupLabel = humanizeVariableKey(groupId);
            const suffixLabel = (suffixKey ? humanizeVariableKey(suffixKey) : fallbackLabel) || fallbackLabel;
            if (groupId === 'passifs') {
                return `${suffixLabel} #${displayIndex}`;
            }
            return `${groupLabel} ${displayIndex} — ${suffixLabel}`;
        }
    }
    return fallbackLabel;
}

function customizeOptionalFieldLabel(field) {
    if (!field) {
        return field;
    }
    const canonical = canonicalizeVariableKey(field.key ?? '');
    let label = field.label ?? '';
    for (const { match, transform } of OPTIONAL_FIELD_LABEL_CUSTOMIZATIONS) {
        try {
            if (!match(canonical)) {
                continue;
            }
        } catch (error) {
            continue;
        }
        label = transform(label);
    }
    field.label = label;
    return field;
}

function evaluateVariableValue(value) {
    let displayValue = '';
    let hasValue = true;
    if (Array.isArray(value)) {
        const mapped = value
            .filter(item => item !== null && item !== undefined)
            .map(item => (typeof item === 'object' ? JSON.stringify(item) : String(item)));
        displayValue = mapped.join(', ');
        hasValue = displayValue.trim().length > 0;
    } else if (value && typeof value === 'object') {
        displayValue = JSON.stringify(value);
        hasValue = Object.keys(value).length > 0;
    } else if (value === null || value === undefined) {
        displayValue = '';
        hasValue = false;
    } else {
        displayValue = String(value);
        hasValue = displayValue.trim().length > 0;
    }
    if (typeof displayValue === 'string') {
        displayValue = displayValue.trim();
    }
    return { displayValue, hasValue };
}

function createVariableButton(field, value, options = {}) {
    const { requireValue = false } = options;
    const { displayValue, hasValue } = evaluateVariableValue(value);
    if (requireValue && !hasValue) {
        return null;
    }
    const node = variableTemplate.content.firstElementChild.cloneNode(true);
    const button = node.querySelector('button');
    button.textContent = field.label ?? field.key ?? '';
    if (field.key) {
        button.dataset.variableKey = field.key;
    }
    const valueSpan = document.createElement('span');
    valueSpan.textContent = hasValue ? displayValue : '—';
    button.appendChild(valueSpan);
    if (!hasValue) {
        button.disabled = true;
    } else {
        button.title = displayValue;
        button.addEventListener('click', () => {
            const editor = getActiveEditor();
            if (!editor) {
                showFeedback('Sélectionnez un document pour insérer la valeur.');
                return;
            }
            editor.insertVariableValue(displayValue);
            showFeedback(`Valeur « ${field.label} » prête à être utilisée.`);
        });
    }
    return node;
}

function renderAdminVariables() {
    if (!adminVariableList) return;
    const group = getGroupDefinition('admin');
    const parent = adminVariableList.parentElement;
    if (!group || !parent) {
        adminVariableList.innerHTML = '';
        if (parent) {
            parent.querySelectorAll('[data-role="admin-optional"]').forEach(node => node.remove());
        }
        return;
    }
    adminVariableList.innerHTML = '';
    const fields = Array.isArray(group.fields) ? group.fields : [];
    const pinnedFields = fields.filter(item => item.pinned !== false);
    for (const field of pinnedFields) {
        const value = adminProfile?.[field.key] ?? '';
        adminVariableList.appendChild(createVariableButton(field, value));
    }
    parent.querySelectorAll('[data-role="admin-optional"]').forEach(node => node.remove());
    const optionalFields = fields.filter(item => item.pinned === false);
    if (optionalFields.length) {
        const details = document.createElement('details');
        details.className = 'variable-optional';
        details.dataset.role = 'admin-optional';
        const summary = document.createElement('summary');
        summary.textContent = `Variables optionnelles (${optionalFields.length})`;
        details.appendChild(summary);
        const list = document.createElement('ul');
        list.className = 'variable-list variable-list--optional';
        for (const field of optionalFields) {
            const value = adminProfile?.[field.key] ?? '';
            list.appendChild(createVariableButton(field, value));
        }
        details.appendChild(list);
        parent.appendChild(details);
    }
}

function renderClientVariables() {
    if (!clientVariableContainer) return;
    clientVariableContainer.innerHTML = '';
    if (!selectedClients.size) {
        return;
    }
    const fusedGroup = getGroupDefinition('fused');
    const requestGroup = getGroupDefinition('request');
    const requestFields = Array.isArray(requestGroup?.fields) ? requestGroup.fields : [];
    const knownCanonicalKeys = new Set(requestFields
        .map(field => canonicalizeVariableKey(field.key ?? ''))
        .filter(Boolean));
    if (fusedGroup) {
        const primaryId = activeRequestId && selectedClients.has(activeRequestId)
            ? activeRequestId
            : selectedClients.keys().next().value;
        const primaryData = primaryId ? selectedClients.get(primaryId) : null;
        const sharedCard = document.createElement('article');
        sharedCard.className = 'shared-variable-card';
        sharedCard.dataset.variableGroup = 'fused';
        const heading = document.createElement('h4');
        heading.textContent = fusedGroup.label ?? 'Informations communes du dossier';
        sharedCard.appendChild(heading);
        const fields = Array.isArray(fusedGroup.fields) ? fusedGroup.fields : [];
        const pinnedFields = fields.filter(field => field.pinned !== false);
        const optionalFields = fields.filter(field => field.pinned === false);
        if (pinnedFields.length) {
            const list = document.createElement('ul');
            list.className = 'variable-list';
            let renderedPinned = 0;
            for (const field of pinnedFields) {
                const value = primaryData?.fused?.[field.key] ?? '';
                const node = createVariableButton(field, value, { requireValue: true });
                if (node) {
                    list.appendChild(node);
                    renderedPinned += 1;
                }
            }
            if (renderedPinned > 0) {
                sharedCard.appendChild(list);
            }
        }
        if (optionalFields.length) {
            const details = document.createElement('details');
            details.className = 'variable-optional-shared';
            const summary = document.createElement('summary');
            const list = document.createElement('ul');
            list.className = 'variable-list variable-list--optional';
            let renderedOptional = 0;
            for (const field of optionalFields) {
                const value = primaryData?.fused?.[field.key] ?? '';
                const node = createVariableButton(field, value, { requireValue: true });
                if (!node) {
                    continue;
                }
                list.appendChild(node);
                renderedOptional += 1;
            }
            if (renderedOptional > 0) {
                summary.textContent = `Variables optionnelles (${renderedOptional})`;
                details.appendChild(summary);
                details.appendChild(list);
                sharedCard.appendChild(details);
            }
        }
        clientVariableContainer.appendChild(sharedCard);
    }

    for (const [id, data] of selectedClients.entries()) {
        const card = document.createElement('details');
        card.className = 'client-variable-card';
        card.open = id === activeRequestId;
        card.dataset.variableGroup = 'request';
        card.dataset.clientId = id;
        const accent = data?.accent ?? getClientColor(id);
        card.style.setProperty('--client-accent', accent);
        card.style.setProperty('--client-accent-soft', hexToRgba(accent, 0.22));
        card.style.setProperty('--client-accent-border', hexToRgba(accent, 0.45));
        card.style.setProperty('--client-text', deriveTextColor(accent));

        const summary = document.createElement('summary');
        summary.textContent = `Client : ${data.displayName ?? id}`;
        card.appendChild(summary);

        let body = null;
        if (requestGroup) {
            body = document.createElement('div');
            body.className = 'client-variable-body';
            const title = document.createElement('h5');
            title.textContent = requestGroup.label ?? 'Informations du client';
            body.appendChild(title);
            const pinnedFields = requestFields.filter(field => field.pinned !== false);
            if (pinnedFields.length) {
                const list = document.createElement('ul');
                list.className = 'variable-list';
                let renderedPinned = 0;
                for (const field of pinnedFields) {
                    const value = resolveClientRequestValue(data, field.key);
                    if (shouldHideClientRequestField(data, field.key, value)) {
                        continue;
                    }
                    const node = createVariableButton(field, value, { requireValue: true });
                    if (node) {
                        list.appendChild(node);
                        renderedPinned += 1;
                    }
                }
                if (renderedPinned > 0) {
                    body.appendChild(list);
                }
            }
            const optionalFields = requestFields.filter(field => field.pinned === false);
            const discovered = collectDiscoveredVariableGroups(data, knownCanonicalKeys);
            const discoveredFields = [];
            for (const group of discovered.groups) {
                for (const item of group.items) {
                    if (shouldHideClientRequestField(data, item.key, item.value)) {
                        continue;
                    }
                    const label = formatDiscoveredFieldLabel(group, item);
                    const entry = customizeOptionalFieldLabel({ key: item.key, label, value: item.value });
                    discoveredFields.push(entry);
                }
            }
            const combinedOptionalFields = [];
            for (const field of optionalFields) {
                const value = resolveClientRequestValue(data, field.key);
                if (shouldHideClientRequestField(data, field.key, value) || shouldExcludeClientOptionalField(data, field.key, value)) {
                    continue;
                }
                const fallbackLabel = field.label ?? humanizeVariableKey(field.key ?? '');
                const formattedLabel = formatClientOptionalLabelFromKey(field.key, fallbackLabel);
                const entry = customizeOptionalFieldLabel({ key: field.key, label: formattedLabel, value });
                combinedOptionalFields.push(entry);
            }
            for (const field of discoveredFields) {
                if (shouldExcludeClientOptionalField(data, field.key, field.value)) {
                    continue;
                }
                combinedOptionalFields.push(field);
            }
            if (combinedOptionalFields.length) {
                const details = document.createElement('details');
                details.className = 'variable-optional';
                const summary = document.createElement('summary');
                const list = document.createElement('ul');
                list.className = 'variable-list variable-list--optional';
                let renderedOptional = 0;
                for (const field of combinedOptionalFields) {
                    const value = field.value ?? resolveClientRequestValue(data, field.key);
                    const node = createVariableButton(field, value, { requireValue: true });
                    if (!node) {
                        continue;
                    }
                    list.appendChild(node);
                    renderedOptional += 1;
                }
                if (renderedOptional > 0) {
                    summary.textContent = `Variables optionnelles (${renderedOptional})`;
                    details.appendChild(summary);
                    details.appendChild(list);
                    body.appendChild(details);
                }
            }
            card.appendChild(body);
        }

        clientVariableContainer.appendChild(card);
    }
}

function matchesVariableField(field, term) {
    if (!term) {
        return true;
    }
    const haystack = `${field.key ?? ''} ${field.label ?? ''} ${field.defaultValue ?? ''}`.toLowerCase();
    return haystack.includes(term);
}

function renderVariableConfiguration() {
    if (!variableConfigList) {
        return;
    }
    const filterTerm = (variableConfigSearch?.value ?? '').trim().toLowerCase();
    variableConfigList.innerHTML = '';
    let total = 0;
    for (const group of variableDefinitions?.groups ?? []) {
        const fields = (group.fields ?? []).filter(field => matchesVariableField(field, filterTerm));
        if (!fields.length) {
            continue;
        }
        total += fields.length;
        const section = document.createElement('article');
        section.className = 'variable-config-group';
        const header = document.createElement('header');
        const title = document.createElement('h4');
        title.textContent = group.label ?? group.id ?? 'Groupe';
        const count = document.createElement('span');
        count.className = 'variable-config-count';
        count.textContent = `${fields.length} élément${fields.length > 1 ? 's' : ''}`;
        header.append(title, count);
        section.appendChild(header);
        const list = document.createElement('ul');
        list.className = 'variable-config-fields';
        for (const field of fields) {
            const item = document.createElement('li');
            item.className = 'variable-config-item';
            const label = document.createElement('div');
            label.className = 'variable-config-item-title';
            label.textContent = field.label ?? field.key ?? '';
            const meta = document.createElement('div');
            meta.className = 'variable-config-item-meta';
            const keySpan = document.createElement('span');
            keySpan.className = 'variable-config-key';
            keySpan.textContent = field.key ?? '';
            meta.appendChild(keySpan);
            const hasDefault = field.defaultValue !== undefined && field.defaultValue !== null && String(field.defaultValue).trim().length > 0;
            if (hasDefault) {
                const defaultSpan = document.createElement('span');
                defaultSpan.className = 'variable-config-default';
                defaultSpan.textContent = `Valeur par défaut : ${field.defaultValue}`;
                meta.appendChild(defaultSpan);
            }
            const actions = document.createElement('div');
            actions.className = 'variable-config-item-actions';
            const pinned = field.pinned !== false;
            const toggle = document.createElement('label');
            toggle.className = 'variable-config-toggle';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = pinned;
            input.setAttribute('aria-label', pinned ? 'Retirer de l’affichage par défaut' : 'Activer dans l’affichage par défaut');
            const track = document.createElement('span');
            track.className = 'variable-config-toggle-track';
            const thumb = document.createElement('span');
            thumb.className = 'variable-config-toggle-thumb';
            track.appendChild(thumb);
            const text = document.createElement('span');
            text.className = 'variable-config-toggle-text';
            text.textContent = pinned ? 'Par défaut' : 'Optionnel';
            toggle.append(input, track, text);
            input.addEventListener('change', () => {
                const desiredState = input.checked;
                toggle.classList.add('is-busy');
                text.textContent = desiredState ? 'Par défaut' : 'Optionnel';
                updateVariablePinned(group.id, field.key, desiredState)
                    .catch(() => {
                        input.checked = !desiredState;
                        text.textContent = input.checked ? 'Par défaut' : 'Optionnel';
                    })
                    .finally(() => {
                        toggle.classList.remove('is-busy');
                    });
            });
            actions.appendChild(toggle);
            item.append(label, meta, actions);
            list.appendChild(item);
        }
        section.appendChild(list);
        variableConfigList.appendChild(section);
    }
    if (variableConfigEmpty) {
        variableConfigEmpty.hidden = total > 0;
    }
    variableConfigList.hidden = total === 0;
}

function updateVariablePanel() {
    renderVariableConfiguration();
    renderVariableAccessShortcuts();
    if (!variablePanel) return;
    if (!selectedClients.size && !Object.keys(adminProfile || {}).length) {
        variablePanel.hidden = true;
        return;
    }
    variablePanel.hidden = false;
    renderAdminVariables();
    renderClientVariables();
    if (collapseVariablesBtn) {
        const collapsed = variablePanel.classList.contains('collapsed');
        setVariablesCollapsed(collapsed);
    }
}

async function toggleClientSelection(request) {
    const alreadySelected = selectedClients.has(request.id);
    if (alreadySelected) {
        selectedClients.delete(request.id);
        documentCache.delete(request.id);
        if (pinnedFolders?.[request.id]) {
            delete pinnedFolders[request.id];
            savePinnedFolders();
        }
        folderTrees.delete(request.id);
        if (activeRequestId === request.id) {
            activeRequestId = selectedClients.size ? selectedClients.keys().next().value : null;
        }
        refreshClientButtons();
        updateSelectedClientsUi();
        updateVariablePanel();
        updateDocumentClientContext();
        refreshWorkspaceMetadata();
        for (const key of [...selectedDocuments]) {
            if (key.startsWith(`${request.id}:`)) {
                removeSelection(key);
            }
        }
        if (!selectedClients.size) {
            resetSelection();
            toggleFloatingTools(false);
            for (const key of Array.from(workspaces.keys())) {
                destroyWorkspace(key);
            }
        }
        await refreshDocuments(true);
        return;
    }

    try {
        const { data } = await fetchJson(`${config.apiBaseUrl}?action=getRequestData&request=${encodeURIComponent(request.id)}`);
        const accent = getClientColor(request.id);
        selectedClients.set(request.id, { ...data, accent });
        activeRequestId = request.id;
        refreshClientButtons();
        updateSelectedClientsUi();
        updateVariablePanel();
        refreshWorkspaceMetadata();
        folderTrees.delete(request.id);
        await refreshDocuments(true);
    } catch (error) {
        console.error(error);
        showFeedback('Impossible de charger les informations du client.');
    }
}

function createDocumentButton(requestId, doc) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'document-button';
    button.dataset.requestId = requestId;
    button.dataset.documentName = doc.name ?? '';
    button.dataset.documentPath = doc.relativePath ?? '';
    button.addEventListener('click', () => selectDocument({ ...doc, requestId }));
    button.replaceChildren(
        buildFileDetailContent({
            name: doc.name ?? 'Document',
            updatedAt: doc.modifiedAt ?? doc.updatedAt ?? null,
            size: doc.size ?? null,
        })
    );
    return button;
}

function createDocumentListItem(requestId, doc) {
    const li = document.createElement('li');
    li.className = 'document-item';
    li.appendChild(createDocumentButton(requestId, doc));
    return li;
}

function createPinnedFolderListItem(requestId, folderNode) {
    const li = document.createElement('li');
    li.className = 'document-item document-item--folder';
    const header = document.createElement('div');
    header.className = 'document-folder-header';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'document-folder-button';
    const label = folderNode.path === '/' ? 'Dossier principal' : folderNode.displayName ?? folderNode.name;
    toggleBtn.textContent = `📁 ${label}`;

    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'document-pin is-active';
    pinBtn.textContent = '📌';
    pinBtn.title = 'Retirer de l’accès rapide';
    pinBtn.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        setFolderPinned(requestId, folderNode.path, false);
        if (folderBrowserState.requestId === requestId) {
            const tree = ensureFolderTree(requestId);
            const current = findFolderNode(tree, folderBrowserState.currentFolderPath);
            renderFolderEntries(current ?? tree);
            renderFolderTreeNavigation();
        }
        renderDocumentChoices();
    });

    header.append(toggleBtn, pinBtn);
    li.appendChild(header);

    const files = collectFolderFiles(folderNode);
    const content = document.createElement('div');
    content.className = 'document-folder-content';
    const list = document.createElement('ul');
    list.className = 'document-folder-files';
    if (!files.length) {
        const empty = document.createElement('li');
        empty.className = 'document-folder-empty';
        empty.textContent = 'Aucun fichier PDF dans ce dossier.';
        list.appendChild(empty);
    } else {
        for (const doc of files) {
            const item = document.createElement('li');
            item.appendChild(createDocumentButton(requestId, doc));
            list.appendChild(item);
        }
    }
    content.appendChild(list);
    content.hidden = true;
    li.appendChild(content);

    toggleBtn.addEventListener('click', () => {
        const open = li.classList.toggle('is-open');
        content.hidden = !open;
    });

    return li;
}

const folderBrowserState = {
    requestId: null,
    displayName: '',
    tree: null,
    selectedPaths: new Set(),
    docIndex: new Map(),
    currentFolderPath: '/',
    previouslyFocused: null,
    pinChanges: false,
};

function updateFolderSubmitState() {
    if (!folderBrowserSubmit) {
        return;
    }
    const hasSelection = folderBrowserState.selectedPaths.size > 0;
    const hasPinUpdates = folderBrowserState.pinChanges === true;
    folderBrowserSubmit.disabled = !(hasSelection || hasPinUpdates);
}

function renderFolderSelection() {
    if (!folderBrowserSelection) {
        return;
    }
    folderBrowserSelection.innerHTML = '';
    if (!folderBrowserState.selectedPaths.size) {
        const empty = document.createElement('li');
        empty.className = 'folder-selection-empty';
        empty.textContent = 'Aucun fichier sélectionné.';
        folderBrowserSelection.appendChild(empty);
        return;
    }
    for (const path of folderBrowserState.selectedPaths) {
        const doc = folderBrowserState.docIndex.get(path);
        const name = doc?.name ?? path.split('/').pop() ?? path;
        const item = document.createElement('li');
        item.className = 'folder-selection-item';
        const label = document.createElement('span');
        label.textContent = name;
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'folder-selection-remove';
        removeBtn.textContent = '×';
        removeBtn.title = `Retirer ${name}`;
        removeBtn.addEventListener('click', () => {
            folderBrowserState.selectedPaths.delete(path);
            renderFolderSelection();
            renderFolderEntries(findFolderNode(folderBrowserState.tree, folderBrowserState.currentFolderPath));
            updateFolderSubmitState();
        });
        item.append(label, removeBtn);
        folderBrowserSelection.appendChild(item);
    }
}

function buildFolderTreeList(node) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'folder-tree-button';
    const label = node.path === '/' ? folderBrowserState.displayName : node.displayName ?? node.name;
    button.textContent = label;
    if (node.path === folderBrowserState.currentFolderPath) {
        button.classList.add('is-active');
    }
    button.addEventListener('click', () => {
        setFolderBrowserFolder(node.path);
    });
    li.appendChild(button);
    const childDirs = getSortedChildren(node).filter(child => child.type === 'directory');
    if (childDirs.length) {
        const ul = document.createElement('ul');
        ul.className = 'folder-tree-list';
        for (const child of childDirs) {
            ul.appendChild(buildFolderTreeList(child));
        }
        li.appendChild(ul);
    }
    return li;
}

function renderFolderTreeNavigation() {
    if (!folderBrowserTree || !folderBrowserState.tree) {
        return;
    }
    folderBrowserTree.innerHTML = '';
    const rootList = document.createElement('ul');
    rootList.className = 'folder-tree-list folder-tree-list--root';
    rootList.appendChild(buildFolderTreeList(folderBrowserState.tree));
    folderBrowserTree.appendChild(rootList);
}

function toggleFileSelection(path, checked) {
    if (checked) {
        folderBrowserState.selectedPaths.add(path);
    } else {
        folderBrowserState.selectedPaths.delete(path);
    }
    renderFolderSelection();
    updateFolderSubmitState();
}

function renderFolderEntries(folderNode) {
    if (!folderBrowserEntries || !folderNode) {
        return;
    }
    folderBrowserEntries.innerHTML = '';
    const children = getSortedChildren(folderNode);
    if (!children.length) {
        const empty = document.createElement('li');
        empty.className = 'folder-browser-empty';
        empty.textContent = 'Ce dossier est vide.';
        folderBrowserEntries.appendChild(empty);
    }
    for (const child of children) {
        if (child.type === 'directory') {
            const dirItem = document.createElement('li');
            dirItem.className = 'folder-browser-entry folder-browser-entry--dir';
            const dirHeader = document.createElement('div');
            dirHeader.className = 'folder-browser-entry-header';
            const dirButton = document.createElement('button');
            dirButton.type = 'button';
            dirButton.className = 'folder-browser-entry-button';
            dirButton.textContent = `📁 ${child.displayName ?? child.name}`;
            dirButton.addEventListener('click', () => setFolderBrowserFolder(child.path));

            const pinBtn = document.createElement('button');
            pinBtn.type = 'button';
            pinBtn.className = 'folder-browser-pin';
            const updatePinState = () => {
                const pinned = isFolderPinned(folderBrowserState.requestId, child.path);
                pinBtn.classList.toggle('is-active', pinned);
                pinBtn.title = pinned ? 'Retirer de l’accès rapide' : 'Épingler dans l’accès rapide';
            };
            pinBtn.textContent = '📌';
            updatePinState();
            pinBtn.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();
                const nextState = !isFolderPinned(folderBrowserState.requestId, child.path);
                setFolderPinned(folderBrowserState.requestId, child.path, nextState);
                updatePinState();
                renderFolderEntries(folderNode);
                renderFolderTreeNavigation();
                renderDocumentChoices();
                folderBrowserState.pinChanges = true;
                updateFolderSubmitState();
            });

            dirHeader.append(dirButton, pinBtn);
            dirItem.appendChild(dirHeader);
            folderBrowserEntries.appendChild(dirItem);
        } else if (child.type === 'file' && child.document) {
            const fileItem = document.createElement('li');
            fileItem.className = 'folder-browser-entry folder-browser-entry--file';
            const label = document.createElement('label');
            label.className = 'folder-browser-file';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const path = child.document.relativePath ?? child.document.name;
            checkbox.checked = folderBrowserState.selectedPaths.has(path);
            checkbox.addEventListener('change', () => toggleFileSelection(path, checkbox.checked));
            const span = document.createElement('span');
            span.textContent = child.document.name ?? child.name;
            label.append(checkbox, span);
            fileItem.appendChild(label);
            folderBrowserEntries.appendChild(fileItem);
        }
    }
}

function setFolderBrowserFolder(path) {
    const node = findFolderNode(folderBrowserState.tree, path);
    if (!node) {
        return;
    }
    folderBrowserState.currentFolderPath = node.path;
    if (folderBrowserCurrent) {
        folderBrowserCurrent.textContent = node.path === '/' ? folderBrowserState.displayName : node.displayName ?? node.name;
    }
    if (folderBrowserHint) {
        const total = collectFolderFiles(node).length;
        folderBrowserHint.textContent = total
            ? `${total} fichier${total > 1 ? 's' : ''} PDF disponible${total > 1 ? 's' : ''}`
            : 'Aucun fichier PDF dans ce dossier.';
    }
    renderFolderTreeNavigation();
    renderFolderEntries(node);
}

function closeFolderBrowser() {
    if (!folderBrowserContainer) {
        return;
    }
    folderBrowserContainer.hidden = true;
    folderBrowserContainer.setAttribute('aria-hidden', 'true');
    if (folderBrowserState.previouslyFocused instanceof HTMLElement) {
        folderBrowserState.previouslyFocused.focus();
    }
    folderBrowserState.requestId = null;
    folderBrowserState.displayName = '';
    folderBrowserState.tree = null;
    folderBrowserState.selectedPaths.clear();
    folderBrowserState.docIndex.clear();
    folderBrowserState.currentFolderPath = '/';
    folderBrowserState.pinChanges = false;
}

async function openClientFolderBrowser(requestId) {
    if (!folderBrowserContainer) {
        showFeedback('Explorateur de dossiers indisponible.');
        return;
    }
    const info = selectedClients.get(requestId);
    const displayName = info?.displayName ?? requestId;
    try {
        const documents = await loadDocumentsForRequest(requestId, { force: !documentCache.has(requestId) });
        const tree = ensureFolderTree(requestId);
        folderBrowserState.requestId = requestId;
        folderBrowserState.displayName = displayName;
        folderBrowserState.tree = tree;
        folderBrowserState.selectedPaths = new Set();
        folderBrowserState.docIndex = new Map();
        folderBrowserState.pinChanges = false;
        for (const doc of documents) {
            const key = doc.relativePath ?? doc.name ?? '';
            if (key) {
                folderBrowserState.docIndex.set(key, doc);
            }
        }
        folderBrowserState.currentFolderPath = '/';
        folderBrowserState.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (folderBrowserTitle) {
            folderBrowserTitle.textContent = `Dossier ${displayName}`;
        }
        folderBrowserContainer.hidden = false;
        folderBrowserContainer.setAttribute('aria-hidden', 'false');
        renderFolderSelection();
        updateFolderSubmitState();
        renderFolderTreeNavigation();
        setFolderBrowserFolder('/');
        const firstButton = folderBrowserContainer.querySelector('button, [href], input');
        if (firstButton instanceof HTMLElement) {
            firstButton.focus();
        }
    } catch (error) {
        console.error(error);
        showFeedback('Impossible d’ouvrir le dossier du client.');
    }
}

function renderDocumentChoices() {
    if (!documentList || !documentChoicesList) {
        return;
    }
    if (documentSortSelect) {
        documentSortSelect.value = documentListSortMode;
    }
    documentChoicesList.innerHTML = '';
    const requestId = activeRequestId && selectedClients.has(activeRequestId) ? activeRequestId : null;
    if (!requestId) {
        if (!selectedDocuments.length) {
            documentList.hidden = true;
        }
        return;
    }
    const documents = documentCache.get(requestId) ?? [];
    const tree = ensureFolderTree(requestId);
    const term = (documentSearchInput?.value ?? '').trim().toLowerCase();
    const shouldFilter = term.length > 0;

    if (shouldFilter) {
        const matches = documents.filter(doc => (doc.name ?? '').toLowerCase().includes(term));
        if (!matches.length) {
            const li = document.createElement('li');
            li.className = 'document-item';
            const empty = document.createElement('p');
            empty.className = 'document-empty';
            empty.textContent = 'Aucun document ne correspond à la recherche.';
            li.appendChild(empty);
            documentChoicesList.appendChild(li);
        } else {
            const sortedMatches = sortItems(matches, documentListSortMode);
            for (const doc of sortedMatches) {
                documentChoicesList.appendChild(createDocumentListItem(requestId, doc));
            }
        }
        documentList.hidden = false;
        refreshDocumentButtonStates();
        return;
    }

    const pinnedPaths = getPinnedFolderPaths(requestId);
    if (pinnedPaths.length) {
        const uniquePinned = Array.from(new Set(pinnedPaths));
        uniquePinned.sort((a, b) => a.localeCompare(b, 'fr'));
        for (const path of uniquePinned) {
            const folderNode = findFolderNode(tree, path);
            if (!folderNode) {
                continue;
            }
            documentChoicesList.appendChild(createPinnedFolderListItem(requestId, folderNode));
        }
        if (!documentChoicesList.childElementCount) {
            const li = document.createElement('li');
            li.className = 'document-item';
            const emptyPinned = document.createElement('p');
            emptyPinned.className = 'document-empty';
            emptyPinned.textContent = 'Aucun dossier épinglé disponible.';
            li.appendChild(emptyPinned);
            documentChoicesList.appendChild(li);
        }
        documentList.hidden = false;
        refreshDocumentButtonStates();
        return;
    }

    const li = document.createElement('li');
    li.className = 'document-item';
    const empty = document.createElement('p');
    empty.className = 'document-empty';
    empty.textContent = 'Aucun dossier épinglé. Utilisez le bouton 📁 pour parcourir le dossier du client.';
    li.appendChild(empty);
    documentChoicesList.appendChild(li);
    documentList.hidden = false;
    refreshDocumentButtonStates();
}

async function loadDocumentsForRequest(requestId, { force = false } = {}) {
    if (!requestId) {
        return [];
    }
    if (!force && documentCache.has(requestId)) {
        return documentCache.get(requestId) ?? [];
    }
    try {
        const { data } = await fetchJson(`${config.apiBaseUrl}?action=listDocuments&request=${encodeURIComponent(requestId)}`);
        const documents = Array.isArray(data) ? data : [];
        documentCache.set(requestId, documents);
        refreshFolderTree(requestId);
        return documents;
    } catch (error) {
        console.error(error);
        documentCache.delete(requestId);
        refreshFolderTree(requestId);
        throw error;
    }
}

async function refreshDocuments(force = false) {
    if (!documentList || !documentChoicesList) return;
    updateDocumentClientContext();
    if (!activeRequestId) {
        renderDocumentChoices();
        documentList.hidden = !selectedDocuments.length;
        lastDocumentsRequestId = null;
        return;
    }

    try {
        if (force || activeRequestId !== lastDocumentsRequestId || !documentCache.has(activeRequestId)) {
            await loadDocumentsForRequest(activeRequestId, { force });
            lastDocumentsRequestId = activeRequestId;
        }
        renderDocumentChoices();
    } catch (error) {
        documentChoicesList.innerHTML = '';
        if (!selectedDocuments.length) {
            documentList.hidden = true;
        }
        showFeedback('Impossible de charger les documents du client.');
        lastDocumentsRequestId = null;
    }
}

function populateProfileForm() {
    if (!profileForm) return;
    for (const element of profileForm.elements) {
        if (!(element instanceof HTMLInputElement)) continue;
        const name = element.name;
        if (!name) continue;
        element.value = adminProfile?.[name] ?? '';
    }
}

async function loadVariableDefinitionsAndProfile() {
    try {
        const { data } = await fetchJson(`${config.apiBaseUrl}?action=listVariables`);
        variableDefinitions = data.definitions ?? { groups: [] };
        adminProfile = data.adminProfile ?? {};
        populateProfileForm();
        updateVariablePanel();
    } catch (error) {
        console.error(error);
    }
}

function openVariableConfigDialog() {
    if (!variableConfigDialog || !variableConfigForm) {
        return;
    }
    variableConfigForm.reset();
    setVariableConfigError('');
    variableConfigDialog.hidden = false;
    variableConfigDialog.setAttribute('aria-hidden', 'false');
    toggleVariableConfigInstructions(false);
    if (variableConfigGroupSelect instanceof HTMLSelectElement && variableConfigGroupSelect.options.length) {
        variableConfigGroupSelect.value = variableConfigGroupSelect.options[0].value;
    }
    if (variableConfigKeyInput) {
        variableConfigKeyInput.value = '';
    }
    if (variableConfigLabelInput) {
        variableConfigLabelInput.value = '';
        variableConfigLabelInput.focus();
    }
}

function closeVariableConfigDialog() {
    if (!variableConfigDialog) {
        return;
    }
    variableConfigDialog.hidden = true;
    variableConfigDialog.setAttribute('aria-hidden', 'true');
    toggleVariableConfigInstructions(false);
    setVariableConfigError('');
}

async function handleVariableConfigSubmit(event) {
    event.preventDefault();
    if (!variableConfigForm) {
        return;
    }
    setVariableConfigError('');
    const groupIdRaw = variableConfigGroupSelect?.value ?? '';
    const normalizedGroupId = normalizeGroupId(groupIdRaw);
    const label = (variableConfigLabelInput?.value ?? '').trim();
    if (!normalizedGroupId) {
        setVariableConfigError('Veuillez sélectionner une destination pour la nouvelle variable.');
        if (variableConfigGroupSelect instanceof HTMLElement) {
            variableConfigGroupSelect.focus();
        }
        return;
    }
    if (!label) {
        setVariableConfigError('Veuillez saisir la désignation / phrase complète visible.');
        if (variableConfigLabelInput instanceof HTMLElement) {
            variableConfigLabelInput.focus();
        }
        return;
    }
    const generatedKey = generateVariableKey(label);
    if (variableConfigKeyInput) {
        variableConfigKeyInput.value = generatedKey;
    }
    const defaultValueRaw = (variableConfigDefaultValueInput?.value ?? '').toString();
    const payload = {
        groupId: normalizedGroupId,
        groupLabel: getGroupLabel(normalizedGroupId),
        key: generatedKey,
        label,
        defaultValue: defaultValueRaw.trim() !== '' ? defaultValueRaw.trim() : null,
    };
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=addVariableDefinition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            let message = 'Impossible d’enregistrer la variable.';
            try {
                const errorPayload = await response.json();
                message = errorPayload?.details ?? errorPayload?.error ?? message;
            } catch (parseError) {
                console.error(parseError);
            }
            const error = new Error(message);
            error.userMessage = message;
            throw error;
        }
        const { data } = await response.json();
        variableDefinitions = data.definitions ?? variableDefinitions;
        if (data.profile) {
            adminProfile = data.profile;
        }
        closeVariableConfigDialog();
        updateVariablePanel();
        showFeedback('Variable enregistrée.');
    } catch (error) {
        console.error(error);
        const message = error?.userMessage ?? 'Impossible d’enregistrer la variable.';
        setVariableConfigError(message);
        showFeedback(message);
    }
}

async function updateVariablePinned(groupId, key, pinned) {
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=setVariablePinned`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, key, pinned }),
        });
        if (!response.ok) {
            let message = 'Impossible de mettre à jour la sélection par défaut.';
            try {
                const payload = await response.json();
                message = payload?.details ?? payload?.error ?? message;
            } catch (parseError) {
                console.error(parseError);
            }
            const error = new Error(message);
            error.userMessage = message;
            throw error;
        }
        const { data } = await response.json();
        variableDefinitions = data.definitions ?? variableDefinitions;
        updateVariablePanel();
        const message = pinned
            ? 'Variable ajoutée à l’affichage par défaut.'
            : 'Variable retirée de l’affichage par défaut.';
        showFeedback(message);
        return true;
    } catch (error) {
        console.error(error);
        const message = error?.userMessage ?? 'Impossible de mettre à jour la sélection par défaut.';
        showFeedback(message);
        throw error;
    }
}

function openDashboard() {
    if (!dashboardModal) return;
    closeVariableConfigDialog();
    dashboardModal.hidden = false;
    dashboardModal.setAttribute('aria-hidden', 'false');
    populateProfileForm();
    const panel = dashboardModal.querySelector('.dashboard-panel');
    panel?.focus();
    switchDashboardSection('profile');
}

function closeDashboard() {
    if (!dashboardModal) return;
    closeVariableConfigDialog();
    dashboardModal.hidden = true;
    dashboardModal.setAttribute('aria-hidden', 'true');
}

function switchDashboardSection(id) {
    if (!dashboardMenu || !dashboardSections) return;
    for (const button of dashboardMenu.querySelectorAll('button[data-dashboard-section]')) {
        const isActive = button.dataset.dashboardSection === id;
        button.classList.toggle('is-active', isActive);
    }
    dashboardSections.forEach(section => {
        const isVisible = section.dataset.dashboardPanel === id;
        section.classList.toggle('is-visible', isVisible);
    });
    if (id === 'prefilled' || id === 'fill' || id === 'edit') {
        ensureTemplateLibrary();
    }
}

async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!profileForm) return;
    const formData = new FormData(profileForm);
    const payload = Object.fromEntries(formData.entries());
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=saveAdminProfile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const { data } = await response.json();
        adminProfile = data.profile ?? payload;
        updateVariablePanel();
        showFeedback('Coordonnées sauvegardées.');
    } catch (error) {
        console.error(error);
        showFeedback('Erreur lors de l’enregistrement des coordonnées.');
    }
}

async function selectDocument(doc) {
    for (const btn of documentList.querySelectorAll('.document-button')) {
        const isActive = btn.dataset.documentName === doc.name && btn.dataset.requestId === doc.requestId;
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
    await loadDocumentWithState(doc);
    refreshDocumentButtonStates();
}

function initTools() {
    const addTextBtn = document.getElementById('add-text');
    const addSignatureBtn = document.getElementById('add-signature');
    const saveBtn = document.getElementById('toolbar-save');
    const dashboardBtn = document.getElementById('open-dashboard');
    const variableAccessBtn = variableAccessButton;

    const handleAddText = () => {
        const editor = getActiveEditor();
        if (!editor) {
            showFeedback('Sélectionnez un document avant d’ajouter du texte.');
            return;
        }
        editor.setTool('text');
        showFeedback('Cliquez sur le PDF pour ajouter du texte.');
    };

    const handleUndo = () => {
        const editor = getActiveEditor();
        if (!editor) {
            showFeedback('Aucune action à annuler.');
            return;
        }
        if (!editor.undo()) {
            showFeedback('Aucune action à annuler.');
        }
    };

    const handleRedo = () => {
        const editor = getActiveEditor();
        if (!editor) {
            showFeedback('Aucune action à rétablir.');
            return;
        }
        if (!editor.redo()) {
            showFeedback('Aucune action à rétablir.');
        }
    };

    const handleAddSignature = async () => {
        const editor = getActiveEditor();
        if (!editor) {
            showFeedback('Sélectionnez un document avant d’ajouter une signature.');
            return;
        }
        try {
            const prepared = await editor.prepareDefaultSignature();
            if (prepared) {
                showFeedback('Cliquez sur le PDF pour placer votre signature par défaut.');
                return;
            }
            const signature = await editor.pickSignatureFromLibrary();
            if (signature && editor.prepareSignaturePlacement(signature)) {
                showFeedback('Cliquez sur le PDF pour placer la signature sélectionnée.');
            } else if (!signature) {
                showFeedback('Aucune signature n’a été sélectionnée.');
            } else {
                showFeedback('Impossible de préparer la signature choisie.');
            }
        } catch (error) {
            console.error(error);
            showFeedback('Impossible de préparer la signature.');
        }
    };

    const handleOpenSignatureLibrary = async hideMenu => {
        const editor = getActiveEditor();
        if (!editor) {
            showFeedback('Sélectionnez un document avant d’ajouter une signature.');
            hideMenu?.();
            return;
        }
        try {
            const signature = await editor.pickSignatureFromLibrary();
            if (signature && editor.prepareSignaturePlacement(signature)) {
                showFeedback('Cliquez sur le PDF pour placer la signature sélectionnée.');
            } else if (!signature) {
                showFeedback('Aucune signature n’a été sélectionnée.');
            } else {
                showFeedback('Impossible de préparer la signature choisie.');
            }
        } catch (error) {
            console.error(error);
            showFeedback('Impossible d’ouvrir la bibliothèque de signatures.');
        } finally {
            hideMenu?.();
        }
    };

    addTextBtn.addEventListener('click', handleAddText);
    addSignatureBtn.addEventListener('click', () => {
        handleAddSignature().catch(error => console.error(error));
    });

    floatingAddText?.addEventListener('click', handleAddText);
    floatingAddSignature?.addEventListener('click', () => {
        handleAddSignature().catch(error => console.error(error));
    });

    const primarySignatureMenu = attachSignatureMenu(addSignatureBtn, openSignatureLibraryBtn);
    openSignatureLibraryBtn?.addEventListener('click', () => {
        handleOpenSignatureLibrary(() => primarySignatureMenu?.hide()).catch(error => console.error(error));
    });

    const floatingSignatureMenu = attachSignatureMenu(floatingAddSignature, floatingSignatureLibraryBtn);
    floatingSignatureLibraryBtn?.addEventListener('click', () => {
        handleOpenSignatureLibrary(() => floatingSignatureMenu?.hide()).catch(error => console.error(error));
    });

    const handleShowValues = () => {
        showVariablePanel();
    };

    toggleValuesBtn?.addEventListener('click', handleShowValues);
    floatingToggleValues?.addEventListener('click', handleShowValues);

    undoButton?.addEventListener('click', handleUndo);
    redoButton?.addEventListener('click', handleRedo);

    floatingPrevPage?.addEventListener('click', async () => {
        const editor = getActiveEditor();
        if (!editor) return;
        try {
            await editor.focusRelativePage(-1);
        } finally {
            updateNavigationButtons();
        }
    });

    floatingNextPage?.addEventListener('click', async () => {
        const editor = getActiveEditor();
        if (!editor) return;
        try {
            await editor.focusRelativePage(1);
        } finally {
            updateNavigationButtons();
        }
    });

    collapseVariablesBtn?.addEventListener('click', () => {
        const collapsed = !variablePanel?.classList.contains('collapsed');
        setVariablesCollapsed(collapsed);
    });

    if (variableAccessBtn) {
        variableAccessBtn.addEventListener('click', () => {
            const shouldOpen = variableAccessPopover ? variableAccessPopover.hidden : true;
            toggleVariableAccessPopover(shouldOpen);
        });
    }

    variableAccessCloseButton?.addEventListener('click', () => {
        toggleVariableAccessPopover(false);
        variableAccessButton?.focus();
    });

    saveBtn?.addEventListener('click', async () => {
        if (!selectedDocuments.length) {
            showFeedback('Sélectionnez au moins un document avant de sauvegarder.');
            return;
        }
        const documents = await collectDocumentsForSave();
        if (!documents.length) {
            showFeedback('Aucun document à sauvegarder.');
            return;
        }
        try {
            await openSaveWorkflow(documents);
            showFeedback('Documents sauvegardés.');
        } catch (error) {
            if (error instanceof Error && error.message) {
                showFeedback(error.message);
            }
        }
    });

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', openDashboard);
    }

    updateHistoryButtons();

    const scrollHost = document.querySelector('.editor-canvas');
    scrollHost?.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
    window.addEventListener('resize', scheduleNavigationUpdate);
}

function renderCustomerSearchResults() {
    if (!customersList) {
        return;
    }
    customersList.innerHTML = '';
    const template = document.getElementById('customer-item-template');
    const term = (searchInput?.value ?? '').trim().toLowerCase();
    if (!term) {
        return;
    }
    for (const item of clientCatalog) {
        const haystack = `${item.displayName ?? ''} ${item.id ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) {
            continue;
        }
        const node = template.content.firstElementChild.cloneNode(true);
        const button = node.querySelector('button');
        button.textContent = `${item.displayName} (${item.documentCount})`;
        button.dataset.requestId = item.id;
        button.addEventListener('click', () => toggleClientSelection(item));
        if (selectedClients.has(item.id)) {
            button.setAttribute('aria-pressed', 'true');
            button.classList.add('is-selected');
        }
        customersList.appendChild(node);
    }
}

function setupSearch() {
    searchInput?.addEventListener('input', () => {
        renderCustomerSearchResults();
    });
    documentSearchInput?.addEventListener('input', () => {
        renderDocumentChoices();
    });
}

dashboardMenu?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const section = target.dataset.dashboardSection;
    if (!section) return;
    switchDashboardSection(section);
});

dashboardQuestionActionsBtn?.addEventListener('click', () => {
    openQuestionActionManager();
});

window.addEventListener('message', event => {
    if (event.origin && event.origin !== window.location.origin) {
        return;
    }
    const data = event.data;
    if (data && typeof data === 'object') {
        if (data.type === 'template-saved') {
            ensureTemplateLibrary(true);
        } else if (data.type === 'question-classes-updated') {
            questionClassCatalogLoaded = false;
            questionClassCatalogPromise = null;
            questionClassCatalog = [];
            if (templateGenerateDialog && templateGenerateDialog.hidden !== true) {
                ensureQuestionClassCatalog(true)
                    .then(() => {
                        prepareTemplateGenerationQuestions();
                    })
                    .catch(error => console.error(error));
            }
        }
    }
});

for (const element of dashboardCloseTargets) {
    element.addEventListener('click', closeDashboard);
}

profileForm?.addEventListener('submit', handleProfileSubmit);

variableConfigSearch?.addEventListener('input', () => {
    renderVariableConfiguration();
});

variableConfigAddButton?.addEventListener('click', () => {
    openVariableConfigDialog();
});

variableConfigCancel?.addEventListener('click', () => {
    closeVariableConfigDialog();
});

variableConfigDialog?.addEventListener('click', event => {
    if (event.target === variableConfigDialog) {
        closeVariableConfigDialog();
    }
});

variableConfigLabelInput?.addEventListener('input', () => {
    if (!variableConfigKeyInput) {
        return;
    }
    const value = variableConfigLabelInput.value;
    if (!value || !value.trim()) {
        variableConfigKeyInput.value = '';
        return;
    }
    variableConfigKeyInput.value = generateVariableKey(value);
});

variableConfigHelpButton?.addEventListener('click', event => {
    event.preventDefault();
    toggleVariableConfigInstructions();
});

variableConfigInstructionsClose?.addEventListener('click', event => {
    event.preventDefault();
    toggleVariableConfigInstructions(false);
});

variableConfigForm?.addEventListener('submit', handleVariableConfigSubmit);

templateGenerateCancelTargets.forEach(btn => {
    btn.addEventListener('click', event => {
        event.preventDefault();
        closeTemplateGenerationDialog();
    });
});

templateConflictTrigger?.addEventListener('click', () => {
    openTemplateConflictPanel({ type: 'global' });
});

templateConflictClose?.addEventListener('click', event => {
    event.preventDefault();
    closeTemplateConflictPanel();
});

templateConflictActions.forEach(button => {
    button.addEventListener('click', handleTemplateConflictAction);
});

templateConflictList?.addEventListener('click', handleTemplateConflictListClick);

templateConflictPanel?.addEventListener('click', event => {
    if (event.target === templateConflictPanel) {
        closeTemplateConflictPanel();
    }
});

templateConflictPanel?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeTemplateConflictPanel();
    }
});

templateEditTrigger?.addEventListener('click', () => {
    openTemplateEditPicker().catch(error => console.error(error));
});

templateEditBackdrop?.addEventListener('click', () => {
    closeTemplateEditPicker();
});

templateEditCloseButtons.forEach(btn => {
    btn.addEventListener('click', event => {
        event.preventDefault();
        closeTemplateEditPicker();
    });
});

templateEditViewButtons.grid?.addEventListener('click', event => {
    event.preventDefault();
    setTemplateEditView('grid');
});

templateEditViewButtons.list?.addEventListener('click', event => {
    event.preventDefault();
    setTemplateEditView('list');
});

templateEditPicker?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeTemplateEditPicker();
    }
});

if (templateEditSortSelect) {
    templateEditSortMode = normalizeSortMode(templateEditSortSelect.value);
    templateEditSortSelect.value = templateEditSortMode;
    templateEditSortSelect.addEventListener('change', () => {
        templateEditSortMode = normalizeSortMode(templateEditSortSelect.value);
        renderTemplateEditPicker();
    });
}

documentViewModeButtons.grid?.addEventListener('click', event => {
    event.preventDefault();
    setDocumentListView('grid');
});

documentViewModeButtons.list?.addEventListener('click', event => {
    event.preventDefault();
    setDocumentListView('list');
});

if (documentSortSelect) {
    documentListSortMode = normalizeSortMode(documentSortSelect.value);
    documentSortSelect.value = documentListSortMode;
    documentSortSelect.addEventListener('change', () => {
        documentListSortMode = normalizeSortMode(documentSortSelect.value);
        renderDocumentChoices();
    });
}

for (const [sectionId, config] of Object.entries(templateSections)) {
    if (!config || !config.container) {
        continue;
    }
    const initialMode = config.container.dataset.viewMode === 'list' ? 'list' : 'grid';
    setTemplateLibraryView(sectionId, initialMode);
    const collapsed = config.container.classList.contains('is-collapsed');
    toggleTemplateLibraryVisibility(sectionId, !collapsed);
    if (config.viewButtons?.grid) {
        config.viewButtons.grid.addEventListener('click', event => {
            event.preventDefault();
            setTemplateLibraryView(sectionId, 'grid');
        });
    }
    if (config.viewButtons?.list) {
        config.viewButtons.list.addEventListener('click', event => {
            event.preventDefault();
            setTemplateLibraryView(sectionId, 'list');
        });
    }
    if (config.sortSelect) {
        const stored = templateLibrarySortModes.get(sectionId) ?? normalizeSortMode(config.sortSelect.value);
        templateLibrarySortModes.set(sectionId, stored);
        config.sortSelect.value = stored;
        config.sortSelect.addEventListener('change', () => {
            const nextMode = normalizeSortMode(config.sortSelect.value);
            templateLibrarySortModes.set(sectionId, nextMode);
            renderTemplateLibrary();
        });
    }
}

setTemplateEditView(templateEditViewMode);
setDocumentListView(documentListViewMode);
toggleDocumentListVisibility(!documentList?.classList?.contains('is-collapsed'));

templateGenerateSubmit?.addEventListener('click', event => {
    event.preventDefault();
    submitTemplateGeneration().catch(error => console.error(error));
});

templateGenerateDialog?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeTemplateGenerationDialog();
    }
});

templateGenerateFolderInput?.addEventListener('input', () => {
    templateGenerationCustomFolderName = templateGenerateFolderInput.value ?? '';
});

templateGenerateSearch?.addEventListener('input', () => {
    templateGenerationSearchTerm = templateGenerateSearch.value ?? '';
    renderTemplateGenerationAvailableClients();
});

templateGenerateDestClientSelect?.addEventListener('change', event => {
    const value = event.target.value;
    templateGenerationDestClientId = value || null;
    templateGenerationDestinationSelection = { mode: 'client', existingPath: null };
    renderTemplateGenerationDestinationOptions();
});

saveFolderNameInput?.addEventListener('input', () => {
    saveDialogFolderName = saveFolderNameInput.value ?? '';
});

if (dashboardModal) {
    dashboardModal.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (variableConfigDialog && !variableConfigDialog.hidden) {
                closeVariableConfigDialog();
                event.stopPropagation();
                return;
            }
            closeDashboard();
        }
    });
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dashboardModal && !dashboardModal.hidden) {
        if (variableConfigDialog && !variableConfigDialog.hidden) {
            closeVariableConfigDialog();
            return;
        }
        closeDashboard();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && folderBrowserContainer && !folderBrowserContainer.hidden) {
        closeFolderBrowser();
    }
});

if (folderBrowserCancel) {
    folderBrowserCancel.addEventListener('click', event => {
        event.preventDefault();
        closeFolderBrowser();
    });
}

for (const closeBtn of folderBrowserCloseTargets) {
    closeBtn.addEventListener('click', event => {
        event.preventDefault();
        closeFolderBrowser();
    });
}

if (folderBrowserReset) {
    folderBrowserReset.addEventListener('click', () => {
        folderBrowserState.selectedPaths.clear();
        renderFolderSelection();
        renderFolderEntries(findFolderNode(folderBrowserState.tree, folderBrowserState.currentFolderPath));
        updateFolderSubmitState();
    });
}

if (folderBrowserSubmit) {
    folderBrowserSubmit.addEventListener('click', async event => {
        event.preventDefault();
        if (!folderBrowserState.requestId) {
            return;
        }
        const hasSelection = folderBrowserState.selectedPaths.size > 0;
        if (!hasSelection) {
            if (folderBrowserState.pinChanges) {
                closeFolderBrowser();
                showFeedback('Accès rapide mis à jour.');
            }
            return;
        }
        const docs = [];
        for (const path of folderBrowserState.selectedPaths) {
            const doc = folderBrowserState.docIndex.get(path);
            if (doc) {
                docs.push(doc);
            }
        }
        if (!docs.length) {
            showFeedback('Aucun document valide n’a été sélectionné.');
            return;
        }
        folderBrowserSubmit.disabled = true;
        try {
            for (const doc of docs) {
                await selectDocument({ ...doc, requestId: folderBrowserState.requestId });
            }
            closeFolderBrowser();
        } catch (error) {
            console.error(error);
            showFeedback('Impossible d’ouvrir les documents sélectionnés.');
        } finally {
            folderBrowserSubmit.disabled = false;
        }
    });
}

function getDocumentKey(meta) {
    const path = meta.relativePath ?? meta.name;
    return `${meta.requestId}:${path}`;
}

function resetSelection() {
    selectedDocuments.length = 0;
    documentDrafts.clear();
    for (const key of Array.from(workspaces.keys())) {
        destroyWorkspace(key);
    }
    activeDocKey = null;
    lastDocumentsRequestId = null;
    if (selectedList) {
        selectedList.innerHTML = '';
    }
    if (selectedSection) {
        selectedSection.hidden = true;
    }
    toggleFloatingTools(false);
    refreshDocumentButtonStates();
    updateDocumentClientContext();
    updateNavigationButtons();
    ensureViewerState();
}

function updateSelectedList() {
    if (!selectedList || !selectedSection) return;
    selectedList.innerHTML = '';
    if (!selectedDocuments.length) {
        selectedSection.hidden = true;
        return;
    }
    selectedSection.hidden = false;
    for (const key of selectedDocuments) {
        const draft = documentDrafts.get(key);
        if (!draft) continue;
        const li = document.createElement('li');
        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'selected-document-button';
        const clientInfo = selectedClients.get(draft.meta.requestId) ?? {};
        const titleSpan = document.createElement('span');
        titleSpan.className = 'selected-document-title';
        titleSpan.textContent = draft.meta.name;
        const clientSpan = document.createElement('span');
        clientSpan.className = 'selected-document-client';
        clientSpan.textContent = clientInfo.displayName ?? draft.meta.requestId;
        label.append(titleSpan, clientSpan);
        const accent = getClientColor(draft.meta.requestId);
        label.style.setProperty('--client-accent', accent);
        label.style.setProperty('--client-text', deriveTextColor(accent));
        if (key === activeDocKey) {
            label.classList.add('is-active');
        }
        label.addEventListener('click', () => loadDocumentWithState(draft.meta));

        const actions = document.createElement('div');
        actions.className = 'selection-actions';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.textContent = '↑';
        upBtn.addEventListener('click', () => reorderSelection(key, -1));

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.textContent = '↓';
        downBtn.addEventListener('click', () => reorderSelection(key, 1));

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeSelection(key));

        actions.append(upBtn, downBtn, removeBtn);
        li.append(label, actions);
        selectedList.appendChild(li);
    }
}

function reorderSelection(key, delta) {
    const index = selectedDocuments.indexOf(key);
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= selectedDocuments.length) {
        return;
    }
    const [item] = selectedDocuments.splice(index, 1);
    selectedDocuments.splice(targetIndex, 0, item);
    updateSelectedList();
    applyWorkspaceOrder();
}

function removeSelection(key) {
    const index = selectedDocuments.indexOf(key);
    if (index === -1) return;
    selectedDocuments.splice(index, 1);
    documentDrafts.delete(key);
    destroyWorkspace(key);
    if (activeDocKey === key) {
        const fallbackKey = selectedDocuments[0];
        if (fallbackKey) {
            setActiveWorkspace(fallbackKey);
        } else {
            toggleFloatingTools(false);
            ensureViewerState();
        }
    }
    updateSelectedList();
    applyWorkspaceOrder();
}

function saveCurrentDraft() {
    if (!activeDocKey) {
        return;
    }
    const workspace = workspaces.get(activeDocKey);
    if (!workspace) {
        return;
    }
    const draft = documentDrafts.get(activeDocKey);
    if (!draft) {
        return;
    }
    draft.elements = workspace.editor.exportElements();
}

function snapshotAllDrafts() {
    for (const [key, workspace] of workspaces.entries()) {
        const draft = documentDrafts.get(key);
        if (!draft || !workspace?.editor) {
            continue;
        }
        draft.elements = workspace.editor.exportElements();
    }
}

function bytesToBase64(bytes) {
    if (!(bytes instanceof Uint8Array)) {
        return '';
    }
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

async function collectDocumentsForSave() {
    snapshotAllDrafts();
    const documents = [];
    for (const key of selectedDocuments) {
        const draft = documentDrafts.get(key);
        const workspace = workspaces.get(key);
        if (!draft || !workspace) {
            continue;
        }
        const meta = draft.meta ?? workspace.meta ?? {};
        const requestId = meta.requestId ?? '';
        const elements = Array.isArray(draft.elements) && draft.elements.length
            ? draft.elements
            : workspace.editor.exportElements();
        let pdfData = '';
        try {
            const pdfBytes = await workspace.editor.generatePdfBytes();
            pdfData = bytesToBase64(pdfBytes);
        } catch (error) {
            console.error('Impossible de générer le PDF pour la sauvegarde.', error);
        }
        documents.push({
            key,
            meta,
            elements,
            clientName: resolveClientLabel(requestId),
            accent: getClientColor(requestId),
            pdfData,
        });
    }
    return documents;
}

function syncSaveFolderField() {
    if (!saveFolderField) {
        return;
    }
    const targetInput = saveForm?.querySelector('input[name="save-target"]:checked');
    const mode = targetInput?.dataset.mode ?? '';
    const shouldShow = mode === 'client';
    saveFolderField.hidden = !shouldShow;
    if (saveFolderNameInput) {
        saveFolderNameInput.disabled = !shouldShow;
        const desired = saveDialogFolderName ?? '';
        if (saveFolderNameInput.value !== desired) {
            saveFolderNameInput.value = desired;
        }
    }
}

function renderSaveDialog(documents, destinations) {
    if (saveSummaryList) {
        saveSummaryList.innerHTML = '';
        for (const doc of documents) {
            const li = document.createElement('li');
            const title = document.createElement('strong');
            title.textContent = doc.meta.name ?? 'Document';
            const client = document.createElement('span');
            const accent = doc.accent ?? getClientColor(doc.meta.requestId ?? '');
            const textColor = deriveTextColor(accent);
            client.textContent = doc.clientName || resolveClientLabel(doc.meta.requestId ?? '');
            li.style.borderColor = hexToRgba(accent, 0.45);
            li.style.background = `linear-gradient(135deg, rgba(255,255,255,0.94), ${hexToRgba(accent, 0.35)})`;
            li.style.color = textColor;
            title.style.color = textColor;
            client.style.color = textColor;
            li.append(title, client);
            saveSummaryList.appendChild(li);
        }
    }

    if (saveExistingList) {
        saveExistingList.innerHTML = '';
    }
    let defaultSelection = null;
    let hasExisting = false;

    for (const entry of destinations) {
        const existingFolders = Array.isArray(entry.existing) ? entry.existing : [];
        for (const folder of existingFolders) {
            const relativePath = typeof folder.relativePath === 'string' && folder.relativePath !== ''
                ? folder.relativePath
                : (typeof folder.path === 'string' && folder.path !== '' ? folder.path : (folder.name ?? 'Documents générés'));
            if (!relativePath) {
                continue;
            }
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'save-target';
            input.value = JSON.stringify({ mode: 'existing', requestId: entry.requestId, path: relativePath });
            input.dataset.mode = 'existing';
            input.dataset.requestId = entry.requestId ?? '';
            input.addEventListener('change', () => {
                syncSaveFolderField();
            });
            const span = document.createElement('span');
            const folderName = folder.name ?? relativePath;
            span.textContent = `${entry.displayName ?? resolveClientLabel(entry.requestId)} – ${folderName}`;
            const accent = getClientColor(entry.requestId);
            const textColor = deriveTextColor(accent);
            label.style.borderColor = hexToRgba(accent, 0.45);
            label.style.background = `linear-gradient(135deg, rgba(255,255,255,0.96), ${hexToRgba(accent, 0.3)})`;
            label.style.color = textColor;
            label.append(input, span);
            saveExistingList?.appendChild(label);
            hasExisting = true;
            if (!defaultSelection) {
                defaultSelection = input;
            }
        }
    }

    if (saveExistingEmpty) {
        saveExistingEmpty.hidden = hasExisting;
    }

    if (saveClientList) {
        saveClientList.innerHTML = '';
        const requestOrder = [...new Set(documents.map(doc => doc.meta.requestId))];
        for (const requestId of requestOrder) {
            const destination = destinations.find(item => item.requestId === requestId);
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'save-target';
            input.value = JSON.stringify({ mode: 'client', requestId });
            input.dataset.mode = 'client';
            input.dataset.requestId = requestId;
            input.addEventListener('change', () => {
                syncSaveFolderField();
                if (saveFolderNameInput) {
                    requestAnimationFrame(() => {
                        saveFolderNameInput.focus();
                        saveFolderNameInput.select();
                    });
                }
            });
            const span = document.createElement('span');
            span.textContent = destination?.displayName ?? resolveClientLabel(requestId);
            const accent = getClientColor(requestId);
            const textColor = deriveTextColor(accent);
            label.style.borderColor = hexToRgba(accent, 0.45);
            label.style.background = `linear-gradient(135deg, rgba(255,255,255,0.94), ${hexToRgba(accent, 0.25)})`;
            label.style.color = textColor;
            label.append(input, span);
            saveClientList.appendChild(label);
            if (!defaultSelection && requestOrder.length === 1) {
                defaultSelection = input;
            }
        }
        if (!defaultSelection) {
            const firstClientInput = saveClientList.querySelector('input[name="save-target"]');
            if (firstClientInput) {
                defaultSelection = firstClientInput;
            }
        }
    }

    if (defaultSelection) {
        defaultSelection.checked = true;
    }

    syncSaveFolderField();

    if (saveProgressSection) {
        saveProgressSection.hidden = true;
    }
    if (saveProgressBar) {
        saveProgressBar.style.width = '0%';
    }
    if (saveProgressLabel) {
        saveProgressLabel.textContent = '0%';
    }
    if (saveProgressMessage) {
        saveProgressMessage.textContent = '';
    }
    if (saveFeedback) {
        saveFeedback.textContent = '';
        saveFeedback.classList.remove('is-success');
    }
    if (saveSubmitButton) {
        saveSubmitButton.disabled = false;
        saveSubmitButton.textContent = 'Sauvegarder';
    }
}

async function openSaveWorkflow(documents) {
    if (!saveDialog || !saveForm) {
        throw new Error('Interface de sauvegarde indisponible.');
    }
    if (!documents.length) {
        throw new Error('Aucun document sélectionné.');
    }

    saveDialogFolderName = '';
    const requestOrder = [...new Set(documents.map(doc => doc.meta.requestId))];
    const destinations = await fetchSigningDestinations(requestOrder);
    renderSaveDialog(documents, destinations);

    return new Promise((resolve, reject) => {
        let closed = false;
        let progressTimer = null;
        let progressValue = 0;

        const cleanup = () => {
            saveForm.removeEventListener('submit', onSubmit);
            saveDialog.removeEventListener('keydown', onKeyDown);
            saveCancelTargets.forEach(btn => btn.removeEventListener('click', onCancel));
            if (progressTimer) {
                clearInterval(progressTimer);
                progressTimer = null;
            }
        };

        const closeDialog = (result, cancelled = false) => {
            if (closed) {
                return;
            }
            closed = true;
            cleanup();
            saveDialog.setAttribute('aria-hidden', 'true');
            saveDialog.hidden = true;
            if (cancelled) {
                reject(result);
            } else {
                resolve(result);
            }
        };

        const onCancel = () => {
            if (saveSubmitButton?.disabled) {
                return;
            }
            closeDialog(null, true);
        };

        saveCancelTargets.forEach(btn => btn.addEventListener('click', onCancel));

        const onKeyDown = event => {
            if (event.key === 'Escape' && !saveSubmitButton?.disabled) {
                event.preventDefault();
                closeDialog(null, true);
            }
        };

        saveDialog.addEventListener('keydown', onKeyDown);

        const setProgress = value => {
            progressValue = Math.max(0, Math.min(100, value));
            if (saveProgressBar) {
                saveProgressBar.style.width = `${progressValue}%`;
            }
            if (saveProgressLabel) {
                saveProgressLabel.textContent = `${Math.round(progressValue)}%`;
            }
        };

        const startProgress = () => {
            setProgress(1);
            if (progressTimer) {
                clearInterval(progressTimer);
            }
            progressTimer = setInterval(() => {
                if (progressValue >= 90) {
                    return;
                }
                const increment = Math.random() * 6 + 2;
                setProgress(Math.min(90, progressValue + increment));
            }, 320);
        };

        const stopProgress = () => {
            if (progressTimer) {
                clearInterval(progressTimer);
                progressTimer = null;
            }
        };

        const onSubmit = async event => {
            event.preventDefault();
            const targetInput = saveForm.querySelector('input[name="save-target"]:checked');
            if (!targetInput) {
                if (saveFeedback) {
                    saveFeedback.textContent = 'Veuillez sélectionner une destination.';
                    saveFeedback.classList.remove('is-success');
                }
                return;
            }
            let selection;
            try {
                selection = JSON.parse(targetInput.value);
            } catch (error) {
                selection = null;
            }
            if (!selection || !selection.requestId) {
                if (saveFeedback) {
                    saveFeedback.textContent = 'Destination invalide.';
                    saveFeedback.classList.remove('is-success');
                }
                return;
            }

            const payload = {
                targetMode: selection.mode,
                targetRequestId: selection.requestId,
                existingPath: selection.path ?? null,
                documents: documents.map(item => ({
                    requestId: item.meta.requestId,
                    document: item.meta.name,
                    elements: item.elements,
                    fileName: item.meta.name,
                    pdfData: item.pdfData,
                })),
            };
            if (selection.mode === 'client') {
                payload.folderName = saveDialogFolderName ?? '';
            }

            if (saveSubmitButton) {
                saveSubmitButton.disabled = true;
                saveSubmitButton.textContent = 'En cours…';
            }
            if (saveFeedback) {
                saveFeedback.textContent = '';
                saveFeedback.classList.remove('is-success');
            }
            if (saveProgressSection) {
                saveProgressSection.hidden = false;
            }
            if (saveProgressMessage) {
                saveProgressMessage.textContent = 'Sauvegarde en cours...';
            }

            startProgress();

            try {
                const { data } = await postJson(`${config.apiBaseUrl}?action=saveDocuments`, payload);
                stopProgress();
                setProgress(100);
                if (saveProgressMessage) {
                    saveProgressMessage.textContent = 'Succès!';
                }
                if (saveFeedback) {
                    saveFeedback.textContent = 'Succès!';
                    saveFeedback.classList.add('is-success');
                }
                showToast('Succès!');
                setTimeout(() => closeDialog(data ?? {}), 650);
            } catch (error) {
                stopProgress();
                setProgress(0);
                if (saveProgressMessage) {
                    saveProgressMessage.textContent = '';
                }
                if (saveProgressSection) {
                    saveProgressSection.hidden = true;
                }
                if (saveFeedback) {
                    const message = error instanceof Error ? error.message : 'Échec de la sauvegarde.';
                    saveFeedback.textContent = message;
                    saveFeedback.classList.remove('is-success');
                }
                if (saveSubmitButton) {
                    saveSubmitButton.disabled = false;
                    saveSubmitButton.textContent = 'Sauvegarder';
                }
            }
        };

        saveForm.addEventListener('submit', onSubmit);

        saveDialog.hidden = false;
        saveDialog.setAttribute('aria-hidden', 'false');
        const panel = saveDialog.querySelector('.save-dialog-panel');
        if (panel instanceof HTMLElement) {
            panel.focus();
        }
    });
}

async function loadDocumentWithState(doc) {
    const key = getDocumentKey(doc);
    saveCurrentDraft();
    if (activeRequestId !== doc.requestId) {
        if (!selectedClients.has(doc.requestId)) {
            try {
                const { data } = await fetchJson(`${config.apiBaseUrl}?action=getRequestData&request=${encodeURIComponent(doc.requestId)}`);
                const accent = getClientColor(doc.requestId);
                selectedClients.set(doc.requestId, { ...data, accent });
                updateVariablePanel();
            } catch (error) {
                console.error(error);
            }
        }
        activeRequestId = doc.requestId;
        refreshClientButtons();
        updateSelectedClientsUi();
        await refreshDocuments(true);
    }
    if (!selectedDocuments.includes(key)) {
        selectedDocuments.push(key);
        documentDrafts.set(key, { meta: doc, elements: [] });
    } else if (!documentDrafts.has(key)) {
        documentDrafts.set(key, { meta: doc, elements: [] });
    }
    const workspace = createWorkspace(doc);
    workspace.meta = doc;
    const draft = documentDrafts.get(key);
    const needsLoad = !workspace.loaded || workspace.currentPath !== doc.path;
    if (needsLoad) {
        await workspace.editor.loadDocumentFromUrl(doc.path, doc);
        workspace.loaded = true;
        workspace.currentPath = doc.path;
        if (draft?.elements?.length) {
            workspace.editor.importElements(draft.elements);
        }
    }
    if (draft) {
        draft.meta = doc;
    }
    setActiveWorkspace(key);
    showFeedback('Document chargé.');
    refreshDocumentButtonStates();
    updateNavigationButtons();
}

if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener('click', () => {
        resetSelection();
        showFeedback('Sélection effacée.');
    });
}

loadVariableDefinitionsAndProfile().catch(error => console.error(error));
loadRequests().catch(error => console.error(error));
initTools();
setupSearch();
updateZoomLabel();
updateDocumentClientContext();
updateNavigationButtons();