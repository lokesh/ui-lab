import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';

// Pages
import Home from './pages/Home';
import ButtonExperiments from './pages/ButtonExperiments';
import CardExperiments from './pages/CardExperiments';
import ModalExperiments from './pages/ModalExperiments';
import StackedCards from './pages/StackedCards';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="nav-content"
          >
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/buttons">Button Experiments</Link>
              </li>
              <li>
                <Link to="/cards">Card Experiments</Link>
              </li>
              <li>
                <Link to="/modals">Modal Experiments</Link>
              </li>
              <li>
                <Link to="/stacked-cards">Stacked Cards</Link>
              </li>
            </ul>
          </motion.div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buttons" element={<ButtonExperiments />} />
            <Route path="/cards" element={<CardExperiments />} />
            <Route path="/modals" element={<ModalExperiments />} />
            <Route path="/stacked-cards" element={<StackedCards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 