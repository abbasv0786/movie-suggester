import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface TestButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const TestButton: React.FC<TestButtonProps> = ({ children, onClick }) => {
  return (
    <StyledButton onClick={onClick}>
      {children}
    </StyledButton>
  );
}; 