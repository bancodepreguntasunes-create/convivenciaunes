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
            (art.palabras_clave && art.palabras_clave.some(kw => normalizeText(kw).includes(q)));

        return matchesChapter && matchesSearch;
    });

    articlesCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}`;

    if (filtered.length === 0) {
        articlesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #FFF; border-radius: 16px; border: 1px dashed #CBD5E1;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: #94A3B8;">search_off</span>
                <h3 style="margin-top: 12px; color: #0A2A5C;">No se encontraron artículos</h3>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Intenta con otros términos o selecciona otro capítulo.</p>
            </div>`;
        return;
    }

    filtered.forEach(art => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.innerHTML = `
            <div class="card-top">
                <span class="category-tag">${art.capitulo.split(':')[0]} • ${art.seccion || 'Reglamento'}</span>
                <h3>${art.numero}: ${art.titulo}</h3>
                <p>${art.texto}</p>
            </div>
            <div class="card-bottom">
                <button class="btn-link read-more-btn" data-id="${art.id}">
                    Leer completo <span class="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>`;
        articlesGrid.appendChild(card);
    });

    document.querySelectorAll(".read-more-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            openModal(id);
        });
    });
}

// ============================================================
// MODAL
// ============================================================
function openModal(id) {
    const art = NORMAS.find(a => a.id === id);
    if (!art) return;
    selectedArticleForAsk = art;
    modalCategory.textContent = art.capitulo;
    modalTitle.textContent = `${art.numero}: ${art.titulo}`;
    modalContent.innerHTML = (art.texto || "").replace(/\n/g, "<br>");
    modalKeywords.innerHTML = "";
    if (art.palabras_clave && art.palabras_clave.length) {
        art.palabras_clave.forEach(kw => {
            const tag = document.createElement("span");
            tag.className = "keyword-tag";
            tag.textContent = kw;
            modalKeywords.appendChild(tag);
        });
    }
    articleModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    articleModal.style.display = "none";
    document.body.style.overflow = "";
    selectedArticleForAsk = null;
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.style.display = searchQuery.trim() !== "" ? "flex" : "none";
        renderArticles();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderArticles();
        searchInput.focus();
    });

    chaptersNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".chapter-btn");
        if (!btn) return;
        document.querySelectorAll(".chapter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentChapter = btn.getAttribute("data-cap");
        currentSectionTitle.textContent = currentChapter === "all"
            ? "Artículos de las Normas de Convivencia"
            : btn.textContent.trim();
        renderArticles();
    });

    closeModalBtn.addEventListener("click", closeModal);
    articleModal.addEventListener("click", (e) => {
        if (e.target === articleModal) closeModal();
    });

    modalAskBtn.addEventListener("click", () => {
        if (selectedArticleForAsk) {
            const q = `¿Qué dice el ${selectedArticleForAsk.numero}?`;
            closeModal();
            openChat();
            handleUserMessage(q);
        }
    });

    avatarTrigger.addEventListener("click", () => {
        if (chatWidget.style.display === "none" || !chatWidget.style.display) {
            openChat();
        } else {
            closeChat();
        }
    });

    closeChatBtn.addEventListener("click", closeChat);

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = "";
        handleUserMessage(text);
    });

    chatMessages.addEventListener("click", (e) => {
        const suggestBtn = e.target.closest(".suggest-btn");
        if (suggestBtn) handleUserMessage(suggestBtn.getAttribute("data-query"));
    });
}

// ============================================================
// CHAT
// ============================================================
function openChat() {
    chatWidget.style.display = "flex";
    avatarBubble.style.display = "none";
    notifBadge.style.display = "none";
    chatInput.focus();
    setAvatarMouth("smile");
}

function closeChat() {
    chatWidget.style.display = "none";
}

function setAvatarMouth(name) {
    if (avatarMouth && AVATAR_EXPRESSIONS[name]) {
        avatarMouth.setAttribute("d", AVATAR_EXPRESSIONS[name]);
    }
}

function playNotificationSound() {
    if (notifSound) notifSound.play().catch(() => {});
}

async function handleUserMessage(messageText) {
    const s = document.getElementById("chat-suggestions");
    if (s) s.remove();

    appendMessage(messageText, "user");
    showTypingIndicator(true);
    setAvatarMouth("thinking");

    let responseData = null;
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });
        if (res.ok) responseData = await res.json();
    } catch (e) { /* fallback */ }

    if (!responseData) responseData = localChatEngine(messageText);

    setTimeout(() => {
        showTypingIndicator(false);
        appendMessage(responseData.reply, "assistant", responseData.article, responseData.fallback);
        setAvatarMouth(responseData.mood || "smile");
        playNotificationSound();
    }, 800);
}

function appendMessage(text, sender, article = null, fallback = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    let formatted = (text || "").replace(/\n/g, "<br>");
    let bubble = `<div class="message-bubble">${formatted}`;
    if (article) {
        bubble += `<div class="chat-action-box">
            <button class="btn-chat-action secondary-btn read-article-chat-btn" data-id="${article.id}">
                <span class="material-symbols-outlined">menu_book</span> Leer ${article.numero} completo
            </button></div>`;
    }
    if (fallback) {
        bubble += `<div class="chat-action-box">
            <a href="${fallback.formLink}" target="_blank" class="btn-chat-action">
                <span class="material-symbols-outlined">assignment</span> Formulario de Asesorías
            </a>
            <a href="${fallback.emailLink}" class="btn-chat-action secondary-btn">
                <span class="material-symbols-outlined">mail</span> Enviar Correo
            </a></div>`;
    }
    bubble += `</div><span class="message-time">${formatTime(new Date())}</span>`;
    msgDiv.innerHTML = bubble;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const artBtn = msgDiv.querySelector(".read-article-chat-btn");
    if (artBtn) {
        artBtn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            openModal(id);
        });
    }
}

function showTypingIndicator(show) {
    typingIndicator.style.display = show ? "flex" : "none";
    if (show) {
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ============================================================
// MOTOR LOCAL DEL CHAT
// ============================================================
function localChatEngine(userQuery) {
    const q = normalizeText(userQuery);

    if (["hola", "buenas", "saludos", "unesito", "buenos dias", "buenas tardes"].some(g => q.includes(g))) {
        return {
            reply: "¡Hola! Soy **Unesito**, tu asistente virtual de las Normas de Convivencia UNES (Acuerdo N° 0000692). 👮‍♂️👋\n\n¿Sobre qué tema necesitas orientación hoy?",
            mood: "smile"
        };
    }

    if (["gracias", "excelente", "perfecto", "adios", "chao"].some(g => q.includes(g))) {
        return {
            reply: "¡A la orden siempre! Recuerda que cumplir nuestras normas fortalece la disciplina institucional. ¡Mucho éxito! 🌟📚",
            mood: "smile"
        };
    }

    const artMatch = q.match(/(?:articulo|art|articul)\s*(\d+)/);
    if (artMatch) {
        const num = parseInt(artMatch[1]);
        const target = NORMAS.find(n => n.id === num);
        if (target) {
            return {
                reply: `Según el **${target.numero}** del **${target.capitulo}**:\n\n"${target.texto}"`,
                article: target,
                mood: "smile"
            };
        }
        return {
            reply: `No encontré el artículo ${num} en la base actual.`,
            mood: "sad"
        };
    }

    let best = null, maxM = 0;
    const words = q.split(/\s+/).filter(w => w.length > 2);

    NORMAS.forEach(art => {
        let m = 0;
        (art.palabras_clave || []).forEach(kw => {
            if (q.includes(normalizeText(kw))) m += 2.5;
        });
        words.forEach(w => {
            if (normalizeText(art.titulo).includes(w)) m += 1.5;
            if (normalizeText(art.texto).includes(w)) m += 0.5;
        });
        if (m > maxM) { maxM = m; best = art; }
    });

    if (best && maxM >= 2.0) {
        return {
            reply: `Según el **${best.numero}** (**${best.capitulo}**):\n\n"${best.texto}"`,
            article: best,
            mood: "smile"
        };
    }

    return {
        reply: "Lo siento, no encontré información exacta. ¿Puedes reformular tu pregunta?\n\nEjemplos: *'¿Cuáles son las faltas leves?'*, *'¿Qué dice el artículo 90?'*",
        mood: "sad",
        fallback: {
            formLink: "https://forms.gle/9VAbMmq7XqdjMg6U6",
            emailLink: "mailto:asesoriaestudianteunes@gmail.com?subject=Consulta%20Normas"
        }
    };
}
