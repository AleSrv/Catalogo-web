import { useState } from "react";

export default function PageControls({ currentPage, totalPages, onPrev, onNext, onGoToPage }) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(inputValue, 10);
    if (p >= 1 && p <= totalPages) {
      onGoToPage(p);
    } else {
      setInputValue(String(currentPage));
    }
  };

  return (
    <div className="shrink-0 flex items-center justify-center gap-4 px-4 py-3 bg-surface/60 backdrop-blur-md border-t border-white/5">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-on-surface-variant cursor-pointer"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>navigate_before</span>
        <span className="hidden sm:inline text-xs font-medium">Anterior</span>
      </button>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-14 text-center bg-surface-high border border-outline-variant rounded-lg px-2 py-1 text-sm text-on-surface font-medium outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-outline text-sm font-medium">/ {totalPages}</span>
      </form>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-on-surface-variant cursor-pointer"
      >
        <span className="hidden sm:inline text-xs font-medium">Siguiente</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>navigate_next</span>
      </button>
    </div>
  );
}
