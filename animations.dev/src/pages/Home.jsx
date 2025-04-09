import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="home-container"
    >
      <div className="experiment-list">
        <h2>Available Experiments</h2>
        <ul>
          <li>Button Experiments - Various button styles and interactions</li>
          <li>Card Experiments - Card layouts and hover effects</li>
          <li>Modal Experiments - Different modal animations and behaviors</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default Home; 