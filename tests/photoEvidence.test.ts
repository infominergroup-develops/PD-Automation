import { describe, expect, it } from 'vitest';
import {
  describePhotoLocation,
  parseManualGps,
  photoLocation,
  type FieldPhoto,
} from '../src/components/pd/fieldInvestigation/photoEvidence';
import {
  describeCoApplicantPremises,
  toCoApplicantBusinessReport,
} from '../src/components/pd/coApplicantBusiness/useCoApplicantBusiness';

const photo = (overrides: Partial<FieldPhoto>): FieldPhoto => ({
  id: 'p1',
  url: 'data:image/jpeg;base64,x',
  caption: 'shop.jpg',
  categoryTag: 'BUSINESS VISIT PHOTO',
  ...overrides,
});

describe('photo location', () => {
  it('labels coordinates by where they came from', () => {
    const point = { latitude: 27.18, longitude: 78.01 };
    expect(describePhotoLocation(photo({ gpsCoordinates: point, gpsSource: 'photo' })).label).toBe('GPS FROM PHOTO');
    expect(describePhotoLocation(photo({ gpsCoordinates: point, gpsSource: 'manual' })).label).toBe('MANUAL GPS');
    expect(describePhotoLocation(photo({ gpsCoordinates: null })).label).toBe('NO GPS');
  });

  it('never calls older photos verified, since their coordinates may have been placeholders', () => {
    const legacy = photo({ gpsCoordinates: { latitude: 28.61, longitude: 77.2 } });
    expect(describePhotoLocation(legacy)).toEqual({ label: 'GPS SOURCE UNKNOWN', tone: 'none' });
  });

  it('reads the older `gps` shape and ignores incomplete coordinates', () => {
    expect(photoLocation(photo({ gps: { lat: 26.9, lng: 75.8 } }))?.point).toEqual({ latitude: 26.9, longitude: 75.8 });
    expect(photoLocation(photo({ gpsCoordinates: { latitude: 26.9, longitude: NaN } }))).toBeNull();
  });

  it('parses typed coordinates, including the "° N" form the EXIF reader writes', () => {
    expect(parseManualGps('26.9124° N', '75.7873° E')).toEqual({ latitude: 26.9124, longitude: 75.7873 });
    expect(parseManualGps('26.9', '')).toBeNull();
  });
});

describe('co-applicant business report fields', () => {
  it('prints readable premises text and "Not provided" for blanks', () => {
    const report = toCoApplicantBusinessReport({
      coApplicantBusinessName: 'Verma Dairy',
      coApplicantBusinessPremiseOwnership: 'RESIDENCE_CUM_BUSINESS',
      coApplicantBusinessVintage: '',
      coApplicantBriefBusinessProfile: '',
      coApplicantStaffCount: '',
      coApplicantFactoryInfrastructure: '',
      coApplicantStockDetailsValue: '',
      coApplicantFixedAndCurrentAssetAnalysis: '',
      coApplicantAssetCreationThroughBusiness: '',
      coApplicantInitialBusinessInvestment: '',
      coApplicantAgriculturalIncomeDetails: '',
      coApplicantOtherSourceIncomeDetails: '',
      coApplicantOperationalSavingAnalysis: '',
      coApplicantPreviousOccupation: 'Not Applicable',
      coApplicantReasonToLeave: '',
    });
    expect(report.coApplicantBusinessName).toBe('Verma Dairy');
    expect(report.coApplicantBusinessPremiseOwnership).toBe('Residence cum Business');
    expect(report.coApplicantBusinessVintage).toBe('Not provided');
  });

  it('keeps free-text premises saved by older versions', () => {
    expect(describeCoApplicantPremises('Self-Owned')).toBe('Self-Owned');
  });
});
