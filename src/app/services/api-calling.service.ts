import { Injectable } from '@angular/core';
import ApiService, { APIResponse } from '../services/api.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { HttpClient } from '@angular/common/http';

export type PostResponse = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
};

export type ProductResponse = {
  posts: PostResponse[];
  total: number;
  skip: number;
  limit: number;
};

@Injectable({
  providedIn: 'root',
})
export class ApiPostService extends ApiService {
  constructor(private cacheService: CacheService, private HttpClient:HttpClient) {
    super(HttpClient);
  }

  getPost(limit: number, skip: number) {
    const cacheKey = `${limit}-${skip}`;
    const cachedData = this.cacheService.getCache(cacheKey);

    if (cachedData) {
      return of(cachedData); // Return cached data as an observable
    }

    return this.get<ProductResponse>(`posts?limit=${limit}&skip=${skip}`).pipe(
      tap(response => this.cacheService.setCache(cacheKey, response)), // Cache the response
      map(response => response)
    );
  }
}
