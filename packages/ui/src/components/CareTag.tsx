import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './CareTag.scss';

interface CareTagProps {
  type: 'light' | 'water' | 'temperature' | 'difficulty';
  value: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Light requirement values
const lightValues = ['full_sun', 'partial_sun', 'partial_shade', 'full_shade'] as const;

// Difficulty values
const difficultyValues = ['easy', 'medium', 'hard'] as const;

const lightIcons: Record<string, string> = {
  full_sun: '☀️',
  partial_sun: '🌤️',
  partial_shade: '⛅',
  full_shade: '☁️'
};

const lightTexts: Record<string, string> = {
  full_sun: '全日照',
  partial_sun: '半日照',
  partial_shade: '半阴',
  full_shade: '阴凉'
};

const difficultyTexts: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
};

export function CareTag({ type, value, showIcon = true, size = 'md', className = '' }: CareTagProps) {
  const getColor = () => {
    switch (type) {
      case 'light':
        if (lightValues.includes(value as typeof lightValues[number])) {
          switch (value) {
            case 'full_sun': return { bg: '#FFF3E0', text: '#E65100' };
            case 'partial_sun': return { bg: '#FFF8E1', text: '#FF8F00' };
            case 'partial_shade': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'full_shade': return { bg: '#E3F2FD', text: '#1565C0' };
          }
        }
        return { bg: '#f5f5f5', text: '#666' };
      case 'water':
        return { bg: '#E3F2FD', text: '#1976D2' };
      case 'temperature':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'difficulty':
        if (difficultyValues.includes(value as typeof difficultyValues[number])) {
          switch (value) {
            case 'easy': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'medium': return { bg: '#FFF3E0', text: '#E65100' };
            case 'hard': return { bg: '#FFEBEE', text: '#C62828' };
          }
        }
        return { bg: '#f5f5f5', text: '#666' };
      default:
        return { bg: '#f5f5f5', text: '#666' };
    }
  };

  const getDisplayText = () => {
    if (type === 'light') {
      return lightTexts[value] || value;
    }
    if (type === 'difficulty') {
      return difficultyTexts[value] || value;
    }
    return value;
  };

  const getIcon = () => {
    if (!showIcon) return null;
    if (type === 'light') {
      return lightIcons[value] || '☀️';
    }
    if (type === 'water') return '💧';
    if (type === 'temperature') return '🌡️';
    if (type === 'difficulty') return '🌱';
    return null;
  };

  const colors = getColor();
  const icon = getIcon();
  const displayText = getDisplayText();

  const sizeClasses = {
    sm: 'care-tag--sm',
    md: 'care-tag--md',
    lg: 'care-tag--lg'
  };

  return (
    <View
      className={`care-tag ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {icon && <Text className="care-tag__icon">{icon}</Text>}
      <Text className="care-tag__text">{displayText}</Text>
    </View>
  );
}
