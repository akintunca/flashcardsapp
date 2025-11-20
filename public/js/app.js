import { api } from './api.js';

// State
let words = [];
let activeWords = [];
let studyWords = []; // Words currently being studied (filtered)
let currentIndex = 0;
let isFlipped = false;
let currentFilter = { category: 'all', status: 'all', search: '' };
let studyFilter = { category: 'all', tag: 'all' };
let direction = localStorage.getItem('flashcard_direction') || 'pl-en'; // Load from storage
let theme = localStorage.getItem('flashcard_theme') || 'light'; // Load theme

// DOM Elements
const views = {
    flashcards: document.getElementById('view-flashcards'),
    manage: document.getElementById('view-manage')
};
const navBtns = {
    flashcards: document.getElementById('nav-flashcards'),
    manage: document.getElementById('nav-manage')
};

// Flashcard Elements
const flashcard = document.getElementById('flashcard');
const els = {
    polish: {
        word: document.getElementById('polish-word'),
        type: document.getElementById('polish-type'),
        pron: document.getElementById('polish-pronunciation'),
        ex: document.getElementById('polish-example'),
        tags: document.getElementById('polish-tags')
    },
    english: {
        word: document.getElementById('english-word'),
        type: document.getElementById('english-type'),
        pron: document.getElementById('english-pronunciation'),
        ex: document.getElementById('english-example'),
        tags: document.getElementById('english-tags')
    },
    progress: document.getElementById('progress'),
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn'),
    shuffle: document.getElementById('shuffleBtn')
};

// Management Elements
const listContainer = document.getElementById('word-list');
const modal = document.getElementById('word-modal');
const form = document.getElementById('word-form');
const importModal = document.getElementById('import-modal');

// Initialization
async function init() {
    await loadWords();
    setupEventListeners();
    renderCategories();
    updateFlashcardView();
}

async function loadWords() {
    try {
        words = await api.getWords();
        filterActiveWords();
        renderWordList();
        renderCategories();
        updateStudyFilters(); // Initialize study filter options

        // Set initial direction button text
        document.getElementById('btn-direction').textContent = direction === 'pl-en' ? '🇵🇱 ➔ 🇬🇧' : '🇬🇧 ➔ 🇵🇱';

        // Apply saved theme
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('btn-theme').textContent = theme === 'light' ? '🌓' : '☀️';
    } catch (err) {
        console.error('Failed to load words', err);
    }
}

function filterActiveWords() {
    activeWords = words.filter(w => w.active);
    applyStudyFilter();
}

function applyStudyFilter() {
    studyWords = activeWords.filter(w => {
        const matchCat = studyFilter.category === 'all' || w.category === studyFilter.category;
        const matchTag = studyFilter.tag === 'all' || (w.tags && w.tags.includes(studyFilter.tag));
        return matchCat && matchTag;
    });

    // Reset index if out of bounds
    if (currentIndex >= studyWords.length) currentIndex = 0;
    updateFlashcardView();
}

// Flashcard Logic
function updateFlashcardView() {
    if (studyWords.length === 0) {
        els.polish.word.textContent = "No words found";
        els.english.word.textContent = "Try changing filters";

        // Clear other fields
        els.polish.type.textContent = '';
        els.polish.pron.textContent = '';
        els.polish.ex.textContent = '';
        els.polish.tags.innerHTML = '';
        els.english.type.textContent = '';
        els.english.pron.textContent = '';
        els.english.ex.textContent = '';
        els.english.tags.innerHTML = '';

        els.progress.textContent = "0 of 0";
        return;
    }

    const card = studyWords[currentIndex];

    // Determine content based on direction
    const frontData = direction === 'pl-en' ?
        { word: card.polish, type: card.polishType, pron: card.polishPronunciation, ex: card.polishExample, tags: card.tags } :
        { word: card.english, type: card.englishType, pron: card.englishPronunciation, ex: card.englishExample, tags: card.tags };

    const backData = direction === 'pl-en' ?
        { word: card.english, type: card.englishType, pron: card.englishPronunciation, ex: card.englishExample, tags: card.tags } :
        { word: card.polish, type: card.polishType, pron: card.polishPronunciation, ex: card.polishExample, tags: card.tags };

    // Render Front
    els.polish.word.textContent = frontData.word;
    adjustFontSize(els.polish.word, frontData.word);
    els.polish.type.textContent = frontData.type || '';
    els.polish.pron.textContent = frontData.pron || '';
    els.polish.ex.textContent = frontData.ex || '';
    renderTags(frontData.tags, els.polish.tags);

    // Render Back
    els.english.word.textContent = backData.word;
    adjustFontSize(els.english.word, backData.word);
    els.english.type.textContent = backData.type || '';
    els.english.pron.textContent = backData.pron || '';
    els.english.ex.textContent = backData.ex || '';
    renderTags(backData.tags, els.english.tags);

    els.progress.textContent = `Card ${currentIndex + 1} of ${studyWords.length}`;

    flashcard.classList.remove('flipped');
    isFlipped = false;

    els.prev.disabled = currentIndex === 0;
    els.next.disabled = currentIndex === studyWords.length - 1;
}

function adjustFontSize(element, text) {
    const length = text.length;
    if (length > 30) {
        element.style.fontSize = '1.5em';
    } else if (length > 20) {
        element.style.fontSize = '2em';
    } else if (length > 12) {
        element.style.fontSize = '2.5em';
    } else {
        element.style.fontSize = '3em';
    }
}

function renderTags(tags, container) {
    container.innerHTML = '';
    if (!tags) return;
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.textContent = tag;
        container.appendChild(span);
    });
}

// Management Logic
function renderWordList() {
    const filtered = words.filter(w => {
        const matchesSearch = w.polish.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
            w.english.toLowerCase().includes(currentFilter.search.toLowerCase());
        const matchesCat = currentFilter.category === 'all' || w.category === currentFilter.category;
        const matchesStatus = currentFilter.status === 'all' ||
            (currentFilter.status === 'active' ? w.active : !w.active);
        return matchesSearch && matchesCat && matchesStatus;
    });

    listContainer.innerHTML = filtered.map(w => `
        <div class="word-item ${w.active ? '' : 'inactive'}">
            <div class="word-info">
                <h4>${w.polish} - ${w.english}</h4>
                <div class="word-meta">
                    <span>${w.category}</span>
                    <span>${w.tags ? w.tags.join(', ') : ''}</span>
                    <span>${w.active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            <div class="word-actions">
                <button class="btn-icon" onclick="window.editWord('${w.id}')">✏️</button>
                <button class="btn-icon" onclick="window.toggleActive('${w.id}')" title="${w.active ? 'Deactivate' : 'Activate'}">
                    ${w.active ? '👁️' : '🚫'}
                </button>
                <button class="btn-icon delete" onclick="window.deleteWord('${w.id}', '${w.polish}', '${w.english}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const categories = [...new Set(words.map(w => w.category || 'General'))];
    const select = document.getElementById('filter-category');
    const datalist = document.getElementById('categories-list');

    // Preserve selection if possible
    const currentVal = select.value;

    select.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');

    select.value = currentVal;

    datalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

function updateStudyFilters() {
    // Categories
    const categories = [...new Set(activeWords.map(w => w.category || 'General'))];
    const catSelect = document.getElementById('study-category');
    const currentCat = catSelect.value;

    catSelect.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
    catSelect.value = categories.includes(currentCat) ? currentCat : 'all';

    // Tags
    const allTags = activeWords.flatMap(w => w.tags || []);
    const uniqueTags = [...new Set(allTags)];
    const tagSelect = document.getElementById('study-tag');
    const currentTag = tagSelect.value;

    tagSelect.innerHTML = '<option value="all">All Tags</option>' +
        uniqueTags.map(t => `<option value="${t}">${t}</option>`).join('');
    tagSelect.value = uniqueTags.includes(currentTag) ? currentTag : 'all';
}

// Event Listeners
function setupEventListeners() {
    // Study Filters
    document.getElementById('study-category').addEventListener('change', (e) => {
        studyFilter.category = e.target.value;
        currentIndex = 0;
        applyStudyFilter();
    });

    document.getElementById('study-tag').addEventListener('change', (e) => {
        studyFilter.tag = e.target.value;
        currentIndex = 0;
        applyStudyFilter();
    });

    document.getElementById('btn-direction').addEventListener('click', (e) => {
        direction = direction === 'pl-en' ? 'en-pl' : 'pl-en';
        localStorage.setItem('flashcard_direction', direction); // Save to storage
        e.currentTarget.textContent = direction === 'pl-en' ? '🇵🇱 ➔ 🇬🇧' : '🇬🇧 ➔ 🇵🇱';
        updateFlashcardView();
    });

    document.getElementById('btn-theme').addEventListener('click', (e) => {
        theme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('flashcard_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        e.currentTarget.textContent = theme === 'light' ? '🌓' : '☀️';
    });

    // Navigation
    navBtns.flashcards.addEventListener('click', () => switchView('flashcards'));
    navBtns.manage.addEventListener('click', () => switchView('manage'));

    // Flashcard Controls
    flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    });

    els.prev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateFlashcardView();
        }
    });

    els.next.addEventListener('click', () => {
        if (currentIndex < studyWords.length - 1) {
            currentIndex++;
            updateFlashcardView();
        }
    });

    els.shuffle.addEventListener('click', () => {
        for (let i = studyWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studyWords[i], studyWords[j]] = [studyWords[j], studyWords[i]];
        }
        currentIndex = 0;
        updateFlashcardView();
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
        if (views.flashcards.classList.contains('active')) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) els.prev.click();
            if (e.key === 'ArrowRight' && currentIndex < studyWords.length - 1) els.next.click();
            if (e.key === ' ') {
                e.preventDefault();
                flashcard.click();
            }
        }
    });

    // Management Filters
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        renderWordList();
    });
    document.getElementById('filter-category').addEventListener('change', (e) => {
        currentFilter.category = e.target.value;
        renderWordList();
    });
    document.getElementById('filter-status').addEventListener('change', (e) => {
        currentFilter.status = e.target.value;
        renderWordList();
    });

    // Add Word Modal
    document.getElementById('btn-add-word').addEventListener('click', () => {
        openModal();
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            importModal.classList.remove('active');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            polish: document.getElementById('input-polish').value,
            english: document.getElementById('input-english').value,
            category: document.getElementById('input-category').value || 'General',
            tags: document.getElementById('input-tags').value.split(',').map(t => t.trim()).filter(t => t),
            polishType: document.getElementById('input-polish-type').value,
            polishPronunciation: document.getElementById('input-polish-pron').value,
            polishExample: document.getElementById('input-polish-ex').value,
            englishType: document.getElementById('input-english-type').value,
            englishPronunciation: document.getElementById('input-english-pron').value,
            englishExample: document.getElementById('input-english-ex').value,
            active: document.getElementById('input-active').checked
        };

        const id = document.getElementById('word-id').value;

        try {
            if (id) {
                await api.updateWord(id, formData);
            } else {
                await api.addWord(formData);
            }
            modal.classList.remove('active');
            await loadWords();
            updateFlashcardView();
        } catch (err) {
            alert('Error saving word');
        }
    });

    // Backup / Import
    document.getElementById('btn-backup').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "words_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('btn-import').addEventListener('click', () => {
        importModal.classList.add('active');
    });

    // Import Modal Logic
    const importRadios = document.getElementsByName('import-source');
    const fileSection = document.getElementById('import-section-file');
    const textSection = document.getElementById('import-section-text');

    importRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'file') {
                fileSection.style.display = 'block';
                textSection.style.display = 'none';
            } else {
                fileSection.style.display = 'none';
                textSection.style.display = 'block';
            }
        });
    });

    document.getElementById('btn-confirm-import').addEventListener('click', async () => {
        const source = document.querySelector('input[name="import-source"]:checked').value;
        const fileInput = document.getElementById('import-file');
        const textInput = document.getElementById('import-text');
        const mode = document.querySelector('input[name="import-mode"]:checked').value;

        let importedWords = null;

        try {
            if (source === 'file') {
                if (!fileInput.files.length) return alert('Please select a file');
                const text = await fileInput.files[0].text();
                importedWords = JSON.parse(text);
            } else {
                if (!textInput.value.trim()) return alert('Please paste JSON text');
                importedWords = JSON.parse(textInput.value);
            }

            if (!Array.isArray(importedWords)) throw new Error('JSON must be an array of words');

            await api.importWords(importedWords, mode);
            importModal.classList.remove('active');
            // Reset inputs
            fileInput.value = '';
            textInput.value = '';

            await loadWords();
            alert('Import successful!');
        } catch (err) {
            alert('Error importing: ' + err.message);
        }
    });
}

function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    Object.values(navBtns).forEach(b => b.classList.remove('active'));

    views[viewName].classList.add('active');
    navBtns[viewName].classList.add('active');
}

function openModal(word = null) {
    const title = document.getElementById('modal-title');
    const idInput = document.getElementById('word-id');

    if (word) {
        title.textContent = 'Edit Word';
        idInput.value = word.id;
        document.getElementById('input-polish').value = word.polish;
        document.getElementById('input-english').value = word.english;
        document.getElementById('input-category').value = word.category || 'General';
        document.getElementById('input-tags').value = (word.tags || []).join(', ');
        document.getElementById('input-polish-type').value = word.polishType || '';
        document.getElementById('input-polish-pron').value = word.polishPronunciation || '';
        document.getElementById('input-polish-ex').value = word.polishExample || '';
        document.getElementById('input-english-type').value = word.englishType || '';
        document.getElementById('input-english-pron').value = word.englishPronunciation || '';
        document.getElementById('input-english-ex').value = word.englishExample || '';
        document.getElementById('input-active').checked = word.active;
    } else {
        title.textContent = 'Add New Word';
        idInput.value = '';
        form.reset();
        document.getElementById('input-active').checked = true;
    }

    modal.classList.add('active');
}

// Expose functions to window for inline onclick handlers
window.editWord = (id) => {
    const word = words.find(w => w.id === id);
    if (word) openModal(word);
};

window.toggleActive = async (id) => {
    const word = words.find(w => w.id === id);
    if (word) {
        await api.updateWord(id, { active: !word.active });
        await loadWords();
        updateFlashcardView();
    }
};

window.deleteWord = async (id, polish, english) => {
    if (confirm(`Are you sure you want to delete "${polish} - ${english}"?`)) {
        try {
            await api.deleteWord(id);
            words = words.filter(w => w.id !== id);
            await loadWords();
            updateFlashcardView();
        } catch (err) {
            alert('Failed to delete word');
        }
    }
};

// Start
init();
