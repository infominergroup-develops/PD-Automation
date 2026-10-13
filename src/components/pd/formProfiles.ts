import type { PdTabId } from './PdTabs';

/**
 * Lenders print different reports, so the PD form only asks for what the selected lender's report uses.
 * Each profile lists the optional sections it shows; everything else on the form is always shown.
 */
export type FormProfileId = 'standard' | 'tataSbfc' | 'salaried' | 'godrej';

export interface FormSections {
  // Business Profile tab
  constitution: boolean;
  /** Tata/SBFC: partners/directors and sharing pattern. */
  partnersAndSharing: boolean;
  /** Premises ownership & rent, GSTIN, employee register, carpet area, premises value, business remark. */
  premisesAndRegistration: boolean;
  strengthsWeaknesses: boolean;
  /** Tata/SBFC: GST / Udyam details pasted point-wise. */
  businessProofDetails: boolean;
  aataChakkiSetup: boolean;
  godrejPanel: boolean;

  // Applicant tab
  initiationAndReportDates: boolean;
  femaleCandidate: boolean;
  loanType: boolean;
  solarPurpose: boolean;
  residenceAddress: boolean;
  documentsSeen: boolean;

  // Verification tab
  previousOccupation: boolean;
  staffCount: boolean;
  premiseOwnership: boolean;
  /** Itemised office/factory asset list. */
  factoryInfrastructure: boolean;
  /** One-click office/factory asset chips (Tata/SBFC). */
  quickFactoryAssets: boolean;
  stockDetails: boolean;
  neighbourConfirmation: boolean;
  /** Fixed/current assets, asset creation, business investment, agricultural income. */
  assetAnalysis: boolean;
  otherSourceIncome: boolean;
  solarSaving: boolean;
  additionalBusiness: boolean;
  /** Residence met person, premises type, ownership, house, family table, household expenses. */
  residenceVisit: boolean;
  residenceElectricity: boolean;
  businessElectricity: boolean;
  residenceNeighbours: boolean;
  residenceGpsAndStatus: boolean;

  // Customer & Supplier tab
  /** Office staff replace prominent customers/suppliers for salaried applicants. */
  officeStaffContacts: boolean;
  businessGps: boolean;

  // Financials tab
  profitMargin: boolean;
  statedSales: boolean;
  cogsSlider: boolean;
  grossProfitPct: boolean;
  grossProfitCard: boolean;
  staffAndUtilityExpenses: boolean;
  earningMembers: boolean;
  existingEmiNotes: boolean;
  comfortableEmiNotes: boolean;
  ratiosCard: boolean;
}

export interface FormProfile {
  id: FormProfileId;
  sections: FormSections;
  /** Tab-bar label overrides, e.g. "office" instead of "business" for salaried applicants. */
  tabLabels: Partial<Record<PdTabId, string>>;
}

const STANDARD_SECTIONS: FormSections = {
  constitution: true,
  partnersAndSharing: false,
  premisesAndRegistration: true,
  strengthsWeaknesses: true,
  businessProofDetails: false,
  aataChakkiSetup: true,
  godrejPanel: false,

  initiationAndReportDates: true,
  femaleCandidate: true,
  loanType: true,
  solarPurpose: true,
  residenceAddress: true,
  documentsSeen: true,

  previousOccupation: true,
  staffCount: true,
  premiseOwnership: true,
  factoryInfrastructure: true,
  quickFactoryAssets: false,
  stockDetails: true,
  neighbourConfirmation: true,
  assetAnalysis: true,
  otherSourceIncome: true,
  solarSaving: true,
  additionalBusiness: true,
  residenceVisit: true,
  residenceElectricity: true,
  businessElectricity: true,
  residenceNeighbours: true,
  residenceGpsAndStatus: true,

  officeStaffContacts: false,
  businessGps: true,

  profitMargin: true,
  statedSales: true,
  cogsSlider: true,
  grossProfitPct: false,
  grossProfitCard: true,
  staffAndUtilityExpenses: true,
  earningMembers: false,
  existingEmiNotes: true,
  comfortableEmiNotes: true,
  ratiosCard: true,
};

const PROFILES: Record<FormProfileId, FormProfile> = {
  standard: { id: 'standard', sections: STANDARD_SECTIONS, tabLabels: {} },

  // Tata Capital & SBFC share one report; its income sheet is driven by a Gross Profit %.
  tataSbfc: {
    id: 'tataSbfc',
    sections: {
      ...STANDARD_SECTIONS,
      partnersAndSharing: true,
      businessProofDetails: true,
      aataChakkiSetup: false,
      femaleCandidate: false,
      solarPurpose: false,
      factoryInfrastructure: false,
      quickFactoryAssets: true,
      neighbourConfirmation: false,
      assetAnalysis: false,
      otherSourceIncome: false,
      solarSaving: false,
      residenceElectricity: false,
      businessElectricity: false,
      residenceNeighbours: false,
      cogsSlider: false,
      grossProfitPct: true,
      ratiosCard: false,
    },
    tabLabels: {},
  },

  // Ambit Finvest (Salaried): office visit instead of a business visit, salary instead of sales.
  salaried: {
    id: 'salaried',
    sections: {
      ...STANDARD_SECTIONS,
      constitution: false,
      premisesAndRegistration: false,
      strengthsWeaknesses: false,
      aataChakkiSetup: false,
      femaleCandidate: false,
      solarPurpose: false,
      previousOccupation: false,
      staffCount: false,
      premiseOwnership: false,
      factoryInfrastructure: false,
      stockDetails: false,
      assetAnalysis: false,
      solarSaving: false,
      additionalBusiness: false,
      businessElectricity: false,
      officeStaffContacts: true,
      businessGps: false,
      profitMargin: false,
      statedSales: false,
      cogsSlider: false,
      grossProfitCard: false,
      staffAndUtilityExpenses: false,
      earningMembers: true,
      existingEmiNotes: false,
      ratiosCard: false,
    },
    tabLabels: {
      verification: '2. Office & Residence Verification',
      profile: '3. Employment Profile',
      customer_supplier: '4. Office Staff & Banking',
    },
  },

  // Godrej Finance: a business-only report. The Godrej panel asks for stock, locality, third-party
  // checks and documents directly, so the generic residence/asset/electricity sections are not needed.
  godrej: {
    id: 'godrej',
    sections: {
      ...STANDARD_SECTIONS,
      godrejPanel: true,
      aataChakkiSetup: false,
      initiationAndReportDates: false,
      femaleCandidate: false,
      loanType: false,
      solarPurpose: false,
      residenceAddress: false,
      documentsSeen: false,
      premiseOwnership: false,
      factoryInfrastructure: false,
      stockDetails: false,
      neighbourConfirmation: false,
      assetAnalysis: false,
      solarSaving: false,
      additionalBusiness: false,
      residenceVisit: false,
      residenceElectricity: false,
      businessElectricity: false,
      residenceNeighbours: false,
      residenceGpsAndStatus: false,
      businessGps: false,
      profitMargin: false,
      existingEmiNotes: false,
      comfortableEmiNotes: false,
    },
    tabLabels: { verification: '2. Business Verification' },
  },
};

const PROFILE_BY_CLIENT: Record<string, FormProfileId> = {
  tata: 'tataSbfc',
  sbfc: 'tataSbfc',
  ambit_salaried: 'salaried',
  godrej: 'godrej',
};

export function formProfileFor(clientId: string | undefined): FormProfile {
  return PROFILES[PROFILE_BY_CLIENT[(clientId || '').toLowerCase()] ?? 'standard'];
}
