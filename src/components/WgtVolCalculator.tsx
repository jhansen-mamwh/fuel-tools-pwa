import { useMemo } from 'react';
import { XCircle } from 'lucide-react';
import { calculateWgtVol, type WgtVolUnit } from '../utils/apiCalculator';
import { type SharedState } from './Layout';

const UNITS: { id: WgtVolUnit; label: string }[] = [
  { id: 'gal', label: 'Gallons' },
  { id: 'lb', label: 'Pounds' },
  { id: 'l', label: 'Liters' },
  { id: 'kg', label: 'Kilograms' },
];

export default function WgtVolCalculator(props: SharedState) {
  const { corrApi, setCorrApi, wgtVolUnit, setWgtVolUnit, wgtVolAmt, setWgtVolAmt } = props;

  const result = useMemo(() => {
    return calculateWgtVol(corrApi, wgtVolUnit, wgtVolAmt);
  }, [corrApi, wgtVolUnit, wgtVolAmt]);

  const activeLabel = UNITS.find(u => u.id === wgtVolUnit)?.label || '';

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-24">
      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-1 gap-3">
        {UNITS.filter(u => u.id !== wgtVolUnit).map(u => (
          <div key={u.id} className="bg-slate-900 dark:bg-black p-4 rounded-xl shadow-lg border-2 border-slate-800 dark:border-red-900 flex justify-between items-center transition-colors">
            <span className="text-slate-400 dark:text-red-800 font-bold uppercase tracking-wider text-sm">{u.label}</span>
            <span className="text-3xl font-black tabular-nums text-white dark:text-red-500">
              {result ? result[u.id].toLocaleString() : '---'}
            </span>
          </div>
        ))}
      </div>

      {/* Corrected API Input */}
      <div className="relative flex flex-col">
        <label className="text-sm font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Corr API @ 60°F</label>
        <input type="number" inputMode="decimal" value={corrApi} onChange={(e) => setCorrApi(e.target.value)}
          className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-2xl font-bold px-4 py-3 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
      </div>

      {/* Unit Selector */}
      <div className="flex flex-col bg-slate-200 dark:bg-red-950 p-1 rounded-xl shadow-inner gap-1 transition-colors">
        <div className="text-center text-xs font-bold text-slate-500 dark:text-red-800 uppercase mt-1 transition-colors">Convert From</div>
        <div className="flex gap-1 p-1">
          {UNITS.map((u) => (
            <button key={u.id} onClick={() => setWgtVolUnit(u.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                wgtVolUnit === u.id 
                  ? 'bg-white dark:bg-red-900 text-slate-900 dark:text-white shadow' 
                  : 'text-slate-500 dark:text-red-800 hover:text-slate-700 dark:hover:text-red-500'
              }`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative flex flex-col">
        <label className="text-sm font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Amount ({activeLabel})</label>
        <div className="relative flex items-center">
          <input type="number" inputMode="decimal" value={wgtVolAmt} onChange={(e) => setWgtVolAmt(e.target.value)} placeholder={`e.g., 5000`}
            className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-3xl font-bold px-4 py-4 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-red-900/30 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
          {wgtVolAmt && <button onClick={() => setWgtVolAmt('')} className="absolute right-4 text-slate-400 dark:text-red-900 hover:text-slate-600 dark:hover:text-red-600"><XCircle size={32} /></button>}
        </div>
      </div>
    </div>
  );
}