import { useState } from 'react';
import { savedList, savedString, type SavedApplicant } from '../savedValues';

export interface NoteItem {
  id: string;
  text: string;
}

/** Text fields specific to the Godrej Finance report. Keys are the saved field names. */
export interface GodrejTextFields {
  alternateMobileNumber: string;
  applicantQualification: string;
  officeAccessibility: string;
  tenorRequested: string;
  marginsAssessed: string;
  customerGstNo: string;
  industryType: string;
  productType: string;
  onLoanStructure: string;
  machineryDetailsText: string;
  keyEmployeeDetailsText: string;
  groupCompanyDetailsText: string;
  financialDetailsText: string;
  otherBusinessPremisesText: string;
  otherStateGstText: string;
  familyInvolvedText: string;
  godrejStockLevel: string;
  godrejRoughStockValue: string;
  godrejLocality: string;
  godrejOfficeSetup: string;
  godrejActivityLevel: string;
  godrejOfficeSize: string;
  godrejEmployeesSeen: string;
  godrejThirdPartyConfirmation: string;
  godrejCourtCasePending: string;
  godrejThirdPartyComment: string;
  godrejSeparateDemarcation: string;
  godrejGstDisplayed: string;
  godrejPanCard: string;
  godrejGstinLegalName: string;
  godrejBusinessRegProof: string;
  godrejGstinRegDate: string;
  godrejElectricityBill: string;
  godrejEmployeeRegister: string;
  godrejSaleBills: string;
  godrejOtherRecords: string;
  finalStatus: string;
}

export interface GodrejDetails extends GodrejTextFields {
  godrejStrengths: NoteItem[];
  godrejWeaknesses: NoteItem[];
}

/** Default "No. of employees seen" wording; the report swaps in the staff summary while it is unchanged. */
export const DEFAULT_EMPLOYEES_SEEN =
  'No external staff/labour is engaged. Business operations are managed by Applicant.';
/** Placeholder the report treats as "not filled in" for key employee details. */
export const EMPTY_KEY_EMPLOYEE_DETAILS = '✓ .';

const BLANK_TEXT: GodrejTextFields = {
  alternateMobileNumber: '',
  applicantQualification: '',
  officeAccessibility: '',
  tenorRequested: '',
  marginsAssessed: '',
  customerGstNo: '',
  industryType: '',
  productType: '',
  onLoanStructure: '',
  machineryDetailsText: '',
  keyEmployeeDetailsText: EMPTY_KEY_EMPLOYEE_DETAILS,
  groupCompanyDetailsText: '',
  financialDetailsText: '',
  otherBusinessPremisesText: '',
  otherStateGstText: '',
  familyInvolvedText: '',
  godrejStockLevel: '',
  godrejRoughStockValue: '',
  godrejLocality: '',
  godrejOfficeSetup: '',
  godrejActivityLevel: '',
  godrejOfficeSize: '',
  godrejEmployeesSeen: DEFAULT_EMPLOYEES_SEEN,
  godrejThirdPartyConfirmation: '',
  godrejCourtCasePending: '',
  godrejThirdPartyComment: '',
  godrejSeparateDemarcation: '',
  godrejGstDisplayed: '',
  godrejPanCard: '',
  godrejGstinLegalName: '',
  godrejBusinessRegProof: '',
  godrejGstinRegDate: '',
  godrejElectricityBill: '',
  godrejEmployeeRegister: '',
  godrejSaleBills: '',
  godrejOtherRecords: '',
  finalStatus: 'POSITIVE',
};

const TEXT_FIELDS = Object.keys(BLANK_TEXT) as Array<keyof GodrejTextFields>;
const BLANK: GodrejDetails = { ...BLANK_TEXT, godrejStrengths: [], godrejWeaknesses: [] };

/** State for the Godrej-specific parts of the Business Profile tab. */
export function useGodrejDetails() {
  const [values, setValues] = useState<GodrejDetails>(BLANK);

  const setField = <K extends keyof GodrejDetails>(field: K, value: GodrejDetails[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const load = (app: SavedApplicant) =>
    setValues({
      ...(Object.fromEntries(
        TEXT_FIELDS.map((field) => [field, savedString(app[field], BLANK_TEXT[field])]),
      ) as unknown as GodrejTextFields),
      godrejStrengths: savedList<NoteItem>(app.godrejStrengths, []),
      godrejWeaknesses: savedList<NoteItem>(app.godrejWeaknesses, []),
    });

  return {
    values,
    setField,
    setGodrejStrengths: (items: NoteItem[]) => setField('godrejStrengths', items),
    setGodrejWeaknesses: (items: NoteItem[]) => setField('godrejWeaknesses', items),
    load,
  };
}

export type GodrejDetailsForm = ReturnType<typeof useGodrejDetails>;
