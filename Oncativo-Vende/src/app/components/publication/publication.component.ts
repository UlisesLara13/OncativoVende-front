import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';
import { PublicationGet } from '../../models/PublicationGet';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../services/favorite.service';
import { UserLoged } from '../../models/UserLoged';
import { Toast } from 'bootstrap';
import { RatingGet } from '../../models/RatingGet';
import { RatingPost } from '../../models/RatingPost';
import { RatingService } from '../../services/rating.service';
import { FormsModule } from '@angular/forms';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';
import { ViewMapComponent } from "../view-map/view-map.component";
import { ReportModalComponent } from "../report-modal/report-modal.component";
import { UtilsService } from '../../services/utils.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [PipesModule, CommonModule, FormsModule, DecimalFormatPipe, ViewMapComponent, ReportModalComponent],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent implements OnInit {

  publication!: PublicationGet;

  @ViewChildren('zoomedImg') zoomedImgs!: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild('liveToast', { static: false }) toastElement!: ElementRef<HTMLDivElement>;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  isFavorite = false;
  userLoged: UserLoged = new UserLoged();
  toastMessage = '';
  toastInstance: any;
  ratings: RatingGet[] = [];
  newRating: RatingPost = new RatingPost();
  existingRating: RatingGet | null = null;
  reviewsToShow = 5;
  hoveredRating = 0;
  selectedImage: string | null = null;
  showReportModal = false;
  publicationToReport: number = 0;
  currentUserId = 0;
  

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationsService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private ratingService: RatingService,
    private utilsService: UtilsService,
    private router: Router,
  ) {}

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    console.log('ID recibido:', id);

    if (id) {
      this.loadPublication(id);
    }
  });
  this.userLoged = this.authService.getUser();
  this.currentUserId = this.userLoged.id;
}


toggleFavorite() {
  const userId = this.userLoged.id;
  const dto = {
    publication_id: this.publication.id,
    user_id: userId,
  };

  if (this.isFavorite) {
    this.favoriteService.deleteFavorite(dto).subscribe(() => {
      this.isFavorite = false;
      this.showToast('Eliminado de favoritos',false);
    });
  } else {
    this.favoriteService.createFavorite(dto).subscribe(() => {
      this.isFavorite = true;
      this.showToast('Agregado a favoritos',true);
    });
  }
}

isLoggedIn(): boolean {
  return this.authService.isLoggedIn();
}

openReportModal(publicationId: number) {
  this.publicationToReport = publicationId;
  this.utilsService.userAlreadyReported(this.userLoged.id, publicationId).subscribe({
      next: (alreadyReported) => {
        if (alreadyReported) {
          Swal.fire({
            title: 'Ya reportaste esta publicación',
            icon: 'info',
            text: 'No podés volver a reportarla, nos encargaremos de revisarla.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          this.showReportModal = true; 
        }
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el estado del reporte.',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }


submitRating() {
  this.newRating = {
    rater_user_id: this.userLoged.id,
    rated_user_id: this.publication.user.id,
    rating: this.newRating.rating,
    comment: this.newRating.comment
  };

  this.ratingService.addRating(this.newRating).subscribe(() => {
    this.loadRatings();
    this.toastMessage = '¡Reseña enviada con éxito!';
    this.showToast(this.toastMessage, true);
    setTimeout(() => {
      this.refreshPage();
    }, 1000);
  });
}

openImage(img: string) {
  this.selectedImage = img;
}

sharePublication() {
  if (navigator.share) {
    navigator.share({
      title: 'Mirá esta publicación',
      text: 'Te comparto este contenido:',
      url: window.location.href
    })
    .then(() => console.log('Compartido exitosamente'))
    .catch((error) => console.error('Error al compartir:', error));
  } else {
    this.copyToClipboard(window.location.href);
  }
}

copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    this.showToast('Enlace copiado al portapapeles',true);
  });
}

  goToEditPublication(id: number): void {
    this.publicationService.addView(id).subscribe({
      next: () => {
        this.router.navigate(['/publication', id, 'edit']).then(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      },
    });
  }

closeImage() {
  this.selectedImage = null;
}

showToast(message: string, success: boolean) {
  this.toastMessage = message;

  const toastEl = this.toastElement.nativeElement;

  toastEl.classList.remove('bg-success', 'bg-dark', 'text-white');

  if (success) {
    toastEl.classList.add('bg-success', 'text-white'); // fondo verde
  } else {
    toastEl.classList.add('bg-dark', 'text-white');    // fondo negro
  }

  if (!this.toastInstance) {
    this.toastInstance = new Toast(toastEl);
  }

  this.toastInstance.show();
}

hideToast() {
  if (this.toastInstance) {
    this.toastInstance.hide();
  }
}

loadMore() {
  this.reviewsToShow += 5;
  }

setRating(index: number, event: MouseEvent) {
  const element = event.target as HTMLElement;
  const { left, width } = element.getBoundingClientRect();
  const x = event.clientX - left;
  const isHalf = x < width / 2;
  this.newRating.rating = isHalf ? index + 0.5 : index + 1;
}

onHover(index: number, event: MouseEvent) {
  const element = event.target as HTMLElement;
  const { left, width } = element.getBoundingClientRect();
  const x = event.clientX - left;
  const isHalf = x < width / 2;
  this.hoveredRating = isHalf ? index + 0.5 : index + 1;
}

refreshPage() {
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate(['/publication', this.publication.id]);
  });
}

onLeave() {
  this.hoveredRating = 0;
}

loadExistingRating() {
  this.ratingService.hasRating(this.publication.user.id, this.userLoged.id).subscribe((data) => {
    if (data) {
      this.existingRating = data;
    }
  });
}

loadRatings() {
  this.ratingService.getRatingsByUser(this.publication.user.id).subscribe((data) => {
    this.ratings = data;
  });
}

zoomImage(event: MouseEvent) {
    const img = (event.target as HTMLElement);
    if (img && img instanceof HTMLImageElement) {
      const rect = img.getBoundingClientRect();

      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const xPercent = (offsetX / rect.width) * 100;
      const yPercent = (offsetY / rect.height) * 100;

      // Escala de zoom
      const scale = 3; // zoom 2x

      img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      img.style.transform = `scale(${scale})`;
    }
  }

  resetZoom() {
    this.zoomedImgs.forEach(imgRef => {
      const img = imgRef.nativeElement;
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center center';
    });
  }

loadPublication(id: string) {
  this.publicationService.getPublicationById(+id).subscribe({
    next: (data: PublicationGet) => {
      this.publication = data;
      console.log('Publicación cargada:', this.publication);

      // Consultar si es favorita
      const userId = this.userLoged.id;
      const dto = {
        publication_id: this.publication.id,
        user_id: userId
      };
      this.favoriteService.isFavorite(dto).subscribe((result) => {
        this.isFavorite = result;
      });
      this.loadRatings();
      this.loadExistingRating();
    },
    error: (err) => {
      console.error('Error al cargar la publicación:', err);
      this.router.navigate(['/not-found']);
    }
  });
}

  getStarClass(rating: number, index: number): string {
    if (index < Math.floor(rating)) {
      return 'bi bi-star-fill text-primary'; 
    } else if (index < Math.ceil(rating)) {
      return 'bi bi-star-half text-primary'; 
    } else {
      return 'bi bi-star text-muted';
    }
  }

  getInitials(name: string, surname: string): string {
    const firstLetterName = name ? name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = surname ? surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }

  formatDate(dateStr: string): string {
    return dateStr ? dateStr.replace(/-/g, '/') : '';
  }

  getContactLink(contact: any): string {
  const value = contact.contact_value;
  switch (contact.contact_type.toLowerCase()) {
    case 'whatsapp':
      return `https://wa.me/${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'teléfono':
      return `tel:${value}`;
    case 'facebook':
      return `${value}`;
    case 'instagram':
      return `https://instagram.com/${value}`;
    default:
      return '#';
  }
}

getContactIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'whatsapp':
      return 'bi bi-whatsapp text-success';
    case 'email':
      return 'bi bi-envelope-fill text-primary';
    case 'teléfono':
      return 'bi bi-telephone-fill text-secondary';
    case 'facebook':
      return 'bi bi-facebook text-primary';
    case 'instagram':
      return 'bi bi-instagram text-danger';
    default:
      return 'bi bi-question-circle';
  }}

  

  
  getTagClass(tag: string): string {
    const tagColorMap: { [key: string]: string } = {
      'Nuevo': 'bg-success',
      'Usado': 'bg-danger',
      'Envío incluido': 'bg-primary',
      'Retiro en mano': 'bg-secondary',
      'Punto de encuentro': 'bg-info',
      'Precio fijo': 'bg-dark',
      'Precio negociable': 'bg-warning',
    };
  
    return `badge rounded-pill ${tagColorMap[tag] || 'bg-secondary'}`;
  }

}
