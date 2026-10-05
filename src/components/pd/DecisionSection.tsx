import React from 'react';
import { AlertTriangle, Check, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { EXECUTIVE_SUMMARY_TITLES, type ExecutiveSummary } from '../../utils/pdSummaries';

export interface RiskAssessment {
  score: number;
  decision: string;
  flags: string[];
  strengths: string[];
}

interface DecisionSectionProps {
  applicantName: string;
  firmName: string;
  riskAssessment: RiskAssessment;
  summary: ExecutiveSummary;
  dscrRatio: number;
  foirPct: number;
  appliedAmount: number;
  figures: { monthlySales: number; netBusinessIncome: number; proposedEmi: number; postLoanSurplus: number };
  /** Role shown on the manager override panel; the panel is hidden when null. */
  managerRole: string | null;
  footer: React.ReactNode;
}

/** Tab 7: automated risk score, recommendation and executive summary. */
export const DecisionSection: React.FC<DecisionSectionProps> = ({
  applicantName,
  firmName,
  riskAssessment,
  summary,
  dscrRatio,
  foirPct,
  appliedAmount,
  figures,
  managerRole,
  footer,
}) => (
  <div className="space-y-6">
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#eb8a23]" />
            Automated Credit Assessment & Risk Scoring Report
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Real-time rule engine evaluation for {firmName} ({applicantName}).
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Quality Score</div>
            <div
              className="text-2xl font-black"
              style={{
                color: riskAssessment.score >= 80 ? '#10b981' : riskAssessment.score >= 60 ? '#f59e0b' : '#ef4444',
              }}
            >
              {riskAssessment.score} / 100
            </div>
          </div>
          <div className="relative w-20 h-10 overflow-hidden flex items-end">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={riskAssessment.score >= 80 ? '#10b981' : riskAssessment.score >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (riskAssessment.score / 100) * 125.6}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Decision Recommendation Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          riskAssessment.decision === 'APPROVED'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : riskAssessment.decision === 'CONDITIONAL'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-black uppercase tracking-wide">
              AUTOMATED RECOMMENDATION:{' '}
              {riskAssessment.decision === 'APPROVED' ? 'RECOMMENDED FOR SANCTION' : riskAssessment.decision}
            </div>
            <p className="text-xs font-medium mt-0.5 opacity-90">
              Applicant demonstrates adequate cash flow coverage with post-loan DSCR of {dscrRatio}x and FOIR of{' '}
              {foirPct}%. Recommended Sanction: ₹{appliedAmount.toLocaleString('en-IN')}.
            </p>
          </div>
        </div>
      </div>

      {/* Manager Override Section */}
      {managerRole && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase">Manager Override Actions</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Restricted to {managerRole}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => alert('Manual Override: Status changed to APPROVED')}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg shadow-sm text-xs font-bold transition"
            >
              Force Sanction
            </button>
            <button
              onClick={() => alert('Manual Override: Status changed to REJECTED')}
              className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg shadow-sm text-xs font-bold transition"
            >
              Force Decline
            </button>
            <button
              onClick={() => alert('File sent back for re-verification')}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm text-xs font-bold transition"
            >
              Request Re-Verification
            </button>
          </div>
        </div>
      )}

      {/* AUTOMATED EXECUTIVE SUMMARY CARD (DISPLAYED DIRECTLY AT RISK SCORE MENU) */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#eb8a23]" />
            <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider">
              Executive Appraisal Summary & Credit Synthesis
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            AUTOMATICALLY GENERATED
          </span>
        </div>

        <div className="prose prose-xs max-w-none text-slate-700 text-xs leading-relaxed space-y-3">
          {(Object.keys(EXECUTIVE_SUMMARY_TITLES) as Array<keyof ExecutiveSummary>).map((key) => (
            <p key={key}>
              <strong>{EXECUTIVE_SUMMARY_TITLES[key]}:</strong> {summary[key]}
            </p>
          ))}
        </div>

        {/* Financial Waterfall Summary Table */}
        <div className="pt-2">
          <div className="text-[11px] font-extrabold text-slate-600 uppercase mb-2">
            Key Financial Waterfall Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">Adopted Monthly Revenue</div>
              <div className="text-xs font-black text-[#2d3e50]">₹{figures.monthlySales.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">Net Business Operating Profit</div>
              <div className="text-xs font-black text-emerald-700">
                ₹{figures.netBusinessIncome.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">Proposed Monthly EMI</div>
              <div className="text-xs font-black text-blue-700">₹{figures.proposedEmi.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">Post-Loan Net Surplus</div>
              <div className="text-xs font-black text-[#eb8a23]">
                ₹{figures.postLoanSurplus.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Key Institutional Credit Strengths ({riskAssessment.strengths.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {riskAssessment.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Audit & Compliance Risk Flags ({riskAssessment.flags.length})
          </h4>
          {riskAssessment.flags.length === 0 ? (
            <p className="text-xs text-slate-500">No critical risk flags detected.</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {riskAssessment.flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    {footer}
  </div>
);
