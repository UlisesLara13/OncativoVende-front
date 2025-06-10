import { Component, NgZone, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PublicationsService } from '../../services/publications.service';
import { FileService } from '../../services/file.service';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { UsersService } from '../../services/users.service';
import { UserGet } from '../../models/UserGet';

@Component({
  selector: 'app-edit-publication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './edit-publication.component.html',
  styleUrls: ['./edit-publication.component.css']
})
export class EditPublicationComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  publicationId!: number;
  step = 1;
  form: FormGroup;
  private map!: L.Map;
  private marker!: L.Marker;
  isOwner: boolean = false;

  uploadedImagePaths: string[] = [];
  existingImages: string[] = [];
  isLoading = true;

  locations: { id: number; description: string }[] = [];
  categories: { id: number; description: string }[] = [];
  tags: { id: number; description: string }[] = [];
  contactTypes: { id: number; description: string }[] = [];
  imageSlots: (File | string | null)[] = [null, null, null];
  selectedImages: File[] = [];
  userData!: UserGet;
  user: UserGet = new UserGet();

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

  locationCoordinates: { [key: number]: [number, number] } = {
    1: [-31.9135, -63.6823], // Oncativo
    2: [-32.0418, -63.5714], // Oliva
    3: [-31.8431, -63.7454], // Manfredi
    4: [-31.7773, -63.8028], // Laguna Larga
    5: [-31.6824, -63.8852], // Pilar
    6: [-31.6536, -63.9105], // Río Segundo
    7: [-31.5645, -63.5399], // Villa del Rosario
  };

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationsService,
    private fileService: FileService,
    private userService: UsersService,
    private utilsService: UtilsService,
    private router: Router,
    private route: ActivatedRoute,
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
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      contacts: this.fb.array([])
    });
  }

  ngOnInit(): void {
  const userId = this.authService.getUser().id;
  this.publicationId = Number(this.route.snapshot.paramMap.get('id'));

  this.publicationService.isSameUserPublication(this.publicationId, userId)
    .subscribe(isSame => {
      this.isOwner = isSame;
      if (!this.isOwner) {
        this.checkAdmin();
        if (!this.isOwner) {
          this.router.navigate(['unauthorized']);
        }
      }
      this.loadUserData(userId);
      this.loadSelectData().then(() => {
        this.loadPublicationData();
      });
    });
}


ngAfterViewInit(): void {
  this.form.get('location_id')?.valueChanges.subscribe((locationId) => {
    if (locationId && this.locationCoordinates[locationId]) {
      const newCoords = this.locationCoordinates[locationId];
      
      this.form.patchValue({
        latitude: newCoords[0],
        longitude: newCoords[1]
      });
      
      if (this.map) {
        this.map.remove(); 
        this.map = undefined as any;
      }
      
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          this.initMapWithCoords(newCoords);
        }
      }, 100);
    }
  });
}

initMapWithCoords(coords: [number, number]): void {
  if (this.mapContainer && this.mapContainer.nativeElement) {
    const container = this.mapContainer.nativeElement;
    
    try {
      this.map = L.map(container).setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      this.marker = L.marker(coords, {
        icon: customIcon,
        draggable: true
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.updateMarkerPosition(lat, lng);
      });

      this.marker.on('dragend', (e: L.DragEndEvent) => {
        const { lat, lng } = e.target.getLatLng();
        this.updateMarkerPosition(lat, lng);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}

  private getCategoryIdsByNames(categoryNames: string[]): number[] {
  return categoryNames.map(name => {
    const category = this.categories.find(cat => cat.description === name);
    return category ? category.id : null;
  }).filter((id): id is number => id !== null);
}

private getTagIdByName(tagName: string): number | null {
  const tagMapping: { [key: string]: number } = {
    'Nuevo': 1,
    'Usado': 2,
    'Envío incluido': 3,
    'Precio negociable': 4,
    'Precio fijo': 5,
    'Retiro en mano': 6,
    'Punto de encuentro': 7
  };
  
  return tagMapping[tagName] || null;
}

private getContactTypeIdByName(contactTypeName: string): number | null {
  const contactType = this.contactTypes.find(ct => ct.description === contactTypeName);
  return contactType ? contactType.id : null;
}

private getLocationIdByName(locationName: string): number | null {
  const location = this.locations.find(loc => loc.description === locationName);
  return location ? location.id : null;
}

  loadPublicationData(): void {
    this.publicationService.getPublicationById(this.publicationId).subscribe({
      next: (publication) => {
        console.log('Datos de la publicación:', publication);
        this.populateForm(publication);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar la publicación:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la publicación',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['/home']);
        });
      }
    });
  }

  populateForm(publication: any): void {
  const categoryIds = this.getCategoryIdsByNames(publication.categories || []);
  
  const locationId = this.getLocationIdByName(publication.location);

  this.form.patchValue({
    title: publication.title,
    description: publication.description,
    price: publication.price,
    location_id: locationId,
    categories: categoryIds,
    latitude: parseFloat(publication.latitude), 
    longitude: parseFloat(publication.longitude) 
  });

  if (publication.tags && publication.tags.length > 0) {
    publication.tags.forEach((tagName: string) => {
      const tagId = this.getTagIdByName(tagName);
      
      if (tagId) {
        if ([1, 2].includes(tagId)) { // Condición
          this.form.patchValue({ conditionTag: tagId });
        } else if ([4, 5].includes(tagId)) { // Precio
          this.form.patchValue({ priceTag: tagId });
        } else if ([3, 6, 7].includes(tagId)) { // Envío
          this.form.patchValue({ shippingTag: tagId });
        }
      }
    });
  }

  // Cargar contactos con mapeo de tipos
  this.contacts.clear();
  if (publication.contacts && publication.contacts.length > 0) {
    publication.contacts.forEach((contact: any) => {
      const contactTypeId = this.getContactTypeIdByName(contact.contact_type);
      
      if (contactTypeId) {
        const contactForm = this.fb.group({
          contact_type_id: [contactTypeId, Validators.required],
          contact_value: [contact.contact_value, Validators.required]
        });
        this.contacts.push(contactForm);
        
        // Aplicar validaciones específicas por tipo
        setTimeout(() => {
          this.onContactTypeChange(this.contacts.length - 1);
        });
      }
    });
  } else {
    this.addContact();
  }

  // Cargar imágenes existentes
  if (publication.images && publication.images.length > 0) {
    this.existingImages = publication.images;
    publication.images.forEach((imagePath: string, index: number) => {
      if (index < 3) {
        this.imageSlots[index] = imagePath;
      }
    });
  }

  // Inicializar mapa con coordenadas existentes
  setTimeout(() => {
    this.initMap();
  }, 500);
}

  loadUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (userData: UserGet) => {
        this.user = userData;
      }
    });
  }

 initMap(): void {
  const locationId = this.form.get('location_id')?.value;
  const lat = this.form.get('latitude')?.value;
  const lng = this.form.get('longitude')?.value;
  
  let coords: [number, number];
  
  if (locationId && this.locationCoordinates[locationId]) {
    coords = this.locationCoordinates[locationId];
  } else if (lat && lng) {
    coords = [lat, lng];
  } else {
    coords = [-31.9135, -63.6823]; 
  }

  this.initMapWithCoords(coords);
}

  updateMarkerPosition(lat: number, lng: number): void {
    this.marker.setLatLng([lat, lng]);
    this.form.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }

checkAdmin(): void {
      if (this.authService.hasRole('ADMIN')) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
      }
  }

loadSelectData(): Promise<void> {
  return new Promise((resolve) => {
    const promises = [
      this.utilsService.getLocations().toPromise(),
      this.publicationService.getCategories().toPromise(),
      this.utilsService.getContactsTypes().toPromise()
    ];

    Promise.all(promises).then(([locations, categories, contactTypes]) => {
      this.locations = locations || [];
      this.categories = categories || [];
      this.contactTypes = contactTypes || [];
      resolve();
    });
  });
}

  get contacts(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  addContact(): void {
    const contactForm = this.fb.group({
      contact_type_id: [null, Validators.required],
      contact_value: ["", Validators.required]
    });

    this.contacts.push(contactForm);
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  onContactTypeChange(index: number): void {
    const control = this.contacts.at(index);
    const tipo = control.get('contact_type_id')?.value;

    control.get('contact_value')?.clearValidators();

    switch (tipo) {
      case 1: // Whatsapp
        control.get('contact_value')?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]{7,15}$/)
        ]);
        break; 
      case 2: // Facebook
        control.get('contact_value')?.setValidators([
          Validators.required,
          Validators.pattern(/^https?:\/\/.+$/)
        ]);
        break;
      case 3: // Teléfono
        control.get('contact_value')?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]{7,15}$/)
        ]);
        break;
      case 4: // Instagram
        control.get('contact_value')?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._]+$/)
        ]);
        break;
      case 5: // Email
        control.get('contact_value')?.setValidators([
          Validators.required,
          Validators.email
        ]);
        break;
      default:
        control.get('contact_value')?.setValidators(Validators.required);
    }

    control.get('contact_value')?.updateValueAndValidity();
  }

  getPlaceholder(index: number): string {
    const tipo = this.contacts.at(index).get('contact_type_id')?.value;
    switch (tipo) {
      case 1: return 'Ej: 3511234567';
      case 2: return 'Ej: https://facebook.com/usuario';
      case 3: return 'Ej: 3544123456';
      case 4: return 'Ej: nombre.usuario';
      case 5: return 'Ej: usuario@dominio.com';
      default: return '';
    }
  }

  getHelpText(index: number): string | null {
    const tipo = this.contacts.at(index).get('contact_type_id')?.value;
    switch (tipo) {
      case 4: return 'No incluyas el @, solo el nombre de usuario.';
      case 2: return 'Incluye el enlace completo a tu perfil.';
      case 1:
      case 3: return 'Solo números, sin espacios ni símbolos.';
      default: return null;
    }
  }

  showErrorAt(arrayName: string, index: number, controlName: string): string {
    const array = this.form.get(arrayName) as FormArray;
    const control = array.at(index).get(controlName);

    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'pattern':
          return 'El formato ingresado no es válido.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    return '';
  }

  onCategoriesChange(selected: any[]) {
    if (selected.length > 2) {
      selected.pop();
      this.form.get('categories')?.setValue(selected);
    }
  }

  nextStep(): void {
    if (this.step === 1) {
      const requiredFields = ['title', 'description', 'price', 'categories', 'conditionTag', 'priceTag', 'shippingTag'];
      const allValid = requiredFields.every(field => this.form.get(field)?.valid);

      if (allValid) {
        this.step++;
        setTimeout(() => {
          this.initMap();
        }, 100);
      } else {
        requiredFields.forEach(field => this.form.get(field)?.markAsTouched());
        console.warn('Faltan campos obligatorios en el paso 1');
      }

    } else if (this.step === 2) {
      const latitude = this.form.get('latitude')?.value;
      const longitude = this.form.get('longitude')?.value;
      const locationIdValid = this.form.get('location_id')?.valid;

      if (latitude && longitude && locationIdValid) {
        this.step++;
      } else {
        this.form.get('location_id')?.markAsTouched();
        Swal.fire({
          icon: 'warning',
          title: 'Ubicación requerida',
          text: 'Por favor, selecciona una ubicación válida en las opciones disponibles.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } else if (this.step === 3) {
      if (this.hasAtLeastOneImage()) {
        this.uploadNewImages();
      } else {
        this.step++;
      }
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  hasAtLeastOneImage(): boolean {
    return this.imageSlots.some(img => img != null);
  }

  uploadNewImages(): void {
    const userId = this.authService.getUser().id;
    const newFiles = this.imageSlots.filter((f): f is File => f instanceof File);
    
    if (newFiles.length === 0) {
      // No hay nuevas imágenes, mantener las existentes
      this.uploadedImagePaths = this.existingImages;
      this.step++;
      return;
    }

    const uploadPromises = newFiles.map((file, index) =>
      this.fileService.uploadPublicationPic(this.publicationId, userId, index + 1, file).toPromise()
    );

    Promise.all(uploadPromises)
      .then(urls => {
        const newUrls = urls.filter((url): url is string => typeof url === 'string');
        
        // Combinar imágenes existentes con nuevas
        this.uploadedImagePaths = [];
        this.imageSlots.forEach(slot => {
          if (typeof slot === 'string') {
            // Es una imagen existente
            this.uploadedImagePaths.push(slot);
          } else if (slot instanceof File) {
            // Es una nueva imagen, encontrar su URL subida
            const newUrlIndex = newFiles.indexOf(slot);
            if (newUrlIndex !== -1 && newUrls[newUrlIndex]) {
              this.uploadedImagePaths.push(newUrls[newUrlIndex]);
            }
          }
        });
        
        this.step++;
      })
      .catch(err => {
        console.error('Error al subir imágenes', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al subir imágenes, intenta nuevamente.',
          showConfirmButton: false,
          timer: 2000
        });
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa todos los campos requeridos antes de actualizar.',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const contacts = this.contacts.controls.map(ctrl => ({
      contact_type_id: ctrl.get('contact_type_id')?.value,
      contact_value: ctrl.get('contact_value')?.value
    }));

    // Usar imágenes subidas o existentes
    const finalImages = this.uploadedImagePaths.length > 0 ? this.uploadedImagePaths : 
    this.imageSlots.filter(img => typeof img === 'string') as string[];

    const publication = {
      title: this.form.value.title,
      description: this.form.value.description,
      price: this.form.value.price,
      location_id: this.form.value.location_id,
      categories: this.form.value.categories,
      tags: [this.form.value.conditionTag, this.form.value.priceTag, this.form.value.shippingTag],
      images: finalImages,
      latitude: this.form.value.latitude,
      longitude: this.form.value.longitude,
      contacts: contacts
    };

    console.log('Datos de la publicación a actualizar:', publication);

    this.publicationService.updatePublication(this.publicationId, publication).subscribe({
      next: res => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Publicación actualizada con éxito',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.router.navigate(['/publication', this.publicationId]);
        });
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar la publicación',
          text: err.error.message || 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  getImagePreview(item: File | string | null): string {
    if (item instanceof File) {
      return URL.createObjectURL(item);
    } else if (typeof item === 'string') {
      return item; // URL de imagen existente
    }
    return '';
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

  isExistingImage(img: File | string | null): boolean {
    return typeof img === 'string';
  }


  isNewImage(img: File | string | null): boolean {
    return img instanceof File;
  }

  hasImage(img: File | string | null): boolean {
    return img !== null;
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