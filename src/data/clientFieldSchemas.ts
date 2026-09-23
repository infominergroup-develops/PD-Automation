export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'boolean';

export interface FieldSchema {
  id: string; // The key in PDReportPrintData
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[]; // For select type
  placeholder?: string;
  gridSpan?: 1 | 2 | 3 | 4; // To control layout (e.g., span 2 columns)
}

export interface SectionSchema {
  id: string;
  title: string;
  fields: FieldSchema[];
}

export interface ClientSchema {
  clientId: string; // or template name
  sections: SectionSchema[];
}

// Phase 1: We start by defining the "Applicant Details" section for the main clients.

const moneyboxxSchema: ClientSchema = {
  clientId: 'moneyboxx',
  sections: [
    {
      id: 'applicantDetails',
      title: 'Case Profile',
      fields: [
        { id: 'applicantName', label: 'Name of applicant', type: 'text', required: true, gridSpan: 2 },
        { id: 'applicantPhone', label: 'Contact Number', type: 'text', required: true, gridSpan: 2 },
        { id: 'firmName', label: 'Business firm name', type: 'text', required: false, gridSpan: 2 },
        { id: 'femaleCandidateDetails', label: 'Female candidate is on loan or not if no please collect details', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'loanAmount', label: 'Loan Amount (as mention in application form)', type: 'number', required: false, gridSpan: 2 },
        { id: 'loanType', label: 'Type of Loan (as mention in application form)', type: 'text', required: false, gridSpan: 2 },
        { id: 'loanPurpose', label: 'Solar Purpose & Usage Confirmation (as per applicant)', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'residenceAddress', label: 'Address of the residence', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'businessAddress', label: 'Address of the business (applicant)', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'metPersonName', label: 'Met person during visit time', type: 'text', required: false, gridSpan: 2 },
        { id: 'metPersonIdProof', label: 'Met person identity proof', type: 'text', required: false, gridSpan: 2 },
        { id: 'executiveName', label: 'Executive Name', type: 'text', required: false, gridSpan: 2 },
      ]
    },
    {
      id: 'businessProfile',
      title: 'Brief Profile of Business',
      fields: [
        { id: 'briefBusinessProfile', label: 'Detailed Business Profile & Summary', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'businessVintage', label: 'Vintage of the business', type: 'text', required: false, gridSpan: 2 },
        { id: 'staffCount', label: 'Number of staffs', type: 'text', required: false, gridSpan: 2 },
        { id: 'businessPremiseOwnership', label: 'Is office premise on rented / owned', type: 'select', options: [
            { value: 'OWN', label: 'Self Owned Premises' },
            { value: 'RENTED', label: 'Rented Premises' },
            { value: 'FAMILY', label: 'Family / Ancestral Owned' },
            { value: 'RESIDENCE_CUM_BUSINESS', label: 'Residence cum Business' }
          ], required: false, gridSpan: 2 },
        { id: 'factoryInfrastructure', label: 'Details of Office / Factory infrastructure (Assets)', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'stockDetailsValue', label: 'Stock details with estimated value', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'fixedAndCurrentAssetAnalysis', label: 'Fixed & Current Asset Analysis', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'assetCreationThroughBusiness', label: 'Asset Creation Through Business', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'initialBusinessInvestment', label: 'Business Investment', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'agriculturalIncomeDetails', label: 'Agricultural Income Details', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'otherSourceIncomeDetails', label: 'Other source income', type: 'textarea', required: false, gridSpan: 4 },
      ]
    },
    {
      id: 'coAppBusinessProfile',
      title: 'Co-Applicant Business Visit Details',
      fields: [
        { id: 'coApplicantBusinessName', label: 'Firm / Trade Name', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBusinessPremiseOwnership', label: 'Premises Ownership', type: 'select', options: [
            { value: 'OWN', label: 'Self Owned Premises' },
            { value: 'RENTED', label: 'Rented Premises' },
            { value: 'FAMILY', label: 'Family / Ancestral Owned' },
            { value: 'RESIDENCE_CUM_BUSINESS', label: 'Residence cum Business' }
          ], required: false, gridSpan: 2 },
        { id: 'coApplicantBusinessVintage', label: 'Vintage of Business', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBriefBusinessProfile', label: 'Detailed Business Profile & Summary', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'coApplicantStaffCount', label: 'Number of Staffs', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantFactoryInfrastructure', label: 'Factory / Office Infrastructure', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantStockDetailsValue', label: 'Stock Details with Estimated Value', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantFixedAndCurrentAssetAnalysis', label: 'Fixed & Current Asset Analysis', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantAssetCreationThroughBusiness', label: 'Asset Creation Through Business', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantInitialBusinessInvestment', label: 'Business Investment', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantAgriculturalIncomeDetails', label: 'Agricultural Income Details', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantOtherSourceIncomeDetails', label: 'Other Source Income Details', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantOperationalSavingAnalysis', label: 'Operational & Saving Analysis', type: 'text', required: false, gridSpan: 2 },
      ]
    }
  ]
};

const godrejSchema: ClientSchema = {
  clientId: 'godrej',
  sections: [
    {
      id: 'applicantDetails',
      title: 'Applicant & Business Information',
      fields: [
        { id: 'applicantName', label: 'Applicant Name', type: 'text', required: true, gridSpan: 2 },
        { id: 'applicantPhone', label: 'Contact Number', type: 'text', required: true, gridSpan: 2 },
        { id: 'firmName', label: 'Company / Firm Name', type: 'text', required: false, gridSpan: 2 },
        { id: 'residenceAddress', label: 'Residential Address', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'businessAddress', label: 'Business Address', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'meetingAddress', label: 'Place of PD', type: 'text', required: false, gridSpan: 2 },
        { id: 'loanAmount', label: 'Loan Amount Requested', type: 'number', required: false, gridSpan: 2 },
        { id: 'loanPurpose', label: 'End use of loan', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'metPersonName', label: 'Person Met', type: 'text', required: false, gridSpan: 2 },
      ]
    },
    {
      id: 'businessProfile',
      title: 'Business Setup Details',
      fields: [
        { id: 'briefBusinessProfile', label: 'Detailed Business Profile (Nature of Business, Setup, Background)', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'businessVintage', label: 'Vintage of Business', type: 'text', required: false, gridSpan: 2 },
        { id: 'staffCount', label: 'No. of Employees', type: 'number', required: false, gridSpan: 2 },
        { id: 'businessPremiseOwnership', label: 'Business Premise Ownership', type: 'select', options: [
            { value: 'OWN', label: 'Self Owned' },
            { value: 'RENTED', label: 'Rented' },
            { value: 'FAMILY', label: 'Family Owned' }
          ], required: false, gridSpan: 2 },
        { id: 'stockDetailsValue', label: 'Stock / Inventory Value', type: 'text', required: false, gridSpan: 2 },
      ]
    },
    {
      id: 'coAppBusinessProfile',
      title: 'Co-Applicant Business Details',
      fields: [
        { id: 'coApplicantBusinessName', label: 'Firm / Trade Name', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBusinessVintage', label: 'Vintage of Business', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBriefBusinessProfile', label: 'Detailed Business Profile', type: 'textarea', required: false, gridSpan: 4 },
      ]
    }
  ]
};

const standardSchema: ClientSchema = {
  clientId: 'standard',
  sections: [
    {
      id: 'applicantDetails',
      title: 'Applicant Profile',
      fields: [
        { id: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true, gridSpan: 2 },
        { id: 'applicantPhone', label: 'Phone Number', type: 'text', required: false, gridSpan: 2 },
        { id: 'firmName', label: 'Business Name', type: 'text', required: false, gridSpan: 2 },
        { id: 'residenceAddress', label: 'Residence Address', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'businessAddress', label: 'Business Address', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'loanAmount', label: 'Applied Loan Amount', type: 'number', required: false, gridSpan: 2 },
      ]
    },
    {
      id: 'businessProfile',
      title: 'Business Profile',
      fields: [
        { id: 'constitution', label: 'Business Constitution', type: 'select', options: [
            { value: 'Proprietorship', label: 'Sole Proprietorship' },
            { value: 'Partnership', label: 'Registered Partnership' },
            { value: 'Pvt Ltd', label: 'Private Limited Company' },
            { value: 'LLP', label: 'Limited Liability Partnership' }
          ], required: false, gridSpan: 2 },
        { id: 'businessPremiseOwnership', label: 'Premises Ownership', type: 'select', options: [
            { value: 'OWN', label: 'Self Owned Premises' },
            { value: 'RENTED', label: 'Rented Premises' },
            { value: 'FAMILY', label: 'Family / Ancestral Owned' },
            { value: 'RESIDENCE_CUM_BUSINESS', label: 'Residence cum Business' }
          ], required: false, gridSpan: 2 },
        { id: 'monthlyRent', label: 'Monthly Rent (if rented)', type: 'number', required: false, gridSpan: 2 },
        { id: 'shopAreaSqFt', label: 'Carpet Area (Sq. Ft.)', type: 'number', required: false, gridSpan: 2 },
        { id: 'inventoryValue', label: 'Estimated Business Premises Value (₹)', type: 'number', required: false, gridSpan: 2 },
        { id: 'businessRemark', label: 'Business Remark', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'briefBusinessProfile', label: 'Detailed Business Profile & Summary', type: 'textarea', required: false, gridSpan: 4 },
      ]
    },
    {
      id: 'coAppBusinessProfile',
      title: 'Co-Applicant Business Visit Details',
      fields: [
        { id: 'coApplicantBusinessName', label: 'Firm / Trade Name', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBusinessPremiseOwnership', label: 'Premises Ownership', type: 'select', options: [
            { value: 'OWN', label: 'Self Owned Premises' },
            { value: 'RENTED', label: 'Rented Premises' },
            { value: 'FAMILY', label: 'Family / Ancestral Owned' },
            { value: 'RESIDENCE_CUM_BUSINESS', label: 'Residence cum Business' }
          ], required: false, gridSpan: 2 },
        { id: 'coApplicantBusinessVintage', label: 'Vintage of Business', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantBriefBusinessProfile', label: 'Detailed Business Profile & Summary', type: 'textarea', required: false, gridSpan: 4 },
        { id: 'coApplicantStaffCount', label: 'Number of Staffs', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantFactoryInfrastructure', label: 'Factory / Office Infrastructure', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantStockDetailsValue', label: 'Stock Details with Estimated Value', type: 'text', required: false, gridSpan: 2 },
        { id: 'coApplicantFixedAndCurrentAssetAnalysis', label: 'Fixed & Current Asset Analysis', type: 'text', required: false, gridSpan: 2 },
      ]
    }
  ]
};

// Ambit schema (starts similar to standard, can be customized)
export const ambitSchema: ClientSchema = {
  ...standardSchema,
  clientId: 'ambit'
};

// SBFC schema (starts similar to standard, can be customized)
export const sbfcSchema: ClientSchema = {
  ...standardSchema,
  clientId: 'sbfc'
};

// Tata Capital schema (starts similar to standard, can be customized)
export const tataSchema: ClientSchema = {
  ...standardSchema,
  clientId: 'tata'
};

// Map all schemas
export const CLIENT_SCHEMAS: Record<string, ClientSchema> = {
  'moneyboxx': moneyboxxSchema,
  'godrej': godrejSchema,
  'standard': standardSchema,
  'ambit': ambitSchema,
  'sbfc': sbfcSchema,
  'tata': tataSchema
};
