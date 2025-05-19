import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

//Redirige al home si el usuario ya esta logueado e intenta ir al login
export const loginBlockGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

   //Verifica si el usuario está logueado
  if(authService.isLoggedIn()){

    //Lo redirige a home
    router.navigate(['/home']);

    //No lo deja ingresar
    return false;
  }

  //Sino lo deja acceder
  return true;

};
