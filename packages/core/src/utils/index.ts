// Date formatting utilities
export const formatDate = (date: string | Date, format: 'full' | 'short' | 'time' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions =
    format === 'full'
      ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      : format === 'time'
      ? { hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return d.toLocaleDateString('zh-CN', options);
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor(absDiff / (1000 * 60));

  if (diff > 0) {
    if (days > 0) return `${days}天后`;
    if (hours > 0) return `${hours}小时后`;
    if (minutes > 0) return `${minutes}分钟后`;
    return '即将到期';
  } else {
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  }
};

export const getNextDueDate = (lastCompleted: string, frequencyDays: number): Date => {
  const last = new Date(lastCompleted);
  return new Date(last.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
};

// Image utilities
export const compressImage = async (
  file: File,
  maxSize: number = 1024,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Resize if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const getFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: 'image/jpeg' });
};

// Validation utilities
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Care profile helpers
export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return '#4CAF50';
    case 'medium':
      return '#FF9800';
    case 'hard':
      return '#F44336';
  }
};

export const getDifficultyText = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return '简单';
    case 'medium':
      return '中等';
    case 'hard':
      return '困难';
  }
};

export const getLightRequirementText = (
  requirement: 'full_sun' | 'partial_sun' | 'partial_shade' | 'full_shade'
): string => {
  switch (requirement) {
    case 'full_sun':
      return '全日照';
    case 'partial_sun':
      return '半日照';
    case 'partial_shade':
      return '半阴';
    case 'full_shade':
      return '阴凉';
  }
};

export const getLightRequirementIcon = (
  requirement: 'full_sun' | 'partial_sun' | 'partial_shade' | 'full_shade'
): string => {
  switch (requirement) {
    case 'full_sun':
      return '☀️';
    case 'partial_sun':
      return '🌤️';
    case 'partial_shade':
      return '⛅';
    case 'full_shade':
      return '☁️';
  }
};

// Task type helpers
export const getTaskTypeText = (type: CareTask['task_type']): string => {
  switch (type) {
    case 'water':
      return '浇水';
    case 'fertilize':
      return '施肥';
    case 'repot':
      return '换盆';
    case 'prune':
      return '修剪';
    case 'custom':
      return '自定义';
  }
};

export const getTaskTypeIcon = (type: CareTask['task_type']): string => {
  switch (type) {
    case 'water':
      return '💧';
    case 'fertilize':
      return '🧪';
    case 'repot':
      return '🪴';
    case 'prune':
      return '✂️';
    case 'custom':
      return '📋';
  }
};

// Status helpers
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return '#4CAF50';
    case 'needs_attention':
      return '#FF9800';
    case 'dying':
      return '#F44336';
    case 'completed':
      return '#2196F3';
    case 'pending':
      return '#9E9E9E';
    case 'overdue':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'healthy':
      return '健康';
    case 'needs_attention':
      return '需要关注';
    case 'dying':
      return '状态不佳';
    case 'completed':
      return '已完成';
    case 'pending':
      return '待处理';
    case 'overdue':
      return '已逾期';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};

// Confidence display
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

// URL helpers
export const buildApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  return `${baseUrl}${path}`;
};

// Local storage helpers with expiration
export const setCache = <T>(key: string, data: T, ttlMinutes: number = 60): void => {
  const item = {
    data,
    expires: Date.now() + ttlMinutes * 60 * 1000
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCache = <T>(key: string): T | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data as T;
  } catch {
    return null;
  }
};

export const clearCache = (key: string): void => {
  localStorage.removeItem(key);
};
