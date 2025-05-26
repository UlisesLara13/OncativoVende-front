import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserLoged } from '../../models/UserLoged';
import { SubscriptionGet } from '../../models/SubscriptionGet';
import { SubscriptionsService } from '../../services/subscriptions.service';
import { CommonModule } from '@angular/common';
import { MercadoPagoService } from '../../services/mercado-pago.service';
import { UserGet } from '../../models/UserGet';
import { UsersService } from '../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  
  private readonly router = inject(Router);
  authService = inject(AuthService);
  subscriptionService = inject(SubscriptionsService);
  mpService = inject(MercadoPagoService);
  userService = inject(UsersService);
  userEmail: string = '';

  userLoged: UserLoged = new UserLoged();
  user: UserGet = new UserGet();
  existingSubscription: SubscriptionGet = new SubscriptionGet();

  ngOnInit(): void {
    this.userLoged = this.authService.getUser();
    if ( this.authService.hasRole('PREMIUM')){
      this.loadSubscription(this.userLoged.id);
    }

    this.userService.getUserById(this.userLoged.id).subscribe({
      next: (data: UserGet) => {
        this.user = data;
        this.userEmail = this.user.email || ''; 
      },
      error: (error) => {
        console.error('Error loading user:', error);
      }
    });
  }

  loadSubscription(user_id: number ): void {
    this.subscriptionService.getSubscription(user_id).subscribe({
      next: (data: SubscriptionGet) => {
      this.existingSubscription = data;
      },
      error: (error) => {
      console.error('Error loading subscription:', error);
      }
    });
  }

  formatDate(dateStr: string): string {
    return dateStr ? dateStr.replace(/-/g, '/') : '';
  }

 pay(nombre: string, monto: number): void {
  const container = document.getElementById('wallet_container');
  if (container) container.innerHTML = ''; 

  const email = this.userEmail || ''; 

  this.mpService.createPayment(monto, nombre, email).subscribe({
    next: (response) => {
      const script = document.createElement('script');
      script.src = 'https://www.mercadopago.com.ar/integrations/v1/web-payment-checkout.js';
      script.setAttribute('data-preference-id', response.preferenceId);
      script.setAttribute('data-button-label', `Pagar ${nombre}`);
      container?.appendChild(script);
    },
    error: (error) => {
      console.error('Error al generar la preferencia de pago:', error);
    }
  });
}

}
