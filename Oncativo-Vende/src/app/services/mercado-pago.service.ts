import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRequest } from '../models/Payments';
import { PaymentResponse } from '../models/Payments';
import { PaymentItem } from '../models/Payments';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

    private readonly http: HttpClient = inject(HttpClient);
    private readonly url = 'http://localhost:8080/payments';

  createPayment(price: number,type: string , userEmail: string, userId: string): Observable<PaymentResponse> {
    const paymentRequest: PaymentRequest = {
      amount: price,
      description: `${type}`,
      payerEmail: userEmail,
      externalReference: userId,
      items: [
        {
          title: `Suscripción ${type}`,
          description: 'Pago por suscripción premium en Oncativo Vende',
          quantity: 1,
          unitPrice: price
        }
      ]
    };

    return this.http.post<PaymentResponse>(`${this.url}/create-preference`, paymentRequest);
  }

  redirectToPayment(paymentResponse: PaymentResponse): void {
    const paymentUrl = paymentResponse.initPoint;
    window.location.href = paymentUrl;
  }
  
}
