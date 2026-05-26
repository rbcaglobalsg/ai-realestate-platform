import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    landArea: '',
    buildingHeight: '',
    expectedFloors: '',
    landCost: '',
    constructionCost: '',
    expectedSalePrice: '',
    loanRate: '',
    loanTerm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // In real app, call backend API to create project
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Generate a mock project ID
      const projectId = `proj_${Date.now()}`;
      navigate(`/project/${projectId}`);
    } catch (err) {
      setError('프로젝트 생성 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-project">
      <h2>새 프로젝트 생성</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">프로젝트 이름 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">프로젝트 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="landArea">대지면적 (㎡)</label>
          <input
            type="number"
            id="landArea"
            name="landArea"
            value={formData.landArea}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="buildingHeight">건물 높이 (m)</label>
          <input
            type="number"
            id="buildingHeight"
            name="buildingHeight"
            value={formData.buildingHeight}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="expectedFloors">예상 층수</label>
          <input
            type="number"
            id="expectedFloors"
            name="expectedFloors"
            value={formData.expectedFloors}
            onChange={handleChange}
          />
        </div>
        <hr />
        <h3>재무 정보 (선택 사항)</h3>
        <div className="form-group">
          <label htmlFor="landCost">토지 매입 비용 (원)</label>
          <input
            type="number"
            id="landCost"
            name="landCost"
            value={formData.landCost}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="constructionCost">건설 비용 (원)</label>
          <input
            type="number"
            id="constructionCost"
            name="constructionCost"
            value={formData.constructionCost}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="expectedSalePrice">예상 매각가 (원)</label>
          <input
            type="number"
            id="expectedSalePrice"
            name="expectedSalePrice"
            value={formData.expectedSalePrice}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="loanRate">대출 금리 (%)</label>
          <input
            type="number"
            id="loanRate"
            name="loanRate"
            value={formData.loanRate}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="loanTerm">대출 기간 (년)</label>
          <input
            type="number"
            id="loanTerm"
            name="loanTerm"
            value={formData.loanTerm}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? '생성 중...' : '프로젝트 생성'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
