import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    // Attendance
    present: 'bg-status-green/15 text-status-green border-status-green/20',
    absent: 'bg-status-red/15 text-status-red border-status-red/20',
    leave: 'bg-status-yellow/15 text-status-yellow border-status-yellow/20',
    'half-day': 'bg-status-blue/15 text-status-blue border-status-blue/20',
    
    // Leave requests
    pending: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/20',
    approved: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/20',
    rejected: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/20',
  };

  const Icons: Record<string, React.ElementType> = {
    present: CheckCircle2,
    absent: XCircle,
    leave: AlertCircle,
    'half-day': Clock,
    
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle
  };

  const Icon = Icons[status];
  const style = styles[status] || 'bg-surface-700/50 text-surface-300 border-surface-600/50';
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${style}`}>
      {Icon && <Icon size={12} />}
      {status}
    </span>
  );
}
