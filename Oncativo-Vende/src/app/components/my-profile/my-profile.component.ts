import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { UserLoged } from '../../models/UserLoged';
import { UserGet } from '../../models/UserGet';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FileService } from '../../services/file.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  authService = inject(AuthService);
  usersService = inject(UsersService);
  fileService = inject(FileService);
  private readonly router = inject(Router);

  user: UserGet = new UserGet();
  userLoged: UserLoged = new UserLoged();
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.userLoged = this.authService.getUser();
    this.loadUserData(this.userLoged.id);
  }

  loadUserData(userId: number): void {
    this.usersService.getUserById(userId).subscribe({
      next: (userData: UserGet) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    });
  }

  getInitials(name: string, surname: string): string {
    const firstLetterName = name ? name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = surname ? surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }

  getStarClass(rating: number, index: number): string {
    if (index < Math.floor(rating)) {
      return 'bi bi-star-fill text-warning'; // Estrella llena
    } else if (index < Math.ceil(rating)) {
      return 'bi bi-star-half text-warning'; // Media estrella
    } else {
      return 'bi bi-star text-muted'; // Estrella vacía
    }
  }

  onChangeAvatar(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.uploadProfilePic(file);
      }
    };
  }

  uploadProfilePic(file: File): void {
    if (this.userLoged && this.userLoged.id) {
      this.fileService.uploadProfilePic(this.userLoged.id, file).subscribe({
        next: (fileUrl: string) => {
          console.log('Foto subida exitosamente', fileUrl);
  
          this.usersService.updateAvatarUrl(this.userLoged.id, fileUrl).subscribe({
            next: () => {
              this.user.avatar_url = fileUrl;
  
              Swal.fire({
                icon: 'success',
                title: 'Foto de perfil actualizada',
                text: 'Tu foto de perfil ha sido actualizada exitosamente.',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              console.error('Error actualizando avatar en el backend:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error al subir la imagen:', error);
        }
      });
    }
  }  
}
