import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule , RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarVisible = false;

  constructor(private elRef: ElementRef) { }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  closeSidebar() {
    this.sidebarVisible = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.sidebarVisible = false;
    }
  }

}