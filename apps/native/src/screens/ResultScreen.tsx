import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;

interface Suggestion {
  species_id: string;
  common_name: string;
  scientific_name: string;
  confidence: number;
}

function ResultScreen({ navigation, route }: { navigation: ResultScreenNavigationProp; route: any }) {
  const { scanId } = route.params;
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  // Mock data - would come from API in real implementation
  const mockResult = {
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    top_suggestion: {
      species_id: 'uuid-1',
      common_name: '龟背竹',
      scientific_name: 'Monstera deliciosa',
      confidence: 0.92,
      care_profile: {
        light_requirement: 'partial_shade',
        water_frequency_days: 7,
        difficulty: 'easy'
      },
      description: '龟背竹是一种原产于热带美洲的观叶植物，以其独特的裂叶而闻名。'
    },
    all_suggestions: [
      { species_id: 'uuid-1', common_name: '龟背竹', scientific_name: 'Monstera deliciosa', confidence: 0.92 },
      { species_id: 'uuid-2', common_name: '裂叶龟背竹', scientific_name: 'Monstera adansonii', confidence: 0.05 },
      { species_id: 'uuid-3', common_name: '琴叶榕', scientific_name: 'Ficus lyrata', confidence: 0.02 }
    ]
  };

  const result = mockResult;
  const suggestion = selectedSuggestion || result.top_suggestion;
  const confidence = Math.round(suggestion.confidence * 100);

  const handleAddToGarden = () => {
    navigation.navigate('AddPlant', { speciesId: suggestion.species_id });
  };

  const handleShare = () => {
    // Implement share functionality
  };

  const handleSearchAgain = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: result.image_url }} style={styles.image} />
        <View style={styles.imageOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant Info */}
      <View style={styles.infoCard}>
        <Text style={styles.commonName}>{suggestion.common_name}</Text>
        <Text style={styles.scientificName}>{suggestion.scientific_name}</Text>

        {/* Confidence */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
          </View>
          <Text style={styles.confidenceText}>匹配度 {confidence}%</Text>
        </View>

        {/* Care Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagIcon}>☀️</Text>
            <Text style={styles.tagText}>半阴</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagIcon}>💧</Text>
            <Text style={styles.tagText}>7天/次</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagIcon}>🌱</Text>
            <Text style={styles.tagText}>简单</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>植物简介</Text>
        <Text style={styles.description}>{suggestion.description}</Text>
      </View>

      {/* Other Suggestions */}
      {result.all_suggestions.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他可能</Text>
          {result.all_suggestions.slice(1).map((s, index) => (
            <TouchableOpacity
              key={s.species_id}
              style={[
                styles.suggestionItem,
                selectedSuggestion?.species_id === s.species_id && styles.suggestionItemActive
              ]}
              onPress={() => setSelectedSuggestion(s)}
            >
              <Text style={styles.suggestionRank}>{index + 2}</Text>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName}>{s.common_name}</Text>
                <Text style={styles.suggestionScientific}>{s.scientific_name}</Text>
              </View>
              <Text style={styles.suggestionConfidence}>{Math.round(s.confidence * 100)}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Not This Plant */}
      <TouchableOpacity style={styles.notThisButton} onPress={handleSearchAgain}>
        <Text style={styles.notThisText}>
          不是 {suggestion.common_name}？
        </Text>
        <Text style={styles.notThisLink}>手动搜索</Text>
      </TouchableOpacity>

      {/* Add to Garden Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddToGarden}>
        <Text style={styles.addButtonText}>加入我的花园</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  content: {
    paddingBottom: 100
  },
  imageContainer: {
    position: 'relative',
    height: 280
  },
  image: {
    width: '100%',
    height: '100%'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtnText: {
    fontSize: 20,
    color: '#333'
  },
  shareBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shareBtnText: {
    fontSize: 18
  },
  infoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  commonName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333'
  },
  scientificName: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#478575',
    borderRadius: 4
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#478575',
    marginLeft: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagIcon: {
    fontSize: 14,
    marginRight: 4
  },
  tagText: {
    fontSize: 12,
    color: '#478575',
    fontWeight: '500'
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 8
  },
  suggestionItemActive: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#478575'
  },
  suggestionRank: {
    width: 24,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginRight: 12
  },
  suggestionInfo: {
    flex: 1
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333'
  },
  suggestionScientific: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic'
  },
  suggestionConfidence: {
    fontSize: 13,
    color: '#999999'
  },
  notThisButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16
  },
  notThisText: {
    fontSize: 14,
    color: '#999999'
  },
  notThisLink: {
    fontSize: 14,
    color: '#478575',
    marginLeft: 4
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 52,
    backgroundColor: '#478575',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#478575',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
});

export default ResultScreen;
