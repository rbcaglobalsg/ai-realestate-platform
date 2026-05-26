import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setProjects([
      { id: '1', name: '해변가 주택 단지', createdAt: '2026-05-20', status: 'completed' },
      { id: '2', name: '도심 오피스 빌딩', createdAt: '2026-05-15', status: 'in-progress' },
      { id: '3', name: '전원주택 마을', createdAt: '2026-05-10', status: 'planning' }
    ]);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <h2>내 프로젝트</h2>
      {projects.length === 0 ? (
        <p>아직 프로젝트가 없습니다. <Link to="/new-project">새 프로젝트 시작하기</Link></p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>프로젝트 이름</th>
                <th>생성일</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.createdAt}</td>
                  <td>
                    <span className={`status-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/project/${p.id}`}>상세 보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <Link to="/new-project" className="btn-primary">
              새 프로젝트 생성
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
