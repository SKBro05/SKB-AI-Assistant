/**
 * SIH1694 - Real-time River Water Quality Forecasting
 * Full Solution: Includes two separate graphs in detailed view (pH, DO, BOD together and Turbidity separately),
 * alert system for water treatment requirement, suggested treatment quantities based on pH, DO, BOD, and Turbidity,
 * and additional rivers (Dnyanganga and Ganga) added.
 */

import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";

export default function RiverDSSDashboard() {
  const [locations, setLocations] = useState([]);
  const [miniForecast, setMiniForecast] = useState({});
  const [selectedLoc, setSelectedLoc] = useState(null);

  // Thresholds for alerts
  const TURBIDITY_ALERT_THRESHOLD = 30;
  const PH_LOW = 6.5;
  const PH_HIGH = 8.5;
  const DO_THRESHOLD = 5;
  const BOD_THRESHOLD = 3;

  useEffect(() => {
    const locs = [
      { id: 'loc-01', name: 'Kanpur - Ghat', status: 'good' },
      { id: 'loc-02', name: 'Varanasi - Dashashwamedh', status: 'moderate' },
      { id: 'loc-03', name: 'Patna - Gandhi Ghat', status: 'poor' },
      { id: 'loc-04', name: 'Kham River - Chh. Sambhajinagar', status: 'moderate' },
      { id: 'loc-05', name: 'Godavari River', status: 'good' },
      { id: 'loc-06', name: 'Dnyanganga River - Buldhana', status: 'moderate' },
      { id: 'loc-07', name: 'Ganga River', status: 'moderate' }
    ];
    setLocations(locs);

    const mf = {};
    locs.forEach(loc => {
      mf[loc.id] = Array.from({ length: 24 }).map((_, i) => ({
        hour: i,
        turbidity: Math.random() * 50,
        pH: 7 + Math.sin(i / 3) / 6,
        DO: 6 + Math.cos(i / 4) / 4,
        BOD: Math.random() * 5
      }));
    });
    setMiniForecast(mf);
  }, []);

  const statusColor = (status) => status === 'good' ? 'bg-green-400' : status === 'moderate' ? 'bg-yellow-400' : 'bg-red-500';

  const checkAlert = (locId) => {
    const data = miniForecast[locId];
    if (!data) return false;
    return data.some(d => d.turbidity > TURBIDITY_ALERT_THRESHOLD || d.pH < PH_LOW || d.pH > PH_HIGH || d.DO < DO_THRESHOLD || d.BOD > BOD_THRESHOLD);
  };

  const getTreatmentInfo = (locId) => {
    const latest = miniForecast[locId]?.[miniForecast[locId].length - 1];
    if (!latest) return null;

    let coagulant = 20; // default kg per 1000 m3
    let flocculant = 0.8;
    let pH_adjuster = 7;
    let activatedCarbon = 12;

    // Adjust treatment quantities based on water parameters
    if(latest.turbidity > 40) coagulant += 5;
    if(latest.BOD > BOD_THRESHOLD) activatedCarbon += 5;
    if(latest.pH < PH_LOW || latest.pH > PH_HIGH) pH_adjuster = latest.pH < PH_LOW ? 8 : 6;
    if(latest.DO < DO_THRESHOLD) flocculant += 0.2;

    return (
      <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 space-y-2">
        <h4 className="font-semibold mb-1">💡 Recommended Treatment & Strategies:</h4>
        <ul className="list-disc list-inside text-sm">
          <li>Industrial wastewater management using advanced oxidation, bio-filtration, and chemical precipitation.</li>
          <li>River revitalization with constructed wetlands, aeration systems, and sedimentation control.</li>
          <li>Weir-based treatment for turbidity reduction, flow management, and controlled sediment removal.</li>
          <li>Continuous monitoring with IoT sensors and AI models to optimize treatment scheduling.</li>
          <li>Suggested treatment quantities per 1000 m³ water based on latest parameters:</li>
          <ul className="list-disc list-inside text-sm ml-4">
            <li>Coagulants (Alum/Ferric Chloride): {coagulant} kg</li>
            <li>Flocculants (Polyacrylamide): {flocculant} kg</li>
            <li>pH adjusters (Lime/Sodium Carbonate): {pH_adjuster} kg</li>
            <li>Activated carbon: {activatedCarbon} kg</li>
          </ul>
          <li>Process: Coagulants → Flocculation → Sedimentation → Aeration → pH Adjustment → Filtration → Discharge</li>
          <li>Adaptive dosing and continuous monitoring recommended.</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6">
      <main className="grid grid-cols-3 gap-4">
        <section className="col-span-2 bg-white rounded-2xl shadow p-3">
          <div className="grid grid-cols-3 gap-3 mt-3">
            {locations.map(loc => (
              <motion.div key={loc.id} className="p-3 bg-slate-50 rounded-lg border cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => setSelectedLoc(loc.id)}>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold text-slate-800">{loc.name}</div>
                  <div className={`text-xs px-2 py-0.5 rounded ${statusColor(loc.status)} text-white`}>{loc.status}</div>
                </div>
                {checkAlert(loc.id) && <div className="text-xs text-red-600 font-semibold mb-1">⚠ Water treatment required!</div>}
                <div className="text-xs text-slate-500 mb-1">Mini Turbidity Graph</div>
                <div style={{ height: 60 }}>
                  <ResponsiveContainer width="100%" height={60}>
                    <AreaChart data={miniForecast[loc.id] || []}>
                      <Area type="monotone" dataKey="turbidity" stroke="#8884d8" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedLoc && (
            <div className="mt-6 bg-blue-50 p-4 rounded-2xl shadow space-y-6">
              <h3 className="text-xl font-bold mb-3">Detailed Forecast - {locations.find(l => l.id === selectedLoc).name}</h3>

              {checkAlert(selectedLoc) && getTreatmentInfo(selectedLoc)}

              <div>
                <h4 className="text-lg font-semibold mb-2">pH, DO, BOD</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={miniForecast[selectedLoc]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="pH" stroke="#82ca9d" fillOpacity={0.2} name="pH" />
                    <Area type="monotone" dataKey="DO" stroke="#ffc658" fillOpacity={0.2} name="Dissolved Oxygen" />
                    <Area type="monotone" dataKey="BOD" stroke="#ff6b6b" fillOpacity={0.2} name="BOD" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Turbidity</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={miniForecast[selectedLoc]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="turbidity" stroke="#8884d8" fillOpacity={0.2} name="Turbidity" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
