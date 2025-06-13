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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  authService = inject(AuthService);
  subscriptionService = inject(SubscriptionsService);
  mpService = inject(MercadoPagoService);
  userService = inject(UsersService);
  userEmail: string = '';

  userLoged: UserLoged = new UserLoged();
  user: UserGet = new UserGet();
  existingSubscription: SubscriptionGet = new SubscriptionGet();

  currentDiscount: number = 0;
  showDiscountModal: boolean = false;
  isUpdatingDiscount: boolean = false;
  discountForm: FormGroup;

  constructor() {
    this.discountForm = this.fb.group({
      discount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(99),
        Validators.pattern(/^\d{1,3}$/)
      ]]
    });
  }

  readonly basePrices = {
    bronce: 1500,
    plata: 7500,
    oro: 12000
  };

  ngOnInit(): void {
    this.userLoged = this.authService.getUser();
    
    this.loadCurrentDiscount();
    
    if (this.authService.hasRole('PREMIUM')) {
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

  loadCurrentDiscount(): void {
    this.subscriptionService.getSubscriptionDiscount().subscribe({
      next: (discount: number) => {
        this.currentDiscount = discount;
        this.discountForm.patchValue({ discount: discount });
      },
      error: (error) => {
        console.error('Error loading discount:', error);
        this.currentDiscount = 0;
        this.discountForm.patchValue({ discount: 0 });
      }
    });
  }

  loadSubscription(user_id: number): void {
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

  getDiscountedPrice(basePrice: number): number {
    if (this.currentDiscount > 0) {
      return Math.round(basePrice * (1 - this.currentDiscount / 100));
    }
    return basePrice;
  }

  getMonthlyPrice(basePrice: number, months: number): number {
    const discountedPrice = this.getDiscountedPrice(basePrice);
    return Math.round(discountedPrice / months);
  }

  getMonthlySavings(basePrice: number, months: number): number {
    const regularMonthlyPrice = this.getDiscountedPrice(this.basePrices.bronce);
    const discountedMonthlyPrice = this.getMonthlyPrice(basePrice, months);
    return regularMonthlyPrice - discountedMonthlyPrice;
  }

  getPreviewDiscountedPrice(basePrice: number, discount: number): number {
    if (discount > 0) {
      return Math.round(basePrice * (1 - discount / 100));
    }
    return basePrice;
  }

  get discountValue(): number {
    return this.discountForm.get('discount')?.value || 0;
  }

  get discountControl() {
    return this.discountForm.get('discount');
  }

  get isDiscountInvalid(): boolean {
    return this.discountControl?.invalid && (this.discountControl?.dirty || this.discountControl?.touched) || false;
  }

  get discountErrorMessage(): string {
    const control = this.discountControl;
    if (control?.hasError('required')) {
      return 'El descuento es requerido';
    }
    if (control?.hasError('min')) {
      return 'El descuento no puede ser menor a 0';
    }
    if (control?.hasError('max')) {
      return 'El descuento no puede ser mayor a 99';
    }
    if (control?.hasError('pattern')) {
      return 'Ingrese solo números enteros';
    }
    return '';
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  openDiscountModal(): void {
    this.discountForm.patchValue({ discount: this.currentDiscount });
    this.showDiscountModal = true;
  }

  closeDiscountModal(): void {
    this.showDiscountModal = false;
    this.discountForm.patchValue({ discount: this.currentDiscount });
    this.discountForm.markAsUntouched();
  }

  updateDiscount(): void {
    if (this.discountForm.invalid) {
      this.discountForm.markAllAsTouched();
      return;
    }

    const newDiscountValue = this.discountValue;
    this.isUpdatingDiscount = true;
    
    this.subscriptionService.putSuscriptionDiscount(newDiscountValue).subscribe({
      next: () => {
        this.currentDiscount = newDiscountValue;
        this.closeDiscountModal();
        this.isUpdatingDiscount = false;
        Swal.fire({
          title: 'Descuento actualizado',
          text: `El descuento se ha actualizado a ${newDiscountValue}%`,
          icon: 'success',
          showConfirmButton:false,
          timer: 2000
        });
      },
      error: (error) => {
        console.error('Error updating discount:', error);
        this.isUpdatingDiscount = false;
        Swal.fire({
          title: 'Error al actualizar el descuento',
          text: 'Por favor, intente nuevamente más tarde.',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000
        })
      }
    });
  }

  pay(nombre: string, monto: number): void {
    const email = this.userEmail;
    const discountedAmount = this.getDiscountedPrice(monto);

    this.mpService.createPayment(discountedAmount, nombre, email, this.userLoged.id.toString()).subscribe({
      next: (response) => {
        this.authService.logOut();
        window.location.href = response.initPoint;
      },
      error: (error) => {
        console.error('Error al generar la preferencia de pago:', error);
      }
    });
  }
}