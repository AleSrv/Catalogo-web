import { useState, useEffect, useCallback, useRef } from "react";
import { catalog } from "../data/catalog";
import PageControls from "./PageControls";
import ThumbnailStrip from "./ThumbnailStrip";

function getPageFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/^#page\/(\d+)$/);
  if (match) {
    const p = parseInt(match[1], 10);
    if (p >= 1 && p <= catalog.totalPages) return p;
  }
  return 1;
}

export default function CatalogViewer() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [isInertia, setIsInertia] = useState(false);

  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;

  const prevPageNum = currentPage > 1 ? currentPage - 1 : null;
  const nextPageNum = currentPage < catalog.totalPages ? currentPage + 1 : null;

  const pageUrl = useCallback((n) => `${catalog.imagePath}${n}.${catalog.imageFormat}`, []);

  const preloadAdjacent = useCallback((page) => {
    [page + 1, page + 2, page - 1, page - 2].forEach((p) => {
      if (p >= 1 && p <= catalog.totalPages) {
        const img = new Image();
        img.src = pageUrl(p);
      }
    });
  }, [pageUrl]);

  useEffect(() => { preloadAdjacent(currentPage); }, [currentPage, preloadAdjacent]);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", `#page/${currentPage}`);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const page = getPageFromHash();
      if (page !== pageRef.current) setCurrentPage(page);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); navigateByRef(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); navigateByRef(-1); }
      else if (e.key === "Home") { e.preventDefault(); navigateByRef("start"); }
      else if (e.key === "End") { e.preventDefault(); navigateByRef("end"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigateTo = useCallback((page) => {
    setDragX(0);
    setShowPrev(false);
    setShowNext(false);
    setIsInertia(false);
    setCurrentPage(page);
    window.location.hash = `#page/${page}`;
  }, []);

  const navigateByRef = useCallback((dir) => {
    const cur = pageRef.current;
    let target;
    if (dir === "start") target = 1;
    else if (dir === "end") target = catalog.totalPages;
    else target = cur + dir;
    if (target < 1 || target > catalog.totalPages) return;
    navigateTo(target);
  }, [navigateTo]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const drag = useRef({ active: false, startX: 0, startY: 0, dx: 0, moved: false });

  const commitNavigation = useCallback((dir, w, e) => {
    const cur = pageRef.current;
    const target = dir === 1 ? cur + 1 : cur - 1;
    if (target < 1 || target > catalog.totalPages) return;
    const endX = dir === 1 ? -w : w;
    setIsInertia(true);
    setDragX(endX);
    setTimeout(() => navigateTo(target), 300);
  }, [navigateTo]);

  const onPointerDown = (e) => {
    const d = drag.current;
    d.active = true;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.dx = 0;
    d.moved = false;
    setIsInertia(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    d.moved = true;
    d.dx = dx;

    const w = e.currentTarget.clientWidth;
    const cur = pageRef.current;
    const atStart = cur === 1;
    const atEnd = cur === catalog.totalPages;

    let x = dx;
    if ((dx > 0 && atStart) || (dx < 0 && atEnd)) x *= 0.2;
    setDragX(x);
    setShowPrev(dx > 5 && !atStart);
    setShowNext(dx < -5 && !atEnd);
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;

    if (!d.moved) {
      const w = e.currentTarget.clientWidth;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < w * 0.3 && pageRef.current > 1) navigateByRef(-1);
      else if (x > w * 0.7 && pageRef.current < catalog.totalPages) navigateByRef(1);
      setDragX(0);
      setShowPrev(false);
      setShowNext(false);
      return;
    }

    const w = e.currentTarget.clientWidth;
    if (d.dx < -w * 0.18 && pageRef.current < catalog.totalPages) {
      commitNavigation(1, w, e);
    } else if (d.dx > w * 0.18 && pageRef.current > 1) {
      commitNavigation(-1, w, e);
    } else {
      setIsInertia(true);
      setDragX(0);
      setShowPrev(false);
      setShowNext(false);
      setTimeout(() => { setIsInertia(false); }, 350);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-bg select-none">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-surface/80 backdrop-blur-md border-b border-white/5 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">menu_book</span>
          <div>
            <h1 className="text-sm font-semibold text-on-surface leading-tight">{catalog.title}</h1>
            <p className="text-[10px] text-outline uppercase tracking-widest font-semibold">{catalog.subtitle}</p>
          </div>
        </div>
        <button onClick={toggleFullscreen} className="p-2 rounded-xl hover:bg-surface-high transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant">
            {fullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
        </button>
      </header>

      <main
        className="flex-1 relative overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current.active = false; setDragX(0); setShowPrev(false); setShowNext(false); setIsInertia(false); }}
        style={{ touchAction: "pan-y" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
          <div className="relative w-full h-full flex items-center justify-center" style={{ maxWidth: "min(100%, calc(100dvh - 160px) * 0.707)", maxHeight: "calc(100% - 16px)" }}>
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "596 / 843" }}>

              {showPrev && prevPageNum && (
                <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ zIndex: 1 }}>
                  <PageImage page={prevPageNum} pageUrl={pageUrl(prevPageNum)} />
                </div>
              )}

              {showNext && nextPageNum && (
                <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ zIndex: 1 }}>
                  <PageImage page={nextPageNum} pageUrl={pageUrl(nextPageNum)} />
                </div>
              )}

              <div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{
                  zIndex: 2,
                  transform: `translateX(${dragX}px)`,
                  transition: isInertia ? "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease" : "none",
                  boxShadow: dragX
                    ? `${Math.min(dragX, 0) * 0.3}px 0 ${20 + Math.abs(dragX) * 0.15}px rgba(0,0,0,${0.3 + Math.abs(dragX) / 3000})`
                    : "0 4px 40px rgba(0,0,0,0.5), 0 0 80px rgba(192,193,255,0.05)",
                  willChange: "transform",
                }}
              >
                <PageImage page={currentPage} pageUrl={pageUrl(currentPage)} />
              </div>

            </div>
          </div>
        </div>

        <button
          onClick={() => navigateByRef(-1)}
          disabled={currentPage === 1}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-surface/70 backdrop-blur-md border border-white/10 text-on-surface-variant hover:bg-surface-high hover:text-on-surface transition-all disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer z-20"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <button
          onClick={() => navigateByRef(1)}
          disabled={currentPage === catalog.totalPages}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-surface/70 backdrop-blur-md border border-white/10 text-on-surface-variant hover:bg-surface-high hover:text-on-surface transition-all disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer z-20"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </main>

      <PageControls
        currentPage={currentPage}
        totalPages={catalog.totalPages}
        onPrev={() => navigateByRef(-1)}
        onNext={() => navigateByRef(1)}
        onGoToPage={(p) => navigateTo(p)}
      />

      <ThumbnailStrip
        currentPage={currentPage}
        totalPages={catalog.totalPages}
        onSelect={navigateTo}
      />
    </div>
  );
}

function PageImage({ page, pageUrl }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { setLoaded(false); setError(false); }, [pageUrl]);

  return (
    <>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-low rounded-lg">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={pageUrl}
        alt={`Página ${page}`}
        className={`w-full h-full object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setError(true); }}
        draggable={false}
      />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-low rounded-lg">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: 40 }}>image</span>
          <p className="text-on-surface-variant text-sm">Página {page}</p>
        </div>
      )}
    </>
  );
}
