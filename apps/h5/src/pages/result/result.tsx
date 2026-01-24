import Taro from '@tarojs/taro';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { CareTag } from '@plant-scanner/ui';
import { useScanResult } from '@plant-scanner/core';
import './result.scss';

interface Suggestion {
  species_id: string;
  common_name: string;
  scientific_name: string;
  confidence: number;
  care_profile?: any;
  description?: string;
  image_url?: string;
}

interface ResultData {
  scan_id: string;
  top_suggestion: Suggestion;
  all_suggestions: Suggestion[];
  image_url: string;
}

export default function ResultPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { scan_id } = Taro.getCurrentInstance().router?.params || {};
  const { data: scanResponse, isLoading } = useScanResult(scan_id || '');
  const result = scanResponse?.data;

  useEffect(() => {
    if (result?.top_suggestion) {
      setSelectedSuggestion(result.top_suggestion);
    }
  }, [result]);

  const handleNavigate = (url?: string) => {
    if (url) {
      Taro.navigateTo({ url });
      return;
    }

    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  const handleAddToGarden = () => {
    Taro.showModal({
      title: '加入我的花园',
      content: '确定要将此植物加入花园吗？',
      success: (res) => {
        if (res.confirm) {
          handleNavigate('/pages/garden/garden');
        }
      }
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    });
  };

  const handleSearchAgain = () => {
    handleNavigate('/pages/search/search');
  };

  const confidencePercent = Math.round((selectedSuggestion?.confidence || 0) * 100);
  const careProfile = selectedSuggestion?.care_profile;

  return (
    <View className="result-page">
      <View className="result__topbar">
        <View className="result__back" onClick={() => Taro.navigateBack()}>
          <Text>←</Text>
        </View>
        <Text className="result__title">识别结果</Text>
        <View className="result__share" onClick={handleShare}>
          <Text>📤</Text>
        </View>
      </View>

      <ScrollView className="result__content" scrollY>
        <View className="result__hero">
          <Image
            src={result.image_url}
            mode="aspectFill"
            className="result__hero-image"
          />
          <View className="result__hero-overlay"></View>
        </View>

        <View className="result__summary">
          <Text className="result__common-name">{selectedSuggestion?.common_name}</Text>
          <Text className="result__scientific-name">{selectedSuggestion?.scientific_name}</Text>
          <View className="result__confidence">
            <View className="result__confidence-bar">
              <View
                className="result__confidence-fill"
                style={{ width: `${confidencePercent}%` }}
              ></View>
            </View>
            <Text className="result__confidence-text">{confidencePercent}% 匹配</Text>
          </View>
        </View>

        {/* Care tags */}
        {careProfile && (
          <View className="result__care-tags">
            <CareTag type="light" value={careProfile.light_requirement} showIcon />
            <CareTag type="water" value={`每${careProfile.water_frequency_days}天`} showIcon />
            <CareTag type="difficulty" value={careProfile.difficulty} showIcon />
            {careProfile.temperature_min_c && (
              <CareTag
                type="temperature"
                value={`${careProfile.temperature_min_c}-${careProfile.temperature_max_c}°C`}
                showIcon
              />
            )}
          </View>
        )}

        {/* Description */}
        <View className="result__description">
          <Text className="result__description-title">植物简介</Text>
          <Text className="result__description-text">
            {showFullDescription
              ? selectedSuggestion?.description
              : selectedSuggestion?.description?.slice(0, 100) + '...'}
          </Text>
          {selectedSuggestion?.description && selectedSuggestion.description.length > 100 && (
            <Text
              className="result__description-more"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? '收起' : '查看更多'}
            </Text>
          )}
        </View>

        {/* Other suggestions */}
        {result.all_suggestions.length > 1 && (
          <View className="result__suggestions">
            <Text className="result__suggestions-title">其他可能</Text>
            {result.all_suggestions.slice(1).map((suggestion: any, index: number) => (
              <View
                key={suggestion.species_id}
                className={`result__suggestion ${selectedSuggestion?.species_id === suggestion.species_id ? 'result__suggestion--active' : ''}`}
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <Text className="result__suggestion-rank">{index + 2}</Text>
                <View className="result__suggestion-info">
                  <Text className="result__suggestion-name">{suggestion.common_name}</Text>
                  <Text className="result__suggestion-scientific">{suggestion.scientific_name}</Text>
                </View>
                <Text className="result__suggestion-confidence">
                  {Math.round(suggestion.confidence * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Expert tips */}
        {careProfile?.expert_tips && careProfile.expert_tips.length > 0 && (
          <View className="result__tips">
            <Text className="result__tips-title">💡 养护小贴士</Text>
            {careProfile.expert_tips.map((tip: string, index: number) => (
              <View key={index} className="result__tip">
                <Text className="result__tip-bullet">•</Text>
                <Text className="result__tip-text">{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Not this plant? */}
        <View className="result__not-this" onClick={handleSearchAgain}>
          <Text>这不是 {selectedSuggestion?.common_name}？</Text>
          <Text className="result__not-this-link">手动搜索</Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="result__cta">
        <Button className="result__btn result__btn--primary" onClick={handleAddToGarden}>
          加入我的花园
        </Button>
      </View>
    </View>
  );
}
