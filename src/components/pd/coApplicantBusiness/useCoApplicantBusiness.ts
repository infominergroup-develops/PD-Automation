import { useState } from 'react';
import { savedString, type SavedApplicant } from '../savedValues';

/** Tab 5.1 "Co-App Business": the co-applicant's own business visit. Keys are the saved field names. */
export interface CoApplicantBusiness {
  coApplicantBusinessName: string;
  coApplicantBusinessPremiseOwnership: string;
  coApplicantBusinessVintage: string;
  coApplicantBriefBusinessProfile: string;
  coApplicantStaffCount: string;
  coApplicantFactoryInfrastructure: string;
  coApplicantStockDetailsValue: string;
  coApplicantFixedAndCurrentAssetAnalysis: string;
  coApplicantAssetCreationThroughBusiness: string;
  coApplicantInitialBusinessInvestment: string;
  coApplicantAgriculturalIncomeDetails: string;
  coApplicantOtherSourceIncomeDetails: string;
  coApplicantOperationalSavingAnalysis: string;
  /** No input on the form yet; kept so saved values round-trip. */
  coApplicantPreviousOccupation: string;
  /** No input on the form yet; kept so saved values round-trip. */
  coApplicantReasonToLeave: string;
}

const BLANK: CoApplicantBusiness = {
  coApplicantBusinessName: '',
  coApplicantBusinessPremiseOwnership: '',
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
};

const FIELDS = Object.keys(BLANK) as Array<keyof CoApplicantBusiness>;

export const CO_APPLICANT_PREMISES_OPTIONS = [
  { value: 'RENTED', label: 'Rented Premises' },
  { value: 'OWN', label: 'Self Owned Premises' },
  { value: 'FAMILY', label: 'Family / Ancestral Owned' },
  { value: 'RESIDENCE_CUM_BUSINESS', label: 'Residence cum Business' },
];

/** Report wording for the saved premises code; older records may already hold free text. */
export const describeCoApplicantPremises = (value: string) =>
  CO_APPLICANT_PREMISES_OPTIONS.find((option) => option.value === value)?.label ?? value;

export function useCoApplicantBusiness() {
  const [values, setValues] = useState<CoApplicantBusiness>(BLANK);

  const setField = <K extends keyof CoApplicantBusiness>(field: K, value: CoApplicantBusiness[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const load = (app: SavedApplicant) =>
    setValues(
      Object.fromEntries(
        FIELDS.map((field) => [field, savedString(app[field], BLANK[field])]),
      ) as unknown as CoApplicantBusiness,
    );

  return { values, setField, load };
}

export type CoApplicantBusinessForm = ReturnType<typeof useCoApplicantBusiness>;

/** Report fields: every value present, blanks as "Not provided", premises as readable text. */
export function toCoApplicantBusinessReport(values: CoApplicantBusiness): CoApplicantBusiness {
  const report = Object.fromEntries(
    FIELDS.map((field) => [field, values[field] || 'Not provided']),
  ) as unknown as CoApplicantBusiness;
  if (values.coApplicantBusinessPremiseOwnership) {
    report.coApplicantBusinessPremiseOwnership = describeCoApplicantPremises(
      values.coApplicantBusinessPremiseOwnership,
    );
  }
  return report;
}
