import React, { useState, useMemo } from 'react';
import { XCircle } from 'lucide-react';
import { calculateCorrectedApi, type FuelType } from '../utils/apiCalculator';

const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: 'gasoline', label: 'Gasoline' },
  { id: 'jet a', label: 'Jet A' },
  { id: 'diesel', label: 'Diesel' },
];

export default function ApiCalculator() {
  const [fuelType, setFuelType] = useState<FuelType>('jet a');
  const [api, setApi] = useState<string>('');
  const [temp, setTemp] = useState<string>('');

  const correctedApi = useMemo(() => {
    return calculateCorrectedApi(fuelType, api, temp);
  }, [fuelType, api, temp]);

  const clearInput = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-24">
      {/* Result Display */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border-4 border-slate-800 text-center flex flex-col items-center justify-center min-h-[160px]">
        <h2 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">
          Corrected API @ 60°F
        </h2>
        <div className="text-6xl font-black tabular-nums tracking-tight">
          {correctedApi !== null ? correctedApi.toFixed(1) : '---'}
        </div>
      </div>

      {/* Fuel Type Selector */}
      <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
        {FUEL_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setFuelType(type.id)}
            className={`flex-1 py-3 text-lg font-bold rounded-lg transition-colors ${
              fuelType === type.id
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* API Input */}
        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-slate-700 uppercase mb-1 ml-1">
            Observed API Gravity
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="decimal"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              placeholder="e.g., 45.2"
              className="w-full bg-white border-2 border-slate-300 rounded-xl text-3xl font-bold px-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
            />
            {api && (
              <button
                onClick={() => clearInput(setApi)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 active:scale-95"
              >
                <XCircle size={32} />
              </button>
            )}
          </div>
        </div>

        {/* Temp Input */}
        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-slate-700 uppercase mb-1 ml-1">
            Observed Temp (°F)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="decimal"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="e.g., 72.5"
              className="w-full bg-white border-2 border-slate-300 rounded-xl text-3xl font-bold px-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
            />
            {temp && (
              <button
                onClick={() => clearInput(setTemp)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 active:scale-95"
              >
                <XCircle size={32} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}