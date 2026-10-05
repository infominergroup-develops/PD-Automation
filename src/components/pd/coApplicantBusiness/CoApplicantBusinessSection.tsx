import React from 'react';
import { Briefcase } from 'lucide-react';
import { Field } from '../formControls';
import {
  CO_APPLICANT_PREMISES_OPTIONS,
  type CoApplicantBusiness,
  type CoApplicantBusinessForm,
} from './useCoApplicantBusiness';

const INPUT_CLASS =
  'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold';

type FieldSpec = { field: keyof CoApplicantBusiness; label: string; placeholder?: string };

const HEADER_FIELDS: FieldSpec[] = [{ field: 'coApplicantBusinessName', label: 'Firm / Trade Name' }];
const VINTAGE_FIELD: FieldSpec = {
  field: 'coApplicantBusinessVintage',
  label: 'Vintage of Business',
  placeholder: 'e.g. 5 Years',
};
const DETAIL_FIELDS: FieldSpec[] = [
  { field: 'coApplicantStaffCount', label: 'Number of Staffs' },
  { field: 'coApplicantFactoryInfrastructure', label: 'Factory / Office Infrastructure' },
  { field: 'coApplicantStockDetailsValue', label: 'Stock Details with Estimated Value' },
  { field: 'coApplicantFixedAndCurrentAssetAnalysis', label: 'Fixed & Current Asset Analysis' },
  { field: 'coApplicantAssetCreationThroughBusiness', label: 'Asset Creation Through Business' },
  { field: 'coApplicantInitialBusinessInvestment', label: 'Business Investment' },
  { field: 'coApplicantAgriculturalIncomeDetails', label: 'Agricultural Income Details' },
  { field: 'coApplicantOtherSourceIncomeDetails', label: 'Other Source Income Details' },
  { field: 'coApplicantOperationalSavingAnalysis', label: 'Solar Saving Analysis' },
];

interface CoApplicantBusinessSectionProps {
  form: CoApplicantBusinessForm;
  footer: React.ReactNode;
}

/** Tab 5.1: business visit details for a co-applicant who runs their own business. */
export const CoApplicantBusinessSection: React.FC<CoApplicantBusinessSectionProps> = ({ form, footer }) => {
  const { values, setField } = form;

  const textInput = ({ field, label, placeholder }: FieldSpec) => (
    <Field key={field} label={label}>
      <input
        type="text"
        value={values[field]}
        onChange={(e) => setField(field, e.target.value)}
        className={INPUT_CLASS}
        placeholder={placeholder}
      />
    </Field>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#eb8a23]" />
          Co-Applicant Business Visit Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADER_FIELDS.map(textInput)}

          <Field label="Premises Ownership">
            <select
              value={values.coApplicantBusinessPremiseOwnership}
              onChange={(e) => setField('coApplicantBusinessPremiseOwnership', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Select Ownership</option>
              {CO_APPLICANT_PREMISES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          {textInput(VINTAGE_FIELD)}

          <Field label="Detailed Business Profile & Summary" className="md:col-span-3">
            <textarea
              value={values.coApplicantBriefBusinessProfile}
              onChange={(e) => setField('coApplicantBriefBusinessProfile', e.target.value)}
              rows={4}
              className={INPUT_CLASS}
              placeholder="Enter detailed business profile and executive summary..."
            />
          </Field>

          {DETAIL_FIELDS.map(textInput)}
        </div>
      </div>
      {footer}
    </div>
  );
};
