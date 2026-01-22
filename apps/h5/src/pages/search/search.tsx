import Taro from '@tarojs/taro';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'reactimport { PlantCard, NoResultsState, LoadingSpinner } from '@plant-scanner/ui';
import './search.scss';

interface SearchResult {
  id: string;
  common_name: string;
  scientific_name: string;
  category: string;
  image_urls: string[];
  care_profile: {
    difficulty: string;
    light_requirement: string;
    water_frequency_days: number;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Auto-search on debounced query change
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      handleSearch(debouncedQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await Taro.request({
        url: `/api/search?q=${encodeURIComponent(searchQuery)}`,
        method: 'GET'
      });

      if (response.statusCode === 200 && response.data.success) {
        setResults(response.data.data || []);
      } else {
        setResults([]);
        Taro.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to plant detail/care guide
    Taro.navigateTo({
      url: `/pages/care-guide/index?species_id=${result.id}`
    });
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleFeedback = () => {
    Taro.showModal({
      title: '反馈识别结果',
      content: '您可以向我们反馈识别不准确的问题，帮助我们改进',
      confirmText: '提交反馈',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '感谢反馈！',
            icon: 'success'
          });
        }
      }
    });
  };

  return (
    <View className="search-page">
      {/* Header */}
      <View className="search__header">
        <View className="search__title-area">
          <Text className="search__title">搜索植物</Text>
        </View>
      </View>

      {/* Search input */}
      <View className="search__input-area">
        <View className="search__input-wrapper">
          <Text className="search__icon">🔍</Text>
          <Input
            className="search__input"
            placeholder="输入植物名称（如：龟背竹、绿萝）..."
            value={query}
            onInput={(e) => setQuery(e.detail.value)}
            focus
          />
          {query && (
            <View className="search__clear" onClick={handleClearSearch}>
              <Text>×</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="search__content" scrollY>
        {isLoading ? (
          <View className="search__loading">
            <LoadingSpinner text="搜索中..." />
          </View>
        ) : hasSearched ? (
          <>
            {results.length > 0 ? (
              <View className="search__results">
                <Text className="search__results-count">找到 {results.length} 个结果</Text>
                <View className="search__grid">
                  {results.map((result) => (
                    <View
                      key={result.id}
                      className="search__result-item"
                      onClick={() => handleResultClick(result)}
                    >
                      <Image
                        src={result.image_urls?.[0] || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200'}
                        mode="aspectFill"
                        className="search__result-image"
                      />
                      <View className="search__result-info">
                        <Text className="search__result-name">{result.common_name}</Text>
                        <Text className="search__result-scientific">
                          {result.scientific_name}
                        </Text>
                        <View className="search__result-tags">
                          <Text className="search__result-tag">
                            {result.care_profile?.difficulty === 'easy' ? '简单' :
                             result.care_profile?.difficulty === 'medium' ? '中等' : '困难'}
                          </Text>
                          <Text className="search__result-tag">
                            {result.care_profile?.water_frequency_days}天/浇水
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="search__empty">
                <NoResultsState
                  keyword={query}
                  onClear={handleClearSearch}
                />
                {/* Feedback for inaccurate recognition */}
                <View className="search__feedback" onClick={handleFeedback}>
                  <Text className="search__feedback-text">
                    识别结果不准确？
                  </Text>
                  <Text className="search__feedback-link">反馈问题</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          /* Initial state - search suggestions */
          <View className="search__suggestions">
            <Text className="search__suggestions-title">热门搜索</Text>
            <View className="search__suggestion-tags">
              {['龟背竹', '绿萝', '多肉', '吊兰', '虎皮兰', '发财树', '橡皮树', '琴叶榕'].map((tag) => (
                <View
                  key={tag}
                  className="search__suggestion-tag"
                  onClick={() => setQuery(tag)}
                >
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
