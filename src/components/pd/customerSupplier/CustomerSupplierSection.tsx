import React from 'react';
import { Briefcase, MapPin, Plus, Trash2 } from 'lucide-react';
import type { CoApplicant } from '../../../types/applicant';
import { Field, SUB_LABEL, removeListItem, updateListItem } from '../formControls';
import { ContactListTable } from './ContactListTable';
import {
  GPS_NOT_REACHED_REMARK,
  GPS_VERIFIED_REMARK,
  newBankAccount,
  newContact,
  newExistingLoan,
  type CustomerSupplierDetails,
} from './useCustomerSupplierDetails';

interface CustomerSupplierSectionProps {
  details: CustomerSupplierDetails;
  /** Collateral property block (Ambit, Abhiyan, Moneyboxx LAP). */
  showCollateral: boolean;
  coApplicants: CoApplicant[];
  setCoApplicants: (coApplicants: CoApplicant[]) => void;
  gpsLat: number | '';
  gpsLng: number | '';
  setGpsLat: (lat: number) => void;
  setGpsLng: (lng: number) => void;
  statusOptions: string[];
  status: string;
  onStatusChange: (status: string) => void;
  footer: React.ReactNode;
}

/** Tab 4: customers, suppliers, collateral, banking, existing loans, co-applicant roles, GPS check, status. */
export const CustomerSupplierSection: React.FC<CustomerSupplierSectionProps> = ({
  details,
  showCollateral,
  coApplicants,
  setCoApplicants,
  gpsLat,
  gpsLng,
  setGpsLat,
  setGpsLng,
  statusOptions,
  status,
  onStatusChange,
  footer,
}) => {
  const {
    prominentCustomers,
    setProminentCustomers,
    prominentSuppliers,
    setProminentSuppliers,
    hasCollateral,
    setHasCollateral,
    collateralAddress,
    setCollateralAddress,
    collateralPropertyType,
    setCollateralPropertyType,
    collateralPropertyArea,
    setCollateralPropertyArea,
    collateralPropertyUsage,
    setCollateralPropertyUsage,
    collateralValuation,
    setCollateralValuation,
    collateralRemarks,
    setCollateralRemarks,
    bankingDetails,
    setBankingDetails,
    existingLoans,
    setExistingLoans,
    currentObligation,
    setCurrentObligation,
    businessLongitudeVerified,
    setBusinessLongitudeVerified,
    businessLongitudeRemarks,
    setBusinessLongitudeRemarks,
  } = details;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
          <Briefcase className="w-4 h-4 text-[#eb8a23]" />
          Customer & Supplier Details
        </h3>

        {/* A. Applicant's customer and supplier details */}
        <div className="space-y-6">
          <ContactListTable
            kind="Customer"
            phoneHeader="Customers Ph. No."
            namePlaceholder="Name"
            rows={prominentCustomers}
            setRows={setProminentCustomers}
            newRow={() => newContact('c')}
          />
          <ContactListTable
            kind="Supplier"
            phoneHeader="Supplier Ph. No."
            namePlaceholder="Name or 'Not applicable'"
            rows={prominentSuppliers}
            setRows={setProminentSuppliers}
            newRow={() => newContact('s')}
          />

          {/* Collateral Property Details (Ambit / Abhiyan / MoneyBoxx LAP Specific) */}
          {showCollateral && (
            <div className="pt-6 mt-6 border-t border-slate-200">
              <Field
                label="Include Collateral Property Details?"
                labelClassName="text-sm font-bold text-slate-700"
                className="flex items-center justify-between mb-4"
              >
                <div className="flex gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      checked={hasCollateral}
                      onChange={() => setHasCollateral(true)}
                      className="text-[#eb8a23]"
                    />{' '}
                    Yes
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      checked={!hasCollateral}
                      onChange={() => setHasCollateral(false)}
                      className="text-[#eb8a23]"
                    />{' '}
                    No
                  </label>
                </div>
              </Field>

              {hasCollateral && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Collateral Address"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2 col-span-1 md:col-span-2"
                  >
                    <input
                      type="text"
                      value={collateralAddress}
                      onChange={(e) => setCollateralAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="e.g. Tajganj Fatehabd Road Agra"
                    />
                  </Field>
                  <Field
                    label="Property Type"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2"
                  >
                    <select
                      value={collateralPropertyType}
                      onChange={(e) => setCollateralPropertyType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                    >
                      {['Residential', 'Commercial', 'Industrial', 'Agricultural'].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Approx. Property Area (sq. feet)"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={collateralPropertyArea}
                      onChange={(e) => setCollateralPropertyArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="e.g. 800-900"
                    />
                  </Field>
                  <Field
                    label="Property Usage"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={collateralPropertyUsage}
                      onChange={(e) => setCollateralPropertyUsage(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="e.g. This property is used for residential purposes."
                    />
                  </Field>
                  <Field
                    label="Approx Property Valuation"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={collateralValuation}
                      onChange={(e) => setCollateralValuation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="e.g. 8-10 Lakh"
                    />
                  </Field>
                  <Field
                    label="Remarks"
                    labelClassName="text-xs font-semibold text-slate-700"
                    className="space-y-2 col-span-1 md:col-span-2"
                  >
                    <textarea
                      value={collateralRemarks}
                      onChange={(e) => setCollateralRemarks(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="Ownership details, etc."
                      rows={2}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}
        </div>

        {/* B. Banking Details */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h5 className="font-bold text-xs text-slate-700">Banking Details and Limit OD and CC limit with bank</h5>
            <button
              type="button"
              onClick={() => setBankingDetails([...bankingDetails, newBankAccount('The account belongs to applicant')])}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Add Bank
            </button>
          </div>
          <div className="overflow-x-auto p-3 bg-white">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-2">Bank Name</th>
                  <th className="pb-2">Branch Name</th>
                  <th className="pb-2">Account Types</th>
                  <th className="pb-2">CC/OD Limit</th>
                  <th className="pb-2">Account No.</th>
                  <th className="pb-2">Remark</th>
                  <th className="pb-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankingDetails.map((bank, idx) => (
                  <tr key={bank.id}>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={bank.bankName}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'bankName', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="e.g. UCO Bank"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={bank.branchName}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'branchName', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="Branch"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={bank.accountType}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'accountType', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23] bg-white"
                      >
                        {['Saving Account', 'Current Account', 'OD', 'CC', 'Other'].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        list="limit-options"
                        type="text"
                        value={bank.limit}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'limit', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="Limit or NA"
                      />
                      <datalist id="limit-options">
                        <option value="NA" />
                        <option value="Not Disclosed" />
                      </datalist>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={bank.accountNo}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'accountNo', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="*******9522"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={bank.remark}
                        onChange={(e) =>
                          updateListItem(bankingDetails, setBankingDetails, idx, 'remark', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="Remark"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => removeListItem(bankingDetails, setBankingDetails, idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* C. Existing Loans / Liabilities */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h5 className="font-bold text-xs text-slate-700">Existing Loans / Liabilities</h5>
            <button
              type="button"
              onClick={() => setExistingLoans([...existingLoans, newExistingLoan()])}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Add Loan
            </button>
          </div>
          <div className="overflow-x-auto p-3 bg-white">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-2">Type of Loan</th>
                  <th className="pb-2">Financer Name</th>
                  <th className="pb-2">Loan Amount (In Lakhs)</th>
                  <th className="pb-2">EMI (Rs.)</th>
                  <th className="pb-2">Tenure (Y, M)</th>
                  <th className="pb-2">Balance Tenure</th>
                  <th className="pb-2">Remark</th>
                  <th className="pb-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {existingLoans.map((loan, idx) => (
                  <tr key={loan.id}>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={loan.typeOfLoan}
                        onChange={(e) =>
                          updateListItem(existingLoans, setExistingLoans, idx, 'typeOfLoan', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="NA"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={loan.financerName}
                        onChange={(e) =>
                          updateListItem(existingLoans, setExistingLoans, idx, 'financerName', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="NA"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={loan.amountInLakhs}
                        onChange={(e) =>
                          updateListItem(existingLoans, setExistingLoans, idx, 'amountInLakhs', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="Amount"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={loan.emi}
                        onChange={(e) => updateListItem(existingLoans, setExistingLoans, idx, 'emi', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="EMI"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={loan.tenure}
                        onChange={(e) => updateListItem(existingLoans, setExistingLoans, idx, 'tenure', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="e.g. 5, 0"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={loan.balanceTenure}
                        onChange={(e) =>
                          updateListItem(existingLoans, setExistingLoans, idx, 'balanceTenure', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="e.g. 2, 6"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={loan.remark}
                        onChange={(e) => updateListItem(existingLoans, setExistingLoans, idx, 'remark', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                        placeholder="No any existing obligation"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => removeListItem(existingLoans, setExistingLoans, idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Field
              label="Current Obligation"
              labelClassName="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap"
              className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100"
            >
              <input
                type="text"
                value={currentObligation}
                onChange={(e) => setCurrentObligation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                placeholder="e.g. No any existing obligation"
              />
            </Field>
          </div>
        </div>

        {/* D. Co-Applicant Business Details */}
        {coApplicants.length > 0 && (
          <Field
            label="Business Details of Co-applicants"
            labelClassName="block text-xs font-bold text-slate-700"
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6"
          >
            {coApplicants.map((coApp, idx) => (
              <div key={idx} className="border-t border-slate-200 pt-3 first:border-0 first:pt-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {coApp.name || `Co-applicant ${idx + 1}`} ({coApp.relation})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Salaried')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Salaried' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                    >
                      Salaried
                    </button>
                    <button
                      type="button"
                      onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Business')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Business' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                    >
                      Business
                    </button>
                    <button
                      type="button"
                      onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Other')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Other' || !coApp.profession ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                    >
                      Other / Not involved
                    </button>
                  </div>
                </div>
                {coApp.profession === 'Business' && (
                  <Field label="Details / Role in Business" labelClassName={SUB_LABEL}>
                    <textarea
                      value={coApp.businessRole || ''}
                      onChange={(e) =>
                        updateListItem(coApplicants, setCoApplicants, idx, 'businessRole', e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                      placeholder="Specify role, shareholding, responsibilities..."
                      rows={2}
                    />
                  </Field>
                )}
              </div>
            ))}
          </Field>
        )}

        {/* E. Latitude & Longitude Remarks */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6">
          <label className="block text-xs font-bold text-slate-700">
            Latitude & Longitude of the Business Premises
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={gpsLat}
                onChange={(e) => setGpsLat(Number(e.target.value))}
                className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]"
                placeholder="Lat (e.g. 25.6)"
              />
              <input
                type="number"
                step="any"
                value={gpsLng}
                onChange={(e) => setGpsLng(Number(e.target.value))}
                className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]"
                placeholder="Lng (e.g. 86.1)"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setGpsLat(pos.coords.latitude);
                      setGpsLng(pos.coords.longitude);
                    },
                    (err) => {
                      alert('Geolocation error: ' + err.message);
                    },
                  );
                } else {
                  alert('Geolocation is not supported by this browser.');
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-[#2d3e50] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition"
            >
              <MapPin className="w-3 h-3" /> Get Location
            </button>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <Field
              label="Location Verified by GPS?"
              labelClassName="block text-[10px] uppercase font-bold text-slate-500"
              className="flex items-center justify-between mb-2"
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBusinessLongitudeVerified(true);
                    setBusinessLongitudeRemarks(GPS_VERIFIED_REMARK);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded border ${businessLongitudeVerified ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                >
                  Yes, Verified
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBusinessLongitudeVerified(false);
                    setBusinessLongitudeRemarks(GPS_NOT_REACHED_REMARK);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded border ${!businessLongitudeVerified ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                >
                  No, Navigation Failed
                </button>
              </div>
            </Field>
            <textarea
              value={businessLongitudeRemarks}
              onChange={(e) => setBusinessLongitudeRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold"
              rows={2}
            />
          </div>
        </div>

        {/* G. Business Status */}
        <Field
          label="Business Status (Recommendation)"
          labelClassName="block text-xs font-bold text-slate-700"
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-6"
        >
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt, optIdx) => (
              <button
                key={opt}
                type="button"
                onClick={() => onStatusChange(opt)}
                className={`px-6 py-2.5 text-xs font-bold rounded-lg border ${
                  status === opt
                    ? optIdx === 0
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : optIdx === 1
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>
      </div>
      {footer}
    </div>
  );
};
