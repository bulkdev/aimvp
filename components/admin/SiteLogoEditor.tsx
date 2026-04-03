"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageDataUrl } from "@/lib/cropImage";
import { fileToCompressedDataUrl } from "@/lib/clientImage";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const ASPECT_PRESETS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
];

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
}

/**
 * Navbar logo: preview, upload with crop, re-crop existing, remove.
 */
export default function SiteLogoEditor({ value, onChange, brandLabel = "Business", onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels, {
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
  }, [imageSrc, croppedAreaPixels, onChange, closeModal, onError]);

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
    const dataUrl = await fileToCompressedDataUrl(file, { maxEdge: 2400, quality: 0.9 });
    setImageSrc(dataUrl);
    setAspect(1);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOpen(true);
  }

  function openCropExisting() {
    if (!value?.trim()) return;
    if (isSvgDataUrl(value)) {
      onError?.("SVG logos can’t be cropped here — upload a PNG or JPG to crop, or replace the file.");
      return;
    }
    setImageSrc(value);
    setAspect(1);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOpen(true);
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-white">Site logo (navbar & footer)</h3>
          <p className="text-xs text-white/50 mt-1">
            Upload a new image and crop it, or crop the current logo. Logos are saved as PNG (max ~640px) to keep saves fast.
          </p>
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
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
            >
              Upload &amp; crop
            </button>
            {value && !isSvgDataUrl(value) ? (
              <button
                type="button"
                onClick={openCropExisting}
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
                await loadFileForCrop(f);
              } catch (err) {
                onError?.(err instanceof Error ? err.message : "Could not read file.");
              }
            }}
          />
        </div>
      </div>

      {open && imageSrc ? (
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

            <div className="relative h-[min(50vh,320px)] w-full bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
                objectFit="contain"
              />
            </div>

            <div className="p-4 space-y-3 border-t border-white/10">
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
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
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
