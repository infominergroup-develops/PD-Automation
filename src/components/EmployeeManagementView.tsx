import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api, EmployeeRecord } from '../services/api';
import { Users, UserPlus, Shield, Trash2, Edit3, Search, RefreshCw, CheckCircle, XCircle, Building, AlertCircle, Plus, BadgeCheck } from 'lucide-react';

interface EmployeeManagementViewProps {
  currentRole: UserRole;
  currentUserId?: string;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({ currentRole, currentUserId }) => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeRecord | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('FIELD_OFFICER');
  const [formDesignation, setFormDesignation] = useState('');
  const [formAgency, setFormAgency] = useState('Axis Bank Micro Lending');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const list = await api.getEmployees();
      setEmployees(list);
    } catch (err: any) {
      console.error('Failed to fetch employees', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setFormName('');
    setFormEmail('');
    setFormRole('FIELD_OFFICER');
    setFormDesignation('Infominer Field Inspection Specialist');
    setFormAgency('Axis Bank Infominer Division');
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: EmployeeRecord) => {
    setEditingEmp(emp);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormRole(emp.role);
    setFormDesignation(emp.designation || '');
    setFormAgency(emp.agency || 'Axis Bank Micro Lending');
    setFormStatus(emp.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formDesignation.trim()) {
      setActionFeedback({ type: 'error', message: 'Name, email, and designation are required.' });
      return;
    }
    setIsSaving(true);
    setActionFeedback(null);
    try {
      const res = await api.saveEmployee({
        id: editingEmp?.id,
        name: formName,
        email: formEmail,
        role: formRole,
        designation: formDesignation,
        agency: formAgency,
        status: formStatus
      });
      setIsModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: editingEmp ? `Updated profile & designation for ${res.name}` : `Successfully added ${res.name} to employee directory`
      });
      fetchEmployees();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to save employee record' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async (emp: EmployeeRecord) => {
    if (!window.confirm(`Are you sure you want to remove employee "${emp.name}" (${emp.designation}) from the directory?`)) {
      return;
    }
    setActionFeedback(null);
    try {
      await api.deleteEmployee(emp.id);
      setActionFeedback({ type: 'success', message: `Employee "${emp.name}" removed from directory.` });
      fetchEmployees();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to remove employee.' });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.agency && emp.agency.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    ADMIN: { label: 'Admin', bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800' },
    MANAGER: { label: 'Manager', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800' },
    EMPLOYEE: { label: 'Employee', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800' },
    CREDIT_MANAGER: { label: 'Credit Manager', bg: 'bg-amber-100 border-amber-300', text: 'text-[#d97917]' },
    FIELD_OFFICER: { label: 'Field Officer', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800' },
    AUDITOR: { label: 'Auditor', bg: 'bg-blue-100 border-blue-300', text: 'text-[#384c5e]' }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#eb8a23]" />
            Enterprise Staff & Designation Governance
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Directory of registered personnel. Manage staff designations, authority levels, roles (Admin, Credit Manager, Field Officer, Auditor), and access credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-[#2d3e50] rounded-lg text-xs font-semibold transition border border-slate-200"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#eb8a23]' : ''}`} />
          </button>

          {['ADMIN', 'MANAGER'].includes(currentRole) && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs rounded-lg shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              Add New Employee
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {actionFeedback.message}
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, designation, or agency..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Filter Role:</span>
          {['ALL', 'ADMIN', 'CREDIT_MANAGER', 'FIELD_OFFICER', 'AUDITOR'].map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setRoleFilter(roleKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === roleKey
                  ? 'bg-[#384c5e] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {roleKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Designation & Title</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3">Agency / Branch</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No employees matching the search filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const badge = roleBadges[emp.role] || roleBadges.FIELD_OFFICER;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#2d3e50] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#384c5e] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{emp.designation || 'Specialist'}</div>
                        <div className="text-[10px] text-slate-400">ID: {emp.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text}`}>
                          <BadgeCheck className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{emp.agency || 'Axis Bank Infominer'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'INACTIVE' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {emp.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {['ADMIN', 'MANAGER'].includes(currentRole) && (
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded transition"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {currentRole === 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Remove Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#384c5e] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#eb8a23]" />
                {editingEmp ? 'Edit Employee & Designation' : 'Add New Employee Record'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. v.malhotra@axisbank.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    disabled={!['ADMIN', 'MANAGER'].includes(currentRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23] font-bold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="CREDIT_MANAGER">Credit Manager</option>
                    <option value="FIELD_OFFICER">Field Officer</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    disabled={!['ADMIN', 'MANAGER'].includes(currentRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23] disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation *</label>
                <input
                  type="text"
                  required
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. Senior Credit Risk Manager (AVP)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency / Division</label>
                <input
                  type="text"
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  placeholder="e.g. Mahesh and Co (CA)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                  {isSaving ? 'Saving Record...' : editingEmp ? 'Update Profile' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
