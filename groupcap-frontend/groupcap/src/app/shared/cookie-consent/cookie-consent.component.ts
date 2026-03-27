import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

const CONSENT_KEY = 'gc_cookie_consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;

  ngOnInit(): void {
    const consent = localStorage.getItem(CONSENT_KEY);
    this.showBanner = consent !== 'accepted' && consent !== 'declined';
  }

  accept(): void {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    this.showBanner = false;
    // TODO: initialize analytics/ads only after consent (e.g., gtag, ads)
  }

  decline(): void {
    localStorage.setItem(CONSENT_KEY, 'declined');
    this.showBanner = false;
    // TODO: ensure tracking scripts do not run
  }
}
