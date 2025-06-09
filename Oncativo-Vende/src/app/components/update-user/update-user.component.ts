import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilsService } from '../../services/utils.service';
import Swal from 'sweetalert2';
import { UserUpdateAdmin } from '../../models/UserUpdateAdmin';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserGet } from '../../models/UserGet';
import { ValidatorService } from '../../services/validator.service';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  @Input() userId!: number;
  @Input() userData!: UserGet;
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  isCompany = false;
  locations: any[] = [];
  roles: any[] = [];
  lastValidSurname = '';

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private locationService: UtilsService,
    private validatorService: ValidatorService,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.isCompany = this.isACompany(this.userData.surname ?? '');

    this.form = this.fb.group({
      name: [this.userData.name, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: [this.userData.surname ?? '', [Validators.maxLength(50)]],
      username: [{value: this.userData.username, disabled: true}],
      email: [this.userData.email, [Validators.required, Validators.email], [this.validatorService.validateUniqueEmailExceptCurrent(this.userId)]],
      location_id: [null, [Validators.required]],
      avatar_url: [this.userData.avatar_url ?? ''],
      roles: [[], [Validators.required]],
      isCompany: [this.isCompany]
    });

    this.loadLocations();
    this.loadRoles();
    this.lastValidSurname = this.userData.surname ?? '';

    this.form.get('isCompany')?.valueChanges.subscribe(value => {
      this.isCompany = value;
      const surnameControl = this.form.get('surname');

      if (value) {
        if (surnameControl?.enabled) {
          this.lastValidSurname = surnameControl.value;
        }
        surnameControl?.disable();
        surnameControl?.setValue('');
        surnameControl?.clearValidators();
      } else {
        surnameControl?.enable();
        surnameControl?.setValue(this.lastValidSurname);
        surnameControl?.setValidators([Validators.maxLength(50)]);
      }
      surnameControl?.updateValueAndValidity();
    });
  }

  loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        const matchedLocation = this.locations.find(loc => loc.description === this.userData.location);
        if (matchedLocation) {
          this.form.patchValue({ location_id: matchedLocation.id });
        }
      },
      error: (error) => {
        console.log('Error loading locations:', error);
      }
    });
  }

loadRoles() {
  this.utilsService.getRoles().subscribe({
    next: (data) => {
      this.roles = data.filter(role => role.description !== 'PREMIUM');

      if (Array.isArray(this.userData.roles) && this.userData.roles.length > 0) {
        const matchedRoleIds = this.roles
          .filter(role => this.userData.roles.includes(role.description))
          .map(role => role.id);

        if (matchedRoleIds.length > 0) {
          this.form.patchValue({ roles: matchedRoleIds });
        }
      }
    },
    error: (error) => {
      console.log('Error loading roles:', error);
    }
  });
}

  isACompany(surname: string): boolean {
    return !surname || surname === "";
  }

  onValidate(controlName: string) {
    const control = this.form.get(controlName);
    return {
      'is-invalid': control?.invalid && (control.dirty || control.touched),
      'is-valid': control?.valid && (control.dirty || control.touched)
    };
  }

  close() {
    this.closeModal.emit(); // Solo emitir el evento
  }

  showError(controlName: string): string {
    const control = this.form.get(controlName);

    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
      switch (errorKey) {
        case 'required':
          return 'Este campo es obligatorio.';
        case 'minlength':
          return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'email':
          return 'Formato de email inválido.';
        case 'emailTaken':
          return 'El email ya está en uso.';
        case 'usernameTaken':
          return 'El nombre de usuario ya está en uso.';
        default:
          return 'Campo inválido.';
      }
    }
    return '';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isCompanyValue = this.form.get('isCompany')!.value;
    const surnameValue = this.form.get('surname')!.value;

    const dto: UserUpdateAdmin = new UserUpdateAdmin(
      this.form.get('name')!.value,
      isCompanyValue ? '' : surnameValue,
      this.form.get('email')!.value,
      this.form.get('location_id')!.value,
      this.form.get('roles')!.value
    );

    this.userService.putUser(dto, this.userId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Usuario actualizado',
          text: 'Se actualizaron correctamente los datos del usuario',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false  
        }).then(() => {
          this.close(); // Cerrar el modal después del éxito
        });
      },
      error: (error) => {
        console.error('Error updating user:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron actualizar los datos del usuario',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}