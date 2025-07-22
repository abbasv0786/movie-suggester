import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ContentTypeBadgeProps {
  contentType: 'movie' | 'series' | 'chat';
  className?: string;
  compact?: boolean;
}

const Badge = styled(motion.span)<{ $contentType: string; $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${props => props.$compact ? '2px 6px' : '4px 8px'};
  border-radius: 12px;
  font-size: ${props => props.$compact ? '10px' : '12px'};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$contentType) {
      case 'movie':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'series':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'chat':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    }
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;

  @media (max-width: 768px) {
    font-size: ${props => props.$compact ? '9px' : '10px'};
    padding: ${props => props.$compact ? '1px 4px' : '3px 6px'};
  }
`;

const Icon = styled.span`
  font-size: 1.1em;
  line-height: 1;
`;

const Text = styled.span`
  line-height: 1;
`;

export const ContentTypeBadge: React.FC<ContentTypeBadgeProps> = ({
  contentType,
  className,
  compact = false
}) => {
  const getContentInfo = (type: string) => {
    switch (type) {
      case 'movie':
        return { icon: '🎬', text: 'Movie' };
      case 'series':
        return { icon: '📺', text: 'Series' };
      case 'chat':
        return { icon: '💬', text: 'Chat' };
      default:
        return { icon: '🎭', text: 'Content' };
    }
  };

  const { icon, text } = getContentInfo(contentType);

  return (
    <Badge
      $contentType={contentType}
      $compact={compact}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
    >
      <Icon>{icon}</Icon>
      {!compact && <Text>{text}</Text>}
    </Badge>
  );
};

export default ContentTypeBadge; 