import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  //Rol que puede acceder al componente
  const requiredRoles = route.data['roles'] as string[];
  
  //Ver si el usuario tiene alguno de los roles permitidos
  const hasValidRole = requiredRoles.some((role) =>    
    authService.getActualRoles()?.includes(role) ?? false
  );

  //Si tiene permisos
  if (hasValidRole) {
    return true;
  } 
  
  //Si no tiene permisos
  else {
    router.navigate(['unauthorized']);
    return false;
  }
};
