import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  openPrivacyPolicy() {
    window.location.href = 'privacy';
  }
  openTerms() {
    window.location.href = 'terms';
  }
  openAbout() {
    window.location.href = 'about';
  }
  openContact() {
    window.location.href = 'contact';
  }
}

