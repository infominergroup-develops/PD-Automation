/**
 * Core Data Models & Types for Personal Discussion (PD) Automation System
 */
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CREDIT_MANAGER' | 'FIELD_OFFICER' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  avatar?: string;
}

export interface BusinessCategory {
  id: string; // e.g. 'kirana', 'hardware'
  name: string;
  icon: string;
  description: string;
  industryGroup: string; // e.g. 'Retail', 'Manufacturing', 'Services'
  typicalMarginMin: number; // %
  typicalMarginMax: number; // %
  customNumber?: string;
  customSize?: string;
  customUsage?: string;
  customCharges?: string;
  requiredDocs: string[];
  validationRules: {
    ruleId: string;
    field: string;
    operator: 'GT' | 'LT' | 'EQ' | 'BETWEEN' | 'RATIO_CHECK';
    value: number | [number, number];
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  riskParameters: {
    parameter: string;
    weight: number;
    description: string;
  }[];
}

export interface CategoryProduct {
  id: string;
  categoryId: string;
  productName: string;
  productCategory: string;
  revenueContributionPct: number;
  inventoryType: 'FAST_MOVING' | 'SLOW_MOVING' | 'PERISHABLE' | 'HIGH_VALUE' | 'SERVICE';
  averageMarginPct: number;
  businessImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  price?: number;
  quantity?: number;
  total?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: string;
  education: string;
  occupation: string;
  isEarning: boolean;
  monthlyIncome: number;
  isDependent: boolean;
  profession?: 'Student' | 'Working professional' | 'Housewife' | '';
  qualification?: string;
}

export interface CollateralEntry {
  id: string;
  type: string;
  description: string;
  location: string;
  area: string;
  marketValue: number;
  distressValue: number;
  ownership: string;
  documentsAvailable: string;
  encumbrance: string;
}

export interface BankAccountEntry {
  id: string;
  bankName: string;
  branchIfsc: string;
  accountType: 'Savings' | 'Current' | 'Overdraft / CC' | 'Loan Account';
  accountNoLast4: string;
  accountHolder: string;
  since: string;
  avgMonthlyBalance: number;
  monthlyCredits: number;
  monthlyDebits: number;
  bounces6Months: number;
  isPrimaryBizAccount: boolean;
  statementVerified: string;
}

export interface ExistingBorrowing {
  id: string;
  loanType: string;
  lender: string;
  originalAmount: number;
  monthlyEmi: number;
  totalTenureMonths: number;
  remainingTenureMonths: number;
  outstandingBalance: number;
}

export interface SupplierEntry {
  id: string;
  name: string;
  mobile: string;
  creditDays: string;
  associationYear: string;
  verificationMethod: string;
  remarks: string;
}

export interface CustomerEntry {
  id: string;
  name: string;
  mobile: string;
  creditDays: string;
  associationYear: string;
  verificationMethod: string;
  remarks: string;
}

export interface ThirdPartyReference {
  id: string;
  name: string;
  relationship: string;
  mobile: string;
  address: string;
  yearsKnown: number;
  feedback: string;
  reputation: 'Excellent' | 'Good' | 'Average' | 'Poor';
  character: 'Excellent' | 'Good' | 'Average' | 'Poor';
  verificationStatus: 'In Person' | 'Phone' | 'Not Verified';
}

export interface PDPhoto {
  id: string;
  name: string;
  dataUrl: string;
  category: 'KYC' | 'Bill / Invoice' | 'Kacha Parcha' | 'Business Pic' | 'Business Registration Proof' | 'Applicant Selfie with Verifier' | 'Sign Board Photo' | 'QR / Scanner Code' | 'Other';
  mimeType: string;
  gps?: {
    lat: number;
    lng: number;
    mapLink: string;
  };
}

export interface FinancialWaterfall {
  statedMonthlyRevenue: number;
  crossCheckRevenue: number;
  adoptedRevenue: number;
  rawMaterialCOGS: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: {
    salaries: number;
    rent: number;
    utilities: number;
    transport: number;
    misc: number;
  };
  totalOperatingExpenses: number;
  netBusinessIncome: number;
  netMarginPct: number;
  otherHouseholdIncome: {
    agriculture: number;
    rental: number;
    coBorrower: number;
    fdDividend: number;
    animalHusbandry: number;
    other: number;
  };
  totalOtherIncome: number;
  totalFamilyIncome: number;
  householdExpenses: {
    food: number;
    rent: number;
    education: number;
    medical: number;
    travel: number;
    other: number;
  };
  totalHouseholdExpenses: number;
  surplusBeforeEmi: number;
  existingEmisSum: number;
  netMonthlySurplus: number;
  proposedEmi: number;
  postLoanNetSurplus: number;
  dscr: number;
  postLoanDscr: number;
  foirPct: number;
  emiCapacity: number;
}

export interface ValidationIssue {
  id: string;
  code: string;
  module: string;
  field: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  impact: string;
  suggestedAction: string;
}

export interface GodrejReportData {
  basicInfo: {
    financialInstitute: string;
    product: string;
    city: string;
    applicantEntity: string;
    constitution: string;
    dateOfVisit: string;
    personMet: string;
    addressProvided: string;
    designation: string;
    contactNo: string;
    addressVisited: string;
    alternateMobile: string;
    educationQuali: string;
    addressOwnership: string;
    appIdRefNo: string;
    operatingSince: string;
    loanAmountRequested: string;
    officeAccessibility: string;
    tenorRequested: string;
    businessVintage: string;
    marginsAssessed: string;
    gstNoCustomer: string;
    companyNameBoardSeen: string;
    endUse: string;
    finalRecommendation: string;
    pdDoneBy: string;
  };
  businessProfile: {
    natureOfBusiness: string;
    industry: string;
    product: string;
    vintageKeyPersonDetails: string;
    shareholdingPattern: Array<{ name: string; stake: string; onLoanStructure: string }>;
    profileOfBusiness: string;
    machineryDetails: string;
    keyEmployeeDetails: string;
    groupCoDetails: Array<{ entityName: string; relation: string; briefDetails: string }>;
    otherSourceIncome: string;
    financialDetails: string;
    otherBusinessPremises: string;
    otherStateGst: string;
    familyMembersInvolved: Array<{ name: string; relation: string; periodInvolved: string; areaSupervised: string }>;
  };
  bankingAndLoans: {
    bankAccounts: Array<{ bankName: string; accountTypes: string; accountNumber: string; ccOdLimit: string; vintage: string; collateralDetails: string }>;
    loanDetails: Array<{ bankName: string; loanTypes: string; sanctionedAmount: string; emiRunning: string; tenor: string; noOfPaidEmi: string }>;
    topBuyersSuppliers: Array<{ name: string; type: string; contribution: string; creditPeriod: string; relationshipSince: string; contactPerson: string }>;
  };
  assetsAndObservations: {
    assets: Array<{ ownerName: string; relationWithKeyPerson: string; type: string; value: string; ownedSince: string; address: string }>;
    stockLevel: string;
    roughValueOfStock: string;
    locality: string;
    officeSetup: string;
    businessActivityLevel: string;
    sizeOfOffice: string;
    noOfEmployeesSeen: string;
    thirdPartyConfirmation: string;
    anyCourtCasePending: string;
    thirdPartyComment: string;
    separateDemarcation: string;
    gstDisplayed: string;
  };
  documentsAndStrengths: {
    panCard: string;
    gstinLegalName: string;
    businessRegProof: string;
    gstinRegistrationDate: string;
    electricityBill: string;
    employeeRegister: string;
    saleBillsSeen: string;
    otherRecords: string;
    strengths: Array<{ strength: string }>;
    weaknesses: Array<{ weakness: string }>;
    finalStatus: string;
  };
}

export interface RiskAssessmentResult {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 to 100
  financialHealthGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  keyRiskFactors: string[];
  strengths: string[];
  weaknesses: string[];
  anomaliesDetected: ValidationIssue[];
  mitigants: string[];
}

export interface PDReport {
  id: string;
  applicationNumber: string;
  applicantName: string;
  categoryId: string;
  product: string;
  scheme: string;
  appliedAmount: number;
  tenureMonths: number;
  purpose: string;
  visitDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  assignedOfficer: string;
  assignedCreditManager: string;
  agencyName: string;
  panNumber: string;
  firmName: string;
  constitution: string;
  financials: FinancialWaterfall;
  riskResult: RiskAssessmentResult;
  photos: PDPhoto[];
  aiExecutiveSummary?: string;
  aiDetailedNarrative?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  formDataRaw?: Record<string, any>;
}

export interface HTMLToolTestResult {
  testId: string;
  testName: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  executionTimeMs: number;
  details: string;
  actualOutput: string;
  expectedOutput: string;
  severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
}

export interface HTMLToolValidationRun {
  runId: string;
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  overallScore: number; // 0-100%
  executionDurationMs: number;
  environmentInfo: string;
  results: HTMLToolTestResult[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
}
