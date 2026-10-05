import React from 'react';
import { MapPin, Trash2, Upload } from 'lucide-react';
import { Field } from '../formControls';
import { PHOTO_CATEGORIES, describePhotoLocation, photoLocation } from './photoEvidence';
import type { PhotoEvidence } from './usePhotoEvidence';

const BADGE_TONES = {
  verified: 'bg-emerald-100 text-emerald-800',
  manual: 'bg-amber-100 text-amber-800',
  none: 'bg-slate-200 text-slate-600',
};

interface FieldInvestigationSectionProps {
  evidence: PhotoEvidence;
  footer: React.ReactNode;
}

/** Tab 5: geotagged photo evidence from the field visit, grouped by category. */
export const FieldInvestigationSection: React.FC<FieldInvestigationSectionProps> = ({ evidence, footer }) => {
  const { photos, isUploadingPhoto, exifGpsLat, exifGpsLng, setExifGpsLat, setExifGpsLng, uploadPhotos, removePhoto } =
    evidence;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#eb8a23]" />
            GPS Geotagged Field Inspection Proofs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Extracted GPS Latitude">
            <input
              type="text"
              value={exifGpsLat}
              onChange={(e) => setExifGpsLat(e.target.value)}
              placeholder="e.g. 26.9124"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
            />
          </Field>
          <Field label="Extracted GPS Longitude">
            <input
              type="text"
              value={exifGpsLng}
              onChange={(e) => setExifGpsLng(e.target.value)}
              placeholder="e.g. 75.7873"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
            />
          </Field>
        </div>
        <p className="text-[11px] text-slate-500 -mt-3">
          Each photo uses the GPS stored in the image; if it has none, the coordinates above are used and the photo is
          marked as manual GPS.
        </p>

        {PHOTO_CATEGORIES.map((category) => {
          const categoryPhotos = photos.filter((photo) => photo.categoryTag === category);
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700">{category}</h4>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded text-[10px] font-bold transition shadow-sm cursor-pointer">
                  {isUploadingPhoto ? (
                    <span className="animate-pulse">Uploading...</span>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 text-white" />
                      Upload {category}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          e.target.value = '';
                          if (files.length > 0) uploadPhotos(files, category);
                        }}
                      />
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPhotos.length === 0 ? (
                  <div className="col-span-full p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">No {category.toLowerCase()} uploaded yet</p>
                  </div>
                ) : (
                  categoryPhotos.map((photo) => {
                    const location = photoLocation(photo);
                    const badge = describePhotoLocation(photo);
                    return (
                      <div
                        key={photo.id}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative group"
                      >
                        <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="p-2 flex flex-col gap-1 text-[10px]">
                          <div className="font-bold text-[#2d3e50] truncate">{photo.caption}</div>
                          <div className="text-slate-500 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              {location
                                ? `GPS: ${location.point.latitude.toFixed(4)}, ${location.point.longitude.toFixed(4)}`
                                : 'GPS: not available'}
                            </span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${BADGE_TONES[badge.tone]}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
};
