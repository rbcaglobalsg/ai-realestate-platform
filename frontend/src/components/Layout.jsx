import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            🏠 AI 부동산
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:underline">홈</Link>
            <Link to="/map" className="hover:underline">지도 검색</Link>
            {token ? (
              <button onClick={handleLogout} className="hover:underline cursor-pointer">
                로그아웃
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:underline">로그인</Link>
                <Link to="/signup" className="bg-white text-blue-600 px-3 py-1 rounded font-semibold hover:bg-blue-50">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center text-xs py-4">
        © 2026 AI 부동산 플랫폼. All rights reserved.
      </footer>
    </div>
  );
}
