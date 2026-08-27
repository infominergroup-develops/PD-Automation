import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { EmployeeRecord } from './services/api';
import { ClientBank } from './data/clientBanksData';
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { ClientSelectionView } from './components/ClientSelectionView';
import { CompanySelectionView, Company } from './components/CompanySelectionView';
import { PDToolView } from './components/PDToolView';
import { EmployeeManagementView } from './components/EmployeeManagementView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<EmployeeRecord | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientBank | null>(null);
  const [isClientSelected, setIsClientSelected] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanySelected, setIsCompanySelected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'pd-tool' | 'employee-management'>('pd-tool');

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ step: 'auth' }, '');
    }
    
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (!state) return;

      if (state.step === 'auth') {
        setCurrentUser(null);
        setIsCompanySelected(false);
        setIsClientSelected(false);
      } else if (state.step === 'company') {
        setIsCompanySelected(false);
        setIsClientSelected(false);
      } else if (state.step === 'client') {
        setIsCompanySelected(true);
        setIsClientSelected(false);
      } else if (state.step === 'main') {
        setIsCompanySelected(true);
        setIsClientSelected(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user: EmployeeRecord) => {
    setCurrentUser(user);
    setIsCompanySelected(false);
    setIsClientSelected(false); // Ask for client bank right after login
    window.history.pushState({ step: 'company' }, '');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsCompanySelected(false);
    setIsClientSelected(false);
    window.history.pushState({ step: 'auth' }, '');
  };

  // Step 1: If user is not logged in, present Auth Gate
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // Step 1.5: Ask for which operating company
  if (!isCompanySelected) {
    return (
      <CompanySelectionView
        selectedCompany={selectedCompany}
        onSelectCompany={setSelectedCompany}
        onContinue={() => {
          setIsCompanySelected(true);
          window.history.pushState({ step: 'client' }, '');
        }}
        userName={currentUser.name}
      />
    );
  }

  // Step 2: After login, ask for which client bank/institution
  if (!isClientSelected) {
    return (
      <ClientSelectionView
        selectedCompany={selectedCompany}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onContinue={() => {
          setIsClientSelected(true);
          window.history.pushState({ step: 'main' }, '');
        }}
        userName={currentUser.name}
      />
    );
  }

  // Step 3: Main Dashboard & PD Automator Suite
  return (
    <div className="min-h-screen bg-slate-50 text-[#2d3e50] font-sans antialiased selection:bg-[#eb8a23] selection:text-white">
      <Header
        currentUser={currentUser}
        selectedCompany={selectedCompany}
        selectedClient={selectedClient}
        onSwitchClientBank={() => {
          setIsClientSelected(false);
          window.history.pushState({ step: 'client' }, '');
        }}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'employee-management' ? (
          <EmployeeManagementView currentRole={currentUser.role} currentUserId={currentUser.id} />
        ) : (
          <PDToolView
            currentUser={currentUser}
            selectedClient={selectedClient!}
            selectedCompany={selectedCompany!}
          />
        )}
      </main>
    </div>
  );
}


