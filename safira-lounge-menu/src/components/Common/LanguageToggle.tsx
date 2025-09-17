import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

const ToggleContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const LanguageButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})<{ active: boolean }>`
  padding: 8px 16px;
  background: ${props => props.active ? '#FF41FB' : 'transparent'};
  border: 2px solid #FF41FB;
  border-radius: 20px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#FF41FB' : 'rgba(255, 65, 251, 0.2)'};
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.5);
  }
`;

const FlagIcon = styled.span`
  margin-right: 5px;
  font-size: 16px;
`;

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'da', label: 'DA', flag: '🇩🇰' },
    { code: 'en', label: 'EN', flag: '🇬🇧' }
  ];

  return (
    <ToggleContainer>
      {languages.map(lang => (
        <LanguageButton
          key={lang.code}
          active={language === lang.code}
          onClick={() => setLanguage(lang.code as 'de' | 'da' | 'en')}
        >
          <FlagIcon>{lang.flag}</FlagIcon>
          {lang.label}
        </LanguageButton>
      ))}
    </ToggleContainer>
  );
};

export default LanguageToggle;