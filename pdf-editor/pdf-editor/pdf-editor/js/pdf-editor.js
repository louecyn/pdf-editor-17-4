
const pdfjsLib = window['pdfjsLib'];
if (pdfjsLib) {
    const defaultWorker = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = window.PDFJS_WORKER_SRC || defaultWorker;
}

function uid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

class SignatureStore {
    constructor(storage = typeof window !== 'undefined' ? window.localStorage : null) {
        this.storage = storage;
        this.key = 'pdfEditor.signatures';
        this.data = {
            defaultSignature: null,
            previousSignature: null,
            saved: [],
        };
        this.load();
    }

    load() {
        if (!this.storage) return;
        try {
            const raw = this.storage.getItem(this.key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    this.data = {
                        defaultSignature: parsed.defaultSignature ?? null,
                        previousSignature: parsed.previousSignature ?? null,
                        saved: Array.isArray(parsed.saved) ? parsed.saved : [],
                    };
                }
            }
        } catch (error) {
            console.warn('Impossible de charger les signatures enregistrées.', error);
        }
    }

    persist() {
        if (!this.storage) return;
        try {
            this.storage.setItem(this.key, JSON.stringify(this.data));
        } catch (error) {
            console.warn('Impossible de sauvegarder les signatures.', error);
        }
    }

    makeUniqueName(name, ignore = []) {
        const base = (name && String(name).trim()) || 'Signature';
        const ignoreSet = new Set(ignore.map(item => String(item).toLowerCase()));
        const existing = this.collectExistingNames(ignoreSet);
        if (!existing.has(base.toLowerCase())) {
            return base;
        }
        let index = 2;
        while (existing.has(`${base} ${index}`.toLowerCase())) {
            index += 1;
        }
        return `${base} ${index}`;
    }

    collectExistingNames(ignoreSet = new Set()) {
        const names = new Set();
        const add = value => {
            const label = typeof value === 'string' ? value.trim() : '';
            if (!label) return;
            const lower = label.toLowerCase();
            if (ignoreSet.has(lower)) {
                return;
            }
            names.add(lower);
        };
        if (this.data.defaultSignature?.name) {
            add(this.data.defaultSignature.name);
        }
        if (this.data.previousSignature?.name) {
            add(this.data.previousSignature.name);
        }
        for (const item of this.data.saved) {
            add(item.name ?? '');
        }
        return names;
    }

    getDefault() {
        return this.data.defaultSignature;
    }

    getPrevious() {
        return this.data.previousSignature;
    }

    setDefault(signature) {
        const previous = this.data.defaultSignature ? { ...this.data.defaultSignature } : null;
        const desiredName = (signature?.name || 'ma_signature').trim();
        const uniqueName = this.makeUniqueName(desiredName || 'ma_signature', previous?.name ? [previous.name] : []);
        this.data.defaultSignature = { ...signature, name: uniqueName };
        if (previous) {
            const archivedName = this.makeUniqueName('mon_ancienne_signature');
            const archived = { ...previous, name: archivedName };
            this.data.previousSignature = archived;
            this.data.saved.push({ id: uid(), ...archived });
        }
        this.persist();
    }

    resetDefault() {
        if (this.data.defaultSignature) {
            const previous = { ...this.data.defaultSignature };
            const archivedName = this.makeUniqueName('mon_ancienne_signature', previous.name ? [previous.name] : []);
            const archived = { ...previous, name: archivedName };
            this.data.previousSignature = archived;
            this.data.saved.push({ id: uid(), ...archived });
        }
        this.data.defaultSignature = null;
        this.persist();
    }

    listSaved() {
        return [...this.data.saved];
    }

    addSaved(signature) {
        const uniqueName = this.makeUniqueName(signature?.name || 'Signature personnalisée');
        const entry = { id: uid(), ...signature, name: uniqueName };
        this.data.saved.push(entry);
        this.persist();
        return entry;
    }

    removeSaved(id) {
        const index = this.data.saved.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data.saved.splice(index, 1);
            this.persist();
        }
    }

    findSaved(id) {
        return this.data.saved.find(item => item.id === id) ?? null;
    }

    renameSaved(id, name) {
        const entry = this.data.saved.find(item => item.id === id);
        if (!entry) {
            return null;
        }
        const nextName = (name || '').trim();
        if (!nextName) {
            return { ...entry };
        }
        const ignore = entry.name ? [entry.name] : [];
        const uniqueName = this.makeUniqueName(nextName, ignore);
        if (entry.name === uniqueName) {
            return { ...entry };
        }
        entry.name = uniqueName;
        this.persist();
        return { ...entry };
    }
}

class PdfEditor {
    constructor(container, config = {}) {
        this.container = container;
        this.config = config;
        this.state = {
            pdf: null,
            scale: 1.1,
            pages: [],
            elements: [],
            activeTool: null,
            activeRequest: null,
            activeDocument: null,
            activeElementId: null,
            pendingText: null,
            pendingVariable: null,
            pendingSignature: null,
            lastSignature: null,
            awaitingEditDismissal: false,
            originalPdfBytes: null,
        };

        this.history = {
            snapshots: [],
            index: -1,
        };
        this.isRestoringHistory = false;
        const desiredLimit = Number(config.historyLimit);
        this.maxHistoryEntries = Number.isFinite(desiredLimit) && desiredLimit > 0
            ? Math.floor(desiredLimit)
            : 60;

        this.onCanvasClick = this.onCanvasClick.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.handlePageIntersection = this.handlePageIntersection.bind(this);
        this.onResizeHandlePointerDown = this.onResizeHandlePointerDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
        this.openLayersMenu = null;
        this.openLayersMenuAnchor = null;

        this.hintEl = this.config.editingHintEl ?? null;
        this.activeDragTarget = null;

        this.signatureStore = new SignatureStore();

        this.pdfLib = typeof window !== 'undefined' ? window.PDFLib ?? null : null;

        this.resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(entries => {
                for (const entry of entries) {
                    const id = entry.target.dataset.id;
                    if (!id) continue;
                    const element = this.state.elements.find(el => el.id === id);
                    if (!element) continue;
                    element.width = entry.contentRect.width / this.state.scale;
                    element.height = entry.contentRect.height / this.state.scale;
                }
            })
            : null;

        this.pageObserver = typeof IntersectionObserver !== 'undefined'
            ? new IntersectionObserver(this.handlePageIntersection, {
                root: this.container.closest('.editor-canvas') ?? null,
                rootMargin: '400px 0px',
                threshold: 0.01,
            })
            : null;

        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('pointerdown', this.handleDocumentPointerDown);
        }
    }

    onKeyDown(event) {
        const target = event.target;
        const inModal = target?.closest?.('.signature-modal, .dashboard-container');
        const isFormControl = target && target.tagName && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
        const isEditable = target?.isContentEditable === true;
        const isShortcutAllowed = !inModal && !isFormControl && !isEditable;
        const key = typeof event.key === 'string' ? event.key : '';
        const lowerKey = key.toLowerCase();
        if (key === 'Escape' && this.state.activeTool && isShortcutAllowed) {
            event.preventDefault();
            const wasSignature = this.state.activeTool === 'signature';
            this.setTool(null);
            if (wasSignature) {
                this.feedback('Mode signature désactivé.');
            }
            return;
        }
        if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            if (lowerKey === 'z' && !event.shiftKey && isShortcutAllowed) {
                event.preventDefault();
                this.undo();
                return;
            }
            if ((lowerKey === 'y' || (lowerKey === 'z' && event.shiftKey)) && isShortcutAllowed) {
                event.preventDefault();
                this.redo();
                return;
            }
        }
        if (key !== 'Enter' || event.shiftKey) {
            return;
        }
        if (this.state.activeElementId) {
            event.preventDefault();
            this.finalizeActiveElement();
        }
    }

    async loadDocumentFromUrl(url, meta = {}) {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Impossible de charger le document.');
        }
        const buffer = await response.arrayBuffer();
        await this.loadDocumentFromBuffer(buffer, meta);
    }

    async loadDocumentFromBuffer(buffer, meta = {}) {
        if (!pdfjsLib) {
            throw new Error('pdf.js est introuvable.');
        }
        this.state.activeRequest = meta.requestId ?? null;
        this.state.activeDocument = meta.name ?? null;
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        this.state.originalPdfBytes = bytes;
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        this.state.pdf = await loadingTask.promise;
        this.state.elements = [];
        this.resetPages();
        this.setupPagePlaceholders(this.state.pdf.numPages);
        await this.ensurePageRendered(0);
        this.ensureVisiblePagesRendered();
        this.resetHistory();
        this.recordHistory('Document chargé', { force: true });
    }

    async renderAllPages() {
        if (!this.state.pdf) {
            return;
        }
        const tasks = [];
        for (let i = 0; i < this.state.pages.length; i++) {
            tasks.push(this.ensurePageRendered(i));
        }
        await Promise.all(tasks);
    }

    resetPages() {
        if (this.pageObserver) {
            this.pageObserver.disconnect();
        }
        this.container.innerHTML = '';
        this.state.pages = [];
        this.container.classList.remove('is-loaded');
        this.setActiveElement(null);
    }

    setupPagePlaceholders(pageCount) {
        const fragment = document.createDocumentFragment();
        const wrappers = [];
        for (let i = 0; i < pageCount; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-canvas-wrapper';
            wrapper.dataset.page = String(i);

            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';

            const overlay = document.createElement('div');
            overlay.className = 'overlay-layer';
            overlay.dataset.page = String(i);
            overlay.addEventListener('pointerdown', event => {
                if (event.target !== overlay) {
                    return;
                }
                if (this.state.awaitingEditDismissal) {
                    this.finalizeActiveElement();
                    return;
                }
                this.setActiveElement(null);
                this.onCanvasClick(event);
            });

            wrapper.append(canvas, overlay);
            fragment.appendChild(wrapper);
            wrappers.push(wrapper);

            this.state.pages[i] = {
                canvas,
                overlay,
                wrapper,
                rendered: false,
                renderPromise: null,
                viewport: null,
            };

        }
        this.container.appendChild(fragment);

        if (this.pageObserver) {
            for (const wrapper of wrappers) {
                this.pageObserver.observe(wrapper);
            }
        }

        if (!this.pageObserver) {
            // En l'absence d'IntersectionObserver, on affiche immédiatement toutes les pages.
            this.renderAllPages();
        }
    }

    async ensurePageRendered(pageIndex) {
        const entry = this.state.pages[pageIndex];
        if (!entry || entry.rendered) {
            return;
        }
        if (entry.renderPromise) {
            await entry.renderPromise;
            return;
        }
        entry.renderPromise = this.renderPage(pageIndex);
        try {
            await entry.renderPromise;
        } finally {
            entry.renderPromise = null;
        }
    }

    async renderPage(pageIndex) {
        if (!this.state.pdf) {
            return;
        }
        const entry = this.state.pages[pageIndex];
        if (!entry) {
            return;
        }

        const page = await this.state.pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: this.state.scale });

        entry.canvas.width = viewport.width;
        entry.canvas.height = viewport.height;
        entry.canvas.style.width = `${viewport.width}px`;
        entry.canvas.style.height = `${viewport.height}px`;

        entry.overlay.style.width = `${viewport.width}px`;
        entry.overlay.style.height = `${viewport.height}px`;

        const context = entry.canvas.getContext('2d');
        if (!context) {
            return;
        }
        await page.render({ canvasContext: context, viewport }).promise;

        entry.viewport = viewport;
        entry.rendered = true;
        this.container.classList.add('is-loaded');
        this.replayElements(pageIndex);
    }

    handlePageIntersection(entries) {
        for (const entry of entries) {
            if (!entry.isIntersecting) {
                continue;
            }
            const index = Number(entry.target.dataset.page);
            if (Number.isNaN(index)) {
                continue;
            }
            this.ensurePageRendered(index);
        }
    }

    ensureVisiblePagesRendered() {
        for (let i = 0; i < this.state.pages.length; i++) {
            const entry = this.state.pages[i];
            if (!entry) continue;
            if (this.isPageVisible(entry.wrapper)) {
                this.ensurePageRendered(i);
            }
        }
    }

    getScrollContainer() {
        return this.container?.closest('.editor-canvas') ?? null;
    }

    getPageCount() {
        return this.state.pages.length;
    }

    getFocusedPageIndex() {
        const total = this.state.pages.length;
        if (!total) {
            return 0;
        }
        const host = this.getScrollContainer();
        const hostRect = host ? host.getBoundingClientRect() : null;
        const reference = hostRect
            ? hostRect.top + hostRect.height / 2
            : (window.innerHeight || document.documentElement.clientHeight || 0) / 2;
        let bestIndex = 0;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < total; i++) {
            const entry = this.state.pages[i];
            if (!entry?.wrapper) {
                continue;
            }
            const rect = entry.wrapper.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(center - reference);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }
        return bestIndex;
    }

    async focusPage(pageIndex) {
        const total = this.state.pages.length;
        if (!total) {
            return;
        }
        const target = Math.min(Math.max(pageIndex, 0), total - 1);
        await this.ensurePageRendered(target);
        const entry = this.state.pages[target];
        if (!entry?.wrapper) {
            return;
        }
        const host = this.getScrollContainer();
        if (host) {
            const hostRect = host.getBoundingClientRect();
            const wrapperRect = entry.wrapper.getBoundingClientRect();
            const currentScroll = host.scrollTop;
            const offsetWithinHost = wrapperRect.top - hostRect.top;
            const targetScroll = currentScroll + offsetWithinHost - (host.clientHeight - wrapperRect.height) / 2;
            host.scrollTo({ top: Math.max(targetScroll, 0), behavior: 'smooth' });
        } else {
            entry.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    async focusRelativePage(delta) {
        if (!Number.isFinite(delta) || delta === 0) {
            return;
        }
        const current = this.getFocusedPageIndex();
        await this.focusPage(current + delta);
    }

    isPageVisible(wrapper) {
        if (!wrapper) {
            return false;
        }
        const rect = wrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.bottom >= -200 && rect.top <= viewportHeight + 200;
    }

    replayElements(pageIndex) {
        const page = this.state.pages[pageIndex];
        if (!page || !page.rendered) return;
        page.overlay.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (const element of this.state.elements.filter(el => el.page === pageIndex)) {
            const node = this.createDomForElement(element);
            fragment.appendChild(node);
            if (this.resizeObserver) {
                this.resizeObserver.observe(node);
            }
        }
        page.overlay.appendChild(fragment);
        if (this.state.activeElementId) {
            const activeNode = page.overlay.querySelector(`[data-id="${this.state.activeElementId}"]`);
            if (activeNode) {
                activeNode.classList.add('is-active');
            }
        }
    }

    setTool(tool) {
        if (tool !== 'signature') {
            this.state.pendingSignature = null;
        }
        if (tool !== 'text') {
            this.state.pendingVariable = null;
        }
        if (tool === 'signature' && !this.state.pendingSignature && this.state.lastSignature) {
            this.state.pendingSignature = { ...this.state.lastSignature };
        }
        this.state.activeTool = tool;
        if (tool) {
            this.container.dataset.tool = tool;
        } else {
            delete this.container.dataset.tool;
        }
    }

    insertVariableValue(value, options = {}) {
        if (!value) {
            return;
        }
        const variableMeta = options.variable ?? null;
        const replaceActive = options.replaceActive === true;
        if (replaceActive && this.state.activeElementId) {
            const element = this.state.elements.find(el => el.id === this.state.activeElementId);
            if (element && element.type === 'text') {
                element.text = value;
                if (!element.data || typeof element.data !== 'object') {
                    element.data = {};
                }
                this.applyVariableMetadata(element, variableMeta);
                const node = this.findNodeById(element.id);
                const content = node?.querySelector('.draggable-content');
                if (content) {
                    content.textContent = value;
                }
                if (node) {
                    this.applyVariableDataset(node, element);
                }
                this.refreshTextElement(element.id);
                this.recordHistory('Valeur de variable insérée');
                return;
            }
        }
        if (this.state.activeElementId) {
            this.finalizeActiveElement();
        }
        this.state.pendingText = value;
        this.state.pendingVariable = variableMeta ? { ...variableMeta } : null;
        this.setTool('text');
        this.feedback('Cliquez sur le document pour insérer la valeur sélectionnée.');
    }

    normalizeVariableMeta(meta) {
        if (!meta || typeof meta !== 'object') {
            return null;
        }
        const baseKey = typeof meta.baseKey === 'string' && meta.baseKey.trim() !== ''
            ? meta.baseKey.trim()
            : (typeof meta.key === 'string' ? meta.key.trim() : '');
        const key = typeof meta.key === 'string' && meta.key.trim() !== ''
            ? meta.key.trim()
            : baseKey;
        if (!key) {
            return null;
        }
        const label = typeof meta.label === 'string' && meta.label.trim() !== ''
            ? meta.label.trim()
            : key;
        const placeholder = typeof meta.placeholder === 'string' && meta.placeholder.trim() !== ''
            ? meta.placeholder.trim()
            : `{{${key}}}`;
        const rankValue = Number(meta.rank);
        const rank = Number.isFinite(rankValue) && rankValue > 0 ? Math.floor(rankValue) : null;
        return {
            key,
            baseKey,
            label,
            placeholder,
            groupId: typeof meta.groupId === 'string' ? meta.groupId.trim() : '',
            rank,
        };
    }

    applyVariableMetadata(element, meta) {
        if (!element || element.type !== 'text') {
            return;
        }
        const normalized = this.normalizeVariableMeta(meta);
        if (!element.data || typeof element.data !== 'object') {
            element.data = {};
        }
        if (normalized) {
            element.data.variable = normalized;
        } else if (element.data && Object.prototype.hasOwnProperty.call(element.data, 'variable')) {
            delete element.data.variable;
        }
    }

    applyVariableDataset(node, element) {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        const variable = element?.data?.variable ?? null;
        if (variable && variable.key) {
            node.dataset.variableKey = variable.key;
            node.dataset.variableBase = variable.baseKey ?? variable.key;
            if (variable.rank) {
                node.dataset.variableRank = String(variable.rank);
            } else {
                delete node.dataset.variableRank;
            }
            node.classList.add('has-variable');
        } else {
            delete node.dataset.variableKey;
            delete node.dataset.variableBase;
            delete node.dataset.variableRank;
            node.classList.remove('has-variable');
        }
    }

    cloneData(value) {
        if (value === null || typeof value === 'undefined') {
            return value;
        }
        if (typeof structuredClone === 'function') {
            try {
                return structuredClone(value);
            } catch (error) {
                // Fallback to JSON cloning below.
            }
        }
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return value;
        }
    }

    cloneElementsState(elements = this.state.elements) {
        return elements.map(element => {
            const copy = {
                ...element,
                data: element.data ? this.cloneData(element.data) : element.data,
            };
            if (copy.type === 'text') {
                if (!copy.data || typeof copy.data !== 'object') {
                    copy.data = {};
                } else if (copy.data.variable) {
                    copy.data.variable = this.normalizeVariableMeta(copy.data.variable);
                }
            }
            return copy;
        });
    }

    createHistorySnapshot(description = '') {
        const elements = this.cloneElementsState();
        const signature = JSON.stringify(elements);
        return { elements, signature, description };
    }

    resetHistory() {
        this.history.snapshots = [];
        this.history.index = -1;
        this.notifyHistoryChange();
    }

    notifyHistoryChange() {
        if (typeof this.config.onHistoryChange === 'function') {
            this.config.onHistoryChange({
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                size: this.history.snapshots.length,
                index: this.history.index,
            });
        }
    }

    recordHistory(description = '', { force = false } = {}) {
        if (this.isRestoringHistory) {
            return;
        }
        const snapshot = this.createHistorySnapshot(description);
        const current = this.history.snapshots[this.history.index] ?? null;
        if (!force && current && current.signature === snapshot.signature) {
            return;
        }
        const nextIndex = this.history.index + 1;
        if (nextIndex < this.history.snapshots.length) {
            this.history.snapshots.splice(nextIndex);
        }
        this.history.snapshots.push(snapshot);
        if (this.history.snapshots.length > this.maxHistoryEntries) {
            this.history.snapshots.shift();
            this.history.index = this.history.snapshots.length - 1;
        } else {
            this.history.index = nextIndex;
        }
        this.notifyHistoryChange();
    }

    canUndo() {
        return this.history.index > 0;
    }

    canRedo() {
        return this.history.index >= 0 && this.history.index < this.history.snapshots.length - 1;
    }

    restoreHistorySnapshot(snapshot) {
        if (!snapshot) {
            return;
        }
        this.importElements(snapshot.elements, { record: false });
        this.setTool(null);
    }

    undo() {
        if (!this.canUndo()) {
            return false;
        }
        this.isRestoringHistory = true;
        try {
            this.history.index -= 1;
            const snapshot = this.history.snapshots[this.history.index];
            this.restoreHistorySnapshot(snapshot);
        } finally {
            this.isRestoringHistory = false;
            this.notifyHistoryChange();
        }
        this.feedback('Action annulée.');
        return true;
    }

    redo() {
        if (!this.canRedo()) {
            return false;
        }
        this.isRestoringHistory = true;
        try {
            this.history.index += 1;
            const snapshot = this.history.snapshots[this.history.index];
            this.restoreHistorySnapshot(snapshot);
        } finally {
            this.isRestoringHistory = false;
            this.notifyHistoryChange();
        }
        this.feedback('Action rétablie.');
        return true;
    }

    addTextElement(pageIndex, x, y) {
        const pendingText = this.state.pendingText;
        const pendingVariable = this.state.pendingVariable;
        const element = {
            id: uid(),
            type: 'text',
            page: pageIndex,
            x,
            y,
            text: pendingText || 'Double-cliquez pour éditer',
            fontFamily: this.config.fontFamily ?? 'Helvetica',
            fontSize: Number(this.config.fontSize ?? 10),
            color: this.config.color ?? '#111827',
            width: 220,
            height: 64,
            bold: false,
            italic: false,
            underline: false,
            highlight: false,
        };
        if (pendingText) {
            this.state.pendingText = null;
        }
        if (pendingVariable) {
            this.applyVariableMetadata(element, pendingVariable);
            this.state.pendingVariable = null;
        }
        if (!element.data || typeof element.data !== 'object') {
            element.data = element.data ?? {};
        }
        this.state.elements.push(element);
        this.replayElements(pageIndex);
        this.setActiveElement(element.id);
        this.feedback('Champ texte ajouté.');
        this.recordHistory('Ajout d\'un champ texte');
    }

    addSignatureElement(pageIndex, x, y, dataUrl, width, height) {
        const element = {
            id: uid(),
            type: 'signature',
            page: pageIndex,
            x,
            y,
            width,
            height,
            data: dataUrl,
        };
        this.state.elements.push(element);
        this.replayElements(pageIndex);
        this.setActiveElement(element.id);
        this.feedback('Signature ajoutée. Cliquez de nouveau pour l\'apposer ailleurs ou appuyez sur Échap pour quitter.');
        this.recordHistory('Ajout d\'une signature');
    }

    prepareSignaturePlacement(signature) {
        if (!signature || !signature.dataUrl) {
            return false;
        }
        const widthValue = Number(signature.width);
        const heightValue = Number(signature.height);
        const normalizedWidth = Number.isFinite(widthValue) && widthValue > 0 ? widthValue : 320;
        const normalizedHeight = Number.isFinite(heightValue) && heightValue > 0
            ? heightValue
            : Math.max(120, Math.round(normalizedWidth * 0.4));
        this.state.pendingSignature = {
            dataUrl: signature.dataUrl,
            width: normalizedWidth,
            height: normalizedHeight,
            name: signature.name ?? null,
        };
        this.state.lastSignature = { ...this.state.pendingSignature };
        this.setTool('signature');
        return true;
    }

    async prepareDefaultSignature() {
        const signature = this.signatureStore.getDefault();
        if (!signature || !signature.dataUrl) {
            return false;
        }
        return this.prepareSignaturePlacement(signature);
    }

    async pickSignatureFromLibrary() {
        return this.openSignatureModal();
    }

    onCanvasClick(event) {
        if (!this.state.activeTool) {
            return;
        }
        const overlay = event.currentTarget;
        const rect = overlay.getBoundingClientRect();
        const pageIndex = Number(overlay.parentElement.dataset.page);
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const pdfX = offsetX / this.state.scale;
        const pdfY = offsetY / this.state.scale;

        if (this.state.activeTool === 'text') {
            this.addTextElement(pageIndex, pdfX, pdfY);
        } else if (this.state.activeTool === 'signature') {
            const placeSignature = (signature) => {
                if (!signature || !signature.dataUrl) {
                    return;
                }
                const widthPx = Number(signature.width);
                const heightPx = Number(signature.height);
                const normalizedWidth = Number.isFinite(widthPx) && widthPx > 0 ? widthPx : 320;
                const normalizedHeight = Number.isFinite(heightPx) && heightPx > 0
                    ? heightPx
                    : Math.max(120, Math.round(normalizedWidth * 0.4));
                const width = normalizedWidth / this.state.scale;
                const height = normalizedHeight / this.state.scale;
                this.state.lastSignature = {
                    dataUrl: signature.dataUrl,
                    width: normalizedWidth,
                    height: normalizedHeight,
                    name: signature.name ?? null,
                };
                this.addSignatureElement(pageIndex, pdfX, pdfY, signature.dataUrl, width, height);
            };

            const pending = this.state.pendingSignature;
            if (pending && pending.dataUrl) {
                placeSignature(pending);
                return;
            }

            this.openSignatureModal()
                .then(signature => {
                    if (!signature) {
                        if (!this.state.pendingSignature) {
                            this.setTool(null);
                        }
                        return;
                    }
                    if (!this.prepareSignaturePlacement(signature)) {
                        return;
                    }
                    placeSignature(this.state.pendingSignature);
                })
                .catch(error => {
                    console.error('Impossible de préparer la signature.', error);
                });
        }
    }

    createDomForElement(element) {
        const node = document.createElement('div');
        node.className = 'draggable-item';
        node.dataset.id = element.id;
        node.dataset.type = element.type;
        node.tabIndex = 0;
        node.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.finalizeActiveElement();
            }
        });

        const width = (element.width ?? 220) * this.state.scale;
        const height = (element.height ?? (element.fontSize * 1.6)) * this.state.scale;

        node.style.left = `${element.x * this.state.scale}px`;
        node.style.top = `${element.y * this.state.scale}px`;
        node.style.width = `${width}px`;
        node.style.height = `${height}px`;

        node.addEventListener('pointerdown', this.onPointerDown);
        node.addEventListener('focusin', () => this.setActiveElement(element.id));
        node.addEventListener('click', event => this.handleElementClick(event, element.id));

        const content = document.createElement('div');
        content.className = 'draggable-content';
        content.style.height = '100%';
        node.appendChild(content);
        this.applyVariableDataset(node, element);

        if (element.type === 'text') {
            content.textContent = element.text;
            content.setAttribute('contenteditable', 'true');
            content.setAttribute('role', 'textbox');
            content.setAttribute('aria-label', 'Édition de texte');
            content.addEventListener('focus', () => this.setActiveElement(element.id));
            content.addEventListener('input', () => {
                element.text = content.textContent ?? '';
                if (element.data?.variable) {
                    const placeholder = element.data.variable.placeholder ?? '';
                    if (!placeholder || element.text !== placeholder) {
                        this.applyVariableMetadata(element, null);
                        this.applyVariableDataset(node, element);
                    }
                }
            });
            content.addEventListener('blur', () => {
                element.text = content.textContent ?? '';
            });
            content.addEventListener('keydown', event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    content.blur();
                    this.finalizeActiveElement();
                }
            });
            this.applyTextStyles(content, element);

            const toolbar = this.createTextToolbar(element);
            node.appendChild(toolbar);
        } else if (element.type === 'signature') {
            const img = document.createElement('img');
            img.src = element.data;
            img.alt = 'Signature manuscrite';
            content.appendChild(img);
            const toolbar = this.createSignatureToolbar(element);
            node.appendChild(toolbar);
        }

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'element-delete';
        deleteButton.textContent = '×';
        deleteButton.title = 'Supprimer l’élément';
        deleteButton.addEventListener('click', event => {
            event.stopPropagation();
            this.deleteElement(element.id);
        });
        node.appendChild(deleteButton);

        for (const direction of ['nw', 'ne', 'se', 'sw']) {
            const handle = document.createElement('span');
            handle.className = 'resize-handle';
            handle.dataset.direction = direction;
            handle.addEventListener('pointerdown', this.onResizeHandlePointerDown);
            node.appendChild(handle);
        }

        this.positionElementAffordances(node);

        return node;
    }

    handleElementClick(event, elementId) {
        this.setActiveElement(elementId);
        if (!event) {
            return;
        }
    }

    async moveElementToPage(elementId, pageNumber) {
        const element = this.state.elements.find(el => el.id === elementId);
        if (!element) {
            return;
        }
        const total = this.getPageCount();
        if (!total) {
            return;
        }
        const target = Math.min(Math.max(Number(pageNumber) - 1, 0), total - 1);
        const current = Number(element.page ?? 0);
        if (target === current) {
            this.feedback(`Élément déjà sur la page ${target + 1}.`);
            return;
        }
        const previous = current;
        element.page = target;
        await this.ensurePageRendered(target);
        this.replayElements(target);
        if (Number.isInteger(previous) && previous >= 0 && previous < total) {
            this.replayElements(previous);
        }
        this.setActiveElement(elementId);
        this.feedback(`Élément déplacé à la page ${target + 1}.`);
        this.recordHistory('Élément déplacé vers une autre page');
    }

    showPageJumpPrompt(elementId) {
        const node = this.findNodeById(elementId);
        if (!node) {
            return;
        }
        let prompt = node.querySelector('.element-page-jump');
        if (!prompt) {
            prompt = document.createElement('form');
            prompt.className = 'element-page-jump';
            prompt.innerHTML = `
                <label>Page :
                    <input type="number" min="1" step="1" required>
                </label>
            `;
            node.appendChild(prompt);
        }
        const input = prompt.querySelector('input');
        if (!input) {
            return;
        }
        const hide = () => {
            prompt.classList.remove('is-visible');
        };
        prompt.onsubmit = async evt => {
            evt.preventDefault();
            const value = parseInt(input.value, 10);
            if (!Number.isFinite(value)) {
                input.focus();
                return;
            }
            hide();
            try {
                await this.moveElementToPage(elementId, value);
            } catch (error) {
                console.error(error);
            }
        };
        input.onkeydown = evt => {
            if (evt.key === 'Escape') {
                hide();
            }
        };
        input.onblur = () => {
            setTimeout(() => {
                if (!prompt.contains(document.activeElement)) {
                    hide();
                }
            }, 120);
        };
        prompt.classList.add('is-visible');
        input.value = '';
        setTimeout(() => {
            input.focus({ preventScroll: true });
        }, 0);
    }

    duplicateElement(elementId, { pointerEvent = null } = {}) {
        const source = this.state.elements.find(el => el.id === elementId);
        if (!source) {
            return false;
        }
        const copy = { ...source, id: uid() };
        let dragContext = null;
        if (pointerEvent instanceof PointerEvent) {
            const location = this.resolvePointerLocation(pointerEvent);
            if (location) {
                const scale = this.state.scale;
                const widthPx = Math.min(
                    (copy.width ?? source.width ?? 220) * scale,
                    location.rect.width,
                );
                const heightPx = Math.min(
                    (copy.height ?? source.height ?? (copy.fontSize ? copy.fontSize * 1.6 : 160)) * scale,
                    location.rect.height,
                );
                const leftPx = Math.max(0, Math.min(location.xPx - widthPx / 2, location.rect.width - widthPx));
                const topPx = Math.max(0, Math.min(location.yPx - heightPx / 2, location.rect.height - heightPx));
                copy.page = location.pageIndex;
                copy.x = leftPx / scale;
                copy.y = topPx / scale;
                dragContext = {
                    pointerId: pointerEvent.pointerId,
                    offsetX: location.xPx - leftPx,
                    offsetY: location.yPx - topPx,
                };
            } else {
                copy.x = (copy.x ?? 0) + 12;
                copy.y = (copy.y ?? 0) + 12;
            }
        } else {
            copy.x = (copy.x ?? 0) + 12;
            copy.y = (copy.y ?? 0) + 12;
        }
        const pageIndex = Number(copy.page ?? 0);
        this.state.elements.push(copy);
        this.replayElements(pageIndex);
        this.setActiveElement(copy.id);
        this.recordHistory('Duplication d\'un élément');
        if (dragContext && pointerEvent) {
            requestAnimationFrame(() => {
                this.startDuplicateDrag(copy.id, pointerEvent, dragContext);
            });
        } else {
            this.feedback('Élément dupliqué.');
        }
        return true;
    }

    bringElementToFront(elementId) {
        const index = this.state.elements.findIndex(el => el.id === elementId);
        if (index === -1) {
            return;
        }
        const [element] = this.state.elements.splice(index, 1);
        this.state.elements.push(element);
        this.recordHistory('Élément placé au premier plan');
        if (Number.isInteger(element.page)) {
            this.replayElements(element.page);
            this.setActiveElement(elementId);
            this.feedback('Élément déplacé au premier plan.');
        }
    }

    bringElementForward(elementId) {
        const index = this.state.elements.findIndex(el => el.id === elementId);
        if (index === -1 || index === this.state.elements.length - 1) {
            return;
        }
        const nextIndex = index + 1;
        const [element] = this.state.elements.splice(index, 1);
        this.state.elements.splice(nextIndex, 0, element);
        this.recordHistory('Élément avancé');
        if (Number.isInteger(element.page)) {
            this.replayElements(element.page);
            this.setActiveElement(elementId);
            this.feedback('Élément avancé dans l’empilement.');
        }
    }

    sendElementBackward(elementId) {
        const index = this.state.elements.findIndex(el => el.id === elementId);
        if (index <= 0) {
            return;
        }
        const previousIndex = index - 1;
        const [element] = this.state.elements.splice(index, 1);
        this.state.elements.splice(previousIndex, 0, element);
        this.recordHistory('Élément reculé');
        if (Number.isInteger(element.page)) {
            this.replayElements(element.page);
            this.setActiveElement(elementId);
            this.feedback('Élément reculé dans l’empilement.');
        }
    }

    sendElementToBack(elementId) {
        const index = this.state.elements.findIndex(el => el.id === elementId);
        if (index <= 0) {
            return;
        }
        const [element] = this.state.elements.splice(index, 1);
        this.state.elements.unshift(element);
        this.recordHistory('Élément envoyé à l’arrière-plan');
        if (Number.isInteger(element.page)) {
            this.replayElements(element.page);
            this.setActiveElement(elementId);
            this.feedback('Élément envoyé à l’arrière-plan.');
        }
    }

    createLayersMenu(elementId) {
        const menu = document.createElement('div');
        menu.className = 'layers-menu';
        menu.hidden = true;
        menu.tabIndex = -1;
        menu.dataset.elementId = elementId;
        menu.setAttribute('role', 'menu');
        const actions = [
            { action: 'front', label: 'Tout devant' },
            { action: 'forward', label: 'Avancer' },
            { action: 'backward', label: 'Reculer' },
            { action: 'back', label: 'Tout derrière' },
        ];
        for (const entry of actions) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'layers-menu-item';
            btn.dataset.layerAction = entry.action;
            btn.textContent = entry.label;
            btn.setAttribute('role', 'menuitem');
            btn.addEventListener('click', evt => {
                evt.preventDefault();
                evt.stopPropagation();
                this.handleLayerAction(menu.dataset.elementId, entry.action);
                this.closeLayersMenu();
            });
            menu.appendChild(btn);
        }
        menu.addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
                evt.preventDefault();
                evt.stopPropagation();
                this.closeLayersMenu(true);
            }
        });
        return menu;
    }

    toggleLayerMenu(menu, button, elementId) {
        if (!menu || !button) {
            return;
        }
        menu.dataset.elementId = elementId;
        if (this.openLayersMenu === menu) {
            this.closeLayersMenu();
            return;
        }
        this.closeLayersMenu();
        this.openLayersMenu = menu;
        this.openLayersMenuAnchor = button;
        menu.hidden = false;
        menu.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        const firstItem = menu.querySelector('button');
        if (firstItem) {
            firstItem.focus({ preventScroll: true });
        }
    }

    closeLayersMenu(focusAnchor = false) {
        if (!this.openLayersMenu) {
            return;
        }
        this.openLayersMenu.hidden = true;
        this.openLayersMenu.classList.remove('is-open');
        if (this.openLayersMenuAnchor) {
            this.openLayersMenuAnchor.setAttribute('aria-expanded', 'false');
            if (focusAnchor) {
                this.openLayersMenuAnchor.focus({ preventScroll: true });
            }
        }
        this.openLayersMenu = null;
        this.openLayersMenuAnchor = null;
    }

    handleLayerAction(elementId, action) {
        if (!elementId) {
            return;
        }
        switch (action) {
            case 'front':
                this.bringElementToFront(elementId);
                break;
            case 'forward':
                this.bringElementForward(elementId);
                break;
            case 'backward':
                this.sendElementBackward(elementId);
                break;
            case 'back':
                this.sendElementToBack(elementId);
                break;
            default:
                break;
        }
    }

    handleDocumentPointerDown(evt) {
        if (!this.openLayersMenu) {
            return;
        }
        if (this.openLayersMenu.contains(evt.target)) {
            return;
        }
        if (this.openLayersMenuAnchor && this.openLayersMenuAnchor.contains(evt.target)) {
            return;
        }
        this.closeLayersMenu();
    }

    applyTextStyles(content, element) {
        const fontSize = Number(element.fontSize ?? 10);
        const fontSizePx = fontSize * this.state.scale;
        content.style.fontFamily = element.fontFamily ?? this.config.fontFamily ?? 'Helvetica';
        content.style.fontSize = `${fontSizePx}px`;
        content.style.lineHeight = `${fontSizePx * 1.2}px`;
        content.style.color = element.color ?? '#191970';
        content.style.fontWeight = element.bold ? '700' : '500';
        content.style.fontStyle = element.italic ? 'italic' : 'normal';
        content.style.textDecoration = element.underline ? 'underline' : 'none';
        content.style.background = element.highlight ? 'rgba(255, 255, 0, 0.35)' : 'transparent';
        content.style.display = 'block';
        content.style.alignItems = 'flex-start';
        content.style.justifyContent = 'flex-start';
        content.style.padding = '0';
    }

    createTextToolbar(element) {
        const toggleButton = (label, action, title) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.action = action;
            btn.title = title;
            btn.classList.add('element-toolbar__toggle');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', title);
            if (label) {
                const glyph = document.createElement('span');
                glyph.className = 'element-toolbar__glyph';
                glyph.textContent = label;
                glyph.setAttribute('aria-hidden', 'true');
                btn.appendChild(glyph);
            }
            btn.addEventListener('click', evt => {
                evt.preventDefault();
                evt.stopPropagation();
                const prop = action;
                if (['bold', 'italic', 'underline', 'highlight'].includes(prop)) {
                    element[prop] = !element[prop];
                }
                this.refreshTextElement(element.id);
                this.recordHistory('Style de texte modifié');
            });
            return btn;
        };

        const toolbar = document.createElement('div');
        toolbar.className = 'element-toolbar element-toolbar--text';

        const primaryRow = document.createElement('div');
        primaryRow.className = 'element-toolbar__row element-toolbar__row--primary';

        const secondaryRow = document.createElement('div');
        secondaryRow.className = 'element-toolbar__row element-toolbar__row--secondary';

        const actionsRow = document.createElement('div');
        actionsRow.className = 'element-toolbar__row element-toolbar__row--actions';

        const decreaseBtn = document.createElement('button');
        decreaseBtn.type = 'button';
        decreaseBtn.dataset.action = 'smaller';
        decreaseBtn.title = 'Réduire la taille';
        decreaseBtn.className = 'element-toolbar__icon-button element-toolbar__icon-button--smaller';
        decreaseBtn.setAttribute('aria-label', 'Réduire la taille');
        decreaseBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            element.fontSize = Math.max(8, Number(element.fontSize ?? 10) - 2);
            this.refreshTextElement(element.id);
            this.recordHistory('Taille de police réduite');
        });

        const increaseBtn = document.createElement('button');
        increaseBtn.type = 'button';
        increaseBtn.dataset.action = 'bigger';
        increaseBtn.title = 'Augmenter la taille';
        increaseBtn.className = 'element-toolbar__icon-button element-toolbar__icon-button--bigger';
        increaseBtn.setAttribute('aria-label', 'Augmenter la taille');
        increaseBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            element.fontSize = Math.min(96, Number(element.fontSize ?? 10) + 2);
            this.refreshTextElement(element.id);
            this.recordHistory('Taille de police augmentée');
        });

        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.min = '8';
        sizeInput.max = '96';
        sizeInput.step = '1';
        sizeInput.value = Math.round(Number(element.fontSize ?? 10));
        sizeInput.title = 'Taille du texte';
        sizeInput.dataset.action = 'font-size';
        sizeInput.className = 'element-toolbar__size-input';
        sizeInput.setAttribute('aria-label', 'Taille du texte');
        sizeInput.addEventListener('change', evt => {
            evt.stopPropagation();
            const parsed = Number(sizeInput.value);
            if (!Number.isNaN(parsed)) {
                element.fontSize = Math.min(96, Math.max(8, parsed));
                sizeInput.value = Math.round(element.fontSize);
                this.refreshTextElement(element.id);
                this.recordHistory('Taille de police définie');
            }
        });

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = element.color ?? '#191970';
        colorInput.title = 'Couleur du texte';
        colorInput.className = 'element-toolbar__color-input';
        colorInput.setAttribute('aria-label', 'Couleur du texte');
        colorInput.addEventListener('input', evt => {
            evt.stopPropagation();
            element.color = colorInput.value;
            colorWrapper.style.setProperty('--swatch-color', colorInput.value);
            this.refreshTextElement(element.id);
        });
        colorInput.addEventListener('change', () => {
            colorWrapper.style.setProperty('--swatch-color', colorInput.value);
            this.recordHistory('Couleur de texte modifiée');
        });

        const colorWrapper = document.createElement('label');
        colorWrapper.className = 'element-toolbar__color';
        colorWrapper.title = 'Couleur du texte';
        colorWrapper.appendChild(colorInput);
        colorWrapper.style.setProperty('--swatch-color', colorInput.value);

        const fontSelect = document.createElement('select');
        fontSelect.dataset.action = 'font';
        fontSelect.title = 'Police d’écriture';
        fontSelect.className = 'element-toolbar__font-select';
        const fonts = this.config.fontOptions ?? ['Helvetica', 'DejaVuSans', 'Times New Roman', 'Arial'];
        for (const font of fonts) {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            if (font === element.fontFamily) {
                option.selected = true;
            }
            fontSelect.appendChild(option);
        }
        fontSelect.addEventListener('change', evt => {
            evt.stopPropagation();
            element.fontFamily = fontSelect.value;
            this.refreshTextElement(element.id);
            this.recordHistory('Police modifiée');
        });

        const boldBtn = toggleButton('B', 'bold', 'Gras');
        boldBtn.classList.add('element-toolbar__toggle--bold');

        const italicBtn = toggleButton('I', 'italic', 'Italique');
        italicBtn.classList.add('element-toolbar__toggle--italic');

        const underlineBtn = toggleButton('U', 'underline', 'Souligner');
        underlineBtn.classList.add('element-toolbar__toggle--underline');

        const highlightBtn = toggleButton(null, 'highlight', 'Surligner le texte');
        highlightBtn.classList.add('element-toolbar__toggle--highlight');
        const highlightGlyph = document.createElement('span');
        highlightGlyph.className = 'element-toolbar__glyph element-toolbar__glyph--highlight';
        highlightGlyph.setAttribute('aria-hidden', 'true');
        highlightBtn.appendChild(highlightGlyph);

        primaryRow.append(fontSelect, sizeInput, decreaseBtn, increaseBtn);
        secondaryRow.append(boldBtn, italicBtn, underlineBtn, highlightBtn, colorWrapper);

        const duplicateBtn = document.createElement('button');
        duplicateBtn.type = 'button';
        duplicateBtn.className = 'toolbar-duplicate';
        duplicateBtn.textContent = 'Dupliquer';
        this.configureDuplicateButton(duplicateBtn, element.id);
        actionsRow.appendChild(duplicateBtn);

        const layersBtn = document.createElement('button');
        layersBtn.type = 'button';
        layersBtn.className = 'toolbar-layers';
        layersBtn.textContent = 'Layers';
        layersBtn.title = 'Gérer l’ordre des calques';
        layersBtn.setAttribute('aria-haspopup', 'true');
        layersBtn.setAttribute('aria-expanded', 'false');
        const layersMenu = this.createLayersMenu(element.id);
        actionsRow.appendChild(layersBtn);
        layersBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            this.toggleLayerMenu(layersMenu, layersBtn, element.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'toolbar-delete';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Supprimer ce texte';
        deleteBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            this.deleteElement(element.id);
        });
        actionsRow.appendChild(deleteBtn);

        toolbar.append(primaryRow, secondaryRow, actionsRow);
        toolbar.appendChild(layersMenu);
        this.syncToolbar(toolbar, element);

        return toolbar;
    }

    createSignatureToolbar(element) {
        const toolbar = document.createElement('div');
        toolbar.className = 'element-toolbar element-toolbar--signature';
        const duplicateBtn = document.createElement('button');
        duplicateBtn.type = 'button';
        duplicateBtn.className = 'toolbar-duplicate';
        duplicateBtn.textContent = 'Dupliquer';
        this.configureDuplicateButton(duplicateBtn, element.id);
        toolbar.appendChild(duplicateBtn);

        const layersBtn = document.createElement('button');
        layersBtn.type = 'button';
        layersBtn.className = 'toolbar-layers';
        layersBtn.textContent = 'Layers';
        layersBtn.title = 'Gérer l’ordre des calques';
        layersBtn.setAttribute('aria-haspopup', 'true');
        layersBtn.setAttribute('aria-expanded', 'false');
        const layersMenu = this.createLayersMenu(element.id);
        toolbar.appendChild(layersBtn);
        toolbar.appendChild(layersMenu);
        layersBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            this.toggleLayerMenu(layersMenu, layersBtn, element.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'toolbar-delete';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Supprimer cette signature';
        deleteBtn.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            this.deleteElement(element.id);
        });
        toolbar.appendChild(deleteBtn);
        return toolbar;
    }

    syncToolbar(toolbar, element) {
        if (!toolbar) return;
        toolbar.querySelectorAll('button[data-action]').forEach(btn => {
            const action = btn.dataset.action;
            if (['bold', 'italic', 'underline', 'highlight'].includes(action)) {
                const isActive = Boolean(element[action]);
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-pressed', String(isActive));
            }
        });
        const colorInput = toolbar.querySelector('input[type="color"]');
        if (colorInput && element.color) {
            colorInput.value = element.color;
            if (colorInput.parentElement) {
                colorInput.parentElement.style.setProperty('--swatch-color', element.color);
            }
        }
        const fontSelect = toolbar.querySelector('select[data-action="font"]');
        if (fontSelect && element.fontFamily) {
            fontSelect.value = element.fontFamily;
        }
        const sizeInput = toolbar.querySelector('input[data-action="font-size"]');
        if (sizeInput) {
            sizeInput.value = Math.round(Number(element.fontSize ?? 10));
        }
    }

    refreshTextElement(id) {
        const element = this.state.elements.find(el => el.id === id);
        if (!element) {
            return;
        }
        const node = this.findNodeById(id);
        if (!node) {
            return;
        }
        const content = node.querySelector('.draggable-content');
        if (content) {
            this.applyTextStyles(content, element);
        }
        this.applyVariableDataset(node, element);
        node.style.width = `${(element.width ?? node.offsetWidth / this.state.scale) * this.state.scale}px`;
        node.style.height = `${(element.height ?? node.offsetHeight / this.state.scale) * this.state.scale}px`;
        this.syncToolbar(node.querySelector('.element-toolbar'), element);
        this.positionElementAffordances(node);
    }

    positionElementAffordances(node) {
        if (!node) return;
        const toolbar = node.querySelector('.element-toolbar');
        const deleteBtn = node.querySelector('.element-delete');
        const rect = node.getBoundingClientRect();
        const viewerRect = this.container.getBoundingClientRect();
        const margin = 12;
        const availableAbove = rect.top - viewerRect.top;
        const availableBelow = viewerRect.bottom - rect.bottom;
        let toolbarHeight = 0;
        let toolbarWidth = 0;
        if (toolbar) {
            toolbarHeight = toolbar.offsetHeight || toolbar.getBoundingClientRect().height || 0;
            toolbarWidth = toolbar.offsetWidth || toolbar.getBoundingClientRect().width || 0;
        }
        const requiredVerticalSpace = Math.max(48, Math.round(toolbarHeight + 20));
        let placeBelow = false;
        if (availableAbove >= requiredVerticalSpace + margin && availableBelow >= requiredVerticalSpace + margin) {
            placeBelow = availableBelow > availableAbove;
        } else if (availableAbove >= requiredVerticalSpace + margin) {
            placeBelow = false;
        } else if (availableBelow >= requiredVerticalSpace + margin) {
            placeBelow = true;
        } else {
            placeBelow = availableBelow > availableAbove;
        }
        if (toolbar) {
            const offsetAmount = requiredVerticalSpace;
            if (placeBelow) {
                toolbar.style.top = 'auto';
                toolbar.style.bottom = `-${offsetAmount}px`;
            } else {
                toolbar.style.bottom = 'auto';
                toolbar.style.top = `-${offsetAmount}px`;
            }

            const viewerLeft = viewerRect.left + margin;
            const viewerRight = viewerRect.right - margin;
            const elementWidth = rect.width;
            let horizontalOffset = (elementWidth - toolbarWidth) / 2;
            if (!Number.isFinite(horizontalOffset)) {
                horizontalOffset = 0;
            }
            let globalLeft = rect.left + horizontalOffset;
            const maxToolbarWidth = viewerRect.width - margin * 2;
            if (toolbarWidth >= maxToolbarWidth) {
                horizontalOffset = viewerLeft - rect.left;
            } else {
                if (globalLeft < viewerLeft) {
                    const delta = viewerLeft - globalLeft;
                    horizontalOffset += delta;
                    globalLeft += delta;
                }
                if (globalLeft + toolbarWidth > viewerRight) {
                    const delta = (globalLeft + toolbarWidth) - viewerRight;
                    horizontalOffset -= delta;
                    globalLeft -= delta;
                }
                if (globalLeft < viewerLeft) {
                    const delta = viewerLeft - globalLeft;
                    horizontalOffset += delta;
                }
            }
            toolbar.style.left = `${horizontalOffset}px`;
            toolbar.style.right = 'auto';
        }
        if (deleteBtn) {
            if (placeBelow) {
                deleteBtn.style.top = 'auto';
                deleteBtn.style.bottom = '-38px';
            } else {
                deleteBtn.style.bottom = 'auto';
                deleteBtn.style.top = '-38px';
            }
            const preferRight = (viewerRect.right - rect.right) >= (rect.left - viewerRect.left);
            if (preferRight) {
                deleteBtn.style.left = 'auto';
                deleteBtn.style.right = '0';
            } else {
                deleteBtn.style.right = 'auto';
                deleteBtn.style.left = '0';
            }
        }
    }

    findNodeById(id) {
        for (const page of this.state.pages) {
            if (!page || !page.overlay) continue;
            const node = page.overlay.querySelector(`[data-id="${id}"]`);
            if (node) return node;
        }
        return null;
    }

    setActiveElement(id) {
        this.state.awaitingEditDismissal = Boolean(id);
        if (this.state.activeElementId === id) {
            return;
        }
        if (this.state.activeElementId) {
            const prevNode = this.findNodeById(this.state.activeElementId);
            if (prevNode) {
                prevNode.classList.remove('is-active');
            }
        }
        this.state.activeElementId = id;
        if (id) {
            const node = this.findNodeById(id);
            const element = this.state.elements.find(el => el.id === id);
            if (node) {
                node.classList.add('is-active');
                this.positionElementAffordances(node);
                if (element?.type === 'text') {
                    this.syncToolbar(node.querySelector('.element-toolbar'), element);
                }
            }
            this.updateEditingHint(element ?? null);
        } else {
            this.state.awaitingEditDismissal = false;
            this.updateEditingHint(null);
        }
    }

    finalizeActiveElement() {
        if (!this.state.activeElementId) {
            this.state.awaitingEditDismissal = false;
            return;
        }
        const activeId = this.state.activeElementId;
        const node = this.findNodeById(activeId);
        if (node) {
            const editable = node.querySelector('.draggable-content[contenteditable="true"]');
            if (editable instanceof HTMLElement) {
                editable.blur();
            }
        }
        this.state.awaitingEditDismissal = false;
        this.setActiveElement(null);
        this.recordHistory('Modification d\'un élément');
    }

    updateEditingHint(element) {
        if (!this.hintEl) {
            return;
        }
        if (element) {
            this.hintEl.textContent = 'Cliquez n’importe où ailleurs à l’extérieur du document dans l’espace hachuré pour cesser la modification de l’élément en cours.';
            this.hintEl.classList.add('is-visible');
        } else {
            this.hintEl.classList.remove('is-visible');
            this.hintEl.textContent = '';
        }
    }

    deleteElement(id) {
        const index = this.state.elements.findIndex(el => el.id === id);
        if (index === -1) return;
        const [element] = this.state.elements.splice(index, 1);
        this.setActiveElement(null);
        this.replayElements(element.page);
        this.feedback('Élément supprimé.');
        this.recordHistory('Élément supprimé');
    }

    onResizeHandlePointerDown(event) {
        event.preventDefault();
        event.stopPropagation();
        const handle = event.currentTarget;
        const node = handle.closest('.draggable-item');
        if (!node) return;
        const id = node.dataset.id;
        const element = this.state.elements.find(el => el.id === id);
        if (!element) return;
        this.setActiveElement(id);

        const direction = handle.dataset.direction ?? 'se';
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = node.offsetWidth;
        const startHeight = node.offsetHeight;
        const startLeft = parseFloat(node.style.left) || 0;
        const startTop = parseFloat(node.style.top) || 0;
        let resized = false;

        const onMove = evt => {
            const dx = evt.clientX - startX;
            const dy = evt.clientY - startY;
            let nextWidth = startWidth;
            let nextHeight = startHeight;
            let nextLeft = startLeft;
            let nextTop = startTop;

            if (direction.includes('e')) {
                nextWidth = Math.max(48, startWidth + dx);
            }
            if (direction.includes('s')) {
                nextHeight = Math.max(32, startHeight + dy);
            }
            if (direction.includes('w')) {
                nextWidth = Math.max(48, startWidth - dx);
                nextLeft = startLeft + dx;
            }
            if (direction.includes('n')) {
                nextHeight = Math.max(32, startHeight - dy);
                nextTop = startTop + dy;
            }

            node.style.width = `${nextWidth}px`;
            node.style.height = `${nextHeight}px`;
            node.style.left = `${nextLeft}px`;
            node.style.top = `${nextTop}px`;

            element.width = nextWidth / this.state.scale;
            element.height = nextHeight / this.state.scale;
            element.x = nextLeft / this.state.scale;
            element.y = nextTop / this.state.scale;
            resized = true;

            const content = node.querySelector('.draggable-content');
            if (content && element.type === 'text') {
                this.applyTextStyles(content, element);
            }
        };

        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            this.positionElementAffordances(node);
            if (resized) {
                this.recordHistory('Élément redimensionné');
            }
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp, { once: true });
    }

    onPointerDown(event) {
        const target = event.currentTarget;
        const interactiveTarget = event.target;
        if (interactiveTarget.closest('.element-toolbar') || interactiveTarget.classList.contains('resize-handle') || interactiveTarget.classList.contains('element-delete')) {
            return;
        }

        const id = target.dataset.id;
        const element = this.state.elements.find(el => el.id === id);
        if (!element) return;

        this.setActiveElement(id);

        const startX = event.clientX;
        const startY = event.clientY;
        const initialLeft = element.x * this.state.scale;
        const initialTop = element.y * this.state.scale;
        const pointerId = event.pointerId;
        let dragging = false;
        let moved = false;

        const beginDrag = () => {
            if (dragging) {
                return;
            }
            dragging = true;
            if (typeof target.setPointerCapture === 'function') {
                try {
                    target.setPointerCapture(pointerId);
                } catch (error) {
                    // Ignorer les erreurs de capture.
                }
            }
            if (element.type === 'text') {
                const editable = target.querySelector('.draggable-content[contenteditable="true"]');
                if (editable instanceof HTMLElement) {
                    editable.blur();
                }
            }
        };

        const move = evt => {
            const dx = evt.clientX - startX;
            const dy = evt.clientY - startY;
            if (!dragging) {
                if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                    return;
                }
                beginDrag();
            }
            evt.preventDefault();
            const newLeft = initialLeft + dx;
            const newTop = initialTop + dy;
            element.x = newLeft / this.state.scale;
            element.y = newTop / this.state.scale;
            target.style.left = `${newLeft}px`;
            target.style.top = `${newTop}px`;
            this.positionElementAffordances(target);
            moved = true;
        };

        const up = evt => {
            if (dragging && typeof target.releasePointerCapture === 'function' && target.hasPointerCapture?.(pointerId)) {
                try {
                    target.releasePointerCapture(pointerId);
                } catch (error) {
                    // Ignorer les erreurs de libération.
                }
            }
            target.removeEventListener('pointermove', move);
            target.removeEventListener('pointerup', up);
            if (dragging) {
                this.positionElementAffordances(target);
                if (moved) {
                    this.recordHistory('Élément déplacé');
                }
            }
        };

        target.addEventListener('pointermove', move);
        target.addEventListener('pointerup', up);
    }

    resolvePointerLocation(evt) {
        if (!(evt instanceof PointerEvent)) {
            return null;
        }
        const target = document.elementFromPoint(evt.clientX, evt.clientY);
        if (!target) {
            return null;
        }
        const overlay = target.closest('.overlay-layer');
        if (!overlay) {
            return null;
        }
        const rect = overlay.getBoundingClientRect();
        const pageIndex = Number(overlay.dataset.page ?? 0);
        return {
            pageIndex,
            overlay,
            rect,
            xPx: evt.clientX - rect.left,
            yPx: evt.clientY - rect.top,
        };
    }

    startDuplicateDrag(elementId, pointerEvent, context = {}) {
        const element = this.state.elements.find(el => el.id === elementId);
        if (!element) {
            return;
        }
        let node = this.findNodeById(elementId);
        if (!node) {
            this.replayElements(element.page ?? 0);
            node = this.findNodeById(elementId);
        }
        if (!node) {
            return;
        }
        const pointerId = context.pointerId ?? pointerEvent.pointerId;
        let offsetXPx = context.offsetX ?? (pointerEvent.clientX - node.getBoundingClientRect().left);
        let offsetYPx = context.offsetY ?? (pointerEvent.clientY - node.getBoundingClientRect().top);
        const nodeRect = node.getBoundingClientRect();
        if (!Number.isFinite(offsetXPx) || offsetXPx <= 0) {
            offsetXPx = nodeRect.width / 2;
        }
        if (!Number.isFinite(offsetYPx) || offsetYPx <= 0) {
            offsetYPx = nodeRect.height / 2;
        }
        let activePage = element.page ?? 0;

        const move = evt => {
            if (evt.pointerId !== pointerId) {
                return;
            }
            evt.preventDefault();
            const location = this.resolvePointerLocation(evt);
            if (!location) {
                return;
            }
            if (location.pageIndex !== activePage) {
                const previousPage = activePage;
                element.page = location.pageIndex;
                activePage = element.page;
                this.replayElements(activePage);
                if (Number.isInteger(previousPage)) {
                    this.replayElements(previousPage);
                }
                node = this.findNodeById(elementId);
                if (!node) {
                    return;
                }
            }
            const currentRect = node.getBoundingClientRect();
            const maxLeft = location.rect.width - currentRect.width;
            const maxTop = location.rect.height - currentRect.height;
            const leftPx = Math.max(0, Math.min(location.xPx - offsetXPx, maxLeft));
            const topPx = Math.max(0, Math.min(location.yPx - offsetYPx, maxTop));
            element.x = leftPx / this.state.scale;
            element.y = topPx / this.state.scale;
            node.style.left = `${leftPx}px`;
            node.style.top = `${topPx}px`;
            this.positionElementAffordances(node);
        };

        const end = evt => {
            if (evt.pointerId !== pointerId) {
                return;
            }
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', end);
            document.removeEventListener('pointercancel', end);
            if (node) {
                this.positionElementAffordances(node);
            }
            this.feedback('Élément dupliqué.');
        };

        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', end);
        document.addEventListener('pointercancel', end);
    }

    configureDuplicateButton(button, elementId) {
        if (!button) {
            return;
        }
        let pointerActive = false;
        const resetFlag = () => {
            pointerActive = false;
        };
        button.addEventListener('pointerdown', evt => {
            if (!evt.isPrimary) {
                return;
            }
            const started = this.duplicateElement(elementId, { pointerEvent: evt });
            pointerActive = started;
            if (started) {
                evt.preventDefault();
                evt.stopPropagation();
            }
        });
        button.addEventListener('pointerup', resetFlag);
        button.addEventListener('pointercancel', resetFlag);
        button.addEventListener('click', evt => {
            if (pointerActive) {
                pointerActive = false;
                evt.preventDefault();
                evt.stopPropagation();
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            this.duplicateElement(elementId);
        });
    }

    zoom(factor) {
        if (!this.state.pdf) return;
        const nextScale = Math.min(Math.max(this.state.scale * factor, 0.5), 3);
        if (Math.abs(nextScale - this.state.scale) < 0.001) {
            return;
        }
        this.state.scale = nextScale;
        for (let i = 0; i < this.state.pages.length; i++) {
            const entry = this.state.pages[i];
            if (!entry) continue;
            entry.rendered = false;
            entry.viewport = null;
            entry.canvas.width = 0;
            entry.canvas.height = 0;
            entry.canvas.style.width = '';
            entry.canvas.style.height = '';
            entry.overlay.style.width = '';
            entry.overlay.style.height = '';
            entry.overlay.innerHTML = '';
        }
        this.ensureVisiblePagesRendered();
    }

    async openSignatureModal() {
        if (!this.signatureModal) {
            this.createSignatureModal();
        }
        return this.signatureModal.open();
    }

    createSignatureModal() {
        const container = document.createElement('div');
        container.className = 'signature-canvas-container';
        container.setAttribute('aria-hidden', 'true');

        container.innerHTML = `
            <div class="signature-modal">
                <header class="signature-modal-header">
                    <h2>Signer le document</h2>
                    <div class="signature-header-actions">
                        <button class="signature-reset" data-role="reset-canvas-header" type="button" title="Effacer et recommencer">🗘</button>
                        <button class="btn" data-action="close" type="button" aria-label="Fermer">×</button>
                    </div>
                </header>
                <canvas></canvas>
                <div class="signature-views">
                    <section class="signature-panel signature-view signature-panel--menu" data-view="menu">
                        <div class="signature-menu-header">
                            <p class="signature-menu-question">Que voulez-vous faire&nbsp;?</p>
                            <button type="button" class="signature-access-button" data-view-target="library">Accéder au système de signatures</button>
                        </div>
                        <div class="signature-menu-footer">
                            <button type="button" class="signature-memory-link" data-view-target="default">Mémoriser ma signature</button>
                        </div>
                    </section>
                    <section class="signature-panel signature-view" data-view="default" data-panel="default" hidden>
                        <button type="button" class="signature-back" data-action="back" aria-label="Retour">❮❮</button>
                        <h3>Mémoriser ma signature</h3>
                        <label for="signature-default-name">Nom</label>
                        <input type="text" id="signature-default-name" data-role="default-name" value="ma_signature">
                        <div class="signature-actions">
                            <button data-role="save-default" type="button">Enregistrer</button>
                        </div>
                        <p class="signature-helper" data-role="previous-info"></p>
                    </section>
                    <section class="signature-panel signature-view" data-view="library" data-panel="library" hidden>
                        <button type="button" class="signature-back" data-action="back" aria-label="Retour">❮❮</button>
                        <h3>Autre signature</h3>
                        <div class="signature-library-tabs">
                            <button type="button" data-mode="saved" class="is-active">Signatures enregistrées</button>
                            <button type="button" data-mode="create">Créer signature enregistrée</button>
                            <button type="button" data-mode="temporary">Créer signature (non-enregistrée)</button>
                        </div>
                        <div class="signature-library-pane is-visible" data-pane="saved">
                            <div class="signature-library-tools" data-role="library-controls">
                                <input type="search" placeholder="Rechercher" data-role="library-search">
                                <button data-role="apply-library" type="button">Ajouter</button>
                                <button data-role="remove-library" type="button">Supprimer</button>
                            </div>
                            <div class="signature-library" data-role="library"></div>
                        </div>
                        <div class="signature-library-pane" data-pane="create" hidden>
                            <div class="signature-form" data-role="saved-form">
                                <label>Nom de la signature</label>
                                <input type="text" data-role="saved-name" placeholder="Nom personnalisé">
                                <button data-role="save-saved" type="button">Enregistrer</button>
                            </div>
                        </div>
                        <div class="signature-library-pane" data-pane="temporary" hidden>
                            <p class="signature-hint" data-role="temporary-hint">La signature sera utilisée une seule fois et ne sera pas sauvegardée.</p>
                        </div>
                    </section>
                </div>
                <footer>
                    <div class="signature-actions">
                        <button class="btn" data-action="clear" type="button">🗘 Effacer</button>
                        <button class="btn" data-action="export" type="button">💾 Exporter</button>
                        <label class="btn">
                            Importer
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden>
                        </label>
                    </div>
                    <button class="btn success" data-action="confirm" type="button">Appliquer</button>
                </footer>
            </div>
        `;

        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 220;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#191970';

        let drawing = false;
        const startDraw = evt => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(evt.offsetX, evt.offsetY);
        };
        const draw = evt => {
            if (!drawing) return;
            ctx.lineTo(evt.offsetX, evt.offsetY);
            ctx.stroke();
        };
        const endDraw = () => {
            drawing = false;
        };

        canvas.addEventListener('pointerdown', startDraw);
        canvas.addEventListener('pointermove', draw);
        canvas.addEventListener('pointerup', endDraw);
        canvas.addEventListener('pointerleave', endDraw);

        const api = {
            open: () => new Promise(resolve => {
                let settled = false;
                const finish = value => {
                    if (settled) {
                        return;
                    }
                    settled = true;
                    hidePreview();
                    container.setAttribute('aria-hidden', 'true');
                    container.remove();
                    previewCard = null;
                    resolve(value);
                };

                const close = () => {
                    finish(null);
                };

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#191970';

                const defaultNameInput = container.querySelector('[data-role="default-name"]');
                const previousInfo = container.querySelector('[data-role="previous-info"]');
                const libraryList = container.querySelector('[data-role="library"]');
                const libraryControls = container.querySelector('[data-role="library-controls"]');
                const librarySearch = container.querySelector('[data-role="library-search"]');
                const savedForm = container.querySelector('[data-role="saved-form"]');
                const savedNameInput = container.querySelector('[data-role="saved-name"]');
                const temporaryHint = container.querySelector('[data-role="temporary-hint"]');
                const applyLibraryBtn = container.querySelector('[data-role="apply-library"]');
                const removeLibraryBtn = container.querySelector('[data-role="remove-library"]');
                const modal = container.querySelector('.signature-modal');
                const viewSections = Array.from(container.querySelectorAll('.signature-view'));
                const menuButtons = container.querySelectorAll('[data-view-target]');
                const backButtons = container.querySelectorAll('[data-action="back"]');
                const modeButtons = container.querySelectorAll('.signature-library-tabs [data-mode]');
                const libraryPanes = container.querySelectorAll('.signature-library-pane');
                let previewCard = null;
                let currentLibraryResults = [];

                const state = {
                    selectedSavedId: null,
                    temporaryMode: false,
                    libraryMode: 'saved',
                };
                let currentView = 'menu';

                const getSelectedSavedEntry = () => {
                    if (!state.selectedSavedId) {
                        return null;
                    }
                    return this.signatureStore.findSaved(state.selectedSavedId) ?? null;
                };

                const hidePreview = () => {
                    if (!previewCard) {
                        return;
                    }
                    previewCard.hidden = true;
                    previewCard.dataset.id = '';
                };

                const ensurePreview = () => {
                    if (previewCard) {
                        return previewCard;
                    }
                    previewCard = document.createElement('div');
                    previewCard.className = 'signature-preview';
                    previewCard.hidden = true;
                    previewCard.innerHTML = `
                        <figure>
                            <img alt="Aperçu de la signature enregistrée">
                            <figcaption data-role="preview-name"></figcaption>
                        </figure>
                        <div class="signature-preview-actions">
                            <button type="button" data-role="preview-rename">Renommer</button>
                            <button type="button" data-role="preview-export">Exporter</button>
                            <button type="button" data-role="preview-remove">Supprimer</button>
                        </div>
                    `;
                    const renameBtn = previewCard.querySelector('[data-role="preview-rename"]');
                    renameBtn?.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        const id = previewCard?.dataset.id ?? '';
                        if (!id) {
                            return;
                        }
                        const entry = this.signatureStore.findSaved(id);
                        if (!entry) {
                            return;
                        }
                        const nextName = window.prompt('Nouveau nom de la signature', entry.name ?? '') ?? '';
                        if (!nextName.trim()) {
                            return;
                        }
                        const updated = this.signatureStore.renameSaved(id, nextName);
                        if (!updated) {
                            return;
                        }
                        state.selectedSavedId = updated.id;
                        renderLibrary(librarySearch?.value ?? '');
                        drawImageFromData(updated.dataUrl, updated.width, updated.height);
                        updateLibraryButtons();
                        const caption = previewCard.querySelector('[data-role="preview-name"]');
                        if (caption) {
                            caption.textContent = updated.name ?? 'Signature';
                        }
                        previewCard.dataset.id = updated.id ?? '';
                        const anchor = libraryList?.querySelector(`[data-id="${updated.id}"]`);
                        if (anchor instanceof HTMLElement) {
                            showPreview(updated, anchor);
                        } else {
                            hidePreview();
                        }
                    });
                    const exportBtn = previewCard.querySelector('[data-role="preview-export"]');
                    exportBtn?.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        const id = previewCard?.dataset.id ?? '';
                        if (!id) {
                            return;
                        }
                        const entry = this.signatureStore.findSaved(id);
                        if (!entry || !entry.dataUrl) {
                            return;
                        }
                        downloadDataUrl(entry.dataUrl, entry.name ?? 'signature');
                    });
                    const removeBtn = previewCard.querySelector('[data-role="preview-remove"]');
                    removeBtn?.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        const id = previewCard?.dataset.id ?? '';
                        if (!id) {
                            return;
                        }
                        this.signatureStore.removeSaved(id);
                        state.selectedSavedId = null;
                        hidePreview();
                        renderLibrary(librarySearch?.value ?? '');
                        updateLibraryButtons();
                    });
                    previewCard.addEventListener('mouseleave', hidePreview);
                    modal?.appendChild(previewCard);
                    return previewCard;
                };

                const showPreview = (item, anchor) => {
                    if (!modal) {
                        return;
                    }
                    const preview = ensurePreview();
                    const img = preview.querySelector('img');
                    const caption = preview.querySelector('[data-role="preview-name"]');
                    if (img) {
                        img.src = item.dataUrl;
                    }
                    if (caption) {
                        caption.textContent = item.name ?? 'Signature';
                    }
                    preview.dataset.id = item.id ?? '';
                    const anchorRect = anchor.getBoundingClientRect();
                    const modalRect = modal.getBoundingClientRect();
                    const top = anchorRect.bottom - modalRect.top + modal.scrollTop + 12;
                    const left = anchorRect.left - modalRect.left + modal.scrollLeft;
                    preview.style.top = `${top}px`;
                    preview.style.left = `${left}px`;
                    preview.hidden = false;
                };

                modal?.addEventListener('scroll', hidePreview);
                modal?.addEventListener('mouseleave', hidePreview);

                const baseWidth = 600;
                const baseHeight = 220;

                const clearCanvas = () => {
                    canvas.width = baseWidth;
                    canvas.height = baseHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawing = false;
                };

                const drawImageFromData = (dataUrl, width, height) => {
                    if (!dataUrl) {
                        clearCanvas();
                        return;
                    }
                    const img = new Image();
                    img.onload = () => {
                        canvas.width = width ?? img.width;
                        canvas.height = height ?? img.height;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = dataUrl;
                };

                const sanitizeFileName = (value, fallback = 'signature') => {
                    const safe = (value || fallback).trim() || fallback;
                    return safe.replace(/[^a-z0-9_-]+/gi, '_');
                };

                const downloadDataUrl = (dataUrl, fileNameHint = 'signature') => {
                    const anchor = document.createElement('a');
                    anchor.href = dataUrl;
                    anchor.download = `${sanitizeFileName(fileNameHint)}.png`;
                    document.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                };

                const sampleBackgroundColor = (imageData, width, height) => {
                    if (!imageData || width <= 0 || height <= 0) {
                        return null;
                    }
                    const { data } = imageData;
                    const samples = [];
                    const stepX = Math.max(1, Math.floor(width / 6));
                    const stepY = Math.max(1, Math.floor(height / 6));
                    const pushSample = (x, y) => {
                        const idx = (y * width + x) * 4;
                        const alpha = data[idx + 3];
                        if (alpha === 0) {
                            return;
                        }
                        samples.push({
                            r: data[idx],
                            g: data[idx + 1],
                            b: data[idx + 2],
                        });
                    };
                    for (let x = 0; x < width; x += stepX) {
                        pushSample(x, 0);
                        pushSample(x, height - 1);
                    }
                    for (let y = 0; y < height; y += stepY) {
                        pushSample(0, y);
                        pushSample(width - 1, y);
                    }
                    pushSample(0, 0);
                    pushSample(width - 1, 0);
                    pushSample(0, height - 1);
                    pushSample(width - 1, height - 1);
                    if (!samples.length) {
                        return { r: 255, g: 255, b: 255 };
                    }
                    const total = samples.reduce((acc, sample) => ({
                        r: acc.r + sample.r,
                        g: acc.g + sample.g,
                        b: acc.b + sample.b,
                    }), { r: 0, g: 0, b: 0 });
                    const count = samples.length;
                    return {
                        r: total.r / count,
                        g: total.g / count,
                        b: total.b / count,
                    };
                };

                const removeBackgroundFromImage = (imageData, width, height) => {
                    if (!imageData || width <= 0 || height <= 0) {
                        return imageData;
                    }
                    const background = sampleBackgroundColor(imageData, width, height);
                    if (!background) {
                        return imageData;
                    }
                    const { data } = imageData;
                    const baseBrightness = (background.r + background.g + background.b) / 3;
                    for (let i = 0; i < data.length; i += 4) {
                        const alpha = data[i + 3];
                        if (alpha === 0) {
                            continue;
                        }
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (r + g + b) / 3;
                        const diff = Math.abs(r - background.r)
                            + Math.abs(g - background.g)
                            + Math.abs(b - background.b);
                        if (brightness > 245 || (diff < 45 && Math.abs(brightness - baseBrightness) < 35)) {
                            data[i + 3] = 0;
                        } else if (diff < 70 && brightness >= baseBrightness) {
                            data[i + 3] = Math.min(data[i + 3], 64);
                        }
                    }
                    return imageData;
                };

                const trimTransparentBounds = (imageData, width, height) => {
                    if (!imageData || width <= 0 || height <= 0) {
                        return null;
                    }
                    const { data } = imageData;
                    let minX = width;
                    let minY = height;
                    let maxX = -1;
                    let maxY = -1;
                    for (let y = 0; y < height; y += 1) {
                        for (let x = 0; x < width; x += 1) {
                            const idx = (y * width + x) * 4;
                            if (data[idx + 3] > 8) {
                                if (x < minX) minX = x;
                                if (y < minY) minY = y;
                                if (x > maxX) maxX = x;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                    if (maxX === -1 || maxY === -1) {
                        return null;
                    }
                    const target = document.createElement('canvas');
                    target.width = Math.max(1, maxX - minX + 1);
                    target.height = Math.max(1, maxY - minY + 1);
                    const targetCtx = target.getContext('2d');
                    if (!targetCtx) {
                        return null;
                    }
                    targetCtx.putImageData(imageData, -minX, -minY);
                    return target;
                };

                const processCanvasForExport = () => {
                    const working = document.createElement('canvas');
                    working.width = Math.max(1, canvas.width);
                    working.height = Math.max(1, canvas.height);
                    const workingCtx = working.getContext('2d');
                    if (!workingCtx) {
                        return {
                            dataUrl: canvas.toDataURL('image/png'),
                            width: canvas.width || 1,
                            height: canvas.height || 1,
                        };
                    }
                    workingCtx.drawImage(canvas, 0, 0);
                    try {
                        const imageData = workingCtx.getImageData(0, 0, working.width, working.height);
                        const cleaned = removeBackgroundFromImage(imageData, working.width, working.height);
                        const trimmed = trimTransparentBounds(cleaned, working.width, working.height);
                        if (trimmed) {
                            return {
                                dataUrl: trimmed.toDataURL('image/png'),
                                width: trimmed.width,
                                height: trimmed.height,
                            };
                        }
                        workingCtx.putImageData(cleaned, 0, 0);
                        return {
                            dataUrl: working.toDataURL('image/png'),
                            width: working.width,
                            height: working.height,
                        };
                    } catch (error) {
                        console.warn('Impossible de traiter la signature importée.', error);
                        return {
                            dataUrl: working.toDataURL('image/png'),
                            width: working.width,
                            height: working.height,
                        };
                    }
                };

                const finalizeSignature = () => Promise.resolve(processCanvasForExport());

                const resolveCanvasSignatureName = (fallback = 'signature') => {
                    const selected = getSelectedSavedEntry();
                    if (selected?.name) {
                        return selected.name;
                    }
                    if (currentView === 'default') {
                        const value = (defaultNameInput?.value || '').trim();
                        if (value) {
                            return value;
                        }
                    }
                    if (state.libraryMode === 'create') {
                        const custom = (savedNameInput?.value || '').trim();
                        if (custom) {
                            return custom;
                        }
                    }
                    if (state.libraryMode === 'temporary') {
                        return 'signature_temporaire';
                    }
                    return fallback;
                };

                const refreshCanvasWithProcessedSignature = () => {
                    const processed = processCanvasForExport();
                    drawImageFromData(processed.dataUrl, processed.width, processed.height);
                    return processed;
                };

                const updateLibraryButtons = () => {
                    const hasSelection = Boolean(state.selectedSavedId);
                    if (applyLibraryBtn) {
                        applyLibraryBtn.disabled = !hasSelection;
                    }
                    if (removeLibraryBtn) {
                        removeLibraryBtn.disabled = !hasSelection;
                    }
                };

                const updateDefaultInfo = () => {
                    const current = this.signatureStore.getDefault();
                    if (current?.name) {
                        defaultNameInput.value = current.name;
                        previousInfo.textContent = `Signature par défaut actuelle : ${current.name}.`;
                        drawImageFromData(current.dataUrl, current.width, current.height);
                    } else {
                        defaultNameInput.value = 'ma_signature';
                        previousInfo.textContent = 'Enregistrez une signature pour la définir par défaut.';
                        clearCanvas();
                    }
                    const previous = this.signatureStore.getPrevious();
                    if (previous?.name) {
                        previousInfo.textContent += ` Ancienne signature archivée sous « ${previous.name} ».`;
                    }
                };

                const switchView = view => {
                    currentView = view;
                    viewSections.forEach(section => {
                        const isMatch = section.dataset.view === view;
                        section.hidden = !isMatch;
                        section.classList.toggle('is-visible', isMatch);
                    });
                    if (view === 'default') {
                        state.temporaryMode = false;
                        state.libraryMode = 'saved';
                        updateDefaultInfo();
                    }
                    if (view === 'library') {
                        switchLibraryMode(state.libraryMode ?? 'saved');
                    }
                    if (view !== 'library') {
                        hidePreview();
                    }
                };

                const switchLibraryMode = mode => {
                    state.libraryMode = mode;
                    state.temporaryMode = mode === 'temporary';
                    modeButtons.forEach(btn => {
                        btn.classList.toggle('is-active', btn.dataset.mode === mode);
                    });
                    libraryPanes.forEach(pane => {
                        const matches = pane.dataset.pane === mode;
                        pane.hidden = !matches;
                        pane.classList.toggle('is-visible', matches);
                    });
                    if (libraryControls) {
                        libraryControls.hidden = mode !== 'saved';
                    }
                    if (savedForm) {
                        const createPane = savedForm.closest('.signature-library-pane');
                        if (createPane) {
                            createPane.hidden = mode !== 'create';
                            createPane.classList.toggle('is-visible', mode === 'create');
                        }
                    }
                    if (temporaryHint) {
                        const temporaryPane = temporaryHint.closest('.signature-library-pane');
                        if (temporaryPane) {
                            temporaryPane.hidden = mode !== 'temporary';
                            temporaryPane.classList.toggle('is-visible', mode === 'temporary');
                        }
                    }
                    if (mode === 'create' || mode === 'temporary') {
                        clearCanvas();
                        state.selectedSavedId = null;
                        hidePreview();
                        updateLibraryButtons();
                    }
                    if (mode === 'saved') {
                        renderLibrary(librarySearch?.value ?? '');
                        if (librarySearch) {
                            librarySearch.focus({ preventScroll: true });
                        }
                    }
                    if (mode === 'create' && savedNameInput) {
                        savedNameInput.focus({ preventScroll: true });
                    }
                    if (mode !== 'saved') {
                        hidePreview();
                        state.selectedSavedId = null;
                        updateLibraryButtons();
                    }
                };

                const renderLibrary = (term = '') => {
                    const entries = this.signatureStore.listSaved();
                    const lower = term.trim().toLowerCase();
                    currentLibraryResults = lower
                        ? entries.filter(item => item.name?.toLowerCase().includes(lower))
                        : entries;
                    libraryList.innerHTML = '';
                    if (!currentLibraryResults.length) {
                        const empty = document.createElement('p');
                        empty.textContent = 'Aucune signature enregistrée.';
                        libraryList.appendChild(empty);
                        state.selectedSavedId = null;
                        updateLibraryButtons();
                        return;
                    }
                    for (const item of currentLibraryResults) {
                        const row = document.createElement('div');
                        row.className = 'signature-library-item';
                        const selectBtn = document.createElement('button');
                        selectBtn.type = 'button';
                        selectBtn.className = 'signature-library-select';
                        selectBtn.textContent = item.name ?? 'Signature';
                        selectBtn.dataset.id = item.id;
                        if (item.id === state.selectedSavedId) {
                            row.classList.add('is-active');
                        }
                        selectBtn.addEventListener('click', () => {
                            state.selectedSavedId = item.id;
                            for (const sibling of libraryList.querySelectorAll('.signature-library-item')) {
                                sibling.classList.toggle('is-active', sibling === row);
                            }
                            drawImageFromData(item.dataUrl, item.width, item.height);
                            updateLibraryButtons();
                        });
                        selectBtn.addEventListener('mouseenter', () => showPreview(item, selectBtn));
                        selectBtn.addEventListener('focus', () => showPreview(item, selectBtn));
                        selectBtn.addEventListener('mouseleave', () => {
                            setTimeout(() => {
                                if (previewCard?.matches(':hover')) {
                                    return;
                                }
                                hidePreview();
                            }, 80);
                        });
                        selectBtn.addEventListener('blur', () => {
                            setTimeout(() => {
                                const activeElement = document.activeElement;
                                if (previewCard && previewCard.contains(activeElement)) {
                                    return;
                                }
                                hidePreview();
                            }, 80);
                        });

                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'signature-library-remove';
                        removeBtn.textContent = '×';
                        removeBtn.title = `Supprimer ${item.name ?? 'cette signature'}`;
                        removeBtn.addEventListener('click', event => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.signatureStore.removeSaved(item.id);
                            if (state.selectedSavedId === item.id) {
                                state.selectedSavedId = null;
                            }
                            renderLibrary(librarySearch?.value ?? '');
                            updateLibraryButtons();
                        });

                        row.append(selectBtn, removeBtn);
                        libraryList.appendChild(row);
                    }
                    updateLibraryButtons();
                };

                const applyFromLibrary = async () => {
                    const selected = getSelectedSavedEntry();
                    if (!selected) return;
                    finish({
                        dataUrl: selected.dataUrl,
                        width: selected.width,
                        height: selected.height,
                        name: selected.name ?? null,
                    });
                };

                container.querySelector('[data-action="close"]').onclick = close;

                container.querySelector('[data-action="clear"]').onclick = () => {
                    clearCanvas();
                    state.selectedSavedId = null;
                    hidePreview();
                    updateLibraryButtons();
                };

                const fileInput = container.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.onchange = event => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            const img = new Image();
                            img.onload = () => {
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                refreshCanvasWithProcessedSignature();
                                state.selectedSavedId = null;
                                hidePreview();
                                updateLibraryButtons();
                            };
                            img.src = reader.result;
                        };
                        reader.readAsDataURL(file);
                        event.target.value = '';
                    };
                }

                container.querySelector('[data-action="confirm"]').onclick = async () => {
                    const payload = await finalizeSignature();
                    finish({ ...payload, name: resolveCanvasSignatureName() });
                };

                const exportButton = container.querySelector('[data-action="export"]');
                if (exportButton) {
                    exportButton.onclick = () => {
                        const payload = processCanvasForExport();
                        if (!payload?.dataUrl) {
                            return;
                        }
                        downloadDataUrl(payload.dataUrl, resolveCanvasSignatureName());
                    };
                }

                const resetCanvasBtn = container.querySelector('[data-role="reset-canvas-header"]');
                if (resetCanvasBtn) {
                    resetCanvasBtn.onclick = () => {
                        clearCanvas();
                        state.selectedSavedId = null;
                        hidePreview();
                        updateLibraryButtons();
                        if (state.libraryMode === 'saved') {
                            renderLibrary(librarySearch?.value ?? '');
                        }
                    };
                }

                container.querySelector('[data-role="save-default"]').onclick = async () => {
                    const name = (defaultNameInput.value || 'ma_signature').trim();
                    const payload = await finalizeSignature();
                    this.signatureStore.setDefault({ name, ...payload });
                    const stored = this.signatureStore.getDefault();
                    finish({ ...payload, name: stored?.name ?? name });
                };

                menuButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetView = btn.dataset.viewTarget ?? 'menu';
                        switchView(targetView);
                        if (targetView === 'library') {
                            switchLibraryMode('saved');
                        }
                    });
                });

                backButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        switchView('menu');
                    });
                });

                modeButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const mode = btn.dataset.mode ?? 'saved';
                        switchLibraryMode(mode);
                    });
                });

                librarySearch?.addEventListener('input', () => {
                    if (state.libraryMode !== 'saved') {
                        return;
                    }
                    renderLibrary(librarySearch.value);
                });

                librarySearch?.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (!state.selectedSavedId && currentLibraryResults.length === 1) {
                            const single = currentLibraryResults[0];
                            state.selectedSavedId = single.id;
                            drawImageFromData(single.dataUrl, single.width, single.height);
                        }
                        if (state.selectedSavedId) {
                            applyFromLibrary();
                        }
                    }
                });

                applyLibraryBtn?.addEventListener('click', () => {
                    applyFromLibrary();
                });

                removeLibraryBtn?.addEventListener('click', () => {
                    if (!state.selectedSavedId) {
                        return;
                    }
                    this.signatureStore.removeSaved(state.selectedSavedId);
                    state.selectedSavedId = null;
                    hidePreview();
                    renderLibrary(librarySearch?.value ?? '');
                    updateLibraryButtons();
                });

                container.querySelector('[data-role="save-saved"]').onclick = async () => {
                    const name = (savedNameInput.value || 'Signature personnalisée').trim();
                    const payload = await finalizeSignature();
                    const entry = this.signatureStore.addSaved({ name, ...payload });
                    savedNameInput.value = '';
                    state.selectedSavedId = entry.id;
                    switchLibraryMode('saved');
                    updateLibraryButtons();
                    drawImageFromData(entry.dataUrl, entry.width, entry.height);
                };

                container.setAttribute('aria-hidden', 'false');
                document.body.appendChild(container);

                updateDefaultInfo();
                state.selectedSavedId = null;
                switchView('menu');
                switchLibraryMode('saved');
                updateLibraryButtons();
            }),
        };

        this.signatureModal = api;
    }

    exportElements() {
        return this.state.elements.map(element => ({
            id: element.id,
            type: element.type,
            page: element.page,
            x: element.x,
            y: element.y,
            text: element.text,
            fontFamily: element.fontFamily,
            fontSize: element.fontSize,
            color: element.color,
            bold: element.bold,
            italic: element.italic,
            underline: element.underline,
            highlight: element.highlight,
            data: element.data,
            width: element.width,
            height: element.height,
        }));
    }

    getOriginalPdfBytes() {
        if (!this.state.originalPdfBytes) {
            return null;
        }
        return new Uint8Array(this.state.originalPdfBytes);
    }

    exportVariableMappings() {
        const mappings = new Map();
        for (const element of this.state.elements) {
            if (element.type !== 'text') {
                continue;
            }
            const variable = element.data?.variable;
            if (!variable || !variable.baseKey) {
                continue;
            }
            const baseKey = variable.baseKey || variable.key;
            if (!baseKey) {
                continue;
            }
            const label = variable.label || baseKey;
            const rankValue = Number.isFinite(variable.rank) && variable.rank > 0
                ? Math.floor(variable.rank)
                : 1;
            const entryKey = `${baseKey}::${label}`;
            if (!mappings.has(entryKey)) {
                mappings.set(entryKey, {
                    key: baseKey,
                    label,
                    ranks: {},
                });
            }
            const record = mappings.get(entryKey);
            const rankKey = String(rankValue);
            if (!Array.isArray(record.ranks[rankKey])) {
                record.ranks[rankKey] = [];
            }
            if (!record.ranks[rankKey].includes(element.id)) {
                record.ranks[rankKey].push(element.id);
            }
        }
        return Array.from(mappings.values());
    }

    importElements(elements = [], options = {}) {
        const { record = true } = options;
        const cloned = elements.map(item => ({ ...item }));
        for (const element of cloned) {
            element.id = element.id ?? uid();
            element.data = element.data ? this.cloneData(element.data) : element.data;
            if (element.type === 'text') {
                if (!element.data || typeof element.data !== 'object') {
                    element.data = {};
                } else if (element.data.variable) {
                    element.data.variable = this.normalizeVariableMeta(element.data.variable);
                }
            }
        }
        this.state.elements = cloned;
        this.setActiveElement(null);
        for (let i = 0; i < this.state.pages.length; i++) {
            if (this.state.pages[i]?.rendered) {
                this.replayElements(i);
            }
        }
        if (record) {
            this.recordHistory('Éléments importés', { force: true });
        }
    }

    resolveFontName(fontFamily, bold, italic) {
        const { StandardFonts } = this.pdfLib ?? {};
        if (!StandardFonts) {
            return null;
        }
        const family = (fontFamily ?? '').toLowerCase();
        const wantsBold = Boolean(bold);
        const wantsItalic = Boolean(italic);
        if (family.includes('times')) {
            if (wantsBold && wantsItalic) return StandardFonts.TimesRomanBoldItalic;
            if (wantsBold) return StandardFonts.TimesRomanBold;
            if (wantsItalic) return StandardFonts.TimesRomanItalic;
            return StandardFonts.TimesRoman;
        }
        if (family.includes('courier')) {
            if (wantsBold && wantsItalic) return StandardFonts.CourierBoldOblique;
            if (wantsBold) return StandardFonts.CourierBold;
            if (wantsItalic) return StandardFonts.CourierOblique;
            return StandardFonts.Courier;
        }
        if (family.includes('times new roman')) {
            if (wantsBold && wantsItalic) return StandardFonts.TimesRomanBoldItalic;
            if (wantsBold) return StandardFonts.TimesRomanBold;
            if (wantsItalic) return StandardFonts.TimesRomanItalic;
            return StandardFonts.TimesRoman;
        }
        if (family.includes('arial')) {
            if (wantsBold && wantsItalic) return StandardFonts.HelveticaBoldOblique;
            if (wantsBold) return StandardFonts.HelveticaBold;
            if (wantsItalic) return StandardFonts.HelveticaOblique;
            return StandardFonts.Helvetica;
        }
        if (family.includes('dejavu')) {
            if (wantsBold && wantsItalic) return StandardFonts.HelveticaBoldOblique;
            if (wantsBold) return StandardFonts.HelveticaBold;
            if (wantsItalic) return StandardFonts.HelveticaOblique;
            return StandardFonts.Helvetica;
        }
        if (wantsBold && wantsItalic) return StandardFonts.HelveticaBoldOblique;
        if (wantsBold) return StandardFonts.HelveticaBold;
        if (wantsItalic) return StandardFonts.HelveticaOblique;
        return StandardFonts.Helvetica;
    }

    parseHexColor(value) {
        if (typeof value !== 'string') {
            return { r: 25, g: 25, b: 112 };
        }
        const trimmed = value.trim();
        const match = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (!match) {
            return { r: 25, g: 25, b: 112 };
        }
        let hex = match[1];
        if (hex.length === 3) {
            hex = hex.split('').map(ch => ch + ch).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }

    dataUrlToBytes(dataUrl) {
        if (typeof dataUrl !== 'string' || dataUrl.length === 0) {
            return null;
        }
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!match) {
            return null;
        }
        const mime = match[1].toLowerCase();
        const base64 = match[2];
        try {
            const binary = atob(base64);
            const length = binary.length;
            const bytes = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return { mime, bytes };
        } catch (error) {
            console.warn('Impossible de décoder la signature.', error);
            return null;
        }
    }

    async generatePdfBytes() {
        if (!this.state.originalPdfBytes) {
            throw new Error('Aucun document source à exporter.');
        }
        if (!this.pdfLib) {
            throw new Error('La bibliothèque pdf-lib est indisponible.');
        }
        const { PDFDocument, rgb } = this.pdfLib;
        const fontCache = new Map();
        const pdfDoc = await PDFDocument.load(this.state.originalPdfBytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        const getFont = async (element) => {
            const fontName = this.resolveFontName(element.fontFamily, element.bold, element.italic);
            const key = fontName ?? 'Helvetica';
            if (!fontCache.has(key)) {
                const resource = fontName ?? this.pdfLib.StandardFonts.Helvetica;
                const font = await pdfDoc.embedFont(resource, { subset: true });
                fontCache.set(key, font);
            }
            return fontCache.get(key);
        };

        for (const element of this.state.elements) {
            const pageIndex = Number(element.page ?? 0);
            const page = pages[pageIndex];
            if (!page) {
                continue;
            }
            if (element.type === 'text') {
                const text = typeof element.text === 'string' ? element.text : '';
                if (!text.trim()) {
                    continue;
                }
                const fontSize = Number(element.fontSize ?? 10) || 10;
                const font = await getFont(element);
                const { r, g, b } = this.parseHexColor(element.color ?? '#191970');
                const color = rgb(r / 255, g / 255, b / 255);
                const x = Number(element.x ?? 0);
                const yTop = Number(element.y ?? 0);
                const lines = text.split(/\r?\n/);
                const lineHeight = fontSize * 1.2;
                const pageHeight = page.getHeight();
                const lineWidths = lines.map(line => font.widthOfTextAtSize(line, fontSize));
                const computedWidth = lineWidths.reduce((acc, value) => Math.max(acc, value), 0);
                const storedWidth = Number(element.width);
                const highlightWidth = Number.isFinite(storedWidth) && storedWidth > 0
                    ? Math.max(storedWidth, computedWidth + 6)
                    : computedWidth + 6;
                if (element.highlight) {
                    const highlightHeight = lineHeight * lines.length;
                    const highlightTop = pageHeight - yTop;
                    const rectY = Math.max(0, highlightTop - highlightHeight - 3);
                    page.drawRectangle({
                        x: x - 3,
                        y: rectY,
                        width: Math.max(highlightWidth + 6, 12),
                        height: highlightHeight + 6,
                        color: rgb(1, 1, 0),
                        opacity: 0.18,
                        borderOpacity: 0,
                    });
                }
                lines.forEach((line, index) => {
                    const baseline = pageHeight - yTop - fontSize - (lineHeight * index);
                    page.drawText(line, {
                        x,
                        y: baseline,
                        size: fontSize,
                        font,
                        color,
                    });
                    if (element.underline) {
                        const underlineWidth = lineWidths[index] ?? 0;
                        const thickness = Math.max(0.5, fontSize / 18);
                        const underlineY = baseline - thickness * 1.8;
                        page.drawLine({
                            start: { x, y: underlineY },
                            end: { x: x + underlineWidth, y: underlineY },
                            thickness,
                            color,
                        });
                    }
                });
            } else if (element.type === 'signature') {
                if (!element.data) {
                    continue;
                }
                const parsed = this.dataUrlToBytes(element.data);
                if (!parsed) {
                    continue;
                }
                const { mime, bytes } = parsed;
                let image;
                try {
                    if (mime === 'image/png') {
                        image = await pdfDoc.embedPng(bytes);
                    } else if (mime === 'image/jpeg' || mime === 'image/jpg') {
                        image = await pdfDoc.embedJpg(bytes);
                    } else {
                        image = await pdfDoc.embedPng(bytes);
                    }
                } catch (error) {
                    image = await pdfDoc.embedJpg(bytes);
                }
                let width = Number(element.width ?? image.width);
                let height = Number(element.height ?? image.height);
                if (!Number.isFinite(width) || width <= 0) {
                    width = image.width;
                }
                if (!Number.isFinite(height) || height <= 0) {
                    height = image.height;
                }
                const x = Number(element.x ?? 0);
                const y = page.getHeight() - Number(element.y ?? 0) - height;
                page.drawImage(image, {
                    x,
                    y,
                    width,
                    height,
                });
            }
        }

        return pdfDoc.save();
    }

    async save(options = {}) {
        if (!this.config.pdfGeneratorUrl) {
            throw new Error('Endpoint de génération manquant.');
        }
        if (!this.state.activeRequest || !this.state.activeDocument) {
            throw new Error('Aucun document source sélectionné.');
        }
        const pdfBytes = await this.generatePdfBytes();
        const pdfBase64 = bytesToBase64(pdfBytes);
        const response = await fetch(this.config.pdfGeneratorUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: this.state.activeRequest,
                document: this.state.activeDocument,
                elements: this.exportElements(),
                fileName: options.fileName,
                pdfData: pdfBase64,
            }),
        });
        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            if (response.ok) {
                throw new Error('Réponse JSON invalide du serveur.');
            }
        }
        if (!response.ok) {
            const message = payload?.error ?? 'Échec de la génération du PDF.';
            throw new Error(message);
        }
        if (!payload || typeof payload !== 'object' || !payload.data) {
            throw new Error('Réponse du serveur incomplète.');
        }
        return payload.data;
    }

    feedback(message) {
        if (!this.config.feedbackEl) return;
        const el = this.config.feedbackEl;
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => {
            el.classList.remove('is-visible');
        }, 2400);
    }
}

export function createPdfEditor(container, config) {
    return new PdfEditor(container, config);
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

export default PdfEditor;