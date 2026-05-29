import React, { useState, useEffect, useRef, useCallback } from 'react';
import client from '../api/client';
import PropertyModal from '../components/PropertyModal';

// 서울 중심 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 13;

// 샘플 매물 데이터 (API 미연동 시 폴백)
const SAMPLE_PROPERTIES = [
  { id: 1, title: '강남구 역삼동 아파트', address: '서울 강남구 역삼로 123', price: 150000, area: 84, lat: 37.5012, lng: 127.0396, imageUrl: '', description: '역세권 깔끔한 아파트' },
  { id: 2, title: '서초구 방배동 오피스텔', address: '서울 서초구 방배로 456', price: 80000, area: 42, lat: 37.4814, lng: 126.9836, imageUrl: '', description: '신축 오피스텔' },
  { id: 3, title: '마포구 합정동 빌라', address: '서울 마포구 합정로 789', price: 55000, area: 63, lat: 37.5496, lng: 126.9187, imageUrl: '', description: '한강뷰 전망 좋은 빌라' },
  { id: 4, title: '송파구 잠실동 아파트', address: '서울 송파구 올림픽로 321', price: 200000, area: 112, lat: 37.5132, lng: 127.1003, imageUrl: '', description: '롯데몰 인근 대형 아파트' },
  { id: 5, title: '용산구 이태원동 주택', address: '서울 용산구 이태원로 654', price: 120000, area: 95, lat: 37.5346, lng: 126.9937, imageUrl: '', description: '외국인 학군 주택' },
];

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // 네이버 지도 스크립트 로드
  const loadNaverMapScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.naver && window.naver.maps) {
        resolve();
        return;
      }
      const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
      if (!clientId) {
        console.warn('VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.');
        reject(new Error('Naver Map Client ID not set'));
        return;
      }
      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  // 지도 초기화
  const initMap = useCallback(() => {
    if (!window.naver || !mapRef.current) return;

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });
    mapInstance.current = map;

    // 마커 생성
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    properties.forEach((prop) => {
      if (prop.lat && prop.lng) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(prop.lat, prop.lng),
          map: map,
          title: prop.title,
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedProperty(prop);
        });

        markersRef.current.push(marker);
      }
    });
  }, [properties]);

  // 매물 데이터 로드
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await client.get('/properties');
        setProperties(res.data);
      } catch {
        // API 미연동 시 샘플 데이터 사용
        setProperties(SAMPLE_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // 지도 로드 및 초기화
  useEffect(() => {
    if (loading || properties.length === 0) return;

    loadNaverMapScript()
      .then(() => initMap())
      .catch((err) => {
        console.error('지도 로드 실패:', err);
      });
  }, [loading, properties, loadNaverMapScript, initMap]);

  return (
    <div className="relative" style={{ height: 'calc(100vh - 120px)' }}>
      {/* 로딩 */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400">매물을 불러오는 중...</p>
        </div>
      )}

      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 지도 로드 실패 시 폴백 */}
      {!loading && !mapInstance.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <p className="text-4xl mb-2">🗺️</p>
            <p className="font-medium">네이버 지도를 불러올 수 없습니다</p>
            <p className="text-sm mt-1">VITE_NAVER_MAP_CLIENT_ID를 확인해주세요</p>
          </div>
        </div>
      )}

      {/* 매물 상세 모달 */}
      <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
    </div>
  );
}
