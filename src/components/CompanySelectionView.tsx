import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Building2 } from 'lucide-react';


export interface Company {
  id: string;
  name: string;
  shortCode: string;
  logoColor: string;
  description: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'infominers',
    name: 'Infominers Group',
    shortCode: 'INFO',
    logoColor: '#2D3E50',
    description: 'Internal corporate PD automation division.'
  },
  {
    id: 'mahesh',
    name: 'Mahesh & Company',
    shortCode: 'M&C',
    logoColor: '#eb8a23',
    description: 'External partner agency for specialized credit appraisal.'
  }
];

interface CompanySelectionViewProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  onContinue: () => void;
  userName?: string;
}

export const CompanySelectionView: React.FC<CompanySelectionViewProps> = ({
  selectedCompany,
  onSelectCompany,
  onContinue,
  userName = 'Employee',
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 font-sans text-[#2d3e50]">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-[#d97917] rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Agency Selection Gateway
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Building2 className="w-10 h-10 text-[#eb8a23]" />
              <span className="text-2xl font-bold text-[#2d3e50]">PD Automation Engine</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#2d3e50] tracking-tight">
            Select Operating Company
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
            Welcome, <span className="font-bold text-[#2d3e50]">{userName}</span>. Please choose the agency or company you are representing for this session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COMPANIES.map((company) => {
            const isSelected = selectedCompany?.id === company.id;
            return (
              <div
                key={company.id}
                onClick={() => onSelectCompany(company)}
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
                      style={{ backgroundColor: company.logoColor }}
                    >
                      {company.shortCode}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-[#2d3e50] group-hover:text-[#eb8a23] transition-colors">
                        {company.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {company.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedCompany && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl font-black text-white text-sm tracking-tight flex items-center justify-center shadow-sm uppercase shrink-0"
                style={{ backgroundColor: selectedCompany.logoColor }}
              >
                {selectedCompany.shortCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Selected Agency:</span>
                  <span className="text-sm font-black text-[#2d3e50]">{selectedCompany.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-xl font-extrabold text-sm shadow-md transition-all transform active:scale-98"
            >
              Continue to Client Banks
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
