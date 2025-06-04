import { Component, NgZone, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import * as L from 'leaflet';
import { UsersService } from '../../services/users.service';
import { UserGet } from '../../models/UserGet';

@Component({
  selector: 'app-new-publication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './new-publication.component.html',
  styleUrls: ['./new-publication.component.css']
})
export class NewPublicationComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  step = 2;
  form: FormGroup;
  private map!: L.Map;
  private marker!: L.Marker;

  uploadedImagePaths: string[] = [];

  locations: { id: number; description: string }[] = [];
  categories: { id: number; description: string }[] = [];
  tags: { id: number; description: string }[] = [];
  contactTypes: { id: number; description: string }[] = [];
  imageSlots: (File | null)[] = [null, null, null];
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
    this.loadSelectData();
    this.loadUserData(this.authService.getUser().id);
  }

  ngAfterViewInit(): void {
    this.form.get('location_id')?.valueChanges.subscribe(() => {
      if (this.map) {
        this.map.remove(); 
      }
      this.initMap(); 
    });
  }

    loadUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (userData: UserGet) => {
        this.user = userData;
        if (this.contacts.length === 0) {
        this.addContact();
        }
      }
    });
  }

initMap(): void {
  const locationId = this.form.get('location_id')?.value;
  const coords = this.locationCoordinates[locationId] || [-31.9135, -63.6823]; // Oncativo por defecto

  this.map = L.map(this.mapContainer.nativeElement).setView(coords, 13);

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

  this.map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    this.updateMarkerPosition(lat, lng);
  });

  this.marker.on('dragend', (e: L.DragEndEvent) => {
    const { lat, lng } = e.target.getLatLng();
    this.updateMarkerPosition(lat, lng);
  });

  this.getCurrentLocation();
}

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.map.setView([lat, lng], 15);
          this.updateMarkerPosition(lat, lng);
        },
        (error) => {
          console.log('No se pudo obtener la ubicación actual:', error);
        }
      );
    }
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

  loadSelectData(): void {
    this.utilsService.getLocations().subscribe(data => this.locations = data);
    this.publicationService.getCategories().subscribe(data => this.categories = data);
    this.utilsService.getContactsTypes().subscribe(data => this.contactTypes = data);
  }

  get contacts(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  addContact(): void {
  const contactForm = this.fb.group({
    contact_type_id: [5, Validators.required],
    contact_value: [this.user.email, Validators.required]
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

hasAtLeastOneImage(): boolean {
  return this.imageSlots.some(img => img != null);
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
      latitude: this.form.value.latitude,
      longitude: this.form.value.longitude,
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
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la publicación',
          text: err.error.message || 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.',
          showConfirmButton:false,
          timer: 2000
        });
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