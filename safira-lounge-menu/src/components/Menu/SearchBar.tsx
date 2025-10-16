import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const SearchContainer = styled.div`
  position: relative;
  width: 90vw;
  max-width: 900px;
  margin: 0 auto 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1024px) {
    width: 90vw;
  }

  @media (max-width: 768px) {
    width: 90vw;
  }

  @media (max-width: 480px) {
    width: 90vw;
  }
`;

const SearchTip = styled.div.withConfig({
  shouldForwardProp: (prop) => !['show'].includes(prop),
})<{ show: boolean }>`
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-family: 'Aldrich', sans-serif;
  white-space: nowrap;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 60px 15px 20px;
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 25px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.9rem, 2vw, 1rem);
  line-height: 1.5;
  min-height: 50px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-sizing: border-box;
  text-align: left;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    text-align: left;
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 20px rgba(255, 65, 251, 0.3);
    background: rgba(255, 65, 251, 0.15);
  }

  @media (max-width: 1024px) {
    padding: 16px 60px 16px 20px;
    min-height: 52px;
  }

  @media (max-width: 768px) {
    padding: 16px 60px 16px 20px;
    min-height: 52px;
  }

  @media (max-width: 480px) {
    padding: 16px 60px 16px 20px;
    min-height: 52px;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;

  button {
    pointer-events: auto;
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #FF41FB;
  font-size: 1.2rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #FF41FB;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
  }
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
  debounceDelay?: number;
  showClear?: boolean;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder,
  language,
  debounceDelay = 300,
  showClear = true,
  autoFocus = false
}) => {
  const { t } = useLanguage();
  const [showTip, setShowTip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  const handleFocus = () => {
    if (!hasInteracted) {
      setShowTip(true);
      setHasInteracted(true);
    }
  };

  const handleBlur = () => {
    setShowTip(false);
  };

  // Auto-hide tip after 3 seconds
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => setShowTip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTip]);

  return (
    <SearchContainer>
      <SearchTip show={showTip}>
        Geben Sie Produktnamen oder Zutaten ein
      </SearchTip>

      <InputWrapper>
        <SearchInput
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || t('common.search')}
          autoFocus={autoFocus}
        />
        <SearchIconWrapper>
          {value && showClear && (
            <ClearButton onClick={handleClear} title="Suche löschen">
              <FaTimes />
            </ClearButton>
          )}
          <SearchIcon />
        </SearchIconWrapper>
      </InputWrapper>
    </SearchContainer>
  );
};

export default SearchBar;