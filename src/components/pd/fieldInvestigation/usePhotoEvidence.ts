import { useState } from 'react';
import exifr from 'exifr';
import { api } from '../../../services/api';
import { savedList, savedString, type SavedApplicant } from '../savedValues';
import { parseManualGps, type FieldPhoto, type GpsPoint, type GpsSource } from './photoEvidence';

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

async function readExifGps(file: File): Promise<GpsPoint | null> {
  try {
    const gps = await exifr.gps(file);
    return gps?.latitude && gps?.longitude ? { latitude: gps.latitude, longitude: gps.longitude } : null;
  } catch (err) {
    console.error('EXIF extraction failed', err);
    return null;
  }
}

/** State for tab 5 "Field Investigation": geotagged photo evidence. */
export function usePhotoEvidence() {
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [exifGpsLat, setExifGpsLat] = useState('');
  const [exifGpsLng, setExifGpsLng] = useState('');

  /**
   * Upload photos into a category. Each photo takes its location from its own EXIF data, else from
   * the coordinates typed on the form, else it has none; nothing is filled in with defaults.
   */
  const uploadPhotos = async (files: File[], categoryTag: string) => {
    setIsUploadingPhoto(true);
    // Typed coordinates as they were when the upload started; EXIF hits below update the fields
    const manualPoint = parseManualGps(exifGpsLat, exifGpsLng);
    try {
      for (const file of files) {
        const exifPoint = await readExifGps(file);
        if (exifPoint) {
          setExifGpsLat(`${exifPoint.latitude.toFixed(4)}° N`);
          setExifGpsLng(`${exifPoint.longitude.toFixed(4)}° E`);
        }
        const point = exifPoint ?? manualPoint;
        const gpsSource: GpsSource | undefined = exifPoint ? 'photo' : manualPoint ? 'manual' : undefined;

        const dataUrl = await readAsDataUrl(file);
        let uploaded: Pick<FieldPhoto, 'id' | 'url' | 'caption'>;
        try {
          uploaded = await api.uploadPhoto(file.name, dataUrl, point?.latitude, point?.longitude);
        } catch (err) {
          // Keep the photo locally so the visit evidence isn't lost; it is saved with the applicant
          console.error('Photo upload failed; keeping local copy', err);
          uploaded = { id: crypto.randomUUID(), url: dataUrl, caption: file.name };
        }
        const photo: FieldPhoto = {
          id: uploaded.id,
          url: uploaded.url,
          caption: uploaded.caption,
          categoryTag,
          gpsCoordinates: point,
          gpsSource,
        };
        setPhotos((prev) => [...prev, photo]);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((photo) => photo.id !== id));

  const load = (app: SavedApplicant) => {
    setPhotos(savedList<FieldPhoto>(app.photos, []));
    setExifGpsLat(savedString(app.exifGpsLat));
    setExifGpsLng(savedString(app.exifGpsLng));
  };

  const values = { photos, exifGpsLat, exifGpsLng };

  return {
    ...values,
    values,
    isUploadingPhoto,
    setExifGpsLat,
    setExifGpsLng,
    uploadPhotos,
    removePhoto,
    load,
  };
}

export type PhotoEvidence = ReturnType<typeof usePhotoEvidence>;
