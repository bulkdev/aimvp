"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RemoveScroll } from "react-remove-scroll";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const SWIPE_THRESHOLD = 56;

function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}

type Props = {
  photos: string[];
  serviceType: string;
  initialSlide: number;
  onClose: () => void;
};

export default function PortfolioLightbox({ photos, serviceType, initialSlide, onClose }: Props) {
  const [slideIdx, setSlideIdx] = useState(initialSlide);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const wheelTargetRef = useRef<HTMLDivElement>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    setSlideIdx(initialSlide);
  }, [initialSlide]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [slideIdx]);

  /**
   * Do NOT use `position: fixed` on `document.body` to lock scroll — it makes `body` the
   * containing block for `position: fixed` descendants, so the lightbox `inset: 0` is
   * tied to the shifted body box instead of the viewport (modal appears offset / wrong).
   * `react-remove-scroll` locks document scroll without that bug.
   */

  useLayoutEffect(() => {
    const el = wheelTargetRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.12 : 0.12;
        setZoom((z) => clampZoom(z + delta));
      }
    };
    const onTouchMovePinch = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const ratio = dist / pinchRef.current.dist;
        setZoom(clampZoom(pinchRef.current.zoom * ratio));
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMovePinch, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMovePinch);
    };
  }, []);

  const goPrev = useCallback(() => {
    setSlideIdx((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setSlideIdx((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "+" || e.key === "=") setZoom((z) => clampZoom(z + 0.25));
      else if (e.key === "-" || e.key === "_") setZoom((z) => clampZoom(z - 0.25));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goNext, goPrev]);

  const isZoomed = zoom > 1.02;

  function onDoubleClickImage() {
    if (zoom > 1.01) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
      setPan({ x: 0, y: 0 });
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!isZoomed) return;
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || !isZoomed) return;
    const d = dragRef.current;
    setPan({
      x: d.originX + (e.clientX - d.startX),
      y: d.originY + (e.clientY - d.startY),
    });
  }

  function onPointerUp(e: React.PointerEvent) {
    draggingRef.current = false;
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      pinchRef.current = { dist, zoom };
      touchRef.current = null;
      return;
    }
    if (e.touches.length === 1 && !isZoomed) {
      const t = e.touches[0];
      touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinchRef.current = null;

    if (isZoomed || !touchRef.current || e.changedTouches.length !== 1) {
      touchRef.current = null;
      return;
    }
    const end = e.changedTouches[0];
    const start = touchRef.current;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    touchRef.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 0.7) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  const arrowBtnClass =
    "pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl ring-2 ring-black/20 transition hover:bg-slate-100 active:scale-95 sm:h-12 sm:w-12";

  const overlayClass =
    `${RemoveScroll.classNames.fullWidth} ${RemoveScroll.classNames.zeroRight} ` +
    "fixed inset-0 z-[10000] flex w-full max-w-[100vw] items-center justify-center overflow-hidden overscroll-none p-2 sm:p-5 " +
    "min-h-0 min-w-0 h-screen max-h-[100vh] supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]";

  const ui = (
    <RemoveScroll forwardProps allowPinchZoom noRelative enabled>
      <div
        data-portfolio-lightbox
        role="dialog"
        aria-modal="true"
        aria-label={`${serviceType} project photos`}
        className={overlayClass}
        style={{
          background: "rgba(2,6,23,0.88)",
          touchAction: "none",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
      >
      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[min(980px,calc(100vw-16px))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b1220] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="relative min-h-0 w-full flex-1">
          <div
            ref={wheelTargetRef}
            className="absolute inset-0 touch-none overflow-hidden bg-black/40"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden p-1 sm:p-0"
              style={{
                cursor: isZoomed ? (dragging ? "grabbing" : "grab") : "default",
                touchAction: isZoomed ? "none" : "manipulation",
              }}
            >
              <div
                style={{
                  transform,
                  transformOrigin: "center center",
                  transition: dragging ? "none" : "transform 0.12s ease-out",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onDoubleClick={onDoubleClickImage}
                className="flex max-h-full min-h-0 max-w-full min-w-0 items-center justify-center overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[slideIdx]}
                  alt={`${serviceType} project photo ${slideIdx + 1}`}
                  draggable={false}
                  className="box-border max-h-full max-w-full min-h-0 min-w-0 select-none object-contain"
                />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-1 sm:px-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className={arrowBtnClass}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-7 w-7" strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className={arrowBtnClass}
              aria-label="Next photo"
            >
              <ChevronRight className="h-7 w-7" strokeWidth={2.25} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-slate-950/90 text-2xl leading-none text-white shadow-lg hover:bg-slate-900"
            aria-label="Close gallery"
          >
            ×
          </button>

          <div className="absolute left-3 top-3 z-40 flex gap-1 rounded-full border border-white/20 bg-slate-950/90 p-1 shadow-lg">
            <button
              type="button"
              className="rounded-full px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
              aria-label="Zoom out"
              disabled={zoom <= ZOOM_MIN + 0.01}
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => clampZoom(z - 0.25));
              }}
            >
              −
            </button>
            <span className="flex min-w-[3rem] items-center justify-center text-xs tabular-nums text-white/90">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="rounded-full px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
              aria-label="Zoom in"
              disabled={zoom >= ZOOM_MAX - 0.01}
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => clampZoom(z + 0.25));
              }}
            >
              +
            </button>
          </div>

          <p className="pointer-events-none absolute bottom-3 left-1/2 z-40 max-w-[95%] -translate-x-1/2 rounded-full bg-slate-950/85 px-3 py-1 text-center text-xs text-white/90 shadow-md">
            <span className="tabular-nums">
              {slideIdx + 1} / {photos.length}
            </span>
            <span className="hidden text-white/55 sm:inline sm:ml-2">· Double-click · pinch · Ctrl+scroll</span>
          </p>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0b1220] px-4 py-3">
          <p className="mb-2 text-center text-sm font-medium text-white/90">{serviceType}</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to photo ${idx + 1}`}
                aria-current={idx === slideIdx}
                onClick={() => setSlideIdx(idx)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: idx === slideIdx ? 28 : 10,
                  background: idx === slideIdx ? "var(--accent)" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
    </RemoveScroll>
  );

  if (!portalEl) return null;
  return createPortal(ui, portalEl);
}
