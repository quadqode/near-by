import { useNavigate, useLocation } from 'react-router-dom';
import { Map, List, Plus, User, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Props {
  view: 'map' | 'list';
  onViewChange: (v: 'map' | 'list') => void;
  onDropPin: () => void;
  onHelpOpen: () => void;
  activeFilters: number;
}

export default function BottomNav({ view, onViewChange, onDropPin, onHelpOpen, activeFilters }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfile = location.pathname === '/profile';

  const items = [
    {
      key: 'map',
      icon: Map,
      label: 'Map',
      active: view === 'map' && !isProfile,
      onClick: () => onViewChange('map'),
    },
    {
      key: 'list',
      icon: List,
      label: 'Explore',
      active: view === 'list' && !isProfile,
      onClick: () => onViewChange('list'),
    },
    {
      key: 'drop',
      icon: Plus,
      label: 'Drop Pin',
      active: false,
      isPrimary: true,
      onClick: onDropPin,
    },
    {
      key: 'help',
      icon: HelpCircle,
      label: 'Help',
      active: false,
      onClick: onHelpOpen,
    },
    {
      key: 'profile',
      icon: User,
      label: 'Profile',
      active: isProfile,
      onClick: () => navigate(user ? '/profile' : '/auth'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000] bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative',
              (item as any).isPrimary
                ? ''
                : item.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {(item as any).isPrimary ? (
              <div className="w-12 h-12 -mt-5 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <item.icon className="h-5 w-5" />
              </div>
            ) : (
              <div className="relative">
                <item.icon className="h-5 w-5" />
              </div>
            )}
            <span className={cn(
              'text-[10px] font-medium',
              (item as any).isPrimary ? 'text-primary font-semibold mt-0.5' : ''
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
