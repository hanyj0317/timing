import type { Meeting, Participant } from './types';

const BASE_URL = 'http://localhost:3000/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? '서버 오류가 발생했습니다.');
  return data as T;
}

export const api = {
  createMeeting: (meeting: Meeting) =>
    request<{ id: string }>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    }),

  getMeeting: (id: string) =>
    request<Meeting>(`/meetings/${id}`),

  joinMeeting: (meetingId: string, nickname: string, password: string) =>
    request<{ message: string }>(`/meetings/${meetingId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ nickname, password }),
    }),

  getParticipants: (meetingId: string) =>
    request<Participant[]>(`/meetings/${meetingId}/participants`),

  updateSlots: (meetingId: string, nickname: string, availableSlots: string[]) =>
    request<{ message: string }>(`/meetings/${meetingId}/participants/${encodeURIComponent(nickname)}`, {
      method: 'PUT',
      body: JSON.stringify({ availableSlots }),
    }),
};
