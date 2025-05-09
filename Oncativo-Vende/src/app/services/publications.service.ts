import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryGet } from '../models/CategoryGet';
import { PublicationGet } from '../models/PublicationGet';

@Injectable({
  providedIn: 'root'
})
export class PublicationsService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly categoriesUrl = 'http://localhost:8080/categories';
  private readonly publicationsUrl = 'http://localhost:8080/publications';

  getCategories(): Observable<CategoryGet[]> {    
    return this.http.get<CategoryGet[]>(this.categoriesUrl);
  }
  
  getLast10Publications(): Observable<PublicationGet[]> {
    return this.http.get<PublicationGet[]>(`${this.publicationsUrl}/last10`);
  }

}
