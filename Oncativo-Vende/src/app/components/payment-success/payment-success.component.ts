import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {

  private readonly router = inject(Router);

  ngOnInit(): void {
    Swal.fire({
      icon: 'success',
      title: '¡Pago exitoso!',
      text: 'Tu suscripción se activó correctamente.',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      this.router.navigate(['/subscriptions']);
    });
  }

}
