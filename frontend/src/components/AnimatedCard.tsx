import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const CardContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 24px;
  width: 300px;
  margin: 16px;
`;

const cardVariants = {
  initial: { scale: 1, rotateY: 0 },
  hover: { 
    scale: 1.05, 
    rotateY: 5,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

interface AnimatedCardProps {
  title: string;
  description: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ title, description }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <CardContainer
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={() => setIsFlipped(!isFlipped)}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={{ opacity: isFlipped ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3>{title}</h3>
        <p>{description}</p>
      </motion.div>
      
      <motion.div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          transform: 'rotateY(180deg)',
        }}
        animate={{ opacity: isFlipped ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3>Flipped!</h3>
        <p>This side shows when clicked. Click again to flip back.</p>
      </motion.div>
    </CardContainer>
  );
}; 