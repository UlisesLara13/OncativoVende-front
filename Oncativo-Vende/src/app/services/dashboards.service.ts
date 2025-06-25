import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDashboardDto } from '../models/UserDahsboardDto';
import { PublicationDashboardDto } from '../models/PublicationDashboardDto';
import { SubscriptionDashboardDto } from '../models/SubscriptionDashboardDto';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

      private readonly http: HttpClient = inject(HttpClient);
      private readonly url = 'http://localhost:8080/dashboards';

  getUserDashboard(from?: string, to?: string): Observable<UserDashboardDto> {
    let params = new HttpParams();
    
    if (from) {
      params = params.set('from', from);
    }
    
    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<UserDashboardDto>(`${this.url}/users`, { params });
  }

  getPublicationDashboard(from?: string, to?: string): Observable<PublicationDashboardDto> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<PublicationDashboardDto>(`${this.url}/publications`, { params });
  }

  getSubscriptionDashboard(from?: string, to?: string): Observable<SubscriptionDashboardDto> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<SubscriptionDashboardDto>(`${this.url}/subscriptions`, { params });
  } 
}
