import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPost } from '../models/UserPost';
import { UserGet } from '../models/UserGet';
import { ChangePassword } from '../models/ChangePassword';
import { PersonalDataPut } from '../models/PersonalDataPut';

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

  updateAvatarUrl(userId: number, avatarUrl: string): Observable<void> {
    return this.http.put<void>(`http://localhost:8080/users/avatar/${userId}`, avatarUrl, {
      headers: { 'Content-Type': 'text/plain' } 
    });
  }

  updatePersonalData(personalDataPut: PersonalDataPut, userId: number): Observable<UserGet> {
    return this.http.put<UserGet>(`${this.url}/personal-data/${userId}`, personalDataPut);
  }

  changePassword(changePassword: ChangePassword): Observable<void> {
    return this.http.post<void>(`${this.url}/change-password`, changePassword);
  }

}
