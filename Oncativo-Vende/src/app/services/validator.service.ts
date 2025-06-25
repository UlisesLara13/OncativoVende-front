import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly urlUser = 'http://localhost:8080/validator';

  validateUniqueUsername(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.http.get<{ isUnique: boolean }>(`${this.urlUser}/username?username=${control.value}`).pipe(
        map(response => (response.isUnique ? null : { usernameTaken: true })),
        catchError(() => {
          return of({ serverError: true });
        })
      );
    };
  }

validateNotBanned(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;
    return this.http.get<boolean>(`${this.urlUser}/not-banned?email=${value}&username=${value}`).pipe(
      map(response => response ? null : { userBanned: true }),
      catchError(() => of({ serverError: true }))
    );
  };
}


  validateUniqueEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.http.get<{ isUnique: boolean }>(`${this.urlUser}/email?email=${control.value}`).pipe(
        map(response => (response.isUnique ? null : { emailTaken: true })),
        catchError(() => {
          return of({ serverError: true });
        })
      );
    };
  }

validateNotUniqueEmail(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return this.http.get<{ isUnique: boolean }>(`${this.urlUser}/email?email=${control.value}`).pipe(
      map(response => (!response.isUnique ? null : { emailNotTaken: true })), 
      catchError(() => of({ serverError: true }))
    );
  };
}

  

validateUniqueEmailExceptCurrent(userId: number): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;

    return this.http.get<{ isUnique: boolean }>(
      `${this.urlUser}/email/current?email=${encodeURIComponent(email)}&userId=${userId}`
    ).pipe(
      map(response => response.isUnique ? null : { emailTaken: true }),
      catchError(() => of({ serverError: true }))
    );
  };
}


  matchFields(field1: string, field2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control1 = formGroup.get(field1);
      const control2 = formGroup.get(field2);

      if (control1?.value !== control2?.value) {
        control2?.setErrors({ notMatch: true });
        return { notMatch: true };
      }
      
      control2?.setErrors(null);
      return null;
    };
  }

}
