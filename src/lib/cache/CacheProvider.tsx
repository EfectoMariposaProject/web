'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { empCache } from './emp-cache';

interface CacheContextType {
  getCached: <T = any>(key: string) => T | null;
  setCached: <T = any>(
    key: string,
    data: T,
    options?: { ttlMs?: number; isClosed?: boolean; persist?: boolean }
  ) => void;
  invalidate: (keyOrPrefix: string) => void;
  invalidateDay: (dayIdOrNumber: string | number) => void;
  invalidateAll: () => void;
  isDayClosed: (dayIdOrNumber: string | number) => boolean;
  markDayClosed: (dayIdOrNumber: string | number, isClosed?: boolean) => void;
  fetchWithCache: <T = any>(
    url: string,
    fetchOptions?: RequestInit,
    cacheOptions?: {
      cacheKey?: string;
      forceRefresh?: boolean;
      ttlMs?: number;
      persist?: boolean;
      isClosed?: boolean;
    }
  ) => Promise<T>;
}

const CacheContext = createContext<CacheContextType | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to cache updates so components can re-render when cache mutates
    const unsubscribe = empCache.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const getCached = useCallback(<T = any>(key: string): T | null => {
    return empCache.get<T>(key);
  }, []);

  const setCached = useCallback(
    <T = any>(
      key: string,
      data: T,
      options?: { ttlMs?: number; isClosed?: boolean; persist?: boolean }
    ) => {
      empCache.set<T>(key, data, options);
    },
    []
  );

  const invalidate = useCallback((keyOrPrefix: string) => {
    empCache.invalidate(keyOrPrefix);
  }, []);

  const invalidateDay = useCallback((dayIdOrNumber: string | number) => {
    empCache.invalidateDay(dayIdOrNumber);
  }, []);

  const invalidateAll = useCallback(() => {
    empCache.invalidateAll();
  }, []);

  const isDayClosed = useCallback((dayIdOrNumber: string | number) => {
    return empCache.isDayClosed(dayIdOrNumber);
  }, []);

  const markDayClosed = useCallback((dayIdOrNumber: string | number, isClosed = true) => {
    empCache.markDayClosed(dayIdOrNumber, isClosed);
  }, []);

  const fetchWithCache = useCallback(
    <T = any>(
      url: string,
      fetchOptions?: RequestInit,
      cacheOptions?: {
        cacheKey?: string;
        forceRefresh?: boolean;
        ttlMs?: number;
        persist?: boolean;
        isClosed?: boolean;
      }
    ) => {
      return empCache.fetchWithCache<T>(url, fetchOptions, cacheOptions);
    },
    []
  );

  const value = {
    getCached,
    setCached,
    invalidate,
    invalidateDay,
    invalidateAll,
    isDayClosed,
    markDayClosed,
    fetchWithCache,
  };

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

export function useEmpCache(): CacheContextType {
  const ctx = useContext(CacheContext);
  if (!ctx) {
    // Fallback to direct empCache instance if used outside Provider
    return {
      getCached: <T = any>(k: string) => empCache.get<T>(k),
      setCached: <T = any>(k: string, d: T, o?: any) => empCache.set<T>(k, d, o),
      invalidate: (k: string) => empCache.invalidate(k),
      invalidateDay: (d: string | number) => empCache.invalidateDay(d),
      invalidateAll: () => empCache.invalidateAll(),
      isDayClosed: (d: string | number) => empCache.isDayClosed(d),
      markDayClosed: (d: string | number, c = true) => empCache.markDayClosed(d, c),
      fetchWithCache: <T = any>(u: string, fo?: any, co?: any) =>
        empCache.fetchWithCache<T>(u, fo, co),
    };
  }
  return ctx;
}
