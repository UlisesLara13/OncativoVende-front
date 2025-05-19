import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FavoritePost } from '../models/FavoritePost';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8080/favorites';

  isFavorite(dto: FavoritePost): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/is-favorite`, dto);
  }

  createFavorite(dto: FavoritePost): Observable<any> {
    return this.http.post(`${this.url}`, dto);
  }

  deleteFavorite(dto: FavoritePost): Observable<any> {
    return this.http.post(`${this.url}/delete`, dto);
  }
  
}
