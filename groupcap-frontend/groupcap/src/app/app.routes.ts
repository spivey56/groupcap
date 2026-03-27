import { Routes } from '@angular/router';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { ParticipantResponseComponent } from './components/participant-response/participant-response.component';
import { AdminResultsComponent } from './components/admin-results/admin-results.component';

import { TermsComponent } from './legal/terms/terms.component';
import { PrivacyComponent } from './legal/privacy/privacy.component';


export const routes: Routes = [
	{ path: '', component: CreateEventComponent },
	{ path: 'e/:eventId', component: ParticipantResponseComponent },
	{ path: 'e/:eventId/admin', component: AdminResultsComponent },
	{ path: 'terms', component: TermsComponent, title: 'GroupCap — Terms of Service' },
	{ path: 'privacy', component: PrivacyComponent, title: 'GroupCap — Privacy Policy' },
	{ path: '**', redirectTo: '' }

];
