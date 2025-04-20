import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,


})
export class HeaderComponent {
  isMenuOpen = false;
  isDepartmentOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.isDepartmentOpen = false;
    }
  }

  toggleDepartment(): void {
    this.isDepartmentOpen = !this.isDepartmentOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.isDepartmentOpen = false;
    }
  }
}