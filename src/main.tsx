import { createRoot } from 'react-dom/client';
import './index.css';
import { RootWithSplash } from './components/SplashScreen';

createRoot(document.getElementById("root")!).render(<RootWithSplash />);
