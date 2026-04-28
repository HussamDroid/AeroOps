import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Activity, DollarSign, Thermometer, Globe } from 'lucide-react';

const FleetMonitor = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/live-operations');
        const result = await response.json();
        setFlights(result.data);
        setLoading(false);
      } catch (error) {
        console.error("AeroEngine Link Offline:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex font-sans">
      {/* SIDEBAR */}
      <div className="w-72 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-qatar p-2 rounded-lg shadow-lg shadow-qatar/20">
            <Plane className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">AeroOps</h1>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 mb-3 flex items-center uppercase">
              <Activity className="w-3 h-3 mr-2" /> CORE STATUS
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Math Engine:</span>
              <span className="text-green-400 font-mono italic">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* IMPORTANT: Link to Simulation Page */}
        <Link to="/simulate" className="bg-qatar hover:bg-red-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg shadow-qatar/10">
          <Globe className="w-4 h-4 mr-2" /> SIMULATION MODE
        </Link>
      </div>

      {/* MAIN VIEW */}
      <main className="flex-1 p-10 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="h-1 w-8 bg-qatar rounded-full"></span>
              <p className="text-qatar font-bold text-xs tracking-[0.3em] uppercase">Operations Center</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter">Fleet Monitor</h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center min-w-[140px]">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Active QTR</p>
            <p className="text-3xl font-mono font-bold text-white tracking-tighter">{flights.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 italic">
              Synchronizing with Doha Air Traffic Control...
            </div>
          ) : (
            flights.map((f, i) => (
              <div key={i} className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-7 rounded-3xl hover:border-qatar/40 transition-all shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-2xl font-mono font-bold text-white tracking-tighter">{f.callsign}</span>
                  <div className="flex items-center bg-zinc-800 px-3 py-1.5 rounded-full text-[10px] font-black text-green-400">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    ACTIVE
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                    <span className="text-zinc-400 text-xs flex items-center"><DollarSign className="w-3.5 h-3.5 mr-2 text-qatar" /> Op Cost</span>
                    <span className="text-sm font-bold text-white">${f.estimated_hourly_cost}<span className="text-zinc-600 font-normal"> /hr</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-xs flex items-center"><Thermometer className="w-3.5 h-3.5 mr-2 text-orange-500" /> Thermal Loss</span>
                    <span className="text-sm font-bold text-orange-400">+{f.efficiency_loss}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default FleetMonitor;