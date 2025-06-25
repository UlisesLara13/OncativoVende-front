import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { UserLoged } from '../../models/UserLoged';
import { UserGet } from '../../models/UserGet';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FileService } from '../../services/file.service';
import Swal from 'sweetalert2';
import { ChangePasswordComponent } from "../change-password/change-password.component";
import { UpdatePersonalDataComponent } from "../update-personal-data/update-personal-data.component";

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordComponent, UpdatePersonalDataComponent],
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
  showChangePasswordModal = false;
  showEditProfileModal = false
  userData!: UserGet;

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

  handleEditProfileModalClose(): void {
  this.showEditProfileModal = false; 
  this.loadUserData(this.userLoged.id);
}

  getInitials(name: string, surname: string): string {
    const firstLetterName = name ? name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = surname ? surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
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

  openEditProfileModal(): void {
    this.userData = { ...this.user };
    this.showEditProfileModal = true;
  }
  
  closeEditProfileModal(): void {
    this.showEditProfileModal = false;
    this.loadUserData(this.userLoged.id);
  }

  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
  }


  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

onChangeAvatar(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();

  input.onchange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: 'Solo se permiten archivos JPG, JPEG y PNG.',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; 
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El archivo no puede ser mayor a 5MB.',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }

      this.selectedFile = file;
      this.uploadProfilePic(file);
    }
  };
}

  deleteAccount(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu cuenta permanentemente junto a tu información personal y todas tus publicaciones.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUserPermanently(this.userLoged.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cuenta eliminada',
              text: 'Tu cuenta ha sido eliminada exitosamente.',
              timer: 2000,
              showConfirmButton: false
            });
            this.authService.logOut();
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error al eliminar la cuenta:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la cuenta. Inténtalo de nuevo más tarde.'
            });
          }
        });
      }
    });
  }

    refreshPage(): void {
      location.reload();
    }

 uploadProfilePic(file: File): void {
  if (this.userLoged && this.userLoged.id) {
    this.fileService.uploadProfilePic(this.userLoged.id, file).subscribe({
      next: (fileUrl: string) => {
        console.log('Foto subida exitosamente', fileUrl);

        this.usersService.updateAvatarUrl(this.userLoged.id, fileUrl).subscribe({
          next: () => {
            this.user.avatar_url = fileUrl;
            
            this.userLoged.avatar = fileUrl; 
            this.authService.updateUser(this.userLoged); 
            
            this.loadUserData(this.userLoged.id);

            Swal.fire({
              icon: 'success',
              title: 'Foto de perfil actualizada',
              text: 'Tu foto de perfil ha sido actualizada exitosamente.',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.refreshPage();
            });
          },
          error: (error) => {
            console.error('Error actualizando avatar en el backend:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar la foto de perfil. Inténtalo de nuevo.',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al subir imagen',
          text: 'No se pudo subir la imagen. Inténtalo de nuevo.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}
}
