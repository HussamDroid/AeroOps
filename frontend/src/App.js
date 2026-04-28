import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FleetMonitor from './pages/FleetMonitor';
import SimulationSuite from './pages/SimulationSuite';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FleetMonitor />} />
        <Route path="/simulate" element={<SimulationSuite />} />
      </Routes>
    </Router>
  );
}

export default App;