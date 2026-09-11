import React, { useState, useEffect } from 'react';
import { ClientBank, TemplateFieldSchema } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';
import { InfominerLogo } from './InfominerLogo';
import { api } from '../services/api';
import { Building2, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Building, Layers } from 'lucide-react';
import { EmployeeRecord } from '../services/api';

interface ClientSelectionViewProps {
  selectedCompany?: Company | null;
  selectedClient: ClientBank | null;
  onSelectClient: (client: ClientBank) => void;
  onContinue: () => void;
  currentUser?: EmployeeRecord | null;
}

export const ClientSelectionView: React.FC<ClientSelectionViewProps> = ({
  selectedCompany,
  selectedClient,
  onSelectClient,
  onContinue,
  currentUser,
}) => {
  const [customBankName, setCustomBankName] = useState('');
  const [customDivision, setCustomDivision] = useState('');
  const [templateFormat, setTemplateFormat] = useState<'standard' | 'pdf' | 'excel'>('standard');
  const [templateFileBase64, setTemplateFileBase64] = useState<string>('');
  const [clients, setClients] = useState<ClientBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [extractedSchema, setExtractedSchema] = useState<TemplateFieldSchema[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    api.getClients().then(fetchedClients => {
      let finalClients = [...fetchedClients];
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
        finalClients.push({
          id: 'custom',
          name: 'Add Custom Client',
          shortCode: 'NEW',
          division: 'New Configuration',
          logoColor: '#e2e8f0',
          accentColor: '#94a3b8',
          borderClass: 'border-slate-300 border-dashed border-2',
          bgGradient: 'from-slate-50 to-white',
          description: 'Configure a new banking partner with custom PDF/Excel templates.',
          defaultScheme: 'Custom',
          tagline: 'Admin Only'
        });
      }
      setClients(finalClients);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [currentUser]);

  const handleChooseBank = (bank: ClientBank) => {
    onSelectClient(bank);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (templateFormat === 'excel') {
        setIsExtracting(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/parse-excel-template', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          if (data.success && data.schema) {
            setExtractedSchema(data.schema);
          }
        } catch (err) {
          console.error('Failed to parse excel:', err);
        } finally {
          setIsExtracting(false);
        }
      }
    }
  };

  const handleCustomConfirm = async () => {
    if (!customBankName.trim()) return;
    const customBank: ClientBank = {
      id: 'custom-' + Date.now(),
      name: customBankName.trim(),
      shortCode: customBankName.trim().substring(0, 5).toUpperCase(),
      division: customDivision.trim() || `${customBankName.trim()} Micro Lending Division`,
      logoColor: '#2D3E50',
      accentColor: '#eb8a23',
      borderClass: 'border-[#2D3E50]',
      bgGradient: 'from-slate-100 to-amber-50',
      description: 'Custom client partner configuration for specialized underwriting.',
      defaultScheme: `${customBankName.trim()} Express Facility`,
      tagline: 'Custom Financial Partner',
      templateFormat,
      templateFileBase64,
      templateSchema: extractedSchema || undefined
    };
    try {
      const savedBank = await api.saveClient(customBank);
      setClients(prev => [...prev, savedBank]);
      onSelectClient(savedBank);
    } catch (err) {
      console.error('Failed to save client:', err);
      onSelectClient(customBank);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 font-sans text-[#2d3e50]">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-[#d97917] rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Multi-Bank Enterprise Suite
          </div>
          
          <div className="flex justify-center items-center gap-2">
             {selectedCompany?.id === 'infominers' ? (
               <InfominerLogo size="lg" showText={true} textColor="dark" />
             ) : (
               <>
                 <Building2 className="w-10 h-10 text-[#eb8a23]" />
                 <span className="text-2xl font-bold text-[#2d3e50]">{selectedCompany?.name || 'PD Automation Engine'}</span>
               </>
             )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#2d3e50] tracking-tight">
            Select Client Bank / Financial Partner
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
            Welcome back, <span className="font-bold text-[#2d3e50]">{currentUser?.name || 'Credit Officer'}</span>. Select the banking client for which you are conducting Personal Discussion (PD) credit appraisals.
          </p>
        </div>

        {/* Bank Selection Grid */}
        {loading ? (
          <div className="text-center p-10 text-slate-500 font-bold animate-pulse">Loading Clients from Database...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((bank) => {
              const isSelected = selectedClient?.id === bank.id;
            return (
              <div
                key={bank.id}
                onClick={() => handleChooseBank(bank)}
                className={`group relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#eb8a23] ring-2 ring-[#eb8a23]/20 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#eb8a23]">
                    <CheckCircle2 className="w-5 h-5 fill-[#eb8a23] text-white" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl font-black text-white text-xs tracking-tight flex items-center justify-center shadow-xs uppercase shrink-0"
                      style={{ backgroundColor: bank.logoColor }}
                    >
                      {bank.shortCode}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#2d3e50] group-hover:text-[#eb8a23] transition-colors">
                        {bank.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {bank.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {bank.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    {bank.shortCode} Division
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-[#eb8a23]' : 'text-slate-400'}`}>
                    {isSelected ? 'Selected' : 'Select Client'}
                  </span>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Custom Bank Option Modal / Expanded Input if Custom selected */}
        {selectedClient?.id === 'custom' && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-[#d97917] uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Custom Bank / Financial Institution Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3e50] mb-1">
                  Bank / NBFC Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandhan Bank / Bajaj Finance"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2d3e50] mb-1">
                  Credit Division / Dept Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Micro & Small Business Loans"
                  value={customDivision}
                  onChange={(e) => setCustomDivision(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3e50] mb-1">Template Format</label>
                <select 
                  value={templateFormat} 
                  onChange={(e) => setTemplateFormat(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                >
                  <option value="standard">Standard Web HTML</option>
                  <option value="pdf">AcroForm PDF Template</option>
                  <option value="excel">Excel {'{{tags}}'} Template</option>
                </select>
              </div>
              
              {(templateFormat === 'pdf' || templateFormat === 'excel') && (
                <div>
                  <label className="block text-xs font-bold text-[#2d3e50] mb-1">Upload Template File</label>
                  <input
                    type="file"
                    accept={templateFormat === 'pdf' ? '.pdf' : '.xlsx,.xls'}
                    onChange={handleFileUpload}
                    className="w-full text-xs"
                  />
                  {templateFormat === 'excel' && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Ensure your Excel file contains tags formatted exactly like <span className="font-mono text-[#eb8a23]">{'{{VariableName}}'}</span> inside the cells.
                    </p>
                  )}
                </div>
              )}
            </div>

            {isExtracting && <div className="text-xs text-[#eb8a23] font-bold animate-pulse mt-2">Extracting fields from Excel...</div>}

            {extractedSchema && extractedSchema.length === 0 && !isExtracting && (
              <div className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 p-2 rounded mt-2">
                No valid {'{{tags}}'} found in the uploaded Excel file. Please update your template and re-upload.
              </div>
            )}
            
            {extractedSchema && extractedSchema.length > 0 && !isExtracting && (
              <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#2d3e50]">Map Extracted Variables (Optional)</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {extractedSchema.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
                      <span className="text-xs font-mono font-bold w-1/3 truncate text-slate-700">{field.fieldName}</span>
                      <select
                        className="w-1/3 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#eb8a23]"
                        value={field.type}
                        onChange={(e) => {
                          const newSchema = [...extractedSchema];
                          newSchema[idx].type = e.target.value as any;
                          setExtractedSchema(newSchema);
                        }}
                      >
                        <option value="text">Text / String</option>
                        <option value="number">Numeric Value</option>
                        <option value="date">Date</option>
                        <option value="photo">Photo Upload</option>
                        <option value="formula">Calculated Formula</option>
                      </select>
                      {field.type === 'formula' && (
                        <input
                          type="text"
                          placeholder="e.g. {{Income}} - {{Expense}}"
                          value={field.formula || ''}
                          onChange={(e) => {
                            const newSchema = [...extractedSchema];
                            newSchema[idx].formula = e.target.value;
                            setExtractedSchema(newSchema);
                          }}
                          className="w-1/3 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#eb8a23]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleCustomConfirm}
                disabled={!customBankName.trim() || isExtracting || (templateFormat === 'excel' && (!extractedSchema || extractedSchema.length === 0))}
                className="px-4 py-2 bg-[#384c5e] text-white rounded-xl text-xs font-bold hover:bg-[#2d3e50] transition disabled:opacity-50"
              >
                Set Custom Institution
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        {selectedClient && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl font-black text-white text-sm tracking-tight flex items-center justify-center shadow-sm uppercase shrink-0"
                style={{ backgroundColor: selectedClient.logoColor }}
              >
                {selectedClient.shortCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Selected Client:</span>
                  <span className="text-sm font-black text-[#2d3e50]">{selectedClient.name}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedClient.division}
                </p>
              </div>
            </div>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-xl font-extrabold text-sm shadow-md transition-all transform active:scale-98"
          >
            Launch PD Automator
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        )}

      </div>
    </div>
  );
};
