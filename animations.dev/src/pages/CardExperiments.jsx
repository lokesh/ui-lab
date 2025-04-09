import { motion } from 'framer-motion';

const CardExperiments = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-experiments"
    >
      <h1>Card Experiments</h1>
      <div className="card-grid">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card"
        >
          <h3>Basic Card</h3>
          <p>Hover to see the scale effect</p>
        </motion.div>

        <motion.div
          whileHover={{ 
            y: -10,
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
          }}
          className="card"
        >
          <h3>Elevation Card</h3>
          <p>Hover to see the elevation effect</p>
        </motion.div>

        <motion.div
          whileHover={{ 
            rotateY: 180,
            transition: { duration: 0.5 }
          }}
          className="card flip-card"
        >
          <div className="card-front">
            <h3>Flip Card</h3>
            <p>Hover to flip</p>
          </div>
          <div className="card-back">
            <h3>Back Side</h3>
            <p>This is the back!</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CardExperiments; 