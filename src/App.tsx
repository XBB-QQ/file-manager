import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import FileExplorer from './pages/FileExplorer';
import Categories from './pages/Categories';
import Tools from './pages/Tools';
import Me from './pages/Me';

export default function App() {
  return (
    <div className="h-screen bg-gray-100">
      <Router>
        <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-xl">
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<FileExplorer />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/me" element={<Me />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </Router>
    </div>
  );
}
