import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { removeListItem, updateListItem } from '../formControls';
import type { ContactRow } from './useCustomerSupplierDetails';

interface ContactListTableProps {
  /** "Customer" or "Supplier". */
  kind: string;
  /** Column header for the phone number, e.g. "Customers Ph. No.". */
  phoneHeader: string;
  namePlaceholder: string;
  rows: ContactRow[];
  setRows: (rows: ContactRow[]) => void;
  newRow: () => ContactRow;
}

/** Editable list of prominent customers or suppliers: name, phone and feedback remark. */
export const ContactListTable: React.FC<ContactListTableProps> = ({
  kind,
  phoneHeader,
  namePlaceholder,
  rows,
  setRows,
  newRow,
}) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
      <h5 className="font-bold text-xs text-slate-700">Prominent {kind}s</h5>
      <button
        type="button"
        onClick={() => setRows([...rows, newRow()])}
        className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm"
      >
        <Plus className="w-3 h-3" /> Add {kind}
      </button>
    </div>
    <div className="overflow-x-auto p-3 bg-white">
      <table className="w-full text-xs text-left text-slate-600">
        <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
          <tr>
            <th className="pb-2 w-10 text-center">Sr. No.</th>
            <th className="pb-2">Prominent {kind}s (Name)</th>
            <th className="pb-2">{phoneHeader}</th>
            <th className="pb-2">Feedback (Remark)</th>
            <th className="pb-2 w-10 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td className="py-2 text-center font-bold text-slate-400">{idx + 1}</td>
              <td className="py-2 pr-2">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateListItem(rows, setRows, idx, 'name', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                  placeholder={namePlaceholder}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  type="text"
                  value={row.phone}
                  onChange={(e) => updateListItem(rows, setRows, idx, 'phone', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                  placeholder="Phone"
                  maxLength={10}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  type="text"
                  value={row.feedback ?? row.remark ?? ''}
                  onChange={(e) => updateListItem(rows, setRows, idx, 'feedback', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]"
                  placeholder="Feedback"
                />
              </td>
              <td className="py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeListItem(rows, setRows, idx)}
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
);
