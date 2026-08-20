import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>This page wandered off the map.</p>
      <a routerLink="/login">Back to login</a>
    </div>
  `,
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
