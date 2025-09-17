import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(15px);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const LoginTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 30px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF41FB;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 12px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #FF41FB;
  }
`;

const LoginButton = styled(motion.button)`
  padding: 15px 30px;
  background: linear-gradient(135deg, #FF41FB, #ff21f5);
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 20px rgba(255, 65, 251, 0.4);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff4444;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  margin-top: 10px;
  text-align: center;
`;

const HelpText = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-top: 20px;
  line-height: 1.4;
`;

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError(t('errors.invalidCredentials'));
      }
    } catch (err) {
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LoginTitle>{t('admin.title')}</LoginTitle>
      
      <LoginForm onSubmit={handleSubmit}>
        <InputGroup>
          <InputIcon>
            <FaUser />
          </InputIcon>
          <Input
            type="text"
            placeholder={t('admin.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <InputIcon>
            <FaLock />
          </InputIcon>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('admin.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordToggle
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </PasswordToggle>
        </InputGroup>

        <LoginButton
          type="submit"
          disabled={loading || !username || !password}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Anmelden...' : t('admin.login')}
        </LoginButton>
      </LoginForm>

      {error && (
        <ErrorMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </ErrorMessage>
      )}

      <HelpText>
        Für Zugang wenden Sie sich an den Administrator.
      </HelpText>
    </LoginCard>
  );
};

export default AdminLogin;