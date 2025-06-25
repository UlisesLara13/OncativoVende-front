import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = 'http://localhost:8080/files';  

  constructor(private http: HttpClient) {}

  uploadProfilePic(userId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<string>(`${this.apiUrl}/upload/profile/${userId}`, formData, {
      responseType: 'text' as 'json'  
    });
  }

  uploadPublicationPic(publicationId: number, userId: number, photoNumber: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<string>(
      `${this.apiUrl}/upload/publication/${publicationId}/${userId}/${photoNumber}`, 
      formData, 
      {
        responseType: 'text' as 'json'  
      }
    );
  }

  uploadEventPic(eventId: number, file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<string>(
    `${this.apiUrl}/upload/event/${eventId}`,
    formData,
    {
      responseType: 'text' as 'json'
    }
  );
}
}
