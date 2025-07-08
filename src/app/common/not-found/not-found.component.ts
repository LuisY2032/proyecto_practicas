import { Component, inject } from '@angular/core';
import { Router} from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule],
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  private router: Router = inject(Router);

  linkHome(){
    this.router.navigateByUrl('/paginas/inicio');
  }

}
