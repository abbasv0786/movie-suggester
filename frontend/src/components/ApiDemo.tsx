import React, { useState } from 'react';
import styled from 'styled-components';
import { useSendSuggestionRequest, useApiHealth, useApiStatus } from '../hooks/useApi';
import { SuggestionRequest, SuggestionResponse } from '../types/api';
import { MovieService } from '../services/movieService';
import LoadingIndicator, { ButtonLoading } from './LoadingIndicator';
import ErrorDisplay, { NetworkStatus } from './ErrorDisplay';

// Demo container
const DemoContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Demo header
const DemoHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

const DemoTitle = styled.h2`
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 24px;
`;

const DemoSubtitle = styled.p`
  color: #718096;
  font-size: 16px;
`;

// API status section
const StatusSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.span`
  font-weight: 500;
  color: #4a5568;
`;

const StatusValue = styled.span<{ status: 'healthy' | 'error' | 'loading' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'healthy':
        return `
          background-color: #c6f6d5;
          color: #22543d;
        `;
      case 'error':
        return `
          background-color: #fed7d7;
          color: #c53030;
        `;
      default:
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
    }
  }}
`;

// Test form
const TestForm = styled.form`
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`;

const SubmitButton = styled.button`
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #2c5282;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Results section
const ResultsSection = styled.div`
  margin-top: 24px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 16px;
  color: #2d3748;
  font-size: 18px;
`;

// Import MovieCard component
import { MovieCard as StyledMovieCard } from './MovieCard';

// Test controls
const TestControls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const TestButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #4a5568;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f7fafc;
    border-color: #cbd5e0;
  }
`;

// Quick test scenarios
const TEST_SCENARIOS = [
  { prompt: 'Action movies like John Wick', lang: 'en' },
  { prompt: 'Romantic comedies for date night', lang: 'en' },
  { prompt: 'Scary horror movies', lang: 'en' },
  { prompt: 'Películas de ciencia ficción', lang: 'es' },
  { prompt: 'Films d\'animation pour enfants', lang: 'fr' },
];

export const ApiDemo: React.FC = () => {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [lang, setLang] = useState('en');
  
  // API state
  const suggestionMutation = useSendSuggestionRequest();
  const { data: healthData, isLoading: healthLoading, error: healthError } = useApiHealth();
  const { data: apiStatus, isLoading: statusLoading } = useApiStatus();
  
  // Results state
  const [results, setResults] = useState<SuggestionResponse | null>(null);
  const [testHistory, setTestHistory] = useState<Array<{
    timestamp: Date;
    request: SuggestionRequest;
    success: boolean;
    error?: any;
  }>>([]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    const request: SuggestionRequest = { prompt: prompt.trim(), lang };
    
    try {
      const response = await suggestionMutation.mutateAsync(request);
      setResults(response);
      setTestHistory(prev => [...prev, {
        timestamp: new Date(),
        request,
        success: true
      }]);
    } catch (error) {
      setTestHistory(prev => [...prev, {
        timestamp: new Date(),
        request,
        success: false,
        error
      }]);
    }
  };

  // Handle quick test
  const handleQuickTest = (scenario: typeof TEST_SCENARIOS[0]) => {
    setPrompt(scenario.prompt);
    setLang(scenario.lang);
  };

  // Handle health check test
  const testHealthEndpoint = async () => {
    try {
      const health = await MovieService.checkHealth();
      console.log('Health check result:', health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  // Clear results
  const clearResults = () => {
    setResults(null);
    setTestHistory([]);
  };

  return (
    <DemoContainer>
      <NetworkStatus />
      
      <DemoHeader>
        <DemoTitle>Movie Suggestion API Demo</DemoTitle>
        <DemoSubtitle>Test the complete API integration flow</DemoSubtitle>
      </DemoHeader>

      {/* API Status Section */}
      <StatusSection>
        <SectionTitle>API Status</SectionTitle>
        
        <StatusRow>
          <StatusLabel>Health Endpoint:</StatusLabel>
          {healthLoading ? (
            <LoadingIndicator variant="spinner" size="small" />
          ) : healthError ? (
            <StatusValue status="error">Error</StatusValue>
          ) : healthData ? (
            <StatusValue status="healthy">
              {healthData.status} (v{healthData.version})
            </StatusValue>
          ) : (
            <StatusValue status="loading">Unknown</StatusValue>
          )}
        </StatusRow>
        
        <StatusRow>
          <StatusLabel>Connectivity:</StatusLabel>
          {statusLoading ? (
            <LoadingIndicator variant="spinner" size="small" />
          ) : (
            <StatusValue status={apiStatus ? 'healthy' : 'error'}>
              {apiStatus ? 'Connected' : 'Disconnected'}
            </StatusValue>
          )}
        </StatusRow>
        
        <TestButton onClick={testHealthEndpoint}>
          Test Health Endpoint
        </TestButton>
      </StatusSection>

      {/* Quick Test Scenarios */}
      <TestControls>
        <span>Quick Tests:</span>
        {TEST_SCENARIOS.map((scenario, index) => (
          <TestButton
            key={index}
            onClick={() => handleQuickTest(scenario)}
          >
            {scenario.prompt}
          </TestButton>
        ))}
        <TestButton onClick={clearResults}>Clear Results</TestButton>
      </TestControls>

      {/* Test Form */}
      <TestForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="prompt">Movie Prompt:</Label>
          <Input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Action movies like John Wick"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="lang">Language:</Label>
          <Select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </Select>
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          disabled={!prompt.trim() || suggestionMutation.isPending}
        >
          <ButtonLoading 
            isLoading={suggestionMutation.isPending}
            loadingText="Getting suggestions..."
          >
            Get Movie Suggestions
          </ButtonLoading>
        </SubmitButton>
      </TestForm>

      {/* Error Display */}
      {suggestionMutation.error && (
        <ErrorDisplay
          error={suggestionMutation.error}
          variant="banner"
          title="API Request Failed"
          showDetails={true}
          onRetry={() => suggestionMutation.mutate({ prompt, lang })}
          onDismiss={() => suggestionMutation.reset()}
          dismissible={true}
        />
      )}

      {/* Loading State */}
      {suggestionMutation.isPending && (
        <LoadingIndicator
          variant="overlay"
          text="Fetching movie suggestions..."
        />
      )}

      {/* Results Section */}
      {(results || suggestionMutation.isPending) && (
        <ResultsSection>
          <SectionTitle>Results</SectionTitle>
          
          {suggestionMutation.isPending ? (
            <div>
              {/* Skeleton loading for movie cards */}
              {[1, 2, 3].map(i => (
                <StyledMovieCard key={i} movie={{
                  title: '',
                  genre: [],
                  year: 0,
                  reason: '',
                  description: ''
                }} isLoading={true} />
              ))}
            </div>
          ) : results ? (
            <div>
              <p style={{ marginBottom: '16px', color: '#718096' }}>
                {MovieService.getSummary(results)}
              </p>
              
              {results.suggestions.map((movie, index) => (
                <StyledMovieCard 
                  key={index} 
                  movie={movie}
                  variant="detailed"
                  showExpandButton={true}
                />
              ))}
            </div>
          ) : null}
        </ResultsSection>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <ResultsSection>
          <SectionTitle>Test History ({testHistory.length})</SectionTitle>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            {testHistory.map((test, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <span style={{ color: test.success ? '#38a169' : '#e53e3e' }}>
                  {test.success ? '✅' : '❌'}
                </span>{' '}
                {test.timestamp.toLocaleTimeString()} - {test.request.prompt} ({test.request.lang})
                {test.error && (
                  <div style={{ marginLeft: '20px', color: '#e53e3e' }}>
                    Error: {test.error.message || 'Unknown error'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ResultsSection>
      )}
    </DemoContainer>
  );
};

export default ApiDemo; 