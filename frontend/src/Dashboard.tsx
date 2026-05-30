import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  status: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: '완료', bg: 'bg-green-100', text: 'text-green-800' },
  'in-progress': { label: '진행중', bg: 'bg-blue-100', text: 'text-blue-800' },
  planning: { label: '기획', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setProjects([
      { id: '1', name: '해변가 주택 단지', createdAt: '2026-05-20', status: 'completed' },
      { id: '2', name: '도심 오피스 빌딩', createdAt: '2026-05-15', status: 'in-progress' },
      { id: '3', name: '전원주택 마을', createdAt: '2026-05-10', status: 'planning' },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">진행중</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                      <p className="text-sm text-gray-500">생성일: {p.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
