import { useState } from 'react';
import { Calculator, Scale, Droplets } from 'lucide-react';
import ApiCalculator from './ApiCalculator';

export default function Layout() {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-black tracking-wide">FUEL TOOLS</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'api' && <ApiCalculator />}
        {activeTab === 'weight' && <div className="p-8 text-center text-slate-400 font-bold">Weight/Volume (Coming Soon)</div>}
        {activeTab === 'gross' && <div className="p-8 text-center text-slate-400 font-bold">Gross to Net (Coming Soon)</div>}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t-2 border-slate-200 fixed bottom-0 w-full pb-safe">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'api' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calculator size={28} strokeWidth={activeTab === 'api' ? 2.5 : 2} />
            <span className="text-xs font-bold">API Corr</span>
          </button>
          
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'weight' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Scale size={28} strokeWidth={activeTab === 'weight' ? 2.5 : 2} />
            <span className="text-xs font-bold">Wgt/Vol</span>
          </button>

          <button
            onClick={() => setActiveTab('gross')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'gross' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Droplets size={28} strokeWidth={activeTab === 'gross' ? 2.5 : 2} />
            <span className="text-xs font-bold">Gross/Net</span>
          </button>
        </div>
      </nav>
    </div>
  );
}