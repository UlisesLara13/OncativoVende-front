import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { LoginUser } from '../../models/LoginUser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly router = inject(Router);
  private readonly apiService = inject(UsersService);
  private readonly authService = inject(AuthService);

  errorLog: boolean = false;

  reactiveForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(50)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);
  
    // Solo mostrar errores si el control ha sido tocado o modificado
    if (control && control.errors && (control.touched || control.dirty)) {
      const [errorKey] = Object.keys(control.errors);
  
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `Valor ingresado demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Valor ingresado demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        default:
          return 'Error no identificado en el campo.';
      }
    }
    return ''; // Default return statement to handle all code paths
  }

   //Funcion para loguear, setear el token y redirigir a la pagina de inicio
   async login() {
    this.authService.verifyLogin(this.reactiveForm.value as LoginUser).subscribe({
      next: async (data) => {
        await this.authService.login(data);
        this.errorLog = false;
        this.router.navigate(['/home']);
      
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Usuario o contraseña incorrectos.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false
        });
        this.errorLog = true;
        this.cleanForm();
      },
    });
  }

  //Funcion para limpiar el formulario
  cleanForm() {
    this.reactiveForm.reset();
  }

}
