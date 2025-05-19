import { Component, NgZone, OnInit } from '@angular/core';
import { PublicationPost } from '../../models/PublicationPost';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PublicationsService } from '../../services/publications.service';
import { FileService } from '../../services/file.service';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-new-publication',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './new-publication.component.html',
  styleUrls: ['./new-publication.component.css']
})
export class NewPublicationComponent implements OnInit {
  step = 1;
  form: FormGroup;

  selectedImages: File[] = [];
  uploadedImagePaths: string[] = [];

  locations: { id: number; description: string }[] = [];
  categories: { id: number; description: string }[] = [];
  tags: { id: number; description: string }[] = [];
  contactTypes: { id: number; description: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationsService,
    private fileService: FileService,
    private utilsService: UtilsService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      location_id: [null, Validators.required],
      categories: [[], Validators.required],
      tags: [[]],
      contacts: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSelectData();
    if (this.contacts.length === 0) {
      this.addContact();
    }
  }

  loadSelectData(): void {
    this.utilsService.getLocations().subscribe(data => this.locations = data);
    this.publicationService.getCategories().subscribe(data => this.categories = data);
    this.utilsService.getTags().subscribe(data => this.tags = data);
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

  onImageSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedImages.push(files[i]);
    }
  }

  nextStep(): void {
  console.log('👉 Valores del formulario al intentar avanzar:', this.form.value);   
  if (this.step === 1) {
    const requiredFields = ['title', 'description', 'price', 'location_id', 'categories'];
    const allValid = requiredFields.every(field => this.form.get(field)?.valid);

    if (allValid) {
      this.step++;
    } else {
      requiredFields.forEach(field => this.form.get(field)?.markAsTouched());
      console.warn('Faltan campos obligatorios en el paso 1');
    }

  } else if (this.step === 2) {
    this.uploadImages();
  }
}

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  uploadImages(): void {
    const userId = this.authService.getUser().id;
    const tempPublicationId = Date.now(); // para simular un id temporal

    const uploadPromises = this.selectedImages.map((file, index) =>
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
      tags: this.form.value.tags,
      images: this.uploadedImagePaths,
      contacts: contacts
    };

    this.publicationService.createPublication(publication).subscribe({
      next: res => {
        alert('Publicación creada con éxito');
        this.form.reset();
        this.selectedImages = [];
        this.uploadedImagePaths = [];
        this.step = 1;
        this.contacts.clear();
        this.addContact();
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
}
