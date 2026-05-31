import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, useApi } from './App';

interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  landCost: number | null;
  constructionCost: number | null;
  expectedSalePrice: number | null;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: '완료', bg: 'bg-green-100', text: 'text-green-800' },
  'in-progress': { label: '진행중', bg: 'bg-blue-100', text: 'text-blue-800' },
  planning: { label: '기획', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const api = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Show demo data for non-logged-in users
      setProjects([
        { id: '1', name: '해변가 주택 단지', description: '해변가에 위치한 럭셔리 주택 단지', location: '부산 해운대구', status: 'completed', createdAt: '2026-05-20', landCost: 500000000, constructionCost: 1500000000, expectedSalePrice: 2500000000 },
        { id: '2', name: '도심 오피스 빌딩', description: '중심 업무 지역에 위치한 스마트 오피스 빌딩', location: '서울 강남구', status: 'in-progress', createdAt: '2026-05-15', landCost: 3000000000, constructionCost: 8000000000, expectedSalePrice: 15000000000 },
        { id: '3', name: '전원주택 마을', description: '자연 친화적인 전원주택 마을 개발', location: '경기 가평군', status: 'planning', createdAt: '2026-05-10', landCost: 2000000000, constructionCost: 3000000000, expectedSalePrice: 7000000000 },
      ]);
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await api('/api/projects');
        if (res.success) {
          setProjects(res.data);
        } else {
          setError(res.error || '프로젝트를 불러올 수 없습니다.');
        }
      } catch {
        setError('서버 연결에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const totalInvestment = projects.reduce((sum, p) => sum + (p.landCost || 0) + (p.constructionCost || 0), 0);
  const totalRevenue = projects.reduce((sum, p) => sum + (p.expectedSalePrice || 0), 0);
  const totalProfit = totalRevenue - totalInvestment;
  const avgRoi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold">한국 부동산, AI가 다시 쓴다</h2>
          <p className="mt-2 text-blue-100">실거래가 × 건축물대장 × 공시지가 × 토지이용계획 — AI 수익성 분석</p>
          <Link
            to="/login"
            className="mt-4 inline-block bg-white text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            지금 시작하기
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">총 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">완료</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">총 투자액</p>
              <p className="text-2xl font-bold text-gray-900">
                ₩{(totalInvestment / 100000000).toFixed(0)}억
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">평균 ROI</p>
              <p className="text-2xl font-bold text-gray-900">{avgRoi}%</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Project List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">내 프로젝트</h2>
          <Link
            to="/new-project"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            + 새 프로젝트
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">아직 프로젝트가 없습니다.</p>
            <Link
              to="/new-project"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              새 프로젝트 시작하기 →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((p) => {
              const config = statusConfig[p.status] || {
                label: p.status,
                bg: 'bg-gray-100',
                text: 'text-gray-800',
              };
              const profit = (p.expectedSalePrice || 0) - (p.landCost || 0) - (p.constructionCost || 0);
              return (
                <div
                  key={p.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      🏗️
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        {p.location || '위치 미지정'} · {p.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      수익: ₩{(profit / 100000000).toFixed(1)}억
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                    >
                      {config.label}
                    </span>
                    <Link
                      to={`/project/${p.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      상세 보기 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
