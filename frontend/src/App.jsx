import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import NewProject from './NewProject';
import ProjectDetail from './ProjectDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>AI Real Estate Platform</h1>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/new-project">New Project</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
