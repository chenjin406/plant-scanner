import { View, Text } from '@tarojs/components';
import './BottomNavigation.scss';

export type NavItem = {
  key: string;
  label: string;
  icon: string;
  activeIcon?: string;
};

interface BottomNavigationProps {
  items: NavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  isFloat?: boolean;
}

const defaultIcons: Record<string, { inactive: string; active: string }> = {
  home: { inactive: '🏠', active: '🏡' },
  scan: { inactive: '📷', active: '📸' },
  garden: { inactive: '🌿', active: '🌳' },
  guide: { inactive: '📖', active: '📚' },
  settings: { inactive: '⚙️', active: '🔧' }
};

export function BottomNavigation({ items, activeKey, onChange, isFloat = false }: BottomNavigationProps) {
  const handleClick = (key: string) => {
    onChange(key);
  };

  return (
    <View className={`bottom-nav ${isFloat ? 'bottom-nav--float' : ''}`}>
      {items.map((item) => {
        const icons = defaultIcons[item.key] || { inactive: item.icon, active: item.activeIcon || item.icon };
        const isActive = item.key === activeKey;

        return (
          <View
            key={item.key}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
            onClick={() => handleClick(item.key)}
          >
            <Text className="bottom-nav__icon">{isActive ? icons.active : icons.inactive}</Text>
            <Text className={`bottom-nav__label ${isActive ? 'bottom-nav__label--active' : ''}`}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Simplified version with icons passed directly
interface SimpleBottomNavProps {
  items: Array<{
    key: string;
    label: string;
    icon: string;
    badge?: number;
  }>;
  activeKey: string;
  onChange: (key: string) => void;
}

export function SimpleBottomNav({ items, activeKey, onChange }: SimpleBottomNavProps) {
  return (
    <View className="simple-bottom-nav">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <View
            key={item.key}
            className={`simple-bottom-nav__item ${isActive ? 'simple-bottom-nav__item--active' : ''}`}
            onClick={() => onChange(item.key)}
          >
            <View className="simple-bottom-nav__icon-wrapper">
              <Text className="simple-bottom-nav__icon">{item.icon}</Text>
              {item.badge && item.badge > 0 && (
                <View className="simple-bottom-nav__badge">
                  <Text>{item.badge > 99 ? '99+' : item.badge}</Text>
                </View>
              )}
            </View>
            <Text className={`simple-bottom-nav__label ${isActive ? 'simple-bottom-nav__label--active' : ''}`}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
