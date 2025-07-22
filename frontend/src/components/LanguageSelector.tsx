import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelectorProps, languageUtils } from '../types/language';

// Selector container
const SelectorContainer = styled.div<{ variant: 'dropdown' | 'buttons' | 'compact' }>`
  position: relative;
  display: ${props => props.variant === 'buttons' ? 'flex' : 'inline-block'};
  gap: ${props => props.variant === 'buttons' ? '4px' : '0'};
`;

// Dropdown trigger button
const DropdownTrigger = styled.button<{ 
  variant: 'dropdown' | 'buttons' | 'compact';
  isOpen?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${props => props.variant === 'compact' ? '4px' : '8px'};
  padding: ${props => {
    switch (props.variant) {
      case 'compact': return '6px 8px';
      case 'dropdown': return '8px 12px';
      default: return '8px 12px';
    }
  }};
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${props => props.variant === 'compact' ? '13px' : '14px'};
  font-weight: 500;
  color: #4a5568;
  
  &:hover {
    border-color: #cbd5e0;
    background-color: #f7fafc;
  }
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
  
  ${props => props.isOpen && `
    border-color: #3182ce;
    background-color: #f7fafc;
  `}
`;

// Language flag
const LanguageFlag = styled.span<{ size?: 'small' | 'medium' }>`
  font-size: ${props => props.size === 'small' ? '14px' : '16px'};
  line-height: 1;
`;

// Language name
const LanguageName = styled.span<{ variant: 'dropdown' | 'buttons' | 'compact' }>`
  ${props => props.variant === 'compact' && `
    @media (max-width: 768px) {
      display: none;
    }
  `}
`;

// Dropdown arrow
const DropdownArrow = styled.span<{ isOpen?: boolean }>`
  font-size: 12px;
  color: #a0aec0;
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

// Dropdown menu
const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
`;

// Dropdown item
const DropdownItem = styled.button<{ isSelected?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: ${props => props.isSelected ? '#edf2f7' : 'transparent'};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  text-align: left;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  &:focus {
    outline: none;
    background-color: #edf2f7;
  }
  
  ${props => props.isSelected && `
    font-weight: 500;
    color: #3182ce;
  `}
`;

// Language item content
const LanguageItemContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const LanguageItemName = styled.span`
  font-weight: 500;
  color: #2d3748;
`;

const LanguageItemNative = styled.span`
  font-size: 12px;
  color: #718096;
`;

// Button group for buttons variant
const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
  background-color: #f7fafc;
  padding: 4px;
  border-radius: 8px;
`;

const LanguageButton = styled.button<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: ${props => props.isSelected ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: ${props => props.isSelected ? '600' : '500'};
  color: ${props => props.isSelected ? '#3182ce' : '#4a5568'};
  
  &:hover {
    background-color: ${props => props.isSelected ? 'white' : '#edf2f7'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
  }
  
  ${props => props.isSelected && `
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

// Animation variants
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -8, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2 }
  }
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  languages,
  variant = 'dropdown',
  showNames = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Button group variant
  if (variant === 'buttons') {
    return (
      <SelectorContainer variant={variant} className={className}>
        <ButtonGroup>
          {languages.map((language) => (
            <LanguageButton
              key={language.code}
              isSelected={language.code === selectedLanguage}
              onClick={() => handleLanguageSelect(language.code)}
              title={`Switch to ${language.name}`}
            >
              <LanguageFlag size="small">{language.flag}</LanguageFlag>
              {showNames && (
                <span>{language.nativeName}</span>
              )}
            </LanguageButton>
          ))}
        </ButtonGroup>
      </SelectorContainer>
    );
  }

  // Dropdown and compact variants
  return (
    <SelectorContainer 
      variant={variant} 
      className={className}
      ref={dropdownRef}
    >
      <DropdownTrigger
        variant={variant}
        isOpen={isOpen}
        onClick={handleToggleDropdown}
        title={languageUtils.getDisplayName(selectedLanguage)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <LanguageFlag>
          {selectedLang?.flag || '🌐'}
        </LanguageFlag>
        
        {showNames && selectedLang && (
          <LanguageName variant={variant}>
            {variant === 'compact' ? selectedLang.code.toUpperCase() : selectedLang.nativeName}
          </LanguageName>
        )}
        
        <DropdownArrow isOpen={isOpen}>▼</DropdownArrow>
      </DropdownTrigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="listbox"
          >
            {languages.map((language) => (
              <DropdownItem
                key={language.code}
                isSelected={language.code === selectedLanguage}
                onClick={() => handleLanguageSelect(language.code)}
                role="option"
                aria-selected={language.code === selectedLanguage}
              >
                <LanguageFlag>{language.flag}</LanguageFlag>
                
                <LanguageItemContent>
                  <LanguageItemName>{language.name}</LanguageItemName>
                  {language.nativeName !== language.name && (
                    <LanguageItemNative>{language.nativeName}</LanguageItemNative>
                  )}
                </LanguageItemContent>
                
                {language.code === selectedLanguage && (
                  <span style={{ color: '#3182ce', fontSize: '12px' }}>✓</span>
                )}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </AnimatePresence>
    </SelectorContainer>
  );
};

export default LanguageSelector; 