import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-user-layout',
  imports: [
    RouterOutlet,
    NavBarComponent,
    NzLayoutModule
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

}
