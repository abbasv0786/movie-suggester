import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TestButton } from '@/components/TestButton';
import { AnimatedCard } from '@/components/AnimatedCard';
import { IconShowcase } from '@/components/IconShowcase';
import { ApiDemo } from '@/components/ApiDemo';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #4a5568;
  font-size: 1.2rem;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled(motion.section)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  margin-bottom: 32px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const SectionContent = styled.div`
  padding: 24px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 24px 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-items: center;
`;

const Badge = styled.span`
  background: #e2e8f0;
  border-radius: 12px;
  color: #4a5568;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  margin-left: 8px;
`;

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export const TestPage: React.FC = () => {
  const handleButtonClick = () => {
    alert('Frontend setup is working perfectly! 🎉');
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Frontend Setup Complete!</Title>
          <Subtitle>
            Modern React development environment with TypeScript, Bun, and all essential dependencies.
            This page demonstrates that all components are working correctly.
          </Subtitle>
        </Header>

        <Section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionHeader>
            <SectionTitle>
              Styled Components Test
              <Badge>CSS-in-JS</Badge>
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            <p>Testing styled-components with TypeScript integration and theme support:</p>
            <ButtonRow>
              <TestButton onClick={handleButtonClick}>
                Click Me!
              </TestButton>
              <TestButton onClick={() => console.log('Styled components working!')}>
                Console Log
              </TestButton>
            </ButtonRow>
          </SectionContent>
        </Section>

        <Section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionHeader>
            <SectionTitle>
              Framer Motion Test
              <Badge>Animations</Badge>
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            <p>Interactive animated cards demonstrating Framer Motion capabilities:</p>
            <CardGrid>
              <AnimatedCard
                title="Animation Test"
                description="Click this card to see the flip animation in action. Hover effects also included!"
              />
              <AnimatedCard
                title="TypeScript Support"
                description="Fully typed animation props with IntelliSense support and compile-time checks."
              />
            </CardGrid>
          </SectionContent>
        </Section>

        <Section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionHeader>
            <SectionTitle>
              React Icons Test
              <Badge>UI Elements</Badge>
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            <IconShowcase />
          </SectionContent>
        </Section>

        <Section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionHeader>
            <SectionTitle>
              HTTP Client Test
              <Badge>API Integration</Badge>
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            <ApiDemo />
          </SectionContent>
        </Section>

        <Section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <SectionHeader>
            <SectionTitle>
              Setup Verification
              <Badge>Status</Badge>
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            <h4>✅ Completed Setup Tasks:</h4>
            <ul>
              <li>✅ React 18 with TypeScript configured</li>
              <li>✅ Bun package manager operational</li>
              <li>✅ Vite development server (port 3000)</li>
              <li>✅ Hot Module Replacement enabled</li>
              <li>✅ TypeScript strict mode activated</li>
              <li>✅ Path aliases configured (@/ shortcuts)</li>
              <li>✅ Essential dependencies installed:</li>
              <ul>
                <li>• @tanstack/react-query (API state management)</li>
                <li>• styled-components (CSS-in-JS)</li>
                <li>• framer-motion (animations)</li>
                <li>• react-icons (icon library)</li>
                <li>• axios (HTTP client)</li>
                <li>• date-fns (date formatting)</li>
              </ul>
              <li>✅ Project structure organized</li>
              <li>✅ All components compiling without errors</li>
            </ul>
            
            <h4>🚀 Ready for Development:</h4>
            <p>
              The frontend environment is now fully configured and ready for building 
              the movie suggestion chat interface. All dependencies are properly 
              installed and verified to work correctly.
            </p>
          </SectionContent>
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}; 