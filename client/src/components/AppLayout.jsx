import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footer } from './Footer';
import {
  ShieldAlert,
  Home as HomeIcon,
  PlusCircle,
  Search,
  Layers,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User,
} from 'lucide-react';

export const AppLayout = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDrawerOpen(false);
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent text-on-accent font-semibold shadow-sm'
        : 'text-on-dark hover:bg-accent/15 hover:text-on-dark'
    }`;

  // Navigation items grouped by role
  const getNavSections = () => {
    if (isAdmin) {
      return [
        {
          label: 'Admin',
          items: [
            { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/complaints', label: 'Complaints', icon: Layers },
          ],
        },
        {
          label: 'Campus',
          items: [
            { to: '/public', label: 'Public Board', icon: Search },
          ],
        },
      ];
    }

    if (isStudent) {
      return [
        {
          label: 'Main',
          items: [
            { to: '/', label: 'Home', icon: HomeIcon },
            { to: '/submit', label: 'File a Complaint', icon: PlusCircle },
            { to: '/track', label: 'Track a Complaint', icon: Search },
            { to: '/public', label: 'Public Board', icon: Layers },
          ],
        },
        {
          label: 'My Account',
          items: [
            { to: '/my-complaints', label: 'My Complaints', icon: ClipboardList },
          ],
        },
      ];
    }

    // Visitor
    return [
      {
        label: 'Main',
        items: [
          { to: '/', label: 'Home', icon: HomeIcon },
          { to: '/submit', label: 'File a Complaint', icon: PlusCircle },
          { to: '/track', label: 'Track a Complaint', icon: Search },
          { to: '/public', label: 'Public Board', icon: Layers },
        ],
      },
      {
        label: 'Account',
        items: [
          { to: '/login', label: 'Login', icon: LogIn },
          { to: '/register', label: 'Register', icon: UserPlus },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-sidebar-bg text-on-dark">
      {/* Brand Header */}
      <div className="p-4 border-b border-border/20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 min-h-[44px]">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-on-primary shadow-sm flex-shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-tight text-on-dark">
              Campus Complaints
            </span>
            <span className="text-[10px] text-on-dark/70 uppercase tracking-wider font-semibold">
              Accountability Portal
            </span>
          </div>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="md:hidden p-2 rounded-md text-on-dark/80 hover:text-on-dark hover:bg-accent/15 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Nav Items List */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-on-dark/60">
              {section.label}
            </div>
            <ul className="space-y-1 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={navItemClass}
                      aria-current={location.pathname === item.to ? 'page' : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User / Session Footer */}
      <div className="p-3 border-t border-border/20 bg-sidebar-bg">
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-2 py-1.5">
              <div className="h-9 w-9 rounded-full bg-accent text-on-accent flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                <User className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-on-dark truncate">{user.name}</div>
                <div className="text-[10px] text-on-dark/70 capitalize truncate">
                  {user.role} {user.department ? `• ${user.department}` : ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 min-h-[44px] rounded-md text-xs font-semibold text-on-dark hover:bg-danger hover:text-on-dark transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="px-2 py-1 text-center">
            <div className="text-[11px] text-on-dark/70">Browsing as Anonymous Visitor</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-overlay focus:px-4 focus:py-2.5 focus:bg-accent focus:text-on-accent focus:font-bold focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Slim Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-sidebar bg-sidebar-bg text-on-dark px-4 py-2.5 flex items-center justify-between border-b border-border/20 shadow-sm">
        <Link to="/" className="flex items-center space-x-2 min-h-[44px]">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-on-primary">
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm text-on-dark">Campus Complaints</span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-on-dark hover:bg-accent/15"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-sidebar-bg/60 backdrop-blur-sm z-overlay md:hidden transition-opacity"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] z-overlay md:hidden transform transition-transform duration-200 ease-in-out shadow-md ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent()}
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 z-sidebar shadow-md">
        {renderNavContent()}
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex-1 flex flex-col min-h-screen bg-bg">
        <main id="main-content" className="flex-1 w-full" tabIndex="-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
