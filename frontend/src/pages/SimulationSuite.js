import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Polyline, useMapEvents } from 'react-leaflet';
import { ShieldAlert, Trash2, Plane, Sun, Moon, Wind, Thermometer, X, Info, Clock, AlertCircle, Weight, Activity, Fuel, CheckCircle, DollarSign } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick([e.latlng.lat, e.latlng.lng]) });
    return null;
};

const SimulationSuite = () => {
    const [theme, setTheme] = useState('dark');
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [zones, setZones] = useState([]);
    const [analysis, setAnalysis] = useState({ status: 'IDLE', strategies: [] });
    const [activeStrategy, setActiveStrategy] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const isDark = theme === 'dark';
    const bg = isDark ? 'bg-[#050505]' : 'bg-zinc-50';
    const panel = isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl';

    useEffect(() => {
        const init = async () => {
            const fRes = await fetch('http://localhost:8000/api/live-operations');
            const fData = await fRes.json(); setFlights(fData.data);
            const zRes = await fetch('http://localhost:8000/api/zones');
            const zData = await zRes.json(); setZones(zData);
        };
        init();
    }, []);

    const runAnalysis = async (flight, currentZones) => {
        const res = await fetch('http://localhost:8000/api/analyze-path', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flight, zones: currentZones })
        });
        const data = await res.json(); setAnalysis(data);
        if (data.status === 'CONFLICT' && data.strategies.length > 0) setActiveStrategy(data.strategies[0]);
    };

    const addZone = async (coords) => {
        const zoneData = { center: coords, radius: 110000 };
        const res = await fetch('http://localhost:8000/api/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(zoneData) });
        const saved = await res.json(); const newZones = [...zones, { ...zoneData, id: saved.id }];
        setZones(newZones); if (selectedFlight) runAnalysis(selectedFlight, newZones);
    };

    const removeZone = async (id) => {
        await fetch(`http://localhost:8000/api/zones/${id}`, { method: 'DELETE' });
        const filtered = zones.filter(z => z.id !== id); setZones(filtered);
        if (selectedFlight) runAnalysis(selectedFlight, filtered);
    };

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false); setShowSuccess(true);
            setTimeout(() => { setShowModal(false); setShowSuccess(false); }, 2000);
        }, 1200);
    };

    return (
        <div className={`h-screen ${bg} flex flex-col font-sans transition-all overflow-hidden`}>
            <header className={`h-20 border-b flex items-center px-8 justify-between z-[1000] ${panel}`}>
                <div className="flex items-center space-x-6">
                    <div><span className="text-[10px] font-black text-qatar uppercase block">AeroPredict</span><span className="text-2xl font-black italic tracking-tighter">MISSION.CENTER</span></div>
                    <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-zinc-500/10 transition">{isDark ? <Sun className="w-5 text-yellow-500" /> : <Moon className="w-5 text-indigo-600" />}</button>
                </div>
                <div className="flex space-x-8 text-sm font-black">
                    <span className="flex items-center"><Thermometer className="w-4 h-4 mr-2 text-orange-500"/> 42.2°C</span>
                    <span className="flex items-center"><Wind className="w-4 h-4 mr-2 text-sky-500"/> 18kts NW</span>
                </div>
            </header>

            <main className="flex-1 flex p-6 space-x-6 overflow-hidden">
                <div className="w-80 flex flex-col space-y-4">
                    <div className={`${panel} border p-6 rounded-[2rem] flex-1 overflow-hidden flex flex-col`}>
                        <h3 className="text-[10px] font-black uppercase mb-4 opacity-50 tracking-widest">Global Fleet Assets</h3>
                        <div className="space-y-1 overflow-y-auto pr-2">
                            {flights.map(f => (
                                <button key={f.callsign} onClick={() => { setSelectedFlight(f); runAnalysis(f, zones); }} className={`w-full p-4 rounded-xl text-left font-black text-sm border transition-all ${selectedFlight?.callsign === f.callsign ? 'border-qatar bg-qatar/5 text-qatar' : 'border-transparent hover:bg-zinc-500/5'}`}>{f.callsign} <span className="float-right opacity-30 text-[9px] uppercase">{f.type}</span></button>
                            ))}
                        </div>
                    </div>
                    <div className={`${panel} border p-6 rounded-[2rem] h-48 overflow-hidden flex flex-col`}>
                        <h3 className="text-[10px] font-black uppercase mb-4 opacity-50 tracking-widest">Restricted Zones</h3>
                        <div className="space-y-2 overflow-y-auto">
                            {zones.map((z, i) => (<div key={z.id} className="flex justify-between p-3 bg-zinc-500/5 rounded-xl text-[10px] font-bold border border-zinc-500/10 items-center">ZONE_ALPHA_0{i+1} <button onClick={() => removeZone(z.id)} className="text-red-500 hover:scale-110"><Trash2 className="w-4"/></button></div>))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-black relative shadow-2xl">
                        <MapContainer center={[25.27, 51.52]} zoom={5} className="h-full w-full" zoomControl={false}>
                            <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
                            <MapClickHandler onMapClick={addZone} />
                            {zones.map(z => (<Circle key={z.id} center={z.center} radius={z.radius} pathOptions={{ color: '#ef4444', fillOpacity: 0.15, weight: 2, dashArray: '8,8' }} />))}
                            {selectedFlight && (
                                <>
                                    <Polyline positions={[selectedFlight.start, selectedFlight.end]} pathOptions={{ color: analysis.status === 'CONFLICT' ? '#ef4444' : '#10b981', weight: 2, dashArray: '10,15', opacity: 0.5 }} />
                                    {analysis.strategies.map(s => (
                                        <Polyline key={s.id} positions={[selectedFlight.start, s.waypoint, selectedFlight.end]} pathOptions={{ color: s.color, weight: activeStrategy?.id === s.id ? 6 : 3, dashArray: activeStrategy?.id === s.id ? '0' : '12,12', opacity: activeStrategy?.id === s.id ? 1 : 0.6 }} />
                                    ))}
                                </>
                            )}
                        </MapContainer>
                    </div>

                    <div className="h-40 flex space-x-4">
                        {analysis.status === 'CONFLICT' ? analysis.strategies.map(s => (
                            <button key={s.id} onClick={() => { setActiveStrategy(s); setShowModal(true); }} className={`${panel} border flex-1 p-6 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all flex flex-col justify-between shadow-lg`}>
                                <div className="flex justify-between items-center"><span className="font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-500/10" style={{ color: s.color }}>{s.name}</span><Info className="w-4 opacity-30"/></div>
                                <div className="flex items-end justify-between"><div className="text-3xl font-black italic tracking-tighter">${s.cost.toLocaleString()}</div><span className="text-[10px] font-bold opacity-40">+{s.detour} KM</span></div>
                            </button>
                        )) : <div className={`${panel} border flex-1 rounded-[2.5rem] flex items-center justify-center opacity-30 italic font-bold tracking-widest text-xs`}>STANDBY FOR MISSION ANALYSIS...</div>}
                    </div>
                </div>
            </main>

            {showModal && activeStrategy && (
                <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
                    <div className={`${panel} border w-full max-w-5xl rounded-[4rem] relative overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]`}>
                        {showSuccess && <div className="absolute inset-0 z-[6000] bg-emerald-600 flex flex-col items-center justify-center text-white"><CheckCircle className="w-24 h-24 mb-6 animate-bounce" /><h2 className="text-4xl font-black italic tracking-tighter">UPLINK SUCCESSFUL</h2><p className="font-bold opacity-80 uppercase tracking-[0.3em] mt-2">Mission parameters pushed to ACARS</p></div>}
                        
                        <div className="p-12 border-b border-zinc-500/10 flex justify-between items-center bg-zinc-500/5">
                            <div><h2 className="text-4xl font-black italic tracking-tighter" style={{ color: activeStrategy.color }}>{activeStrategy.name} MISSION REPORT</h2><p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mt-2">Asset: {selectedFlight?.callsign} | Airframe: {selectedFlight?.type}</p></div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-red-500/10 rounded-full text-red-500 transition"><X className="w-10" /></button>
                        </div>

                        <div className="p-16 grid grid-cols-3 gap-16">
                            <div className="space-y-8 border-r border-zinc-500/10 pr-16">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center"><Info className="w-5 mr-3" /> Operational Sectors</h4>
                                <div className="space-y-6">
                                    <div><span className="block text-[10px] uppercase font-black opacity-40 mb-1">Origin Hub</span><span className="text-2xl font-black italic">{selectedFlight?.origin}</span></div>
                                    <div><span className="block text-[10px] uppercase font-black opacity-40 mb-1">Arrival Hub</span><span className="text-2xl font-black italic">{selectedFlight?.destination}</span></div>
                                    <div className="pt-8 border-t border-zinc-500/10">
                                        <div className="flex items-center space-x-3"><Weight className="w-5 text-zinc-500"/><span className="text-[10px] uppercase font-black opacity-40">Airframe MTOW</span></div>
                                        <span className="text-2xl font-black italic mt-1 block">{selectedFlight?.mtow}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 border-r border-zinc-500/10 pr-16">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center"><Clock className="w-5 mr-3" /> Crew Readiness</h4>
                                <div className="p-8 bg-zinc-500/5 rounded-[2.5rem] border border-zinc-500/10">
                                    <span className="text-[10px] font-black opacity-40 uppercase block mb-3 tracking-widest">Active Duty Window</span>
                                    <span className="text-4xl font-black font-mono tracking-tighter">{selectedFlight?.crew_duty}</span>
                                    <div className="w-full h-2 bg-zinc-500/10 mt-6 rounded-full overflow-hidden"><div className="h-full bg-qatar" style={{ width: '65%' }}></div></div>
                                    <div className={`mt-6 text-[11px] font-black uppercase p-3 rounded-2xl text-center border ${selectedFlight?.fatigue_index.includes('Low') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>{selectedFlight?.fatigue_index} FATIGUE INDEX</div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center"><Activity className="w-5 mr-3" /> Resource Impact</h4>
                                    <div className="p-6 bg-zinc-500/5 rounded-3xl flex justify-between items-center border border-zinc-800">
                                        <div className="flex items-center space-x-3 text-zinc-500"><DollarSign className="w-5"/><span className="text-xs font-bold uppercase">Deployment Cost</span></div>
                                        <span className="text-2xl font-black text-red-500">{activeStrategy.comparison.cost_diff}</span>
                                    </div>
                                    <div className="p-6 bg-zinc-500/5 rounded-3xl flex justify-between items-center border border-zinc-800">
                                        <div className="flex items-center space-x-3 text-zinc-500"><Fuel className="w-5"/><span className="text-xs font-bold uppercase">Fuel Delta</span></div>
                                        <span className="text-2xl font-black text-red-500">{activeStrategy.comparison.fuel_diff}</span>
                                    </div>
                                    <div className="p-6 bg-emerald-500/10 rounded-3xl flex justify-between items-center border border-emerald-500/20 text-emerald-500">
                                        <div className="flex items-center space-x-3"><ShieldAlert className="w-5"/><span className="text-xs font-bold uppercase">Safety Rating</span></div>
                                        <span className="text-2xl font-black">{activeStrategy.comparison.safety_score}</span>
                                    </div>
                                </div>
                                <button onClick={handleDeploy} disabled={isDeploying} className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-zinc-200 transition shadow-2xl active:scale-95 text-sm mt-10">
                                    {isDeploying ? 'Establishing Uplink...' : 'Deploy Updated Mission'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationSuite;