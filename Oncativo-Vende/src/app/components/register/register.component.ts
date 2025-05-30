import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ValidatorService } from '../../services/validator.service';
import { UsersService } from '../../services/users.service';
import { UserPost } from '../../models/UserPost';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

    private readonly router = inject(Router);
    private readonly validatorService = inject(ValidatorService);
    private readonly userService = inject(UsersService);
    private readonly fb = inject(FormBuilder);

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
      password: ['', [Validators.required, Validators.minLength(8),Validators.maxLength(30)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [this.validatorService.matchFields('password', 'confirmPassword')]
    });

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
        location_id: 1,
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
            return 'Debe aceptar el campo requerido para continuar.';
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
}
