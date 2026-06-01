import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import meetingsRouter from './routes/meetings';
import participantsRouter from './routes/participants';

const app = express();
const PORT = process.env.PORT ?? 3000;
const MONGODB_URI = process.env.MONGODB_URI ?? '';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/meetings', meetingsRouter);
app.use('/api/meetings/:meetingId/participants', participantsRouter);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  });
