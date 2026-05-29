import React from 'react';

export default function PropertyModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 */}
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
            이미지 없음
          </div>
        )}

        {/* 내용 */}
        <div className="p-6 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
          <p className="text-sm text-gray-500">📍 {property.address}</p>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-400">가격</span>
              <p className="text-lg font-bold text-blue-600">
                {property.price ? `${property.price.toLocaleString()}만원` : '가격 문의'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">면적</span>
              <p className="text-lg font-bold text-gray-800">
                {property.area ? `${property.area}㎡` : '-'}
              </p>
            </div>
          </div>

          {property.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
          )}

          <button
            onClick={onClose}
            className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
