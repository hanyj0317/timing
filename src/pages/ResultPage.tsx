import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Meeting, Participant } from '../types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_LABELS[d.getDay()]})`;
}

interface SlotResult {
  date: string;
  time: string;
  count: number;
  participants: string[];
}

function computeRecommendations(
  participants: Participant[],
  minCount: number,
  requiredParticipants: string[]
): SlotResult[] {
  const slotMap = new Map<string, string[]>();

  for (const p of participants) {
    for (const slot of p.availableSlots) {
      if (!slotMap.has(slot)) slotMap.set(slot, []);
      slotMap.get(slot)!.push(p.nickname);
    }
  }

  const results: SlotResult[] = [];
  for (const [slot, names] of slotMap.entries()) {
    if (names.length < minCount) continue;
    if (requiredParticipants.some(r => !names.includes(r))) continue;
    const [date, time] = slot.split('T');
    results.push({ date, time, count: names.length, participants: names });
  }

  return results.sort((a, b) => b.count - a.count || a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export default function ResultPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const meeting: Meeting | null = meetingId
    ? JSON.parse(localStorage.getItem(`meeting_${meetingId}`) ?? 'null')
    : null;

  const participants: Participant[] = meetingId
    ? JSON.parse(localStorage.getItem(`participants_${meetingId}`) ?? '[]')
    : [];

  const [minCount, setMinCount] = useState(1);
  const [required, setRequired] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = meetingId ? `${window.location.origin}/join/${meetingId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRequired = (nickname: string) => {
    setRequired(prev =>
      prev.includes(nickname) ? prev.filter(n => n !== nickname) : [...prev, nickname]
    );
  };

  const recommendations = computeRecommendations(participants, minCount, required);
  const maxCount = recommendations[0]?.count ?? 0;

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

      <main className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-[320px_1fr] gap-6 items-start">

        {/* 왼쪽 패널 */}
        <div className="flex flex-col gap-4">

          {/* 모임 정보 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900">{meeting.title}</h2>
            <p className="text-xs text-gray-400 mt-1">
              {meeting.startDate} ~ {meeting.endDate} / {meeting.startTime} ~ {meeting.endTime}
            </p>

            {/* 링크 공유 */}
            <div className="mt-4">
              <p className="text-xs font-medium text-indigo-500 mb-2 flex items-center gap-1">
                <span>🔗</span> 참여 링크 공유
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-xs bg-gray-50 text-gray-500 outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="bg-indigo-400 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>
            </div>
          </div>

          {/* 참여자 목록 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <button
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700"
              onClick={() => setShowParticipants(p => !p)}
            >
              <span className="flex items-center gap-1.5">
                <span>👥</span> 참여자 ({participants.length}명)
              </span>
              <span className="text-gray-400 text-xs">{showParticipants ? '▲' : '▼'}</span>
            </button>
            {showParticipants && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {participants.map(p => (
                  <li
                    key={p.nickname}
                    className="bg-indigo-50 text-indigo-500 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {p.nickname}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 모임 설정 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
              <span>⚙️</span> 모임 설정
            </p>

            {/* 최소 참여 인원 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">최소 참여 인원</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMinCount(c => Math.max(1, c - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-gray-800 w-8 text-center">{minCount}명</span>
                <button
                  onClick={() => setMinCount(c => Math.min(participants.length, c + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 필수 참석자 */}
            <div>
              <p className="text-xs text-gray-500 mb-2">필수 참석자</p>
              <ul className="space-y-2">
                {participants.map(p => (
                  <li key={p.nickname} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-${p.nickname}`}
                      checked={required.includes(p.nickname)}
                      onChange={() => toggleRequired(p.nickname)}
                      className="accent-indigo-400 w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor={`req-${p.nickname}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {p.nickname}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 시간 수정 버튼 */}
          {meetingId && localStorage.getItem(`currentUser_${meetingId}`) && (
            <button
              onClick={() => navigate(`/meeting/${meetingId}/time`)}
              className="w-full border border-indigo-300 text-indigo-500 hover:bg-indigo-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              내 시간 수정하기
            </button>
          )}
        </div>

        {/* 오른쪽 패널: 추천 결과 */}
        <div className="flex flex-col gap-3">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center">
              <p className="text-sm text-gray-300">
                {participants.length === 0
                  ? '아직 참여자가 없습니다.'
                  : '조건을 만족하는 시간이 없습니다.'}
              </p>
            </div>
          ) : (
            recommendations.map((r, i) => {
              const isTop = r.count === maxCount && i === 0;
              return (
                <div
                  key={`${r.date}T${r.time}`}
                  className={`rounded-2xl border p-5 transition-colors ${
                    isTop
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <span className="text-xs font-semibold bg-yellow-400 text-white px-2 py-0.5 rounded-full">
                          최다 참여
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-800">
                        {formatDate(r.date)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-indigo-500">
                      👥 {r.count}명
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    🕐 {r.time} - {String(Number(r.time.split(':')[0]) + 1).padStart(2, '0')}:00
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.participants.map(name => (
                      <span
                        key={name}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          required.includes(name)
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
