import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../services/events.service';
import { EventGet } from '../../models/EventGet';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {
  allEvents: EventGet[] = [];
  displayedEvents: EventGet[] = [];
  itemsPerPage = 5;
  hasMoreEvents = false;
  loading = false;
  loadingMore = false;

  private readonly eventsService = inject(EventsService);
  readonly authService = inject(AuthService); 
  

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventsService.getEvents().subscribe({
      next: (events: EventGet[]) => {
        this.allEvents = events;
        this.displayedEvents = this.allEvents.slice(0, this.itemsPerPage);
        this.hasMoreEvents = this.allEvents.length > this.itemsPerPage;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los eventos.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  loadMoreEvents(): void {
    this.loadingMore = true;
    
    setTimeout(() => {
      const currentLength = this.displayedEvents.length;
      const nextItems = this.allEvents.slice(currentLength, currentLength + this.itemsPerPage);
      
      this.displayedEvents = [...this.displayedEvents, ...nextItems];
      this.hasMoreEvents = this.displayedEvents.length < this.allEvents.length;
      this.loadingMore = false;
    }, 500); 
  }

  getDefaultImage(): string {
    return 'assets/secondary.png'; 
  }

  finalizeEvent(id: number): void {
    Swal.fire({
      title: '¿Está seguro de que desea finalizar este evento?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, finalizar evento',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eventsService.finalizeEvent(id).subscribe({
          next: (response: any) => {
            if (response === true || response) {
              Swal.fire({
                icon: 'success',
                title: 'Evento finalizado',
                text: 'El evento se ha finalizado correctamente.',
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                this.loadEvents(); 
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo finalizar el evento.',
                showConfirmButton: false,
                timer: 1500
              });
            }
          },
          error: (err) => {
            console.error('Error al finalizar el evento:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al finalizar el evento.',
              showConfirmButton: false,
              timer: 1500
            });
          }
        });
      }
    });
  }

  showAdvertisementInfo(): void {
    Swal.fire({
      title: '¿Cómo publicar tu anuncio?',
      html: `
        <div class="text-start">
          <p class="mb-3">Para publicar tu anuncio en nuestra plataforma, contactanos a través de:</p>
          
          <div class="mb-3">
            <strong><i class="bi bi-envelope-fill text-primary me-2"></i>Email:</strong><br>
            <a href="mailto:oncativovende@gmail.com" class="text-decoration-none">oncativovende@gmail.com</a>
          </div>
          
          <div class="mb-3">
            <strong><i class="bi bi-whatsapp text-success me-2"></i>WhatsApp:</strong><br>
            <a href="https://wa.me/5493572605121" target="_blank" class="text-decoration-none">3572605121</a>
          </div>
          
          <div class="alert alert-info mt-3">
            <small>
              <i class="bi bi-info-circle me-1"></i>
              Te brindaremos información sobre cotización, requisitos y coordinaremos las fechas del posteo.
            </small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-whatsapp me-2"></i>Contactar por WhatsApp',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#25d366',
      cancelButtonColor: '#6c757d',
      showCloseButton: true,
      customClass: {
        popup: 'swal-wide'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('https://wa.me/5493572605121?text=Hola,%20me%20interesa%20publicar%20un%20anuncio%20en%20su%20plataforma.%20¿Podrían%20brindarme%20información%20sobre%20cotización%20y%20requisitos?', '_blank');
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts;
      const formattedDate = `${year}-${month}-${day}`;
      const date = new Date(formattedDate);
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
    
    return dateString;
  }

  getUserDisplayName(user: any): string {
    return `${user.name} ${user.surname}`;
  }

  getUserAvatar(user: any): string {
    return user.avatar_url || '';
  }

  getInitials(user: any): string {
    const firstLetterName = user.name ? user.name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = user.surname ? user.surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }
}