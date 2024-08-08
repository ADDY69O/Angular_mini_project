// src/app/cache.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache: Record<string, any> = {};

  constructor() {}

  // Set cache for a given key
  setCache(key: string, value: any): void {
    this.cache[key] = value;
  }

  // Get cache for a given key, or return null if not present
  getCache(key: string): any | null {
    return this.cache[key] || null;
  }
}
