export interface Meeting {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface Participant {
  nickname: string;
  availableSlots: string[];
}

export interface MeetingState {
  meeting: Meeting | null;
  participants: Participant[];
  currentUser: { nickname: string } | null;
}
