import {Component, OnInit, NgModule, ViewChild} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {SelectionService} from '../../services/selection.service';

import {IYear, IItem} from '../../app.interfaces';
import {DataService} from '../../services/data.service';
import {Observable} from 'rxjs/Observable';
import {RouterService} from '../../services/router.service';

import _ from 'lodash';
import { MasonryModule } from 'angular2-masonry';

@NgModule({
  imports: [
    MasonryModule
  ]
})

@Component({
  selector: 'results-list',
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.scss']
})

export class ResultsListComponent implements OnInit {
  @ViewChild('resultList') resultList;

  public items: Observable<IItem[]>;
  public item: any = null;
  public tags = [];
  public itemTitle: string = null;
  public itemAutor: string = null;
  public loadingData = true;
  public loadingDetailData = false;
  public totalResults: number = null;
  public collapsed = true;
  public years: IYear[];

  constructor(
    private api: ApiService,
    private dataService: DataService,
    private routerService: RouterService,
    private selection: SelectionService
  ) {
    api.loadingData$.subscribe((e) => {
      if (e === 'item') {
        this.loadingData = true;
      }
    });
    routerService.result.subscribe(size => {
      this.collapsed = size === 0 || size === null;
    });
  }

  ngOnInit(): void {
    this.items = this.dataService.items;
    this.dataService.items.subscribe(value => {
      this.tags = value.map(tag => {
        return {label: tag.title, tag};
      });
      this.loadingData = false;
      this.resultList.nativeElement.scrollTop = 0;
      this.getTotalResults();
    });

    this.dataService.years.subscribe(value => {
      this.years = value;
      this.getTotalResults();
    });
  }

  getItem(item: IItem): void {
    this.loadingDetailData = true;
    this.itemTitle = item.title;
    this.itemAutor = `${item.name} ${item.lastname}`;
    this.api.getItem(item.id).subscribe(data => {
      if (this.loadingDetailData === false) return;
      this.loadingDetailData = false;
      this.item = data;
    });
  }

  close() {
    this.loadingDetailData = false;
    this.item = null;
  }

  getTotalResults () {
    if (this.years == null) return;
    const min = (this.selection.getSelection() as any).min_year;
    const max = (this.selection.getSelection() as any).max_year;
    const selectedYears = min && max ? this.years.filter(d => d.year >= min && d.year <= max) : this.years;
    this.totalResults = selectedYears.length > 0 ? selectedYears.map(d => d.count).reduce((a, c) => a + c) : 0;
  }
}
