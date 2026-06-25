import { useMemo, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { calculateCorrectedApi, type FuelType } from '../utils/apiCalculator';
import { type SharedState } from './Layout';

const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: 'gasoline', label: 'Gasoline' },
  { id: 'jet a', label: 'Jet A' },
  { id: 'diesel', label: 'Diesel' },
];

export default function ApiCalculator(props: SharedState) {
  const { fuelType, setFuelType, obsApi, setObsApi, obsTemp, setObsTemp, setCorrApi } = props;

  const correctedApi = useMemo(() => {
    return calculateCorrectedApi(fuelType, obsApi, obsTemp);
  }, [fuelType, obsApi, obsTemp]);

  useEffect(() => {
    if (correctedApi !== null) setCorrApi(correctedApi.toFixed(1));
  }, [correctedApi, setCorrApi]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-24">
      {/* Result Card */}
      <div className="bg-slate-900 dark:bg-black text-white dark:text-red-500 p-6 rounded-2xl shadow-lg border-4 border-slate-800 dark:border-red-900 text-center flex flex-col items-center justify-center min-h-[160px] transition-colors">
        <h2 className="text-slate-400 dark:text-red-800 font-bold uppercase tracking-wider text-sm mb-2">Corrected API @ 60°F</h2>
        <div className="text-6xl font-black tabular-nums tracking-tight">
          {correctedApi !== null ? correctedApi.toFixed(1) : '---'}
        </div>
      </div>

      {/* Segmented Control */}
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

      {/* Inputs */}
      <div className="space-y-4">
        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Observed API Gravity</label>
          <div className="relative flex items-center">
            <input type="number" inputMode="decimal" value={obsApi} onChange={(e) => setObsApi(e.target.value)} placeholder="e.g., 45.2"
              className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-3xl font-bold px-4 py-4 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-red-900/30 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
            {obsApi && <button onClick={() => setObsApi('')} className="absolute right-4 text-slate-400 dark:text-red-900 hover:text-slate-600 dark:hover:text-red-600"><XCircle size={32} /></button>}
          </div>
        </div>

        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-slate-700 dark:text-red-800 uppercase mb-1 ml-1 transition-colors">Observed Temp (°F)</label>
          <div className="relative flex items-center">
            <input type="number" inputMode="decimal" value={obsTemp} onChange={(e) => setObsTemp(e.target.value)} placeholder="e.g., 72.5"
              className="w-full bg-white dark:bg-black border-2 border-slate-300 dark:border-red-900 rounded-xl text-3xl font-bold px-4 py-4 text-slate-900 dark:text-red-500 focus:border-blue-500 dark:focus:border-red-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-red-900/30 placeholder:text-slate-300 dark:placeholder:text-red-950 transition-colors" />
            {obsTemp && <button onClick={() => setObsTemp('')} className="absolute right-4 text-slate-400 dark:text-red-900 hover:text-slate-600 dark:hover:text-red-600"><XCircle size={32} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}