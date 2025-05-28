import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { PublicationGet } from '../../models/PublicationGet';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [CommonModule,PipesModule],
  templateUrl: './my-favorites.component.html',
  styleUrl: './my-favorites.component.css'
})
export class MyFavoritesComponent implements OnInit {

  favorites: PublicationGet[] = [];
  showCount = 5;
  toastMessage = '';
  toastInstance: any;
  displayedFavorites = this.favorites.slice(0, this.showCount);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  @ViewChild('liveToast', { static: false }) toastElement!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const userId = this.authService.getUser().id;
    this.favoriteService.getFavoritesByUser(userId).subscribe({
      next: (res: PublicationGet[]) => {
        this.favorites = res;
        this.displayedFavorites = this.favorites.slice(0, this.showCount);
      },
      error: (error) => {
        this.favorites = [];
        this.displayedFavorites = [];
        console.error('Error loading favorites:', error);
      }
    });
  }

  showMore() {
    this.showCount += 5;
    this.displayedFavorites = this.favorites.slice(0, this.showCount);
  }

  goToPublication(id: number): void {
    this.router.navigate(['/publication', id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  removeFavorite(pubToRemove: PublicationGet) {
  const userId = this.authService.getUser().id;
  const dto = {
    publication_id: pubToRemove.id,
    user_id: userId,
  };

  this.favoriteService.deleteFavorite(dto).subscribe({
    next: () => {
      this.favorites = this.favorites.filter(pub => pub !== pubToRemove);
      this.displayedFavorites = this.favorites.slice(0, this.showCount);
      this.showToast('Eliminaste el producto de Mis favoritos', false);
    },
    error: () => {
      this.showToast('Error al eliminar favorito', false);
    }
  });
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

}
