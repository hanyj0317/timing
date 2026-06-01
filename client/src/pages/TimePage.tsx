import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Meeting } from '../types';
import HelpModal from '../components/HelpModal';
import { api } from '../api';

function getDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getTimes(startTime: string, endTime: string): string[] {
  const times: string[] = [];
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);
  for (let h = startHour; h < endHour; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
  }
  return times;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimePage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const currentUser = meetingId ? localStorage.getItem(`currentUser_${meetingId}`) : null;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDragging = useRef(false);
  const dragMode = useRef<'select' | 'deselect'>('select');

  useEffect(() => {
    if (!meetingId || !currentUser) return;

    Promise.all([
      api.getMeeting(meetingId),
      api.getParticipants(meetingId),
    ]).then(([meetingData, participants]) => {
      setMeeting(meetingData);
      const me = participants.find(p => p.nickname === currentUser);
      setSelected(new Set(me?.availableSlots ?? []));
    }).finally(() => setLoading(false));
  }, [meetingId, currentUser]);

  const dates = meeting ? getDates(meeting.startDate, meeting.endDate) : [];
  const times = meeting ? getTimes(meeting.startTime, meeting.endTime) : [];

  const slotKey = (date: string, time: string) => `${date}T${time}`;

  const handleMouseDown = (date: string, time: string) => {
    isDragging.current = true;
    const key = slotKey(date, time);
    dragMode.current = selected.has(key) ? 'deselect' : 'select';
    setSelected(prev => {
      const next = new Set(prev);
      dragMode.current === 'select' ? next.add(key) : next.delete(key);
      return next;
    });
  };

  const handleMouseEnter = (date: string, time: string) => {
    if (!isDragging.current) return;
    const key = slotKey(date, time);
    setSelected(prev => {
      const next = new Set(prev);
      dragMode.current === 'select' ? next.add(key) : next.delete(key);
      return next;
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleSave = async () => {
    if (!meetingId || !currentUser) return;
    await api.updateSlots(meetingId, currentUser, Array.from(selected));
    navigate(`/meeting/${meetingId}/result`);
  };

  if (!currentUser || (!loading && !meeting)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">잘못된 접근입니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onMouseUp={handleMouseUp}>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* 모임 정보 */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4 flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">{meeting!.title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {meeting!.startDate} ~ {meeting!.endDate} &nbsp;·&nbsp; {meeting!.startTime} ~ {meeting!.endTime}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{currentUser}</span>
            <button
              onClick={() => navigate(`/meeting/${meetingId}/result`)}
              className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 안내 */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800">참여 가능한 시간 선택</h3>
          <p className="text-sm text-gray-400 mt-0.5">참여 가능한 시간대를 클릭하거나 드래그하여 선택해주세요.</p>
        </div>

        {/* 그리드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-x-auto select-none">
          <div
            className="grid"
            style={{ gridTemplateColumns: `64px repeat(${dates.length}, 1fr)` }}
          >
            <div />
            {dates.map(date => {
              const d = new Date(date);
              return (
                <div key={date} className="text-center pb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {String(d.getMonth() + 1).padStart(2, '0')}/{String(d.getDate()).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-gray-400">{DAY_LABELS[d.getDay()]}</p>
                </div>
              );
            })}

            {times.map(time => (
              <>
                <div key={`label-${time}`} className="text-xs text-gray-400 flex items-center justify-end pr-3 h-10">
                  {time}
                </div>
                {dates.map(date => {
                  const key = slotKey(date, time);
                  const isSelected = selected.has(key);
                  return (
                    <div
                      key={key}
                      className={`h-10 border border-gray-100 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-400 border-indigo-300'
                          : 'bg-white hover:bg-indigo-50'
                      }`}
                      onMouseDown={() => handleMouseDown(date, time)}
                      onMouseEnter={() => handleMouseEnter(date, time)}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            저장하기 →
          </button>
        </div>
      </main>
    </div>
  );
}
