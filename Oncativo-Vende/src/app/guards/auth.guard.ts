import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  //Verifico si el usuario esta logeado
  if(authService.isLoggedIn()){
    return true;
  }
  else{

    //Si no lo redirige al home
    router.navigate(['home'])
    return false;
  }
  
};
