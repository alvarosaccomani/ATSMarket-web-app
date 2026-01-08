import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { ApplicationBarComponent } from '@components/application-bar/application-bar.component';

@Component({
  selector: 'app-application-layout',
  imports: [
    RouterOutlet,
    NzLayoutModule,
    SideBarComponent,
    ApplicationBarComponent
  ],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss'
})
export class ApplicationLayoutComponent {

}
