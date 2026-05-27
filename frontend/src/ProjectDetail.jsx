import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for AI design generation
  const [designImageUrl, setDesignImageUrl] = useState(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState('');

  useEffect(() => {
    // Mock data based on ID
    // In real app, fetch from backend API
    const mockProjects = {
      '1': {
        id: '1',
        name: '해변가 주택 단지',
        description: '해변가에 위치한 럭셔리 주택 단지 프로젝트',
        landArea: 5000,
        buildingHeight: 15,
        expectedFloors: 5,
        landCost: 500000000,
        constructionCost: 1500000000,
        expectedSalePrice: 2500000000,
        loanRate: 4.5,
        loanTerm: 20,
        createdAt: '2026-05-20',
        status: 'completed'
      },
      '2': {
        id: '2',
        name: '도심 오피스 빌딩',
        description: '중심 업무 지역에 위치한 스마트 오피스 빌딩',
        landArea: 2000,
        buildingHeight: 80,
        expectedFloors: 20,
        landCost: 3000000000,
        constructionCost: 8000000000,
        expectedSalePrice: 15000000000,
        loanRate: 4.2,
        loanTerm: 15,
        createdAt: '2026-05-15',
        status: 'in-progress'
      },
      '3': {
        id: '3',
        name: '전원주택 마을',
        description: '자연 친화적인 전원주택 마을 개발 프로젝트',
        landArea: 10000,
        buildingHeight: 10,
        expectedFloors: 2,
        landCost: 2000000000,
        constructionCost: 3000000000,
        expectedSalePrice: 7000000000,
        loanRate: 4.0,
        loanTerm: 25,
        createdAt: '2026-05-10',
        status: 'planning'
      }
    };
    if (mockProjects[id]) {
      setProject(mockProjects[id]);
    } else {
      setError('프로젝트를 찾을 수 없습니다.');
    }
    setLoading(false);
  }, [id]);

  const handleGenerateDesign = async () => {
    if (!project) return;
    setDesignLoading(true);
    setDesignError('');
    setDesignImageUrl(null);
    try {
      // Use project description as prompt, or fallback to a generic prompt
      const prompt = project.description || 'A beautiful modern building';
      const response = await fetch('/api/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          type: 'image'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate design');
      }
      const data = await response.json();
      if (data.success && data.data && data.data.resultUrl) {
        setDesignImageUrl(data.data.resultUrl);
      } else {
        throw new Error('Invalid response from design API');
      }
    } catch (err) {
      console.error('Design generation error:', err);
      setDesignError(err.message || 'Unknown error');
    } finally {
      setDesignLoading(false);
    }
  };

  if (loading) return <p>Loading project details...</p>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <p>No project data</p>;

  const totalCost = (project.landCost || 0) + (project.constructionCost || 0);
  const profit = (project.expectedSalePrice || 0) - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return (
    <div className="project-detail">
      <div className="header">
        <h2>{project.name}</h2>
        <div className="status-badge status-{project.status.toLowerCase()}">
          {project.status}
        </div>
        <Link to="/" className="btn-back">
          ← 프로젝트 목록으로
        </Link>
      </div>

      <div className="tabs">
        <button className="tab-active">개요</button>
        <button className="tab">설계</button>
        <button className="tab">재무</button>
        <button className="tab">마케팅</button>
        <button className="tab">법규</button>
      </div>

      <div className="tab-content">
        {/* Overview Tab */}
        <section className="tab-panel active">
          <h3>프로젝트 개요</h3>
          <p>{project.description}</p>
          <div className="info-grid">
            <div className="info-item">
              <label>생성일</label>
              <value>{project.createdAt}</value>
            </div>
            <div className="info-item">
              <label>현재 상태</label>
              <value>{project.status}</value>
            </div>
            <div className="info-item">
              <label>대지면적</label>
              <value>{project.landArea?.toLocaleString()} ㎡</value>
            </div>
            <div className="info-item">
              <label>건물 높이</label>
              <value>{project.buildingHeight} m</value>
            </div>
            <div className="info-item">
              <label>예상 층수</label>
              <value>{project.expectedFloors} 층</value>
            </div>
          </div>
        </section>

        {/* Design Tab */}
        <section className="tab-panel">
          <h3>AI 설계 생성</h3>
          <p>AI를 이용하여 프로젝트의 설계안을 자동으로 생성합니다.</p>
          <div className="ai-design-controls">
            <button 
              className="btn-primary"
              onClick={handleGenerateDesign}
              disabled={designLoading}
            >
              {designLoading ? '생성 중...' : 'AI로 설계 생성하기'}
            </button>
            <button className="btn-secondary">고급 옵션</button>
          </div>
          <div className="design-preview">
            {designLoading && <p>AI가 설계를 생성 중입니다...</p>}
            {designError && <p className="error">오류: {designError}</p>}
            {designImageUrl ? (
              <img 
                src={designImageUrl} 
                alt="Generated design" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
            ) : (
              <p>설계 미리보기가 여기에 표시됩니다.</p>
            )}
          </div>
        </section>

        {/* Finance Tab */}
        <section className="tab-panel">
          <h3>재무 분석</h3>
          <div className="finance-grid">
            <div className="finance-item">
              <label>토지 매입 비용</label>
              <value>{(project.landCost || 0).toLocaleString()} 원</value>
            </div>
            <div className="finance-item">
              <label>건설 비용</label>
              <value>{(project.constructionCost || 0).toLocaleString()} 원</value>
            </div>
            <div className="finance-item">
              <label>총 투자 비용</label>
              <value>{totalCost.toLocaleString()} 원</value>
            </div>
            <div className="finance-item">
              <label>예상 매각가</label>
              <value>{(project.expectedSalePrice || 0).toLocaleString()} 원</value>
            </div>
            <div className="finance-item">
              <label>예상 수익</label>
              <value>{profit.toLocaleString()} 원</value>
            </div>
            <div className="finance-item">
              <label>수익률 (ROI)</label>
              <value>{roi.toFixed(2)} %</value>
            </div>
            <div className="finance-item">
              <label>대출 금리</label>
              <value>{project.loanRate} %</value>
            </div>
            <div className="finance-item">
              <label>대출 기간</label>
              <value>{project.loanTerm} 년</value>
            </div>
          </div>
          <div className="finance-actions">
            <button className="btn-primary">상세 재무 보고서 다운로드</button>
            <button className="btn-secondary">시나리오 시뮬레이션</button>
          </div>
        </section>

        {/* Marketing Tab - placeholder */}
        <section className="tab-panel">
          <h3>마케팅 콘텐츠</h3>
          <p>AI가 생성한 마케팅 자료를 확인하고 편집할 수 있습니다.</p>
          <div className="marketing-preview">
            <h4>프로젝트 홍보 문구</h4>
            <p>{project.name} - 꿈의 공간을 reality로</p>
            <p>탁월한 입지와 혁신적인 설계를 결합한 이번 프로젝트는...</p>
            <button className="btn-primary">AI로 마케팅 콘텐츠 재생성</button>
          </div>
        </section>

        {/* Compliance Tab - placeholder */}
        <section className="tab-panel">
          <h3>법규 및 규제 검토</h3>
          <div className="compliance-checks">
            <div className="check-item">
              <h4>용도지역 확인</h4>
              <p><span className="status-pass">통과</span> - 해당 지역의 용도지역이 프로젝트 유형과 일치합니다.</p>
            </div>
            <div className="check-item">
              <h4>건물 높이 제한</h4>
              <p>
                <span className={
                  project.buildingHeight && project.buildingHeight > 30
                    ? 'status-warning'
                    : 'status-pass'
                }>
                  {project.buildingHeight && project.buildingHeight > 30 ? '경고' : '통과'}
                </span>
                - 건물 높이가 {project.buildingHeight}m로, 지역 제한 {
                  project.buildingHeight && project.buildingHeight > 30
                    ? '을 초과하여'
                    : '을 준수합니다'}
                .
              </p>
            </div>
            <div className="check-item">
              <h4>이격거리 기준</h4>
              <p><span className="status-pass">통과</span> - 건물 간 이격거리가 법적 기준을 충족합니다.</p>
            </div>
            <div className="check-item">
              <h4>주차장 요구사항</h4>
              <p><span className="status-info">참고</span> - 예상 주차 대수: {
                Math.floor((project.landArea || 0) * 0.2)
              } 대</p>
            </div>
          </div>
          <button className="btn-primary">상세 법규 보고서 다운로드</button>
        </section>
      </div>

      <div className="project-actions">
        <Link to={`/edit/${id}`} className="btn-secondary">
          프로젝트 수정
        </Link>
        <button className="btn-danger">프로젝트 삭제</button>
        <button className="btn-primary">다음 단계로 진행</button>
      </div>
    </div>
  );
};

export default ProjectDetail;