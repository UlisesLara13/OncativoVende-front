import { Component, OnInit } from '@angular/core';
import { EventPost } from '../../models/EventPost';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../services/events.service';
import { UsersService } from '../../services/users.service';
import { FileService } from '../../services/file.service';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserGet } from '../../models/UserGet';

@Component({
  selector: 'app-new-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.css']
})
export class NewEventComponent implements OnInit {
  form: FormGroup;
  users: UserGet[] = [];
  selectedImage: File | null = null;
  uploadedImageUrl: string | null = null;
  minDate: string;
  minEndDate: string;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private usersService: UsersService,
    private fileService: FileService,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.minEndDate = this.minDate;

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      created_by_user_id: [null, Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    }, { validators: this.dateValidator });
  }

  ngOnInit(): void {
    this.loadUsers();
    
    this.form.get('start_date')?.valueChanges.subscribe(startDate => {
      if (startDate) {
        this.minEndDate = startDate;
        
        const currentEndDate = this.form.get('end_date')?.value;
        if (currentEndDate && currentEndDate < startDate) {
          this.form.get('end_date')?.setValue(startDate);
        }
        
        this.form.get('end_date')?.updateValueAndValidity();
      }
    });
  }

  dateValidator(group: FormGroup) {
    const startDate = group.get('start_date')?.value;
    const endDate = group.get('end_date')?.value;

    if (startDate && endDate && startDate > endDate) {
      return { dateRange: true };
    }
    return null;
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users: UserGet[]) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: 'Solo se permiten archivos JPG, JPEG y PNG.',
          showConfirmButton: false,
          timer: 2000
        });
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El archivo no puede ser mayor a 5MB.',
          showConfirmButton: false,
          timer: 2000
        });
        event.target.value = '';
        return;
      }

      this.selectedImage = file;
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.uploadedImageUrl = null;
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
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
          return 'Este campo es obligatorio.';
        case 'minlength':
          return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        default:
          return 'Campo inválido.';
      }
    }

    if (this.form.errors && this.form.errors['dateRange']) {
      if (controlName === 'start_date' || controlName === 'end_date') {
        return 'La fecha de fin debe ser igual o posterior a la fecha de inicio.';
      }
    }

    return '';
  }

  private uploadImage(): Promise<string | null> {
    if (!this.selectedImage) {
      return Promise.resolve(null);
    }

    const tempEventId = Date.now();

    return this.fileService.uploadEventPic(tempEventId, this.selectedImage).toPromise()
      .then(imageUrl => {
        this.uploadedImageUrl = imageUrl || null;
        return this.uploadedImageUrl;
      })
      .catch(error => {
        console.error('Error al subir imagen:', error);
        throw error;
      });
  }

  private formatDateForBackend(dateString: string): string {
    return dateString.split('T')[0];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    if (this.selectedImage) {
      this.uploadImage()
        .then(imageUrl => {
          this.createEventWithImage(imageUrl);
        })
        .catch(err => {
          console.error('Error al subir imagen:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error al subir imagen',
            text: 'Ocurrió un error al subir la imagen. Por favor, inténtalo de nuevo.',
            showConfirmButton: false,
            timer: 2000
          });
        });
    } else {
      this.createEventWithImage(null);
    }
  }

  goToEvents(): void {
    this.router.navigate(['/events']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private createEventWithImage(imageUrl: string | null): void {
    const eventData: any = {
      title: this.form.value.title,
      created_by_user_id: this.form.value.created_by_user_id,
      start_date: this.formatDateForBackend(this.form.value.start_date),
      end_date: this.formatDateForBackend(this.form.value.end_date)
    };

    if (this.form.value.description && this.form.value.description.trim()) {
      eventData.description = this.form.value.description;
    }

    if (imageUrl) {
      eventData.image_url = imageUrl;
    }


    console.log('Datos a enviar:', eventData);

    this.eventsService.createEvent(eventData).subscribe({
      next: (createdEvent) => {
        this.form.reset();
        this.selectedImage = null;
        this.uploadedImageUrl = null;

        Swal.fire({
          icon: 'success',
          title: '¡Evento creado!',
          text: 'El evento se ha creado exitosamente.',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.goToEvents();
        });
      },
      error: (err) => {
        console.error('Error al crear evento:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Ocurrió un error al crear el evento.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  cancel(): void {
    if (this.form.dirty) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se perderán todos los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.goToEvents();
        }
      });
    } else {
      this.goToEvents();
    }
  }
}