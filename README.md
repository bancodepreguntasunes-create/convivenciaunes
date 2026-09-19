# Unesito - Sistema Web y Asistente Virtual Estudiantil UNES

Sistema web interactivo y asistente virtual de las **Normas de Convivencia y Régimen Disciplinario** de la Universidad Nacional Experimental de la Seguridad (UNES), basado en el **Acuerdo N° 0000692 del 18 de julio de 2024**.

Elaborado por el **Vicerrectorado de Desarrollo Académico**.

---

## 🚀 Características Principal

- 📚 **Base de datos completa (141 artículos)**: Organizados en los 11 Capítulos del reglamento.
- 🔍 **Buscador global en tiempo real**: Filtra por número de artículo, título, sección o palabras clave.
- 🤖 **Chatbot "Unesito"**:
  - Responde consultas citando explícitamente número de artículo, capítulo y texto.
  - Distingue coincidencias altas, medias o bajas.
  - Detecta preguntas fuera del reglamento y solicita amigablemente la reformulación.
  - Accesos directos integrados al Formulario de Asesorías (`https://forms.gle/9VAbMmq7XqdjMg6U6`) y al correo (`asesoriaestudianteunes@gmail.com`).
- 🎨 **Diseño Institucional UNES**: Colores oficiales Azul Oscuro (`#0A2A5C`) y Dorado (`#C9A227`), responsive y accesible.

---

## 📁 Estructura del Proyecto

```
unes-normas-app/
├── data/
│   └── normas.json           # Base de datos con los 141 artículos de los 11 capítulos
├── public/
│   └── unes.png              # Logotipo oficial UNES
├── server.js                 # Servidor Backend Express & Endpoints API REST
├── vercel.json               # Configuración de despliegue Serverless en Vercel
├── index.html                # Interfaz de usuario Frontend
├── styles.css                # Estilos CSS y animaciones del avatar
├── app.js                    # Cliente Frontend y motor interactivo
├── package.json              # Configuración de dependencias (Express, Cors)
└── README.md                 # Manual de instalación y despliegue
```

---

## ⚙️ Cómo Ejecutar Localmente

### Opción 1: Ejecución Directa en Navegador (Sin instalar nada)
1. Navega a la carpeta `unes-normas-app`.
2. Haz doble clic en el archivo [index.html](file:///C:/Users/Usuario/.gemini/antigravity/scratch/unes-normas-app/index.html).
3. La aplicación funcionará instantáneamente en tu navegador predeterminado con la base de datos estática.

### Opción 2: Servidor Backend con Node.js / Express
Si deseas ejecutar la API REST localmente:
1. Abre tu terminal en la carpeta del proyecto.
2. Ejecuta:
   ```bash
   npm install
   node server.js
   ```
3. Abre tu navegador en `http://localhost:3000`.

---

## 🌐 Pasos para Desplegar Gratuitamente en Vercel

Desplegar Unesito en Vercel es muy sencillo y **totalmente gratuito**.

### Opción A: Desde la Página Web de Vercel (Recomendado - 2 minutos)
1. Sube tu código a un repositorio de **GitHub**, **GitLab** o **Bitbucket**.
2. Ingresa a [Vercel.com](https://vercel.com) e inicia sesión con tu cuenta.
3. Haz clic en el botón **"Add New..."** -> **"Project"**.
4. Selecciona tu repositorio de Unesito de la lista.
5. Vercel detectará automáticamente la configuración de `vercel.json`. Haz clic en **"Deploy"**.
6. ¡Listo! En segundos tendrás tu enlace público oficial (ej. `https://unesito-app.vercel.app`).

### Opción B: Mediante Vercel CLI (Línea de comandos)
1. Abre tu consola de comandos en la carpeta del proyecto.
2. Ejecuta simplemente:
   ```bash
   npx vercel
   ```
3. Responde **`y`** a las preguntas de confirmación que aparecerán en la consola.
4. Al finalizar, la consola te mostrará el enlace web de tu sitio publicado.

---

## ❓ Preguntas Frecuentes de Interacción

- **¿Qué pasa si llego tarde a clase?**  
  *Unesito*: Cita el **Artículo 90, numeral 12** (Falta leve, 15 puntos de demérito).
- **¿Qué es el demérito?**  
  *Unesito*: Explica el **Artículo 44 y 30** (Disminución de puntos de mérito sobre la base de 400 puntos).
- **¿Cuáles son las faltas graves?**  
  *Unesito*: Cita el **Artículo 91** (30 puntos de demérito, inasistencias, celulares en clase, etc.).
