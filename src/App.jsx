import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectDetection from './components/ObjectDetection';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ObjectDetection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;