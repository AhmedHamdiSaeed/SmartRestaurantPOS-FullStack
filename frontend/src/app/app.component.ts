import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './features/dashboard/components/header/header.component';
import { SidebarComponent } from './features/dashboard/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <div class="app-shell">
        <app-sidebar></app-sidebar>
        <div class="app-main">
          <app-header></app-header>
          <main class="app-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
