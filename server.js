// Servidor Express Backend para el Sistema Web Unesito (UNES - Acuerdo N° 0000692)
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Cargar Base de Datos de Normas
let NORMAS_DATA = [];
try {
    NORMAS_DATA = require('./data/normas.json');
    console.log(`[Base de Datos] ${NORMAS_DATA.length} artículos cargados correctamente.`);
} catch (error) {
    console.error("[Error] No se pudo cargar data/normas.json:", error.message);
}

// Auxiliar: Normalizar texto (quitar acentos y puntuación)
function normalizeText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "");
}

// ----------------------------------------------------
// ENDPOINTS API REST
// ----------------------------------------------------

// 1. GET /api/normas - Obtener todas las normas (opcionalmente filtradas por capítulo)
app.get('/api/normas', (req, res) => {
    const { capitulo } = req.query;
    if (capitulo) {
        const filtered = NORMAS_DATA.filter(n => n.capitulo_num === parseInt(capitulo));
        return res.json(filtered);
    }
    res.json(NORMAS_DATA);
});

// 2. GET /api/normas/:id - Obtener norma por ID
app.get('/api/normas/:id', (req, res) => {
    const norma = NORMAS_DATA.find(n => n.id === parseInt(req.params.id));
    if (!norma) {
        return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(norma);
});

// 3. GET /api/buscar?q=texto - Buscador global con resaltado
app.get('/api/buscar', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === "") {
        return res.json(NORMAS_DATA);
    }

    const cleanQ = normalizeText(q);
    const results = NORMAS_DATA.filter(n => {
        return normalizeText(n.numero).includes(cleanQ) ||
               normalizeText(n.titulo).includes(cleanQ) ||
               normalizeText(n.texto).includes(cleanQ) ||
               normalizeText(n.capitulo).includes(cleanQ) ||
               n.palabras_clave.some(kw => normalizeText(kw).includes(cleanQ));
    });

    res.json(results);
});

// 4. POST /api/chat - Procesamiento Inteligente de Preguntas para Unesito
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "El mensaje no puede estar vacío" });
    }

    const cleanQuery = normalizeText(message);

    // Saludos y cortesías
    if (["hola", "buenas", "buenos dias", "buenas tardes", "saludos", "unesito", "alo"].some(g => cleanQuery.includes(g))) {
        return res.json({
            reply: "¡Hola! Soy **Unesito**, tu asistente virtual estudiantil. 👮‍♂️👋\n\nPuedo orientarte sobre las Normas de Convivencia y Régimen Disciplinario de la UNES (Acuerdo N° 0000692).\n\n¿En qué te puedo ayudar hoy? Puedes preguntarme por artículos, faltas, derechos, deberes o uniforme.",
            mood: "smile",
            matchRate: 100
        });
    }

    if (["gracias", "excelente", "buenisimo", "perfecto", "adios", "chao"].some(g => cleanQuery.includes(g))) {
        return res.json({
            reply: "¡A la orden siempre! Recuerda que cumplir nuestras normas fortalece nuestra disciplina y valores institucionales. ¡Mucho éxito en tu formación! 🌟📚",
            mood: "smile",
            matchRate: 100
        });
    }

    // Comprobación de número de artículo explícito (ej. "articulo 90", "art 90", "articulo 18")
    const artMatch = cleanQuery.match(/(?:articulo|art|articul)\s*(\d+)/);
    if (artMatch) {
        const artNum = parseInt(artMatch[1]);
        const targetArt = NORMAS_DATA.find(n => n.id === artNum);
        if (targetArt) {
            return res.json({
                reply: `Según el **${targetArt.numero}** del **${targetArt.capitulo}**:\n\n"${targetArt.texto}"`,
                article: targetArt,
                mood: "smile",
                matchRate: 95
            });
        }
    }

    // Algoritmo de puntuación por palabras clave y semántica
    let bestArticle = null;
    let maxMatches = 0;
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);

    NORMAS_DATA.forEach(art => {
        let matches = 0;
        
        art.palabras_clave.forEach(kw => {
            const cleanKw = normalizeText(kw);
            if (cleanQuery.includes(cleanKw)) {
                matches += 2.5;
            }
        });

        queryWords.forEach(word => {
            if (normalizeText(art.titulo).includes(word)) matches += 1.5;
            if (normalizeText(art.texto).includes(word)) matches += 0.5;
        });

        if (matches > maxMatches) {
            maxMatches = matches;
            bestArticle = art;
        }
    });

    // Clasificación por nivel de coincidencia
    if (bestArticle && maxMatches >= 2.5) {
        // Coincidencia Alta (>70%)
        return res.json({
            reply: `Según el **${bestArticle.numero}** (**${bestArticle.capitulo}**):\n\n"${bestArticle.texto}"`,
            article: bestArticle,
            mood: "smile",
            matchRate: 85
        });
    } else if (bestArticle && maxMatches >= 1.5) {
        // Coincidencia Media (40-70%)
        return res.json({
            reply: `Encontré información relacionada en el **${bestArticle.numero}** (${bestArticle.titulo}) del **${bestArticle.capitulo}**:\n\n"${bestArticle.texto.substring(0, 220)}..."\n\n¿Te gustaría leer el artículo completo?`,
            article: bestArticle,
            mood: "smile",
            matchRate: 55
        });
    } else {
        // Coincidencia Baja (<40%) o tema fuera de reglamento (ej. inscripciones, becas, etc.)
        const isOutOfScope = ["inscripci", "beca", "vacacion", "pago", "inscrito", "cedula"].some(w => cleanQuery.includes(w));
        
        let fallbackText = "";
        if (isOutOfScope) {
            fallbackText = "Lo siento, esa información no está en las Normas de Convivencia y Régimen Disciplinario. ¿Podrías reformular tu pregunta? Puedo ayudarte con faltas, sanciones, derechos, deberes, uniforme, permisos o méritos.";
        } else {
            fallbackText = "Lo siento, no encontré esa información exacta en las Normas de Convivencia. ¿Podrías reformular tu pregunta? Por ejemplo: *'¿Cuáles son las faltas leves?'*, *'¿Qué dice el artículo 90?'* o *'¿Cuáles son mis derechos?'*";
        }

        return res.json({
            reply: fallbackText,
            mood: "sad",
            matchRate: 20,
            fallback: {
                formLink: "https://forms.gle/9VAbMmq7XqdjMg6U6",
                emailLink: "mailto:asesoriaestudianteunes@gmail.com?subject=Consulta%20Normas%20de%20Convivencia%20UNES"
            }
        });
    }
});

// Exportar para Vercel Serverless o iniciar servidor local
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`[Unesito Server] Servidor ejecutándose en http://localhost:${PORT}`);
    });
}
