# Auralis

> Reproductor web editorial de audiolibros de dominio público, conectado a la API de LibriVox y respaldado por Internet Archive.

Auralis es una aplicación web diseñada para explorar y escuchar audiolibros clásicos sin muros de pago, cuentas de usuario obligatorias ni publicidad. Consume directamente los metadatos abiertos de **LibriVox.org** y reproduce el audio en streaming desde los servidores de **Internet Archive (archive.org)**.

Su diseño visual toma como referencia la tipografía editorial y el ritmo visual de publicaciones galardonadas en **Awwwards**, combinando la expresividad clásica de *Fraunces* con la precisión geométrica de *Space Grotesk*.

---

## Características Principales

- **Consumo de la API de LibriVox (`/api/feed/audiobooks`)**:
  - Consulta de metadatos por título, autor o género.
  - Resolución dinámica de capítulos, duraciones por sección y nombres de lectores voluntarios.
  - Carátulas en alta definición extraídas de Internet Archive y el catálogo de LibriVox.

- **Buscador Híbrido Multi-Criterio**:
  - Filtro por tipo de búsqueda (Título, Autor, General).
  - Filtro por idioma (Español, Inglés o Todo el catálogo).
  - Mecanismo de respaldo automático conectado al índice de búsqueda de Internet Archive para garantizar resultados en español (*Don Quijote, Bécquer, Cervantes, Kafka, etc.*).

- **Motor de Audio HTML5**:
  - Controles de transporte: *Play/Pausa*, saltos de pista (capítulo anterior/siguiente) y saltos temporales de **±15 segundos**.
  - Barra de progreso interactiva con arrastre (*scrubbing*) y cálculo de tiempo restante.
  - Modulación de velocidad de reproducción (0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x).
  - Temporizador de apagado (*Sleep Timer*) con opciones de 5, 15, 30, 45, 60 minutos o parada al final del capítulo.
  - Marcadores de tiempo con notas personalizadas para guardar fragmentos específicos.

- **Persistencia Local (`localStorage`)**:
  - **Continuar escuchando**: Recuerda el libro, capítulo y segundo exacto de la última reproducción.
  - **Favoritos**: Guardado de obras en la colección personal con un clic.
  - **Marcadores**: Índice de notas asociadas a marcas de tiempo navegables.

- **Diseño Editorial (Inspirado en Awwwards)**:
  - Tipografías: *Fraunces* (serif de alto contraste para títulos y citas) y *Space Grotesk* (grotesque para metadatos y navegación).
  - Paleta de color: Fondo tinta obsidiana (`#0C0A09` / `#12100E`), acento coral (`#FF9398`) y líneas capilares (`1px solid rgba(255,255,255,0.08)`).
  - Textura analógica: Capa CSS de grano sutil de película (*film grain overlay*).
  - Reproductor expandido inmersivo con visualizador acústico y disco analógico.

---

## Arquitectura Técnica

```
├── client (React 19 + TypeScript + Vite + Tailwind CSS v4)
│   ├── src/components/       # Componentes de UI (PlayerBar, BookCard, SearchBar, etc.)
│   ├── src/context/          # AudioPlayerContext (estado global del elemento <audio>)
│   ├── src/services/         # Cliente API con tolerancia a fallos y caché
│   └── src/types/            # Definiciones de TypeScript
│
├── server (Node.js + Express en server.ts)
│   ├── /api/feed/audiobooks  # Proxy directo a LibriVox API con caché en memoria
│   ├── /api/search           # Búsqueda unificada LibriVox + Internet Archive
│   ├── /api/book/:id         # Resolución detallada de capítulos y enlaces MP3
│   └── /api/featured         # Colección curada de clásicos universales
│
└── deployment / hosting
    ├── netlify.toml          # Configuración de build y redirecciones SPA
    └── public/_redirects     # Reglas de enrutamiento estático para Netlify
```

### Solución a Restricciones de CORS
La API pública de LibriVox no incluye cabeceras `Access-Control-Allow-Origin: *` por defecto para navegadores web. Para resolver esto:
1. En entornos con Node.js (desarrollo local / servidor Express), se utiliza el proxy `/api/feed/audiobooks` que consulta LibriVox del lado del servidor y agrega caché en memoria.
2. Para despliegues estáticos (como Netlify), `netlify.toml` incluye una regla de proxy inversa automática para `/api/feed/audiobooks` y el cliente incorpora llamadas directas con CORS habilitado hacia la API de Internet Archive como respaldo.

---

## Instalación y Desarrollo Local

### Requisitos
- Node.js 18 o superior
- npm o bun

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Juanfranco-ui/Auralis.git
   cd Auralis
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. Construir para producción:
   ```bash
   npm run build
   ```

---

## Despliegue en Netlify

El proyecto incluye la configuración lista en `netlify.toml` y `public/_redirects`.

### Pasos para desplegar:

1. Ve a [Netlify](https://app.netlify.com/) e inicia sesión con tu cuenta de GitHub.
2. Selecciona **"Add new site"** &rarr; **"Import an existing project"**.
3. Elige el repositorio **`Juanfranco-ui/Auralis`**.
4. Netlify detectará automáticamente la configuración:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Haz clic en **"Deploy Auralis"**.

Gracias al archivo `netlify.toml`, las rutas internas del cliente y el proxy hacia LibriVox e Internet Archive funcionarán sin configuración adicional.

---

## Créditos y Fuentes

- **Audiolibros**: [LibriVox.org](https://librivox.org/) — grabaciones en voz de voluntarios de dominio público.
- **Alojamiento y streaming de audio**: [Internet Archive](https://archive.org/) (colección `librivoxaudio`).
- **Textos fuente**: [Project Gutenberg](https://www.gutenberg.org/).
- **Tipografías**: [Fraunces](https://fonts.google.com/specimen/Fraunces) y [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) vía Google Fonts.

---

## Licencia

Código publicado bajo licencia MIT. Las grabaciones sonoras y las obras literarias pertenecen al Dominio Público.
