import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-public-layout',
  imports: [
    RouterOutlet,
    NavBarComponent,
    NzLayoutModule
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {

}
