import Taro from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { usePlantSearch } from '@plant-scanner/core';
import './search.scss';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: searchResponse, isLoading } = usePlantSearch(debouncedQuery);
  const results = searchResponse?.data || [];
  const hasSearched = debouncedQuery.length >= 2;

  const popularSearches = ['龟背竹', '绿萝', '多肉', '吊兰', '虎皮兰'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultPress = (result: any) => {
    Taro.navigateTo({
      url: `/pages/care-guide/index?species_id=${result.id}`
    });
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <View className="search-page">
      {/* Header */}
      <View className="search__header">
        <Text className="search__title">搜索植物</Text>
      </View>

      {/* Search Input */}
      <View className="search__input-area">
        <View className="search__input-wrapper">
          <Text className="search__icon">🔍</Text>
          <Input
            className="search__input"
            placeholder="输入植物名称..."
            value={query}
            onInput={(e: any) => setQuery(e.detail.value)}
          />
          {query && (
            <View className="search__clear" onClick={handleClear}>
              <Text>×</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="search__content" scrollY>
        {isLoading ? (
          <View className="search__loading">
            <Text>搜索中...</Text>
          </View>
        ) : hasSearched ? (
          <>
            {results.length > 0 ? (
              <View className="search__results">
                <Text className="search__results-count">找到 {results.length} 个结果</Text>
                {results.map((result: any) => (
                  <View key={result.id} className="search__result-item" onClick={() => handleResultPress(result)}>
                    <View className="search__result-icon">🌿</View>
                    <View className="search__result-info">
                      <Text className="search__result-name">{result.common_name}</Text>
                      <Text className="search__result-scientific">{result.scientific_name}</Text>
                    </View>
                    <Text className="search__result-arrow">›</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="search__empty">
                <Text className="search__empty-icon">🔍</Text>
                <Text className="search__empty-title">未找到相关植物</Text>
                <Text className="search__empty-hint">没有找到包含 "{query}" 的植物</Text>
              </View>
            )}
          </>
        ) : (
          /* Popular Searches */
          <View className="search__suggestions">
            <Text className="search__suggestions-title">热门搜索</Text>
            <View className="search__suggestion-tags">
              {popularSearches.map(tag => (
                <View key={tag} className="search__suggestion-tag" onClick={() => setQuery(tag)}>
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
