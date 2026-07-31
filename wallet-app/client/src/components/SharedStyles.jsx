import styled, { createGlobalStyle, keyframes } from 'styled-components';

// ==================== ANIMATIONS ====================
export const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ==================== COLORS ====================
export const colors = {
  primary: '#0070ba',
  primaryDark: '#003087',
  primaryLight: '#e1f0ff',
  secondary: '#00b900',
  accent: '#0070ba',
  danger: '#de3535',
  dangerLight: '#fff0f0',
  warning: '#f5a623',
  success: '#00b900',
  successLight: '#f0fff4',
  text: '#1a1a2e',
  textSecondary: '#6c757d',
  textLight: '#9ca3af',
  bg: '#f5f7fa',
  white: '#ffffff',
  card: '#ffffff',
  border: '#e1e4e8',
  borderLight: '#f0f0f0',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowHover: 'rgba(0, 0, 0, 0.12)',
};

// ==================== AUTH PAGES ====================
export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 50%, #009cde 100%);
  padding: 20px;
`;

export const AuthCard = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.5s ease-out;
`;

export const AuthLogo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary});
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: white;
    font-size: 24px;
    font-weight: 800;
  }
  
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: ${colors.primaryDark};
    margin-bottom: 4px;
  }
  
  p {
    color: ${colors.textSecondary};
    font-size: 14px;
  }
`;

export const FormField = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: ${colors.text};
    margin-bottom: 6px;
  }
  
  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${colors.border};
    border-radius: 12px;
    font-size: 15px;
    color: ${colors.text};
    transition: all 0.2s;
    background: ${colors.bg};
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      background: ${colors.white};
      box-shadow: 0 0 0 3px ${colors.primaryLight};
    }
    
    &::placeholder {
      color: ${colors.textLight};
    }
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary});
    color: white;
    box-shadow: 0 4px 12px rgba(0, 112, 186, 0.3);
    
    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(0, 112, 186, 0.4);
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: ${colors.bg};
    color: ${colors.text};
    border: 2px solid ${colors.border};
    
    &:hover:not(:disabled) {
      border-color: ${colors.primary};
      color: ${colors.primary};
    }
  `}
  
  ${props => props.$variant === 'danger' && `
    background: ${colors.danger};
    color: white;
    
    &:hover:not(:disabled) {
      background: #c42d2d;
    }
  `}
`;

export const AuthLink = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: ${colors.textSecondary};
  
  a {
    color: ${colors.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ErrorMsg = styled.div`
  background: ${colors.dangerLight};
  color: ${colors.danger};
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid rgba(222, 53, 53, 0.2);
`;

// ==================== APP LAYOUT ====================
export const AppContainer = styled.div`
  min-height: 100vh;
  background: ${colors.bg};
`;

export const Header = styled.header`
  background: ${colors.white};
  border-bottom: 1px solid ${colors.borderLight};
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 40;
`;

export const HeaderInner = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LogoSmall = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary});
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: 14px;
  }
  
  span {
    font-size: 18px;
    font-weight: 700;
    color: ${colors.primaryDark};
  }
`;

export const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary}, #009cde);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
`;

export const MainContent = styled.main`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 90px;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.white};
  border-top: 1px solid ${colors.borderLight};
  z-index: 40;
`;

export const BottomNavInner = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
`;

export const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  
  color: ${props => props.$active ? colors.primary : colors.textLight};
  
  .nav-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${colors.primary};
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.2s;
  }
  
  span {
    font-size: 10px;
    font-weight: 600;
  }
`;

// ==================== CARDS ====================
export const Card = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${colors.borderLight};
  box-shadow: 0 2px 8px ${colors.shadow};
  transition: all 0.2s;
  
  ${props => props.$hoverable && `
    &:hover {
      box-shadow: 0 4px 16px ${colors.shadowHover};
      border-color: ${colors.border};
    }
  `}
`;

export const BalanceCard = styled.div`
  background: linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 60%, #009cde 100%);
  border-radius: 20px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -40%;
    left: -20%;
    width: 160px;
    height: 160px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 50%;
  }
`;

// ==================== NOTIFICATION ====================
export const Toast = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  animation: ${slideUp} 0.3s ease-out;
  
  background: ${props => props.$type === 'error' ? colors.danger : colors.success};
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ==================== SECTION ====================
export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: ${colors.text};
  }
  
  a, button {
    font-size: 13px;
    font-weight: 600;
    color: ${colors.primary};
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// ==================== EMPTY STATE ====================
export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.text};
    margin-bottom: 8px;
  }
  
  p {
    color: ${colors.textSecondary};
    font-size: 14px;
  }
`;
