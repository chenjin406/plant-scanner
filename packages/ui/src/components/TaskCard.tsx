import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Checkbox } from '@nutui/nutui-react-taro';
import './TaskCard.scss';

interface TaskCardProps {
  task: {
    id: string;
    type: 'water' | 'fertilize' | 'repot' | 'prune' | 'custom';
    custom_name?: string;
    plant_name: string;
    plant_image?: string;
    due_at: string;
    is_completed: boolean;
    is_overdue: boolean;
    onComplete?: (id: string) => void;
  };
  onCheck?: (checked: boolean) => void;
  className?: string;
}

const taskIcons: Record<string, string> = {
  water: '💧',
  fertilize: '🧪',
  repot: '🪴',
  prune: '✂️',
  custom: '📋'
};

const taskLabels: Record<string, string> = {
  water: '浇水',
  fertilize: '施肥',
  repot: '换盆',
  prune: '修剪',
  custom: '自定义'
};

export function TaskCard({ task, onCheck, className = '' }: TaskCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const handleCheck = (checked: boolean) => {
    onCheck?.(checked);
  };

  return (
    <View className={`task-card ${task.is_completed ? 'task-card--completed' : ''} ${task.is_overdue ? 'task-card--overdue' : ''} ${className}`}>
      <View className="task-card__checkbox">
        <Checkbox
          checked={task.is_completed}
          onChange={handleCheck}
          shape="round"
        />
      </View>

      <View className="task-card__icon">
        <Text>{taskIcons[task.type] || '📋'}</Text>
      </View>

      <View className="task-card__content">
        <View className="task-card__header">
          <Text className="task-card__plant">{task.plant_name}</Text>
          <Text className="task-card__task-type">{taskLabels[task.type] || task.custom_name || '任务'}</Text>
        </View>
        <Text className={`task-card__due ${task.is_overdue ? 'task-card__due--overdue' : ''}`}>
          {task.is_overdue ? '已逾期' : '截止'}：{formatDate(task.due_at)}
        </Text>
      </View>

      {task.is_overdue && !task.is_completed && (
        <View className="task-card__warning">
          <Text>⚠️</Text>
        </View>
      )}
    </View>
  );
}
