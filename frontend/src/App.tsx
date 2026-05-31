import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import NewProject from './NewProject';
import ProjectDetail from './ProjectDetail';
import Login from './Login';
import Pricing from './Pricing';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export const AuthContext = React.createContext<{
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useApi() {
  const { token } = React.useContext(AuthContext);
  return async (path: string, options?: RequestInit) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return res.json();
  };
}

function App(): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ai_realestate_token'));

  useEffect(() => {
    if (token) {
      // Verify token on load
      const storedUser = localStorage.getItem('ai_realestate_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('ai_realestate_token');
          localStorage.removeItem('ai_realestate_user');
          setToken(null);
        }
      }
    }
  }, []);

  const loginFn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('ai_realestate_token', data.data.token);
      localStorage.setItem('ai_realestate_user', JSON.stringify(data.data.user));
    } else {
      throw new Error(data.error || '로그인 실패');
    }
  };

  const registerFn = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('ai_realestate_token', data.data.token);
      localStorage.setItem('ai_realestate_user', JSON.stringify(data.data.user));
    } else {
      throw new Error(data.error || '회원가입 실패');
    }
  };

  const logoutFn = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ai_realestate_token');
    localStorage.removeItem('ai_realestate_user');
  };

  const planLabel: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
  };

  const planColor: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    business: 'bg-amber-100 text-amber-700',
  };

  return (
    <AuthContext.Provider value={{ user, token, login: loginFn, register: registerFn, logout: logoutFn }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏗️</span>
                  <Link to="/" className="text-xl font-bold text-gray-900">AI 부동산 플랫폼</Link>
                </div>
                <nav className="flex items-center gap-4">
                  {user ? (
                    <>
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
                      <Link
                        to="/pricing"
                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                      >
                        요금제
                      </Link>
                      <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColor[user.plan] || planColor.free}`}>
                          {planLabel[user.plan] || 'Free'}
                        </span>
                        <span className="text-sm text-gray-600">{user.name}</span>
                        <button
                          onClick={logoutFn}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          로그아웃
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/pricing"
                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                      >
                        요금제
                      </Link>
                      <Link
                        to="/login"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        로그인
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-project" element={<NewProject />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
              © 2026 AI 부동산 플랫폼 by RBCA Global Pte. Ltd. | Toss Payments 결제 시스템
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
