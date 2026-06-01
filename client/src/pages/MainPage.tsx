import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Meeting } from '../types';
import HelpModal from '../components/HelpModal';
import { api } from '../api';

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 6) +
    '-' +
    Math.random().toString(36).substring(2, 6) +
    '-' +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function MainPage() {
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    description: '',
  });
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = '모임 제목을 입력해주세요.';
    if (!form.startDate) next.startDate = '시작 날짜를 선택해주세요.';
    if (!form.endDate) next.endDate = '종료 날짜를 선택해주세요.';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      next.endDate = '종료 날짜는 시작 날짜 이후여야 합니다.';
    return next;
  };

  const handleSubmit = async () => {
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    const id = generateId();
    const meeting: Meeting = {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
    };

    await api.createMeeting(meeting);
    setMeetingId(id);
  };

  const shareUrl = meetingId
    ? `${window.location.origin}/join/${meetingId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-indigo-500 transition-colors">Timing</Link>
        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-full border-2 border-gray-300 text-gray-400 text-base font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
        >
          ?
        </button>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">

        {/* 모임 생성 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 overflow-hidden">
          <div className="flex items-start justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">모임 생성</h2>
              <p className="text-gray-500 mt-1">모임의 기본 정보를 입력해주세요.</p>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base"
            >
              생성하기 <span>→</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* 모임 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 팀 회의, 스터디 모임"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors placeholder-gray-300"
              />
              {errors.title && (
                <p className="text-xs text-red-400 mt-1">{errors.title}</p>
              )}
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>📅</span> 시작 날짜 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full max-w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors text-gray-500"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-400 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>📅</span> 종료 날짜 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full max-w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors text-gray-500"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-400 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>🕐</span> 시작 시간
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full max-w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>🕐</span> 종료 시간
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full max-w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors text-gray-700"
                />
              </div>
            </div>

            {/* 모임 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <span>📄</span> 모임 설명
              </label>
              <textarea
                placeholder="모임에 대한 간단한 설명을 입력해주세요"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors resize-none placeholder-gray-300"
              />
            </div>
          </div>
        </div>

        {/* 모임 링크 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">모임 링크</h2>
          <p className="text-gray-500 mb-6">생성된 링크를 공유하여 시간을 등록해주세요.</p>

          {meetingId ? (
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-indigo-500 mb-3 flex items-center gap-1.5">
                <span>🔗</span> 참여 링크 공유
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-500 outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="bg-indigo-400 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📋</span> {copied ? '복사됨' : '복사'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-gray-300">
              모임을 생성하면 링크가 표시됩니다
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
