import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { LoginUser } from '../../models/LoginUser';
import Swal from 'sweetalert2';
import { ValidatorService } from '../../services/validator.service';
import { RecoveryEmailPost } from '../../models/RecoveryEmailPost';

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
  private readonly validatorService = inject(ValidatorService);

  errorLog: boolean = false;
  showRecoveryForm: boolean = false;
  recoveryEmailSentAt: Date | null = null;
  showCodeVerification = false;
  minutes: number = 15;
  seconds: number = 0;
  interval: any;
  codeControls = [0, 1, 2, 3, 4, 5];

  reactiveForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(50)],
    [this.validatorService.validateNotBanned()]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  recoveryForm = new FormGroup({
    recEmail: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.email],[this.validatorService.validateNotBanned(), this.validatorService.validateNotUniqueEmail()]),
  });

  codeForm = new FormGroup({
    code0: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    code1: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    code2: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    code3: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    code4: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    code5: new FormControl('', [Validators.required, Validators.pattern('[0-9]')]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    repeatPassword: new FormControl('', [Validators.required])
  }, { validators: [this.validatorService.matchFields('newPassword', 'repeatPassword')] });

  showError(controlName: string, form: FormGroup): string {
  const control = form.get(controlName);
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
        case 'emailNotTaken':
          return 'El correo electrónico no está asociado a ningún usuario registrado.';
        case 'userBanned':
          return 'Tu cuenta ha sido suspendida. Contacta al administrador para más información.';
        case 'matchFields':
          return 'Las contraseñas no coinciden.';
        case 'pattern':
          return 'El código debe contener solo números.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    return '';
  }

  showCodeError(): string {
    for (const i of this.codeControls) {
      const controlName = 'code' + i;
      const control = this.codeForm.get(controlName);
      if (control && control.errors && (control.touched || control.dirty)) {
        const [errorKey] = Object.keys(control.errors);
        switch (errorKey) {
          case 'required':
            return 'Debes completar todos los dígitos del código.';
          case 'pattern':
            return 'El código debe contener solo números.';
          default:
            return 'Error en el código ingresado.';
        }
      }
    }
    return '';
  }

  onValidateCode() {
    return {};
    }


  onValidate(controlName: string, form: FormGroup) {
    const control = form.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    };
  }

focusNext(event: any, index: number) {
  const input = event.target;
  const value = input.value;
  
  if (value && index < 5) {
    const nextInput = document.querySelector(`input[formControlName="code${index + 1}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }

  if (!value && index > 0) {
    const prevInput = document.querySelector(`input[formControlName="code${index - 1}"]`) as HTMLInputElement;
    if (prevInput) {
      prevInput.focus();
    }
  }
}

onKeyDown(event: KeyboardEvent, index: number) {
  const input = event.target as HTMLInputElement;
  
  if (event.key === 'Backspace' && !input.value && index > 0) {
    const prevInput = document.querySelector(`input[formControlName="code${index - 1}"]`) as HTMLInputElement;
    if (prevInput) {
      prevInput.focus();
      event.preventDefault();
    }
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    const prevInput = document.querySelector(`input[formControlName="code${index - 1}"]`) as HTMLInputElement;
    if (prevInput) {
      prevInput.focus();
      event.preventDefault();
    }
  }
  
  if (event.key === 'ArrowRight' && index < 5) {
    const nextInput = document.querySelector(`input[formControlName="code${index + 1}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
      event.preventDefault();
    }
  }
  
  if (!/[0-9]/.test(event.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
}

onPaste(event: ClipboardEvent, index: number) {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '');
  
  if (digits.length > 0) {
    for (let i = 0; i < digits.length && (index + i) < 6; i++) {
      const controlName = `code${index + i}`;
      this.codeForm.get(controlName)?.setValue(digits[i]);
    }
    
    const nextIndex = Math.min(index + digits.length, 5);
    const nextInput = document.querySelector(`input[formControlName="code${nextIndex}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }
}

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

  cleanForm() {
    this.reactiveForm.reset();
  }

getFirstInvalidCodeControl(): string {
  for (const i of this.codeControls) {
    const controlName = 'code' + i;
    const control = this.codeForm.get(controlName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      return controlName;
    }
  }
  return this.codeControls.length > 0 ? 'code0' : ''; 
}

startTimer() {
  this.minutes = 15;
  this.seconds = 0;
  this.interval = setInterval(() => {
    if (this.seconds > 0) {
      this.seconds--;
    } else {
      if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        clearInterval(this.interval);
        Swal.fire({
          icon: 'warning',
          title: 'Código expirado',
          text: 'El tiempo para ingresar el código ha expirado. Intenta recuperarlo nuevamente.',
        });
        this.showCodeVerification = false;
        this.showRecoveryForm = true;
      }
    }
  }, 1000);
}

  recoverPassword() {
  if (this.recoveryForm.invalid) return;

  const dto: RecoveryEmailPost = {
    emailOrUsername: this.recoveryForm.value.recEmail!
  };

  this.authService.recoverPassword(dto).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Hemos enviado un enlace de recuperación a tu correo.',
        timer: 2500,
        showConfirmButton: false,
      });
      this.showRecoveryForm = false;
      this.showCodeVerification = true;
      this.startTimer();
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el correo. Verifica el e-mail ingresado.',
        timer: 2500,
        showConfirmButton: false,
      });
    }
  });
}

confirmRecoveryCode() {
  if (this.codeForm.invalid) return;

  const code = Array.from({ length: 6 }, (_, i) => this.codeForm.get('code' + i)?.value).join('');
  const newPassword = this.codeForm.value.newPassword!;
  const repeatPassword = this.codeForm.value.repeatPassword!;

  if (newPassword !== repeatPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Las contraseñas no coinciden.',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const dto: { emailOrUsername: string; code: string; newPassword: string } = {
    emailOrUsername: this.recoveryForm.value.recEmail!,
    code,
    newPassword
  };

  this.authService.resetPassword(dto).subscribe({
    next: () => {
      clearInterval(this.interval);
      Swal.fire({
        icon: 'success',
        title: 'Contraseña restablecida',
        text: 'Tu contraseña ha sido actualizada exitosamente.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/login']);
      });
      this.showCodeVerification = false;
      this.codeForm.reset();
      this.reactiveForm.reset();
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El código ingresado es incorrecto o ha expirado.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}

cancelVerification() {
  clearInterval(this.interval);
  this.showCodeVerification = false;
  this.showRecoveryForm = false;
  this.codeForm.reset();
}
}