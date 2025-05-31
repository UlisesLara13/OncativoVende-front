import { inject, Injectable } from '@angular/core';
import { UserLoged } from '../models/UserLoged';
import { KJUR } from 'jsrsasign';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginUser } from '../models/LoginUser';
import { RecoveryEmailPost } from '../models/RecoveryEmailPost';
import { ResetPasswordPost } from '../models/ResetPasswordPost';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8080/auth/';

  private currentUserSubject = new BehaviorSubject<UserLoged | null>(this.getToken() ? this.getUser() : null);
  public user$ = this.currentUserSubject.asObservable();

  constructor() {}

  async login(data: any): Promise<void> {
    this.saveToken(data.token);
    const user = this.getUser();
    this.saveActualRoles(user.roles);
    this.currentUserSubject.next(user);
  }

  getUser(): UserLoged {
    const user = new UserLoged();
    const token = this.getToken();
    if (!token) return user;

    const decodedToken: any = KJUR.jws.JWS.parse(token);
    user.id = decodedToken.payloadObj.id;
    user.roles = decodedToken.payloadObj.roles;
    user.name = decodedToken.payloadObj.name;
    user.surname = decodedToken.payloadObj.surname;
    user.avatar = decodedToken.payloadObj.avatar;
    user.subscription = decodedToken.payloadObj.subscription;
    return user;
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  hasSubscription(): boolean {
    const user = this.getUser();
    return user.subscription !== 'NO' && user.subscription !== undefined;
  }

  logOut(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtRoles');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('jwtToken') !== null;
  }

  hasRole(role: string): boolean {
    return this.getUser().roles.includes(role);
  }

  saveActualRoles(roles: string[]): void {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      roles: roles,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };

    const secret = 'your-256-bit-secret';
    const token = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), secret);
    localStorage.setItem('jwtRoles', token);
  }

  hasActualRoles(): boolean {
    return localStorage.getItem('jwtRoles') !== null;
  }

  getActualRoles(): string[] | null {
    const token = localStorage.getItem('jwtRoles');
    if (!token) return null;

    const secret = 'your-256-bit-secret';
    const decodedToken: any = KJUR.jws.JWS.parse(token);
    const isValid = KJUR.jws.JWS.verify(token, secret, ['HS256']);

    return isValid ? decodedToken.payloadObj.roles || null : null;
  }

  verifyLogin(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>(this.url + "login", user);
  }

  recoverPassword(email: RecoveryEmailPost): Observable<void> {
    return this.http.post<void>(this.url + "recover-password", email);
  }

  resetPassword(resetDto: ResetPasswordPost): Observable<void> {
    return this.http.post<void>(this.url + "reset-password", resetDto);
  }

}
