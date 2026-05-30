import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import NewProject from './NewProject';
import ProjectDetail from './ProjectDetail';

function App(): React.ReactElement {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏗️</span>
                <h1 className="text-xl font-bold text-gray-900">AI 부동산 플랫폼</h1>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  to="/new-project"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  + 새 프로젝트
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            © 2026 AI 부동산 플랫폼 by RBCA Global Pte. Ltd.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
