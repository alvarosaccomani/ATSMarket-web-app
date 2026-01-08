import { Component } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-application-bar',
  imports: [
    NzLayoutModule,
    NzAvatarModule,
    NzIconModule
  ],
  templateUrl: './application-bar.component.html',
  styleUrl: './application-bar.component.scss'
})
export class ApplicationBarComponent {

}
