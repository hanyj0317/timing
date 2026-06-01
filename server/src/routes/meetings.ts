import { Router } from 'express';
import { load, save } from '../db';

const router = Router();

router.post('/', (req, res) => {
  const { id, title, description, startDate, endDate, startTime, endTime } = req.body;

  if (!id || !title || !startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  const db = load();
  db.meetings[id] = { id, title, description: description ?? '', startDate, endDate, startTime, endTime };
  save(db);

  return res.status(201).json({ id });
});

router.get('/:id', (req, res) => {
  const db = load();
  const meeting = db.meetings[req.params.id];

  if (!meeting) return res.status(404).json({ error: '존재하지 않는 모임입니다.' });

  return res.json(meeting);
});

export default router;
