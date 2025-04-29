import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPost } from '../models/UserPost';
import { UserGet } from '../models/UserGet';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8080/users';

  postUser(user: UserPost): Observable<UserGet> {    
    return this.http.post<UserGet>(this.url , user);
  }

  getUsers(): Observable<UserGet[]> {
    return this.http.get<UserGet[]>(this.url);
  }

  getUserById(id: number): Observable<UserGet> {
    return this.http.get<UserGet>(`${this.url}/${id}`);
  }

}
