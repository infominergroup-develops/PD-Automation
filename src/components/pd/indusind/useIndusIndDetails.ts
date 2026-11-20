import { useState } from 'react';
import { savedString, type SavedApplicant } from '../savedValues';

/**
 * Fields only the IndusInd Bank PD report asks for. Everything else in that report comes from the
 * shared PD form. Saved with the applicant under one `indusInd` key so they never clash with other lenders.
 */
export interface IndusIndDetails {
  srNo: string;
  branchName: string;
  coApplicantQualification: string;
  locatingPremises: string;
  maintenanceSetup: string;
  signBoard: string;
  businessProcess: string;
  grossMarginPct: string;
  netMarginPct: string;
  dedupCheck: string;
  /** Blank = derived from monthly sales ÷ working days. */
  dailyCashFlow: string;
  businessExpenses: string;
  vstsId: string;
  residenceLocality: string;
  otherProperty: string;
  vehicleDetails: string;
  neighbourVintage: string;
  affordableEmiApplicant: string;
  affordableEmiExecutive: string;
  synopsis: string;
}

export const INDUSIND_DEFAULTS: IndusIndDetails = {
  srNo: '',
  branchName: '',
  coApplicantQualification: '',
  locatingPremises: '',
  maintenanceSetup: '',
  signBoard: '',
  businessProcess: '',
  grossMarginPct: '',
  netMarginPct: '',
  dedupCheck: 'We have done dedup check, no record was found in database.',
  dailyCashFlow: '',
  businessExpenses: 'Not Shared',
  vstsId: 'Not Shared',
  residenceLocality: '',
  otherProperty: 'NA',
  vehicleDetails: 'NA',
  neighbourVintage: '',
  affordableEmiApplicant: 'As Per Bank',
  affordableEmiExecutive: 'As Per Bank',
  synopsis: '',
};

const FIELDS = Object.keys(INDUSIND_DEFAULTS) as Array<keyof IndusIndDetails>;

export function useIndusIndDetails() {
  const [values, setValues] = useState<IndusIndDetails>(INDUSIND_DEFAULTS);

  const setField = (field: keyof IndusIndDetails, value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  const load = (app: SavedApplicant) => {
    const saved = (app.indusInd && typeof app.indusInd === 'object' ? app.indusInd : {}) as Record<string, unknown>;
    setValues(
      Object.fromEntries(FIELDS.map((f) => [f, savedString(saved[f], INDUSIND_DEFAULTS[f])])) as unknown as IndusIndDetails,
    );
  };

  return { values, setField, load };
}

export type IndusIndDetailsForm = ReturnType<typeof useIndusIndDetails>;
