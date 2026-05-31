import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './App';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '무료',
    description: '기본 실거래가 조회, 간단 수익성 계산기',
    features: [
      '기본 실거래가 조회',
      '간단 수익성 계산기',
      'AI 분석 5회/월',
      '프로젝트 3개',
    ],
    cta: '시작하기',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29900,
    priceLabel: '₩29,900/월',
    description: 'AI 수익성 분석 10회/월, 기본 설계 생성',
    features: [
      'AI 수익성 분석 10회/월',
      '기본 설계 생성',
      '프로젝트 무제한',
      '공시지가/토지이용계획 조회',
      '이메일 지원',
    ],
    cta: 'Starter 시작',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79900,
    priceLabel: '₩79,900/월',
    description: 'AI 수익성 무제한, 설계 생성 20회/월, 시장 예측',
    features: [
      'AI 수익성 분석 무제한',
      '설계 생성 20회/월',
      '시장 예측',
      '실거래가 전체 데이터',
      '건축물대장 조회',
      '우선 지원',
    ],
    cta: 'Pro 시작',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 199900,
    priceLabel: '₩199,900/월',
    description: '전체 AI 무제한, B2B API 접근, 팀 협업, 맞춤 리포트',
    features: [
      '전체 AI 기능 무제한',
      'B2B API 접근',
      '팀 협업 (최대 10명)',
      '맞춤 리포트',
      '법규 검토 자동화',
      '전담 매니저',
      'SLA 보장',
    ],
    cta: 'Business 시작',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      if (!user) {
        navigate('/login');
      }
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingPlan(planId);

    try {
      // In production, this would redirect to Toss Payments checkout
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          orderId: `order_${planId}_${Date.now()}`,
          customerName: user.name,
          customerEmail: user.email,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else if (data.success && data.data?.devMode) {
        alert(`개발 모드: ${planId} 플랜 결제가 시뮬레이션되었습니다.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">요금제</h1>
        <p className="text-gray-500 mt-3">투자 규모에 맞는 플랜을 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 p-6 relative ${
              plan.popular
                ? 'border-blue-600 shadow-lg scale-105'
                : 'border-gray-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                가장 인기
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{plan.priceLabel}</p>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : user?.plan === plan.id
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {loadingPlan === plan.id
                ? '처리 중...'
                : user?.plan === plan.id
                ? '현재 플랜'
                : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>모든 결제는 Toss Payments를 통해 안전하게 처리됩니다.</p>
        <p className="mt-1">언제든지 플랜을 변경하거나 해지할 수 있습니다.</p>
      </div>
    </div>
  );
};

export default Pricing;
