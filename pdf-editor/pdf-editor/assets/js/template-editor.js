

import { createPdfEditor } from './pdf-editor.js';

const config = window.TEMPLATE_EDITOR_CONFIG ?? {};
const viewer = document.getElementById('template-viewer');
const feedbackEl = document.getElementById('template-editor-feedback');
const nameInput = document.getElementById('template-name');
const statusIndicator = document.querySelector('[data-role="status-indicator"]');
const templateList = document.getElementById('template-list');
const templateListEmpty = document.getElementById('template-list-empty');
const templateLibraryDialog = document.getElementById('template-library-dialog');
const templateLibraryPanel = templateLibraryDialog?.querySelector('.template-library-dialog__panel') ?? null;
const templateLibraryEl = templateLibraryDialog?.querySelector('.template-library') ?? document.querySelector('.template-library');
const templateCardTemplate = document.getElementById('template-card-template');
const templateLibraryViewButtons = {
    grid: templateLibraryDialog?.querySelector('[data-template-library-view="grid"]')
        ?? document.querySelector('[data-template-library-view="grid"]'),
    list: templateLibraryDialog?.querySelector('[data-template-library-view="list"]')
        ?? document.querySelector('[data-template-library-view="list"]'),
};
const templateLibrarySortSelects = Array.from(document.querySelectorAll('[data-template-library-sort]'));
const toast = document.getElementById('template-feedback');
const modeDescription = document.querySelector('[data-role="mode-description"]');
const fileInput = document.getElementById('template-file-input');
const saveBtn = document.getElementById('template-save');
const newBtn = document.getElementById('template-new');
const chooseExistingBtn = document.getElementById('template-choose-existing');
const addTextBtn = document.getElementById('template-add-text');
const addSignatureBtn = document.getElementById('template-add-signature');
const zoomInBtn = document.getElementById('template-zoom-in');
const zoomOutBtn = document.getElementById('template-zoom-out');
const zoomLevelEl = document.getElementById('template-zoom-level');
const maxClientsInput = document.getElementById('template-max-clients');
const maxClientsConfigBtn = document.getElementById('template-max-clients-config');
const maxClientsDialog = document.getElementById('template-client-config');
const maxClientsForm = document.getElementById('template-client-config-form');
const maxClientsDialogInput = document.getElementById('template-client-config-input');
const variableClientDialog = document.getElementById('variable-client-dialog');
const variableClientDialogTitle = document.getElementById('variable-client-dialog-title');
const variableClientDialogHint = variableClientDialog?.querySelector('[data-variable-client-hint]') ?? null;
const variableClientDialogList = variableClientDialog?.querySelector('[data-variable-client-list]') ?? null;
const variableClientDialogPanel = variableClientDialog?.querySelector('.variable-client-dialog-panel') ?? null;
const variablePanel = document.getElementById('variable-panel');
const questionActionPanel = document.getElementById('question-action-panel');
const questionClassListEl = questionActionPanel?.querySelector('[data-role="question-class-list"]') ?? null;
const questionClassEmptyEl = questionActionPanel?.querySelector('[data-role="question-class-empty"]') ?? null;
const questionActionButtons = questionActionPanel?.querySelectorAll('[data-question-action]') ?? [];
const floatingAddTextBtn = document.getElementById('template-floating-add-text');
const floatingAddSignatureBtn = document.getElementById('template-floating-add-signature');
const floatingSignatureLibraryBtn = document.getElementById('template-floating-signature-library');
const variableShortcutDialog = document.getElementById('variable-shortcut-dialog');
const variableShortcutDialogPanel = variableShortcutDialog?.querySelector('.variable-shortcut-dialog__panel') ?? null;
const variableShortcutDialogTitle = document.getElementById('variable-shortcut-title');
const variableShortcutListContainer = variableShortcutDialog?.querySelector('[data-role="shortcut-list"]') ?? null;
const variableShortcutSelectionBox = variableShortcutDialog?.querySelector('.variable-shortcut-dialog__selection') ?? null;
const clientDataSidebarTrigger = document.getElementById('client-data-sidebar-trigger');
const clientDataToggle = document.getElementById('client-data-toggle');
const clientDataDialog = document.getElementById('client-data-dialog');
const clientDataDialogBackdrop = clientDataDialog?.querySelector('[data-client-dialog-action="dismiss"]') ?? null;
const clientDataDialogClose = document.getElementById('client-data-dialog-close');
const clientDataDialogCancel = document.getElementById('client-data-dialog-cancel');
const clientDataShortcutBtn = document.getElementById('client-data-shortcuts');
const clientDataPinBtn = document.getElementById('client-data-pin');
const clientDataList = document.getElementById('client-data-list');
const clientDataLayer = document.getElementById('client-data-layer');
const clientDataMiniPanel = document.getElementById('client-data-mini-panel');
const clientDataMiniPinBtn = document.getElementById('client-data-mini-pin');
const clientDataMiniShortcutBtn = document.getElementById('client-data-mini-shortcuts');
const clientDataUiEnabled = Boolean(clientDataDialog);

if (clientDataDialog) {
    clientDataDialog.hidden = true;
    clientDataDialog.setAttribute('aria-hidden', 'true');
}

const variableLists = new Map();
if (variablePanel) {
    const groups = variablePanel.querySelectorAll('.variable-group');
    groups.forEach(group => {
        const id = group.dataset.group ?? '';
        const list = group.querySelector('.variable-list');
        if (id && list) {
            variableLists.set(id, list);
        }
    });
}

let editor = null;
let templates = [];
let activeTemplateId = null;
let isDirty = false;
let variableDefinitions = { groups: [] };
let adminProfile = {};
let currentMaxClients = 1;
let maxClientsDialogOpen = false;
let variableClientDialogOpen = false;
let pendingVariableDescriptor = null;
let pendingVariableTrigger = null;
let questionClasses = [];
let questionClassLibrary = [];
let templateQuestionSettings = { classes: [], selectedBlobs: [] };
let templateLibraryViewMode = templateLibraryEl?.dataset.viewMode === 'list' ? 'list' : 'grid';
let templateLibraryDialogOpen = false;
let templateLibrarySortMode = 'date';

const previewCache = new Map();
const previewPromises = new Map();
const VARIABLE_DOCK_STORAGE_KEY = 'templateEditorDockState.v1';
const variableDescriptorMap = new Map();
const variableGroupUi = new Map();
const pinnedPanels = new Map();
const selectionSets = new Map();
const variableDockState = loadDockState();

let shortcutDialogOpen = false;
let shortcutDialogGroupId = null;
let shortcutDialogSelection = new Set();
let shortcutDialogItems = [];
let shortcutDialogReturnFocus = null;
let lassoState = null;
let clientDataSnapshots = new Map();
let clientBubblesVisible = false;
let pinnedClientBlocks = new Map();
let clientMiniPanelOpen = false;
let coordinatePickHandler = null;
let coordinatePickCursor = '';
let coordinatePreviousTool = null;

function initEditor() {
    if (!viewer) {
        return;
    }
    editor = createPdfEditor(viewer, {
        feedbackEl,
    });
    updateZoomDisplay();
}

function updateZoomDisplay() {
    if (!zoomLevelEl) {
        return;
    }
    const scale = editor?.state?.scale ?? 1;
    const percent = Math.round(scale * 100);
    zoomLevelEl.textContent = `${percent}%`;
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

function showToast(message, options = {}) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-success', options.success === true);
    toast.classList.add('is-visible');
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, options.duration ?? 2600);
}

function setStatus(message, { success = false } = {}) {
    if (!statusIndicator) return;
    statusIndicator.textContent = message;
    statusIndicator.classList.toggle('is-success', success);
}

function markDirty() {
    if (!editor || !editor.state?.pdf) {
        return;
    }
    if (!isDirty) {
        isDirty = true;
        setStatus('Modifications non sauvegardées');
    }
}

function clearDirty() {
    isDirty = false;
    setStatus('Modèle prêt', { success: true });
}

function applyModeDescription(mode) {
    if (!modeDescription) return;
    const messages = {
        prefilled: 'Choisissez un modèle, ajustez-le puis sauvegardez la version finale à partager avec vos clients.',
        fill: 'Ouvrez un modèle pour le personnaliser en fonction des informations d’un client.',
        edit: 'Sélectionnez un modèle existant pour le mettre à jour avant de le réutiliser.',
        register: 'Importez un nouveau document ou modifiez un modèle existant afin de l’ajouter à votre bibliothèque.',
    };
    modeDescription.textContent = messages[mode] ?? messages.register;
}

function loadDockState() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(VARIABLE_DOCK_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed ? parsed : {};
    } catch (error) {
        console.warn('Impossible de lire l’état des blocs fixés.', error);
        return {};
    }
}

function persistDockState() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    try {
        window.localStorage.setItem(VARIABLE_DOCK_STORAGE_KEY, JSON.stringify(variableDockState));
    } catch (error) {
        console.warn('Impossible de sauvegarder l’état des blocs fixés.', error);
    }
}

function getGroupDockState(groupId) {
    if (!groupId) {
        return { pinned: false, selectedKeys: [], position: null };
    }
    let state = variableDockState[groupId];
    if (!state || typeof state !== 'object') {
        state = { pinned: false, selectedKeys: [], position: null };
        variableDockState[groupId] = state;
    }
    if (!Array.isArray(state.selectedKeys)) {
        state.selectedKeys = [];
    }
    if (state.position && (typeof state.position.x !== 'number' || typeof state.position.y !== 'number')) {
        state.position = null;
    }
    state.pinned = state.pinned === true;
    return state;
}

function getGroupSelectionSet(groupId) {
    let set = selectionSets.get(groupId);
    if (!set) {
        const state = getGroupDockState(groupId);
        const keys = Array.isArray(state.selectedKeys) ? state.selectedKeys : [];
        set = new Set(keys.filter(key => typeof key === 'string' && key.trim() !== ''));
        selectionSets.set(groupId, set);
    }
    return set;
}

function setGroupSelection(groupId, input) {
    const nextSet = new Set();
    if (input instanceof Set) {
        input.forEach(key => {
            if (typeof key === 'string' && key.trim() !== '') {
                nextSet.add(key.trim());
            }
        });
    } else if (Array.isArray(input)) {
        for (const key of input) {
            if (typeof key === 'string' && key.trim() !== '') {
                nextSet.add(key.trim());
            }
        }
    }
    selectionSets.set(groupId, nextSet);
    const state = getGroupDockState(groupId);
    state.selectedKeys = Array.from(nextSet);
    persistDockState();
    refreshGroupHighlights(groupId);
    updateFloatingPanelContent(groupId);
}

function normalizeGroupSelection(groupId, descriptorMap) {
    const selection = getGroupSelectionSet(groupId);
    if (!selection.size || !descriptorMap || !descriptorMap.size) {
        return selection;
    }
    const normalized = new Set();
    for (const key of descriptorMap.keys()) {
        if (selection.has(key)) {
            normalized.add(key);
        }
    }
    if (normalized.size !== selection.size) {
        selectionSets.set(groupId, normalized);
        const state = getGroupDockState(groupId);
        state.selectedKeys = Array.from(normalized);
        persistDockState();
        refreshGroupHighlights(groupId);
        return normalized;
    }
    return selection;
}

function refreshGroupHighlights(groupId) {
    const entry = variableGroupUi.get(groupId);
    if (!entry) {
        return;
    }
    const selection = getGroupSelectionSet(groupId);
    const buttons = entry.group.querySelectorAll('.variable-button');
    buttons.forEach(button => {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        const key = button.dataset.variableKey ?? '';
        if (!key) {
            button.classList.remove('is-highlighted');
            return;
        }
        button.classList.toggle('is-highlighted', selection.has(key));
    });
}

function updateGroupPinUi(groupId) {
    const entry = variableGroupUi.get(groupId);
    if (!entry) {
        return;
    }
    const state = getGroupDockState(groupId);
    entry.group.classList.toggle('is-pinned', state.pinned);
    if (entry.placeholder) {
        entry.placeholder.hidden = !state.pinned;
    }
    if (entry.shortcutButton) {
        entry.shortcutButton.hidden = !state.pinned;
        if (state.pinned) {
            entry.shortcutButton.removeAttribute('aria-hidden');
        } else {
            entry.shortcutButton.setAttribute('aria-hidden', 'true');
        }
    }
    if (entry.pinButton) {
        entry.pinButton.classList.toggle('is-active', state.pinned);
        entry.pinButton.setAttribute('aria-pressed', state.pinned ? 'true' : 'false');
        entry.pinButton.title = state.pinned
            ? 'Bloc fixé (cliquer pour le libérer)'
            : 'Fixer à l’écran';
        const label = state.pinned
            ? `Libérer ${entry.title}`
            : `Fixer ${entry.title} à l’écran`;
        entry.pinButton.setAttribute('aria-label', label);
    }
}

function clampPanelPosition(panel, desiredLeft, desiredTop) {
    const rect = panel.getBoundingClientRect();
    const width = rect.width || panel.offsetWidth || 260;
    const height = rect.height || panel.offsetHeight || 220;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const maxTop = Math.max(8, window.innerHeight - height - 8);
    const clampedLeft = Math.min(Math.max(8, desiredLeft), maxLeft);
    const clampedTop = Math.min(Math.max(8, desiredTop), maxTop);
    return { left: clampedLeft, top: clampedTop };
}

function applyPanelPosition(panel, groupId) {
    const state = getGroupDockState(groupId);
    const desiredLeft = typeof state.position?.x === 'number' ? state.position.x : 24;
    const desiredTop = typeof state.position?.y === 'number' ? state.position.y : 96;
    const { left, top } = clampPanelPosition(panel, desiredLeft, desiredTop);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    state.position = { x: left, y: top };
    persistDockState();
}

function repositionPinnedPanels() {
    pinnedPanels.forEach((entry, groupId) => {
        applyPanelPosition(entry.panel, groupId);
    });
}

function ensurePinnedPanel(groupId, { focus = false } = {}) {
    if (!groupId) {
        return null;
    }
    let entry = pinnedPanels.get(groupId);
    const groupInfo = variableGroupUi.get(groupId);
    const title = groupInfo?.title ?? 'Variables';
    if (!entry) {
        const panel = document.createElement('div');
        panel.className = 'variable-floating-panel';
        panel.dataset.groupId = groupId;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', `${title} – accès rapide`);
        panel.tabIndex = -1;

        const header = document.createElement('div');
        header.className = 'variable-floating-header';

        const heading = document.createElement('h3');
        heading.className = 'variable-floating-title';
        heading.textContent = title;

        const actions = document.createElement('div');
        actions.className = 'variable-floating-actions';

        const quickBtn = document.createElement('button');
        quickBtn.type = 'button';
        quickBtn.className = 'btn-icon';
        quickBtn.title = 'Sélectionner les items de raccourci';
        quickBtn.setAttribute('aria-label', 'Sélectionner les items de raccourci');
        quickBtn.textContent = '⚡︎';
        quickBtn.addEventListener('click', () => {
            openShortcutDialog(groupId, quickBtn);
        });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-icon';
        closeBtn.title = 'Fermer le bloc';
        closeBtn.setAttribute('aria-label', 'Fermer le bloc');
        closeBtn.textContent = '↩';
        closeBtn.addEventListener('click', () => {
            setGroupPinned(groupId, false, { focusPin: true });
        });

        actions.append(quickBtn, closeBtn);
        header.append(heading, actions);

        const list = document.createElement('ul');
        list.className = 'variable-floating-list';

        panel.append(header, list);
        document.body.appendChild(panel);
        makePanelDraggable(panel, header, groupId);
        pinnedPanels.set(groupId, { panel, list, titleEl: heading, quickBtn, closeBtn });
        entry = pinnedPanels.get(groupId);
        requestAnimationFrame(() => {
            applyPanelPosition(panel, groupId);
        });
    } else if (entry.titleEl && title) {
        entry.titleEl.textContent = title;
        entry.panel.setAttribute('aria-label', `${title} – accès rapide`);
    }
    updateFloatingPanelContent(groupId);
    if (focus && entry?.panel) {
        entry.panel.focus();
    }
    return entry?.panel ?? null;
}

function removePinnedPanel(groupId) {
    const entry = pinnedPanels.get(groupId);
    if (!entry) {
        return;
    }
    entry.panel.remove();
    pinnedPanels.delete(groupId);
}

function makePanelDraggable(panel, handle, groupId) {
    if (!(panel instanceof HTMLElement) || !(handle instanceof HTMLElement)) {
        return;
    }
    handle.addEventListener('pointerdown', event => {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        if (event.target.closest('button')) {
            return;
        }
        event.preventDefault();
        const pointerId = event.pointerId;
        const rect = panel.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        panel.classList.add('is-dragging');
        if (typeof handle.setPointerCapture === 'function') {
            handle.setPointerCapture(pointerId);
        }
        const move = moveEvent => {
            if (moveEvent.pointerId !== pointerId) {
                return;
            }
            const desiredLeft = moveEvent.clientX - offsetX;
            const desiredTop = moveEvent.clientY - offsetY;
            const { left, top } = clampPanelPosition(panel, desiredLeft, desiredTop);
            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
        };
        const release = endEvent => {
            if (endEvent.pointerId !== pointerId) {
                return;
            }
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', release);
            handle.removeEventListener('pointercancel', release);
            if (typeof handle.releasePointerCapture === 'function') {
                handle.releasePointerCapture(pointerId);
            }
            panel.classList.remove('is-dragging');
            const current = panel.getBoundingClientRect();
            const state = getGroupDockState(groupId);
            state.position = { x: current.left, y: current.top };
            persistDockState();
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', release);
        handle.addEventListener('pointercancel', release);
    });
}

function updateFloatingPanelContent(groupId) {
    const entry = pinnedPanels.get(groupId);
    if (!entry) {
        return;
    }
    const descriptorMap = variableDescriptorMap.get(groupId);
    entry.list.innerHTML = '';
    if (!descriptorMap || !descriptorMap.size) {
        const empty = document.createElement('li');
        empty.className = 'variable-floating-empty';
        empty.textContent = 'Aucun élément disponible pour cette section.';
        entry.list.appendChild(empty);
        return;
    }
    const selection = normalizeGroupSelection(groupId, descriptorMap);
    const items = [];
    if (selection.size) {
        for (const [key, data] of descriptorMap.entries()) {
            if (selection.has(key)) {
                items.push(data);
            }
        }
    } else {
        items.push(...descriptorMap.values());
    }
    if (!items.length) {
        const empty = document.createElement('li');
        empty.className = 'variable-floating-empty';
        empty.textContent = 'Aucun élément sélectionné pour ce bloc.';
        entry.list.appendChild(empty);
        return;
    }
    for (const data of items) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'variable-button';
        button.dataset.variableKey = data.descriptor.key ?? '';
        button.textContent = data.label;
        if (data.value) {
            const span = document.createElement('span');
            span.className = 'variable-value';
            span.textContent = data.value;
            button.appendChild(span);
        }
        if (selection.has(data.descriptor.key)) {
            button.classList.add('is-highlighted');
        }
        button.addEventListener('click', () => handleVariableClick(data.descriptor, button));
        li.appendChild(button);
        entry.list.appendChild(li);
    }
}

function setGroupPinned(groupId, pinned, { focusPin = false } = {}) {
    const state = getGroupDockState(groupId);
    if (pinned) {
        state.pinned = true;
        persistDockState();
        ensurePinnedPanel(groupId);
    } else {
        state.pinned = false;
        persistDockState();
        removePinnedPanel(groupId);
    }
    updateGroupPinUi(groupId);
    if (!pinned && focusPin) {
        const entry = variableGroupUi.get(groupId);
        entry?.pinButton?.focus();
    }
}

function toggleGroupPin(groupId) {
    const state = getGroupDockState(groupId);
    setGroupPinned(groupId, !state.pinned);
}

function openShortcutDialog(groupId, trigger = null) {
    if (!variableShortcutDialog) {
        return;
    }
    shortcutDialogOpen = true;
    shortcutDialogGroupId = groupId;
    shortcutDialogReturnFocus = trigger instanceof HTMLElement ? trigger : null;
    shortcutDialogSelection = new Set(getGroupSelectionSet(groupId));
    shortcutDialogItems = [];
    if (variableShortcutDialogTitle) {
        const title = variableGroupUi.get(groupId)?.title ?? 'Éléments';
        variableShortcutDialogTitle.textContent = `Sélectionner les éléments – ${title}`;
    }
    if (variableShortcutSelectionBox) {
        variableShortcutSelectionBox.hidden = true;
        variableShortcutSelectionBox.style.width = '0px';
        variableShortcutSelectionBox.style.height = '0px';
    }
    renderShortcutDialogList(groupId);
    variableShortcutDialog.hidden = false;
    variableShortcutDialog.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        if (variableShortcutDialogPanel instanceof HTMLElement) {
            variableShortcutDialogPanel.focus();
        }
        const first = variableShortcutListContainer?.querySelector('.variable-shortcut-item');
        if (first instanceof HTMLElement) {
            first.focus();
        }
    });
}

function closeShortcutDialog({ restoreFocus = false } = {}) {
    if (!variableShortcutDialog) {
        shortcutDialogOpen = false;
        shortcutDialogGroupId = null;
        shortcutDialogSelection = new Set();
        shortcutDialogItems = [];
        shortcutDialogReturnFocus = null;
        return;
    }
    variableShortcutDialog.hidden = true;
    variableShortcutDialog.setAttribute('aria-hidden', 'true');
    shortcutDialogOpen = false;
    shortcutDialogGroupId = null;
    shortcutDialogSelection = new Set();
    shortcutDialogItems = [];
    if (variableShortcutListContainer) {
        variableShortcutListContainer.innerHTML = '';
    }
    if (variableShortcutSelectionBox) {
        variableShortcutSelectionBox.hidden = true;
        variableShortcutSelectionBox.style.width = '0px';
        variableShortcutSelectionBox.style.height = '0px';
    }
    if (restoreFocus && shortcutDialogReturnFocus instanceof HTMLElement) {
        shortcutDialogReturnFocus.focus();
    }
    shortcutDialogReturnFocus = null;
}

function renderShortcutDialogList(groupId) {
    if (!variableShortcutListContainer) {
        return;
    }
    variableShortcutListContainer.innerHTML = '';
    shortcutDialogItems = [];
    const descriptorMap = variableDescriptorMap.get(groupId);
    if (!descriptorMap || !descriptorMap.size) {
        const empty = document.createElement('p');
        empty.className = 'variable-floating-empty';
        empty.textContent = 'Aucun élément disponible pour cette section.';
        variableShortcutListContainer.appendChild(empty);
        return;
    }
    const list = document.createElement('ul');
    list.className = 'variable-shortcut-list';
    for (const [key, data] of descriptorMap.entries()) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'variable-shortcut-item';
        button.dataset.variableKey = key;
        const label = document.createElement('span');
        label.className = 'variable-shortcut-label';
        label.textContent = data.label;
        button.appendChild(label);
        if (data.value) {
            const value = document.createElement('span');
            value.className = 'variable-shortcut-value';
            value.textContent = data.value;
            button.appendChild(value);
        }
        const handle = document.createElement('span');
        handle.className = 'variable-shortcut-handle';
        handle.textContent = '⟟';
        handle.title = 'Accès rapide';
        button.appendChild(handle);
        if (shortcutDialogSelection.has(key)) {
            button.classList.add('is-selected');
        }
        button.addEventListener('click', () => {
            if (shortcutDialogSelection.has(key)) {
                shortcutDialogSelection.delete(key);
                button.classList.remove('is-selected');
            } else {
                shortcutDialogSelection.add(key);
                button.classList.add('is-selected');
            }
        });
        item.appendChild(button);
        list.appendChild(item);
        shortcutDialogItems.push({ key, button });
    }
    variableShortcutListContainer.appendChild(list);
}

function syncShortcutDialogSelection() {
    for (const item of shortcutDialogItems) {
        item.button.classList.toggle('is-selected', shortcutDialogSelection.has(item.key));
    }
}

function handleShortcutPointerDown(event) {
    if (!shortcutDialogOpen || !variableShortcutListContainer) {
        return;
    }
    if (!(event.target instanceof HTMLElement)) {
        return;
    }
    if (event.target.closest('button')) {
        return;
    }
    event.preventDefault();
    const rect = variableShortcutListContainer.getBoundingClientRect();
    lassoState = {
        pointerId: event.pointerId,
        rect,
        originX: event.clientX,
        originY: event.clientY,
    };
    if (variableShortcutSelectionBox) {
        variableShortcutSelectionBox.hidden = false;
        variableShortcutSelectionBox.style.left = '0px';
        variableShortcutSelectionBox.style.top = '0px';
        variableShortcutSelectionBox.style.width = '0px';
        variableShortcutSelectionBox.style.height = '0px';
    }
    const move = ev => updateLassoSelection(ev);
    const finish = ev => {
        if (!lassoState || ev.pointerId !== lassoState.pointerId) {
            return;
        }
        endLassoSelection();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
}

function updateLassoSelection(event) {
    if (!lassoState || !variableShortcutSelectionBox) {
        return;
    }
    if (event.pointerId !== lassoState.pointerId) {
        return;
    }
    const { rect, originX, originY } = lassoState;
    const currentX = Math.min(Math.max(event.clientX, rect.left), rect.right);
    const currentY = Math.min(Math.max(event.clientY, rect.top), rect.bottom);
    const startX = Math.min(Math.max(originX, rect.left), rect.right);
    const startY = Math.min(Math.max(originY, rect.top), rect.bottom);
    const left = Math.min(startX, currentX) - rect.left;
    const top = Math.min(startY, currentY) - rect.top;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    variableShortcutSelectionBox.style.left = `${left}px`;
    variableShortcutSelectionBox.style.top = `${top}px`;
    variableShortcutSelectionBox.style.width = `${width}px`;
    variableShortcutSelectionBox.style.height = `${height}px`;
    const minX = Math.min(startX, currentX);
    const maxX = Math.max(startX, currentX);
    const minY = Math.min(startY, currentY);
    const maxY = Math.max(startY, currentY);
    for (const item of shortcutDialogItems) {
        const bounds = item.button.getBoundingClientRect();
        const intersects = bounds.right >= minX && bounds.left <= maxX
            && bounds.bottom >= minY && bounds.top <= maxY;
        if (intersects) {
            if (!shortcutDialogSelection.has(item.key)) {
                shortcutDialogSelection.add(item.key);
            }
            item.button.classList.add('is-selected');
        }
    }
}

function endLassoSelection() {
    if (variableShortcutSelectionBox) {
        variableShortcutSelectionBox.hidden = true;
        variableShortcutSelectionBox.style.width = '0px';
        variableShortcutSelectionBox.style.height = '0px';
    }
    lassoState = null;
}

function applyShortcutSelection() {
    if (!shortcutDialogGroupId) {
        closeShortcutDialog({ restoreFocus: true });
        return;
    }
    setGroupSelection(shortcutDialogGroupId, shortcutDialogSelection);
    setGroupPinned(shortcutDialogGroupId, true);
    closeShortcutDialog({ restoreFocus: true });
}

function initVariableDockingControls() {
    if (!variablePanel) {
        return;
    }
    const groups = Array.from(variablePanel.querySelectorAll('.variable-group'));
    groups.forEach((group, index) => {
        const groupId = group.dataset.group ?? `group-${index}`;
        const title = group.querySelector('h3')?.textContent?.trim() ?? 'Variables';
        const pinButton = group.querySelector('[data-variable-action="pin"]');
        const shortcutButton = group.querySelector('[data-variable-action="shortcuts"]');
        const placeholder = group.querySelector('.variable-pin-placeholder');
        variableGroupUi.set(groupId, { group, pinButton, shortcutButton, placeholder, title });
        if (placeholder) {
            placeholder.hidden = true;
        }
        if (pinButton) {
            pinButton.addEventListener('click', event => {
                event.preventDefault();
                toggleGroupPin(groupId);
            });
        }
        if (shortcutButton) {
            shortcutButton.hidden = true;
            shortcutButton.addEventListener('click', event => {
                event.preventDefault();
                openShortcutDialog(groupId, shortcutButton);
            });
        }
        const state = getGroupDockState(groupId);
        if (!selectionSets.has(groupId)) {
            const set = new Set(Array.isArray(state.selectedKeys)
                ? state.selectedKeys.filter(key => typeof key === 'string' && key.trim() !== '')
                : []);
            selectionSets.set(groupId, set);
        }
        updateGroupPinUi(groupId);
        if (state.pinned) {
            ensurePinnedPanel(groupId);
        }
    });
    if (variableShortcutListContainer) {
        variableShortcutListContainer.addEventListener('pointerdown', handleShortcutPointerDown);
    }
    if (variableShortcutDialog) {
        variableShortcutDialog.addEventListener('click', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            const action = target.dataset.variableShortcutAction;
            if (!action) {
                return;
            }
            event.preventDefault();
            if (action === 'dismiss' || action === 'close' || action === 'cancel') {
                closeShortcutDialog({ restoreFocus: true });
            } else if (action === 'apply') {
                applyShortcutSelection();
            } else if (action === 'toggle') {
                shortcutDialogSelection = new Set();
                syncShortcutDialogSelection();
            }
        });
    }
}

function sanitizeFileName(name) {
    const base = name.replace(/\.[^.]+$/, '');
    return base.trim();
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

function getTemplateTimestamp(template) {
    if (!template || typeof template !== 'object') {
        return 0;
    }
    const keys = ['updatedAt', 'modifiedAt', 'createdAt'];
    for (const key of keys) {
        const stamp = toTimestamp(template[key]);
        if (stamp) {
            return stamp;
        }
    }
    return 0;
}

function getTemplateName(template) {
    if (!template || typeof template !== 'object') {
        return '';
    }
    const candidates = [template.name, template.title, template.displayName, template.id];
    for (const candidate of candidates) {
        if (candidate) {
            return String(candidate).trim();
        }
    }
    return '';
}

function sortTemplates(list, mode = 'date') {
    const normalized = normalizeSortMode(mode);
    return Array.from(list ?? []).sort((a, b) => {
        if (normalized === 'alpha') {
            const nameDiff = getTemplateName(a).localeCompare(getTemplateName(b), 'fr', { sensitivity: 'base' });
            if (nameDiff !== 0) {
                return nameDiff;
            }
            const dateDiff = getTemplateTimestamp(b) - getTemplateTimestamp(a);
            if (dateDiff !== 0) {
                return dateDiff;
            }
            return String(a?.id ?? '').localeCompare(String(b?.id ?? ''), 'fr', { sensitivity: 'base' });
        }
        const diff = getTemplateTimestamp(b) - getTemplateTimestamp(a);
        if (diff !== 0) {
            return diff;
        }
        return getTemplateName(a).localeCompare(getTemplateName(b), 'fr', { sensitivity: 'base' });
    });
}

function normalizeTemplateData(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const maxClientsValue = Number(raw.maxClients ?? 1);
    const maxClients = Number.isFinite(maxClientsValue) && maxClientsValue >= 1
        ? Math.min(Math.floor(maxClientsValue), 10)
        : 1;
    const elements = Array.isArray(raw.elements) ? raw.elements : [];
    const questionSettings = normalizeQuestionSettings(raw.questionSettings ?? {});
    return {
        ...raw,
        maxClients,
        variableMappings: Array.isArray(raw.variableMappings) ? raw.variableMappings : [],
        elements,
        questionSettings,
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
        questions: Array.isArray(raw.questions) ? raw.questions : [],
        responseBlobs: Array.isArray(raw.responseBlobs) ? raw.responseBlobs : [],
        metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata : {},
        documentId: typeof raw.documentId === 'string' ? raw.documentId.trim() : (typeof raw.metadata?.documentId === 'string' ? raw.metadata.documentId.trim() : ''),
        documentName: typeof raw.documentName === 'string'
            ? raw.documentName.trim()
            : (typeof raw.metadata?.documentName === 'string' ? raw.metadata.documentName.trim() : ''),
    };
}

function normalizeQuestionSettings(raw) {
    const result = { classes: [], selectedBlobs: [] };
    if (!raw || typeof raw !== 'object') {
        return result;
    }
    const assignments = Array.isArray(raw.classes) ? raw.classes : [];
    assignments.forEach(entry => {
        if (!entry || typeof entry !== 'object') {
            return;
        }
        const id = typeof entry.id === 'string' ? entry.id.trim() : '';
        if (!id) {
            return;
        }
        const defaultBlobs = Array.isArray(entry.defaultBlobs)
            ? entry.defaultBlobs.map(blobId => String(blobId).trim()).filter(Boolean)
            : [];
        result.classes.push({
            id,
            required: entry.required === true,
            defaultBlobs,
            notes: typeof entry.notes === 'string' ? entry.notes : '',
            metadata: typeof entry.metadata === 'object' && entry.metadata !== null ? entry.metadata : {},
        });
    });
    const rawBlobs = Array.isArray(raw.selectedBlobs)
        ? raw.selectedBlobs
        : (Array.isArray(raw.blobs) ? raw.blobs : []);
    rawBlobs.forEach(entry => {
        if (!entry || typeof entry !== 'object') {
            return;
        }
        const classId = typeof entry.classId === 'string' ? entry.classId.trim() : '';
        const blobId = typeof entry.blobId === 'string' ? entry.blobId.trim() : '';
        if (!classId || !blobId) {
            return;
        }
        result.selectedBlobs.push({
            classId,
            blobId,
            label: typeof entry.label === 'string' ? entry.label : '',
            metadata: typeof entry.metadata === 'object' && entry.metadata !== null ? entry.metadata : {},
        });
    });
    return result;
}

function pruneQuestionSettings() {
    const knownIds = new Set(questionClasses.map(item => item.id));
    templateQuestionSettings.classes = Array.isArray(templateQuestionSettings.classes)
        ? templateQuestionSettings.classes
            .filter(item => knownIds.has(item.id))
            .map(item => {
                const classData = questionClasses.find(cls => cls.id === item.id);
                const allowedBlobs = new Set((classData?.responseBlobs ?? []).map(blob => String(blob.id ?? '').trim()).filter(Boolean));
                const defaultBlobs = Array.isArray(item.defaultBlobs)
                    ? item.defaultBlobs.map(blobId => String(blobId).trim()).filter(blobId => allowedBlobs.has(blobId))
                    : [];
                return {
                    id: item.id,
                    required: item.required === true,
                    defaultBlobs,
                    notes: typeof item.notes === 'string' ? item.notes : '',
                    metadata: typeof item.metadata === 'object' && item.metadata !== null ? item.metadata : {},
                };
            })
        : [];
    templateQuestionSettings.selectedBlobs = Array.isArray(templateQuestionSettings.selectedBlobs)
        ? templateQuestionSettings.selectedBlobs.filter(entry => knownIds.has(entry.classId))
        : [];
}

function applyQuestionClassFilter() {
    if (!Array.isArray(questionClassLibrary)) {
        questionClasses = [];
        return;
    }
    if (!activeTemplateId) {
        questionClasses = [];
        return;
    }
    questionClasses = questionClassLibrary.filter(item => (item.documentId ?? '') === activeTemplateId);
}

function setQuestionClasses(rawList) {
    questionClassLibrary = Array.isArray(rawList)
        ? rawList.map(normalizeQuestionClass).filter(Boolean)
        : [];
    applyQuestionClassFilter();
    pruneQuestionSettings();
    if (questionActionPanel && (questionClassListEl || questionClassEmptyEl)) {
        renderQuestionActionPanel();
    }
}

function setTemplateQuestionSettings(settings, options = {}) {
    templateQuestionSettings = normalizeQuestionSettings(settings);
    pruneQuestionSettings();
    if (!options.silent) {
        renderQuestionActionPanel();
    }
}

function getClassAssignment(classId) {
    return templateQuestionSettings.classes.find(item => item.id === classId) ?? null;
}

function ensureClassAssignment(classId) {
    let assignment = getClassAssignment(classId);
    if (!assignment) {
        assignment = {
            id: classId,
            required: false,
            defaultBlobs: [],
            notes: '',
            metadata: {},
        };
        templateQuestionSettings.classes.push(assignment);
    }
    return assignment;
}

function toggleClassSelection(classId, selected) {
    if (selected) {
        ensureClassAssignment(classId);
    } else {
        templateQuestionSettings.classes = templateQuestionSettings.classes.filter(item => item.id !== classId);
        templateQuestionSettings.selectedBlobs = templateQuestionSettings.selectedBlobs.filter(item => item.classId !== classId);
    }
    markDirty();
    renderQuestionActionPanel();
}

function setClassRequired(classId, required) {
    const assignment = ensureClassAssignment(classId);
    assignment.required = required;
    markDirty();
    renderQuestionActionPanel();
}

function toggleClassBlob(classId, blobId, enabled) {
    const assignment = ensureClassAssignment(classId);
    if (!Array.isArray(assignment.defaultBlobs)) {
        assignment.defaultBlobs = [];
    }
    const exists = assignment.defaultBlobs.includes(blobId);
    if (enabled && !exists) {
        assignment.defaultBlobs.push(blobId);
    } else if (!enabled && exists) {
        assignment.defaultBlobs = assignment.defaultBlobs.filter(item => item !== blobId);
    }
    markDirty();
}

function exportQuestionSettings() {
    return {
        classes: templateQuestionSettings.classes.map(item => ({
            id: item.id,
            required: item.required === true,
            defaultBlobs: Array.isArray(item.defaultBlobs) ? [...item.defaultBlobs] : [],
            notes: item.notes ?? '',
            metadata: item.metadata ?? {},
        })),
        selectedBlobs: Array.isArray(templateQuestionSettings.selectedBlobs)
            ? templateQuestionSettings.selectedBlobs.map(item => ({
                classId: item.classId,
                blobId: item.blobId,
                label: item.label ?? '',
                metadata: item.metadata ?? {},
            }))
            : [],
    };
}

function createBlobToggle(classData, blob, assignment, selected) {
    const label = document.createElement('label');
    label.className = 'question-action-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = selected;
    input.disabled = !assignment;
    input.addEventListener('change', () => {
        toggleClassBlob(classData.id, blob.id, input.checked);
    });
    label.appendChild(input);
    label.append(blob.label || blob.code || blob.id);
    return label;
}

function renderQuestionActionPanel() {
    if (!questionClassListEl) {
        return;
    }
    questionClassListEl.innerHTML = '';
    if (!questionClasses.length) {
        if (questionClassEmptyEl) {
            questionClassEmptyEl.hidden = false;
        }
        return;
    }
    if (questionClassEmptyEl) {
        questionClassEmptyEl.hidden = true;
    }
    questionClasses.forEach(classData => {
        const assignment = getClassAssignment(classData.id);
        const selected = Boolean(assignment);
        const card = document.createElement('article');
        card.className = 'question-action-card';
        card.dataset.classId = classData.id;

        const header = document.createElement('div');
        header.className = 'question-action-card__header';

        const info = document.createElement('div');
        info.className = 'question-action-card__info';

        const dot = document.createElement('label');
        dot.className = 'question-action-dot';
        if (selected) {
            dot.classList.add('is-selected');
        }
        const selectInput = document.createElement('input');
        selectInput.type = 'checkbox';
        selectInput.checked = selected;
        selectInput.addEventListener('change', () => {
            toggleClassSelection(classData.id, selectInput.checked);
        });
        dot.appendChild(selectInput);
        info.appendChild(dot);

        const titleStack = document.createElement('div');
        const title = document.createElement('h5');
        title.className = 'question-action-card__title';
        title.textContent = classData.title;
        const code = document.createElement('p');
        code.className = 'question-action-card__code';
        code.textContent = classData.code;
        titleStack.appendChild(title);
        titleStack.appendChild(code);
        info.appendChild(titleStack);

        header.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'question-action-card__actions';

        const requiredLabel = document.createElement('label');
        requiredLabel.className = 'question-action-toggle';
        const requiredInput = document.createElement('input');
        requiredInput.type = 'checkbox';
        requiredInput.checked = assignment?.required ?? false;
        requiredInput.disabled = !selected;
        requiredInput.addEventListener('change', () => {
            setClassRequired(classData.id, requiredInput.checked);
        });
        requiredLabel.appendChild(requiredInput);
        requiredLabel.append('Classe obligatoire');
        actions.appendChild(requiredLabel);

        const manageBtn = document.createElement('button');
        manageBtn.type = 'button';
        manageBtn.className = 'btn';
        manageBtn.textContent = 'Modifier';
        manageBtn.addEventListener('click', () => {
            openQuestionManager({ classId: classData.id });
        });
        actions.appendChild(manageBtn);

        header.appendChild(actions);
        card.appendChild(header);

        if (classData.description) {
            const description = document.createElement('p');
            description.className = 'question-action-card__description';
            description.textContent = classData.description;
            card.appendChild(description);
        }

        const meta = document.createElement('div');
        meta.className = 'question-action-card__meta';
        const questionCount = document.createElement('span');
        questionCount.className = 'question-action-badge';
        questionCount.textContent = `${classData.questions.length} question${classData.questions.length > 1 ? 's' : ''}`;
        meta.appendChild(questionCount);
        if (classData.responseBlobs.length) {
            const blobBadge = document.createElement('span');
            blobBadge.className = 'question-action-badge';
            blobBadge.textContent = `${classData.responseBlobs.length} bloc${classData.responseBlobs.length > 1 ? 's' : ''} de réponses`;
            meta.appendChild(blobBadge);
        }
        card.appendChild(meta);

        if (classData.responseBlobs.length) {
            const blobContainer = document.createElement('div');
            blobContainer.className = 'question-action-blobs';
            const blobLabel = document.createElement('span');
            blobLabel.className = 'question-action-chip';
            blobLabel.textContent = 'Blocs par défaut';
            blobContainer.appendChild(blobLabel);
            classData.responseBlobs.forEach(blob => {
                const blobToggle = createBlobToggle(classData, blob, selected ? assignment : null, assignment?.defaultBlobs?.includes(blob.id));
                blobToggle.querySelector('input').disabled = !selected;
                blobContainer.appendChild(blobToggle);
            });
            card.appendChild(blobContainer);
        }

        questionClassListEl.appendChild(card);
    });
}

function openQuestionManager(options = {}) {
    const url = new URL('question_actions_manager.php', window.location.href);
    if (options.classId) {
        url.searchParams.set('class', options.classId);
    }
    if (options.createNew) {
        url.searchParams.set('new', '1');
    }
    if (activeTemplateId) {
        url.searchParams.set('document', activeTemplateId);
    }
    const features = 'width=1200,height=860,scrollbars=yes,resizable=yes';
    window.open(url.toString(), 'questionActionsManager', features);
}

async function refreshQuestionClasses() {
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=listQuestionClasses`, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        setQuestionClasses(payload.data?.classes ?? []);
    } catch (error) {
        console.error(error);
    }
}

function formatFileSize(value) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        return '';
    }
    const thresholds = [
        { limit: 1024 ** 4, suffix: 'To' },
        { limit: 1024 ** 3, suffix: 'Go' },
        { limit: 1024 ** 2, suffix: 'Mo' },
        { limit: 1024, suffix: 'Ko' },
    ];
    for (const { limit, suffix } of thresholds) {
        if (size >= limit) {
            const scaled = size / limit;
            const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
            return `${rounded.toString().replace('.', ',')} ${suffix}`;
        }
    }
    const roundedBytes = Math.max(1, Math.round(size));
    return `${roundedBytes} o`;
}

function formatTemplateTimestamp(input) {
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
    return {
        iso: date.toISOString(),
        label: `${year}-${month}-${day} ${hours}:${minutes}`,
    };
}

function createTemplateCard(template) {
    let li;
    let button;
    let figure;
    let preview;
    let img;
    let caption;
    let nameTarget;
    let metaTarget;
    let updatedTarget;
    let sizeTarget;

    if (templateCardTemplate?.content?.firstElementChild) {
        li = templateCardTemplate.content.firstElementChild.cloneNode(true);
        button = li.querySelector('.template-card-button');
        figure = li.querySelector('figure');
        preview = li.querySelector('.template-card-preview');
        img = preview?.querySelector('img') ?? null;
        caption = figure?.querySelector('figcaption') ?? null;
        nameTarget = li.querySelector('.template-card-name');
        metaTarget = li.querySelector('.template-card-meta');
        updatedTarget = li.querySelector('.template-card-updated');
        sizeTarget = li.querySelector('.template-card-size');
    }

    if (!li || !button || !figure || !preview) {
        li = document.createElement('li');
        li.className = 'template-card';
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'template-card-button';
        figure = document.createElement('figure');
        preview = document.createElement('div');
        preview.className = 'template-card-preview';
        img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        preview.appendChild(img);
        caption = document.createElement('figcaption');
        nameTarget = document.createElement('span');
        nameTarget.className = 'template-card-name';
        caption.appendChild(nameTarget);
        metaTarget = document.createElement('span');
        metaTarget.className = 'template-card-meta';
        metaTarget.hidden = true;
        updatedTarget = document.createElement('time');
        updatedTarget.className = 'template-card-updated';
        updatedTarget.hidden = true;
        metaTarget.appendChild(updatedTarget);
        sizeTarget = document.createElement('span');
        sizeTarget.className = 'template-card-size';
        sizeTarget.hidden = true;
        metaTarget.appendChild(sizeTarget);
        caption.appendChild(metaTarget);
        figure.append(preview, caption);
        button.appendChild(figure);
        li.appendChild(button);
    } else {
        img ??= document.createElement('img');
    }

    li.classList.add('template-card');
    if (template.id === activeTemplateId) {
        li.classList.add('is-active');
    } else {
        li.classList.remove('is-active');
    }

    button.dataset.templateId = template.id;
    button.addEventListener('click', () => {
        openTemplate(template.id);
        if (templateLibraryDialogOpen) {
            closeTemplateLibraryDialog({ restoreFocus: false });
        }
    });

    if (nameTarget) {
        nameTarget.textContent = template.name ?? template.id ?? 'Modèle';
    } else if (caption) {
        caption.textContent = template.name ?? template.id ?? 'Modèle';
    }

    const updatedInfo = formatTemplateTimestamp(template.updatedAt ?? template.createdAt ?? null);
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
        const hasMeta = Boolean((updatedTarget && !updatedTarget.hidden) || (sizeTarget && !sizeTarget.hidden));
        metaTarget.hidden = !hasMeta;
    }

    getTemplatePreview(template).then(url => {
        if (!preview) {
            return;
        }
        const imageEl = preview.querySelector('img') ?? img;
        if (!imageEl) {
            return;
        }
        if (url) {
            imageEl.src = url;
            imageEl.hidden = false;
            preview.classList.remove('is-empty');
        } else {
            imageEl.removeAttribute('src');
            imageEl.hidden = true;
            preview.classList.add('is-empty');
        }
    }).catch(() => {
        if (!preview) {
            return;
        }
        const imageEl = preview.querySelector('img') ?? img;
        if (!imageEl) {
            return;
        }
        imageEl.removeAttribute('src');
        imageEl.hidden = true;
        preview.classList.add('is-empty');
    });

    return li;
}

function setTemplateLibraryView(mode) {
    if (!templateLibraryEl) {
        return;
    }
    const normalized = mode === 'list' ? 'list' : 'grid';
    templateLibraryViewMode = normalized;
    templateLibraryEl.dataset.viewMode = normalized;
    if (templateLibraryViewButtons.grid) {
        templateLibraryViewButtons.grid.setAttribute('aria-pressed', normalized === 'grid' ? 'true' : 'false');
        templateLibraryViewButtons.grid.classList.toggle('is-active', normalized === 'grid');
    }
    if (templateLibraryViewButtons.list) {
        templateLibraryViewButtons.list.setAttribute('aria-pressed', normalized === 'list' ? 'true' : 'false');
        templateLibraryViewButtons.list.classList.toggle('is-active', normalized === 'list');
    }
}

function openTemplateLibraryDialog() {
    if (!templateLibraryDialog) {
        return;
    }
    templateLibraryDialog.hidden = false;
    templateLibraryDialog.setAttribute('aria-hidden', 'false');
    templateLibraryDialogOpen = true;
    setTemplateLibraryView(templateLibraryViewMode);
    renderTemplateList();
    if (templateLibraryPanel) {
        templateLibraryPanel.focus({ preventScroll: true });
    }
}

function closeTemplateLibraryDialog(options = {}) {
    if (!templateLibraryDialog) {
        return;
    }
    if (templateLibraryDialog.hidden) {
        return;
    }
    templateLibraryDialog.hidden = true;
    templateLibraryDialog.setAttribute('aria-hidden', 'true');
    templateLibraryDialogOpen = false;
    if (options.restoreFocus !== false) {
        chooseExistingBtn?.focus({ preventScroll: true });
    }
}

function renderTemplateList() {
    if (!templateList || !templateListEmpty) return;
    templateList.innerHTML = '';
    if (!templates.length) {
        templateListEmpty.hidden = false;
        return;
    }
    templateListEmpty.hidden = true;
    templateLibrarySortMode = normalizeSortMode(templateLibrarySortMode);
    for (const select of templateLibrarySortSelects) {
        select.value = templateLibrarySortMode;
    }
    const sortedTemplates = sortTemplates(templates, templateLibrarySortMode);
    for (const template of sortedTemplates) {
        templateList.appendChild(createTemplateCard(template));
    }
}

async function getTemplatePreview(template) {
    const key = template.id;
    if (previewCache.has(key)) {
        return previewCache.get(key);
    }
    if (previewPromises.has(key)) {
        return previewPromises.get(key);
    }
    const task = (async () => {
        if (!window.pdfjsLib) {
            return '';
        }
        try {
            const loadingTask = window.pdfjsLib.getDocument({ url: template.publicPath, withCredentials: false });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const baseViewport = page.getViewport({ scale: 1 });
            const targetHeight = 220;
            const scale = Math.min(1.5, targetHeight / baseViewport.height);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            previewCache.set(key, dataUrl);
            return dataUrl;
        } catch (error) {
            console.error('Prévisualisation impossible', error);
            previewCache.set(key, '');
            return '';
        } finally {
            previewPromises.delete(key);
        }
    })();
    previewPromises.set(key, task);
    return task;
}

async function loadTemplates() {
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=listTemplates`);
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        templates = Array.isArray(payload.data?.templates)
            ? payload.data.templates.map(normalizeTemplateData).filter(Boolean)
            : [];
        renderTemplateList();
    } catch (error) {
        console.error(error);
        showToast('Impossible de charger les modèles.');
    }
}

function upsertTemplate(template) {
    const normalized = normalizeTemplateData(template);
    if (!normalized) {
        return;
    }
    const index = templates.findIndex(item => item.id === normalized.id);
    if (index >= 0) {
        templates[index] = normalized;
    } else {
        templates.unshift(normalized);
    }
    renderTemplateList();
}

function updateHistory(templateId) {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') ?? currentMode;
    if (templateId) {
        params.set('template', templateId);
    } else {
        params.delete('template');
    }
    if (mode) {
        params.set('mode', mode);
    }
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, document.title, next);
}

async function openTemplate(templateId, options = {}) {
    if (!editor) return;
    const template = templates.find(item => item.id === templateId);
    if (!template) {
        showToast('Modèle introuvable.');
        return;
    }
    const silent = options.silent === true;
    const skipHistory = options.skipHistory === true;
    try {
        await editor.loadDocumentFromUrl(template.publicPath, {
            requestId: `template:${template.id}`,
            name: template.name,
        });
        if (nameInput) {
            nameInput.value = template.name;
        }
        if (maxClientsInput) {
            maxClientsInput.value = String(template.maxClients ?? 1);
        }
        setCurrentMaxClients(template.maxClients ?? 1, { updateInput: true, force: true });
        if (Array.isArray(template.elements)) {
            editor.importElements(template.elements);
        } else {
            editor.importElements([]);
        }
        activeTemplateId = template.id;
        applyQuestionClassFilter();
        setTemplateQuestionSettings(template.questionSettings ?? {}, { silent: true });
        renderQuestionActionPanel();
        clearDirty();
        updateZoomDisplay();
        if (!skipHistory) {
            updateHistory(template.id);
        }
        renderTemplateList();
        document.title = `${template.name} – Éditeur de modèles PDF`;
        if (!silent) {
            showToast('Modèle chargé.', { success: true, duration: 1800 });
        }
    } catch (error) {
        console.error(error);
        showToast('Impossible de charger le modèle.');
    }
}

async function saveTemplate() {
    if (!editor) {
        return;
    }
    const name = nameInput?.value.trim() ?? '';
    if (!name) {
        showToast('Indiquez un nom pour le modèle.');
        nameInput?.focus();
        return;
    }
    if (!editor.state?.pdf) {
        showToast('Importez un document avant d’enregistrer.');
        return;
    }
    const rawMaxClients = maxClientsInput?.value ?? currentMaxClients;
    const maxClientsValue = setCurrentMaxClients(rawMaxClients, { updateInput: true });

    saveBtn.disabled = true;
    saveBtn.textContent = 'En cours…';
    try {
        const originalBytes = typeof editor.getOriginalPdfBytes === 'function'
            ? editor.getOriginalPdfBytes()
            : null;
        const bytes = originalBytes ?? await editor.generatePdfBytes();
        const pdfData = bytesToBase64(bytes);
        const elements = editor.exportElements();
        const variableMappings = typeof editor.exportVariableMappings === 'function'
            ? editor.exportVariableMappings()
            : [];
        const payload = {
            name,
            pdfData,
            maxClients: maxClientsValue,
            variableMappings,
            elements,
            questionSettings: exportQuestionSettings(),
        };
        if (activeTemplateId) {
            payload.templateId = activeTemplateId;
        }
        const response = await fetch(`${config.apiBaseUrl}?action=saveTemplate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const body = await response.json();
        const savedTemplate = normalizeTemplateData(body.data?.template);
        if (!savedTemplate) {
            throw new Error('Réponse incomplète');
        }
        upsertTemplate(savedTemplate);
        activeTemplateId = savedTemplate.id;
        await openTemplate(savedTemplate.id, { silent: true, skipHistory: true });
        updateHistory(savedTemplate.id);
        clearDirty();
        document.title = `${savedTemplate.name} – Éditeur de modèles PDF`;
        showToast('Modèle sauvegardé.', { success: true });
        window.opener?.postMessage({ type: 'template-saved', templateId: savedTemplate.id }, window.location.origin);
    } catch (error) {
        console.error(error);
        showToast('Impossible d’enregistrer le modèle.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Enregistrer';
    }
}

function resetForNewTemplate() {
    activeTemplateId = null;
    applyQuestionClassFilter();
    if (nameInput) {
        nameInput.value = '';
        nameInput.focus();
    }
    setCurrentMaxClients(1, { updateInput: true, force: true });
    editor?.importElements([]);
    setTemplateQuestionSettings({ classes: [], selectedBlobs: [] }, { silent: true });
    renderQuestionActionPanel();
    setStatus('Nouveau modèle en préparation');
    updateZoomDisplay();
    updateHistory(null);
    showToast('Importez un PDF pour créer un nouveau modèle.');
}

function handleFileImport(event) {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement) || !editor) {
        return;
    }
    const file = input.files?.[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            await editor.loadDocumentFromBuffer(reader.result, {
                requestId: 'template:local',
                name: file.name,
            });
            if (nameInput) {
                nameInput.value = sanitizeFileName(file.name);
            }
            setCurrentMaxClients(1, { updateInput: true, force: true });
            activeTemplateId = null;
            markDirty();
            updateZoomDisplay();
            document.title = `${sanitizeFileName(file.name)} – Éditeur de modèles PDF`;
            showToast('PDF importé.', { success: true });
            showMaxClientsDialog(1);
        } catch (error) {
            console.error(error);
            showToast('Impossible de charger le PDF importé.');
        }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
}

function watchInteractions() {
    if (!viewer) return;
    viewer.addEventListener('pointerup', () => {
        markDirty();
    });
    viewer.addEventListener('keyup', event => {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            markDirty();
        }
    });
}

function initToolButtons() {
    const handleAddText = () => {
        if (!editor) {
            return;
        }
        editor.setTool('text');
        editor.feedback('Cliquez sur le document pour ajouter du texte.');
    };

    const handleAddSignature = () => {
        if (!editor) {
            return;
        }
        editor.setTool('signature');
        editor.feedback('Cliquez sur le document pour apposer votre signature.');
    };

    const handleOpenSignatureLibrary = async () => {
        if (!editor) {
            return;
        }
        try {
            const signature = await editor.pickSignatureFromLibrary();
            if (signature && editor.prepareSignaturePlacement(signature)) {
                editor.feedback('Cliquez sur le document pour placer la signature sélectionnée.');
            } else if (!signature) {
                editor.feedback('Aucune signature n’a été sélectionnée.');
            } else {
                editor.feedback('Impossible de préparer la signature choisie.');
            }
        } catch (error) {
            console.error(error);
            if (typeof editor.feedback === 'function') {
                editor.feedback('Impossible d’ouvrir la bibliothèque de signatures.');
            }
        }
    };

    addTextBtn?.addEventListener('click', handleAddText);
    floatingAddTextBtn?.addEventListener('click', handleAddText);

    addSignatureBtn?.addEventListener('click', handleAddSignature);
    floatingAddSignatureBtn?.addEventListener('click', handleAddSignature);

    floatingSignatureLibraryBtn?.addEventListener('click', () => {
        handleOpenSignatureLibrary().catch(error => console.error(error));
    });
}

function initZoomControls() {
    zoomInBtn?.addEventListener('click', () => {
        if (!editor) return;
        editor.zoom(1.1);
        updateZoomDisplay();
    });
    zoomOutBtn?.addEventListener('click', () => {
        if (!editor) return;
        editor.zoom(0.9);
        updateZoomDisplay();
    });
}

function initQuestionActionPanel() {
    if (!questionActionPanel) {
        return;
    }
    questionActionButtons.forEach(button => {
        const action = button.dataset.questionAction;
        if (action === 'open-manager') {
            button.addEventListener('click', () => openQuestionManager());
        } else if (action === 'create-class') {
            button.addEventListener('click', () => openQuestionManager({ createNew: true }));
        }
    });
    renderQuestionActionPanel();
}

async function loadVariables() {
    if (!variableLists.size && !questionActionPanel) {
        return;
    }
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=listVariables`);
        if (!response.ok) {
            throw new Error('Réponse invalide');
        }
        const payload = await response.json();
        variableDefinitions = payload.data?.definitions ?? { groups: [] };
        adminProfile = payload.data?.adminProfile ?? {};
        setQuestionClasses(payload.data?.questionClasses ?? []);
        if (maxClientsInput) {
            setCurrentMaxClients(maxClientsInput.value ?? currentMaxClients, { updateInput: true, force: true });
        } else {
            setCurrentMaxClients(currentMaxClients, { force: true });
        }
    } catch (error) {
        console.error(error);
        showToast('Impossible de charger les variables.');
    }
}

function clampMaxClients(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 1) {
        return 1;
    }
    return Math.min(Math.floor(number), 10);
}

function hideMaxClientsDialog() {
    if (!maxClientsDialog) {
        return;
    }
    maxClientsDialog.hidden = true;
    maxClientsDialog.setAttribute('aria-hidden', 'true');
    maxClientsDialogOpen = false;
    if (maxClientsDialogInput) {
        maxClientsDialogInput.value = String(currentMaxClients);
    }
}

function showMaxClientsDialog(initialValue = currentMaxClients) {
    if (!maxClientsDialog || !maxClientsForm || !maxClientsDialogInput) {
        const previous = currentMaxClients;
        const next = setCurrentMaxClients(initialValue, { updateInput: true, force: true });
        if (next !== previous) {
            markDirty();
        }
        return;
    }
    const sanitized = clampMaxClients(initialValue);
    maxClientsDialogInput.value = String(sanitized);
    if (maxClientsDialogOpen) {
        requestAnimationFrame(() => {
            maxClientsDialogInput.focus();
            if (typeof maxClientsDialogInput.select === 'function') {
                maxClientsDialogInput.select();
            }
        });
        return;
    }
    maxClientsDialog.hidden = false;
    maxClientsDialog.setAttribute('aria-hidden', 'false');
    maxClientsDialogOpen = true;
    requestAnimationFrame(() => {
        maxClientsDialogInput.focus();
        if (typeof maxClientsDialogInput.select === 'function') {
            maxClientsDialogInput.select();
        }
    });
}

function setCurrentMaxClients(value, options = {}) {
    const sanitized = clampMaxClients(value);
    const changed = sanitized !== currentMaxClients;
    currentMaxClients = sanitized;
    if (options.updateInput && maxClientsInput) {
        maxClientsInput.value = String(sanitized);
    }
    if ((changed || options.force) && typeof renderVariables === 'function') {
        renderVariables();
    }
    return sanitized;
}

function buildEffectiveVariableGroups() {
    const groups = Array.isArray(variableDefinitions?.groups) ? variableDefinitions.groups : [];
    const maxClients = currentMaxClients;
    const effective = [];
    for (const group of groups) {
        const baseFields = Array.isArray(group.fields) ? group.fields : [];
        const normalized = [];
        for (const field of baseFields) {
            const baseKeyRaw = typeof field.key === 'string' ? field.key : '';
            const baseKey = baseKeyRaw.trim();
            if (!baseKey) {
                continue;
            }
            const baseLabelRaw = typeof field.label === 'string' && field.label.trim() !== ''
                ? field.label.trim()
                : baseKey;
            const requiresRank = group.id === 'request' && maxClients > 1;
            const displayLabel = requiresRank
                ? `${baseLabelRaw} – choisir un client`
                : baseLabelRaw;
            const placeholder = typeof field.placeholder === 'string' && field.placeholder.trim() !== ''
                ? field.placeholder.trim()
                : `{{${baseKey}}}`;
            normalized.push({
                ...field,
                key: baseKey,
                baseKey,
                baseLabel: baseLabelRaw,
                displayLabel,
                rank: field.rank ?? null,
                placeholder,
                requiresRank,
            });
        }
        effective.push({ ...group, fields: normalized });
    }
    return effective;
}

function clampClientRank(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return null;
    }
    const max = Math.max(1, currentMaxClients);
    const normalized = Math.floor(number);
    if (normalized < 1) {
        return 1;
    }
    if (normalized > max) {
        return max;
    }
    return normalized;
}

function showVariableClientDialog(descriptor) {
    if (!variableClientDialog || !variableClientDialogList) {
        const fallbackRank = clampClientRank(descriptor?.rank ?? 1) ?? 1;
        insertVariableFromDescriptor(descriptor, fallbackRank);
        return;
    }
    pendingVariableDescriptor = descriptor;
    variableClientDialog.hidden = false;
    variableClientDialog.setAttribute('aria-hidden', 'false');
    variableClientDialogOpen = true;
    const baseLabel = descriptor?.baseLabel ?? descriptor?.label ?? descriptor?.key ?? 'Variable';
    if (variableClientDialogTitle) {
        variableClientDialogTitle.textContent = `À quel client attribuer « ${baseLabel} » ?`;
    }
    if (variableClientDialogHint) {
        if (currentMaxClients > 1) {
            variableClientDialogHint.textContent = `Sélectionnez le client ciblé pour cette variable (Client 1 à Client ${currentMaxClients}).`;
        } else {
            variableClientDialogHint.textContent = 'Sélectionnez le client ciblé pour cette variable.';
        }
    }
    variableClientDialogList.innerHTML = '';
    const total = Math.max(1, currentMaxClients);
    for (let rank = 1; rank <= total; rank++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.dataset.variableClientRank = String(rank);
        button.textContent = `Client ${rank}`;
        variableClientDialogList.appendChild(button);
    }
    requestAnimationFrame(() => {
        variableClientDialogPanel?.focus();
        const firstOption = variableClientDialogList.querySelector('button');
        if (firstOption) {
            firstOption.focus();
        }
    });
}

function hideVariableClientDialog({ focusTrigger = false } = {}) {
    if (!variableClientDialog) {
        pendingVariableDescriptor = null;
        pendingVariableTrigger = null;
        variableClientDialogOpen = false;
        return;
    }
    variableClientDialog.hidden = true;
    variableClientDialog.setAttribute('aria-hidden', 'true');
    variableClientDialogOpen = false;
    if (variableClientDialogList) {
        variableClientDialogList.innerHTML = '';
    }
    const trigger = pendingVariableTrigger instanceof HTMLElement ? pendingVariableTrigger : null;
    pendingVariableDescriptor = null;
    pendingVariableTrigger = null;
    if (focusTrigger && trigger) {
        requestAnimationFrame(() => {
            trigger.focus();
        });
    }
}

function commitVariableClientSelection(rank) {
    const normalized = clampClientRank(rank);
    const descriptor = pendingVariableDescriptor;
    hideVariableClientDialog({ focusTrigger: true });
    if (!descriptor || normalized === null) {
        return;
    }
    insertVariableFromDescriptor(descriptor, normalized);
}

function insertVariableFromDescriptor(descriptor, rankOverride = null) {
    if (!editor || !descriptor || typeof descriptor !== 'object') {
        return;
    }
    const baseKeyRaw = descriptor?.baseKey ?? descriptor?.key ?? '';
    const baseKey = typeof baseKeyRaw === 'string' ? baseKeyRaw.trim() : '';
    if (!baseKey) {
        return;
    }
    const groupId = descriptor?.groupId ?? '';
    const requiresRank = descriptor?.requiresRank === true || (groupId === 'request' && currentMaxClients > 1);
    let rank = rankOverride ?? descriptor?.rank ?? null;
    let key = descriptor?.key ?? baseKey;
    const baseLabel = descriptor?.baseLabel ?? descriptor?.label ?? baseKey;
    let label = baseLabel;

    if (groupId === 'request') {
        if (requiresRank) {
            if (!rank || rank < 1) {
                if (!variableClientDialog || !variableClientDialogList) {
                    rank = clampClientRank(1) ?? 1;
                } else {
                    showVariableClientDialog({ ...descriptor, baseKey, baseLabel });
                    return;
                }
            }
            rank = clampClientRank(rank) ?? 1;
            key = `${baseKey}_no${rank}`;
            label = `${baseLabel} – Client ${rank}`;
        } else {
            const match = typeof key === 'string' ? key.match(/_no(\d+)$/) : null;
            if (match) {
                const parsed = Number(match[1]);
                if (Number.isFinite(parsed) && parsed > 0) {
                    rank = parsed;
                    label = `${baseLabel} – Client ${rank}`;
                }
            }
        }
    }

    if (!key) {
        key = baseKey;
    }

    const placeholder = `{{${key}}}`;
    const rankValue = Number.isFinite(rank) && rank > 0 ? Math.floor(rank) : null;
    const variableMeta = {
        key,
        baseKey,
        label,
        groupId,
        rank: rankValue,
        placeholder,
    };

    editor.insertVariableValue(placeholder, { variable: variableMeta });
    pendingVariableTrigger = null;
    markDirty();
    showToast(`Variable « ${variableMeta.label} » prête à être utilisée.`, { success: true, duration: 1800 });
}

function handleVariableClick(descriptor, trigger) {
    if (trigger instanceof HTMLElement) {
        pendingVariableTrigger = trigger;
    } else {
        pendingVariableTrigger = null;
    }
    insertVariableFromDescriptor(descriptor);
}

function renderVariables() {
    const effectiveGroups = buildEffectiveVariableGroups();
    const groupMap = new Map(effectiveGroups.map(group => [group.id, group]));
    for (const [groupId, list] of variableLists.entries()) {
        list.innerHTML = '';
        const descriptorMap = new Map();
        variableDescriptorMap.set(groupId, descriptorMap);
        const group = groupMap.get(groupId);
        if (!group || !Array.isArray(group.fields) || !group.fields.length) {
            const empty = document.createElement('li');
            empty.textContent = 'Aucune variable disponible.';
            empty.className = 'variable-empty';
            list.appendChild(empty);
            normalizeGroupSelection(groupId, descriptorMap);
            refreshGroupHighlights(groupId);
            updateFloatingPanelContent(groupId);
            continue;
        }
        for (const field of group.fields) {
            if (!field.key) {
                continue;
            }
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'variable-button';
            button.dataset.variableKey = field.key ?? '';
            if (field.baseKey) {
                button.dataset.variableBaseKey = field.baseKey;
            }
            button.dataset.variableGroup = groupId;
            const descriptor = {
                key: field.key,
                baseKey: field.baseKey ?? field.key,
                baseLabel: field.baseLabel ?? field.label ?? field.key,
                placeholder: field.placeholder ?? `{{${field.key}}}`,
                rank: field.rank ?? null,
                groupId,
                requiresRank: field.requiresRank === true,
            };
            descriptor.displayLabel = field.displayLabel ?? descriptor.baseLabel;
            descriptor.label = descriptor.displayLabel;
            button.textContent = descriptor.displayLabel ?? descriptor.baseLabel ?? descriptor.key ?? 'Variable';
            let value = '';
            if (groupId === 'admin') {
                const keyForValue = field.baseKey ?? field.key;
                const rawValue = keyForValue ? adminProfile?.[keyForValue] : undefined;
                if (rawValue !== undefined && rawValue !== null) {
                    value = Array.isArray(rawValue)
                        ? rawValue.filter(Boolean).join(', ')
                        : String(rawValue);
                }
            }
            if (value) {
                const span = document.createElement('span');
                span.className = 'variable-value';
                span.textContent = value;
                button.appendChild(span);
                button.title = value;
            } else {
                button.title = descriptor.placeholder;
            }
            if (descriptor.requiresRank) {
                button.dataset.requiresRank = 'true';
                button.setAttribute('aria-haspopup', 'dialog');
            } else {
                delete button.dataset.requiresRank;
                button.removeAttribute('aria-haspopup');
            }
            button.addEventListener('click', () => handleVariableClick(descriptor, button));
            item.appendChild(button);
            list.appendChild(item);
            descriptorMap.set(descriptor.key, {
                descriptor,
                label: descriptor.displayLabel ?? descriptor.baseLabel ?? descriptor.key,
                value,
            });
        }
        normalizeGroupSelection(groupId, descriptorMap);
        refreshGroupHighlights(groupId);
        updateFloatingPanelContent(groupId);
    }
}

function handleMaxClientsCommit() {
    if (!maxClientsInput) {
        return;
    }
    const previous = currentMaxClients;
    const next = setCurrentMaxClients(maxClientsInput.value ?? currentMaxClients, { updateInput: true });
    if (next !== previous) {
        markDirty();
    }
}

const params = new URLSearchParams(window.location.search);
const currentMode = params.get('mode') ?? 'register';
const initialTemplateId = params.get('template');

applyModeDescription(currentMode);
initEditor();
watchInteractions();
initToolButtons();
initZoomControls();
initQuestionActionPanel();
initVariableDockingControls();
setTemplateQuestionSettings(templateQuestionSettings, { silent: true });
setStatus('Importez un document pour commencer');
setCurrentMaxClients(maxClientsInput?.value ?? currentMaxClients, { updateInput: true, force: false });

if (templateLibrarySortSelects.length) {
    templateLibrarySortMode = normalizeSortMode(templateLibrarySortSelects[0].value);
    for (const select of templateLibrarySortSelects) {
        select.value = templateLibrarySortMode;
        select.addEventListener('change', () => {
            templateLibrarySortMode = normalizeSortMode(select.value);
            for (const other of templateLibrarySortSelects) {
                if (other !== select) {
                    other.value = templateLibrarySortMode;
                }
            }
            renderTemplateList();
        });
    }
}

loadVariables();
loadTemplates().then(() => {
    if (initialTemplateId) {
        openTemplate(initialTemplateId);
    }
});
setTemplateLibraryView(templateLibraryViewMode);

window.addEventListener('resize', repositionPinnedPanels);

fileInput?.addEventListener('change', handleFileImport);
saveBtn?.addEventListener('click', saveTemplate);
newBtn?.addEventListener('click', resetForNewTemplate);
chooseExistingBtn?.addEventListener('click', () => {
    openTemplateLibraryDialog();
});
nameInput?.addEventListener('input', () => {
    if (nameInput.value.trim() !== '') {
        markDirty();
    }
});
window.addEventListener('message', event => {
    const data = event.data;
    if (data && typeof data === 'object' && data.type === 'question-classes-updated') {
        refreshQuestionClasses();
    }
});

window.addEventListener('qa-auto-selection-persisted', () => {
    refreshQuestionClasses();
});
maxClientsConfigBtn?.addEventListener('click', () => {
    showMaxClientsDialog(currentMaxClients);
});
maxClientsForm?.addEventListener('submit', event => {
    event.preventDefault();
    const previous = currentMaxClients;
    const value = clampMaxClients(maxClientsDialogInput?.value ?? currentMaxClients);
    const next = setCurrentMaxClients(value, { updateInput: true, force: true });
    if (next !== previous) {
        markDirty();
    }
    hideMaxClientsDialog();
});

templateLibraryViewButtons.grid?.addEventListener('click', event => {
    event.preventDefault();
    setTemplateLibraryView('grid');
});

templateLibraryViewButtons.list?.addEventListener('click', event => {
    event.preventDefault();
    setTemplateLibraryView('list');
});

templateLibraryDialog?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const action = target.dataset.templateLibraryAction;
    if (!action) {
        return;
    }
    event.preventDefault();
    if (action === 'dismiss' || action === 'close') {
        closeTemplateLibraryDialog();
    }
});

maxClientsDialog?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const action = target.dataset.templateConfigAction;
    if (!action) {
        return;
    }
    event.preventDefault();
    hideMaxClientsDialog();
});
variableClientDialogList?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
        return;
    }
    const rankValue = target.dataset.variableClientRank ?? '';
    event.preventDefault();
    commitVariableClientSelection(rankValue);
});
variableClientDialog?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const action = target.dataset.variableClientAction;
    if (!action) {
        return;
    }
    event.preventDefault();
    hideVariableClientDialog({ focusTrigger: true });
});
maxClientsInput?.addEventListener('input', markDirty);
maxClientsInput?.addEventListener('change', handleMaxClientsCommit);
maxClientsInput?.addEventListener('blur', handleMaxClientsCommit);
maxClientsInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMaxClientsCommit();
    }
});

if (clientDataUiEnabled) {
    window.addEventListener('qa-clients-changed', handleClientSelectionChange);
    clientDataSidebarTrigger?.addEventListener('click', () => openClientDataDialog());
    clientDataToggle?.addEventListener('click', toggleClientMiniPanel);
    clientDataDialogBackdrop?.addEventListener('click', closeClientDataDialog);
    clientDataDialog?.addEventListener('click', event => {
        if (event.target === clientDataDialog) {
            closeClientDataDialog();
        }
    });
    clientDataDialogClose?.addEventListener('click', closeClientDataDialog);
    clientDataDialogCancel?.addEventListener('click', closeClientDataDialog);
    clientDataPinBtn?.addEventListener('click', () => {
        pinClientBlocks();
        closeClientDataDialog();
        showClientDataMiniPanel();
    });
    clientDataShortcutBtn?.addEventListener('click', () => {
        if (clientDataDialog) {
            clientDataDialog.classList.add('pulse');
            window.setTimeout(() => clientDataDialog.classList.remove('pulse'), 600);
        }
    });
    clientDataMiniPinBtn?.addEventListener('click', () => {
        pinClientBlocks();
        hideClientDataMiniPanel();
    });
    clientDataMiniShortcutBtn?.addEventListener('click', () => {
        hideClientDataMiniPanel();
        openClientDataDialog({ focusShortcuts: true });
    });

    document.addEventListener('click', event => {
        if (!clientBubblesVisible) {
            return;
        }
        const target = event.target;
        const insideLayer = clientDataLayer?.contains(target);
        const insideDialog = clientDataDialog?.contains(target);
        const toggleClicked = clientDataToggle?.contains(target);
        const lockedBlock = clientDataLayer?.querySelector('[data-locked="true"]');
        if (lockedBlock && !insideLayer && !insideDialog && !toggleClicked) {
            return;
        }
        if (!insideLayer && !insideDialog && !toggleClicked) {
            hideClientBubbles();
        }
    });
}

function syncClientDataAvailability() {
    if (!clientDataUiEnabled) {
        return;
    }
    const hasClients = clientDataSnapshots.size > 0;
    const hasPinned = pinnedClientBlocks.size > 0;
    if (clientDataSidebarTrigger) {
        clientDataSidebarTrigger.hidden = !hasClients;
    }
    if (clientDataToggle) {
        clientDataToggle.hidden = !(hasClients || hasPinned);
        clientDataToggle.setAttribute('aria-expanded', hasClients || hasPinned ? String(clientMiniPanelOpen) : 'false');
    }
    if (!hasClients && !hasPinned) {
        hideClientDataMiniPanel();
    }
}

function showClientDataMiniPanel() {
    if (!clientDataMiniPanel || clientDataToggle?.hidden) {
        return;
    }
    clientMiniPanelOpen = true;
    clientDataMiniPanel.hidden = false;
    clientDataToggle?.setAttribute('aria-expanded', 'true');
}

function hideClientDataMiniPanel() {
    if (!clientDataMiniPanel) {
        return;
    }
    clientMiniPanelOpen = false;
    clientDataMiniPanel.hidden = true;
    clientDataToggle?.setAttribute('aria-expanded', 'false');
}

function toggleClientMiniPanel() {
    if (!clientDataMiniPanel || clientDataToggle?.hidden) {
        return;
    }
    if (clientMiniPanelOpen) {
        hideClientDataMiniPanel();
    } else {
        showClientDataMiniPanel();
    }
}

function createClientBubble(client, { pinned = false, offset = 0 } = {}) {
    const bubble = document.createElement('div');
    bubble.className = pinned ? 'client-data-block' : 'client-data-bubble';
    bubble.dataset.clientId = client.id;
    bubble.style.left = `${24 + offset}px`;
    bubble.style.top = `${140 + offset * 12}px`;
    bubble.dataset.locked = 'false';

    const header = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = pinned
        ? `Coordonnées des clients sélectionnés – ${client.displayName}`
        : `${client.displayName}`;
    header.appendChild(title);

    const lock = document.createElement('button');
    lock.type = 'button';
    lock.className = 'btn-icon';
    lock.title = 'Empêcher la fermeture en cliquant derrière';
    lock.textContent = '🔐';
    lock.addEventListener('click', () => {
        const locked = bubble.dataset.locked === 'true';
        const next = !locked;
        bubble.dataset.locked = next ? 'true' : 'false';
        lock.classList.toggle('is-active', next);
    });
    header.appendChild(lock);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-icon client-data-block__close';
    close.textContent = '×';
    close.title = pinned ? 'Fermer ce bloc' : 'Fermer';
    close.addEventListener('click', () => {
        bubble.remove();
        if (pinned) {
            pinnedClientBlocks.delete(client.id);
        } else {
            clientBubblesVisible = false;
        }
        syncClientDataAvailability();
    });
    header.appendChild(close);
    bubble.appendChild(header);

    const body = buildClientSelectionContent(client, { condensedActions: true });
    bubble.appendChild(body);

    attachClientDrag(header, bubble);
    return bubble;
}

function refreshClientBlock(block, client, { pinned = false } = {}) {
    if (!block) {
        return;
    }
    const title = block.querySelector('h3');
    if (title) {
        title.textContent = pinned
            ? `Coordonnées des clients sélectionnés – ${client.displayName}`
            : `${client.displayName}`;
    }
    block.querySelectorAll('[data-role="client-selection-body"], .client-data-selection-empty').forEach(node => node.remove());
    const body = buildClientSelectionContent(client, { condensedActions: true });
    block.appendChild(body);
}

function attachClientDrag(handle, target) {
    if (!handle || !target) {
        return;
    }
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    handle.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) {
            return;
        }
        dragging = true;
        offsetX = event.clientX - target.offsetLeft;
        offsetY = event.clientY - target.offsetTop;
        target.setPointerCapture?.(event.pointerId);
    });
    target.addEventListener('pointermove', event => {
        if (!dragging) {
            return;
        }
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const desiredX = Math.min(Math.max(event.clientX - offsetX, 8), width - 120);
        const desiredY = Math.min(Math.max(event.clientY - offsetY, 8), height - 80);
        target.style.left = `${desiredX}px`;
        target.style.top = `${desiredY}px`;
    });
    ['pointerup', 'pointercancel'].forEach(eventName => {
        target.addEventListener(eventName, event => {
            if (!dragging) {
                return;
            }
            dragging = false;
            target.releasePointerCapture?.(event.pointerId);
        });
    });
}

function buildClientSelectionContent(client, { condensedActions = false } = {}) {
    const selections = Array.isArray(client.selectedItems) ? client.selectedItems : [];
    if (selections.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'client-data-selection-empty';
        empty.textContent = 'Aucune sélection enregistrée pour ce client.';
        return empty;
    }
    const table = document.createElement('table');
    table.className = 'client-data-selection-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Élément', 'Chemin', 'Valeur', 'Boutons d’actions'].forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    selections.forEach(item => {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.textContent = item.label ?? '';
        const pathCell = document.createElement('td');
        pathCell.textContent = item.path ?? '';
        const valueCell = document.createElement('td');
        valueCell.textContent = item.value ?? '';
        const actionsCell = document.createElement('td');
        actionsCell.className = 'qa-selection-actions';
        [
            { label: condensedActions ? 'A' : 'Analyser', title: 'Copie le chemin dans « Chemin à analyser »' },
            { label: condensedActions ? 'I' : 'Insérer', title: 'Prépare la source à copier' },
            { label: condensedActions ? '+F' : 'Ajouter au filtre', title: 'Remplit les termes à comparer' },
        ].forEach(config => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = config.label;
            btn.title = config.title;
            actionsCell.appendChild(btn);
        });
        row.appendChild(labelCell);
        row.appendChild(pathCell);
        row.appendChild(valueCell);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    table.dataset.role = 'client-selection-body';
    return table;
}

function renderClientDataList() {
    if (!clientDataList) {
        return;
    }
    clientDataList.innerHTML = '';
    clientDataSnapshots.forEach(client => {
        const card = document.createElement('article');
        card.className = 'client-data-card';
        const header = document.createElement('header');
        const title = document.createElement('h3');
        title.textContent = client.displayName;
        header.appendChild(title);
        card.appendChild(header);
        const preview = buildClientSelectionContent(client, { condensedActions: false });
        card.appendChild(preview);
        clientDataList.appendChild(card);
    });
}

function openClientDataDialog({ focusShortcuts = false } = {}) {
    if (!clientDataDialog || clientDataSnapshots.size === 0) {
        return;
    }
    window.beginClientSelectionSession?.();
    hideClientDataMiniPanel();
    renderClientDataList();
    showClientBubbles();
    clientDataDialog.hidden = false;
    clientDataDialog.setAttribute('aria-hidden', 'false');
    clientDataDialog.focus({ preventScroll: true });
    if (focusShortcuts && clientDataShortcutBtn) {
        clientDataShortcutBtn.focus({ preventScroll: true });
    }
}

function closeClientDataDialog() {
    if (!clientDataDialog) {
        return;
    }
    window.cancelClientSelectionSession?.();
    clientDataDialog.hidden = true;
    clientDataDialog.setAttribute('aria-hidden', 'true');
    hideClientBubbles();
    const focusTarget = clientDataToggle?.hidden === false ? clientDataToggle : clientDataSidebarTrigger;
    focusTarget?.focus({ preventScroll: true });
}

function showClientBubbles() {
    if (!clientDataLayer) {
        return;
    }
    clientDataLayer.innerHTML = '';
    pinnedClientBlocks.forEach(block => {
        clientDataLayer.appendChild(block);
    });
    let index = 0;
    clientDataSnapshots.forEach(client => {
        const bubble = createClientBubble(client, { offset: index });
        clientDataLayer.appendChild(bubble);
        index += 1;
    });
    clientBubblesVisible = clientDataSnapshots.size > 0;
    syncClientDataAvailability();
}

function hideClientBubbles() {
    if (!clientDataLayer) {
        return;
    }
    if (clientBubblesVisible) {
        clientDataLayer.querySelectorAll('.client-data-bubble').forEach(node => node.remove());
        pinnedClientBlocks.forEach(block => {
            if (!clientDataLayer.contains(block)) {
                clientDataLayer.appendChild(block);
            }
        });
        clientBubblesVisible = false;
        syncClientDataAvailability();
    }
}

function pinClientBlocks() {
    if (!clientDataLayer) {
        return;
    }
    let offset = pinnedClientBlocks.size;
    clientDataSnapshots.forEach(client => {
        if (pinnedClientBlocks.has(client.id)) {
            const existing = pinnedClientBlocks.get(client.id);
            refreshClientBlock(existing, client, { pinned: true });
            return;
        }
        const block = createClientBubble(client, { pinned: true, offset });
        block.style.right = `${24 + offset * 18}px`;
        block.style.left = 'auto';
        clientDataLayer.appendChild(block);
        pinnedClientBlocks.set(client.id, block);
        offset += 1;
    });
    syncClientDataAvailability();
    showClientDataMiniPanel();
}

function handleClientSelectionChange(event) {
    const clients = Array.isArray(event.detail?.clients) ? event.detail.clients : [];
    clientDataSnapshots = new Map(clients.map(client => [client.id, client]));
    pinnedClientBlocks.forEach((block, id) => {
        const snapshot = clientDataSnapshots.get(id);
        if (snapshot) {
            refreshClientBlock(block, snapshot, { pinned: true });
        }
    });
    if (clients.length) {
        showClientBubbles();
    } else {
        hideClientBubbles();
    }
    syncClientDataAvailability();
}

function toCoordinateCursor() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text x="0" y="24" font-size="24">📍</text></svg>`;
    return `url("data:image/svg+xml;utf8,${svg.replace(/\s+/g, ' ')}") 0 24, auto`;
}

function stopTemplateCoordinatePick() {
    if (!viewer || !coordinatePickHandler) {
        return;
    }
    viewer.removeEventListener('click', coordinatePickHandler, true);
    viewer.classList.remove('is-picking-coordinate');
    viewer.style.cursor = coordinatePickCursor;
    if (coordinatePreviousTool) {
        editor?.setTool(coordinatePreviousTool);
    }
    coordinatePickHandler = null;
    coordinatePreviousTool = null;
}

window.pickTemplateCoordinate = function pickTemplateCoordinate() {
    if (!viewer || !editor) {
        return Promise.resolve(null);
    }
    stopTemplateCoordinatePick();
    const currentCursor = viewer.style.cursor;
    const activeTool = editor.state?.activeTool ?? null;
    coordinatePickCursor = currentCursor;
    coordinatePreviousTool = activeTool;
    editor.setTool(null);
    viewer.classList.add('is-picking-coordinate');
    viewer.style.cursor = toCoordinateCursor();

    return new Promise(resolve => {
        const handleClick = event => {
            const overlay = event.target?.closest?.('.overlay-layer');
            if (!overlay) {
                return;
            }
            event.preventDefault();
            const rect = overlay.getBoundingClientRect();
            const scale = editor.state?.scale ?? 1;
            const pageIndex = Number(overlay.dataset.page);
            const pdfX = (event.clientX - rect.left) / scale;
            const pdfY = (event.clientY - rect.top) / scale;
            const coordinate = Number.isFinite(pageIndex)
                ? `page=${pageIndex + 1};x=${Math.round(pdfX)};y=${Math.round(pdfY)}`
                : null;
            stopTemplateCoordinatePick();
            if (coordinate) {
                showToast('Coordonnée utilisé avec succès!', { success: true });
                resolve({ coordinate, page: pageIndex + 1, x: Math.round(pdfX), y: Math.round(pdfY) });
            } else {
                resolve(null);
            }
        };

        coordinatePickHandler = handleClick;
        viewer.addEventListener('click', handleClick, true);
        const escHandler = event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                stopTemplateCoordinatePick();
                resolve(null);
            }
        };
        document.addEventListener('keydown', escHandler, { once: true });
    });
};

window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') {
        return;
    }
    if (shortcutDialogOpen) {
        event.preventDefault();
        closeShortcutDialog({ restoreFocus: true });
        return;
    }
    if (templateLibraryDialogOpen) {
        event.preventDefault();
        closeTemplateLibraryDialog();
        return;
    }
    if (variableClientDialogOpen) {
        event.preventDefault();
        hideVariableClientDialog({ focusTrigger: true });
        return;
    }
    if (maxClientsDialogOpen) {
        event.preventDefault();
        hideMaxClientsDialog();
    }
});

window.addEventListener('beforeunload', event => {
    if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
    }
});