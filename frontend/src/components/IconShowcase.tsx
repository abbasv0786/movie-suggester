import React from 'react';
import { 
  FaHeart, 
  FaStar, 
  FaThumbsUp, 
  FaPlay, 
  FaSearch,
  FaUser,
  FaCog,
  FaHome
} from 'react-icons/fa';
import { 
  MdMovie, 
  MdFavorite, 
  MdTheaters, 
  MdRateReview 
} from 'react-icons/md';
import styled from 'styled-components';

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 16px 0;
`;

const IconItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  svg {
    font-size: 24px;
    color: #667eea;
    margin-bottom: 8px;
  }

  span {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    text-align: center;
  }
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 16px;
  text-align: center;
`;

export const IconShowcase: React.FC = () => {
  const icons = [
    { icon: <FaHeart />, name: 'Heart' },
    { icon: <FaStar />, name: 'Star' },
    { icon: <FaThumbsUp />, name: 'Like' },
    { icon: <FaPlay />, name: 'Play' },
    { icon: <FaSearch />, name: 'Search' },
    { icon: <FaUser />, name: 'User' },
    { icon: <FaCog />, name: 'Settings' },
    { icon: <FaHome />, name: 'Home' },
    { icon: <MdMovie />, name: 'Movie' },
    { icon: <MdFavorite />, name: 'Favorite' },
    { icon: <MdTheaters />, name: 'Theatre' },
    { icon: <MdRateReview />, name: 'Review' },
  ];

  return (
    <div>
      <Title>React Icons Showcase</Title>
      <IconGrid>
        {icons.map((item, index) => (
          <IconItem key={index}>
            {item.icon}
            <span>{item.name}</span>
          </IconItem>
        ))}
      </IconGrid>
    </div>
  );
}; 