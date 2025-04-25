import { inject, Injectable } from '@angular/core';
import { UserLoged } from '../models/UserLoged';
import {KJUR} from 'jsrsasign';
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
    this.saveActualRole(this.getUser().roles[0]);
  }

  getUser(): UserLoged{
    var user = new UserLoged();
      const decodedToken: any = KJUR.jws.JWS.parse(this.getToken() || '');
      user.id = decodedToken.payloadObj.id;
      user.roles = decodedToken.payloadObj.roles;
      user.name = decodedToken.payloadObj.name;
      user.surname = decodedToken.payloadObj.lastname;

      return user;
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  logOut() {
    localStorage.removeItem('jwtToken');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('jwtToken') !== null;
  }

  hasRole(role: string): boolean {
    return this.getUser().roles.includes(role); 
  }

  saveActualRole(rolSelected: string): void {
    const header = { alg: 'HS256', typ: 'JWT' }; // Cabecera
    const payload = {
      selectedRol: rolSelected,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };
    
    const secret = 'your-256-bit-secret'; // Clave secreta (debe ser segura y no expuesta en código)
    
    // Crear el JWT
    const token = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), secret);
    
    // Guardar el token en localStorage
    localStorage.setItem('jwtRole', token);
  }

  hasActualRole(): boolean {
    return localStorage.getItem('jwtRole') == null;
  }

  // Método para obtener el rolSelected desde el JWT en el localStorage
  getActualRole(): string | null {
    const token = localStorage.getItem('jwtRole');
    if (!token) {
      return null; // Retorna null si no hay token
    }

    const secret = 'your-256-bit-secret'; // Debe ser la misma clave secreta utilizada para firmar el token

    // Decodificar el JWT
    const decodedToken: any = KJUR.jws.JWS.parse(token);
    // Verifica la firma
    const isValid = KJUR.jws.JWS.verify(token, secret, ['HS256']);
    
    if (isValid) {
      return decodedToken.payloadObj.selectedRol || null; // Retorna el rolSelected
    } else {
      console.error('Token no es válido.');
      return null;
    }
  }

  verifyLogin(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>( this.url + "login", user);
  }  


}
