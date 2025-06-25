import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilsService } from '../../services/utils.service';
import Swal from 'sweetalert2';
import { PersonalDataPut } from '../../models/PersonalDataPut';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserGet } from '../../models/UserGet';
import { ValidatorService } from '../../services/validator.service';

@Component({
  selector: 'app-update-personal-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgSelectModule],
  templateUrl: './update-personal-data.component.html',
  styleUrl: './update-personal-data.component.css'
})
export class UpdatePersonalDataComponent implements OnInit {

  @Input() userId!: number;
  @Input() userData!: UserGet;
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  isCompany = false;
  locations: any[] = [];
  modalVisible = true;
  lastValidSurname = '';


  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private locationService: UtilsService,
    private validatorService: ValidatorService
  ) {}

  ngOnInit(): void {
    this.isCompany = this.isACompany(this.userData.surname ?? '');

    this.form = this.fb.group({
      name: [this.userData.name, [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      surname: [this.userData.surname ?? '', [Validators.maxLength(15)]],
      email: [this.userData.email, [Validators.required, Validators.email],[this.validatorService.validateUniqueEmailExceptCurrent(this.userId)]],
      location_id: [null],
      isCompany: [this.isCompany]
    });

    this.loadLocations();
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
  } else {
    surnameControl?.enable();
    surnameControl?.setValue(this.lastValidSurname);
  }
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

  isACompany(surname: string): boolean {
    if (!surname || surname === "") {
      return true;
    }
    return false;
  }

  onValidate(controlName: string) {
    const control = this.form.get(controlName);
    return {
      'is-invalid': control?.invalid && (control.dirty || control.touched),
      'is-valid': control?.valid
    };
  }

  close() {
    this.modalVisible = false;
    this.closeModal.emit();
  }

  showError(controlName: string): string {
    const control = this.form.get(controlName);

    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'minlength':
          return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'email':
          return 'Formato de email inválido.';
        case 'emailTaken':
          return 'El email ya está en uso.';
        default:
          return 'Campo inválido.';
      }
    }

    return '';
  }

onSubmit() {
  if (this.form.invalid) return;

  console.log('isCompany:', this.isCompany);
  console.log('surname value:', this.form.get('surname')!.value);

  const isCompanyValue = this.form.get('isCompany')!.value;
  const surnameValue = this.form.get('surname')!.value;

  const dto: PersonalDataPut = {
    name: this.form.get('name')!.value,
    email: this.form.get('email')!.value,
    location_id: this.form.get('location_id')!.value,
    surname: isCompanyValue ? undefined : surnameValue
  };

    this.userService.updatePersonalData(dto, this.userId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Datos actualizados',
          text: 'Se actualizaron correctamente los datos personales',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false  
        }).then(() => {
          this.close();
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron actualizar los datos personales',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

}
