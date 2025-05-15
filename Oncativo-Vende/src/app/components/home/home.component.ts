import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PublicationGet } from '../../models/PublicationGet';
import { PublicationsService } from '../../services/publications.service';
import { CommonModule } from '@angular/common';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';
import { PipesModule } from '../../pipes/pipes.module';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,PipesModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  publications: PublicationGet[] = [];
  private readonly publicationService = inject(PublicationsService);
  private readonly router = inject(Router);
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  constructor() {
    this.loadLast10Publications();
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

  scrollLeft() {
    this.carouselContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.carouselContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  onCategoryChange(categorySelected: string) {
    this.router.navigate(['/search'], {
      queryParams: {
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
}
