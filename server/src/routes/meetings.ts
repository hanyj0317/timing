import { Router } from 'express';
import Meeting from '../models/Meeting';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: 모임 관련 API
 */

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: 모임 생성
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, title, startDate, endDate, startTime, endTime]
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: 모임 생성 성공
 *       400:
 *         description: 필수 항목 누락
 */
router.post('/', async (req, res) => {
  const { id, title, description, startDate, endDate, startTime, endTime } = req.body;

  if (!id || !title || !startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  await Meeting.create({ id, title, description: description ?? '', startDate, endDate, startTime, endTime });
  return res.status(201).json({ id });
});

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: 모임 조회
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 모임 정보 반환
 *       404:
 *         description: 존재하지 않는 모임
 */
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
