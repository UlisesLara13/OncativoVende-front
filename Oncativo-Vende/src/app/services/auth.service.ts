import { inject, Injectable } from '@angular/core';
import { UserLoged } from '../models/UserLoged';
import { KJUR } from 'jsrsasign';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginUser } from '../models/LoginUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8080/auth/';

  constructor() { }

  async login(data: any): Promise<void> {
    this.saveToken(data.token);
    const user = this.getUser();
    this.saveActualRoles(user.roles); 
  }

  getUser(): UserLoged {
    const user = new UserLoged();
    const decodedToken: any = KJUR.jws.JWS.parse(this.getToken() || '');
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
      roles: roles, // Guarda el array completo de roles
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
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
    if (!token) {
      return null;
    }

    const secret = 'your-256-bit-secret';
    const decodedToken: any = KJUR.jws.JWS.parse(token);
    const isValid = KJUR.jws.JWS.verify(token, secret, ['HS256']);
    
    if (isValid) {
      return decodedToken.payloadObj.roles || null;
    } else {
      console.error('Token no es válido.');
      return null;
    }
  }

  verifyLogin(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>(this.url + "login", user);
  }

}
