import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryGet } from '../models/CategoryGet';
import { PublicationGet } from '../models/PublicationGet';
import { SearchDto } from '../models/SearchDto';
import { PaginatedPublications } from '../models/PaginatedPublications';
import { PublicationPost } from '../models/PublicationPost';
import { SearchByUserDto } from '../models/SearchByUserDto';

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

  getPublicationById(id: number): Observable<PublicationGet> {
    return this.http.get<PublicationGet>(`${this.publicationsUrl}/${id}`);
  }

  getFilteredPublications(search: SearchDto): Observable<PaginatedPublications> {
    return this.http.post<PaginatedPublications>(`${this.publicationsUrl}/filter`, search);
  }

  getFilteredPublicationsByUserId(search: SearchByUserDto, userId: number): Observable<PaginatedPublications> {
  return this.http.post<PaginatedPublications>(`${this.publicationsUrl}/filter/user/${userId}`, search);
  }

  createPublication(data: PublicationPost): Observable<PublicationGet> {
  return this.http.post<PublicationGet>(`${this.publicationsUrl}`, data);
  }

  updatePublication(id: number, data: PublicationPost): Observable<PublicationGet> {
    return this.http.put<PublicationGet>(`${this.publicationsUrl}/${id}`, data);
  }

  addView(id: number): Observable<void> {
    return this.http.post<void>(`${this.publicationsUrl}/add-view/${id}`, null);
  }

  deletePublication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.publicationsUrl}/${id}`);
  }

  reactivatePublication(id: number): Observable<void> {
    return this.http.post<void>(`${this.publicationsUrl}/reactivate/${id}`, null);
  }

  isSameUserPublication(publicationId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.publicationsUrl}/is-same-user/${publicationId}/${userId}`, null);
  }
  

}
