import { motion } from 'framer-motion';

const ButtonExperiments = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="button-experiments"
    >
      <h1>Button Experiments</h1>
      <div className="button-grid">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="button primary"
        >
          Hover Me
        </motion.button>
        
        <motion.button
          whileHover={{ backgroundColor: "#535bf2" }}
          transition={{ duration: 0.2 }}
          className="button secondary"
        >
          Color Change
        </motion.button>
        
        <motion.button
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
          className="button fun"
        >
          Fun Button
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ButtonExperiments; 