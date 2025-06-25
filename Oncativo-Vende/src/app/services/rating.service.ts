import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RatingPost } from '../models/RatingPost';
import { Observable } from 'rxjs';
import { RatingGet } from '../models/RatingGet';
import { RatingPut } from '../models/RatingPut';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

    private readonly http: HttpClient = inject(HttpClient);
    private readonly url = 'http://localhost:8080/ratings';

  addRating(dto: RatingPost): Observable<boolean> {
    return this.http.post<boolean>(this.url, dto);
  }

  getRatingsByUser(userId: number): Observable<RatingGet[]> {
    return this.http.get<RatingGet[]>(`${this.url}/user/${userId}`);
  }

  updateRating(ratingId: number, dto: RatingPut): Observable<RatingGet> {
    return this.http.put<RatingGet>(`${this.url}/${ratingId}`, dto);
  }

  deleteRating(ratingId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${ratingId}`);
  }

  hasRating(ratedUserId: number, raterUserId: number): Observable<RatingGet | null> {
    return this.http.get<RatingGet | null>(`${this.url}/hasrating/${ratedUserId}/${raterUserId}`);
  }

}
