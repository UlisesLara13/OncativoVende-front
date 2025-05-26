import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SubscriptionGet } from '../models/SubscriptionGet';
import { Observable } from 'rxjs';
import { SubscriptionPost } from '../models/SubscriptionPost';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

    private readonly http: HttpClient = inject(HttpClient);
    private readonly url = 'http://localhost:8080/subscriptions';

    postSubscription(subscription: SubscriptionPost): Observable<SubscriptionGet> {    
      return this.http.post<SubscriptionGet>(this.url , subscription);
    }
    getSubscription(userId: number): Observable<SubscriptionGet> {
      return this.http.get<SubscriptionGet>(`${this.url}/user/${userId}`);
    }

}
