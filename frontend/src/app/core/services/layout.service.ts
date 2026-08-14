import { Injectable, signal } from '@angular/core';

/**
 * Shared service to coordinate mobile navigation drawer state
 * between the Header (hamburger button) and Sidebar (drawer panel).
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly mobileNavOpen = signal(false);

  toggleMobileNav(): void { this.mobileNavOpen.update(v => !v); }
  openMobileNav(): void  { this.mobileNavOpen.set(true); }
  closeMobileNav(): void { this.mobileNavOpen.set(false); }
}
