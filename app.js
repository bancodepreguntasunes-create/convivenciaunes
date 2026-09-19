// Lógica Frontend para el Sistema Web Unesito (UNES - Acuerdo N°0000692)

let NORMAS = [];
let currentChapter = "all";
let searchQuery = "";
let selectedArticleForAsk = null;

// Expresiones de boca SVG para Unesito
const AVATAR_EXPRESSIONS = {
    smile: "M46 54 Q50 58 54 54",
    thinking: "M46 54 Q50 54 54 54",
    sad: "M46 56 Q50 53 54 56"
};

// DOM Elements
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const chaptersNav = document.getElementById("chapters-nav");
const articlesGrid = document.getElementById("articles-grid");
const articlesCount = document.getElementById("articles-count");
const currentSectionTitle = document.getElementById("current-section-title");

// Modal Elements
const articleModal = document.getElementById("article-modal");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalKeywords = document.getElementById("modal-keywords");
const modalAskBtn = document.getElementById("modal-ask-btn");
const closeModalBtn = document.getElementById("close-modal");

// Chat Widget Elements
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

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    await loadNormasData();
    setupEventListeners();
    updateWelcomeTime();
});

// Cargar Base de Datos (Intenta /api/normas, y si no, carga data/normas.json)
async function loadNormasData() {
    try {
        const response = await fetch('/api/normas');
        if (response.ok) {
            NORMAS = await response.json();
        } else {
            throw new Error("Servidor API no disponible");
        }
    } catch (e) {
        console.log("Cargando base de datos estática local data/normas.json...");
        try {
            const localRes = await fetch('data/normas.json');
            NORMAS = await localRes.json();
        } catch (err) {
            console.error("Error al cargar normas:", err);
        }
    }
    renderArticles();
}

function updateWelcomeTime() {
    const welcomeTimeSpan = document.getElementById("welcome-time");
    if (welcomeTimeSpan) {
        welcomeTimeSpan.textContent = formatTime(new Date());
    }
}

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "");
}

// RENDERIZADO DE ARTÍCULOS
function renderArticles() {
    articlesGrid.innerHTML = "";

    const filtered = NORMAS.filter(art => {
        const matchesChapter = currentChapter === "all" || art.capitulo_num === parseInt(currentChapter);
        
        const q = normalizeText(searchQuery);
        const matchesSearch = q === "" || 
            normalizeText(art.numero).includes(q) ||
            normalizeText(art.titulo).includes(q) ||
            normalizeText(art.texto).includes(q) ||
            normalizeText(art.capitulo).includes(q) ||
            (art.palabras_clave && art.palabras_clave.some(kw => normalizeText(kw).includes(q)));

        return matchesChapter && matchesSearch;
    });

    articlesCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}`;

    if (filtered.length === 0) {
        articlesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #FFF; border-radius: 16px; border: 1px dashed #CBD5E1;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: #94A3B8;">search_off</span>
                <h3 style="margin-top: 12px; color: #0A2A5C;">No se encontraron artículos</h3>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Intenta buscando otros términos o selecciona otro capítulo en el menú lateral.</p>
            </div>
        `;
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
            </div>
        `;
        articlesGrid.appendChild(card);
    });

    document.querySelectorAll(".read-more-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const artId = parseInt(e.currentTarget.getAttribute("data-id"));
            openModal(artId);
        });
    });
}

// MODAL
function openModal(id) {
    const art = NORMAS.find(a => a.id === id);
    if (!art) return;

    selectedArticleForAsk = art;
    modalCategory.textContent = art.capitulo;
    modalTitle.textContent = `${art.numero}: ${art.titulo}`;
    modalContent.innerHTML = art.texto.replace(/\n/g, "<br>");
    
    modalKeywords.innerHTML = "";
    if (art.palabras_clave) {
        art.palabras_clave.forEach(kw => {
            const tag = document.createElement("span");
            tag.className = "keyword-tag";
            tag.textContent = kw;
            modalKeywords.appendChild(tag);
        });
    }

    articleModal.style.display = "flex";
}

function closeModal() {
    articleModal.style.display = "none";
    selectedArticleForAsk = null;
}

// EVENT LISTENERS
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
    });

    chaptersNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".chapter-btn");
        if (btn) {
            document.querySelectorAll(".chapter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentChapter = btn.getAttribute("data-cap");
            
            const capText = btn.textContent.trim();
            currentSectionTitle.textContent = currentChapter === "all" ? "Artículos de las Normas de Convivencia" : capText;
            renderArticles();
        }
    });

    closeModalBtn.addEventListener("click", closeModal);
    articleModal.addEventListener("click", (e) => {
        if (e.target === articleModal) closeModal();
    });

    modalAskBtn.addEventListener("click", () => {
        if (selectedArticleForAsk) {
            const question = `¿Qué dice el ${selectedArticleForAsk.numero}?`;
            closeModal();
            openChat();
            handleUserMessage(question);
        }
    });

    // CHATBOT WIDGET
    avatarTrigger.addEventListener("click", () => {
        if (chatWidget.style.display === "none") {
            openChat();
        } else {
            closeChat();
        }
    });

    closeChatBtn.addEventListener("click", closeChat);

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text === "") return;
        chatInput.value = "";
        handleUserMessage(text);
    });

    chatMessages.addEventListener("click", (e) => {
        if (e.target.classList.contains("suggest-btn")) {
            const query = e.target.getAttribute("data-query");
            handleUserMessage(query);
        }
    });
}

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

function setAvatarMouth(expressionName) {
    if (avatarMouth && AVATAR_EXPRESSIONS[expressionName]) {
        avatarMouth.setAttribute("d", AVATAR_EXPRESSIONS[expressionName]);
    }
}

function playNotificationSound() {
    notifSound.play().catch(() => {});
}

// PROCESAMIENTO DE MENSAJES EN CHAT
async function handleUserMessage(messageText) {
    const currentSuggestions = document.getElementById("chat-suggestions");
    if (currentSuggestions) currentSuggestions.remove();

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
        if (res.ok) {
            responseData = await res.json();
        }
    } catch (e) {
        console.log("Servidor API no detectado, usando motor local cliente...");
    }

    // Fallback local en cliente si no se conectó al backend Express
    if (!responseData) {
        responseData = localChatEngine(messageText);
    }

    setTimeout(() => {
        showTypingIndicator(false);
        appendMessage(responseData.reply, "assistant", responseData.article, responseData.fallback);
        setAvatarMouth(responseData.mood || "smile");
        playNotificationSound();
    }, 1000);
}

function appendMessage(text, sender, article = null, fallback = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    
    let formattedText = text.replace(/\n/g, "<br>");
    let bubbleContent = `<div class="message-bubble">${formattedText}`;

    if (article) {
        bubbleContent += `
            <div class="chat-action-box">
                <button class="btn-chat-action secondary-btn read-article-chat-btn" data-id="${article.id}">
                    <span class="material-symbols-outlined">menu_book</span> Leer ${article.numero} Completo
                </button>
            </div>
        `;
    }

    if (fallback) {
        bubbleContent += `
            <div class="chat-action-box">
                <a href="${fallback.formLink}" target="_blank" class="btn-chat-action">
                    <span class="material-symbols-outlined">assignment</span> Formulario de Asesorías
                </a>
                <a href="${fallback.emailLink}" class="btn-chat-action secondary-btn">
                    <span class="material-symbols-outlined">mail</span> Enviar Correo
                </a>
            </div>
        `;
    }

    bubbleContent += `</div><span class="message-time">${formatTime(new Date())}</span>`;
    msgDiv.innerHTML = bubbleContent;
    
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

// MOTOR LOCAL DE CHAT (FALLBACK SI SE EJECUTA SIN BACKEND EXPRESS RUNNING)
function localChatEngine(userQuery) {
    const cleanQuery = normalizeText(userQuery);

    if (["hola", "buenas", "saludos", "unesito"].some(g => cleanQuery.includes(g))) {
        return {
            reply: "¡Hola! Soy **Unesito**, tu asistente virtual de las Normas de Convivencia UNES (Acuerdo N° 0000692). 👮‍♂️👋\n\n¿Tienes alguna duda sobre faltas, sanciones, uniforme o tus derechos?",
            mood: "smile"
        };
    }

    const artMatch = cleanQuery.match(/(?:articulo|art|articul)\s*(\d+)/);
    if (artMatch) {
        const artNum = parseInt(artMatch[1]);
        const targetArt = NORMAS.find(n => n.id === artNum);
        if (targetArt) {
            return {
                reply: `Según el **${targetArt.numero}** del **${targetArt.capitulo}**:\n\n"${targetArt.texto}"`,
                article: targetArt,
                mood: "smile"
            };
        }
    }

    let bestArt = null;
    let maxMatches = 0;
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);

    NORMAS.forEach(art => {
        let matches = 0;
        if (art.palabras_clave) {
            art.palabras_clave.forEach(kw => {
                if (cleanQuery.includes(normalizeText(kw))) matches += 2.5;
            });
        }
        words.forEach(w => {
            if (normalizeText(art.titulo).includes(w)) matches += 1.5;
            if (normalizeText(art.texto).includes(w)) matches += 0.5;
        });
        if (matches > maxMatches) {
            maxMatches = matches;
            bestArt = art;
        }
    });

    if (bestArt && maxMatches >= 2.0) {
        return {
            reply: `Según el **${bestArt.numero}** (**${bestArt.capitulo}**):\n\n"${bestArt.texto}"`,
            article: bestArt,
            mood: "smile"
        };
    } else {
        return {
            reply: "Lo siento, no encontré esa información exacta en las Normas de Convivencia. ¿Podrías reformular tu pregunta? Por ejemplo: *'¿Cuáles son las faltas leves?'*, *'¿Qué dice el artículo 90?'* o *'¿Cuáles son los derechos de los estudiantes?'*",
            mood: "sad",
            fallback: {
                formLink: "https://forms.gle/9VAbMmq7XqdjMg6U6",
                emailLink: "mailto:asesoriaestudianteunes@gmail.com?subject=Consulta%20Normas%20de%20Convivencia%20UNES"
            }
        };
    }
}
