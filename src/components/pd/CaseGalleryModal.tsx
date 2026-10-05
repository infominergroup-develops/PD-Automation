import React, { useMemo, useState } from 'react';
import { CheckCheck, CheckCircle2, RotateCcw, Search, Trash2, UserCheck, Users, X, Zap } from 'lucide-react';
import type { GalleryApplicant } from '../../types/applicant';
import { UNRECORDED_PREPARER, countCases, isCaseClosed, sortLatestFirst } from './caseList';

type StatusFilter = 'ALL' | 'OPEN' | 'CLOSED';

interface CaseGalleryModalProps {
  applicants: GalleryApplicant[];
  loading: boolean;
  /** Close / re-open / delete cases and see per-employee report counts (Manager, Admin). */
  canManageCases: boolean;
  /** Delete every applicant across all clients (Admin). */
  canDeleteAll: boolean;
  onClose: () => void;
  onLoad: (app: GalleryApplicant) => void;
  onToggleClosed: (app: GalleryApplicant) => void;
  onDelete: (app: GalleryApplicant) => void;
  onDeleteAll: () => void;
}

/** "1-Click Load Application Cases" modal: browse, filter and open saved applicants. */
export const CaseGalleryModal: React.FC<CaseGalleryModalProps> = ({
  applicants,
  loading,
  canManageCases,
  canDeleteAll,
  onClose,
  onLoad,
  onToggleClosed,
  onDelete,
  onDeleteAll,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [preparedByFilter, setPreparedByFilter] = useState('ALL');

  const { open: openCasesCount, closed: closedCasesCount } = useMemo(() => countCases(applicants), [applicants]);

  // PD report count per preparing employee, highest first
  const preparedByCounts = useMemo(() => {
    const counts = new Map<string, number>();
    applicants.forEach((app) => {
      const name = app.preparedBy || UNRECORDED_PREPARER;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [applicants]);

  const visibleCases = useMemo(() => {
    let list = applicants;
    if (statusFilter !== 'ALL') list = list.filter((app) => isCaseClosed(app) === (statusFilter === 'CLOSED'));
    if (preparedByFilter !== 'ALL')
      list = list.filter((app) => (app.preparedBy || UNRECORDED_PREPARER) === preparedByFilter);
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((app) =>
        [app.applicationNumber, app.applicantName, app.firmName, app.bankName, app.categoryName, app.preparedBy].some(
          (value) => value?.toLowerCase().includes(query),
        ),
      );
    }
    return sortLatestFirst(list);
  }, [applicants, statusFilter, preparedByFilter, searchQuery]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#384c5e] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h3 className="font-bold text-sm">1-Click Load Application Cases</h3>
              <p className="text-[11px] text-slate-300">
                Select any pre-audited loan file to instantly auto-populate all 5 PD Studio modules.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-xl">
            &times;
          </button>
        </div>

        {/* Filter Tabs, Search Bar & Admin Actions */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search in Gallery */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, app #, bank, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-[#2d3e50] focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === 'ALL' ? 'bg-white text-[#2d3e50] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({applicants.length})
              </button>
              <button
                onClick={() => setStatusFilter('OPEN')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  statusFilter === 'OPEN' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                Open ({openCasesCount})
              </button>
              <button
                onClick={() => setStatusFilter('CLOSED')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  statusFilter === 'CLOSED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Closed / Delivered ({closedCasesCount})
              </button>
            </div>

            {/* Admin Danger Delete All Button */}
            {canDeleteAll && applicants.length > 0 && (
              <button
                onClick={onDeleteAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm ml-auto"
              >
                <Trash2 className="w-3 h-3" />
                Delete All Applicants
              </button>
            )}
          </div>

          {/* PD Reports Prepared per Employee (Manager / Admin only) */}
          {canManageCases && preparedByCounts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 mr-1">
                <Users className="w-3.5 h-3.5" /> PD Reports by Employee:
              </span>
              <button
                onClick={() => setPreparedByFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg border font-bold transition ${
                  preparedByFilter === 'ALL'
                    ? 'bg-[#384c5e] text-white border-[#384c5e]'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                }`}
              >
                Everyone ({applicants.length})
              </button>
              {preparedByCounts.map(([name, count]) => (
                <button
                  key={name}
                  onClick={() => setPreparedByFilter(preparedByFilter === name ? 'ALL' : name)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition ${
                    preparedByFilter === name
                      ? 'bg-[#eb8a23] text-white border-[#eb8a23]'
                      : 'bg-white text-[#2d3e50] border-slate-300 hover:border-[#eb8a23]'
                  }`}
                >
                  {name} <span className="font-black">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Application Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCases.length === 0 && !loading && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">📂</div>
              <p className="font-bold text-sm">No applications found</p>
              <p className="text-xs mt-1">
                {statusFilter === 'CLOSED'
                  ? 'No closed/delivered cases yet. Managers and Admins can mark completed cases as closed.'
                  : statusFilter === 'OPEN'
                    ? 'No open cases matching your filter.'
                    : 'Click "+ New Applicant" to create your first entry.'}
              </p>
            </div>
          )}
          {visibleCases.map((app) => {
            const isClosed = isCaseClosed(app);
            return (
              <div
                key={app._id || app.applicationNumber}
                className={`rounded-2xl p-4 transition flex flex-col justify-between space-y-3 relative ${
                  isClosed
                    ? 'bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/30 border-2 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                    : 'bg-white border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs text-[#eb8a23] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      #{app.applicationNumber}
                    </span>
                    {isClosed ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 text-white border border-emerald-700 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <CheckCheck className="w-3 h-3" /> CLOSED (DELIVERED)
                      </span>
                    ) : (
                      app.riskScore !== undefined && (
                        // Records saved before the risk score was stored have no badge
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            app.riskScore >= 80
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {app.riskScore >= 80 ? 'APPROVED' : 'CONDITIONAL'}
                        </span>
                      )
                    )}
                  </div>

                  {/* Closed Status Delivery Banner */}
                  {isClosed && (
                    <div className="bg-emerald-100/70 border border-emerald-300/90 rounded-xl p-2.5 text-xs text-emerald-950 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-[11px] leading-tight text-emerald-950">
                          Case Report Completed & Delivered
                        </p>
                        <p className="text-[10px] text-emerald-800 font-medium">
                          {app.closedAt
                            ? `Delivered: ${new Date(app.closedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'Delivered to client'}
                          {app.closedBy ? ` • by ${app.closedBy}` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-black text-[#2d3e50]">{app.applicantName}</h4>
                    <p className="text-xs font-bold text-slate-600">{app.firmName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {app.categoryName} • {app.constitution}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3 h-3 text-[#eb8a23]" />
                      Prepared by:{' '}
                      <span className="font-bold text-[#2d3e50]">{app.preparedBy || UNRECORDED_PREPARER}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Client Bank:</span>
                      <span className="font-bold text-[#2d3e50]">{app.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Applied Amount:</span>
                      <span className="font-extrabold text-emerald-700">
                        ₹{(app.appliedAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">CIBIL / Vintage:</span>
                      <span className="font-bold text-slate-700">Vintage: {app.yearsInBusiness} yrs</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => onLoad(app)}
                    className={`w-full py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs group ${
                      isClosed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Load {app.applicantName ? app.applicantName : `App #${app.applicationNumber}`}
                  </button>

                  {canManageCases && (
                    <div className="flex items-center gap-1.5">
                      {isClosed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleClosed(app);
                          }}
                          className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-300 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          title="Re-open this case for further editing"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Re-open Case
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleClosed(app);
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs"
                          title="Mark this case report as completed and delivered to the client"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark as Closed (Delivered)
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(app);
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-300 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
