import React from 'react';
import styled from 'styled-components';
import { YearBadgeProps } from '../types/movie';
import { movieUtils } from '../types/movie';

// Year badge container
const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #edf2f7;
    border-color: #cbd5e0;
  }
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

// Decade indicator
const DecadeText = styled.span`
  margin-left: 4px;
  font-size: 10px;
  font-weight: 400;
  opacity: 0.7;
`;

export const YearBadge: React.FC<YearBadgeProps> = ({
  year,
  className
}) => {
  const currentYear = new Date().getFullYear();
  const decade = movieUtils.getDecade(year);
  const isRecent = year >= currentYear - 5;
  const isClassic = year <= 1980;

  return (
    <BadgeContainer 
      className={className}
      title={`Released in ${year} (${decade})`}
      style={{
        backgroundColor: isRecent ? '#e6fffa' : isClassic ? '#fff5f5' : undefined,
        borderColor: isRecent ? '#81e6d9' : isClassic ? '#feb2b2' : undefined,
        color: isRecent ? '#234e52' : isClassic ? '#742a2a' : undefined,
      }}
    >
      {year}
      <DecadeText>({decade})</DecadeText>
    </BadgeContainer>
  );
};

export default YearBadge; 