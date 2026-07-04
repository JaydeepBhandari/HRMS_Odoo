import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getLeaveRequests,
  getPendingLeaveRequests,
  submitLeaveRequest,
  approveLeave,
  rejectLeave,
  getLeaveAllocations,
  updateLeaveAllocation,
  getLeaveBalance,
} from '../services/leaveService';
import { getEmployee, getEmployees } from '../services/employeeService';
import type { LeaveRequest, LeaveType } from '../types';
import { LEAVE_TYPE_LABELS } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Search, MessageSquare, ChevronLeft, ChevronRight, X, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BalanceCard } from '../components/ui/BalanceCard';

export default function TimeOffPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminTimeOff /> : <EmployeeTimeOff />;
}


function AdminTimeOff() {
  const [activeTab, setActiveTab] = useState<'time-off' | 'allocation'>('time-off');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white tracking-tight">Time Off Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-800 pb-0">
        {(['time-off', 'allocation'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-accent-500 text-accent-400 bg-surface-800/50'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            {tab === 'time-off' ? 'Requests & Approvals' : 'Allocations'}
          </button>
        ))}
      </div>

      {activeTab === 'time-off' ? <AdminTimeOffTab /> : <AdminAllocationTab />}
    </div>
  );
}

function AdminTimeOffTab() {
  const [search, setSearch] = useState('');
  const [commentOpenFor, setCommentOpenFor] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [actionType, setActionType] = useState<'approve'|'reject' | null>(null);
  const [, setForceUpdate] = useState(0);

  const employees = getEmployees();
  const allRequests = getLeaveRequests();
  const filteredRequests = useMemo(() => {
    if (!search) return allRequests;
    const q = search.toLowerCase();
    return allRequests.filter(r => {
      const emp = getEmployee(r.employeeId);
      return emp && (
        emp.firstName.toLowerCase().includes(q) ||
        emp.lastName.toLowerCase().includes(q) ||
        r.leaveType.toLowerCase().includes(q)
      );
    });
  }, [allRequests, search]);

  const handleActionClick = (id: string, type: 'approve'|'reject') => {
    setCommentOpenFor(id);
    setActionType(type);
    setCommentInput('');
  };

  const submitAction = () => {
    if (!commentOpenFor || !actionType) return;
    if (actionType === 'approve') {
      approveLeave(commentOpenFor, commentInput);
      toast.success('Leave request approved');
    } else {
      rejectLeave(commentOpenFor, commentInput);
      toast.success('Leave request rejected');
    }
    setCommentOpenFor(null);
    setCommentInput('');
    setActionType(null);
    setForceUpdate(n => n + 1);
  };

  const cancelAction = () => {
    setCommentOpenFor(null);
    setCommentInput('');
    setActionType(null);
  };

  // Balance summary
  const totalPTO = employees.reduce((sum, e) => sum + getLeaveBalance(e.id, 'paid-time-off').available, 0);
  const totalSick = employees.reduce((sum, e) => sum + getLeaveBalance(e.id, 'sick-leave').available, 0);
  const pendingRequests = getPendingLeaveRequests();

  return (
    <div className="space-y-8">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-800 border border-surface-700 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Avg PTO Available</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-white">{Math.round(totalPTO / (employees.length || 1))}</span>
              <span className="text-sm text-surface-500">days/emp</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center">
            <CalendarIcon size={24} />
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-700 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Avg Sick Leave Available</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-white">{Math.round(totalSick / (employees.length || 1))}</span>
              <span className="text-sm text-surface-500">days/emp</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#eab308]/10 text-[#eab308] flex items-center justify-center">
            <Plus size={24} />
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-700 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Pending Requests</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-[#f59e0b]">{pendingRequests.length}</span>
              <span className="text-sm text-surface-500">requests</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search by name or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface-900 border border-surface-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors shadow-sm"
        />
      </div>

      {/* Card-based Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(req => {
          const emp = getEmployee(req.employeeId);
          if (!emp) return null;
          const isPending = req.status === 'pending';
          const showCommentForm = commentOpenFor === req.id;

          return (
            <div key={req.id} className={`bg-surface-800 border ${isPending ? 'border-surface-600' : 'border-surface-700'} rounded-xl p-5 shadow-sm transition-all relative overflow-hidden`}>
              {isPending && <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]" />}
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center text-sm font-bold text-white border border-surface-600 shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{emp.firstName} {emp.lastName}</h3>
                    <p className="text-sm text-surface-400">{emp.department}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="px-2.5 py-1 text-xs font-medium bg-surface-900 border border-surface-700 rounded-full text-surface-300">
                        {LEAVE_TYPE_LABELS[req.leaveType]}
                      </span>
                      <span className="text-sm text-surface-300 flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-surface-500"/>
                        {req.startDate} to {req.endDate}
                      </span>
                      <span className="text-sm font-medium text-white bg-surface-700 px-2 py-0.5 rounded">
                        {req.daysRequested} day{req.daysRequested > 1 ? 's' : ''}
                      </span>
                    </div>

                    {req.remarks && (
                      <div className="mt-3 text-sm text-surface-300 flex items-start gap-2 bg-surface-900/50 p-2.5 rounded-lg border border-surface-700/50">
                        <MessageSquare size={14} className="mt-0.5 text-surface-500 shrink-0" />
                        <span className="italic">"{req.remarks}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <StatusBadge status={req.status} />
                  
                  {isPending && !showCommentForm && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleActionClick(req.id, 'approve')} className="btn-primary h-8 px-3 text-xs bg-[#22c55e] hover:bg-[#16a34a]">
                        <Check size={14} className="mr-1"/> Approve
                      </button>
                      <button onClick={() => handleActionClick(req.id, 'reject')} className="btn-secondary h-8 px-3 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 border-[#ef4444]/30">
                        <X size={14} className="mr-1"/> Reject
                      </button>
                    </div>
                  )}

                  {!isPending && req.adminComment && (
                    <div className="text-xs text-right mt-1 text-surface-400 max-w-xs">
                      Admin: {req.adminComment}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Popover Form */}
              {showCommentForm && (
                <div className="mt-4 pt-4 border-t border-surface-700 animate-fade-in bg-surface-900/50 -mx-5 px-5 pb-1 rounded-b-xl">
                  <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
                    {actionType === 'approve' ? 'Approval Comment (Optional)' : 'Rejection Reason (Required)'}
                  </label>
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      autoFocus
                      placeholder={actionType === 'approve' ? "E.g. Approved, have a good time!" : "Why is this being rejected?"}
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                    />
                    <button 
                      onClick={submitAction}
                      disabled={actionType === 'reject' && !commentInput.trim()}
                      className={`h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${actionType === 'approve' ? 'bg-[#22c55e] hover:bg-[#16a34a]' : 'bg-[#ef4444] hover:bg-[#dc2626]'}`}
                    >
                      Confirm
                    </button>
                    <button onClick={cancelAction} className="h-9 px-3 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="bg-surface-800 border border-surface-700 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-surface-500">
            <CalendarIcon size={32} className="mb-3 opacity-50" />
            <p>No leave requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAllocationTab() {
  const [, setForceUpdate] = useState(0);
  const employees = getEmployees();
  const year = new Date().getFullYear();
  const allocations = getLeaveAllocations(undefined, year);

  const handleChange = (allocId: string, value: number) => {
    updateLeaveAllocation(allocId, { daysAllocated: value });
    setForceUpdate(n => n + 1);
  };

  const grouped = employees.map(emp => ({
    employee: emp,
    allocations: allocations.filter(a => a.employeeId === emp.id),
  }));

  return (
    <div className="space-y-6">
      <p className="text-surface-400 text-sm">Manage leave allocations for {year}. Changes are saved automatically.</p>

      <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-900/50 border-b border-surface-700">
              <tr>
                <th className="text-left py-4 px-5 font-semibold text-surface-400">Employee</th>
                <th className="text-center py-4 px-5 font-semibold text-surface-400">Paid Time Off</th>
                <th className="text-center py-4 px-5 font-semibold text-surface-400">Sick Leave</th>
                <th className="text-center py-4 px-5 font-semibold text-surface-400">Unpaid Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {grouped.map(({ employee, allocations }) => (
                <tr key={employee.id} className="hover:bg-surface-700/20 transition-colors">
                  <td className="py-3 px-5">
                    <div className="text-white font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="text-xs text-surface-400">{employee.department}</div>
                  </td>
                  {(['paid-time-off', 'sick-leave', 'unpaid-leave'] as LeaveType[]).map(type => {
                    const alloc = allocations.find(a => a.leaveType === type);
                    return (
                      <td key={type} className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={alloc?.daysAllocated ?? 0}
                            onChange={e => alloc && handleChange(alloc.id, Number(e.target.value))}
                            className="bg-surface-900 border border-surface-600 rounded w-16 text-center text-sm py-1 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                          />
                          <span className="text-xs text-surface-500 w-16 text-left">
                            ({alloc?.daysUsed ?? 0} used)
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function EmployeeTimeOff() {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [, setForceUpdate] = useState(0);
  const employeeId = currentUser!.employee.id;

  const requests = getLeaveRequests(employeeId);
  const ptoBalance = getLeaveBalance(employeeId, 'paid-time-off');
  const sickBalance = getLeaveBalance(employeeId, 'sick-leave');
  const unpaidBalance = getLeaveBalance(employeeId, 'unpaid-leave');

  const handleSubmit = (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    daysRequested: number;
    remarks: string;
    attachmentName?: string;
  }) => {
    submitLeaveRequest({
      employeeId,
      ...data,
    });
    setShowForm(false);
    toast.success('Leave request submitted');
    setForceUpdate(n => n + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Time Off</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2 h-10 px-5 shadow-sm">
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* Balance Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">My Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <BalanceCard label="Paid Time Off" available={ptoBalance.available} total={ptoBalance.allocated} used={ptoBalance.used} color="accent" />
          <BalanceCard label="Sick Leave" available={sickBalance.available} total={sickBalance.allocated} used={sickBalance.used} color="yellow" />
          <BalanceCard label="Unpaid Leave" available={unpaidBalance.available} total={unpaidBalance.allocated} used={unpaidBalance.used} color="blue" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Calendar */}
          <LeaveCalendar requests={requests} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Request History</h2>
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-surface-800 border border-surface-700 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      {LEAVE_TYPE_LABELS[req.leaveType]}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-surface-300">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-surface-500"/>
                        {new Date(req.startDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {new Date(req.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="text-surface-500"/>
                        {req.daysRequested} day{req.daysRequested > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                
                {req.remarks && (
                  <p className="text-sm text-surface-400 bg-surface-900/50 p-2.5 rounded-lg border border-surface-700/50 italic mb-2">
                    "{req.remarks}"
                  </p>
                )}
                
                {req.adminComment && (
                  <div className="text-sm bg-[#3b82f6]/10 border border-[#3b82f6]/20 p-2.5 rounded-lg text-surface-200 mt-2">
                    <span className="font-semibold text-[#3b82f6]">HR Note:</span> {req.adminComment}
                  </div>
                )}
                
                {req.attachmentName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-accent-400 bg-accent-500/10 w-max px-3 py-1.5 rounded-lg border border-accent-500/20">
                    <FileText size={14} />
                    {req.attachmentName}
                  </div>
                )}
              </div>
            ))}
            {requests.length === 0 && (
              <div className="bg-surface-800 border border-surface-700 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-surface-500">
                <CalendarIcon size={32} className="mb-3 opacity-50" />
                <p>No leave requests yet.</p>
                <button onClick={() => setShowForm(true)} className="text-accent-400 mt-2 font-medium hover:underline">Create your first request</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <LeaveRequestModal
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}


function LeaveRequestModal({ onSubmit, onClose }: {
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [leaveType, setLeaveType] = useState<LeaveType>('paid-time-off');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const daysRequested = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) days++;
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!startDate) errs.push('Start date is required.');
    if (!endDate) errs.push('End date is required.');
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) errs.push('End date must be after start date.');
    if (daysRequested === 0) errs.push('Please select valid working dates.');
    if (leaveType === 'sick-leave' && !attachment) errs.push('Medical certificate is required for sick leave.');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    onSubmit({
      leaveType,
      startDate,
      endDate,
      daysRequested,
      remarks,
      attachmentName: attachment?.name,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-[460px] shadow-2xl animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-white tracking-tight">New Time Off Request</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors p-1 bg-surface-800 rounded-full">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-400 font-medium">{err}</p>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Time Off Type</label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as LeaveType)}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
            >
              <option value="paid-time-off">Paid Time Off</option>
              <option value="sick-leave">Sick Leave</option>
              <option value="unpaid-leave">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors" />
            </div>
          </div>

          <div className="bg-surface-800 rounded-lg px-4 py-3 flex justify-between items-center border border-surface-700/50">
            <span className="text-sm font-medium text-surface-300">Days Requested</span>
            <span className="text-xl font-bold text-white">{daysRequested}</span>
          </div>

          {leaveType === 'sick-leave' && (
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                Medical Certificate <span className="text-red-400">*</span>
              </label>
              <div className="border-2 border-dashed border-surface-700 bg-surface-800 rounded-lg p-5 text-center hover:border-accent-500/50 hover:bg-surface-800/80 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  onChange={e => setAttachment(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="flex flex-col items-center gap-2">
                  <FileText size={24} className={attachment ? 'text-accent-500' : 'text-surface-500 group-hover:text-accent-400'} />
                  {attachment ? (
                    <p className="text-sm font-medium text-accent-400">{attachment.name}</p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-white">Click to upload document</p>
                      <p className="text-xs text-surface-500 mt-1">PDF, JPG, or PNG</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Remarks / Reason</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Why are you taking this time off?"
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 h-11">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 h-11">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function LeaveCalendar({ requests }: { requests: LeaveRequest[] }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map dates to leave info
  const leaveDates = useMemo(() => {
    const map = new Map<string, { type: LeaveType; status: string }>();
    for (const req of requests) {
      if (req.status === 'rejected') continue;
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        map.set(dateStr, { type: req.leaveType, status: req.status });
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [requests]);

  const navigateMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const cells: React.ReactNode[] = [];
  // Empty cells for days before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="h-10" />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const leave = leaveDates.get(dateStr);
    const isToday = dateStr === now.toISOString().split('T')[0];

    let bgColor = '';
    if (leave) {
      if (leave.status === 'approved') {
        bgColor = leave.type === 'paid-time-off' ? 'bg-accent-500 text-white font-bold' :
                   leave.type === 'sick-leave' ? 'bg-[#eab308] text-white font-bold' :
                   'bg-[#3b82f6] text-white font-bold';
      } else {
        bgColor = 'bg-surface-700 border border-surface-600 text-surface-300 pattern-diagonal-lines-sm opacity-80';
      }
    }

    cells.push(
      <div
        key={day}
        className={`h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${bgColor} ${
          isToday && !leave ? 'bg-surface-700/50 text-white font-bold ring-1 ring-inset ring-accent-500' : ''
        } ${!leave && !isToday ? 'text-surface-400 hover:bg-surface-800' : ''}`}
        title={leave ? `${LEAVE_TYPE_LABELS[leave.type]} (${leave.status})` : ''}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="p-1 text-surface-400 hover:text-white hover:bg-surface-800 rounded transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-white w-24 text-center">{monthName}</span>
          <button onClick={() => navigateMonth(1)} className="p-1 text-surface-400 hover:text-white hover:bg-surface-800 rounded transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="h-8 flex items-center justify-center text-[10px] font-bold text-surface-500 uppercase">{d}</div>
        ))}
        {cells}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-surface-800">
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-500" /> PTO
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
          <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Sick
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Unpaid
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
          <div className="w-2.5 h-2.5 rounded-full bg-surface-700 border border-surface-600" /> Pending
        </div>
      </div>
    </div>
  );
}


