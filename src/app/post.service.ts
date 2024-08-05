// src/app/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://dummyjson.com/posts';

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getPosts(limit: number, skip: number): Observable<any> {
    const cacheKey = `${limit}-${skip}`;
    const cachedData = this.cacheService.getCache(cacheKey);

    if (cachedData) {
      return of(cachedData); // Return cached data as an observable
    }

    return this.http.get<any>(`${this.apiUrl}?limit=${limit}&skip=${skip}`).pipe(
      tap(data => this.cacheService.setCache(cacheKey, data)) // Cache the response
    );
  }
}
