import { Component, NgZone, OnInit } from '@angular/core';
import { PublicationPost } from '../../models/PublicationPost';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PublicationsService } from '../../services/publications.service';
import { FileService } from '../../services/file.service';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-publication',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,NgSelectModule],
  templateUrl: './new-publication.component.html',
  styleUrls: ['./new-publication.component.css']
})
export class NewPublicationComponent implements OnInit {
  step = 1;
  form: FormGroup;

  uploadedImagePaths: string[] = [];

  locations: { id: number; description: string }[] = [];
  categories: { id: number; description: string }[] = [];
  tags: { id: number; description: string }[] = [];
  contactTypes: { id: number; description: string }[] = [];
  imageSlots: (File | null)[] = [null, null, null];
  selectedImages: File[] = [];

  conditionOptions = [
    { id: 1, description: "Nuevo" },
    { id: 2, description: "Usado" }
  ];

  priceOptions = [
    { id: 4, description: "Precio negociable" },
    { id: 5, description: "Precio fijo" }
  ];

  shippingOptions = [
    { id: 3, description: "Envío incluido" },
    { id: 6, description: "Retiro en mano" },
    { id: 7, description: "Punto de encuentro" }
  ];

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationsService,
    private fileService: FileService,
    private utilsService: UtilsService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [null, [Validators.required, Validators.min(1)]],
      location_id: [null, Validators.required],
      categories: [null, Validators.required],
      conditionTag: [null, Validators.required],
      priceTag: [null, Validators.required],
      shippingTag: [[], Validators.required],
      contacts: this.fb.array([])
    });

  }


  ngOnInit(): void {
    this.loadSelectData();
    if (this.contacts.length === 0) {
      this.addContact();
    }
  }

trackByIndex(index: number, item: any): any {
  return index;
}


  loadSelectData(): void {
    this.utilsService.getLocations().subscribe(data => this.locations = data);
    this.publicationService.getCategories().subscribe(data => this.categories = data);
    this.utilsService.getContactsTypes().subscribe(data => this.contactTypes = data);
  }

  get contacts(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  addContact(): void {
    this.contacts.push(this.fb.group({
      contact_type_id: [null, Validators.required],
      contact_value: ['', Validators.required]
    }));
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  onCategoriesChange(selected: any[]) {
  if (selected.length > 2) {
    selected.pop();
    this.form.get('categories')?.setValue(selected);
  }
}

  nextStep(): void {
  console.log('👉 Valores del formulario al intentar avanzar:', this.form.value); 
  console.log(this.selectedImages);
  console.log(this.imageSlots);
  const hasFilesToUpload = this.imageSlots.some(img => img instanceof File);

  if (this.step === 1) {
    const requiredFields = ['title', 'description', 'price', 'location_id', 'categories', 'conditionTag', 'priceTag', 'shippingTag'];
    const allValid = requiredFields.every(field => this.form.get(field)?.valid);

    if (allValid) {
      this.step++;
    } else {
      requiredFields.forEach(field => this.form.get(field)?.markAsTouched());
      console.warn('Faltan campos obligatorios en el paso 1');
    }

  } else if (this.step === 2) {
    if (hasFilesToUpload) {
      this.uploadImages(); 
    } else {
      this.uploadedImagePaths = []; 
      this.step++;
    }
  }
}

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  uploadImages(): void {
  const userId = this.authService.getUser().id;
  const tempPublicationId = Date.now();

  const validFiles = this.imageSlots.filter((f): f is File => f instanceof File);
  console.log('Archivos a subir:', validFiles);

  const uploadPromises = validFiles.map((file, index) =>
    this.fileService.uploadPublicationPic(tempPublicationId, userId, index + 1, file).toPromise()
  );

  Promise.all(uploadPromises)
    .then(urls => {
      this.uploadedImagePaths = urls.filter((url): url is string => typeof url === 'string');
      this.step++;
    })
    .catch(err => {
      console.error('Error al subir imágenes', err);
      alert('Error al subir imágenes, intenta nuevamente.');
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa todos los campos requeridos antes de publicar.');
      return;
    }

    const contacts = this.contacts.controls.map(ctrl => ({
      contact_type_id: ctrl.get('contact_type_id')?.value,
      contact_value: ctrl.get('contact_value')?.value
    }));

    const publication = {
      user_id: this.authService.getUser().id,
      title: this.form.value.title,
      description: this.form.value.description,
      price: this.form.value.price,
      location_id: this.form.value.location_id,
      categories: this.form.value.categories,
      tags: [this.form.value.conditionTag, this.form.value.priceTag, this.form.value.shippingTag],
      images: this.uploadedImagePaths,
      contacts: contacts
    };

    this.publicationService.createPublication(publication).subscribe({
      next: res => {
        this.form.reset();
        this.selectedImages = [];
        this.uploadedImagePaths = [];
        this.step = 1;
        this.contacts.clear();
        this.addContact();
        Swal.fire({
          icon: 'success',
          title: '¡Completado!',
          text: 'Publicación creada con éxito',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.router.navigate(['/home']);
        });
      },
      error: err => {
        console.error('Error al crear la publicación', err);
        alert('Error al crear la publicación. Intenta más tarde.');
      }
    });
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

  onSlotImageSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageSlots[index] = file;
    }
  }

    removeImageSlot(index: number): void {
      this.imageSlots[index] = null;
    }

  showError(controlName: string): string {
    const control = this.form.get(controlName);
  
    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
  
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
  
    return '';
  }

}
