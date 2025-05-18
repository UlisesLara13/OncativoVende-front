import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';
import { PublicationGet } from '../../models/PublicationGet';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [PipesModule,CommonModule],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent implements OnInit {

  publication!: PublicationGet;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationsService,
    private authService: AuthService,
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
}

loadPublication(id: string) {
    this.publicationService.getPublicationById(+id).subscribe({
      next: (data: PublicationGet) => {
        this.publication = data;
        console.log('Publicación cargada:', this.publication);
      },
      error: (err) => {
        console.error('Error al cargar la publicación:', err);
        this.router.navigate(['/not-found']);
      }
    });
  }

  getStarClass(rating: number, index: number): string {
    if (index < Math.floor(rating)) {
      return 'bi bi-star-fill text-warning'; 
    } else if (index < Math.ceil(rating)) {
      return 'bi bi-star-half text-warning'; 
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
