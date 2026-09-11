import React, { useState, useEffect } from 'react';
import { ClientBank, TemplateFieldSchema } from '../data/clientBanksData';
import { Download, FileSpreadsheet, Calculator } from 'lucide-react';

interface DynamicTemplateViewProps {
  client: ClientBank;
  onBack: () => void;
}

export const DynamicTemplateView: React.FC<DynamicTemplateViewProps> = ({ client, onBack }) => {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const schema = client.templateSchema || [];

  // Implement real-time formula evaluation
  useEffect(() => {
    if (!schema.length) return;

    const formulaFields = schema.filter(f => f.type === 'formula' && f.formula);
    if (!formulaFields.length) return;

    let hasChanges = false;
    const newData = { ...formData };

    formulaFields.forEach(field => {
      let expression = field.formula!;
      
      // Replace all tags with their current values
      // e.g. {{Income}} - {{Expense}}
      const tagRegex = /\{\{([^}]+)\}\}/g;
      expression = expression.replace(tagRegex, (match, p1) => {
        const val = newData[p1.trim()];
        return val !== undefined && val !== '' ? String(val) : '0';
      });

      try {
        // Safe evaluation for simple math formulas
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + expression)();
        if (newData[field.fieldName] !== result && !isNaN(result)) {
          newData[field.fieldName] = Number(result.toFixed(2));
          hasChanges = true;
        }
      } catch (e) {
        // invalid formula state (e.g. empty fields causing syntax error)
      }
    });

    if (hasChanges) {
      setFormData(newData);
    }
  }, [formData, schema]);

  const handleChange = (fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveToDB = async () => {
    try {
      const payload = {
        appIdRefNo: `DYN-${Date.now().toString().slice(-6)}`,
        financialInstitute: client.name,
        applicantEntity: formData['Applicant Name'] || formData['Name'] || 'Dynamic Applicant',
        product: 'Custom Loan',
        city: 'Not Provided',
        loanAmountRequested: 0,
        contactNo: '',
        formData: formData
      };

      const response = await fetch(`/api/clients/${client.id}/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Applicant data saved to database successfully!');
      } else {
        alert('Failed to save applicant data.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save applicant data.');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-excel-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateFileBase64: client.templateFileBase64,
          formData
        })
      });

      const data = await response.json();
      if (data.success && data.fileBase64) {
        const a = document.createElement('a');
        a.href = data.fileBase64;
        a.download = `${client.name}_Report_${Date.now()}.xlsx`;
        a.click();
      } else {
        alert('Failed to generate report: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while generating the report.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!schema.length) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Schema Detected</h2>
        <p className="text-slate-500 mb-4">This client does not have an active custom Excel schema configured.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#2d3e50]">{client.name} - Dynamic PD Form</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Fill out the required variables below to generate the formatted Excel report.</p>
        </div>
        <FileSpreadsheet className="w-10 h-10 text-[#eb8a23]" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schema.map((field) => (
            <div key={field.fieldName} className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e50] uppercase tracking-wider">
                {field.fieldName}
                {field.type === 'formula' && <Calculator className="w-3 h-3 text-[#eb8a23]" />}
              </label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={formData[field.fieldName] || ''}
                  onChange={e => handleChange(field.fieldName, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eb8a23] transition-all"
                  placeholder={`Enter ${field.fieldName}`}
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  value={formData[field.fieldName] || ''}
                  onChange={e => handleChange(field.fieldName, parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eb8a23] transition-all"
                  placeholder="0.00"
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  value={formData[field.fieldName] || ''}
                  onChange={e => handleChange(field.fieldName, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eb8a23] transition-all"
                />
              )}

              {field.type === 'formula' && (
                <input
                  type="text"
                  value={formData[field.fieldName] || ''}
                  readOnly
                  className="w-full px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-mono font-bold"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveToDB}
          className="px-6 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all"
        >
          Save to DB
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-8 py-3 font-black text-white bg-[#eb8a23] rounded-xl hover:bg-[#d97917] transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Excel Report'}
        </button>
      </div>
    </div>
  );
};
