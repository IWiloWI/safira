import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import axios from 'axios';
import {
  Globe2, Wifi, Share2, Plus, X, Save, Eye, EyeOff,
  Instagram, Facebook, Twitter, Youtube, Linkedin, Github,
  MessageCircle, Send, Music, Video, Camera, MapPin,
  Phone, Mail, Link, Hash, AtSign, Users, Heart,
  ShoppingBag, Coffee, Home, Settings, Check, AlertCircle,
  Loader
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

interface WifiSettings {
  ssid: string;
  password: string;
  enabled: boolean;
}

interface SocialMedia {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

interface NavigationSettingsData {
  languages: Language[];
  wifi: WifiSettings;
  socialMedia: SocialMedia[];
}

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #FF41FB;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  font-family: 'Aldrich', sans-serif;
  font-size: 1.3rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const Card = styled.div<{ $active?: boolean }>`
  background: ${props => props.$active ?
    'linear-gradient(135deg, rgba(255, 65, 251, 0.1), rgba(255, 20, 147, 0.1))' :
    'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ?
      'linear-gradient(135deg, rgba(255, 65, 251, 0.15), rgba(255, 20, 147, 0.15))' :
      'rgba(255, 255, 255, 0.08)'};
  }
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const Flag = styled.span`
  font-size: 1.5rem;
`;

const CardText = styled.div`
  color: white;

  .name {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .code {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  width: 50px;
  height: 28px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '25px' : '3px'};
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InputField = styled.div`
  flex: 1;

  label {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props =>
    props.$variant === 'danger' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
    props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' :
    'linear-gradient(135deg, #FF41FB, #FF1493)'};
  border: 1px solid ${props =>
    props.$variant === 'danger' ? '#f44336' :
    props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.2)' :
    '#FF41FB'};
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px ${props =>
      props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' :
      props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' :
      'rgba(255, 65, 251, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 15px;

  canvas {
    display: block;
  }
`;

const SocialCard = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const SocialHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SocialIcon = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const AddButton = styled(Button)`
  width: 100%;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-style: dashed;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Alert = styled.div<{ $type: 'success' | 'error' | 'warning' }>`
  background: ${props =>
    props.$type === 'success' ? 'rgba(76, 175, 80, 0.1)' :
    props.$type === 'error' ? 'rgba(244, 67, 54, 0.1)' :
    'rgba(255, 193, 7, 0.1)'};
  border: 1px solid ${props =>
    props.$type === 'success' ? '#4CAF50' :
    props.$type === 'error' ? '#f44336' :
    '#FFC107'};
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'facebook', name: 'Facebook', icon: '👤' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌' },
  { id: 'discord', name: 'Discord', icon: '🎮' },
  { id: 'twitch', name: 'Twitch', icon: '🎮' },
  { id: 'spotify', name: 'Spotify', icon: '🎵' },
  { id: 'github', name: 'GitHub', icon: '💻' }
];

const availableLanguages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export const NavigationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NavigationSettingsData>({
    languages: availableLanguages.map(lang => ({
      ...lang,
      enabled: ['de', 'en', 'da', 'tr', 'it'].includes(lang.code)
    })),
    wifi: {
      ssid: 'Safira Lounge',
      password: 'Safira123',
      enabled: true
    },
    socialMedia: [
      { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/safiralounge', icon: '📸', enabled: true },
      { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/safiralounge', icon: '👤', enabled: true }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [qrCodeCanvas, setQrCodeCanvas] = useState<HTMLCanvasElement | null>(null);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Generate WiFi QR Code
  useEffect(() => {
    if (settings.wifi.enabled && qrCodeCanvas) {
      const wifiString = `WIFI:T:WPA;S:${settings.wifi.ssid};P:${settings.wifi.password};;`;
      QRCode.toCanvas(qrCodeCanvas, wifiString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [settings.wifi, qrCodeCanvas]);

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings/navigation');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.put('/api/settings/navigation', settings);
      if (response.data.success) {
        setAlert({ type: 'success', message: 'Einstellungen erfolgreich gespeichert!' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Fehler beim Speichern der Einstellungen!' });
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = async (code: string) => {
    const updatedLanguages = settings.languages.map(lang =>
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    );

    const language = updatedLanguages.find(l => l.code === code);

    // If enabling a new language, translate all content
    if (language?.enabled && !settings.languages.find(l => l.code === code)?.enabled) {
      setTranslating(true);
      try {
        await axios.post('/api/translate/all', { targetLanguage: code });
        setAlert({ type: 'success', message: `Alle Inhalte wurden nach ${language.name} übersetzt!` });
      } catch (error) {
        setAlert({ type: 'error', message: 'Fehler bei der Übersetzung!' });
      } finally {
        setTranslating(false);
      }
    }

    setSettings({ ...settings, languages: updatedLanguages });
  };

  const updateWifiSettings = (field: 'ssid' | 'password', value: string) => {
    setSettings({
      ...settings,
      wifi: { ...settings.wifi, [field]: value }
    });
  };

  const toggleWifi = () => {
    setSettings({
      ...settings,
      wifi: { ...settings.wifi, enabled: !settings.wifi.enabled }
    });
  };

  const addSocialMedia = () => {
    if (!newSocial.platform || !newSocial.url) {
      setAlert({ type: 'warning', message: 'Bitte alle Felder ausfüllen!' });
      return;
    }

    const platform = socialPlatforms.find(p => p.id === newSocial.platform);
    if (!platform) return;

    const newSocialMedia = {
      id: platform.id,
      name: platform.name,
      url: newSocial.url,
      icon: platform.icon,
      enabled: true
    };

    setSettings({
      ...settings,
      socialMedia: [...settings.socialMedia, newSocialMedia]
    });

    setNewSocial({ platform: '', url: '' });
    setShowAddSocial(false);
  };

  const updateSocialUrl = (id: string, url: string) => {
    setSettings({
      ...settings,
      socialMedia: settings.socialMedia.map(social =>
        social.id === id ? { ...social, url } : social
      )
    });
  };

  const toggleSocial = (id: string) => {
    setSettings({
      ...settings,
      socialMedia: settings.socialMedia.map(social =>
        social.id === id ? { ...social, enabled: !social.enabled } : social
      )
    });
  };

  const removeSocial = (id: string) => {
    setSettings({
      ...settings,
      socialMedia: settings.socialMedia.filter(social => social.id !== id)
    });
  };

  return (
    <Container>
      <Header>
        <Title>
          <Settings />
          Navigation Einstellungen
        </Title>
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? <Loader /> : <Save />}
          Speichern
        </Button>
      </Header>

      {alert && (
        <Alert $type={alert.type}>
          {alert.type === 'success' && <Check />}
          {alert.type === 'error' && <X />}
          {alert.type === 'warning' && <AlertCircle />}
          {alert.message}
        </Alert>
      )}

      {/* Languages Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Globe2 />
            Sprachen verwalten
          </SectionTitle>
        </SectionHeader>

        <Grid>
          {settings.languages.map(lang => (
            <Card key={lang.code} $active={lang.enabled}>
              <CardInfo>
                <Flag>{lang.flag}</Flag>
                <CardText>
                  <div className="name">{lang.name}</div>
                  <div className="code">{lang.code.toUpperCase()}</div>
                </CardText>
              </CardInfo>
              <Toggle
                $active={lang.enabled}
                onClick={() => toggleLanguage(lang.code)}
              />
            </Card>
          ))}
        </Grid>

        {settings.languages.filter(l => l.enabled).length === 0 && (
          <Alert $type="warning">
            <AlertCircle />
            Mindestens eine Sprache muss aktiviert sein!
          </Alert>
        )}
      </Section>

      {/* WiFi Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Wifi />
            WiFi Einstellungen
          </SectionTitle>
          <Toggle
            $active={settings.wifi.enabled}
            onClick={toggleWifi}
          />
        </SectionHeader>

        {settings.wifi.enabled && (
          <>
            <InputGroup>
              <InputField>
                <label>Netzwerkname (SSID)</label>
                <Input
                  type="text"
                  value={settings.wifi.ssid}
                  onChange={(e) => updateWifiSettings('ssid', e.target.value)}
                  placeholder="z.B. Safira Lounge"
                />
              </InputField>
              <InputField>
                <label>Passwort</label>
                <Input
                  type="text"
                  value={settings.wifi.password}
                  onChange={(e) => updateWifiSettings('password', e.target.value)}
                  placeholder="z.B. Safira123"
                />
              </InputField>
            </InputGroup>

            <QRCodeContainer>
              <canvas ref={setQrCodeCanvas} />
            </QRCodeContainer>
          </>
        )}
      </Section>

      {/* Social Media Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Share2 />
            Social Media verwalten
          </SectionTitle>
          <Button
            $variant="secondary"
            onClick={() => setShowAddSocial(true)}
          >
            <Plus />
            Hinzufügen
          </Button>
        </SectionHeader>

        <Grid>
          {settings.socialMedia.map(social => (
            <SocialCard key={social.id} $active={social.enabled}>
              <SocialHeader>
                <CardInfo>
                  <SocialIcon>{social.icon}</SocialIcon>
                  <CardText>
                    <div className="name">{social.name}</div>
                  </CardText>
                </CardInfo>
                <ButtonGroup>
                  <Toggle
                    $active={social.enabled}
                    onClick={() => toggleSocial(social.id)}
                  />
                  <Button
                    $variant="danger"
                    onClick={() => removeSocial(social.id)}
                    style={{ padding: '5px 10px' }}
                  >
                    <X size={16} />
                  </Button>
                </ButtonGroup>
              </SocialHeader>
              <Input
                type="url"
                value={social.url}
                onChange={(e) => updateSocialUrl(social.id, e.target.value)}
                placeholder="https://..."
              />
            </SocialCard>
          ))}

          {showAddSocial && (
            <SocialCard $active={false}>
              <select
                value={newSocial.platform}
                onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  width: '100%'
                }}
              >
                <option value="">Plattform wählen</option>
                {socialPlatforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.icon} {platform.name}
                  </option>
                ))}
              </select>
              <Input
                type="url"
                value={newSocial.url}
                onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                placeholder="https://..."
              />
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  onClick={addSocialMedia}
                  style={{ flex: 1 }}
                >
                  <Check />
                  Hinzufügen
                </Button>
                <Button
                  $variant="secondary"
                  onClick={() => {
                    setShowAddSocial(false);
                    setNewSocial({ platform: '', url: '' });
                  }}
                  style={{ flex: 1 }}
                >
                  <X />
                  Abbrechen
                </Button>
              </ButtonGroup>
            </SocialCard>
          )}
        </Grid>
      </Section>

      {/* Loading Overlay for Translations */}
      <AnimatePresence>
        {translating && (
          <LoadingOverlay>
            <LoadingContent>
              <Loader size={40} />
              <div style={{ color: 'white' }}>
                <h3>Übersetze Inhalte...</h3>
                <p>Dies kann einen Moment dauern</p>
              </div>
            </LoadingContent>
          </LoadingOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default NavigationSettings;