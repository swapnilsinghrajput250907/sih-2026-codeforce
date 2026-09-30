import React, { useState, useEffect, useMemo } from 'react';
import {
  Train,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Activity,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Search,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  DollarSign,
  Leaf,
  Info,
  ChevronRight,
  TrendingUp,
  Camera,
  Server,
  Database,
  Globe,
  Radio,
  FileText,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';

const MOCK_TRAINS = [
  { id: 'WDFC-104', corridor: 'WDFC (Dadri to JNPT)', cargo: '4,200 Tonnes', status: 'On Schedule', speed: '88 km/h', eta: '42 mins', origin: 'Dadri Hub', dest: 'Mumbai Multimodal Node', utilization: 92 },
  { id: 'EDFC-208', corridor: 'EDFC (Ludhiana to Dankuni)', cargo: '3,800 Tonnes', status: 'Minor Delay', speed: '72 km/h', eta: '1h 15m', origin: 'Ludhiana Inland Depot', dest: 'Kolkata Port Terminal', utilization: 84 },
  { id: 'WDFC-302', corridor: 'WDFC (Ahmedabad Spur)', cargo: '5,100 Tonnes', status: 'On Schedule', speed: '95 km/h', eta: '18 mins', origin: 'Mundra Port', dest: 'NCR Freight Logistics Park', utilization: 98 },
  { id: 'EDFC-115', corridor: 'EDFC (Kanpur Section)', cargo: '3,100 Tonnes', status: 'On Schedule', speed: '81 km/h', eta: '2h 04m', origin: 'Kanpur Central Logistics', dest: 'Varanasi Terminal', utilization: 76 }
];

const MOCK_MEDIAN_CORRIDORS = [
  { id: 'MC-01', name: 'Inner Ring Corridor North', width: '7.2m', lanes: 2, status: 'Optimal Flow', EVShare: '68%', activeVehicles: 42, avgSpeed: '42 km/h', restrictedAccess: true },
  { id: 'MC-02', name: 'Outer Arterial Link East', width: '7.0m', lanes: 2, status: 'Heavy Transit', EVShare: '54%', activeVehicles: 61, avgSpeed: '31 km/h', restrictedAccess: true },
  { id: 'MC-03', name: 'NH-48 Central Median Bypass', width: '7.3m', lanes: 2, status: 'Alert: Invasion', EVShare: '82%', activeVehicles: 28, avgSpeed: '22 km/h', restrictedAccess: true }
];

const INITIAL_COMPLIANCE_LOGS = [
  { plate: 'MH-12-QX-9081', age: 3.2, fuel: 'Electric (EV)', regYear: 2023, status: 'AUTHORIZED', reason: 'EV Certified + Age < 7 Yrs', time: '10:42:12' },
  { plate: 'DL-01-GA-3312', age: 4.8, fuel: 'Diesel (Euro VI)', regYear: 2021, status: 'AUTHORIZED', reason: 'Age < 7 Yrs (Priority Arterial Permit)', time: '10:41:55' },
  { plate: 'KA-04-MB-1029', age: 8.5, fuel: 'Diesel (BS IV)', regYear: 2018, status: 'REJECTED', reason: 'Vehicle Age >= 7 Yrs (Exceeds Limit)', time: '10:40:30' },
  { plate: 'GJ-06-ZZ-4410', age: 1.1, fuel: 'Electric (EV)', regYear: 2025, status: 'AUTHORIZED', reason: 'Zero-Emission EV Fleet', time: '10:39:18' },
  { plate: 'HR-26-CP-0099', age: 9.1, fuel: 'Petrol (Private)', regYear: 2017, status: 'INVASION ALERT', reason: 'Unauthorized Private Vehicle & Age >= 7 Yrs', time: '10:38:02' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('macro');
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Vehicle Validator State
  const [testPlate, setTestPlate] = useState('DL-08-TR-2022');
  const [testFuel, setTestFuel] = useState('Diesel');
  const [testRegYear, setTestRegYear] = useState(2022);
  const [validationResult, setValidationResult] = useState(null);

  // Edge AI CCTV Simulation State
  const [cvAlerts, setCvAlerts] = useState([
    { id: 1, type: 'ANPR_UNAUTHORIZED', message: 'Unauthorized Private Sedan detected in MC-03 Corridor', time: '10:43:01', status: 'Active', latency: '1.2s' },
    { id: 2, type: 'ZERO_VELOCITY', message: 'Potential Truck Stoppage / Breakdown near Gateway Node B', time: '10:39:44', status: 'Resolved', latency: '2.1s' }
  ]);
  const [isSimulatingCV, setIsSimulatingCV] = useState(true);

  // Cost & Carbon Simulator State
  const [annualTonnage, setAnnualTonnage] = useState(2500000);
  const [railSharePercentage, setRailSharePercentage] = useState(65);

  const currentYear = 2026;
  const validateVehicleCompliance = () => {
    const age = currentYear - parseInt(testRegYear);
    const isEV = testFuel === 'Electric (EV)';
    
    let isEligible = false;
    let reasonCode = '';

    if (isEV) {
      isEligible = true;
      reasonCode = 'Pass: Fully Electric Zero-Emission Vehicle (Priority Clearance)';
    } else if (age < 7) {
      isEligible = true;
      reasonCode = `Pass: Vehicle Age (${age.toFixed(1)} yrs) is LESS than 7-year regulatory limit.`;
    } else {
      isEligible = false;
      reasonCode = `Violation: Vehicle Age (${age.toFixed(1)} yrs) EQUALS or EXCEEDS 7 years threshold. Non-EV trucks older than 7 years prohibited from Median Corridors.`;
    }

    setValidationResult({
      plate: testPlate.toUpperCase(),
      fuel: testFuel,
      age: age,
      status: isEligible ? 'AUTHORIZED' : 'DENIED ACCESS',
      reason: reasonCode,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    let interval;
    if (isSimulatingCV) {
      interval = setInterval(() => {
        const eventTypes = [
          { type: 'ANPR_PASS', msg: 'YOLOv8 verified EV Freight Van MH-14-EV-9011 in MC-01', status: 'Verified', latency: '0.8s' },
          { type: 'SPEED_CHECK', msg: 'Vehicle UP-16-BT-8890 cruising at 48km/h within MC-02 safe envelope', status: 'OK', latency: '1.1s' },
          { type: 'INVASION_ALERT', msg: 'Zero-Velocity Stoppage flagged in Arterial Median MC-03 (Frame #14092)', status: 'Warning', latency: '2.4s' }
        ];
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        setCvAlerts(prev => [
          { id: Date.now(), type: randomEvent.type, message: randomEvent.msg, time: new Date().toLocaleTimeString(), status: randomEvent.status, latency: randomEvent.latency },
          ...prev.slice(0, 5)
        ]);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCV]);

  const metrics = useMemo(() => {
    const totalRailCost = (annualTonnage * (railSharePercentage / 100) * 1.73).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const totalRoadCost = (annualTonnage * ((100 - railSharePercentage) / 100) * 3.29).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const estimatedSavings = ((annualTonnage * (railSharePercentage / 100) * (3.29 - 1.73))).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const co2SavedTons = Math.round((annualTonnage * (railSharePercentage / 100) * 0.00042));
    
    return { totalRailCost, totalRoadCost, estimatedSavings, co2SavedTons };
  }, [annualTonnage, railSharePercentage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Layers className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                SIH 2026 • PS-26205
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CODE FORCE
              </span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              Dual-Layer Rail-to-Road Urban Logistics Engine
            </h1>
          </div>
        </div>

        {/* View Switching Mode Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Live Control Center', icon: Activity },
            { id: 'compliance', label: 'Compliance & Rule Engine', icon: ShieldCheck },
            { id: 'architecture', label: 'Problem & Architecture', icon: Server },
            { id: 'optimization', label: 'OR-Tools & Cost AI', icon: TrendingUp },
            { id: 'impact', label: 'Feasibility & Carbon', icon: Leaf }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {}
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-6">

        {/* =========================================================================
            VIEW 1: LIVE CONTROL CENTER (DASHBOARD)
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top KPI Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Macro Freight Volume</span>
                  <Train className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">16,200 <span className="text-sm font-normal text-slate-400">T/day</span></span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">+14% vs Road</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">WDFC & EDFC High-Speed Rail Spines</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Median Corridors Active</span>
                  <Truck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">131 <span className="text-sm font-normal text-slate-400">Trucks</span></span>
                  <span className="text-xs font-semibold text-cyan-400">7.0 - 7.3m Medians</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Repurposed 2-Lane Restricted Transit</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 border-l-4 border-l-emerald-500 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Fleet Age & EV Compliance</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-400">98.4%</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Strict Mode</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">⚡ Prohibits Non-EV Trucks &ge; 7 Yrs Old</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Edge CV Alert Window</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-400">&lt; 1.8 s</span>
                  <span className="text-xs font-medium text-slate-400">Target &lt;3.0s</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">YOLOv8 Zero-Velocity Breakdown Detection</p>
              </div>
            </div>

            {/* Sub-tab Navigation for Dual-Layer Control */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('macro')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSubTab === 'macro'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Train className="w-4 h-4" />
                  Macro Layer (National Rail Spine WDFC/EDFC)
                </button>
                <button
                  onClick={() => setActiveSubTab('micro')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSubTab === 'micro'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Micro-Logistics & Arterial Median Corridors
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 px-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  ULIP Sync Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  FOIS Connected
                </span>
              </div>
            </div>

            {/* Sub-Tab 1: Macro Rail Layer */}
            {activeSubTab === 'macro' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Train Schedules & Inter-City Backbone */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Train className="w-5 h-5 text-cyan-400" />
                        Dedicated Freight Corridors (WDFC / EDFC Live Feeds)
                      </h3>
                      <p className="text-xs text-slate-400">Inter-city heavy bulk cargo optimization via FOIS/ULIP data sync</p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      4 Active Rakes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {MOCK_TRAINS.map(train => (
                      <div key={train.id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                              {train.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-200">{train.corridor}</span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            train.status === 'On Schedule' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}>
                            {train.status} • ETA {train.eta}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase">Cargo Volume</span>
                            <span className="font-semibold text-slate-200">{train.cargo}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase">Rail Speed</span>
                            <span className="font-semibold text-slate-200">{train.speed}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase">Route Origin/Dest</span>
                            <span className="font-semibold text-slate-200 truncate block">{train.origin} &rarr; {train.dest}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase">Capacity Load</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${train.utilization}%` }} />
                              </div>
                              <span className="text-[11px] font-bold text-cyan-400">{train.utilization}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multimodal Hub Node Status */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      Multimodal Rail-to-Road Hubs
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Cross-docking & transshipment node throughput</p>

                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-200">Dadri Logistics Terminal (NCR)</span>
                          <span className="text-emerald-400">91% Efficiency</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">Transshipment Turnaround: 24 mins avg</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: '91%' }} />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-200">JNPT Port Logistics Hub</span>
                          <span className="text-cyan-400">84% Efficiency</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">Transshipment Turnaround: 31 mins avg</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-200">Ludhiana Dry Port Inland Hub</span>
                          <span className="text-amber-400">76% Efficiency</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">Queue Bottleneck: 14 EV Trucks Waiting</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '76%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl flex items-center gap-3">
                    <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <p className="text-[11px] text-cyan-200">
                      Rail freight achieves <strong className="text-white">₹1.50 - ₹1.96 per tonne-km</strong> vs <strong className="text-white">₹2.80 - ₹3.78 per tonne-km</strong> on highway trucks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Micro Arterial Median Layer */}
            {activeSubTab === 'micro' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Arterial Median Corridors List */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-400" />
                        Repurposed 2-Lane Arterial Median Corridors (~7.0 - 7.3m Width)
                      </h3>
                      <p className="text-xs text-slate-400">Restricted last-mile priority corridors reserved for approved EV & compliant fleets</p>
                    </div>
                    <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-3 py-1 rounded-full font-semibold">
                      Automated Barrier Control Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_MEDIAN_CORRIDORS.map(corridor => (
                      <div key={corridor.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                              {corridor.id}
                            </span>
                            <span className="text-[11px] text-slate-400">Width: <strong className="text-slate-200">{corridor.width}</strong></span>
                          </div>
                          <h4 className="font-bold text-slate-200 text-sm mb-2">{corridor.name}</h4>
                          <p className="text-xs text-slate-400 mb-3">Lanes: {corridor.lanes} Dedicated Restricted</p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Flow Status:</span>
                            <span className={`font-semibold ${corridor.status.includes('Alert') ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                              {corridor.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">EV Adoption Rate:</span>
                            <span className="font-bold text-cyan-400">{corridor.EVShare}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Active Freight Vans:</span>
                            <span className="font-semibold text-slate-200">{corridor.activeVehicles} Units</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Visual Map Representation of Median Corridor */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Median Corridor Cross-Section Simulation (7.2m Dual Lane)
                      </span>
                      <span className="text-[11px] text-slate-400">Dedicated Barrier Isolation</span>
                    </div>

                    {/* CSS Visual Road Diagram */}
                    <div className="relative h-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-around px-4">
                      {/* Left General Traffic (Blocked) */}
                      <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-slate-950/80 border-r border-dashed border-red-900/50 flex flex-col justify-center items-center">
                        <span className="text-[10px] text-red-400 font-semibold uppercase">General City Lane</span>
                        <span className="text-[9px] text-slate-500">Congested • Slow</span>
                      </div>

                      {/* Repurposed Median Strip (Highlighted) */}
                      <div className="w-2/4 h-full bg-emerald-950/40 border-x-2 border-emerald-500/60 flex items-center justify-around relative">
                        <div className="absolute top-1 left-2 text-[9px] font-bold text-emerald-400 uppercase">
                          7.2m Dedicated Freight Median
                        </div>
                        {/* Moving EV Icon */}
                        <div className="flex items-center gap-2 bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/20 animate-pulse">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono font-bold">EV-Truck DL-04</span>
                          <span className="text-[9px] bg-emerald-950 px-1 rounded">3.2 yrs</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ANPR Verified</span>
                        </div>
                      </div>

                      {/* Right General Traffic */}
                      <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-slate-950/80 border-l border-dashed border-red-900/50 flex flex-col justify-center items-center">
                        <span className="text-[10px] text-red-400 font-semibold uppercase">General City Lane</span>
                        <span className="text-[9px] text-slate-500">Congested • Slow</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edge Computer Vision YOLO Live Stream Mock */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-amber-400" />
                        Edge CV & ANPR Feed
                      </h3>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE YOLOv8
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      Real-time breakdown alerts (&lt;3s window) and unauthorized private vehicle intrusion enforcement.
                    </p>

                    {/* Camera Feed Viewer Simulation */}
                    <div className="relative aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 z-10" />
                      
                      {/* Bounding Box Visual Simulation */}
                      <div className="absolute inset-8 border-2 border-emerald-400/80 rounded flex items-start justify-between p-2 z-20">
                        <span className="text-[10px] font-mono bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/50">
                          Class: Freight_EV (98.2%)
                        </span>
                        <span className="text-[10px] font-mono bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded">
                          0-Velocity: FALSE
                        </span>
                      </div>

                      {/* Stream Watermark */}
                      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 z-20 flex items-center gap-2">
                        <span>CAM-04 [Inner Ring]</span>
                        <span>•</span>
                        <span>OpenCV 4.8</span>
                      </div>

                      <div className="text-center z-0 opacity-40">
                        <Camera className="w-12 h-12 text-slate-600 mx-auto mb-1 animate-pulse" />
                        <span className="text-xs font-mono text-slate-500">ANPR OCR Buffer Streaming...</span>
                      </div>
                    </div>

                    {/* Event Log Stream */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300 block">Recent AI Detections:</span>
                      {cvAlerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${alert.type.includes('UNAUTHORIZED') || alert.type.includes('INVASION') ? 'text-red-400' : 'text-emerald-400'}`} />
                            <span className="text-slate-300 truncate text-[11px]">{alert.message}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{alert.latency}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSimulatingCV(!isSimulatingCV)}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingCV ? 'animate-spin' : ''}`} />
                    {isSimulatingCV ? 'Pause Edge Stream Simulation' : 'Resume Live AI Processing'}
                  </button>
                </div>
              </div>
            )}

            {/* Data Integration Proxy Bar (ULIP, Vahan, FASTag API engine) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">GraphQL Unified API Gateway Proxy</h4>
                  <p className="text-[11px] text-slate-400">Integrated Government Infrastructure Feeds</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong>ULIP API:</strong> Connected
                </span>
                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong>Vahan 4.0 (Age Check):</strong> Active
                </span>
                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong>FASTag RFID:</strong> Syncing
                </span>
                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <strong>FOIS Rail Engine:</strong> Live
                </span>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: FLEET VEHICLE COMPLIANCE ENGINE (THE RULE VALIDATOR)
           ========================================================================= */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            
            {/* Rule Header Callout */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  CORE SIH REGULATORY ENFORCEMENT RULE
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2">
                  Arterial Median Access Constraint: Vehicle Age &lt; 7 Years OR Electric Vehicle (EV)
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To eliminate breakdowns, excessive tailpipe emissions, and traffic gridlocks on repurposed 7.0–7.3m median corridors, transit authorization is strictly restricted to:
                  <strong className="text-emerald-400"> 1) 100% Zero-Emission Electric Freight Vehicles</strong>, OR 
                  <strong className="text-cyan-400"> 2) Commercial trucks purchased LESS THAN 7 years ago (&lt;7 yrs old)</strong>.
                </p>
              </div>
            </div>

            {/* Interactive Vehicle Compliance Verification Tool */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Simulator Input Form */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    Vahan API Vehicle Compliance Simulator
                  </h3>
                  <p className="text-xs text-slate-400">Test any commercial truck registration against SIH PS-26205 median transit rules</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Truck Plate Registration No.</label>
                    <input
                      type="text"
                      value={testPlate}
                      onChange={(e) => setTestPlate(e.target.value)}
                      placeholder="e.g. MH-12-PQ-9988"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fuel / Powertrain Type</label>
                      <select
                        value={testFuel}
                        onChange={(e) => setTestFuel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Diesel">Diesel Engine</option>
                        <option value="Electric (EV)">Electric (EV) - Zero Emission</option>
                        <option value="CNG">CNG Clean Energy</option>
                        <option value="Petrol (Private)">Petrol (Private Vehicle)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Year (Vahan)</label>
                      <select
                        value={testRegYear}
                        onChange={(e) => setTestRegYear(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value={2026}>2026 (0.0 Yrs Old)</option>
                        <option value={2024}>2024 (2.0 Yrs Old)</option>
                        <option value={2022}>2022 (4.0 Yrs Old - Compliant)</option>
                        <option value={2020}>2020 (6.0 Yrs Old - Compliant)</option>
                        <option value={2019}>2019 (7.0 Yrs Old - Threshold Limit)</option>
                        <option value={2017}>2017 (9.0 Yrs Old - Exceeded)</option>
                        <option value={2014}>2014 (12.0 Yrs Old - Exceeded)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={validateVehicleCompliance}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                    Verify Median Transit Authorization
                  </button>
                </div>
              </div>

              {/* Validation Output Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Vahan Authorization Output</h3>
                  <p className="text-xs text-slate-400 mb-4">Real-time gate barrier decision engine result</p>

                  {validationResult ? (
                    <div className={`p-5 rounded-xl border ${
                      validationResult.status === 'AUTHORIZED'
                        ? 'bg-emerald-950/50 border-emerald-500/80'
                        : 'bg-red-950/50 border-red-500/80'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-lg font-black text-white">{validationResult.plate}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          validationResult.status === 'AUTHORIZED'
                            ? 'bg-emerald-900 text-emerald-300 border-emerald-500'
                            : 'bg-red-900 text-red-300 border-red-500'
                        }`}>
                          {validationResult.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Calculated Vehicle Age:</span>
                          <span className="font-bold text-slate-200">{validationResult.age.toFixed(1)} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Powertrain:</span>
                          <span className="font-semibold text-slate-200">{validationResult.fuel}</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Rule Decision Audit:</span>
                          <p className={`text-xs font-medium leading-relaxed ${
                            validationResult.status === 'AUTHORIZED' ? 'text-emerald-300' : 'text-red-300'
                          }`}>
                            {validationResult.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      Configure plate and registration parameters above, then click 'Verify Transit Authorization'.
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Enforcement verified using automated ANPR barrier gates synchronized with FASTag reader points.</span>
                </div>
              </div>
            </div>

            {/* Live Barrier Verification Audit Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Live Median Access Gate Audit Stream</h3>
                  <p className="text-xs text-slate-400">Real-time gate decisions for trucks entering 7.0m arterial median lanes</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter Status:</span>
                  {['ALL', 'AUTHORIZED', 'REJECTED'].map(f => (
                    <button
                      key={f}
                      onClick={() => setComplianceFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        complianceFilter === f
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px] uppercase">
                      <th className="py-3 px-3">Timestamp</th>
                      <th className="py-3 px-3">Plate Number</th>
                      <th className="py-3 px-3">Vehicle Age</th>
                      <th className="py-3 px-3">Fuel Type</th>
                      <th className="py-3 px-3">Transit Status</th>
                      <th className="py-3 px-3">Rule Validation Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {INITIAL_COMPLIANCE_LOGS
                      .filter(log => complianceFilter === 'ALL' || log.status.includes(complianceFilter))
                      .map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono text-slate-400">{log.time}</td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{log.plate}</td>
                          <td className="py-3 px-3">
                            <span className={`font-semibold ${log.age >= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {log.age} yrs
                            </span>
                          </td>
                          <td className="py-3 px-3">{log.fuel}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              log.status === 'AUTHORIZED'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-red-950 text-red-400 border-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{log.reason}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 3: PROBLEM STATEMENT & ARCHITECTURE SETUP
           ========================================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            
            {/* Header Callout */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800">
                SIH 2026 Problem Statement PS-26205
              </span>
              <h2 className="text-2xl font-black text-white mt-3 mb-2">
                Student Innovation for Urban Logistics & Transport Infrastructure
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
                Rapid urbanization in Indian metropolitan hubs has overwhelmed legacy road networks, causing severe freight congestion, elevated PM2.5 emissions, and delayed last-mile delivery times. Team <strong className="text-emerald-400">CODE FORCE</strong> engineered a two-tier solution integrating heavy inter-city rail spines with repurposed intra-city arterial medians.
              </p>
            </div>

            {/* Architecture Diagram & Flow Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
                    <Train className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Layer 1: Macro Rail Spine</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Leverages Western & Eastern Dedicated Freight Corridors (WDFC / EDFC) for bulk inter-city freight transport directly into suburban multimodal hubs, bypassing congested ring roads.
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      Bulk freight transport at ₹1.50 - ₹1.96 / tonne-km
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      Direct FOIS / ULIP rail timetable synchronization
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-4">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Layer 2: Repurposed Medians</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Converts existing ~7.0-7.3m wide arterial street medians into 2-lane restricted freight corridors dedicated exclusively to compliant commercial EV trucks and younger fleets (&lt;7 years).
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Strict prohibition of trucks older than 7 years
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Insulated from city gridlock & stop-and-go delays
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-4">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Layer 3: Edge AI & Analytics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Deploys YOLOv8 computer vision models at median entry gates to detect zero-velocity breakdowns in under 3 seconds and flag unauthorized private vehicle invasions.
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      Automated gate opening via FASTag RFID + ANPR
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      Real-time GraphQL data integration with Vahan 4.0
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 4: OPTIMIZATION ENGINE & COST ANALYTICS (OR-Tools)
           ========================================================================= */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cost Comparison Metric */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Freight Transport Economics & OR-Tools Optimization
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Comparing unit cost per tonne-kilometer between long-haul road transport and integrated rail-spine corridor
                  </p>
                </div>

                {/* Cost Bar Visualization */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-cyan-400">Integrated Rail Corridor (Dual-Layer)</span>
                      <span className="text-cyan-300 font-bold">₹1.50 - ₹1.96 / tonne-km</span>
                    </div>
                    <div className="w-full bg-slate-950 h-6 rounded-xl border border-slate-800 overflow-hidden p-1 flex">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-lg" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-red-400">Legacy Highway Commercial Road Freight</span>
                      <span className="text-red-300 font-bold">₹2.80 - ₹3.78 / tonne-km</span>
                    </div>
                    <div className="w-full bg-slate-950 h-6 rounded-xl border border-slate-800 overflow-hidden p-1 flex">
                      <div className="bg-gradient-to-r from-red-500 to-amber-600 h-full rounded-lg" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>

                {/* Interactive Tonne-Km Cost Savings Simulator */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Interactive Freight Volume & Modal Share Simulator
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Annual Cargo Volume: <strong className="text-white">{annualTonnage.toLocaleString()} Tonnes</strong></label>
                      <input
                        type="range"
                        min="500000"
                        max="10000000"
                        step="250000"
                        value={annualTonnage}
                        onChange={(e) => setAnnualTonnage(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rail Spine Modal Share: <strong className="text-cyan-400">{railSharePercentage}% Rail</strong> / <strong className="text-slate-400">{100 - railSharePercentage}% Road</strong></label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={railSharePercentage}
                        onChange={(e) => setRailSharePercentage(Number(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Annual Rail Freight Spend</span>
                      <span className="text-sm font-bold text-cyan-400">₹{metrics.totalRailCost}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Annual Road Freight Spend</span>
                      <span className="text-sm font-bold text-red-400">₹{metrics.totalRoadCost}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block">Estimated Net Logistics Saving</span>
                      <span className="text-sm font-bold text-emerald-400">₹{metrics.estimatedSavings}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Vehicle Routing AI Info */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    Google OR-Tools & Prophet AI
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Capacitated Vehicle Routing Problem (CVRP) algorithms optimize last-mile EV truck dispatching from rail transshipment nodes into urban medians.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-200 block mb-0.5">XGBoost & Prophet Model</span>
                      <span className="text-slate-400 text-[11px]">Predicts rail rake arrival ETAs with 96.4% temporal accuracy.</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-200 block mb-0.5">Dynamic Queue Balancing</span>
                      <span className="text-slate-400 text-[11px]">Prevents median bottlenecking by re-routing trucks based on real-time ANPR counts.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                  <span>Routing Optimization Latency:</span>
                  <strong className="text-emerald-400 font-mono">142 ms</strong>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 5: FEASIBILITY, VIABILITY & CARBON IMPACT
           ========================================================================= */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-2">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Carbon Footprint Reduction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Shift from diesel highway freight trucks to electrification & rail corridors eliminates approximately <strong className="text-emerald-400">{metrics.co2SavedTons.toLocaleString()} Metric Tonnes</strong> of CO2 annually.
                </p>
                <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Aligns with PM Gati Shakti National Master Plan
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Transit Time Efficiency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated 7.0–7.3m arterial median lanes bypass general urban road congestion, reducing last-mile delivery transit times by up to <strong className="text-cyan-400">42%</strong>.
                </p>
                <div className="pt-2 text-xs text-cyan-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Zero velocity breakdown alerts &lt;3s
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3 md:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Infrastructure Viability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Repurposing central street medians avoids costly urban land acquisition, reducing capital expenditure by <strong className="text-amber-400">68%</strong> compared to elevated highways.
                </p>
                <div className="pt-2 text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Modular rapid deployment design
                </div>
              </div>

            </div>

            {/* SIH Jury Final Pitch Callout Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500 text-slate-950 rounded-2xl font-black text-xl shadow-lg shadow-cyan-500/20">
                  CF
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Smart India Hackathon 2026 Pitch Ready</h4>
                  <p className="text-xs text-slate-400">Team CODE FORCE • Dual-Layer Rail-to-Road Urban Logistics Engine (PS-26205)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                  Status: Operational Demo
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Smart India Hackathon 2026 • Problem Statement PS-26205</span>
        <span className="font-semibold text-slate-400">Developed by Team CODE FORCE</span>
        <span className="text-slate-600">Strict Compliance Engine Active</span>
      </footer>

    </div>
  );
}