import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationGet } from '../models/LocationGet';
import { TagGet } from '../models/TagGet';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly locationsUrl = 'http://localhost:8080/locations';
  private readonly tagsUrl = 'http://localhost:8080/tags';

  getLocations(): Observable<LocationGet[]> {    
      return this.http.get<LocationGet[]>(this.locationsUrl);
    }

  getTags(): Observable<TagGet[]> {
    return this.http.get<TagGet[]>(this.tagsUrl);
  }
}
