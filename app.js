/* =============================================
   BIBLIOTECA VIRTUAL LOUISE
   ============================================= */

const STORAGE_KEY = 'biblioteca_louise_books';

// --- State ---
let books = loadBooks();
let selectedRating = 0;
let selectedCover = '';
let pendingDeleteId = null;

// --- Rating Labels ---
const ratingLabels = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'];

// --- DOM ---
const $  = id => document.getElementById(id);
const addBookBtn      = $('addBookBtn');
const modalOverlay    = $('modalOverlay');
const closeModalBtn   = $('closeModal');
const bookSearch      = $('bookSearch');
const searchBtn       = $('searchBtn');
const searchBtnText   = $('searchBtnText');
const searchSpinner   = $('searchSpinner');
const searchResults   = $('searchResults');
const coverBox        = $('coverBox');
const bookTitle       = $('bookTitle');
const bookAuthor      = $('bookAuthor');
const starPicker      = $('starPicker');
const ratingLabel     = $('ratingLabel');
const saveBook        = $('saveBook');
const booksGrid       = $('booksGrid');
const emptyState      = $('emptyState');
const noFilterResults = $('noFilterResults');
const statsLabel      = $('statsLabel');
const sortBy          = $('sortBy');
const filterRating    = $('filterRating');
const searchAuthor    = $('searchAuthor');
const formError       = $('formError');
const deleteOverlay   = $('deleteOverlay');
const deleteMessage   = $('deleteMessage');

// =============================================
// INIT
// =============================================
render();
initStarPicker();

// =============================================
// EVENT LISTENERS
// =============================================
addBookBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

bookSearch.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });
searchBtn.addEventListener('click', triggerSearch);

saveBook.addEventListener('click', handleSave);

sortBy.addEventListener('change', render);
filterRating.addEventListener('change', render);
searchAuthor.addEventListener('input', render);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modalOverlay.classList.contains('hidden')) closeModal();
    if (!deleteOverlay.classList.contains('hidden')) cancelDelete();
  }
});

// =============================================
// MODAL OPEN / CLOSE
// =============================================
function openModal() {
  resetForm();
  modalOverlay.classList.remove('hidden');
  setTimeout(() => bookSearch.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function resetForm() {
  bookSearch.value = '';
  bookTitle.value = '';
  bookAuthor.value = '';
  selectedRating = 0;
  selectedCover = '';
  searchResults.classList.add('hidden');
  searchResults.innerHTML = '';
  coverBox.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
    <span>Capa</span>`;
  ratingLabel.textContent = 'Selecione uma nota';
  updateStarDisplay(0);
  hideError();
}

// =============================================
// STAR PICKER
// =============================================
function initStarPicker() {
  const stars = starPicker.querySelectorAll('.star-btn');

  stars.forEach(star => {
    const val = parseInt(star.dataset.value);

    star.addEventListener('click', () => {
      selectedRating = val;
      updateStarDisplay(val);
      ratingLabel.textContent = ratingLabels[val];
    });

    star.addEventListener('mouseenter', () => updateStarDisplay(val));
    star.addEventListener('mouseleave', () => updateStarDisplay(selectedRating));
  });
}

function updateStarDisplay(val) {
  starPicker.querySelectorAll('.star-btn').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.value) <= val);
  });
}

// =============================================
// SEARCH BOOKS (Google Books API)
// =============================================
async function triggerSearch() {
  const query = bookSearch.value.trim();
  if (!query) return;

  setSearchLoading(true);
  searchResults.classList.add('hidden');
  searchResults.innerHTML = '';

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&fields=items(volumeInfo(title,authors,imageLinks))`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    displayResults(data.items || []);
  } catch {
    searchResults.innerHTML = `<p class="results-message">Não foi possível buscar. Verifique sua conexão e tente novamente.</p>`;
    searchResults.classList.remove('hidden');
  } finally {
    setSearchLoading(false);
  }
}

function setSearchLoading(loading) {
  searchBtn.disabled = loading;
  searchBtnText.textContent = loading ? 'Buscando…' : 'Buscar';
  searchSpinner.classList.toggle('hidden', !loading);
}

function displayResults(items) {
  if (items.length === 0) {
    searchResults.innerHTML = `<p class="results-message">Nenhum livro encontrado. Preencha os campos manualmente.</p>`;
    searchResults.classList.remove('hidden');
    return;
  }

  searchResults.innerHTML = '';

  items.forEach(item => {
    const info = item.volumeInfo || {};
    const title = info.title || 'Sem título';
    const authors = info.authors ? info.authors.join(', ') : 'Autor desconhecido';
    const rawCover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    const cover = rawCover.replace(/^http:\/\//, 'https://');

    const el = document.createElement('div');
    el.className = 'result-item';

    const thumbHtml = cover
      ? `<img class="result-thumb" src="${cover}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.outerHTML='<div class=result-no-thumb>${escapeHtml(title[0])}</div>'">`
      : `<div class="result-no-thumb">${escapeHtml(title[0])}</div>`;

    el.innerHTML = `
      ${thumbHtml}
      <div class="result-info">
        <div class="result-title">${escapeHtml(title)}</div>
        <div class="result-author">${escapeHtml(authors)}</div>
      </div>`;

    el.addEventListener('click', () => selectResult(title, authors, cover));
    searchResults.appendChild(el);
  });

  searchResults.classList.remove('hidden');
}

function selectResult(title, author, cover) {
  bookTitle.value = title;
  bookAuthor.value = author;
  selectedCover = cover;

  if (cover) {
    coverBox.innerHTML = `<img src="${cover}" alt="${escapeHtml(title)}" onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:Playfair Display,serif;font-size:1.5rem;color:#c9a84c;\'>${escapeHtml(title[0])}</div>'">`;
  } else {
    coverBox.innerHTML = `<div style="font-family:'Playfair Display',serif;font-size:1.5rem;color:#c9a84c;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${escapeHtml(title[0])}</div>`;
  }

  searchResults.classList.add('hidden');
  hideError();
}

// =============================================
// SAVE BOOK
// =============================================
function handleSave() {
  const title = bookTitle.value.trim();
  const author = bookAuthor.value.trim();

  if (!title) { showError('Por favor, informe o título do livro.'); bookTitle.focus(); return; }
  if (!author) { showError('Por favor, informe o nome do autor.'); bookAuthor.focus(); return; }
  if (selectedRating === 0) { showError('Por favor, atribua uma nota ao livro.'); return; }

  const book = {
    id: Date.now(),
    title,
    author,
    cover: selectedCover,
    rating: selectedRating,
    dateAdded: new Date().toISOString(),
  };

  books.unshift(book);
  saveBooks();
  render();
  closeModal();
}

// =============================================
// DELETE BOOK
// =============================================
function requestDelete(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;
  pendingDeleteId = id;
  deleteMessage.textContent = `Remover "${book.title}" da sua biblioteca?`;
  deleteOverlay.classList.remove('hidden');
}

function cancelDelete() {
  pendingDeleteId = null;
  deleteOverlay.classList.add('hidden');
}

function confirmDelete() {
  if (pendingDeleteId !== null) {
    books = books.filter(b => b.id !== pendingDeleteId);
    saveBooks();
    render();
  }
  cancelDelete();
}

// Expose globally for inline onclick in rendered HTML
window.requestDelete = requestDelete;
window.cancelDelete = cancelDelete;
window.confirmDelete = confirmDelete;
window.clearFilters = clearFilters;

// =============================================
// RENDER
// =============================================
function render() {
  const filtered = getFilteredSorted();

  statsLabel.textContent = `${books.length} ${books.length === 1 ? 'livro' : 'livros'}`;

  if (books.length === 0) {
    booksGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    noFilterResults.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (filtered.length === 0) {
    booksGrid.innerHTML = '';
    noFilterResults.classList.remove('hidden');
    return;
  }

  noFilterResults.classList.add('hidden');
  booksGrid.innerHTML = filtered.map(renderCard).join('');
}

function renderCard(book) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star-display${i < book.rating ? ' filled' : ''}">★</span>`
  ).join('');

  const coverHtml = book.cover
    ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy"
           onerror="this.outerHTML='${noThumbHtml(book.title)}';">`
    : noThumbHtml(book.title);

  return `
    <article class="book-card">
      <div class="book-cover-wrap">
        ${coverHtml}
        <button class="delete-btn" onclick="requestDelete(${book.id})" title="Remover livro" aria-label="Remover ${escapeHtml(book.title)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="book-info">
        <div class="book-title-card">${escapeHtml(book.title)}</div>
        <div class="book-author-card">${escapeHtml(book.author)}</div>
        <div class="book-rating-display">${stars}</div>
      </div>
    </article>`;
}

function noThumbHtml(title) {
  const initial = (title && title[0]) ? escapeHtml(title[0].toUpperCase()) : '?';
  return `<div class="no-cover-placeholder"><div class="initial">${initial}</div></div>`;
}

// =============================================
// FILTER & SORT
// =============================================
function getFilteredSorted() {
  let list = [...books];

  const minRating = parseInt(filterRating.value);
  if (minRating > 0) list = list.filter(b => b.rating >= minRating);

  const authorQuery = searchAuthor.value.trim().toLowerCase();
  if (authorQuery) list = list.filter(b => b.author.toLowerCase().includes(authorQuery));

  switch (sortBy.value) {
    case 'title':      list.sort((a, b) => a.title.localeCompare(b.title, 'pt')); break;
    case 'titleDesc':  list.sort((a, b) => b.title.localeCompare(a.title, 'pt')); break;
    case 'author':     list.sort((a, b) => a.author.localeCompare(b.author, 'pt')); break;
    case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
    case 'ratingAsc':  list.sort((a, b) => a.rating - b.rating); break;
    // dateAdded: already sorted newest-first from unshift
  }

  return list;
}

function clearFilters() {
  sortBy.value = 'dateAdded';
  filterRating.value = '0';
  searchAuthor.value = '';
  render();
}

// =============================================
// PERSISTENCE
// =============================================
function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// =============================================
// HELPERS
// =============================================
function showError(msg) {
  formError.textContent = msg;
  formError.classList.remove('hidden');
}

function hideError() {
  formError.classList.add('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
