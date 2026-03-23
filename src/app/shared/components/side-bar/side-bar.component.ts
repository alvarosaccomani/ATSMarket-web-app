import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    RouterLink
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  public isCollapsed: boolean = false;
  public companyUuid: string | null = null;

  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    const companyStr = this._sessionService.getCompany();
    if (companyStr) {
      const company = JSON.parse(companyStr);
      this.companyUuid = company.cmp_uuid;
    }
  }
}
