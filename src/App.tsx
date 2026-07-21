import { BrowserRouter } from 'react-router-dom';
import { ReadingProvider } from './context/ReadingContext';
import { PwaStatus } from './components/PwaStatus';
import AppRoutes from './routes';

export default function App() {
  return (
    <ReadingProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <PwaStatus />
    </ReadingProvider>
  );
}
