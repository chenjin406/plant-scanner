import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { useScanResult } from '@plant-scanner/core';
import './result.scss';

export default function ResultPage() {
  const { scan_id } = Taro.getCurrentInstance().router?.params || {};
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const { data: scanResponse, isLoading } = useScanResult(scan_id || '');
  const result = scanResponse?.data;

  useEffect(() => {
    if (result?.top_suggestion) {
      setSelectedSuggestion(result.top_suggestion);
    }
  }, [result]);

  const suggestion = selectedSuggestion || result?.top_suggestion;
  
  if (isLoading || !suggestion) {
    return <View className="result-page--loading"><Text>加载中...</Text></View>;
  }

  const confidence = Math.round(suggestion.confidence * 100);

  const handleAddToGarden = () => {
    Taro.navigateTo({
      url: `/pages/garden/add/index?species_id=${suggestion.species_id}`
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  const handleSearchAgain = () => {
    Taro.navigateBack();
  };

  return (
    <ScrollView className="result-page" scrollY>
      {/* Header Image */}
      <View className="result__header">
        <Image src={result.image_url} mode="aspectFill" className="result__image" />
        <View className="result__back" onClick={() => Taro.navigateBack()}>
          <Text>← 返回</Text>
        </View>
        <View className="result__share" onClick={handleShare}>
          <Text>📤</Text>
        </View>
      </View>

      {/* Plant Info */}
      <View className="result__content">
        <View className="result__info">
          <Text className="result__common-name">{suggestion.common_name}</Text>
          <Text className="result__scientific-name">{suggestion.scientific_name}</Text>

          {/* Confidence */}
          <View className="result__confidence">
            <View className="result__confidence-bar">
              <View className="result__confidence-fill" style={{ width: `${confidence}%` }}></View>
            </View>
            <Text className="result__confidence-text">匹配度 {confidence}%</Text>
          </View>

          {/* Care Tags */}
          <View className="result__care-tags">
            <View className="result__tag">
              <Text>☀️</Text>
              <Text>半阴</Text>
            </View>
            <View className="result__tag">
              <Text>💧</Text>
              <Text>7天/次</Text>
            </View>
            <View className="result__tag">
              <Text>🌱</Text>
              <Text>简单</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="result__section">
          <Text className="result__section-title">植物简介</Text>
          <Text className="result__description">{suggestion.description}</Text>
        </View>

        {/* Other Suggestions */}
        {result.all_suggestions.length > 1 && (
          <View className="result__section">
            <Text className="result__section-title">其他可能</Text>
            {result.all_suggestions.slice(1).map((s: any, index: number) => (
              <View
                key={s.species_id}
                className={`result__suggestion ${selectedSuggestion?.species_id === s.species_id ? 'result__suggestion--active' : ''}`}
                onClick={() => setSelectedSuggestion(s)}
              >
                <Text className="result__suggestion-rank">{index + 2}</Text>
                <View className="result__suggestion-info">
                  <Text className="result__suggestion-name">{s.common_name}</Text>
                  <Text className="result__suggestion-scientific">{s.scientific_name}</Text>
                </View>
                <Text className="result__suggestion-confidence">{Math.round(s.confidence * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Not This Plant */}
        <View className="result__not-this" onClick={handleSearchAgain}>
          <Text>不是 {suggestion.common_name}？</Text>
          <Text className="result__not-this-link">手动搜索</Text>
        </View>

        {/* Add to Garden Button */}
        <Button className="result__btn" onClick={handleAddToGarden}>
          加入我的花园
        </Button>
      </View>
    </ScrollView>
  );
}
