import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Meeting } from '../types';

export default function JoinPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const meeting: Meeting | null = meetingId
    ? JSON.parse(localStorage.getItem(`meeting_${meetingId}`) ?? 'null')
    : null;

  const [form, setForm] = useState({ nickname: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.nickname.trim()) next.nickname = '이름을 입력해주세요.';
    if (!form.password.trim()) next.password = '비밀번호를 입력해주세요.';
    return next;
  };

  const handleSubmit = () => {
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const key = `participants_${meetingId}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
    const matched = existing.find(
      (p: { nickname: string }) => p.nickname === form.nickname.trim()
    );

    if (matched) {
      // 기존 참여자 → 비밀번호 확인 후 재입장
      if (matched.password !== form.password.trim()) {
        setErrors({ password: '비밀번호가 틀렸습니다.' });
        return;
      }
    } else {
      // 신규 참여자 등록
      const participant = {
        nickname: form.nickname.trim(),
        password: form.password.trim(),
        availableSlots: [] as string[],
      };
      localStorage.setItem(key, JSON.stringify([...existing, participant]));
    }

    localStorage.setItem(`currentUser_${meetingId}`, form.nickname.trim());

    navigate(`/meeting/${meetingId}/time`);
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">존재하지 않는 모임입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-indigo-500 transition-colors">Timing</Link>
        <button className="w-9 h-9 rounded-full border-2 border-gray-300 text-gray-400 text-base font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
          ?
        </button>
      </header>

      <main className="flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
          {/* 모임 정보 */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h2>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-400 flex items-center gap-1.5">
                <span>📅</span> {meeting.startDate} ~ {meeting.endDate}
              </span>
              <span className="text-sm text-gray-400 flex items-center gap-1.5">
                <span>🕐</span> {meeting.startTime} ~ {meeting.endTime}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors placeholder-gray-300"
              />
              {errors.nickname && (
                <p className="text-xs text-red-400 mt-1">{errors.nickname}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400 transition-colors placeholder-gray-300"
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                나중에 일정을 수정하려면 비밀번호가 필요합니다
              </p>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              다음 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
