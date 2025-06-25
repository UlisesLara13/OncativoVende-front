import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [],
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css'
})
export class PaymentFailureComponent implements OnInit {

  private readonly router = inject(Router);

  ngOnInit(): void {
    Swal.fire({
      icon: 'error',
      title: 'Pago cancelado',
      text: 'No se completó el pago.',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      this.router.navigate(['/subscriptions']); 
    });
  }

}
