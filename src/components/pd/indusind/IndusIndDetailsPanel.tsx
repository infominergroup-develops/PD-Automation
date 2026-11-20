import React from 'react';
import { Landmark } from 'lucide-react';
import { Field } from '../formControls';
import type { IndusIndDetails, IndusIndDetailsForm } from './useIndusIndDetails';

const INPUT_CLASS = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold';

interface FieldSpec {
  field: keyof IndusIndDetails;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  options?: string[];
  number?: boolean;
}

const SECTIONS: Array<{ title: string; fields: FieldSpec[] }> = [
  {
    title: 'Report Header',
    fields: [
      { field: 'srNo', label: 'SR. No' },
      { field: 'branchName', label: 'Branch Name', placeholder: 'e.g. Lucknow' },
      { field: 'coApplicantQualification', label: 'Co-Applicant Education Qualification', placeholder: 'e.g. Graduate (NA if no co-applicant)' },
    ],
  },
  {
    title: 'Business Premises',
    fields: [
      { field: 'locatingPremises', label: 'Locating Premises', options: ['Commercial Area', 'Residential Area', 'Industrial Area', 'Market Area', 'Residential cum Commercial Area'] },
      { field: 'maintenanceSetup', label: 'Maintenance & Set-up', options: ['Good', 'Average', 'Poor'] },
      { field: 'signBoard', label: 'Name Board / Sign Board Displayed', options: ['Yes', 'No'] },
      { field: 'businessProcess', label: 'Business / Manufacturing / Marketing Process', placeholder: 'e.g. Manufacturing and trading of packing boxes' },
    ],
  },
  {
    title: 'Financial Assessment',
    fields: [
      { field: 'grossMarginPct', label: 'Gross Margin %', number: true, placeholder: 'e.g. 8' },
      { field: 'netMarginPct', label: 'Net Margin %', number: true, placeholder: 'e.g. 5' },
      { field: 'dailyCashFlow', label: 'Daily Cash Flow (leave blank to auto-calculate)', placeholder: 'e.g. Average daily Cash Inflow is Rs. 65,000 to 70,000/-' },
      { field: 'businessExpenses', label: 'Business Expenses (Capex, Opex, Working Capital, Inventory)' },
      { field: 'dedupCheck', label: 'Dedup-Check' },
      { field: 'vstsId', label: 'VSTS ID' },
    ],
  },
  {
    title: 'Residence & Assets',
    fields: [
      { field: 'residenceLocality', label: 'Residence Locality', options: ['Posh area', 'Slum', 'UMC', 'LMC'] },
      { field: 'otherProperty', label: 'Other Property' },
      { field: 'vehicleDetails', label: 'Vehicle Details', placeholder: 'e.g. UP00XX0000' },
    ],
  },
  {
    title: 'Neighbour Check & Recommendation',
    fields: [
      { field: 'neighbourVintage', label: 'Vintage of Business Confirmed by Neighbour', placeholder: 'e.g. Vintage of 3-4 Year at this current address' },
      { field: 'affordableEmiApplicant', label: 'Affordable EMI As Per Applicant' },
      { field: 'affordableEmiExecutive', label: 'Affordable EMI As Per Our Executive' },
      { field: 'synopsis', label: 'Synopsis (one point per line)', multiline: true, placeholder: '1. Applicant is operating the business ...\n2. ...' },
    ],
  },
];

/** "IndusInd Bank Details" block on the Business Profile tab: the fields only the IndusInd report prints. */
export const IndusIndDetailsPanel: React.FC<{ form: IndusIndDetailsForm }> = ({ form }) => {
  const { values, setField } = form;

  const control = ({ field, label, placeholder, multiline, options, number }: FieldSpec) => (
    <Field key={field} label={label} className={multiline ? 'md:col-span-2' : undefined}>
      {options ? (
        <select value={values[field]} onChange={(e) => setField(field, e.target.value)} className={`${INPUT_CLASS} bg-white`}>
          <option value="">Select...</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={values[field]} onChange={(e) => setField(field, e.target.value)} className={INPUT_CLASS} rows={8} placeholder={placeholder} />
      ) : (
        <input
          type={number ? 'number' : 'text'}
          min={number ? 0 : undefined}
          max={number ? 100 : undefined}
          value={values[field]}
          onChange={(e) => setField(field, e.target.value)}
          className={INPUT_CLASS}
          placeholder={placeholder}
        />
      )}
    </Field>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
        <Landmark className="w-4 h-4 text-[#eb8a23]" />
        IndusInd Bank Details
      </h3>
      {SECTIONS.map(({ title, fields }) => (
        <div key={title} className="pt-4 border-t border-slate-100 first:border-0 first:pt-0">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">{title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{fields.map(control)}</div>
        </div>
      ))}
    </div>
  );
};
