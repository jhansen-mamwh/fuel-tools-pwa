import { useMemo } from 'react';
import { XCircle } from 'lucide-react';
import { calculateGrossNet, type FuelType } from '../utils/apiCalculator';
import { type SharedState } from './Layout';

const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: 'gasoline', label: 'Gasoline' },
  { id: 'jet a', label: 'Jet A' },
  { id: 'diesel', label: 'Diesel' },
];

export default function GrossNetCalculator(props: SharedState) {
  const { fuelType, setFuelType, corrApi, setCorrApi, obsTemp, setObsTemp, grossVol, setGrossVol } = props;

  const result = useMemo(() => {
    return calculateGrossNet(fuelType, corrApi, obsTemp, grossVol);
  }, [fuelType, corrApi, obsTemp, grossVol]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-24">
      {/* Result Card */}
      <div className="bg-slate-900 dark:bg-black text-white dark:text-red-500 p-6 rounded-2xl shadow-lg border-4 border-slate-800 dark:border-red-900 flex flex-col items-center justify-center min-h-[160px] transition-colors">
        <h2 className="text-slate-400 dark:text-red-800 font-bold uppercase tracking-wider text-sm mb-2">Net Volume</h2>
        <div className="text-6xl font-black tabular-nums tracking-tight text-green-400 dark:text-red-500 transition-colors">
          {result ? result.netVol.toLocaleString() : '---'}
        </div>
        <div className="mt-2 text-sm text-slate-400 dark:text-red-800 font-medium transition-colors">
          VCF: <span className="text-white dark:text-red-400 font-bold">{result ? result.vcf.toFixed(5) : '-.-----'}</span>
        </div>
      </div>

      {/* Fuel Type Selector */}
      <div className="flex bg-slate-200 dark:bg-red-950 p-1 rounded-xl shadow-inner transition-colors">
        {FUEL_TYPES.map((type) => (
          <button key={type.id} onClick={() => setFuelType(type.id)}
            className={`flex-1 py-3 text-lg font-bold rounded-lg transition-colors ${
              fuelType === type.id 
                ? 'bg-white dark:bg-red-900 text-slate-900 dark:text-white shadow' 
                : 'text-slate-500 dark:text-red-800 hover:text-slate-700 dark:hover:text-red-500'
            }`}>
            {type.label}
          </button>
        ))}
      </div>

      {/* Shared State Inputs Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative flex flex-col">
          <label className="text-xs font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Corr API @ 60°F</label>
          <input type="number" inputMode="decimal" value={corrApi} onChange={(e) => setCorrApi(e.target.value)}
            className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-xl font-bold px-3 py-3 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
        </div>
        <div className="relative flex flex-col">
          <label className="text-xs font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Obs Temp (°F)</label>
          <input type="number" inputMode="decimal" value={obsTemp} onChange={(e) => setObsTemp(e.target.value)}
            className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-xl font-bold px-3 py-3 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
        </div>
      </div>

      {/* Gross Volume Input */}
      <div className="relative flex flex-col">
        <label className="text-sm font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Gross Volume</label>
        <div className="relative flex items-center">
          <input type="number" inputMode="decimal" value={grossVol} onChange={(e) => setGrossVol(e.target.value)} placeholder="e.g., 5000"
            className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-3xl font-bold px-4 py-4 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-red-900/30 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
          {grossVol && <button onClick={() => setGrossVol('')} className="absolute right-4 text-slate-400 dark:text-red-900 hover:text-slate-600 dark:hover:text-red-600"><XCircle size={32} /></button>}
        </div>
      </div>
    </div>
  );
}