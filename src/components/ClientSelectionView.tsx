import React, { useState, useEffect } from 'react';
import { ClientBank } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';
import { InfominerLogo } from './InfominerLogo';
import { api } from '../services/api';

import { Building2, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Building, Layers } from 'lucide-react';

interface ClientSelectionViewProps {
  selectedCompany?: Company | null;
  selectedClient: ClientBank | null;
  onSelectClient: (client: ClientBank) => void;
  onContinue: () => void;
  userName?: string;
}

export const ClientSelectionView: React.FC<ClientSelectionViewProps> = ({
  selectedCompany,
  selectedClient,
  onSelectClient,
  onContinue,
  userName = 'Credit Officer',
}) => {
  const [customBankName, setCustomBankName] = useState('');
  const [customDivision, setCustomDivision] = useState('');
  const [clients, setClients] = useState<ClientBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getClients().then(fetchedClients => {
      setClients(fetchedClients);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleChooseBank = (bank: ClientBank) => {
    onSelectClient(bank);
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
      tagline: 'Custom Financial Partner'
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
            Welcome back, <span className="font-bold text-[#2d3e50]">{userName}</span>. Select the banking client for which you are conducting Personal Discussion (PD) credit appraisals.
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCustomConfirm}
                disabled={!customBankName.trim()}
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
