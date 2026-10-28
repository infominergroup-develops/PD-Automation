/** Field photos and where their location came from. Pure helpers, shared by the tab and the report. */

/**
 * Photo upload sections, in the order the reports print them. `category` is the tag saved on each
 * photo (keep existing tags unchanged so older photos stay in their section); `title` is the report heading.
 */
export const PHOTO_SECTIONS = [
  { category: 'KYC PHOTOS', title: 'KYC Photos' },
  { category: 'RESIDENCE VISIT PHOTO', title: 'Residence Visit Photos' },
  { category: 'BUSINESS VISIT PHOTO', title: 'Business Visit Photos' },
  { category: 'BUSINESS DOCUMENTS', title: 'Business Documents' },
  { category: 'OTHER BUSINESS', title: 'Other Business Photos' },
  { category: 'Collateral Photos', title: 'Collateral Photos' },
  { category: 'Collateral Documents', title: 'Collateral Documents' },
] as const;

export const PHOTO_CATEGORIES: string[] = PHOTO_SECTIONS.map((section) => section.category);

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
