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
  }
];
