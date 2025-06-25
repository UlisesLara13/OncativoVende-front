import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  @Input() email: string = "";
  @Output() close = new EventEmitter<void>();
  private readonly userService = inject(UsersService);

  modalVisible = true;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  form = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(30),
    ]),
    confirmNewPassword: new FormControl('', [Validators.required, this.passwordValidator()])
  });

  passwordValidator() : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const form = control.parent;
      if(!form){
        return null;
      }
      
      return form.get('newPassword')?.value === form.get('confirmNewPassword')?.value
      ? null : { passwordsDifferent: true };
    }
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onClose(): void {
    this.modalVisible = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.form.valid) {

      const changePasswordDto = {
        email: this.email,
        currentPassword: this.form.controls['currentPassword'].value!,
        newPassword: this.form.controls['newPassword'].value!
      };

      this.userService.changePassword(changePasswordDto).subscribe({
        next: (response) => {
        
            Swal.fire({
            title: 'Contraseña cambiada',
            text: 'La contraseña se ha cambiado correctamente',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
            });
          this.form.reset();
          this.onClose();
        },
        error: (error) => {

          if(error.status === 401 && error.error.message === 'Current password is incorrect.') {
            this.form.controls['currentPassword'].setErrors({ incorrectPassword: true });
            return;
          }
          Swal.fire({
            title: 'Error',
            text: 'Error al actualizar la contraseña',
            timer: 2000,
            icon: 'error',
            showConfirmButton: false
          });
        }
      });
    }
  }

  onValidate(controlName: string) {
    const control = this.form.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  showError(controlName: string): string {
    const control = this.form.get(controlName);
  
    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
  
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'passwordsDifferent':
          return 'Las contraseñas no coinciden.';
        case 'incorrectPassword':
          return 'La contraseña actual es incorrecta.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    return '';
  }

}
