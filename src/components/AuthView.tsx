import React, { useState } from 'react';
import { UserRole } from '../types';
import { api, EmployeeRecord } from '../services/api';

import { Shield, UserCheck, KeyRound, Building2, UserPlus, LogIn, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: EmployeeRecord) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('employee@infominers.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rolesList: { role: UserRole; title: string; subtitle: string; iconBg: string; badgeColor: string }[] = [
    {
      role: 'ADMIN',
      title: 'System Admin',
      subtitle: 'Full System Access & Configuration',
      iconBg: 'bg-purple-100 text-purple-700 border-purple-200',
      badgeColor: 'bg-purple-600'
    },
    {
      role: 'MANAGER',
      title: 'Manager',
      subtitle: 'Appraisal & Approval Rights',
      iconBg: 'bg-amber-100 text-[#eb8a23] border-amber-200',
      badgeColor: 'bg-[#eb8a23]'
    },
    {
      role: 'EMPLOYEE',
      title: 'Employee',
      subtitle: 'Data Entry, Photo Upload & Print',
      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-600'
    }
  ];

  const handleQuickDemoLogin = async (selectedRole: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const emails: Record<UserRole, string> = {
        ADMIN: 'admin@infominers.com',
        MANAGER: 'manager@infominers.com',
        EMPLOYEE: 'employee@infominers.com',
        CREDIT_MANAGER: 'credit@infominers.com',
        FIELD_OFFICER: 'field@infominers.com',
        AUDITOR: 'auditor@infominers.com'
      };
      const res = await api.login({
        email: emails[selectedRole],
        password: 'password123',
        role: selectedRole
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login({
        email: loginEmail,
        role,
        password: loginPassword
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or role selection');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#eb8a23]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#384c5e]/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col md:flex-row">
        
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="md:w-5/12 bg-[#384c5e] text-white p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#2c3d4e]">
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-8 h-8 text-amber-400" />
                <span className="text-xl font-bold text-white">PD Automation Engine</span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-1">Personal Discussion Automation Engine</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Institutional micro-lending risk assessment platform supporting 21 business categories, waterfall cash flow verification, and EXIF GPS field audit reports.
            </p>


          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Session • Enterprise Role-Based Access Control</span>
          </div>
        </div>

        {/* Right Side: Form Gate */}
        <div className="md:w-7/12 p-6 sm:p-8 bg-white flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#2d3e50]">
                Enterprise Staff Authentication
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Select your designated role and provide official credentials to open the workspace.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Role Selector Grid */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Your Role Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rolesList.map((r) => {
                  const isSelected = role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#eb8a23] bg-amber-50/60 ring-2 ring-[#eb8a23]/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${r.iconBg}`}>
                          {r.role.replace('_', ' ')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#eb8a23]" />}
                      </div>
                      <div className="text-xs font-bold text-slate-800">{r.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. employee@infominers.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23] focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23] focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#384c5e] hover:bg-[#2d3e50] text-white rounded-lg font-bold text-xs transition shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Authenticating Session...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#eb8a23]" />
                    Access PD Workspace
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>System Version 3.2 Enterprise</span>
            <span className="text-[#384c5e] font-bold">Axis Bank Micro Lending</span>
          </div>
        </div>

      </div>
    </div>
  );
};
