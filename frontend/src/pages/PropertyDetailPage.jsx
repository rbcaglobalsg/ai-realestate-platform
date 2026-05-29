import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await client.get(`/properties/${id}`);
        setProperty(res.data);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        매물 정보를 불러오는 중...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-3xl mb-2">🏠</p>
        <p className="font-medium">매물을 찾을 수 없습니다</p>
        <Link to="/map" className="text-blue-600 hover:underline mt-4 text-sm">
          지도로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 이미지 */}
      {property.imageUrl ? (
        <img src={property.imageUrl} alt={property.title} className="w-full h-72 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-72 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 mb-6">
          이미지 없음
        </div>
      )}

      {/* 기본 정보 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
      <p className="text-sm text-gray-500 mb-6">📍 {property.address}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl">
          <span className="text-xs text-blue-400 block">가격</span>
          <p className="text-xl font-bold text-blue-600">
            {property.price ? `${property.price.toLocaleString()}만원` : '가격 문의'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <span className="text-xs text-gray-400 block">면적</span>
          <p className="text-xl font-bold text-gray-800">
            {property.area ? `${property.area}㎡` : '-'}
          </p>
        </div>
      </div>

      {property.description && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-2">상세 설명</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
        </div>
      )}

      <Link
        to="/map"
        className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition"
      >
        ← 지도로 돌아가기
      </Link>
    </div>
  );
}
