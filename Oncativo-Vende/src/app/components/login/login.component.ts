import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { LoginUser } from '../../models/LoginUser';

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
      Validators.maxLength(50)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
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
        this.router.navigate(['home']);
      
      },
      error: (error) => {
        this.errorLog = true;
      },
    });
  }

}
