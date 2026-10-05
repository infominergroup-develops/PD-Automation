import React from 'react';
import {
  Briefcase,
  Calculator,
  Camera,
  ChevronLeft,
  ChevronRight,
  Shield,
  Store,
  User,
  type LucideIcon,
} from 'lucide-react';

export type PdTabId =
  | 'applicant'
  | 'verification'
  | 'profile'
  | 'customer_supplier'
  | 'field'
  | 'coapp_business'
  | 'financials'
  | 'decision';

interface PdTab {
  id: PdTabId;
  /** Label on the tab bar. */
  label: string;
  /** Label on the Previous / Next buttons at the bottom of each section. */
  navLabel: string;
  icon: LucideIcon;
  /** Only shown when a co-applicant runs a business. */
  coApplicantBusinessOnly?: boolean;
}

const PD_TABS: PdTab[] = [
  { id: 'applicant', label: '1. Applicant & Household', navLabel: '1. Applicant & Household', icon: User },
  {
    id: 'verification',
    label: '2. Business & Residence Verification',
    navLabel: '2. Business & Residence Verification',
    icon: Store,
  },
  { id: 'profile', label: '3. Business Profile', navLabel: '3. Business Profile', icon: Store },
  {
    id: 'customer_supplier',
    label: '4. Customer & Supplier Details',
    navLabel: '4. Customer & Supplier Details',
    icon: Briefcase,
  },
  { id: 'field', label: '5. Field Investigation & EXIF', navLabel: '5. Field Verification', icon: Camera },
  {
    id: 'coapp_business',
    label: '5.1 Co-App Business',
    navLabel: '5.1 Co-App Business',
    icon: Briefcase,
    coApplicantBusinessOnly: true,
  },
  { id: 'financials', label: '6. Waterfall Cash Flow Engine', navLabel: '6. Financial Analysis', icon: Calculator },
  { id: 'decision', label: '7. Risk Score & Decision', navLabel: '7. Risk Score & Summary', icon: Shield },
];

export const isPdTabId = (value: unknown): value is PdTabId => PD_TABS.some((tab) => tab.id === value);

const visibleTabs = (hasCoApplicantBusiness: boolean) =>
  PD_TABS.filter((tab) => hasCoApplicantBusiness || !tab.coApplicantBusinessOnly);

interface PdTabNavProps {
  activeTab: PdTabId;
  hasCoApplicantBusiness: boolean;
  onSelect: (tab: PdTabId) => void;
}

export const PdTabBar: React.FC<PdTabNavProps> = ({ activeTab, hasCoApplicantBusiness, onSelect }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
    {visibleTabs(hasCoApplicantBusiness).map(({ id, label, icon: Icon }) => {
      const isActive = activeTab === id;
      return (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            isActive ? 'bg-[#384c5e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Icon className={`w-4 h-4 ${isActive ? 'text-[#eb8a23]' : 'text-slate-400'}`} />
          {label}
        </button>
      );
    })}
  </div>
);

/** Previous / Next buttons at the bottom of each PD section. */
export const PdTabFooter: React.FC<PdTabNavProps> = ({ activeTab, hasCoApplicantBusiness, onSelect }) => {
  const tabs = visibleTabs(hasCoApplicantBusiness);
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
  const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;

  const goTo = (tab: PdTab) => {
    onSelect(tab.id);
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border">
      <div>
        {prevTab ? (
          <button
            onClick={() => goTo(prevTab)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-[#eb8a23]" />
            Previous: {prevTab.navLabel}
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Section {currentIndex + 1} of {tabs.length}
      </div>

      <div>
        {nextTab ? (
          <button
            onClick={() => goTo(nextTab)}
            className="flex items-center gap-2 px-5 py-2 bg-[#384c5e] hover:bg-[#2d3e50] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Next: {nextTab.navLabel}
            <ChevronRight className="w-4 h-4 text-[#eb8a23]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
