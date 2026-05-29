import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        AI로 찾는 <span className="text-blue-600">내 집</span>
      </h1>
      <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
        네이버 지도 기반의 스마트 부동산 검색. 원하는 지역의 매물을 한눈에 확인하세요.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/map"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow transition"
        >
          지도에서 찾기
        </Link>
        <Link
          to="/signup"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold transition"
        >
          회원가입
        </Link>
      </div>

      {/* 특징 카드 */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
        {[
          { icon: '🗺️', title: '지도 기반 검색', desc: '네이버 지도 위에 매물 마커를 표시하여 직관적으로 탐색합니다.' },
          { icon: '🤖', title: 'AI 추천', desc: '사용자 선호를 분석해 맞춤형 매물을 추천합니다.' },
          { icon: '📊', title: '상세 정보', desc: '가격, 면적, 주소 등 매물 상세 정보를 모달로 바로 확인합니다.' },
        ].map((item) => (
          <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
