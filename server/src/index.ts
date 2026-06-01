import express from 'express';
import cors from 'cors';
import meetingsRouter from './routes/meetings';
import participantsRouter from './routes/participants';

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/meetings', meetingsRouter);
app.use('/api/meetings/:meetingId/participants', participantsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
