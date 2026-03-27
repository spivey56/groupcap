import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';

/* Add Material modules for consistent look */
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-results.component.html',
  styleUrls: ['./admin-results.component.scss']
})
export class AdminResultsComponent {
  eventId: string = '';
  key: string = '';
  results: any = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private eventService: EventService) {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId') || '';
      this.key = this.route.snapshot.queryParamMap.get('key') || '';
      if (this.eventId && this.key) {
        this.getResults();
      }
    });
  }

  getResults() {
    this.loading = true;
    this.error = null;
    this.eventService.getResults(this.eventId, this.key).subscribe({
      next: (res) => {
        this.results = res;
        console.log(this.results)
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load results.';
        this.loading = false;
      }
    });
  }

  refresh() {
    if (this.eventId && this.key) {
      this.getResults();
    }
  }
}