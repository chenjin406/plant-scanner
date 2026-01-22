import Taro from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import './EmptyState.scss';

interface EmptyStateProps {
  image?: string;
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const defaultImages: Record<string, string> = {
  noPlants: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
  noResults: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200',
  noTasks: 'https://images.unsplash.com/photo-1464454709-69171b831d89?w=200',
  error: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200'
};

export function EmptyState({
  image,
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const displayImage = image || defaultImages.noPlants;

  return (
    <View className="empty-state">
      {icon ? (
        <Text className="empty-state__icon">{icon}</Text>
      ) : (
        <Image
          src={displayImage}
          mode="aspectFit"
          className="empty-state__image"
          alt={title}
        />
      )}

      <Text className="empty-state__title">{title}</Text>

      {description && (
        <Text className="empty-state__description">{description}</Text>
      )}

      {actionLabel && onAction && (
        <Button className="empty-state__action" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

// Garden-specific empty state
interface GardenEmptyStateProps {
  onAddPlant: () => void;
}

export function GardenEmptyState({ onAddPlant }: GardenEmptyStateProps) {
  return (
    <EmptyState
      icon="🌱"
      title="你的花园还是空的"
      description="添加第一株植物，开始你的养护之旅"
      actionLabel="添加植物"
      onAction={onAddPlant}
    />
  );
}

// No results empty state
interface NoResultsStateProps {
  keyword: string;
  onClear: () => void;
}

export function NoResultsState({ keyword, onClear }: NoResultsStateProps) {
  return (
    <EmptyState
      icon="🔍"
      title="未找到相关植物"
      description={`没有找到包含"${keyword}"的植物，请尝试其他关键词`}
      actionLabel="清除搜索"
      onAction={onClear}
    />
  );
}
