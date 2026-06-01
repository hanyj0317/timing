import { Router, Request, Response } from 'express';
import { load, save } from '../db';

const router = Router({ mergeParams: true });

router.post('/', (req: Request<{ meetingId: string }>, res: Response) => {
  const { meetingId } = req.params;
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: '이름과 비밀번호를 입력해주세요.' });
  }

  const db = load();
  if (!db.participants[meetingId]) db.participants[meetingId] = [];

  const existing = db.participants[meetingId].find(p => p.nickname === nickname);

  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }
    return res.json({ message: '재입장 성공' });
  }

  db.participants[meetingId].push({ nickname, password, availableSlots: [] });
  save(db);

  return res.status(201).json({ message: '참여 완료' });
});

router.get('/', (req: Request<{ meetingId: string }>, res: Response) => {
  const { meetingId } = req.params;
  const db = load();
  const participants = (db.participants[meetingId] ?? []).map(p => ({
    nickname: p.nickname,
    availableSlots: p.availableSlots,
  }));

  return res.json(participants);
});

router.put('/:nickname', (req: Request<{ meetingId: string; nickname: string }>, res: Response) => {
  const { meetingId, nickname } = req.params;
  const { availableSlots } = req.body;

  const db = load();
  const participant = db.participants[meetingId]?.find(p => p.nickname === nickname);

  if (!participant) return res.status(404).json({ error: '참여자를 찾을 수 없습니다.' });

  participant.availableSlots = availableSlots;
  save(db);

  return res.json({ message: '저장 완료' });
});

export default router;
