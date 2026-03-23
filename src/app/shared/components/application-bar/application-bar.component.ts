import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SessionService } from '@services/session.service';

@Component({
  selector: 'app-application-bar',
  imports: [
    CommonModule,
    RouterLink,
    NzLayoutModule,
    NzAvatarModule,
    NzIconModule,
    NzButtonModule,
    NzToolTipModule
  ],
  templateUrl: './application-bar.component.html',
  styleUrl: './application-bar.component.scss'
})
export class ApplicationBarComponent implements OnInit {
  public companyUuid: string | null = null;
  public userName: string = '';

  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    const identity = this._sessionService.getIdentity();
    if (identity) {
      this.userName = identity.usr_name + ' ' + (identity.usr_lastname || '');
    }
    const companyStr = this._sessionService.getCompany();
    if (companyStr) {
      const company = JSON.parse(companyStr);
      this.companyUuid = company.cmp_uuid;
    }
  }
}
