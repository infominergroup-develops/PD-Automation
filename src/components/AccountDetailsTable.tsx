import React from 'react';
import { CreditAccount, CreditProvider } from '../types/creditTypes';

interface AccountRow extends CreditAccount {
  provider?: CreditProvider;
  reportId?: string;
}

interface AccountDetailsTableProps {
  accounts: AccountRow[];
  title?: string;
  subtitle?: string;
}

export const AccountDetailsTable: React.FC<AccountDetailsTableProps> = ({
  accounts,
  title = 'Tradelines & Account Level Facilities',
  subtitle = 'Granular loan-level facilities, repayment statuses and overdue balances',
}) => {
  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#fcfcfc]">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-[#2d3e50] uppercase text-xs tracking-widest">
            {title} ({accounts.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• {subtitle}</span>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs font-medium">
          No tradelines match the selected filters or search parameters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#2d3e50] text-white uppercase text-[10px] font-bold tracking-wider sticky top-0">
              <tr>
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Facility Type</th>
                <th className="py-3 px-4">Lending Institution</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Disbursed Date</th>
                <th className="py-3 px-4 text-right">Disbursed Amt</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
                <th className="py-3 px-4 text-right">Overdue Amt</th>
                <th className="py-3 px-4 text-right">EMI Instalment</th>
                <th className="py-3 px-4 text-center">Tenure</th>
                <th className="py-3 px-4 text-center">ROI</th>
                <th className="py-3 px-4">Last Paid</th>
                <th className="py-3 px-4">As On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {accounts.map((acc, idx) => {
                const isOverdue = (acc.overdueAmount || 0) > 0;
                return (
                  <tr
                    key={acc.id || `acc_${idx}`}
                    className={`hover:bg-[#fff9f2] transition-colors ${
                      isOverdue ? 'bg-red-50/20' : idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4 font-bold text-[#1e293b]">
                      {acc.applicantName || '—'}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="bg-[#f1f5f9] text-[#2d3e50] px-2 py-0.5 rounded text-[11px] font-mono border border-[#e2e8f0]">
                        {acc.accountType || 'Loan Facility'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#2d3e50]">
                      {acc.creditGrantor || 'Credit Institution'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {acc.lenderType || 'Bank'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          acc.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {acc.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {acc.disbursedDate || '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-800 font-mono">
                      {formatCurrency(acc.disbursedAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#1e293b] font-mono">
                      {formatCurrency(acc.currentBalance)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      {isOverdue ? (
                        <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                          {formatCurrency(acc.overdueAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700 font-mono">
                      {formatCurrency(acc.instalmentAmount)}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600 text-[11px] font-mono">
                      {acc.tenureMonths ? `${acc.tenureMonths}m` : '—'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                      {acc.interestRate ? `${acc.interestRate}%` : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {acc.lastPaymentDate || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {acc.asOnDate || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
