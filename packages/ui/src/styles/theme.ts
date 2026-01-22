// Theme tokens
export const theme = {
  colors: {
    primary: '#478575',
    primaryLight: '#6ab8a8',
    primaryDark: '#3d7365',
    secondary: '#f6f7f7',
    backgroundLight: '#f6f7f7',
    backgroundDark: '#161c1b',
    text: '#131615',
    textLight: '#666666',
    white: '#ffffff',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
  }
};

// Common styles
export const glassPanel = `
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const glassPanelDark = `
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const scannerFrame = `
  border: 2px solid rgba(71, 133, 117, 0.5);
  box-shadow: 0 0 20px rgba(71, 133, 117, 0.2);
`;

// Care tag colors
export const careTagColors = {
  light: {
    full_sun: { bg: '#FFF3E0', text: '#E65100', icon: '☀️' },
    partial_sun: { bg: '#FFF8E1', text: '#FF8F00', icon: '🌤️' },
    partial_shade: { bg: '#E8F5E9', text: '#2E7D32', icon: '⛅' },
    full_shade: { bg: '#E3F2FD', text: '#1565C0', icon: '☁️' }
  },
  water: { bg: '#E3F2FD', text: '#1976D2', icon: '💧' },
  temperature: { bg: '#FFEBEE', text: '#C62828', icon: '🌡️' },
  difficulty: {
    easy: { bg: '#E8F5E9', text: '#2E7D32', icon: '🌱' },
    medium: { bg: '#FFF3E0', text: '#E65100', icon: '🌿' },
    hard: { bg: '#FFEBEE', text: '#C62828', icon: '🌳' }
  }
};
