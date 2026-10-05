import { useState } from 'react';
import { savedList, savedString, type SavedApplicant } from '../savedValues';

/** A prominent customer or supplier. Older records may hold the remark as `remark`. */
export interface ContactRow {
  id: string;
  name: string;
  phone: string;
  feedback: string;
  remark?: string;
}

export interface BankAccountRow {
  id: string;
  bankName: string;
  branchName: string;
  accountType: string;
  limit: string;
  accountNo: string;
  remark: string;
}

export interface ExistingLoanRow {
  id: string;
  typeOfLoan: string;
  financerName: string;
  amountInLakhs: string | number;
  emi: string | number;
  tenure: string;
  balanceTenure: string;
  remark: string;
}

const NO_OBLIGATION = 'No any existing obligation';
export const GPS_NOT_REACHED_REMARK =
  'The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point.';
export const GPS_VERIFIED_REMARK = 'The location was successfully verified using the provided coordinates.';

export const newContact = (prefix: 'c' | 's'): ContactRow => ({
  id: prefix + Date.now(),
  name: '',
  phone: '',
  feedback: '',
});
export const newBankAccount = (remark = ''): BankAccountRow => ({
  id: 'b' + Date.now(),
  bankName: '',
  branchName: '',
  accountType: 'Saving Account',
  limit: 'NA',
  accountNo: '',
  remark,
});
export const newExistingLoan = (remark = ''): ExistingLoanRow => ({
  id: 'l' + Date.now(),
  typeOfLoan: 'NA',
  financerName: 'NA',
  amountInLakhs: '',
  emi: '',
  tenure: '',
  balanceTenure: '',
  remark,
});

const blankCustomers = (): ContactRow[] => [{ id: 'c1', name: '', phone: '', feedback: '' }];
const blankSuppliers = (): ContactRow[] => [{ id: 's1', name: '', phone: '', feedback: '' }];
const blankBankAccounts = (): BankAccountRow[] => [{ ...newBankAccount(), id: 'b1' }];
const blankLoans = (): ExistingLoanRow[] => [{ ...newExistingLoan(NO_OBLIGATION), id: 'l1' }];

/** State for tab 4 "Customer & Supplier Details": customers, suppliers, collateral, banking, loans, GPS check. */
export function useCustomerSupplierDetails() {
  const [prominentCustomers, setProminentCustomers] = useState<ContactRow[]>(blankCustomers);
  const [prominentSuppliers, setProminentSuppliers] = useState<ContactRow[]>(blankSuppliers);

  const [hasCollateral, setHasCollateral] = useState(false);
  const [collateralAddress, setCollateralAddress] = useState('');
  const [collateralPropertyType, setCollateralPropertyType] = useState('Residential');
  const [collateralPropertyArea, setCollateralPropertyArea] = useState('');
  const [collateralPropertyUsage, setCollateralPropertyUsage] = useState('');
  const [collateralValuation, setCollateralValuation] = useState('');
  const [collateralRemarks, setCollateralRemarks] = useState('');

  const [bankingDetails, setBankingDetails] = useState<BankAccountRow[]>(blankBankAccounts);
  const [existingLoans, setExistingLoans] = useState<ExistingLoanRow[]>(blankLoans);
  const [currentObligation, setCurrentObligation] = useState(NO_OBLIGATION);

  const [businessLongitudeVerified, setBusinessLongitudeVerified] = useState(false);
  const [businessLongitudeRemarks, setBusinessLongitudeRemarks] = useState(GPS_NOT_REACHED_REMARK);

  /** Fill the section from a saved applicant (or reset it for a new one). */
  const load = (app: SavedApplicant) => {
    setProminentCustomers(savedList(app.prominentCustomers, blankCustomers()));
    setProminentSuppliers(savedList(app.prominentSuppliers, blankSuppliers()));
    // Older records stored the collateral address as `propertyAddress`
    const savedCollateralAddress = savedString(app.collateralAddress) || savedString(app.propertyAddress);
    setHasCollateral(app.hasCollateral !== undefined ? Boolean(app.hasCollateral) : Boolean(savedCollateralAddress));
    setCollateralAddress(savedCollateralAddress);
    setCollateralPropertyType(savedString(app.collateralPropertyType, 'Residential'));
    setCollateralPropertyArea(savedString(app.collateralPropertyArea));
    setCollateralPropertyUsage(savedString(app.collateralPropertyUsage));
    setCollateralValuation(savedString(app.collateralValuation));
    setCollateralRemarks(savedString(app.collateralRemarks));
    setBankingDetails(savedList(app.bankingDetails, blankBankAccounts()));
    setExistingLoans(savedList(app.existingLoans, blankLoans()));
    setCurrentObligation(savedString(app.currentObligation, NO_OBLIGATION));
    setBusinessLongitudeVerified(Boolean(app.businessLongitudeVerified));
    setBusinessLongitudeRemarks(savedString(app.businessLongitudeRemarks, GPS_NOT_REACHED_REMARK));
  };

  /** Fields saved with the applicant (same keys as before the section was extracted). */
  const values = {
    prominentCustomers,
    prominentSuppliers,
    hasCollateral,
    collateralAddress,
    collateralPropertyType,
    collateralPropertyArea,
    collateralPropertyUsage,
    collateralValuation,
    collateralRemarks,
    bankingDetails,
    existingLoans,
    currentObligation,
    businessLongitudeVerified,
    businessLongitudeRemarks,
  };

  return {
    ...values,
    values,
    load,
    setProminentCustomers,
    setProminentSuppliers,
    setHasCollateral,
    setCollateralAddress,
    setCollateralPropertyType,
    setCollateralPropertyArea,
    setCollateralPropertyUsage,
    setCollateralValuation,
    setCollateralRemarks,
    setBankingDetails,
    setExistingLoans,
    setCurrentObligation,
    setBusinessLongitudeVerified,
    setBusinessLongitudeRemarks,
  };
}

export type CustomerSupplierDetails = ReturnType<typeof useCustomerSupplierDetails>;
