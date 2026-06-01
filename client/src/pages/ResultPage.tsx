import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Meeting, Participant } from '../types';
import HelpModal from '../components/HelpModal';
import { api } from '../api';

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
  requiredParticipants: string[],
  duration: number
): SlotResult[] {
  const slotMap = new Map<string, string[]>();

  for (const p of participants) {
    for (const slot of p.availableSlots) {
      if (!slotMap.has(slot)) slotMap.set(slot, []);
      slotMap.get(slot)!.push(p.nickname);
    }
  }

  // 날짜별로 슬롯 그룹화
  const dateMap = new Map<string, string[]>();
  for (const slot of slotMap.keys()) {
    const [date, time] = slot.split('T');
    if (!dateMap.has(date)) dateMap.set(date, []);
    dateMap.get(date)!.push(time);
  }

  const results: SlotResult[] = [];

  for (const [date, times] of dateMap.entries()) {
    const sorted = [...times].sort();

    for (let i = 0; i <= sorted.length - duration; i++) {
      // duration만큼 연속된 시간인지 확인
      let isConsecutive = true;
      for (let j = 0; j < duration - 1; j++) {
        const curr = Number(sorted[i + j].split(':')[0]);
        const next = Number(sorted[i + j + 1].split(':')[0]);
        if (next !== curr + 1) { isConsecutive = false; break; }
      }
      if (!isConsecutive) continue;

      // duration 슬롯 전체에서 공통 참여자 교집합 계산
      let common = [...(slotMap.get(`${date}T${sorted[i]}`) ?? [])];
      for (let j = 1; j < duration; j++) {
        const others = slotMap.get(`${date}T${sorted[i + j]}`) ?? [];
        common = common.filter(n => others.includes(n));
      }

      if (common.length < minCount) continue;
      if (requiredParticipants.some(r => !common.includes(r))) continue;

      results.push({ date, time: sorted[i], count: common.length, participants: common });
    }
  }

  return results.sort((a, b) => b.count - a.count || a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export default function ResultPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [minCount, setMinCount] = useState(1);
  const [duration, setDuration] = useState(1);
  const [required, setRequired] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    api.getMeeting(meetingId).then(setMeeting).catch(() => {});
    api.getParticipants(meetingId).then(setParticipants).catch(() => {});
  }, [meetingId]);

  const maxDuration = meeting
    ? Number(meeting.endTime.split(':')[0]) - Number(meeting.startTime.split(':')[0])
    : 1;

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

  const recommendations = computeRecommendations(participants, minCount, required, duration);
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
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-indigo-500 transition-colors">Timing</Link>
        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-full border-2 border-gray-300 text-gray-400 text-base font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
        >
          ?
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">

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

            {/* 회의 시간 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">회의 시간</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDuration(d => Math.max(1, d - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-gray-800 w-10 text-center">{duration}시간</span>
                <button
                  onClick={() => setDuration(d => Math.min(maxDuration, d + 1))}
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
                    🕐 {r.time} - {String(Number(r.time.split(':')[0]) + duration).padStart(2, '0')}:00
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
