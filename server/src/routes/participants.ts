import { Router, Request, Response } from 'express';
import Participant from '../models/Participant';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Participants
 *   description: 참여자 관련 API
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/participants:
 *   post:
 *     summary: 참여자 등록 / 재입장
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname, password]
 *             properties:
 *               nickname:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 참여 완료
 *       200:
 *         description: 재입장 성공
 *       401:
 *         description: 비밀번호 오류
 */
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

/**
 * @swagger
 * /api/meetings/{meetingId}/participants:
 *   get:
 *     summary: 참여자 목록 조회
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 참여자 목록 반환
 */
router.get('/', async (req: Request<{ meetingId: string }>, res: Response) => {
  const { meetingId } = req.params;
  const participants = await Participant.find({ meetingId });

  return res.json(participants.map((p: { nickname: string; availableSlots: string[] }) => ({
    nickname: p.nickname,
    availableSlots: p.availableSlots,
  })));
});

/**
 * @swagger
 * /api/meetings/{meetingId}/participants/{nickname}:
 *   put:
 *     summary: 참여자 시간 저장
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableSlots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 저장 완료
 *       404:
 *         description: 참여자를 찾을 수 없음
 */
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
