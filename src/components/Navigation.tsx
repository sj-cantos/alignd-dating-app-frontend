'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageSquare, Users, User, LogOut } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const navItems: NavItem[] = [
  {
    path: '/discover',
    label: 'DISCOVER',
    icon: <Heart size={20} />,
    color: 'from-pink-400 to-red-400',
  },
  {
    path: '/matches',
    label: 'MATCHES',
    icon: <Users size={20} />,
    color: 'from-purple-400 to-pink-400',
  },
  {
    path: '/messages',
    label: 'MESSAGES',
    icon: <MessageSquare size={20} />,
    color: 'from-blue-400 to-purple-400',
  },
  {
    path: '/profile',
    label: 'PROFILE',
    icon: <User size={20} />,
    color: 'from-green-400 to-blue-400',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Don't show navigation on auth pages or setup pages
  if (pathname === '/auth' || pathname === '/setup' || pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="mt-4 hidden md:block bg-pink-500 border-b-brutal border-border shadow-brutal sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer transform hover:rotate-0 transition-transform duration-200"
              onClick={() => router.push('/discover')}
            >
              <div className="bg-gradient-to-r from-primary to-pink-bright text-white px-4 py-2 border-brutal border-border shadow-brutal-sm font-black text-xl">
                💘 ALIGND
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`
                      relative px-4 py-2 border-brutal border-border font-black text-sm
                      shadow-brutal-sm hover:shadow-brutal
                      transition-all duration-200 transform hover:scale-105
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary border-2 border-border rounded-full"></div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <div className="bg-secondary px-3 py-1 border-2 border-border shadow-brutal-sm transform rotate-1">
                  <span className="font-black text-secondary-foreground text-sm">
                    Hey {user?.name?.split(' ')[0] || 'User'}!
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black transform hover:rotate-0"
              >
                <LogOut size={16} className="mr-2" />
                LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t-brutal border-border shadow-brutal z-50">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg font-bold text-xs
                  transition-all duration-200 transform min-w-[60px]
                  ${isActive 
                    ? 'text-primary bg-primary/10 scale-110 shadow-brutal-sm border-2 border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105'
                  }
                `}
              >
                <div className={`${isActive ? 'scale-125' : ''} transition-transform duration-200`}>
                  {item.icon}
                </div>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
          
          {/* Logout button for mobile */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-3 rounded-lg font-bold text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-all duration-200 transform hover:scale-105 min-w-[60px]"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>
    </>
  );
}