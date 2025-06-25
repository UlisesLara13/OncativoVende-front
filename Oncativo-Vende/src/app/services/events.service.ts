import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventPost } from '../models/EventPost';
import { Observable } from 'rxjs';
import { EventGet } from '../models/EventGet';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

    private readonly http: HttpClient = inject(HttpClient);
    private readonly url = 'http://localhost:8080/events';

    
  createEvent(event: EventPost): Observable<EventGet> {
    return this.http.post<EventGet>(this.url, event);
  }

  getEvents(): Observable<EventGet[]> {
    return this.http.get<EventGet[]>(this.url);
  }

  getLastEvent(): Observable<EventGet> {
    return this.http.get<EventGet>(`${this.url}/last`);
  }

  finalizeEvent(eventId: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.url}/finalize/${eventId}`, {});
  }
  
  }



  
