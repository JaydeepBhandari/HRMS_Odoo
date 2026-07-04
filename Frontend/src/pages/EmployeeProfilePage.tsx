import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployee, updateEmployee } from '../services/employeeService';
import { getSalaryStructure, updateSalaryStructure, addSalaryComponent, removeSalaryComponent } from '../services/salaryService';
import { computeSalary } from '../utils/salaryCalculator';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Employee, SalaryStructure } from '../types';
import { Camera, CheckCircle2, AlertCircle, Trash2, Plus, Edit2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const employeeId = id || currentUser!.employee.id;
  const employee = getEmployee(employeeId);
  const isOwnProfile = currentUser!.employee.id === employeeId;

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-center">
          <p className="text-surface-400">Employee not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  let tabs: string[];
  if (isAdmin) {
    tabs = ['Personal Info', 'Private Info', 'Salary Info'];
  } else if (isOwnProfile) {
    tabs = ['Personal Info', 'Private Info', 'My Salary', 'Security'];
  } else {
    tabs = ['Personal Info'];
  }

  return <ProfileContent employee={employee} tabs={tabs} isOwnProfile={isOwnProfile} isAdmin={isAdmin} />;
}

function ProfileContent({ employee, tabs, isOwnProfile, isAdmin }: {
  employee: Employee; tabs: string[]; isOwnProfile: boolean; isAdmin: boolean;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...employee });
  
  const canEdit = isAdmin || isOwnProfile;
  const limitedEdit = isOwnProfile && !isAdmin;
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  const handleSave = () => {
    const updates: Partial<Employee> = limitedEdit
      ? { phone: formData.phone, currentAddress: formData.currentAddress, permanentAddress: formData.permanentAddress } // Added addresses for employee self-edit
      : formData;
    updateEmployee(employee.id, updates);
    setIsEditing(false);
    toast.success('Profile updated');
  };

  const handleCancel = () => {
    setFormData({ ...employee });
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column (1/3) - Profile Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
          
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full bg-accent-600/10 text-accent-500 flex items-center justify-center text-3xl font-bold border-4 border-surface-800 shadow-xl overflow-hidden">
              {formData.profilePictureUrl ? (
                <img src={formData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-accent-400 font-medium mt-1">{employee.title}</p>
          <p className="text-surface-400 text-sm mt-1">{employee.department}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="bg-surface-700 text-surface-300 px-3 py-1 rounded-full border border-surface-600">
              {employee.loginId}
            </span>
            {isAdmin && (
              <span className="bg-accent-600/15 text-accent-400 px-3 py-1 rounded-full border border-accent-600/20 font-medium">
                Admin
              </span>
            )}
          </div>

          {canEdit && (
            <div className="mt-6 w-full pt-6 border-t border-surface-700 flex flex-col gap-3">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-secondary w-full">
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="btn-secondary flex-1">
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn-primary flex-1">
                    <Save size={16} /> Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column (2/3) - Tab Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-surface-800 pb-0 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-accent-500 text-accent-400 bg-surface-800/50'
                  : 'border-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-800/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6 shadow-sm min-h-[400px]">
          {activeTab === 'Personal Info' && (
            <PersonalInfoTab employee={employee} formData={formData} setFormData={setFormData} isEditing={isEditing} limitedEdit={limitedEdit} />
          )}
          {activeTab === 'Private Info' && (
            <PrivateInfoTab employee={employee} formData={formData} setFormData={setFormData} isEditing={isEditing} limitedEdit={limitedEdit} canEdit={canEdit} />
          )}
          {activeTab === 'Salary Info' && isAdmin && (
            <SalaryInfoAdminTab employeeId={employee.id} />
          )}
          {activeTab === 'My Salary' && isOwnProfile && (
            <SalaryReadOnlyTab employeeId={employee.id} />
          )}
          {activeTab === 'Security' && (
            <SecurityTab />
          )}
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  employee: Employee;
  formData: Employee;
  setFormData: React.Dispatch<React.SetStateAction<Employee>>;
  isEditing: boolean;
  limitedEdit?: boolean;
  canEdit?: boolean;
}

function PersonalInfoTab({ employee, formData, setFormData, isEditing, limitedEdit }: TabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent-500 rounded-full" />
            Contact Information
          </h3>
          <InfoField label="Phone" value={formData.phone} isEditing={isEditing} onChange={v => setFormData((p) => ({ ...p, phone: v }))} />
          <InfoField label="Email" value={employee.email} />
          <InfoField label="Department" value={formData.department} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, department: v }))} />
          <InfoField label="Title" value={formData.title} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, title: v }))} />
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent-500 rounded-full" />
            About Me
          </h3>
          {isEditing && !limitedEdit ? (
            <textarea
              value={formData.aboutMe || ''}
              onChange={e => setFormData((p) => ({ ...p, aboutMe: e.target.value }))}
              className="w-full h-24 bg-surface-900 border border-surface-700 rounded-lg p-3 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 resize-none"
              placeholder="Write something about yourself..."
            />
          ) : (
            <p className="text-sm text-surface-300 leading-relaxed">{employee.aboutMe || 'No bio provided.'}</p>
          )}

          <div>
            <h4 className="text-xs font-semibold text-surface-500 mb-2 uppercase">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill: string) => (
                <span key={skill} className="bg-surface-700 text-surface-200 px-2.5 py-1 rounded-md text-xs border border-surface-600">
                  {skill}
                </span>
              ))}
              {employee.skills.length === 0 && <span className="text-xs text-surface-500">None added</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivateInfoTab({ employee, formData, setFormData, isEditing, limitedEdit, canEdit }: TabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent-500 rounded-full" />
            Personal Details
          </h3>
          <InfoField label="Date of birth" value={formatDate(formData.dateOfBirth, 'short')} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, dateOfBirth: v }))} type="date" />
          <InfoField label="Gender" value={formData.gender} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, gender: v }))} />
          <InfoField label="Marital status" value={formData.maritalStatus} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, maritalStatus: v }))} />
          <InfoField label="Blood group" value={formData.bloodGroup} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, bloodGroup: v }))} />
          <InfoField label="Date of joining" value={formatDate(formData.dateOfJoining, 'short')} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, dateOfJoining: v }))} type="date" />
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent-500 rounded-full" />
            Address & ID
          </h3>
          <InfoField label="Current address" value={formData.currentAddress} isEditing={isEditing && canEdit} onChange={v => setFormData((p) => ({ ...p, currentAddress: v }))} />
          <InfoField label="Permanent address" value={formData.permanentAddress} isEditing={isEditing && canEdit} onChange={v => setFormData((p) => ({ ...p, permanentAddress: v }))} />
          <InfoField label="Personal email" value={formData.personalEmail || '-'} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, personalEmail: v }))} />
          <InfoField label="PAN Number" value={formData.panNumber || '-'} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, panNumber: v }))} />
          <InfoField label="Aadhar Number" value={formData.aadharNumber || '-'} isEditing={isEditing && !limitedEdit} onChange={v => setFormData((p) => ({ ...p, aadharNumber: v }))} />
        </div>
      </div>
    </div>
  );
}

function SalaryInfoAdminTab({ employeeId }: { employeeId: string }) {
  const [structure, setStructure] = useState<SalaryStructure | null>(() => getSalaryStructure(employeeId) ?? null);
  const [editing, setEditing] = useState(false);
  const [newCompName, setNewCompName] = useState('');

  if (!structure) {
    return <div className="text-surface-400 text-sm">No salary structure defined for this employee.</div>;
  }

  const computed = computeSalary(structure);
  const totalComputed = computed.components.reduce((sum, c) => sum + (c.computedAmount ?? 0), 0);
  const matchesTotal = Math.abs(totalComputed - structure.totalWage) < 1;

  const handleWageChange = (value: number) => {
    const updated = { ...structure, totalWage: value };
    setStructure(updated);
  };

  const handleComponentChange = (compId: string, field: string, value: number | string) => {
    const updated = {
      ...structure,
      components: structure.components.map(c =>
        c.id === compId ? { ...c, [field]: value } : c
      ),
    };
    setStructure(updated);
  };

  const handleSave = () => {
    if (!computed.isValid) {
      toast.error('Total components exceed wage. Please adjust values before saving.');
      return;
    }
    updateSalaryStructure(employeeId, structure);
    setEditing(false);
    toast.success('Salary structure updated');
  };

  const handleAddComponent = () => {
    if (!newCompName.trim()) return;
    const result = addSalaryComponent(employeeId, {
      name: newCompName.trim(),
      computationType: 'fixed',
      fixedAmount: 0,
      order: structure.components.length,
    });
    if (result) setStructure({ ...result });
    setNewCompName('');
  };

  const handleRemoveComponent = (compId: string) => {
    const result = removeSalaryComponent(employeeId, compId);
    if (result) setStructure({ ...result });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-accent-500 rounded-full" />
          Salary Breakdown
        </h3>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => { setStructure(getSalaryStructure(employeeId) ?? null); setEditing(false); }} className="btn-secondary h-8 text-xs">Cancel</button>
            <button onClick={handleSave} disabled={!computed.isValid} className="btn-primary h-8 text-xs disabled:opacity-50"><Save size={14}/> Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-secondary h-8 text-xs"><Edit2 size={14}/> Edit Structure</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-900 border border-surface-700 p-4 rounded-lg">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Wage Type</label>
          <p className="text-white mt-1 capitalize font-medium">{structure.wageType}</p>
        </div>
        <div className="bg-surface-900 border border-surface-700 p-4 rounded-lg">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Total Wage</label>
          {editing ? (
            <input
              type="number"
              value={structure.totalWage}
              onChange={e => handleWageChange(Number(e.target.value))}
              className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1 text-sm mt-1 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
            />
          ) : (
            <p className="text-white text-lg font-bold mt-1">{formatCurrency(structure.totalWage)}</p>
          )}
        </div>
        <div className="bg-surface-900 border border-surface-700 p-4 rounded-lg">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Work Schedule</label>
          <p className="text-white mt-1 font-medium">{structure.workingDaysPerWeek} days/week · {structure.standardWorkHoursPerDay}h/day</p>
        </div>
      </div>

      <div className="border border-surface-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-900/50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-surface-400">Earnings Component</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-400">Computation</th>
              <th className="text-right py-3 px-4 font-semibold text-surface-400">Amount</th>
              {editing && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {computed.components.sort((a, b) => a.order - b.order).map(comp => (
              <tr key={comp.id} className="hover:bg-surface-900/30 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-surface-200">{comp.name}</span>
                  {comp.isFixedAllowance && <span className="text-[10px] text-surface-500 ml-2 uppercase tracking-wide bg-surface-800 px-1.5 py-0.5 rounded">(Auto-calculated)</span>}
                </td>
                <td className="py-3 px-4">
                  {editing && !comp.isFixedAllowance ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={comp.computationType}
                        onChange={e => handleComponentChange(comp.id, 'computationType', e.target.value)}
                        className="bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-500"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      {comp.computationType === 'fixed' ? (
                        <input
                          type="number"
                          value={comp.fixedAmount ?? 0}
                          onChange={e => handleComponentChange(comp.id, 'fixedAmount', Number(e.target.value))}
                          className="w-24 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-500"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={comp.percentageValue ?? 0}
                            onChange={e => handleComponentChange(comp.id, 'percentageValue', Number(e.target.value))}
                            className="w-16 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-500"
                          />
                          <span className="text-xs text-surface-500">% of</span>
                          <select
                            value={comp.percentageBase ?? 'wage'}
                            onChange={e => handleComponentChange(comp.id, 'percentageBase', e.target.value)}
                            className="w-28 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-500"
                          >
                            <option value="wage">Total Wage</option>
                            {structure!.components.filter(c => c.id !== comp.id && !c.isFixedAllowance).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-surface-400 text-xs">
                      {comp.isFixedAllowance ? 'Total Wage − Sum(others)' :
                       comp.computationType === 'percentage'
                        ? `${comp.percentageValue}% of ${comp.percentageBase === 'wage' ? 'Total Wage' : structure!.components.find(c => c.id === comp.percentageBase)?.name ?? comp.percentageBase}`
                        : 'Fixed Amount'
                      }
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-medium text-white">
                  {formatCurrency(comp.computedAmount ?? 0)}
                </td>
                {editing && (
                  <td className="py-3 px-4 text-center">
                    {!comp.isFixedAllowance && (
                      <button onClick={() => handleRemoveComponent(comp.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-900/80">
            <tr>
              <td colSpan={2} className="py-3 px-4 font-bold text-white text-right">Total Earnings:</td>
              <td className="py-3 px-4 text-right font-mono font-bold text-white flex justify-end items-center gap-2">
                {formatCurrency(totalComputed)}
                {!editing && matchesTotal && <CheckCircle2 size={16} className="text-[#22c55e]" />}
                {!editing && !matchesTotal && <AlertCircle size={16} className="text-[#ef4444]" title="Exceeds total wage" />}
              </td>
              {editing && <td></td>}
            </tr>
          </tfoot>
        </table>
        
        {editing && (
          <div className="flex items-center gap-2 p-3 bg-surface-900/50 border-t border-surface-700">
            <input
              type="text"
              value={newCompName}
              onChange={e => setNewCompName(e.target.value)}
              placeholder="New component name"
              className="bg-surface-800 border border-surface-600 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-accent-500 w-48"
            />
            <button onClick={handleAddComponent} className="btn-secondary h-7 text-xs px-3 py-0"><Plus size={14}/> Add Component</button>
          </div>
        )}
      </div>

      {/* Deductions Section */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#ef4444] rounded-full" />
          Deductions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-900 border border-surface-700 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-surface-200">Provident Fund (PF)</p>
              <p className="text-xs text-surface-500 mt-0.5">{structure.pfContributionRate}% contribution rate</p>
            </div>
            <p className="font-mono font-medium text-white">{formatCurrency(computed.pfAmount)}</p>
          </div>
          <div className="bg-surface-900 border border-surface-700 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-surface-200">Professional Tax</p>
              <p className="text-xs text-surface-500 mt-0.5">Fixed monthly amount</p>
            </div>
            <p className="font-mono font-medium text-white">{formatCurrency(structure.professionalTax)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalaryReadOnlyTab({ employeeId }: { employeeId: string }) {
  const structure = getSalaryStructure(employeeId);
  if (!structure) {
    return <div className="text-surface-400 text-sm">Salary information is not available yet.</div>;
  }

  const computed = computeSalary(structure);
  const totalEarnings = computed.components.reduce((sum, c) => sum + (c.computedAmount ?? 0), 0);
  const totalDeductions = (computed.pfAmount ?? 0) + structure.professionalTax;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-4 bg-accent-500 rounded-full" />
        My Salary Breakdown
      </h3>

      <div className="bg-surface-900 border border-surface-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-surface-700 flex justify-between items-center bg-surface-800">
          <span className="text-sm font-medium text-surface-300 capitalize">{structure.wageType} Wage</span>
          <span className="text-lg font-bold text-white">{formatCurrency(structure.totalWage)}</span>
        </div>
        
        <table className="w-full text-sm">
          <thead className="bg-surface-900/50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-surface-400 uppercase text-xs">Earnings</th>
              <th className="text-right py-3 px-4 font-semibold text-surface-400 uppercase text-xs">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {computed.components.sort((a, b) => a.order - b.order).map(comp => (
              <tr key={comp.id}>
                <td className="py-2.5 px-4 text-surface-200">{comp.name}</td>
                <td className="py-2.5 px-4 text-right font-mono text-white">{formatCurrency(comp.computedAmount ?? 0)}</td>
              </tr>
            ))}
            <tr className="bg-surface-800/30">
              <td className="py-3 px-4 font-semibold text-surface-300">Total Earnings (A)</td>
              <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(totalEarnings)}</td>
            </tr>
          </tbody>

          <thead className="bg-surface-900/50 border-t border-surface-700">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-surface-400 uppercase text-xs">Deductions</th>
              <th className="text-right py-3 px-4 font-semibold text-surface-400 uppercase text-xs">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            <tr>
              <td className="py-2.5 px-4 text-surface-200">Provident Fund (PF)</td>
              <td className="py-2.5 px-4 text-right font-mono text-white">{formatCurrency(computed.pfAmount ?? 0)}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 text-surface-200">Professional Tax</td>
              <td className="py-2.5 px-4 text-right font-mono text-white">{formatCurrency(structure.professionalTax)}</td>
            </tr>
            <tr className="bg-surface-800/30">
              <td className="py-3 px-4 font-semibold text-surface-300">Total Deductions (B)</td>
              <td className="py-3 px-4 text-right font-mono font-bold text-[#ef4444]">{formatCurrency(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="p-5 border-t border-surface-700 bg-surface-900 flex justify-between items-center">
          <span className="text-base font-bold text-white">Net Salary (A - B)</span>
          <span className="text-2xl font-bold text-[#22c55e]">{formatCurrency(netSalary)}</span>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match.'); return; }
    toast.success('Password changed successfully');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  return (
    <div className="max-w-md animate-fade-in">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <span className="w-1 h-4 bg-accent-500 rounded-full" />
        Change Password
      </h3>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Current Password</label>
          <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">New Password</label>
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Confirm New Password</label>
          <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors" required />
        </div>
        <button type="submit" className="btn-primary w-full mt-2">Update Password</button>
      </form>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: string;
}

function InfoField({ label, value, isEditing, onChange, type = "text" }: InfoFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange?.(e.target.value)}
          className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
        />
      ) : (
        <p className="text-sm font-medium text-surface-200">{value || '-'}</p>
      )}
    </div>
  );
}
