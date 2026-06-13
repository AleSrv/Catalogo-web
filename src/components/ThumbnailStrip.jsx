import { useRef, useEffect } from "react";
import { catalog } from "../data/catalog";

export default function ThumbnailStrip({ currentPage, onSelect }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.left < containerRect.left || elRect.right > containerRect.right) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentPage]);

  return (
    <div
      ref={scrollRef}
      className="shrink-0 flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-2.5 bg-surface/40 backdrop-blur-sm border-t border-white/5"
    >
      {Array.from({ length: catalog.totalPages }, (_, i) => i + 1).map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(page)}
            className={`shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
              isActive
                ? "border-primary shadow-lg shadow-primary/20 scale-105"
                : "border-transparent opacity-60 hover:opacity-90 hover:border-white/20"
            }`}
          >
            <div className="w-full h-full bg-surface-high flex items-center justify-center">
              <img
                src={`${catalog.imagePath}${page}.${catalog.imageFormat}`}
                alt={`${page}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<span class="text-[10px] text-outline font-medium">${page}</span>`;
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
