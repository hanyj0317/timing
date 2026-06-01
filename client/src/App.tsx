import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import JoinPage from './pages/JoinPage';
import TimePage from './pages/TimePage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/join/:meetingId" element={<JoinPage />} />
        <Route path="/meeting/:meetingId/time" element={<TimePage />} />
        <Route path="/meeting/:meetingId/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
