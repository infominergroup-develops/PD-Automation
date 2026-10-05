import React, { useState } from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Field } from '../formControls';
import type { GodrejDetailsForm, GodrejTextFields } from './useGodrejDetails';

const INPUT_CLASS = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]';

interface FieldSpec {
  field: keyof GodrejTextFields;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

const CASE_FIELDS: FieldSpec[] = [
  { field: 'alternateMobileNumber', label: 'Alternate Mobile Number' },
  {
    field: 'applicantQualification',
    label: 'Person Met Qualification (Overrides Auto)',
    placeholder: 'e.g. 10th Pass, Graduate',
  },
  { field: 'officeAccessibility', label: 'Office Accessibility', placeholder: 'e.g. Easy, Difficult' },
  { field: 'tenorRequested', label: 'Tenor Requested', placeholder: 'e.g. 36 Months' },
  { field: 'marginsAssessed', label: 'Margins Assessed', placeholder: 'e.g. 20%' },
  { field: 'customerGstNo', label: 'Customer GST No.', placeholder: 'e.g. 27ABCDE1234F1Z5' },
  { field: 'industryType', label: 'Industry Type', placeholder: 'e.g. Manufacturing, Retail' },
  { field: 'productType', label: 'Product Type', placeholder: 'e.g. Garments, Hardware' },
  { field: 'onLoanStructure', label: 'On Loan Structure' },
];

const BUSINESS_NOTES: FieldSpec[] = [
  {
    field: 'machineryDetailsText',
    label: 'Machinery Details',
    multiline: true,
    placeholder: 'List machinery details...',
  },
  {
    field: 'keyEmployeeDetailsText',
    label: 'Key Employee Details',
    multiline: true,
    placeholder: 'List key employees...',
  },
  {
    field: 'groupCompanyDetailsText',
    label: 'Group Company Details',
    multiline: true,
    placeholder: 'Name, Relation, Brief business details...',
  },
  { field: 'financialDetailsText', label: 'Financial Details Summary', multiline: true },
  { field: 'otherBusinessPremisesText', label: 'Other Business Premises', multiline: true },
  { field: 'otherStateGstText', label: 'Other State GST Registration' },
  { field: 'familyInvolvedText', label: 'Family Members Involved', multiline: true },
];

const OBSERVATION_FIELDS: FieldSpec[] = [
  { field: 'godrejStockLevel', label: 'Stock Level' },
  { field: 'godrejRoughStockValue', label: 'Rough Value of Stock' },
  { field: 'godrejLocality', label: 'Locality' },
  { field: 'godrejOfficeSetup', label: 'Office Setup' },
  { field: 'godrejActivityLevel', label: 'Business Activity Level' },
  { field: 'godrejOfficeSize', label: 'Size of the office' },
  { field: 'godrejEmployeesSeen', label: 'No. of employees seen' },
  { field: 'godrejThirdPartyConfirmation', label: 'Third Party Confirmation' },
  { field: 'godrejCourtCasePending', label: 'Any court case pending' },
  { field: 'godrejThirdPartyComment', label: 'Third Party Comment' },
  { field: 'godrejSeparateDemarcation', label: 'Whether separate demarcation of office in Resi-cum-Office setup' },
  { field: 'godrejGstDisplayed', label: 'Whether GST Number displayed at the premises visited' },
];

const DOCUMENT_FIELDS: FieldSpec[] = [
  { field: 'godrejPanCard', label: 'PAN Card' },
  { field: 'godrejBusinessRegProof', label: 'Business Registration Proof Seen or Not Seen' },
  { field: 'godrejElectricityBill', label: 'Electricity Bill (latest 2 months) Seen/Not Seen' },
  { field: 'godrejSaleBills', label: 'Sale Bills Seen' },
  { field: 'godrejOtherRecords', label: 'Other (Kacha Records)' },
];

/** Collapsible "Godrej Specific Details" block on the Business Profile tab. */
export const GodrejDetailsPanel: React.FC<{ form: GodrejDetailsForm }> = ({ form }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { values, setField } = form;

  const control = ({ field, label, placeholder, multiline }: FieldSpec) => (
    <Field key={field} label={label}>
      {multiline ? (
        <textarea
          value={values[field]}
          onChange={(e) => setField(field, e.target.value)}
          className={`${INPUT_CLASS} min-h-[60px]`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={values[field]}
          onChange={(e) => setField(field, e.target.value)}
          className={INPUT_CLASS}
          placeholder={placeholder}
        />
      )}
    </Field>
  );

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm mt-6 mb-6">
      <button type="button" className="w-full flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-sm font-extrabold text-green-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-green-600" />
          Godrej Specific Details
        </h3>
        {isOpen ? <ChevronLeft className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{CASE_FIELDS.map(control)}</div>

          {BUSINESS_NOTES.map(control)}

          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Observation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{OBSERVATION_FIELDS.map(control)}</div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Documents verified during PD
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{DOCUMENT_FIELDS.map(control)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
