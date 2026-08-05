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
}

export const CLIENT_BANKS: ClientBank[] = [
  {
    id: 'axis',
    name: 'Axis Bank',
    shortCode: 'AXIS',
    division: 'Axis Bank Infominer Micro Lending & MSME Division',
    logoColor: '#97123A',
    accentColor: '#eb8a23',
    borderClass: 'border-[#97123A]',
    bgGradient: 'from-[#97123A]/10 to-amber-50',
    description: 'Micro lending and micro-enterprise credit assessment suite.',
    defaultScheme: 'Infominer Micro Lending Express',
    tagline: 'Badhti Ka Naam Zindagi • Micro Credit Portal'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    shortCode: 'HDFC',
    division: 'HDFC Bank Rural & Commercial Credit Division',
    logoColor: '#004B8D',
    accentColor: '#1D4ED8',
    borderClass: 'border-[#004B8D]',
    bgGradient: 'from-[#004B8D]/10 to-blue-50',
    description: 'Commercial micro-loans and working capital PD reports.',
    defaultScheme: 'HDFC Enterprise Growth Credit',
    tagline: 'We Understand Your World • Commercial Lending'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    shortCode: 'ICICI',
    division: 'ICICI Bank Business Banking & MSME Group',
    logoColor: '#F37021',
    accentColor: '#EA580C',
    borderClass: 'border-[#F37021]',
    bgGradient: 'from-[#F37021]/10 to-orange-50',
    description: 'Self-employed MSME loan verification & field investigation.',
    defaultScheme: 'ICICI Micro Business Loan',
    tagline: 'Hum Hain Na • Business Banking Group'
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortCode: 'SBI',
    division: 'SBI SME & Agri Business Credit Division',
    logoColor: '#1A365D',
    accentColor: '#0284C7',
    borderClass: 'border-[#1A365D]',
    bgGradient: 'from-[#1A365D]/10 to-sky-50',
    description: 'Nationalized micro-enterprise credit assessment engine.',
    defaultScheme: 'SBI Sanjeevani MSME Credit',
    tagline: 'The Banker to Every Indian • SME Wing'
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    shortCode: 'INDUS',
    division: 'IndusInd Inclusive Finance & Micro Credit',
    logoColor: '#800000',
    accentColor: '#B91C1C',
    borderClass: 'border-[#800000]',
    bgGradient: 'from-[#800000]/10 to-red-50',
    description: 'Inclusive finance and priority sector lending assessment.',
    defaultScheme: 'IndusInd Pragati Loan',
    tagline: 'We Make You Feel Richer • Inclusive Finance'
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    shortCode: 'KOTAK',
    division: 'Kotak Commercial Banking Division',
    logoColor: '#ED1C24',
    accentColor: '#DC2626',
    borderClass: 'border-[#ED1C24]',
    bgGradient: 'from-[#ED1C24]/10 to-[#ED1C24]/5',
    description: 'Priority MSME collateral-free business loan appraisal.',
    defaultScheme: 'Kotak MSME Unsecured Credit',
    tagline: 'Let\'s Make Money Simple • Commercial Wing'
  },
  {
    id: 'custom',
    name: 'Custom Institution Partner',
    shortCode: 'CUSTOM',
    division: 'Custom Financial Credit Partner Division',
    logoColor: '#2D3E50',
    accentColor: '#eb8a23',
    borderClass: 'border-[#2D3E50]',
    bgGradient: 'from-slate-100 to-amber-50',
    description: 'Configure custom bank partner or NBFC credit underwriting parameters.',
    defaultScheme: 'Custom Credit Facility',
    tagline: 'Multi-Partner Credit Infrastructure'
  }
];
