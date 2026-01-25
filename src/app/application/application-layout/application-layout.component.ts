import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { ApplicationBarComponent } from '@components/application-bar/application-bar.component';

@Component({
  selector: 'app-application-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    SideBarComponent,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzAvatarModule,
    ApplicationBarComponent
  ],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss'
})
export class ApplicationLayoutComponent {

  public isCollapsed = false;

}
