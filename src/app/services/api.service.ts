import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export default class RequestService {
  private baseUrl: string = 'https://dummyjson.com/';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }

    return throwError(errorMessage);
  }

  private makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const options = { headers: headers || new HttpHeaders({ 'Content-Type': 'application/json' }) };
    
    return this.http.request<APIResponse<T>>(method, url, {
      body: data,
      ...options
    }).pipe(
      map(response => {
        console.log('Response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  protected get<T>(
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    return this.makeRequest('GET', endpoint, data, headers);
  }

  protected post<T>(
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    return this.makeRequest('POST', endpoint, data, headers);
  }

  protected delete<T>(
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    return this.makeRequest('DELETE', endpoint, data, headers);
  }

  protected put<T>(
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    return this.makeRequest('PUT', endpoint, data, headers);
  }

  protected patch<T>(
    endpoint: string,
    data?: T,
    headers?: HttpHeaders
  ): Observable<APIResponse<T>> {
    return this.makeRequest('PATCH', endpoint, data, headers);
  }
}

export interface APIResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}
