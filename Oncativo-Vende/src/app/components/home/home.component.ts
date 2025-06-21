import { Component, ElementRef, inject, ViewChild, OnInit } from '@angular/core';
import { PublicationGet } from '../../models/PublicationGet';
import { PublicationsService } from '../../services/publications.service';
import { EventsService } from '../../services/events.service';
import { EventGet } from '../../models/EventGet';
import { CommonModule } from '@angular/common';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';
import { PipesModule } from '../../pipes/pipes.module';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Category } from '../../models/Category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PipesModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  publications: PublicationGet[] = [];
  lastEvent: EventGet | null = null;
  loadingEvent = false;
  
  categories: Category[] = [
    {
      name: 'Vehículos',
      image: 'assets/Utils/cars-2.webp'
    },
    {
      name: 'Deportes y fitness',
      image: 'assets/Utils/sports.webp'
    },
    {
      name: 'Hogar y muebles',
      image: 'assets/Utils/home.webp'
    },
    {
      name: 'Electrónica',
      image: 'assets/Utils/electronic.webp'
    },
    {
      name: 'Indumentaria',
      image: 'assets/Utils/clothes.webp'
    },
    {
      name: 'Juguetes y juegos',
      image: 'assets/Utils/toys.webp'
    },
    {
      name: 'Varios',
      image: 'assets/Utils/various.jpg'
    },
    {
      name: 'Entretenimiento',
      image: 'assets/Utils/entre.jpg'
    },
    {
      name: 'Arte',
      image: 'assets/Utils/art.webp'
    },
    {
      name: 'Herramientas',
      image: 'assets/Utils/tools.webp'
    }
  ];

  private readonly publicationService = inject(PublicationsService);
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.loadLast10Publications();
    this.loadLastEvent();
  }

  loadLast10Publications(): void {
    this.publicationService.getLast10Publications().subscribe({
      next: (publications: PublicationGet[]) => {
        this.publications = publications;
      },
      error: (error) => {
        console.error('Error al cargar las últimas 10 publicaciones:', error);
      }
    });
  }

  loadLastEvent(): void {
    this.loadingEvent = true;
    this.eventsService.getLastEvent().subscribe({
      next: (event: EventGet) => {
        this.lastEvent = event;
        this.loadingEvent = false;
      },
      error: (error) => {
        console.error('Error al cargar el último evento:', error);
        this.loadingEvent = false;
      }
    });
  }

  scrollLeft() {
    this.carouselContainer.nativeElement.scrollBy({ left: -800, behavior: 'smooth' });
  }

  scrollRight() {
    this.carouselContainer.nativeElement.scrollBy({ left: 800, behavior: 'smooth' });
  }

  goToPublication(id: number): void {
    this.publicationService.addView(id).subscribe({
      next: () => {
        this.router.navigate(['/publication', id]).then(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      },
    });
  }

  goToEvents(): void {
    this.router.navigate(['/events']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onCategoryChange(categorySelected: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        category: categorySelected
      }
    });
  }

  onTagAndCategoryChange(tag: string, categorySelected: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        tag: tag,
        category: categorySelected
      }
    });
  }

  onPriceChange(maxPrice: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        maxPrice: maxPrice
      }
    });
  }

  seeMore() {
    this.router.navigate(['/search']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onTagChange(tag: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        tag: tag
      }
    });
  }

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

  getDefaultEventImage(): string {
    return 'assets/secondary.png'; 
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