import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPost } from '../models/UserPost';
import { UserGet } from '../models/UserGet';
import { ChangePassword } from '../models/ChangePassword';
import { PersonalDataPut } from '../models/PersonalDataPut';
import { UserFilterDto } from '../models/UserFilterDto';
import { PaginatedUsers } from '../models/PaginatedUsers';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly _http: HttpClient = inject(HttpClient);
  public get http(): HttpClient {
    return this._http;
  }
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
    return this.http.put<void>(`${this.url}/avatar/${userId}`, avatarUrl, {
      headers: { 'Content-Type': 'text/plain' } 
    });
  }

  updatePersonalData(personalDataPut: PersonalDataPut, userId: number): Observable<UserGet> {
    return this.http.put<UserGet>(`${this.url}/personal-data/${userId}`, personalDataPut);
  }

  changePassword(changePassword: ChangePassword): Observable<void> {
    return this.http.post<void>(`${this.url}/change-password`, changePassword);
  }

  getFilteredUsers(search: UserFilterDto): Observable<PaginatedUsers> {
    return this.http.post<PaginatedUsers>(`${this.url}/filter`, search);
  }

  verifyUser(userId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/verify/${userId}`, null);
  }

  unverifyUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/unverify/${userId}`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}`);
  }

  activateUser(userId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/activate/${userId}`, null);
  }

}
