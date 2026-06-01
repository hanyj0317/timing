import { Router, Request, Response } from 'express';
import Participant from '../models/Participant';

const router = Router({ mergeParams: true });

router.post('/', async (req: Request<{ meetingId: string }>, res: Response) => {
  const { meetingId } = req.params;
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: '이름과 비밀번호를 입력해주세요.' });
  }

  const existing = await Participant.findOne({ meetingId, nickname });

  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }
    return res.json({ message: '재입장 성공' });
  }

  await Participant.create({ meetingId, nickname, password, availableSlots: [] });
  return res.status(201).json({ message: '참여 완료' });
});

router.get('/', async (req: Request<{ meetingId: string }>, res: Response) => {
  const { meetingId } = req.params;
  const participants = await Participant.find({ meetingId });

  return res.json(participants.map((p: { nickname: string; availableSlots: string[] }) => ({
    nickname: p.nickname,
    availableSlots: p.availableSlots,
  })));
});

router.put('/:nickname', async (req: Request<{ meetingId: string; nickname: string }>, res: Response) => {
  const { meetingId, nickname } = req.params;
  const { availableSlots } = req.body;

  const result = await Participant.findOneAndUpdate(
    { meetingId, nickname },
    { availableSlots },
    { new: true }
  );

  if (!result) return res.status(404).json({ error: '참여자를 찾을 수 없습니다.' });
  return res.json({ message: '저장 완료' });
});

export default router;
