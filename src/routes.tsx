import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SpreadSelect from './pages/SpreadSelect';
import QuestionInput from './pages/QuestionInput';
import ReadingPage from './pages/ReadingPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/select" element={<SpreadSelect />} />
      <Route path="/question/:spreadId" element={<QuestionInput />} />
      <Route path="/reading" element={<ReadingPage />} />
    </Routes>
  );
}
