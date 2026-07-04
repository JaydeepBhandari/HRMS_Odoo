
interface BalanceCardProps {
  label: string;
  available: number;
  total: number;
  used: number;
  color: 'accent' | 'yellow' | 'blue';
}

export function BalanceCard({ label, available, total, used, color }: BalanceCardProps) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const barColor = color === 'accent' ? 'bg-accent-500' : color === 'yellow' ? 'bg-[#eab308]' : 'bg-[#3b82f6]';

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{label}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-900 border border-surface-700 text-surface-300">
          {total} TOTAL
        </span>
      </div>
      <div className="flex items-baseline gap-1 mt-1 mb-4">
        <span className="text-3xl font-bold text-white">{available}</span>
        <span className="text-sm font-medium text-surface-500">days available</span>
      </div>
      
      <div className="w-full h-2 bg-surface-900 rounded-full overflow-hidden border border-surface-700/50">
        <div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs font-medium text-surface-500">
        <span>{used} used</span>
        <span>{available} left</span>
      </div>
    </div>
  );
}
