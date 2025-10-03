import { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('mobile');

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        <LandingPage category={currentPage} />
      </main>
    </div>
  );
}

export default App;
