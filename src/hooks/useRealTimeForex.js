import { useState, useEffect, useCallback, useRef } from 'react';
import realTimeDataService from '../services/realTimeDataService';

/**
 * Custom hook for real-time forex data
 * @param {Array} initialPairs - Initial currency pairs to subscribe to
 * @param {Object} options - Configuration options
 */
export const useRealTimeForex = (initialPairs = [], options = {}) => {
  const {
    autoStart = true,
    updateInterval = 10000,
    enableAnimations = true,
    onError = null,
  } = options;

  const [data, setData] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [priceChanges, setPriceChanges] = useState(new Map());
  
  // Refs to track component state
  const isMountedRef = useRef(true);
  const subscribedPairsRef = useRef(initialPairs);
  const animationTimeoutRef = useRef(new Map());

  // Initialize service
  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoStart && initialPairs.length > 0) {
      start(initialPairs);
    }

    return () => {
      isMountedRef.current = false;
      stop();
      // Clear animation timeouts
      animationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handlePairUpdate = (updateData) => {
      if (!isMountedRef.current) return;

      console.log('🎯 Hook received pair update:', updateData);
      const { symbol, data: newData, previousData } = updateData;
      
      setData(prevData => {
        const newMap = new Map(prevData);
        newMap.set(symbol, newData);
        return newMap;
      });

      // Track price changes for animations
      if (enableAnimations && previousData) {
        const priceChanged = previousData.price !== newData.price;
        const isIncrease = newData.price > previousData.price;
        
        if (priceChanged) {
          setPriceChanges(prev => {
            const newMap = new Map(prev);
            newMap.set(symbol, {
              type: isIncrease ? 'increase' : 'decrease',
              timestamp: Date.now(),
              previousPrice: previousData.price,
              newPrice: newData.price,
              change: newData.price - previousData.price
            });
            return newMap;
          });

          // Clear animation state after delay
          if (animationTimeoutRef.current.has(symbol)) {
            clearTimeout(animationTimeoutRef.current.get(symbol));
          }
          
          const timeout = setTimeout(() => {
            if (isMountedRef.current) {
              setPriceChanges(prev => {
                const newMap = new Map(prev);
                newMap.delete(symbol);
                return newMap;
              });
            }
            animationTimeoutRef.current.delete(symbol);
          }, 2000);
          
          animationTimeoutRef.current.set(symbol, timeout);
        }
      }

      setLastUpdate(new Date());
      setLoading(false);
    };

    const handleBatchUpdate = (batchData) => {
      if (!isMountedRef.current) return;
      setLastUpdate(new Date());
    };

    const handleServiceStarted = () => {
      if (!isMountedRef.current) return;
      console.log('🟢 Hook received service_started event');
      setIsConnected(true);
      setError(null);
    };

    const handleServiceStopped = () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      setLoading(false);
    };

    const handleError = (errorData) => {
      if (!isMountedRef.current) return;
      setError(errorData);
      setLoading(false);
      if (onError) {
        onError(errorData);
      }
    };

    // Subscribe to events
    realTimeDataService.on('pair_updated', handlePairUpdate);
    realTimeDataService.on('batch_updated', handleBatchUpdate);
    realTimeDataService.on('service_started', handleServiceStarted);
    realTimeDataService.on('service_stopped', handleServiceStopped);
    realTimeDataService.on('error', handleError);

    return () => {
      realTimeDataService.off('pair_updated', handlePairUpdate);
      realTimeDataService.off('batch_updated', handleBatchUpdate);
      realTimeDataService.off('service_started', handleServiceStarted);
      realTimeDataService.off('service_stopped', handleServiceStopped);
      realTimeDataService.off('error', handleError);
    };
  }, [enableAnimations, onError]);

  // Start real-time service
  const start = useCallback((pairs = null) => {
    const pairsToUse = pairs || subscribedPairsRef.current;
    subscribedPairsRef.current = pairsToUse;
    
    console.log('🚀 Hook starting real-time service with pairs:', pairsToUse.map(p => p.symbol));
    
    setLoading(true);
    setError(null);
    
    // Set update interval if provided
    if (updateInterval !== 10000) {
      realTimeDataService.setUpdateInterval(updateInterval);
    }
    
    realTimeDataService.start(pairsToUse);
  }, [updateInterval]);

  // Stop real-time service
  const stop = useCallback(() => {
    realTimeDataService.stop();
  }, []);

  // Restart service
  const restart = useCallback(() => {
    stop();
    setTimeout(() => start(), 1000);
  }, [start, stop]);

  // Subscribe to additional pairs
  const subscribe = useCallback((pairs) => {
    const pairsArray = Array.isArray(pairs) ? pairs : [pairs];
    subscribedPairsRef.current = [...subscribedPairsRef.current, ...pairsArray];
    realTimeDataService.subscribe(pairsArray);
  }, []);

  // Unsubscribe from pairs
  const unsubscribe = useCallback((symbols) => {
    const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
    subscribedPairsRef.current = subscribedPairsRef.current.filter(
      pair => !symbolsArray.includes(pair.symbol)
    );
    realTimeDataService.unsubscribe(symbolsArray);
    
    // Remove from local data
    setData(prevData => {
      const newMap = new Map(prevData);
      symbolsArray.forEach(symbol => newMap.delete(symbol));
      return newMap;
    });
  }, []);

  // Get data for specific symbol
  const getSymbolData = useCallback((symbol) => {
    return data.get(symbol);
  }, [data]);

  // Get all data as array
  const getDataArray = useCallback(() => {
    return Array.from(data.values());
  }, [data]);

  // Get data as object
  const getDataObject = useCallback(() => {
    return Object.fromEntries(data);
  }, [data]);

  // Refresh specific symbol
  const refreshSymbol = useCallback(async (symbol) => {
    try {
      await realTimeDataService.refreshSymbol(symbol);
    } catch (error) {
      setError(error);
    }
  }, []);

  // Get price change animation state
  const getPriceChangeAnimation = useCallback((symbol) => {
    return priceChanges.get(symbol);
  }, [priceChanges]);

  // Get service status
  const getStatus = useCallback(() => {
    return realTimeDataService.getStatus();
  }, []);

  return {
    // Data state
    data: getDataObject(),
    dataMap: data,
    dataArray: getDataArray(),
    
    // Service state
    loading,
    isConnected,
    error,
    lastUpdate,
    
    // Animation state
    priceChanges: Object.fromEntries(priceChanges),
    
    // Methods
    start,
    stop,
    restart,
    subscribe,
    unsubscribe,
    getSymbolData,
    refreshSymbol,
    getPriceChangeAnimation,
    getStatus,
  };
};

/**
 * Hook for subscribing to a single currency pair
 * @param {string} symbol - Currency pair symbol (e.g., 'EUR/USD')
 * @param {Object} options - Configuration options
 */
export const useRealTimeSymbol = (symbol, options = {}) => {
  const { data, priceChanges, ...rest } = useRealTimeForex([], {
    autoStart: false,
    ...options
  });
  
  const [symbolData, setSymbolData] = useState(null);
  const [priceChange, setPriceChange] = useState(null);

  useEffect(() => {
    if (symbol) {
      const pair = { symbol, name: symbol };
      rest.start([pair]);
      
      return () => {
        rest.unsubscribe([symbol]);
      };
    }
  }, [symbol]);

  useEffect(() => {
    setSymbolData(data[symbol] || null);
    setPriceChange(priceChanges[symbol] || null);
  }, [data, priceChanges, symbol]);

  return {
    data: symbolData,
    priceChange,
    loading: rest.loading && !symbolData,
    error: rest.error,
    lastUpdate: rest.lastUpdate,
    refresh: () => rest.refreshSymbol(symbol),
    ...rest
  };
};

/**
 * Hook for real-time market summary data
 */
export const useMarketSummary = (pairs) => {
  const { dataArray, loading, error, lastUpdate } = useRealTimeForex(pairs);
  
  const summary = {
    totalPairs: dataArray.length,
    gainers: dataArray.filter(pair => pair.change > 0).length,
    losers: dataArray.filter(pair => pair.change < 0).length,
    unchanged: dataArray.filter(pair => pair.change === 0).length,
    biggestGainer: dataArray.reduce((max, pair) => 
      (!max || pair.changePercent > max.changePercent) ? pair : max, null),
    biggestLoser: dataArray.reduce((min, pair) => 
      (!min || pair.changePercent < min.changePercent) ? pair : min, null),
    averageChange: dataArray.length > 0 
      ? dataArray.reduce((sum, pair) => sum + pair.changePercent, 0) / dataArray.length 
      : 0,
  };

  return {
    summary,
    loading,
    error,
    lastUpdate,
    rawData: dataArray
  };
};

export default useRealTimeForex;
