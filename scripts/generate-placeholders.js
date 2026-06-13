import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(__dirname, "..", "public", "pages");
const totalPages = 12;

mkdirSync(pagesDir, { recursive: true });

const colors = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
  "#2d1b69", "#1b1b3a", "#1e1e3f", "#25254a",
  "#2a2a55", "#1f1f40", "#181835", "#151530",
];

const pageLabels = [
  "Portada", "Productos Destacados", "Línea Premium", "Novedades",
  "Colección Verano", "Ofertas Especiales", "Servicios", "Testimonios",
  "Catálogo Completo", "Contacto", "Términos", "Contraportada",
];

for (let i = 1; i <= totalPages; i++) {
  const bg = colors[(i - 1) % colors.length];
  const label = pageLabels[(i - 1) % pageLabels.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="596" height="843">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg}"/>
      <stop offset="100%" style="stop-color:#0b0e14"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="596" height="843" fill="url(#bg)"/>
  <rect width="596" height="843" fill="url(#grid)"/>
  <rect x="30" y="30" width="536" height="783" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <text x="298" y="380" text-anchor="middle" fill="#c7c4d7" font-family="Inter, sans-serif" font-size="28" font-weight="600">${label}</text>
  <text x="298" y="420" text-anchor="middle" fill="#908fa0" font-family="Inter, sans-serif" font-size="13">Página ${i}</text>
  <text x="298" y="790" text-anchor="middle" fill="#464554" font-family="Inter, sans-serif" font-size="10" font-weight="600" letter-spacing="2">CATÁLOGO PROFESIONAL 2026</text>
</svg>`;
  writeFileSync(join(pagesDir, `${i}.svg`), svg.trim());
  console.log(`Created page ${i}.svg`);
}

console.log(`\n✓ Generated ${totalPages} placeholder SVG pages in /public/pages/`);
