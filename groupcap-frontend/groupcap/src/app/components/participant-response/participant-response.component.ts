import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

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
  eventName: string = '';
  submitted = false;
  loading = false;
  error: string | null = null;

  private votedKey = '';       // e.g., "event:abc123:voted"
  private votedAmountKey = ''; // optional: "event:abc123:amount"

  constructor(private route: ActivatedRoute, private eventService: EventService) {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId') || '';
      if (this.eventId) {
        this.votedKey = `event:${this.eventId}:voted`;
        this.votedAmountKey = `event:${this.eventId}:amount`;

        // If already voted in this browser, set submitted state immediately
        const alreadyVoted = localStorage.getItem(this.votedKey) === 'true';
        if (alreadyVoted) {
          this.submitted = true;
          // Optional: load the amount they previously entered for display/logging
          const storedAmount = localStorage.getItem(this.votedAmountKey);
          if (storedAmount) {
            this.amount = parseFloat(storedAmount);
            this.displayAmount = this.formatWithCommas(storedAmount);
          }
        }

        // Fetch event name using the dedicated endpoint
        this.eventService.getEventName(this.eventId).subscribe({
          next: (res) => {
            console.log(res.name)
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

    // Client-side guard to prevent duplicates
    if (localStorage.getItem(this.votedKey) === 'true') {
      this.error = 'You have already submitted a response for this event.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.eventService.submitResponse(this.eventId, this.amount).subscribe({
      next: () => {
        // Record vote in localStorage (best-effort, client-side)
        localStorage.setItem(this.votedKey, 'true');
        localStorage.setItem(this.votedAmountKey, String(this.amount));

        this.submitted = true;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to submit response.';
        this.loading = false;
      }
    });
  }

  // Removed edit() – no longer used:
  // edit() { this.submitted = false; }

  /**
   * Block non-decimal characters.
   */
  blockNonDecimal(event: KeyboardEvent) {
    const disallowed = ['e', 'E', '+', '-'];
    if (disallowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Restrict input to 2 decimal places and format with commas.
   */
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

  /**
   * Utility to format number strings with commas consistently.
   */
  private formatWithCommas(raw: string): string {
    const [intPart, decPart] = raw.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }
}