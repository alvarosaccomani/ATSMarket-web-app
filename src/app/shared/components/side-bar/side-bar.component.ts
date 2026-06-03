import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SessionService } from '@services/session.service';

@Component({
  selector: 'app-side-bar',
  imports: [
    CommonModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDividerModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  public isCollapsed: boolean = false;
  public companyUuid: string | null = null;
  public isSuperAdmin: boolean = false;

  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    const companyStr = this._sessionService.getCompany();
    if (companyStr) {
      const company = JSON.parse(companyStr);
      this.companyUuid = company.cmp_uuid;
    }
    const identity = this._sessionService.getIdentity();
    this.isSuperAdmin = identity && (identity.usr_sysadmin === true || identity.usr_sysadmin === 1 || identity.usr_sysadmin === '1');
  }
}
