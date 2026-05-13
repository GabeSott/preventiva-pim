import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/dashboard';

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getMetricas(): Observable<any> {
    return this.http.get<any>(`${this.API}/metricas`, { headers: this.getHeaders() });
  }

  getAtrasadas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/atrasadas`, { headers: this.getHeaders() });
  }

  getDisponibilidade(): Observable<any> {
    return this.http.get<any>(`${this.API}/disponibilidade`, { headers: this.getHeaders() });
  }

  getEmDia(): Observable<any> {
    return this.http.get<any>(`${this.API}/em-dia`, { headers: this.getHeaders() });
  }

  getTopTecnicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/top-tecnicos`, { headers: this.getHeaders() });
  }

  getTopEquipamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/top-equipamentos`, { headers: this.getHeaders() });
  }
}
