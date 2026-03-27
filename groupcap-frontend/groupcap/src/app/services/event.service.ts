
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEvent(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, { name });
  }

  submitResponse(eventId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/responses`, { amount });
  }

  getResults(eventId: string, key: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${eventId}/results?key=${key}`);
  }
  
  getEventName(eventId: string): Observable<{ name: string }> {
    return this.http.get<{ name: string }>(`${this.apiUrl}/events/${eventId}/name`);
  }
}
