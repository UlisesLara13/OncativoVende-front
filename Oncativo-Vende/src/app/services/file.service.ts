import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = 'http://localhost:8080/files';  // URL de tu API backend

  constructor(private http: HttpClient) {}

  // Método para subir la foto de perfil
  uploadProfilePic(userId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Asegúrate de que la respuesta se maneje como texto
    return this.http.post<string>(`${this.apiUrl}/upload/profile/${userId}`, formData, {
      responseType: 'text' as 'json'  // Establecer respuesta de tipo texto
    });
  }

  // Método para subir foto de publicación
  uploadPublicationPic(publicationId: number, userId: number, photoNumber: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Asegúrate de que la respuesta se maneje como texto
    return this.http.post<string>(
      `${this.apiUrl}/upload/publication/${publicationId}/${userId}/${photoNumber}`, 
      formData, 
      {
        responseType: 'text' as 'json'  // Establecer respuesta de tipo texto
      }
    );
  }
}
