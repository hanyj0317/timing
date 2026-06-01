import { useState } from 'react';
import mainPage1 from '../assets/main_page_1.png';
import mainPage2 from '../assets/main_page_2.png';
import joinPage2 from '../assets/join_page_2.png';
import timePage2 from '../assets/time_page_2.png';
import resultPage2 from '../assets/result_page_2.png';

const STEPS = [
  {
    step: 1,
    title: '모임 생성',
    description: '제목, 날짜, 시간 범위를 입력하고 생성하기를 눌러 모임을 만드세요.',
    image: mainPage1,
  },
  {
    step: 2,
    title: '링크 공유',
    description: '생성된 참여 링크를 복사해 참여자들에게 공유하세요.',
    image: mainPage2,
  },
  {
    step: 3,
    title: '참여하기',
    description: '이름과 비밀번호를 입력해 모임에 참여하세요. 비밀번호는 나중에 시간을 수정할 때 필요합니다.',
    image: joinPage2,
  },
  {
    step: 4,
    title: '시간 선택',
    description: '드래그로 참여 가능한 시간대를 선택하고 저장하세요.',
    image: timePage2,
  },
  {
    step: 5,
    title: '결과 확인',
    description: '최소 참여 인원과 필수 참석자를 설정하면 조건에 맞는 최적 시간을 추천해 드립니다.',
    image: resultPage2,
  },
];

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Timing 사용방법</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        {/* 이미지 */}
        <div className="bg-gray-50 px-8 pt-6">
          <img
            src={step.image}
            alt={step.title}
            className="w-full rounded-xl border border-gray-200 object-cover"
          />
        </div>

        {/* 내용 */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-500 px-2.5 py-0.5 rounded-full">
              {step.step} / {STEPS.length}
            </span>
            <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between px-6 pb-5">
          {/* step indicator */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-indigo-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 이전 / 다음 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={isFirst}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            {isLast ? (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white transition-colors"
              >
                시작하기
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white transition-colors"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
