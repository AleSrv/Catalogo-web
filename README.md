# Catálogo Web

Visor de catálogos interactivo con navegación por arrastre (drag), similar a un flipbook. Construido con React 19, Vite 8 y Tailwind CSS v4.

## Características

- Navegación por arrastre con mouse o táctil (deslizar páginas)
- Navegación por teclado (← →, Home, End)
- URLs con hash (`#page/1`, `#page/2`) — compatible con back/forward
- Click en laterales para avanzar/retroceder
- Miniaturas con scroll automático
- Pantalla completa
- Tema oscuro con diseño Stitch (periwinkle)
- Precarga de páginas adyacentes
- Responsive (móvil y desktop)

## Instalación

```bash
npm install
npm run dev
```

Abrir en `http://localhost:5173/#page/1`

## Agregar imágenes

1. Colocar imágenes en `public/pages/` como `1.jpg`, `2.jpg`, etc.
2. Configurar en `src/data/catalog.js`:

```js
imageFormat: "jpg",   // jpg, png, webp
totalPages: 52,
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run generate` | Generar placeholders SVG |

## Stack

- Vite 8 + React 19
- Tailwind CSS v4
- Inter + Material Symbols
- Pointer Events API (drag)
