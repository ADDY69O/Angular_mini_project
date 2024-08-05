import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';

export interface GetDataType {
    title:string,
    body:string,
  }

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {

  private baseUrl: string;

  constructor(
    private http: HttpClient,
    baseUrl: string,
    protected cacheService: CacheService 
  ) {
    this.baseUrl = baseUrl;
  }



  get<T>(endpoint: T):void {
    
     this.http.get<T>(`${this.baseUrl}/${endpoint}`).subscribe(
        (data)=>{   
            console.log(data);
        }
     )
  }
}
