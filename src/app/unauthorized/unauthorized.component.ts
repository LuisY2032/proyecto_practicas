import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  regresar() {
    this.router.navigate(['/paginas/inicio']);
  }
}
