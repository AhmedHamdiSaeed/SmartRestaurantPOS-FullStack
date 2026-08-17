import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo-area">
        <span class="icon">⚡</span>
        <span class="title">Sahm <span class="accent">POS</span></span>
      </div>
      <nav class="nav">
        <a routerLink="/orders" routerLinkActive="active" class="nav-item">
          <span class="icon">📋</span> Live Orders
        </a>
        <a routerLink="/kitchen" routerLinkActive="active" class="nav-item">
          <span class="icon">👨‍🍳</span> Kitchen Monitor
        </a>
        <a routerLink="/search" routerLinkActive="active" class="nav-item">
          <span class="icon">🔍</span> Product Catalog
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-surface);
      border-right: 1px solid var(--border-normal);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
    }
    .logo-area {
      height: var(--header-height);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px;
      border-bottom: 1px solid var(--border-normal);
    }
    .logo-area .icon { font-size: 24px; }
    .logo-area .title { font-size: 18px; font-weight: 800; color: var(--text-primary); }
    .accent { color: var(--brand-primary); }
    .nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-item:hover { color: var(--text-primary); background: var(--bg-elevated); }
    .nav-item.active {
      color: var(--brand-primary);
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid var(--brand-primary);
    }
  `]
})
export class SidebarComponent {}
