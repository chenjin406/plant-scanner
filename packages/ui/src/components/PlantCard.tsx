import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { Badge, Avatar } from '@nutui/nutui-react-taro';
import { ViewProps } from '@tarojs/components';
import './PlantCard.scss';

interface PlantCardProps extends ViewProps {
  plant: {
    id: string;
    nickname: string;
    species_name?: string;
    status: string;
    location_type: 'indoor' | 'outdoor';
    image_url?: string;
    next_task?: {
      type: string;
      due_at: string;
    };
  };
  onClick?: () => void;
}

export function PlantCard({ plant, onClick, className = '', ...props }: PlantCardProps) {
  const statusColors: Record<string, string> = {
    healthy: '#4CAF50',
    needs_attention: '#FF9800',
    dying: '#F44336',
  };

  const statusTexts: Record<string, string> = {
    healthy: '健康',
    needs_attention: '需关注',
    dying: '状态不佳',
  };

  const taskIcons: Record<string, string> = {
    water: '💧',
    fertilize: '🧪',
    repot: '🪴',
    prune: '✂️',
  };

  return (
    <View className={`plant-card ${className}`} onClick={onClick} {...props}>
      <View className="plant-card__image-wrapper">
        {plant.image_url ? (
          <Image
            src={plant.image_url}
            mode="aspectFill"
            className="plant-card__image"
            alt={plant.nickname}
          />
        ) : (
          <View className="plant-card__image plant-card__image--placeholder">
            <Text className="plant-card__placeholder-icon">🌿</Text>
          </View>
        )}
        <Badge
          value={statusTexts[plant.status] || plant.status}
          fill="solid"
          style={{
            backgroundColor: statusColors[plant.status] || '#9E9E9E',
            position: 'absolute',
            top: '8px',
            right: '8px',
          }}
        />
      </View>

      <View className="plant-card__content">
        <View className="plant-card__header">
          <Text className="plant-card__name">{plant.nickname}</Text>
          <Text className="plant-card__location">
            {plant.location_type === 'indoor' ? '室内' : '室外'}
          </Text>
        </View>

        {plant.species_name && <Text className="plant-card__species">{plant.species_name}</Text>}

        {plant.next_task && (
          <View className="plant-card__task">
            <Text className="plant-card__task-icon">{taskIcons[plant.next_task.type] || '📋'}</Text>
            <Text className="plant-card__task-text">
              下次
              {plant.next_task.type === 'water'
                ? '浇水'
                : plant.next_task.type === 'fertilize'
                  ? '施肥'
                  : plant.next_task.type === 'repot'
                    ? '换盆'
                    : plant.next_task.type === 'prune'
                      ? '修剪'
                      : '护理'}
              ：{plant.next_task.due_at}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
