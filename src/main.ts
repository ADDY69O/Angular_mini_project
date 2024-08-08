import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, HttpClientModule, withInterceptors } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';

import { apiInterceptor } from './app/api.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
      // Add HttpClientModule provider here
      provideHttpClient(withInterceptors([apiInterceptor])),
      

  ],
})
.catch((err) => console.error(err));
