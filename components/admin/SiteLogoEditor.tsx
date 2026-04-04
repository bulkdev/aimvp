"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Cropper, { type Area, type MediaSize, type Size } from "react-easy-crop";
import {
  getCroppedImageDataUrl,
  loadImage,
  percentCropToPixelRect,
  rasterDataUrlToScaledPng,
} from "@/lib/cropImage";
import { getCroppedAreaPixelsForExport } from "@/lib/reactEasyCropExport";
import { fileToCompressedDataUrl, fileToRawDataUrl, getDataUrlNaturalSize } from "@/lib/clientImage";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Wide ratios first — tall ratios (4:3) clip horizontal wordmarks unless zoomed far out. */
const ASPECT_PRESETS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "3:1", value: 3 },
  { label: "21:9", value: 21 / 9 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:1", value: 2 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
];

/** Low floor so wide wordmarks can fit fully when defaulting to whole bitmap. */
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 4;

function isSvgDataUrl(url: string): boolean {
  return url.trimStart().toLowerCase().startsWith("data:image/svg+xml");
}

interface Props {
  /** Current logo (data URL) */
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Shown in alt text */
  brandLabel?: string;
  /** Surface errors (e.g. file too large) */
  onError?: (message: string) => void;
  /** Override default card title (e.g. renovations-only navbar logo). */
  heading?: string;
  /** Override default helper text under the title. */
  description?: string;
}

/**
 * Navbar logo: preview, upload with crop, re-crop existing, remove.
 */
export default function SiteLogoEditor({
  value,
  onChange,
  brandLabel = "Business",
  onError,
  heading = "Site logo (navbar & footer)",
  description = "Upload saves the whole image (scaled, max ~640px). Use “Crop…” only if you want to trim.",
}: Props) {
  /** `full` = entire file, no modal. `crop` = open react-easy-crop. */
  const uploadModeRef = useRef<"full" | "crop">("full");
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  /** Whole bitmap in natural pixels — passed to react-easy-crop as the default selection. */
  const [initialCroppedAreaPixels, setInitialCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  /** First arg to `onCropAreaChange` — percentages; export must use this (library pixel area is aspect-clamped). */
  const croppedPercentagesRef = useRef<Area | null>(null);
  const croppedPixelsRef = useRef<Area | null>(null);
  const mediaSizeRef = useRef<MediaSize | null>(null);
  const cropSizeRef = useRef<Size | null>(null);
  const cropSyncRef = useRef({ x: 0, y: 0 });
  const zoomSyncRef = useRef(1);
  /** Same instance as `<Cropper />` — `getCropData()` is the source of truth for export pixels. */
  const cropperRef = useRef<InstanceType<typeof Cropper> | null>(null);
  const [busy, setBusy] = useState(false);
  /** Measured crop frame — `aspect={undefined}` would fall back to react-easy-crop default 4/3, breaking "Free". */
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [containerAspect, setContainerAspect] = useState(16 / 9);
  /** Never pass `undefined` to Cropper — its default is 4/3. */
  const cropperAspect = aspect ?? containerAspect;

  useLayoutEffect(() => {
    if (!open) return;
    const el = cropContainerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setContainerAspect(r.width / r.height);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, imageSrc]);

  /** Keep in sync with React state after every commit (covers any missed callbacks). */
  useLayoutEffect(() => {
    cropSyncRef.current = crop;
    zoomSyncRef.current = zoom;
  }, [crop, zoom]);

  const syncCropPixels = useCallback((croppedAreaPercentages: Area, croppedAreaPixels: Area) => {
    croppedPercentagesRef.current = croppedAreaPercentages;
    croppedPixelsRef.current = croppedAreaPixels;
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropChange = useCallback((next: { x: number; y: number }) => {
    cropSyncRef.current = next;
    setCrop(next);
  }, []);

  const handleZoomChange = useCallback((z: number) => {
    zoomSyncRef.current = z;
    setZoom(z);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setImageSrc(null);
    setInitialCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    croppedPercentagesRef.current = null;
    croppedPixelsRef.current = null;
    mediaSizeRef.current = null;
    cropSizeRef.current = null;
    cropSyncRef.current = { x: 0, y: 0 };
    zoomSyncRef.current = 1;
  }, []);

  const applyCrop = useCallback(async () => {
    if (!imageSrc) return;
    setBusy(true);
    try {
      const image = await loadImage(imageSrc);
      const nw = image.naturalWidth;
      const nh = image.naturalHeight;
      const pct = croppedPercentagesRef.current;
      let pixels: Area | null = null;
      if (pct) {
        pixels = percentCropToPixelRect(pct, nw, nh);
        pixels.x = Math.max(0, Math.min(pixels.x, nw - 1));
        pixels.y = Math.max(0, Math.min(pixels.y, nh - 1));
        pixels.width = Math.max(1, Math.min(pixels.width, nw - pixels.x));
        pixels.height = Math.max(1, Math.min(pixels.height, nh - pixels.y));
      } else {
        const ms = mediaSizeRef.current;
        const cs = cropSizeRef.current;
        const exportAspect = cs && cs.height > 0 ? cs.width / cs.height : cropperAspect;
        pixels = cropperRef.current?.getCropData()?.croppedAreaPixels ?? null;
        if (!pixels && ms && cs) {
          pixels = getCroppedAreaPixelsForExport(
            cropSyncRef.current,
            ms,
            cs,
            exportAspect,
            zoomSyncRef.current,
            0,
            true
          );
        }
        if (!pixels) pixels = croppedPixelsRef.current ?? croppedAreaPixels;
      }
      if (!pixels) return;
      const dataUrl = await getCroppedImageDataUrl(imageSrc, pixels, {
        maxEdge: 640,
        mimeType: "image/png",
      });
      onChange(dataUrl);
      closeModal();
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not crop image.");
    } finally {
      setBusy(false);
    }
  }, [imageSrc, croppedAreaPixels, cropperAspect, onChange, closeModal, onError]);

  async function loadFileForCrop(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      onError?.("Logo must be under 4MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Choose an image file.");
      return;
    }
    if (file.type === "image/svg+xml") {
      const raw = await fileToCompressedDataUrl(file);
      onChange(raw);
      return;
    }
    // Raw data URL: no JPEG round-trip before cropping (keeps natural size + alpha; matches getCropData pixels).
    const dataUrl = await fileToRawDataUrl(file);
    const { width, height } = await getDataUrlNaturalSize(dataUrl);
    setInitialCroppedAreaPixels({ x: 0, y: 0, width, height });
    setImageSrc(dataUrl);
    setAspect(undefined);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    croppedPercentagesRef.current = null;
    croppedPixelsRef.current = null;
    mediaSizeRef.current = null;
    cropSizeRef.current = null;
    cropSyncRef.current = { x: 0, y: 0 };
    zoomSyncRef.current = 1;
    setOpen(true);
  }

  async function uploadFullLogo(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      onError?.("Logo must be under 4MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Choose an image file.");
      return;
    }
    if (file.type === "image/svg+xml") {
      const raw = await fileToCompressedDataUrl(file);
      onChange(raw);
      return;
    }
    const dataUrl = await fileToRawDataUrl(file);
    const out = await rasterDataUrlToScaledPng(dataUrl, 640);
    onChange(out);
  }

  async function openCropExisting() {
    if (!value?.trim()) return;
    if (isSvgDataUrl(value)) {
      onError?.("SVG logos can’t be cropped here — upload a PNG or JPG to crop, or replace the file.");
      return;
    }
    try {
      const { width, height } = await getDataUrlNaturalSize(value);
      setInitialCroppedAreaPixels({ x: 0, y: 0, width, height });
      setImageSrc(value);
      setAspect(undefined);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      croppedPercentagesRef.current = null;
      croppedPixelsRef.current = null;
      mediaSizeRef.current = null;
      cropSizeRef.current = null;
      cropSyncRef.current = { x: 0, y: 0 };
      zoomSyncRef.current = 1;
      setOpen(true);
    } catch {
      onError?.("Could not read the logo image.");
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-white">{heading}</h3>
          <p className="text-xs text-white/50 mt-1">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-14 max-w-[200px] object-contain rounded-lg bg-white/5 border border-white/10 p-1"
            />
          ) : (
            <div className="h-14 w-28 rounded-lg border border-dashed border-white/25 flex items-center justify-center text-xs text-white/40">
              No logo
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                uploadModeRef.current = "full";
                fileRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
            >
              Upload logo
            </button>
            <button
              type="button"
              onClick={() => {
                uploadModeRef.current = "crop";
                fileRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs"
            >
              Upload &amp; crop…
            </button>
            {value && !isSvgDataUrl(value) ? (
              <button
                type="button"
                onClick={() => void openCropExisting()}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs"
              >
                Crop current
              </button>
            ) : null}
            {value ? (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs text-rose-300"
              >
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                if (uploadModeRef.current === "full") {
                  await uploadFullLogo(f);
                } else {
                  await loadFileForCrop(f);
                }
              } catch (err) {
                onError?.(err instanceof Error ? err.message : "Could not read file.");
              }
            }}
          />
        </div>
      </div>

      {open && imageSrc && initialCroppedAreaPixels ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Crop logo for ${brandLabel}`}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-white">Crop logo</span>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/60 hover:text-white text-lg leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div ref={cropContainerRef} className="relative h-[min(56vh,400px)] w-full bg-black">
              <Cropper
                key={imageSrc}
                ref={cropperRef}
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropperAspect}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                initialCroppedAreaPixels={initialCroppedAreaPixels}
                onCropChange={handleCropChange}
                onZoomChange={handleZoomChange}
                onMediaLoaded={(ms) => {
                  mediaSizeRef.current = ms;
                }}
                setMediaSize={(ms) => {
                  mediaSizeRef.current = ms;
                }}
                onCropSizeChange={(cs) => {
                  cropSizeRef.current = cs;
                }}
                onCropAreaChange={syncCropPixels}
                showGrid
                objectFit="contain"
              />
            </div>

            <div className="p-4 space-y-3 border-t border-white/10">
              <p className="text-[11px] leading-snug text-white/45">
                <strong className="text-white/70">Default:</strong> the whole image is selected.{" "}
                <strong className="text-white/70">Apply</strong> saves it as-is, or change aspect / zoom first. Wide
                logos: try <span className="text-white/80">Free</span> or <span className="text-white/80">3:1</span> if
                you crop tighter.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAspect(p.value)}
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      aspect === p.value
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "border-white/20 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 text-xs text-white/70">
                Zoom (out ← → in)
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy || !croppedAreaPixels}
                  onClick={() => void applyCrop()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Apply crop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
