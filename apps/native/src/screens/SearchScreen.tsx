import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BottomTabParamList } from '../navigation/RootNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { debounce } from 'lodash';

type SearchScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'Main'>,
  BottomTabNavigationProp<BottomTabParamList, 'Search'>
>;

interface SearchResult {
  id: string;
  common_name: string;
  scientific_name: string;
  image_url?: string;
}

function SearchScreen({ navigation }: { navigation: SearchScreenNavigationProp }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    { id: '1', common_name: '龟背竹', scientific_name: 'Monstera deliciosa' },
    { id: '2', common_name: '绿萝', scientific_name: 'Epipremnum aureum' },
    { id: '3', common_name: '多肉植物', scientific_name: 'Succulent' },
    { id: '4', common_name: '吊兰', scientific_name: 'Chlorophytum comosum' },
    { id: '5', common_name: '虎皮兰', scientific_name: 'Sansevieria trifasciata' }
  ];

  const handleSearch = (text: string) => {
    setQuery(text);
    setHasSearched(true);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(
        (item) =>
          item.common_name.toLowerCase().includes(text.toLowerCase()) ||
          item.scientific_name.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleResultPress = (result: SearchResult) => {
    navigation.navigate('PlantDetail', { plantId: result.id });
  };

  const handleFeedback = () => {
    // Show feedback modal
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const popularSearches = ['龟背竹', '绿萝', '多肉', '吊兰', '虎皮兰'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>搜索植物</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="输入植物名称..."
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#478575" />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      ) : hasSearched ? (
        <>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleResultPress(item)}
                >
                  <View style={styles.resultIcon}>
                    <Text>🌿</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.common_name}</Text>
                    <Text style={styles.resultScientific}>{item.scientific_name}</Text>
                  </View>
                  <Text style={styles.resultArrow}>›</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.resultList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>未找到相关植物</Text>
              <Text style={styles.emptyHint}>
                没有找到包含 "{query}" 的植物
              </Text>
              <TouchableOpacity style={styles.feedbackBtn} onPress={handleFeedback}>
                <Text style={styles.feedbackBtnText}>反馈问题</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        /* Popular Searches */
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>热门搜索</Text>
          <View style={styles.popularTags}>
            {popularSearches.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.popularTag}
                onPress={() => handleSearch(tag)}
              >
                <Text style={styles.popularTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  header: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff'
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 12
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333333'
  },
  clearBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearIcon: {
    fontSize: 14,
    color: '#666'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999999'
  },
  resultList: {
    padding: 16
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  resultIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#f0f9f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  resultInfo: {
    flex: 1
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333'
  },
  resultScientific: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 2
  },
  resultArrow: {
    fontSize: 20,
    color: '#cccccc'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  emptyHint: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24
  },
  feedbackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#478575',
    borderRadius: 20
  },
  feedbackBtnText: {
    fontSize: 14,
    color: '#ffffff'
  },
  popularContainer: {
    padding: 16
  },
  popularTitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  popularTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  popularTagText: {
    fontSize: 14,
    color: '#333333'
  }
});

export default SearchScreen;
