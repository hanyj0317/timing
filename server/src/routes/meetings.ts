import { Router } from 'express';
import Meeting from '../models/Meeting';

const router = Router();

router.post('/', async (req, res) => {
  const { id, title, description, startDate, endDate, startTime, endTime } = req.body;

  if (!id || !title || !startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  await Meeting.create({ id, title, description: description ?? '', startDate, endDate, startTime, endTime });
  return res.status(201).json({ id });
});

router.get('/:id', async (req, res) => {
  const meeting = await Meeting.findOne({ id: req.params.id });
  if (!meeting) return res.status(404).json({ error: '존재하지 않는 모임입니다.' });

  return res.json({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    startDate: meeting.startDate,
    endDate: meeting.endDate,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
  });
});

export default router;
