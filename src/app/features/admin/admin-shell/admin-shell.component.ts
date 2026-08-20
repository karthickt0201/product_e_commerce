import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-shell container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {}
