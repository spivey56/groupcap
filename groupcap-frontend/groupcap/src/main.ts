// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';

// Bootstrap the app (standalone)
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []), // keep existing providers from appConfig
    provideAnimations(),            // enable animations globally
  ],
}).catch((err) => console.error(err));