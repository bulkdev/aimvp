/**
 * Mirrors react-easy-crop's getCropData() math so we can compute cropped pixels
 * after the parent has applied crop state (avoids stale props + no flushSync in lifecycles).
 * Ported from react-easy-crop@5.5.x index.module.mjs (rotation 0; same formulas).
 */
import type { Area, MediaSize, Point, Size } from "react-easy-crop";

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): Size {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function restrictPositionCoord(position: number, mediaSize: number, cropSize: number, zoom: number): number {
  const maxPosition = Math.abs((mediaSize * zoom) / 2 - cropSize / 2);
  return clamp(position, -maxPosition, maxPosition);
}

function restrictPosition(position: Point, mediaSize: Size, cropSize: Size, zoom: number, rotation = 0): Point {
  const { width, height } = rotateSize(mediaSize.width, mediaSize.height, rotation);
  return {
    x: restrictPositionCoord(position.x, width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, height, cropSize.height, zoom),
  };
}

function limitArea(max: number, value: number): number {
  return Math.min(max, Math.max(0, value));
}

function noOp(_max: number, value: number): number {
  return value;
}

function computeCroppedArea(
  crop: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  aspect: number,
  zoom: number,
  rotation = 0,
  restrictPos = true
): { croppedAreaPixels: Area } {
  const limitAreaFn = restrictPos ? limitArea : noOp;
  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const mediaNaturalBBoxSize = rotateSize(mediaSize.naturalWidth, mediaSize.naturalHeight, rotation);

  const croppedAreaPercentages = {
    x: limitAreaFn(
      100,
      ((mediaBBoxSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / mediaBBoxSize.width * 100
    ),
    y: limitAreaFn(
      100,
      ((mediaBBoxSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / mediaBBoxSize.height * 100
    ),
    width: limitAreaFn(100, (cropSize.width / mediaBBoxSize.width) * 100 * (1 / zoom)),
    height: limitAreaFn(100, (cropSize.height / mediaBBoxSize.height) * 100 * (1 / zoom)),
  };

  const widthInPixels = Math.round(
    limitAreaFn(mediaNaturalBBoxSize.width, (croppedAreaPercentages.width * mediaNaturalBBoxSize.width) / 100)
  );
  const heightInPixels = Math.round(
    limitAreaFn(mediaNaturalBBoxSize.height, (croppedAreaPercentages.height * mediaNaturalBBoxSize.height) / 100)
  );

  const isImgWiderThanHigh = mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;
  const sizePixels = isImgWiderThanHigh
    ? { width: Math.round(heightInPixels * aspect), height: heightInPixels }
    : { width: widthInPixels, height: Math.round(widthInPixels / aspect) };

  const croppedAreaPixels: Area = {
    ...sizePixels,
    x: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.width - sizePixels.width,
        (croppedAreaPercentages.x * mediaNaturalBBoxSize.width) / 100
      )
    ),
    y: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.height - sizePixels.height,
        (croppedAreaPercentages.y * mediaNaturalBBoxSize.height) / 100
      )
    ),
  };

  return { croppedAreaPixels };
}

/**
 * Same result as the cropper's internal getCropData().croppedAreaPixels for rotation 0.
 * `aspect` must match `Cropper`’s `getAspect()`: use the same `aspect` prop you pass to `<Cropper />`
 * (not `cropSize.width / cropSize.height` unless you also pass that as `cropSize`).
 */
export function getCroppedAreaPixelsForExport(
  crop: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  aspect: number,
  zoom: number,
  rotation = 0,
  restrictPos = true
): Area {
  const restricted = restrictPos ? restrictPosition(crop, mediaSize, cropSize, zoom, rotation) : crop;
  const { croppedAreaPixels } = computeCroppedArea(restricted, mediaSize, cropSize, aspect, zoom, rotation, restrictPos);
  return croppedAreaPixels;
}
