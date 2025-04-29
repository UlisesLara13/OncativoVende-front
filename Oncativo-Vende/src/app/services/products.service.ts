import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryGet } from '../models/CategoryGet';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

   private readonly http: HttpClient = inject(HttpClient);
   private readonly categoriesUrl = 'http://localhost:8080/categories';

   getCategories(): Observable<CategoryGet[]> {    
       return this.http.get<CategoryGet[]>(this.categoriesUrl);
     } 

}
