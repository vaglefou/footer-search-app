import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { SearchComponent } from './app/search/search.component';

bootstrapApplication(SearchComponent, {
  providers: [provideHttpClient()],
}).catch((err) => console.error(err));
