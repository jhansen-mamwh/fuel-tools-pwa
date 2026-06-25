import { useState, useEffect, useMemo, useRef } from 'react';
import { Calculator, Scale, Droplets, RotateCcw, Moon, Sun, History, Download } from 'lucide-react';
import ApiCalculator from './ApiCalculator';
import GrossNetCalculator from './GrossNetCalculator';
import WgtVolCalculator from './WgtVolCalculator';
import { type FuelType, type WgtVolUnit, calculateGrossNet, calculateWgtVol } from '../utils/apiCalculator';
import { useHistory, type HistoryEntry } from '../utils/useHistory';

export interface SharedState {
  fuelType: FuelType; setFuelType: (val: FuelType) => void;
  obsApi: string; setObsApi: (val: string) => void;
  obsTemp: string; setObsTemp: (val: string) => void;
  corrApi: string; setCorrApi: (val: string) => void;
  grossVol: string; setGrossVol: (val: string) => void;
  wgtVolUnit: WgtVolUnit; setWgtVolUnit: (val: WgtVolUnit) => void;
  wgtVolAmt: string; setWgtVolAmt: (val: string) => void;
}

export default function Layout() {
  const [activeTab, setActiveTab] = useState('api');
  const [isNightMode, setIsNightMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [fuelType, setFuelType] = useState<FuelType>('jet a');
  const [obsApi, setObsApi] = useState('');
  const [obsTemp, setObsTemp] = useState('');
  const [corrApi, setCorrApi] = useState('');
  const [grossVol, setGrossVol] = useState('');
  const [wgtVolUnit, setWgtVolUnit] = useState<WgtVolUnit>('gal');
  const [wgtVolAmt, setWgtVolAmt] = useState('');

const { history, recordState, finalizeSave } = useHistory();
  
  // THE FIREGATE: Starts true so the app doesn't save the empty state on initial load
  const isProgrammaticUpdate = useRef(true); 
  const activeTabRef = useRef(activeTab);

  // Unblock the save gate shortly after the initial app load
  useEffect(() => {
    const timer = setTimeout(() => { isProgrammaticUpdate.current = false; }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Keep track of the active tab for the saver without triggering the save effect
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Dark mode trigger
  useEffect(() => {
    if (isNightMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isNightMode]);

  // ==========================================
  // 1. THE OVERWRITE TRIGGER
  // ==========================================
  useEffect(() => {
    // If the gate is closed (because of a restore, clear, or tab switch), abort the save!
    if (isProgrammaticUpdate.current) return;
    
    // Otherwise, this was a genuine keystroke. Record it.
    recordState(activeTabRef.current, { fuelType, obsApi, obsTemp, corrApi, grossVol, wgtVolUnit, wgtVolAmt });
  }, [fuelType, obsApi, obsTemp, corrApi, grossVol, wgtVolUnit, wgtVolAmt, recordState]);
  // ^ Note: activeTab is INTENTIONALLY removed from the dependency array above!

  // ==========================================
  // 2. EXPLICIT TRIGGERS (Close the gate, execute, reopen the gate)
  // ==========================================
  const handleTabSwitch = (tab: string) => {
    finalizeSave(); // Lock in the previous tab's work
    isProgrammaticUpdate.current = true; // Close gate
    setActiveTab(tab);
    setTimeout(() => { isProgrammaticUpdate.current = false; }, 100); // Reopen gate
  };

  const clearAll = () => {
    if (window.confirm('Clear all current inputs?')) {
      finalizeSave();
      isProgrammaticUpdate.current = true; // Close gate
      
      setFuelType('jet a'); setObsApi(''); setObsTemp(''); setCorrApi(''); 
      setGrossVol(''); setWgtVolUnit('gal'); setWgtVolAmt('');
      
      setTimeout(() => { isProgrammaticUpdate.current = false; }, 100); // Reopen gate
    }
  };

  const restoreHistory = (entry: HistoryEntry) => {
    finalizeSave();
    isProgrammaticUpdate.current = true; // Close gate
    
    setFuelType(entry.state.fuelType);
    setObsApi(entry.state.obsApi);
    setObsTemp(entry.state.obsTemp);
    setCorrApi(entry.state.corrApi);
    setGrossVol(entry.state.grossVol);
    setWgtVolUnit(entry.state.wgtVolUnit);
    setWgtVolAmt(entry.state.wgtVolAmt);
    
    setIsHistoryOpen(false);
    
    // Give child calculators 100ms to process the restored data before re-arming saves
    setTimeout(() => { isProgrammaticUpdate.current = false; }, 100); 
  };

  const state: SharedState = {
    fuelType, setFuelType, obsApi, setObsApi, obsTemp, setObsTemp,
    corrApi, setCorrApi, grossVol, setGrossVol, wgtVolUnit, setWgtVolUnit, wgtVolAmt, setWgtVolAmt
  };

  // Filter history based on the currently selected tab
  const activeHistory = useMemo(() => {
    return history.filter(h => h.mode === activeTab).sort((a, b) => b.timestamp - a.timestamp);
  }, [history, activeTab]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-slate-900 dark:bg-black dark:border-b dark:border-red-900 text-white dark:text-red-500 p-4 shadow-md sticky top-0 z-30 flex justify-between items-center transition-colors">
        <h1 className="text-xl font-black tracking-wide">FUEL TOOLS</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`p-2 rounded-full transition-colors active:scale-95 ${isHistoryOpen ? 'bg-blue-600 dark:bg-red-800 text-white' : 'hover:bg-white/10 dark:hover:bg-red-900/30'}`}>
            <History size={22} />
          </button>
          <button onClick={clearAll} className="p-2 hover:bg-white/10 dark:hover:bg-red-900/30 rounded-full transition-colors active:scale-95">
            <RotateCcw size={22} />
          </button>
          <button onClick={() => setIsNightMode(!isNightMode)} className="p-2 hover:bg-white/10 dark:hover:bg-red-900/30 rounded-full transition-colors active:scale-95">
            {isNightMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      {/* Main Container relative so the modal is contained above the tabs */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Calculators (Underneath Modal) */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'api' && <ApiCalculator {...state} />}
          {activeTab === 'gross' && <GrossNetCalculator {...state} />}
          {activeTab === 'weight' && <WgtVolCalculator {...state} />}
        </div>

        {/* Slide-Up History Modal */}
        <div className={`absolute inset-0 bg-slate-100 dark:bg-black z-20 transition-transform duration-300 ease-in-out overflow-y-auto ${isHistoryOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="p-4 max-w-md mx-auto pb-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-red-600 uppercase tracking-widest">Offline Log</h2>
              <span className="text-xs font-bold bg-slate-200 dark:bg-red-950 text-slate-500 dark:text-red-800 px-3 py-1 rounded-full">{activeHistory.length}/10 Saved</span>
            </div>

            {activeHistory.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-red-900 font-medium mt-10">No history for this mode yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeHistory.map(entry => {
                  const date = new Date(entry.timestamp);
                  const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                  
                  return (
                    <div key={entry.id} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-red-900 rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors">
                      {/* Card Header */}
                      <div className="flex justify-between items-center border-b-2 border-slate-100 dark:border-red-950 pb-2">
                        <span className="text-sm font-bold text-slate-500 dark:text-red-700">{timeString} Local</span>
                        
                        {/* Only show the fuel type tag if we are NOT on the Weight/Volume tab */}
                        {activeTab !== 'weight' && (
                          <span className="text-xs font-black uppercase text-slate-400 dark:text-red-800 bg-slate-100 dark:bg-red-950 px-2 py-1 rounded">
                            {entry.state.fuelType}
                          </span>
                        )}
                      </div>
                      
                      {/* Verbose Text Formulas */}
                      <div className="text-slate-800 dark:text-red-500 font-medium font-mono text-sm leading-relaxed">
                        
                        {activeTab === 'api' && (
                          `Obs: ${entry.state.obsApi || '-'} @ ${entry.state.obsTemp || '-'}°F | Corr: ${entry.state.corrApi || '-'}`
                        )}
                        
                        {activeTab === 'gross' && (() => {
                          const gn = calculateGrossNet(entry.state.fuelType, entry.state.corrApi, entry.state.obsTemp, entry.state.grossVol);
                          const netStr = gn ? gn.netVol.toLocaleString() : '-';
                          return `Gross: ${entry.state.grossVol || '-'} @ ${entry.state.obsTemp || '-'}°F | API: ${entry.state.corrApi || '-'} | Net: ${netStr}`;
                        })()}
                        
                        {activeTab === 'weight' && (() => {
                          const wv = calculateWgtVol(entry.state.corrApi, entry.state.wgtVolUnit, entry.state.wgtVolAmt);
                          const unitMap: Record<string, string> = { gal: 'gal', lb: 'lbs', l: 'L', kg: 'kg' };
                          const fromU = unitMap[entry.state.wgtVolUnit] || entry.state.wgtVolUnit;
                          
                          let convStr = '- / - / -';
                          if (wv) {
                            const parts = [];
                            if (entry.state.wgtVolUnit !== 'gal') parts.push(`${wv.gal.toLocaleString()} gal`);
                            if (entry.state.wgtVolUnit !== 'lb') parts.push(`${wv.lb.toLocaleString()} lbs`);
                            if (entry.state.wgtVolUnit !== 'l') parts.push(`${wv.l.toLocaleString()} L`);
                            if (entry.state.wgtVolUnit !== 'kg') parts.push(`${wv.kg.toLocaleString()} kg`);
                            convStr = parts.join(' / ');
                          }
                          
                          return `Amt: ${entry.state.wgtVolAmt || '-'} ${fromU} | API: ${entry.state.corrApi || '-'} | ${convStr}`;
                        })()}

                      </div>

                      {/* Restore Button */}
                      <button onClick={() => restoreHistory(entry)} className="mt-1 flex items-center justify-center gap-2 w-full bg-slate-100 dark:bg-red-950 hover:bg-slate-200 dark:hover:bg-red-900 text-slate-700 dark:text-red-500 font-bold py-2 rounded-lg transition-colors active:scale-95">
                        <Download size={16} /> Restore State
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-black border-t-2 border-slate-200 dark:border-red-900 fixed bottom-0 w-full pb-safe z-30 transition-colors">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <button onClick={() => handleTabSwitch('api')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'api' ? 'text-blue-600 dark:text-red-500' : 'text-slate-400 dark:text-red-950 hover:text-slate-600'}`}>
            <Calculator size={28} strokeWidth={activeTab === 'api' ? 2.5 : 2} />
            <span className="text-xs font-bold">API Corr</span>
          </button>
          
          <button onClick={() => handleTabSwitch('gross')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'gross' ? 'text-blue-600 dark:text-red-500' : 'text-slate-400 dark:text-red-950 hover:text-slate-600'}`}>
            <Droplets size={28} strokeWidth={activeTab === 'gross' ? 2.5 : 2} />
            <span className="text-xs font-bold">Gross/Net</span>
          </button>

          <button onClick={() => handleTabSwitch('weight')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'weight' ? 'text-blue-600 dark:text-red-500' : 'text-slate-400 dark:text-red-950 hover:text-slate-600'}`}>
            <Scale size={28} strokeWidth={activeTab === 'weight' ? 2.5 : 2} />
            <span className="text-xs font-bold">Wgt/Vol</span>
          </button>
        </div>
      </nav>
    </div>
  );
}