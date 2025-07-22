import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatInterfaceRef } from '@/types/chat';

const PageContainer = styled.div`
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fafc;
  overflow: hidden;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #718096;
`;

const ClearButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #718096;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
    color: #2d3748;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
  }
`;



const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0; /* Important: allows flex item to shrink */
  height: calc(100vh - 80px); /* Reserve space for header */
`;

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export const ChatTestPage: React.FC = () => {
  const chatRef = useRef<ChatInterfaceRef>(null);

  const handleMessageSend = (message: string) => {
    // Message sent successfully - could add analytics here
    console.log('Movie suggestion request:', message);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to start a new conversation?')) {
      chatRef.current?.clearMessages();
    }
  };

  return (
    <PageContainer>
      <motion.div
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <Header>
          <HeaderContent>
            <Title>Movie Suggester AI</Title>
            <Subtitle>
              Get personalized movie recommendations powered by AI
            </Subtitle>
          </HeaderContent>
          
          <ClearButton onClick={handleClearChat}>
            <FaTimes size={12} />
            New Chat
          </ClearButton>
        </Header>

        <ChatContainer>
          <ChatInterface
            ref={chatRef}
            onMessageSend={handleMessageSend}
            enableMockResponses={false}
          />
        </ChatContainer>
      </motion.div>
    </PageContainer>
  );
}; 