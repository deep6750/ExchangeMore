import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {colors} from '../constants/colors';
import twelveDataApi, {MAJOR_PAIRS, MINOR_PAIRS, EXOTIC_PAIRS} from '../services/twelveDataApi';
import CurrencyPairCard from '../components/CurrencyPairCard';
import { useRealTimeForex } from '../hooks/useRealTimeForex';

const MarketsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const categories = [
    {id: 'all', name: 'All'},
    {id: 'major', name: 'Major'},
    {id: 'minor', name: 'Minor'},
    {id: 'exotic', name: 'Exotic'},
    {id: 'favorites', name: 'Favorites'},
  ];

  // Prepare all pairs with categories
  const allPairsWithCategories = [
    ...MAJOR_PAIRS.map(pair => ({ ...pair, category: 'major' })),
    ...MINOR_PAIRS.map(pair => ({ ...pair, category: 'minor' })),
    ...EXOTIC_PAIRS.map(pair => ({ ...pair, category: 'exotic' }))
  ];

  // Use real-time forex data hook
  const {
    dataArray: allPairs,
    loading,
    error,
    lastUpdate,
    restart,
    priceChanges,
    isConnected
  } = useRealTimeForex(allPairsWithCategories, {
    autoStart: true,
    updateInterval: 10000, // 10 seconds
    enableAnimations: true,
    onError: (error) => {
      console.error('Real-time market data error:', error);
      Alert.alert('Error', 'Failed to load real-time market data');
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    filterPairs();
  }, [allPairs, searchQuery, selectedCategory, favorites]);

  const filterPairs = () => {
    let filtered = allPairs.map(pair => {
      // Add category and favorite status
      const categoryInfo = allPairsWithCategories.find(p => p.symbol === pair.symbol);
      return {
        ...pair,
        category: categoryInfo?.category || 'exotic',
        isFavorite: favorites.has(pair.symbol)
      };
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter(pair => pair.isFavorite);
      } else {
        filtered = filtered.filter(pair => pair.category === selectedCategory);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(pair =>
        pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPairs(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    restart();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const toggleFavorite = (symbol) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}>
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.id && styles.categoryButtonTextActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMarketItem = ({item, index}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 50}
      style={styles.marketItem}>
      <CurrencyPairCard
        symbol={item.symbol}
        name={item.name}
        price={item.price}
        change={item.change}
        changePercent={item.changePercent}
        showChart={false}
        onFavoritePress={() => toggleFavorite(item.symbol)}
        isFavorite={item.isFavorite}
        priceChange={priceChanges[item.symbol]}
        lastUpdate={lastUpdate}
        isConnected={isConnected}
      />
    </Animatable.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Markets</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search currencies..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}>
            <Icon name="x" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filters */}
      <FlatList
        data={categories}
        renderItem={({item}) => renderCategoryButton(item)}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Market Summary */}
      <View style={styles.marketSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Pairs</Text>
          <Text style={styles.summaryValue}>{filteredPairs.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Gainers</Text>
          <Text style={[styles.summaryValue, {color: colors.chart.bullish}]}>
            {filteredPairs.filter(p => p.change > 0).length}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Losers</Text>
          <Text style={[styles.summaryValue, {color: colors.chart.bearish}]}>
            {filteredPairs.filter(p => p.change < 0).length}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPairs}
        renderItem={renderMarketItem}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.background.card,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background.card,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: colors.text.primary,
  },
  marketSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  marketItem: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
});

export default MarketsScreen;
