import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db.json');

interface Meeting {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface Participant {
  nickname: string;
  password: string;
  availableSlots: string[];
}

interface DB {
  meetings: Record<string, Meeting>;
  participants: Record<string, Participant[]>;
}

function load(): DB {
  if (!fs.existsSync(DB_PATH)) return { meetings: {}, participants: {} };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DB;
}

function save(data: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export { load, save };
export type { Meeting, Participant, DB };
