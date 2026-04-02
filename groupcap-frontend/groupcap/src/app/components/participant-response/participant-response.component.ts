// participant-response.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; // <-- add Router

/* Material modules */
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-participant-response',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './participant-response.component.html',
  styleUrls: ['./participant-response.component.scss']
})
export class ParticipantResponseComponent {

  amount: number | null = null;
  displayAmount: string = '';
  eventId: string = '';
  adminID: string = '';
  eventName: string = '';
  submitted = false;
  loading = false;
  error: string | null = null;

  private votedKey = '';
  private votedAmountKey = '';

  // If your public results route differs, change this:
  private readonly RESULTS_ROUTE_PREFIX = '/events'; // e.g., '/events' or '/event' depending on your app

  constructor(
    private route: ActivatedRoute,
    private router: Router,                    // <-- inject Router
    private eventService: EventService
  ) {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId') || '';
      if (this.eventId) {
        this.votedKey = `event:${this.eventId}:voted`;
        this.votedAmountKey = `event:${this.eventId}:amount`;

        const alreadyVoted = localStorage.getItem(this.votedKey) === 'true';
        if (alreadyVoted) {
          this.submitted = true;
          const storedAmount = localStorage.getItem(this.votedAmountKey);
          if (storedAmount) {
            this.amount = parseFloat(storedAmount);
            this.displayAmount = this.formatWithCommas(storedAmount);
          }
          this.eventService.getAdminKey(this.eventId).subscribe({
          next: (res) => {
            // You can store or use the admin key as needed
            // For now, log it to the console
            if (res && res.adminKey) {
              console.log('Admin Key:', res);
              this.adminID = res.adminKey
              // Optionally, store in a variable or localStorage if needed
              // localStorage.setItem(`event:${this.eventId}:adminkey`, res.name);
            }
          },
          error: () => {
            // Optionally handle error
            console.warn('Failed to fetch admin key');
          }
        });
        }

        this.eventService.getEventName(this.eventId).subscribe({
          next: (res) => {
            if (res && res.name) {
              this.eventName = res.name;
            }
          },
          error: () => {
            this.eventName = '';
          }
        });
      }
    });
  }

  submit() {
    if (!this.eventId || this.amount == null) return;

    if (localStorage.getItem(this.votedKey) === 'true') {
      this.error = 'You have already submitted a response for this event.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.eventService.submitResponse(this.eventId, this.amount).subscribe({
      next: () => {
        localStorage.setItem(this.votedKey, 'true');
        localStorage.setItem(this.votedAmountKey, String(this.amount));

        // After successful submission, get the admin key
        this.eventService.getAdminKey(this.eventId).subscribe({
          next: (res) => {
            // You can store or use the admin key as needed
            // For now, log it to the console
            if (res && res.adminKey) {
              console.log('Admin Key:', res);
              this.adminID = res.adminKey
              // Optionally, store in a variable or localStorage if needed
              // localStorage.setItem(`event:${this.eventId}:adminkey`, res.name);
            }
          },
          error: () => {
            // Optionally handle error
            console.warn('Failed to fetch admin key');
          }
        });

        this.submitted = true;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to submit response.';
        this.loading = false;
      }
    });
  }


  /**
   * Navigate to public or admin results
   * If adminID is present, go to /e/{eventId}/admin?key={adminID}
   * Otherwise, fallback to public results
   */
  viewResults() {
    const adminLink = this.getAdminResultsLink();
    if (adminLink) {
      this.router.navigateByUrl(adminLink);
    } else {
      this.router.navigate([this.RESULTS_ROUTE_PREFIX, this.eventId, 'results']);
    }
  }

  /**
   * Returns the admin results link for this event
   * Example: /e/eventId/admin?key=adminkey
   */
  getAdminResultsLink(): string {
    if (!this.eventId || !this.adminID) return '';
    return `/e/${this.eventId}/admin?key=${this.adminID}`;
  }

  blockNonDecimal(event: KeyboardEvent) {
    const disallowed = ['e', 'E', '+', '-'];
    if (disallowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  limitDecimals(event: Event) {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/,/g, '');

    if (raw && raw.includes('.')) {
      const [intPart, decPart] = raw.split('.');
      if (decPart.length > 2) {
        raw = intPart + '.' + decPart.slice(0, 2);
      }
    }

    let value = parseFloat(raw);
    if (!isNaN(value) && value > 9999999999.99) {
      raw = '9999999999.99';
      value = 9999999999.99;
    }

    if (raw) {
      const [intPart, decPart] = raw.split('.');
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.displayAmount = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
    } else {
      this.displayAmount = '';
    }
    input.value = this.displayAmount;
    this.amount = raw ? parseFloat(raw) : null;
  }

  private formatWithCommas(raw: string): string {
    const [intPart, decPart] = raw.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }
}