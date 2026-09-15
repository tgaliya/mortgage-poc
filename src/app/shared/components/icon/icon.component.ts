import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'dashboard' | 'users' | 'home' | 'document' | 'profile' | 'bank' | 'history' | 'audit'
  | 'search' | 'close' | 'upload' | 'shield' | 'badge' | 'key';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name: IconName = 'dashboard';
}
