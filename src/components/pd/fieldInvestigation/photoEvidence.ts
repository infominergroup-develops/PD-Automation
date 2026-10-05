/** Field photos and where their location came from. Pure helpers, shared by the tab and the report. */

export const PHOTO_CATEGORIES = ['KYC PHOTOS', 'RESIDENCE VISIT PHOTO', 'BUSINESS VISIT PHOTO', 'BUSINESS DOCUMENTS'];

export interface GpsPoint {
  latitude: number;
  longitude: number;
}

/** `photo`: read from the image's EXIF data. `manual`: typed into the GPS fields on the form. */
export type GpsSource = 'photo' | 'manual';

export interface FieldPhoto {
  id: string;
  url: string;
  caption: string;
  categoryTag: string;
  gpsCoordinates?: GpsPoint | null;
  gpsSource?: GpsSource;
  /** Older saves stored coordinates here. */
  gps?: { lat: number; lng: number };
}

export interface PhotoLocation {
  point: GpsPoint;
  /** Undefined for photos saved before the source was recorded (their coordinates may be placeholders). */
  source?: GpsSource;
}

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function photoLocation(photo: FieldPhoto): PhotoLocation | null {
  const { gpsCoordinates, gps } = photo;
  if (gpsCoordinates && isNumber(gpsCoordinates.latitude) && isNumber(gpsCoordinates.longitude)) {
    return { point: gpsCoordinates, source: photo.gpsSource };
  }
  if (gps && isNumber(gps.lat) && isNumber(gps.lng)) {
    return { point: { latitude: gps.lat, longitude: gps.lng }, source: photo.gpsSource };
  }
  return null;
}

/** Coordinates typed on the form, e.g. "26.9124° N" or "26.9124"; null unless both parse. */
export function parseManualGps(latitude: string, longitude: string): GpsPoint | null {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : null;
}

/** Badge text and style for a photo's location. */
export function describePhotoLocation(photo: FieldPhoto): { label: string; tone: 'verified' | 'manual' | 'none' } {
  const location = photoLocation(photo);
  if (!location) return { label: 'NO GPS', tone: 'none' };
  if (location.source === 'photo') return { label: 'GPS FROM PHOTO', tone: 'verified' };
  if (location.source === 'manual') return { label: 'MANUAL GPS', tone: 'manual' };
  return { label: 'GPS SOURCE UNKNOWN', tone: 'none' };
}
