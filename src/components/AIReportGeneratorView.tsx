import React, { useState } from 'react';
import { Sparkles, Printer, Download, Edit3, CheckCircle, RefreshCw, FileText, Building2 } from 'lucide-react';
import { openStandardPDReportPrintWindow } from '../utils/pdReportPrinter';

interface AIReportGeneratorViewProps {
  reportData?: any;
}

export const AIReportGeneratorView: React.FC<AIReportGeneratorViewProps> = ({ reportData }) => {
  const [applicantName, setApplicantName] = useState(reportData?.applicantName || 'Ramesh Chandra Sharma');
  const [firmName, setFirmName] = useState(reportData?.firmName || 'Sharma Super Kirana & General Store');
  const [categoryName, setCategoryName] = useState(reportData?.categoryName || 'Kirana / General Store');
  const [appliedAmount, setAppliedAmount] = useState(reportData?.appliedAmount || 350000);

  const [aiReportText, setAiReportText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [modelName, setModelName] = useState('');

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          firmName,
          categoryName,
          appliedAmount: Number(appliedAmount),
          financials: reportData?.financials || {
            adoptedRevenue: 275000,
            grossProfit: 68750,
            grossMarginPct: 25,
            netBusinessIncome: 40750,
            netMonthlySurplus: 20750,
            dscr: 5.15,
            postLoanDscr: 1.11
          },
          observations: reportData?.observations || {
            vintage: '12 years',
            footfall: '85 customers/day verified',
            repaymentTrack: 'Satisfactory'
          }
        })
      });
      const data = await res.json();
      setAiReportText(data.narrative);
      setIsAiPowered(data.isAiGenerated);
      setModelName(data.modelUsed);
    } catch (err: any) {
      console.error('AI generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintCompanyStandardPdf = () => {
    const fin = reportData?.financials || {};
    openStandardPDReportPrintWindow({
      applicantName: applicantName,
      firmName: firmName,
      loanAmount: appliedAmount,
      loanType: `${categoryName} Micro Loan`,
      applicationNumber: reportData?.applicationNumber || 'INF/2026/88492',
      clientBankName: reportData?.agencyName || 'Moneyboxx Finance Limited',
      statusOfCase: reportData?.status || 'Recommended',
      applicantPhone: '9876543210',
      coApplicantName: 'Mrs. Rubi Devi (Spouse)',
      coApplicantPhone: '8252240942',
      loanPurpose: `Operational enhancement and stock inventory expansion for ${firmName}.`,
      residenceAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',
      businessAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',
      metPersonName: `${applicantName} (Self) & Spouse`,
      metPersonIdProof: reportData?.panNumber || 'PAN Card / Aadhaar',
      executiveName: 'Mr. Sumit (Infominer Field Inspector)',

      // Financial Waterfall
      totalSalesMonthly: fin.adoptedRevenue || 275000,
      totalSalesYearly: (fin.adoptedRevenue || 275000) * 12,
      totalExpensesMonthly: fin.totalOperatingExpenses || 124100,
      totalExpensesYearly: (fin.totalOperatingExpenses || 124100) * 12,
      netProfitMonthly: fin.netBusinessIncome || 110540,
      netProfitYearly: (fin.netBusinessIncome || 110540) * 12,
      existingEmiMonthly: fin.existingEmisSum || 0,
      existingEmiYearly: (fin.existingEmisSum || 0) * 12,
      householdExpensesMonthly: fin.totalHouseholdExpenses || 15000,
      householdExpensesYearly: (fin.totalHouseholdExpenses || 15000) * 12,
      netDisposalIncomeMonthly: fin.netMonthlySurplus || 95540,
      netDisposalIncomeYearly: (fin.netMonthlySurplus || 95540) * 12,

      dscrRatio: fin.dscr || 1.45,
      foirPct: fin.foirPct || 42,
      cibilScore: 748,
      riskScore: 88,
      proposedEmi: fin.proposedEmi || 18200,
      postLoanSurplus: fin.postLoanNetSurplus || 77340,

      // AI Summary Text
      aiExecutiveSummary: aiReportText || `Field verification and financial appraisal completed for ${applicantName} (${firmName}). Applicant shows strong monthly operating surplus and clean local standing.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#eb8a23]" />
            AI Credit Analyst Narrative Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Server-side Gemini AI transforms raw field observations, footfall counts, and financial waterfalls into a formal Credit Manager appraisal report.
          </p>
        </div>

        <button
          onClick={handleGenerateAiReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-semibold text-xs rounded-md shadow-sm transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Synthesizing Credit Report...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              Generate AI Credit Report
            </>
          )}
        </button>
      </div>

      {/* Input Form Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-700">Applicant Name</label>
          <input
            type="text"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Firm Name</label>
          <input
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Loan Facility (₹)</label>
          <input
            type="number"
            value={appliedAmount}
            onChange={(e) => setAppliedAmount(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Generated Report Output Canvas */}
      {aiReportText ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs font-bold text-slate-800">Synthesized Appraisal Narrative</span>
              <span className="text-[10px] bg-slate-100 text-blue-800 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold">
                {modelName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintCompanyStandardPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2d3e50] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#eb8a23]" />
                Print Standard Company PD Report
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-slate-800 text-xs leading-relaxed font-sans space-y-3">
            <textarea
              value={aiReportText}
              onChange={(e) => setAiReportText(e.target.value)}
              rows={22}
              className="w-full bg-transparent text-slate-800 text-xs font-mono focus:outline-none resize-y"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
          <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">AI Credit Report Ready to Synthesize</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click "Generate AI Credit Report" above to trigger Gemini 3.6 Flash server-side appraisal narrative compilation.
          </p>
        </div>
      )}
    </div>
  );
};
