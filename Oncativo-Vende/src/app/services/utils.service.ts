import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationGet } from '../models/LocationGet';
import { TagGet } from '../models/TagGet';
import { ContactTypeGet } from '../models/ContactTypeGet';
import { ReportPost } from '../models/ReportPost';
import { ReportFilterDto } from '../models/ReportFilterDto';
import { PaginatedReports } from '../models/PaginatedReports';
import { SolveReportPost } from '../models/SolveReportPost';
import { RolGet } from '../models/RolGet';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly locationsUrl = 'http://localhost:8080/locations';
  private readonly tagsUrl = 'http://localhost:8080/tags';
  private readonly contactsUrl = 'http://localhost:8080/contacts';
  private readonly rolesUrl = 'http://localhost:8080/roles';
  private readonly reportsUrl = 'http://localhost:8080/reports';

  getLocations(): Observable<LocationGet[]> {    
      return this.http.get<LocationGet[]>(this.locationsUrl);
    }

  getTags(): Observable<TagGet[]> {
    return this.http.get<TagGet[]>(this.tagsUrl);
  }

  getRoles(): Observable<RolGet[]> {
    return this.http.get<RolGet[]>(this.rolesUrl);
  }

  getContactsTypes(): Observable<ContactTypeGet[]> {
    return this.http.get<ContactTypeGet[]>(`${this.contactsUrl}/types`);
  }

  postReport(report: ReportPost): Observable<void> {
    return this.http.post<void>(this.reportsUrl, report);
  }

  userAlreadyReported(userId: number, publicationId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.reportsUrl}/user/${userId}/publication/${publicationId}`);
  }

  getFilteredReports(filter: ReportFilterDto): Observable<PaginatedReports> {
  return this.http.post<PaginatedReports>(`${this.reportsUrl}/filter`, filter);
}

 solveReport(dto: SolveReportPost): Observable<boolean> {
    return this.http.post<boolean>(`${this.reportsUrl}/solve`, dto);
  }



}
