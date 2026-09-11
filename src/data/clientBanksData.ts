export interface TemplateFieldSchema {
  fieldName: string;
  type: 'text' | 'number' | 'date' | 'photo' | 'formula';
  formula?: string;
  required?: boolean;
}

export interface ClientBank {
  id: string;
  name: string;
  shortCode: string;
  division: string;
  logoColor: string;
  accentColor: string;
  borderClass: string;
  bgGradient: string;
  description: string;
  defaultScheme: string;
  tagline: string;
  templateFormat?: 'standard' | 'pdf' | 'excel' | 'godrej';
  templateFileBase64?: string;
  templateSchema?: TemplateFieldSchema[];
}

export const CLIENT_BANKS: ClientBank[] = [
  {
    id: 'ambit',
    name: 'Ambit Finvest',
    shortCode: 'AMBIT',
    division: 'Ambit Micro Lending Division',
    logoColor: '#F25F22',
    accentColor: '#eb8a23',
    borderClass: 'border-[#F25F22]',
    bgGradient: 'from-[#F25F22]/10 to-orange-50',
    description: 'Micro lending and micro-enterprise credit assessment suite.',
    defaultScheme: 'Ambit Express',
    tagline: 'Ambit • Micro Credit Portal'
  },
  {
    id: 'moneyboxx',
    name: 'Moneyboxx Finance Limited',
    shortCode: 'MONEYBOXX',
    division: 'Moneyboxx Micro Lending Division',
    logoColor: '#004B8D',
    accentColor: '#1D4ED8',
    borderClass: 'border-[#004B8D]',
    bgGradient: 'from-[#004B8D]/10 to-blue-50',
    description: 'Micro lending and micro-enterprise credit assessment suite.',
    defaultScheme: 'Moneyboxx Express',
    tagline: 'Moneyboxx • Micro Credit Portal'
  },
  {
    id: 'godrej',
    name: 'Godrej Finance Limited',
    shortCode: 'GODREJ',
    division: 'Business Loan Division',
    logoColor: '#cf102d',
    accentColor: '#cf102d',
    borderClass: 'border-[#cf102d]',
    bgGradient: 'from-[#cf102d]/10 to-red-50',
    description: 'Customized Business Loan assessment portal.',
    defaultScheme: 'Godrej Business Loan',
    tagline: 'Godrej • Business Loan',
    templateFormat: 'godrej'
  },
  {
    id: 'sbfc',
    name: 'SBFC Finance LTD',
    shortCode: 'SBFC',
    division: 'Business Loan Division',
    logoColor: '#6B21A8',
    accentColor: '#6B21A8',
    borderClass: 'border-[#6B21A8]',
    bgGradient: 'from-[#6B21A8]/10 to-purple-50',
    description: 'Customized SBFC Finance Assessment portal.',
    defaultScheme: 'SBFC Business Loan',
    tagline: 'SBFC • Business Loan',
    templateFormat: 'standard'
  },
  {
    id: 'tata',
    name: 'Tata Capital Limited',
    shortCode: 'TATA',
    division: 'Business Loan Division',
    logoColor: '#005587',
    accentColor: '#005587',
    borderClass: 'border-[#005587]',
    bgGradient: 'from-[#005587]/10 to-blue-50',
    description: 'Customized Tata Capital Assessment portal.',
    defaultScheme: 'Tata Business Loan',
    tagline: 'Tata Capital • Business Loan',
    templateFormat: 'standard'
  }
];
