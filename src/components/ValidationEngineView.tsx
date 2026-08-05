import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, RefreshCw, ArrowRight } from 'lucide-react';

export const ValidationEngineView: React.FC = () => {
  const [category, setCategory] = useState('kirana');
  const [grossRev, setGrossRev] = useState('280000');
  const [footfall, setFootfall] = useState('45');
  const [ticketSize, setTicketSize] = useState('220');
  const [operatingDays, setOperatingDays] = useState('26');
  const [bankCredits, setBankCredits] = useState('210000');
  const [drugLicence, setDrugLicence] = useState('Yes – Valid');

  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const xchkCalc = Number(footfall) * Number(ticketSize) * Number(operatingDays);
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category,
          formData: {
            gross_rev: grossRev,
            xchk_result: xchkCalc,
            xc_bank_credits: bankCredits,
            drug_licence: drugLicence
          }
        })
      });
      const data = await res.json();
      setValidationResult({
        ...data,
        computedXchkRev: xchkCalc
      });
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#eb8a23]" />
            Financial & Business Cross-Validation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Automated verification cross-checking footfall vs stated revenue, bank credit reflection, GST turnover ratios, and category compliance rules.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isValidating}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-semibold text-xs rounded-md shadow-sm transition"
        >
          {isValidating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Shield className="w-4 h-4" />}
          Run Live Validation Checks
        </button>
      </div>

      {/* Input Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Financial Parameters</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Select Business Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
              >
                <option value="kirana">Kirana / General Store</option>
                <option value="hardware">Hardware & Sanitary</option>
                <option value="apparel">Apparel & Footwear</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="restaurant">Restaurant</option>
                <option value="transport">Transport</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Stated Monthly Gross Revenue (₹)</label>
              <input
                type="number"
                value={grossRev}
                onChange={(e) => setGrossRev(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Cust / Day</label>
                <input
                  type="number"
                  value={footfall}
                  onChange={(e) => setFootfall(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Ticket (₹)</label>
                <input
                  type="number"
                  value={ticketSize}
                  onChange={(e) => setTicketSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Days / Mo</label>
                <input
                  type="number"
                  value={operatingDays}
                  onChange={(e) => setOperatingDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Bank Statement Monthly Credits (₹)</label>
              <input
                type="number"
                value={bankCredits}
                onChange={(e) => setBankCredits(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
              />
            </div>

            {category === 'pharmacy' && (
              <div>
                <label className="text-xs font-semibold text-slate-700">Drug License Status</label>
                <select
                  value={drugLicence}
                  onChange={(e) => setDrugLicence(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded p-2 mt-1 focus:outline-none focus:border-blue-600"
                >
                  <option>Yes – Valid</option>
                  <option>Yes – Expired</option>
                  <option>No</option>
                </select>
              </div>
            )}

            <button
              onClick={handleRunValidation}
              className="w-full py-2.5 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded font-semibold text-xs transition shadow-sm mt-2"
            >
              Execute Validation
            </button>
          </div>
        </div>

        {/* Validation Output Screen */}
        <div className="lg:col-span-2 space-y-4">
          {validationResult ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Risk Assessment</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-lg font-bold px-3 py-1 rounded-md border ${
                      validationResult.overallRiskLevel === 'LOW'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : validationResult.overallRiskLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {validationResult.overallRiskLevel} RISK
                    </span>

                    <span className="text-xs text-slate-600 font-semibold">
                      Risk Score: <strong className="text-blue-600">{validationResult.riskScore}/100</strong> (Grade: {validationResult.financialHealthGrade})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Footfall Cross-Check Calculated</div>
                  <div className="text-base font-bold text-green-600">₹{validationResult.computedXchkRev.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Anomalies & Issues Found */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Detected Risk Anomalies ({validationResult.anomaliesDetected.length})
                </h4>

                {validationResult.anomaliesDetected.length > 0 ? (
                  <div className="space-y-2">
                    {validationResult.anomaliesDetected.map((issue: any) => (
                      <div key={issue.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{issue.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>
                        <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> Action: {issue.suggestedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    No financial anomalies detected! All footfall and banking credit cross-checks align within standard tolerance bands.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
              <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Click "Execute Validation" or "Run Live Validation Checks" to run automated consistency algorithms on the test financial inputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
