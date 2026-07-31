import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppContainer, Header, HeaderInner, LogoSmall, UserAvatar, MainContent, BottomNav, BottomNavInner, NavItem, Toast } from './SharedStyles';
import { Home, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/send', icon: ArrowUpRight, label: 'Send' },
  { path: '/receive', icon: ArrowDownLeft, label: 'Receive' },
  { path: '/transactions', icon: Clock, label: 'History' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, notification } = useAuth();
  const navigate = useNavigate();

  return (
    <AppContainer>
      {notification && (
        <Toast $type={notification.type === 'error' ? 'error' : 'success'}>
          {notification.message}
        </Toast>
      )}

      <Header>
        <HeaderInner>
          <LogoSmall>
            <div className="icon">₹</div>
            <span>ApexUPI</span>
          </LogoSmall>
          <UserAvatar onClick={() => navigate('/profile')}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </UserAvatar>
        </HeaderInner>
      </Header>

      <MainContent>
        <Outlet />
      </MainContent>

      <BottomNav>
        <BottomNavInner>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <NavItem $active={isActive}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  <div className="nav-dot" />
                </NavItem>
              )}
            </NavLink>
          ))}
        </BottomNavInner>
      </BottomNav>
    </AppContainer>
  );
}
