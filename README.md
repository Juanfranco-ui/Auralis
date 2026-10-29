# Auralis

<p align="center">
  <strong>Editorial web player for public domain audiobooks · Reproductor web editorial de audiolibros libres</strong><br>
  Powered by <a href="https://librivox.org">LibriVox.org</a> & hosted on <a href="https://archive.org">Internet Archive</a>
</p>

<p align="center">
  <a href="#español">Español</a> &middot; <a href="#english">English</a>
</p>

---

<a id="español"></a>
## Español

### ¿Qué es Auralis?
**Auralis** es una plataforma web y reproductor editorial de audiolibros de dominio público sin registros, sin muros de pago ni publicidad. Consume directamente los metadatos de la API abierta de **LibriVox** y transmite los archivos de audio MP3 alojados en **Internet Archive**. Su estética está inspirada en las publicaciones editoriales galardonadas en **Awwwards** (*Fraunces*, *Space Grotesk*, paleta coral/obsidiana y textura de grano analógico).

### Características Clave
- **Arquitectura Multi-Página & SEO**: Enrutamiento completo con URLs dedicadas para Catálogo (`/`), Buscador (`/buscar`), Mi Colección (`/coleccion`), Manifiesto (`/manifiesto`) y Fichas de libro individuales (`/libro/:id`), con etiquetas OpenGraph dinámicas y microdatos Schema.org (Audiobook).
- **Catálogo y Capítulos**: Consulta la API de LibriVox (`/api/feed/audiobooks`), resuelve listas completas de secciones con duración, títulos limpios y portadas en alta definición.
- **Buscador Híbrido**: Filtra por título, autor o idioma (Español / Inglés). Respaldo automático a la API de Internet Archive para búsquedas en español (*Don Quijote, Bécquer, Kafka, Verne, etc.*).
- **Motor de Audio HTML5**:
  - Salto temporal de **±15 segundos** y cambio de pista.
  - Interfaz móvil minimalista optimizada para pantallas táctiles.
  - Velocidad regulable (**0.75x a 2.0x**) y barra de progreso interactiva con tiempo restante.
  - **Temporizador de sueño** (*Sleep Timer*): 5, 15, 30, 45, 60 min o parada al final del capítulo.
  - Marcadores de tiempo con notas de texto personalizadas.
- **Persistencia Local (`localStorage`)**: Guarda la posición exacta para *Continuar escuchando*, la lista de *Favoritos* y los *Marcadores* sin necesidad de base de datos ni backend externo.

### Desarrollo Local
```bash
git clone https://github.com/Juanfranco-ui/Auralis.git
cd Auralis
npm install
npm run dev      # Inicia en http://localhost:3000
npm run build    # Compila en dist/ para producción
```

---

<a id="english"></a>
## English

### What is Auralis?
**Auralis** is an open-source, editorial web audiobook player for public-domain literature with no paywalls, accounts, or advertisements. It queries metadata directly from the **LibriVox** public API and streams direct MP3 audio files hosted on **Internet Archive**. The UI design draws from **Awwwards** editorial projects, pairing high-contrast serif typography (*Fraunces*) with geometric grotesque labels (*Space Grotesk*), a dark obsidian & coral palette, and an analog film grain overlay.

### Key Features
- **Multi-Page Architecture & SEO**: Full client-side routing with dedicated URLs for Catalog (`/`), Search (`/buscar`), My Collection (`/coleccion`), Manifesto (`/manifiesto`), and deep-linkable Book pages (`/libro/:id`) with dynamic OpenGraph meta tags and Schema.org structured data.
- **Catalog & Chapter Indexing**: Fetches from LibriVox feed (`/api/feed/audiobooks`), resolving full section tracks, reader credits, durations, and high-res cover art.
- **Hybrid Search Engine**: Query by title, author, or language (Spanish / English), backed by direct full-text search against the Internet Archive LibriVox collection.
- **HTML5 Audio Engine**:
  - **±15s quick seek** and previous/next chapter controls.
  - Clean, minimalist mobile player layout designed for quick thumb interaction.
  - Playback rate adjustment (**0.75x to 2.0x**) and progress scrubber with countdown.
  - **Sleep Timer**: 5, 15, 30, 45, 60 minutes or stop at end-of-chapter.
  - In-audio timestamped bookmarks with custom notes.
- **Client Persistence (`localStorage`)**: Auto-saves playback timestamp to *Continue Listening*, maintains *Favorites*, and stores user *Bookmarks* offline.

### Getting Started
```bash
git clone https://github.com/Juanfranco-ui/Auralis.git
cd Auralis
npm install
npm run dev      # Starts on http://localhost:3000
npm run build    # Builds client bundle into dist/
```

---

## Licencia / License & Credits

- MIT License.
- Audio recordings courtesy of [LibriVox](https://librivox.org/) volunteers.
- Audio streaming & hosting provided by [Internet Archive](https://archive.org/).
- Source texts from [Project Gutenberg](https://www.gutenberg.org/).
