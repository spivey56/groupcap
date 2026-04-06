declare global {
  interface Window { adsbygoogle: any[]; }
}

import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { QRCodeComponent } from 'angularx-qrcode';
import { trigger, style, transition, animate } from '@angular/animations';
import { EventService } from '../../services/event.service';

type CreatedEvent = {
  name: string;
  publicUrl: string;
  adminUrl: string;
  created: string;
  showQr: boolean;
};

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    QRCodeComponent
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [ style({ opacity: 0 }), animate('600ms ease-out', style({ opacity: 1 })) ]),
      transition(':leave', [ animate('400ms ease-out', style({ opacity: 0 })) ]),
    ]),
  ]
})
export class CreateEventComponent implements AfterViewInit, OnDestroy {
  eventName = '';
  isSuccessVisible = false;
  publicUrl: string = '';
  adminUrl: string = '';
  loading = false;
  error: string | null = null;
  createdEvents: CreatedEvent[] = [];

  placeholders = ['Allison\'s Bachelorette', 'Hockey Tickets', 'Maine Hotel', 'Steve\'s Birthday Gift', 'Office Secret Santa'];
  currentPlaceholder = '';
  placeholderIndex = 0;
  placeholderStopped = false;
  inputEverInteracted = false;
  showPlaceholder = false;
  placeholderTimer: any;

  @ViewChild('successTitle', { static: false }) successTitle?: ElementRef<HTMLHeadingElement>;
  @ViewChild('eventNameInput', { static: false }) eventNameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('confirmDeleteTpl', { static: true }) confirmDeleteTpl?: TemplateRef<any>;

  pendingDeleteIndex: number | null = null;

  constructor(
    private eventService: EventService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.loadEvents();
  }

ngAfterViewInit() {
  // Existing placeholder logic
  this.currentPlaceholder = this.placeholders[0];
  setTimeout(() => {
    if (!this.inputEverInteracted) {
      this.showPlaceholder = true;
      this.startPlaceholderAnimation();
    }

    // ===== Initialize AdSense after view is ready =====
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push failed', e);
    }
  }, 50);
}

  startPlaceholderAnimation() {
    if (this.inputEverInteracted) return;
    if (this.placeholderTimer) clearTimeout(this.placeholderTimer);

    this.placeholderTimer = setTimeout(() => {
      if (this.placeholderStopped || this.inputEverInteracted) return;
      this.showPlaceholder = false;

      this.placeholderTimer = setTimeout(() => {
        if (this.placeholderStopped || this.inputEverInteracted) return;

        this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholders.length;
        this.currentPlaceholder = this.placeholders[this.placeholderIndex];

        this.showPlaceholder = true;
        this.startPlaceholderAnimation();
      }, 600);
    }, 2000);
  }

  stopPlaceholderAnimation() {
    if (this.inputEverInteracted) return;
    this.inputEverInteracted = true;
    this.placeholderStopped = true;
    if (this.placeholderTimer) clearTimeout(this.placeholderTimer);
    this.showPlaceholder = false;
    this.currentPlaceholder = '';
  }

  onInputBlur() {}
  ngOnDestroy() { if (this.placeholderTimer) clearTimeout(this.placeholderTimer); }

  /* ========== CREATE EVENT ========== */
  createEvent() {
    this.loading = true;
    this.error = null;

    this.eventService.createEvent(this.eventName).subscribe({
      next: (res) => {
        const origin = window.location.origin;
        this.publicUrl = res.publicUrl.startsWith('http') ? res.publicUrl : origin + res.publicUrl;
        this.adminUrl  = res.adminUrl.startsWith('http') ? res.adminUrl  : origin + res.adminUrl;

        this.saveEvent({
          name: this.eventName,
          publicUrl: this.publicUrl,
          adminUrl: this.adminUrl,
          created: new Date().toISOString(),
          showQr: false
        });
        this.loadEvents();

        this.isSuccessVisible = true;
        this.eventName = '';
        this.loading = false;

        setTimeout(() => {
          this.successTitle?.nativeElement.focus();

          // ==== AdSense trigger (safe for TypeScript) ====
          try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
          } catch (e) {
            console.warn('AdSense failed to load:', e);
          }
        }, 0);
      },
      error: (err) => {
        this.error = `Failed to create event.\nError: ${err?.message || err?.statusText || err}`;
        this.loading = false;
      }
    });
  }

  saveEvent(event: CreatedEvent) {
    const events = JSON.parse(localStorage.getItem('createdEvents') || '[]');
    events.unshift(event);
    localStorage.setItem('createdEvents', JSON.stringify(events.slice(0, 10)));
  }

  loadEvents() {
    const loaded: CreatedEvent[] = JSON.parse(localStorage.getItem('createdEvents') || '[]');
    this.createdEvents = loaded.map(e => ({ ...e, showQr: e.showQr ?? false }));
  }

  copy(url: string | null) {
    if (!url) return;
    navigator.clipboard.writeText(url);
    this.snackBar.open('Copied to clipboard!', 'Close', { duration: 2000, horizontalPosition: 'center', verticalPosition: 'bottom' });
  }

  reset() {
    this.isSuccessVisible = false;
    this.eventName = '';
    this.publicUrl = '';
    this.adminUrl = '';
    this.error = null;
    this.loading = false;
    if (!this.inputEverInteracted) {
      this.showPlaceholder = true;
      this.startPlaceholderAnimation();
    }
  }

  toggleQr(index: number) {
    this.createdEvents = this.createdEvents.map((e, i) => (i === index ? { ...e, showQr: !e.showQr } : { ...e, showQr: false }));
  }

  openEvent(url: string) { window.location.href = url; }

  shareEvent(event: { name: string; publicUrl: string }) {
    const eventName = event.name || 'Check this out';
    const url = event.publicUrl;
    const title = `Join "${eventName}" on GroupCap: ${url}`;
    const text = `Join "${eventName}" on GroupCap\n${url}`;

    if (navigator.share) {
      navigator.share({ title, text, url })
        .then(() => this.snackBar.open('Shared!', 'Close', { duration: 1500 }))
        .catch((err: any) => { if (!err || err.name === 'AbortError') return; this.fallbackShare({ title, text, url }); });
    } else {
      this.fallbackShare({ title, text, url });
    }
  }

  private fallbackShare({ title, text, url }: { title: string; text: string; url: string }) {
    const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    const mailWindow = window.open(mailto, '_blank', 'noopener,noreferrer');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!mailWindow && isMobile) window.open(`sms:?&body=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener,noreferrer');
    navigator.clipboard.writeText(url).then(() => this.snackBar.open('Link copied — share it anywhere!', 'Close', { duration: 2500, horizontalPosition: 'center', verticalPosition: 'bottom' }));
  }

  confirmDelete(index: number) {
    this.pendingDeleteIndex = index;
    this.dialog.open(this.confirmDeleteTpl!, { width: '360px', panelClass: 'confirm-dialog-panel', backdropClass: 'blur-backdrop' });
  }

  deleteEvent(index: number) {
    if (index == null || index < 0 || index >= this.createdEvents.length) return;
    const toDelete = this.createdEvents[index];
    this.createdEvents.splice(index, 1);
    const events = JSON.parse(localStorage.getItem('createdEvents') || '[]') as CreatedEvent[];
    localStorage.setItem('createdEvents', JSON.stringify(events.filter(e => !(e.publicUrl === toDelete.publicUrl && e.adminUrl === toDelete.adminUrl && e.created === toDelete.created))));
    this.snackBar.open('Event removed', 'Close', { duration: 1500 });
    this.pendingDeleteIndex = null;
  }

  voteAsOrganizer() { if (this.publicUrl) this.openEvent(this.publicUrl); }
}