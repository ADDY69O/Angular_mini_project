// src/app/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://dummyjson.com/posts';

  constructor(private http: HttpClient) {}

  getPosts(limit: number, skip: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?limit=${limit}&skip=${skip}`);
  }
}
