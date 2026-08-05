import React from 'react';
import { UserRole } from '../types';
import { EmployeeRecord } from '../services/api';
import { ClientBank } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';

import { Shield, FileCheck, LayoutDashboard, Settings, Cpu, FileText, Activity, BookOpen, UserCheck, Sparkles, Users, LogOut, Building2, RefreshCw } from 'lucide-react';
import { InfominerLogo } from './InfominerLogo';

interface HeaderProps {
  currentUser?: EmployeeRecord | null;
  selectedCompany?: Company | null;
  selectedClient?: ClientBank | null;
  onSwitchClientBank?: () => void;
  onLogout?: () => void;
  currentView?: 'pd-tool' | 'employee-management';
  onNavigate?: (view: 'pd-tool' | 'employee-management') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedCompany,
  selectedClient,
  onSwitchClientBank,
  onLogout,
  currentView,
  onNavigate,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top White Bar with Brand, Client Selector & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {selectedCompany?.id === 'infominers' ? (
              <InfominerLogo size="sm" showText={false} textColor="dark" />
            ) : (
              <Building2 className="w-8 h-8 text-[#eb8a23]" />
            )}
          </div>
          <div className="border-l border-slate-300 pl-3 hidden sm:block">
            <h1 className="text-xs md:text-sm font-bold text-[#2d3e50] flex items-center gap-2">
              {selectedCompany?.name || 'Personal Discussion Automator'}
              <span className="text-[10px] bg-[#eb8a23]/15 text-[#d97917] border border-[#eb8a23]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Enterprise v3.2
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {selectedClient?.name || 'Axis Bank'} Micro Lending • 21 Business Categories
            </p>
          </div>
        </div>

        {/* Selected Client Bank Pill & User Role Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Client Bank Pill */}
          {selectedClient && (
            <button
              onClick={onSwitchClientBank}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold transition shadow-xs group"
              title="Click to switch banking client"
            >
              <span
                className="w-5 h-5 rounded font-black text-white text-[9px] flex items-center justify-center uppercase shrink-0"
                style={{ backgroundColor: selectedClient.logoColor || '#eb8a23' }}
              >
                {selectedClient.shortCode}
              </span>
              <span className="text-[#2d3e50] hidden sm:inline">
                Client: <strong className="text-[#eb8a23]">{selectedClient.name}</strong>
              </span>
              <RefreshCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-[#eb8a23]" />
            <span className="text-xs text-slate-600 font-medium hidden md:inline">Role:</span>
            <span className="text-xs font-bold text-[#2d3e50]">{currentUser?.role || 'EMPLOYEE'}</span>
          </div>

          <div className="text-right hidden xl:block">
            <div className="text-xs font-bold text-[#2d3e50]">
              {currentUser?.name || 'Vikram Malhotra'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {currentUser?.designation || 'Senior Credit Manager'}
            </div>
          </div>

          {currentUser && ['ADMIN', 'MANAGER'].includes(currentUser.role) && onNavigate && (
            <button
              onClick={() => onNavigate(currentView === 'employee-management' ? 'pd-tool' : 'employee-management')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition shadow-xs"
              title="Toggle View"
            >
              {currentView === 'employee-management' ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">PD Tool</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Staff</span>
                </>
              )}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

    </header>
  );
};

