// ============================================================
// Unesito - Frontend (UNES - Acuerdo N°0000692)
// ============================================================

let NORMAS = [];
let currentChapter = "all";
let searchQuery = "";
let selectedArticleForAsk = null;

const AVATAR_EXPRESSIONS = {
    smile: "M46 54 Q50 58 54 54",
    thinking: "M46 54 Q50 54 54 54",
    sad: "M46 56 Q50 53 54 56"
};

// DOM
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const chaptersNav = document.getElementById("chapters-nav");
const articlesGrid = document.getElementById("articles-grid");
const articlesCount = document.getElementById("articles-count");
const currentSectionTitle = document.getElementById("current-section-title");

const articleModal = document.getElementById("article-modal");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalKeywords = document.getElementById("modal-keywords");
const modalAskBtn = document.getElementById("modal-ask-btn");
const closeModalBtn = document.getElementById("close-modal");

const avatarBubble = document.getElementById("avatar-bubble");
const avatarTrigger = document.getElementById("avatar-trigger");
const chatWidget = document.getElementById("chat-widget");
const notifBadge = document.getElementById("notif-badge");
const closeChatBtn = document.getElementById("close-chat");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const typingIndicator = document.getElementById("typing-indicator");
const notifSound = document.getElementById("notif-sound");
const avatarMouth = document.getElementById("avatar-mouth");

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    loadNormasData();
    setupEventListeners();
    updateWelcomeTime();
});

function loadNormasData() {
    // 1) PRIORIDAD: Datos incrustados en index.html
    if (typeof NORMAS_DATA_INLINE !== 'undefined' && Array.isArray(NORMAS_DATA_INLINE) && NORMAS_DATA_INLINE.length > 0) {
        NORMAS = NORMAS_DATA_INLINE;
        console.log(`✅ ${NORMAS.length} artículos cargados desde index.html`);
        renderArticles();
        return;
    }

    // 2) FALLBACK: fetch a normas.json
    fetch('normas.json')
        .then(r => r.json())
        .then(data => {
            NORMAS = data;
            console.log(`✅ ${NORMAS.length} artículos cargados desde normas.json`);
            renderArticles();
        })
        .catch(() => {
            console.error("❌ No hay datos disponibles");
            articlesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #FFF; border-radius: 16px;">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: #EF4444;">error</span>
                    <h3 style="margin-top: 12px; color: #0A2A5C;">Error al cargar los artículos</h3>
                </div>`;
        });
}

// ============================================================
// UTILIDADES
// ============================================================
function updateWelcomeTime() {
    const wt = document.getElementById("welcome-time");
    if (wt) wt.textContent = formatTime(new Date());
}

function formatTime(date) {
    let h = date.getHours(), m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m} ${ampm}`;
}

function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡"']/g, "");
}

// ============================================================
// RENDERIZADO
// ============================================================
function renderArticles() {
    articlesGrid.innerHTML = "";

    const filtered = NORMAS.filter(art => {
        const matchesChapter =
            currentChapter === "all" ||
            art.capitulo_num === parseInt(currentChapter);

        const q = normalizeText(searchQuery);
        const matchesSearch =
            q === "" ||
            normalizeText(art.numero).includes(q) ||
            normalizeText(art.titulo).includes(q) ||
            normalizeText(art.texto).includes(q) ||
            normalizeText(art.capitulo).includes(q) ||
            normalizeText(art.seccion).includes(q) ||
            (art.palabras_clave && art.pal
