import { HttpInterceptorFn, HttpResponse, HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface APIResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

export const apiInterceptor: HttpInterceptorFn = (req, next) => {


  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
      

        // Transforming the response into the APIResponse format
        const apiResponse: APIResponse<any> = {
          code: event.status,
          status: 'success',  // This could be dynamically set based on some logic or response data
          message: 'Request successful',  // Customize this message as needed
          data: event.body
        };

        // Clone the HttpResponse and replace the body with the transformed apiResponse
        return event.clone({ body: apiResponse });
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Error occurred:', error);

      // Create an APIResponse for errors as well
      const errorResponse: APIResponse<null> = {
        code: error.status,
        status: 'error',
        message: error.message || 'An error occurred',
        data: null
      };

      // Return an observable with a user-facing error message
      return throwError(() => new Error(JSON.stringify(errorResponse)));
    })
  );
};
