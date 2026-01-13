const API_BASE_URL = 'admin_document_editor_api.php';

const listContainer = document.querySelector('[data-role="list"]');
const searchInput = document.querySelector('[data-role="search"]');
const feedbackEl = document.querySelector('[data-role="feedback"]');
const counterEl = document.querySelector('[data-role="counter"]');
const refreshBtn = document.querySelector('[data-action="refresh"]');

/** @type {Array<Record<string, any>>} */
let classCatalog = [];

function setFeedback(message, options = {}) {
    if (!feedbackEl) {
        return;
    }
    if (!message) {
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
        return;
    }
    feedbackEl.hidden = false;
    feedbackEl.textContent = message;
    feedbackEl.classList.toggle('is-error', options.error === true);
}

function updateCounter(count) {
    if (!counterEl) {
        return;
    }
    if (!count) {
        counterEl.textContent = 'Aucune classe';
        return;
    }
    counterEl.textContent = `${count} classe${count > 1 ? 's' : ''}`;
}

function formatMeta(item) {
    const parts = [];
    if (item.code) {
        parts.push(item.code);
    }
    const questionCount = Array.isArray(item.questions) ? item.questions.length : 0;
    parts.push(`${questionCount} question${questionCount > 1 ? 's' : ''}`);
    const autoCount = Array.isArray(item.autoSelections) ? item.autoSelections.length : 0;
    if (autoCount) {
        parts.push(`${autoCount} sélection${autoCount > 1 ? 's' : ''} auto`);
    }
    return parts.join(' • ');
}

function createBadge(label, variant) {
    const badge = document.createElement('span');
    badge.className = `qa-pill${variant ? ` qa-pill--${variant}` : ''}`;
    badge.textContent = label;
    return badge;
}

function createCard(item) {
    const card = document.createElement('article');
    card.className = 'qa-library-card';

    const header = document.createElement('div');
    header.className = 'qa-library-card__header';

    const textContainer = document.createElement('div');

    const title = document.createElement('h2');
    title.className = 'qa-library-card__title';
    title.textContent = item.title || 'Classe sans titre';
    textContainer.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'qa-library-card__meta';
    meta.textContent = formatMeta(item);
    textContainer.appendChild(meta);

    const documentInfo = document.createElement('p');
    documentInfo.className = 'qa-library-card__document';
    const docLabel = item.documentName || item.documentId || 'Non attribué';
    documentInfo.textContent = `Document : ${docLabel}`;
    textContainer.appendChild(documentInfo);

    header.appendChild(textContainer);

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'qa-library-card__badges';
    if (item.metadata && typeof item.metadata === 'object') {
        const { category, notes } = item.metadata;
        if (typeof category === 'string' && category.trim()) {
            badgeContainer.appendChild(createBadge(category.trim(), 'warning'));
        }
        if (typeof notes === 'string' && notes.trim()) {
            badgeContainer.appendChild(createBadge(notes.trim(), '')); // secondary badge
        }
    }
    if (badgeContainer.childElementCount) {
        header.appendChild(badgeContainer);
    }

    card.appendChild(header);

    if (item.description) {
        const description = document.createElement('p');
        description.className = 'qa-library-card__description';
        description.textContent = item.description;
        card.appendChild(description);
    }

    const actions = document.createElement('div');
    actions.className = 'qa-library-card__actions';

    const openBtn = document.createElement('a');
    openBtn.className = 'qa-btn qa-btn--primary';
    openBtn.textContent = 'Ouvrir dans l’éditeur';
    const params = new URLSearchParams();
    if (item.documentId) {
        params.set('document', item.documentId);
    }
    if (item.id) {
        params.set('class', item.id);
    }
    openBtn.href = `question_actions_manager.php?${params.toString()}`;
    openBtn.rel = 'noopener';
    actions.appendChild(openBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'qa-btn qa-btn--danger';
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', () => handleDelete(item));
    actions.appendChild(deleteBtn);

    card.appendChild(actions);

    return card;
}

function renderList(entries) {
    if (!listContainer) {
        return;
    }
    listContainer.innerHTML = '';
    if (!entries.length) {
        const empty = document.createElement('div');
        empty.className = 'qa-library-card__empty';
        empty.textContent = 'Aucune classe enregistrée pour le moment.';
        listContainer.appendChild(empty);
        updateCounter(0);
        return;
    }
    const fragment = document.createDocumentFragment();
    entries.forEach(item => {
        fragment.appendChild(createCard(item));
    });
    listContainer.appendChild(fragment);
    updateCounter(entries.length);
}

function normalize(value) {
    return (value ?? '').toString().trim().toLowerCase();
}

function applySearch() {
    if (!Array.isArray(classCatalog)) {
        classCatalog = [];
    }
    const term = normalize(searchInput?.value ?? '');
    if (!term) {
        renderList(classCatalog);
        return;
    }
    const filtered = classCatalog.filter(item => {
        const haystack = [
            item.title,
            item.code,
            item.documentName,
            item.documentId,
            item.description
        ].map(normalize).join(' ');
        return haystack.includes(term);
    });
    renderList(filtered);
}

async function loadClasses(showMessage = true) {
    if (showMessage) {
        setFeedback('Chargement des classes…');
    }
    try {
        const response = await fetch(`${API_BASE_URL}?action=listQuestionClasses`, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Réponse invalide du serveur.');
        }
        const payload = await response.json();
        if (payload?.success === false) {
            throw new Error(payload?.message || 'Impossible de récupérer les classes.');
        }
        const classes = Array.isArray(payload?.data?.classes) ? payload.data.classes : [];
        classCatalog = classes;
        setFeedback('');
        applySearch();
    } catch (error) {
        console.error('Erreur lors du chargement des classes', error);
        setFeedback(error.message || 'Impossible de récupérer les classes.', { error: true });
        renderList([]);
    }
}

async function handleDelete(item) {
    if (!item || !item.id) {
        return;
    }
    const title = item.title || item.code || item.id;
    const confirmed = window.confirm(`Supprimer définitivement la classe « ${title} » ? Cette action est irréversible.`);
    if (!confirmed) {
        return;
    }
    setFeedback(`Suppression de « ${title} »…`);
    try {
        const response = await fetch(`${API_BASE_URL}?action=deleteQuestionClass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classId: item.id })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.success === false) {
            throw new Error(payload?.message || 'La suppression a échoué.');
        }
        classCatalog = classCatalog.filter(entry => entry.id !== item.id);
        setFeedback(`Classe « ${title} » supprimée.`);
        applySearch();
    } catch (error) {
        console.error('Suppression impossible', error);
        setFeedback(error.message || 'Impossible de supprimer la classe.', { error: true });
    }
}

function initEvents() {
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applySearch();
        });
    }
    refreshBtn?.addEventListener('click', () => {
        loadClasses(false);
    });
}

function init() {
    initEvents();
    loadClasses(true);
}

init();