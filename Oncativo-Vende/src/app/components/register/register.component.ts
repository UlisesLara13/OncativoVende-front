import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ValidatorService } from '../../services/validator.service';
import { UsersService } from '../../services/users.service';
import { UtilsService } from '../../services/utils.service';
import { UserPost } from '../../models/UserPost';
import { LocationGet } from '../../models/LocationGet';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule, NgSelectModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

    private readonly router = inject(Router);
    private readonly validatorService = inject(ValidatorService);
    private readonly userService = inject(UsersService);
    private readonly utilsService = inject(UtilsService);
    private readonly fb = inject(FormBuilder);

    locations: LocationGet[] = [];
    loadingLocations = false;

    form: FormGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)],],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      email: ['', 
        [Validators.required, Validators.email], 
        [this.validatorService.validateUniqueEmail()]
      ],
      username: ['', 
        [Validators.required, Validators.minLength(5)], 
        [this.validatorService.validateUniqueUsername()]
      ],
      locationId: [null, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8),Validators.maxLength(30)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: [this.validatorService.matchFields('password', 'confirmPassword')]
    });

    ngOnInit() {
      this.loadLocations();
    }

    loadLocations() {
      this.loadingLocations = true;
      this.utilsService.getLocations().subscribe({
        next: (locations) => {
          this.locations = locations;
          this.loadingLocations = false;
        },
        error: (error) => {
          console.error('Error loading locations:', error);
          this.loadingLocations = false;
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las localidades. Intente nuevamente.',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    }

    onSubmit() {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
  
        const user: UserPost = {
        name: this.form.value.firstName,
        surname: this.form.value.lastName,
        email: this.form.value.email,
        username: this.form.value.username,
        location_id: this.form.value.locationId,
        roles: [1],
        password: this.form.value.password
      };
  
      this.userService.postUser(user).subscribe({
        next: () => {
          Swal.fire({
            title: 'Registro exitoso',
            text: 'Usuario registrado correctamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el usuario. Intente nuevamente.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    }
  
    showError(controlName: string): string | null {
      const control = this.form.get(controlName);
    
      if (control && control.touched && control.errors) {
        const [errorKey] = Object.keys(control.errors);
    
        switch (errorKey) {
          case 'required':
            return 'Este campo no puede estar vacío.';
          case 'email':
            return 'Formato de correo electrónico inválido.';
          case 'minlength':
            return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
          case 'maxlength':
            return `Debe tener como máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
          case 'min':
            return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
          case 'pattern':
            return 'El formato ingresado no es válido.';
          case 'requiredTrue':
            return 'Debe aceptar los términos y condiciones para continuar.';
          case 'usernameTaken':
            return 'Este nombre de usuario ya está en uso.';
          case 'emailTaken':
            return 'Este correo electrónico ya está registrado.';
          case 'dniTaken':
            return 'Este DNI ya está en uso.';
          case 'notMatch':
            return 'Las contraseñas no coinciden.';
          case 'serverError':
            return 'Error de servidor. Intente nuevamente más tarde.';
          default:
            return 'Error no identificado en el campo.';
        }
      }
    
      return null;
    }

    onValidate(controlName: string) {
      const control = this.form.get(controlName);
      return {
        'is-invalid': control?.invalid && (control?.dirty || control?.touched),
        'is-valid': control?.valid
      }
    }

    showTermsAndConditions() {
      Swal.fire({
        title: 'Términos y Condiciones - Oncativo Vende',
        html: `
          <div style="text-align: justify; max-height: 450px; overflow-y: auto; padding: 10px; font-size: 14px; line-height: 1.4;">
            <p><strong>Bienvenido a Oncativo Vende</strong> proporcionado por <strong>Oncativo Vende S.A.</strong> Nos complace ofrecerle acceso al Servicio, sujeto a estos términos y condiciones y a la Política de Privacidad correspondiente.</p>
            
            <h6><strong>Aceptación de Términos</strong></h6>
            <p>Al acceder y utilizar el Servicio, usted expresa su consentimiento y acuerdo con los Términos de Servicio y la Política de Privacidad. Si no está de acuerdo, no utilice el Servicio.</p>
            
            <h6><strong>Descripción del Servicio</strong></h6>
            <p>Oncativo Vende es una plataforma digital que permite a los usuarios suscribirse para publicar productos o servicios para que otros usuarios interesados puedan contactarlos. No intervenimos en las operaciones comerciales ni en los términos pactados entre las partes. Solo facilitamos el contacto entre oferentes y potenciales compradores.</p>
            
            <h6><strong>Requisitos de Usuario</strong></h6>
            <p>Al suscribirse, el usuario declara ser mayor de edad y tener capacidad legal para contratar. El acceso al Servicio está condicionado al cumplimiento de estos Términos. Nos reservamos el derecho de rechazar o cancelar suscripciones por incumplimientos.</p>
            
            <h6><strong>Derechos de la Empresa</strong></h6>
            <p>Oncativo Vende S.A. se reserva todos los derechos no expresamente otorgados en este documento. Esto incluye la posibilidad de modificar, suspender o eliminar funciones, así como cancelar o suspender cuentas sin previo aviso en caso de incumplimiento.</p>
            
            <h6><strong>Funcionamiento del Servicio</strong></h6>
            <p>El Servicio permite publicar avisos clasificados mediante una suscripción mensual, semestral o anual. Los usuarios interesados contactarán directamente con el anunciante. La Compañía no garantiza que se concreten las operaciones ni se responsabiliza por la calidad, estado, cumplimiento o veracidad de los avisos.</p>
            
            <h6><strong>Transacciones</strong></h6>
            <p>No se gestionan pagos ni entregas entre las partes. Toda transacción es responsabilidad exclusiva del vendedor y del comprador.</p>
            
            <h6><strong>Seguridad de Cuenta</strong></h6>
            <p>El acceso es mediante una clave personal, única e intransferible. Oncativo Vende nunca pedirá los datos completos de la cuenta por email o mensaje. El uso indebido de las credenciales es responsabilidad del usuario.</p>
            
            <h6><strong>Cancelación</strong></h6>
            <p>El usuario puede cancelar su suscripción en cualquier momento sin penalidades. En caso de incumplimiento, Oncativo Vende S.A. puede dar de baja la cuenta.</p>
            
            <h6><strong>Propiedad Intelectual</strong></h6>
            <p>El contenido, diseño y desarrollo del software está protegido por la Ley 11.723 de Propiedad Intelectual. Está prohibida su reproducción o modificación sin autorización expresa.</p>
            
            <h6><strong>Protección de Datos</strong></h6>
            <p>El tratamiento de datos personales se realiza según la Política de Privacidad. La información se protege con medidas de seguridad adecuadas y no se comparte con terceros sin consentimiento, salvo requerimiento legal.</p>
          </div>
        `,
        width: '700px',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Acepto los Términos',
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.form.patchValue({ acceptTerms: true });
        }
      });
    }
}