import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { GlobalItemsService } from '@services/global-items.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalItemInterface } from '@interfaces/global-item';
import { GlobalCategoryInterface } from '@interfaces/global-category';

interface CategoryGroup {
  item: GlobalItemInterface;
  categories: GlobalCategoryInterface[];
}

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzIconModule,
    NzAvatarModule,
    NzDividerModule,
    NzSpinModule
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent implements OnInit {

  public isLoading: boolean = true;
  public groupedCategories: CategoryGroup[] = [];

  constructor(
    private _globalItemsService: GlobalItemsService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData(): void {
    this.isLoading = true;

    forkJoin({
      itemsRes: this._globalItemsService.getGlobalItems(),
      categoriesRes: this._globalCategoriesService.getGlobalCategories()
    }).subscribe({
      next: (results: any) => {
        const items: GlobalItemInterface[] = results.itemsRes?.data || [];
        const categories: GlobalCategoryInterface[] = results.categoriesRes?.data || [];

        // Build the groupings
        this.groupedCategories = items.map(item => {
          const matchedCategories = categories.filter(cat => cat.gitm_uuid === item.gitm_uuid);
          return {
            item,
            categories: matchedCategories
          };
        }).filter(group => group.categories.length > 0);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching taxonomy:', err);
        this.isLoading = false;
      }
    });
  }

  public goToCategory(gcat_uuid: string): void {
    // Redirección futura a la búsqueda filtrada
    console.log('Navegar a la categoría', gcat_uuid);
    // this._router.navigate(['/public/catalog'], { queryParams: { category: gcat_uuid } });
  }
}
