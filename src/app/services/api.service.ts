import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

export default class RequestService {
  private axiosInstance: AxiosInstance;

  constructor() {
    // Create an Axios instance
    this.axiosInstance = axios.create({
      baseURL: 'https://dummyjson.com/',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log('Request:', config); // Log or modify the request here
        // Add authentication tokens or modify headers if needed
        // config.headers['Authorization'] = `Bearer ${yourToken}`;
        return config;
      },
      (error: AxiosError) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('Response:', response); // Log or process the response here
        return response;
      },
      (error: AxiosError) => {
        console.error('Response error:', error);
        // Handle specific error statuses or transform the error
        if (error.response?.status === 401) {
          // Handle unauthorized errors, e.g., redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: T,
    header?: Record<string, any>,
  ): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<APIResponse<T>> = await this.axiosInstance.request({
        method,
        url: endpoint,
        headers: {
          ...header,
        },
        data: (header?.['Content-Type'] === 'multipart/form-data'
          ? data
          : JSON.stringify(data)) as T,
      });

      console.log(response);

      return response.data;
    } catch (error: any) {
      // handle this..........
      // console.log(error.toString());
      if ([401].includes(error?.response?.status)) {
        throw new Error('Unauthorized');
      } else {
        if (error.response && error.response.data) {
          // If there's an error message from the server, return it
          let errorMessage = '';
          if (
            error.response.data?.errors &&
            Object.keys(error.response.data?.errors)?.length
          ) {
            errorMessage =
              (Object.values(error.response.data.errors) as string[])[0] ?? '';
          } else {
            errorMessage = error.response.data.message;
          }

          throw new Error(errorMessage);
        } else {
          // If no specific error message from the server, throw a generic error
          throw new Error(error?.message);
        }
      }
    }
  }

  protected async get<T>(
    endpoint: string,
    data?:T,
    header?: Record<string, string>,
  ): Promise<APIResponse<T>> {
    return this.makeRequest('get', endpoint, data, header);
  }

  protected async post<T>(
    endpoint: string,
    data?: T,
    header?: Record<string, any>,
  ): Promise<APIResponse<T>> {
    return this.makeRequest('post', endpoint, data, header);
  }

  protected async delete<T>(
    endpoint: string,
    data?: T,
  ): Promise<APIResponse<T>> {
    return this.makeRequest('delete', endpoint, data);
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    header?: Record<string, any>,
  ): Promise<APIResponse<T>> {
    return this.makeRequest('put', endpoint, data, header);
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
  ): Promise<APIResponse<T>> {
    return this.makeRequest('patch', endpoint, data);
  }
}

export interface APIResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}
