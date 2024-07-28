import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule}  from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { FormBuilder, FormControl, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { finalize, Subscription, take } from 'rxjs';
import _ from 'lodash';
import { SearchService } from './search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltipModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  providers: [SearchService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  formGrp!: UntypedFormGroup;
  formGrpCheerio!: UntypedFormGroup;
  isSubmitted!: boolean;
  siteResults: Array<any> = [];
  cheerioResults: Array<any> = [];

  private _resultSub$!: Subscription;

  get searchCtrl(): FormControl {
    return this.formGrp.get('term') as FormControl;
  }

  get keywordsCtrl(): FormControl {
    return this.formGrp.get('keywords') as FormControl;
  }

  get searchSCtrl(): FormControl {
    return this.formGrpCheerio.get('term') as FormControl;
  }

  get keywordsSCtrl(): FormControl {
    return this.formGrpCheerio.get('keywords') as FormControl;
  }

  get resultSize() {
    return _.size(this.siteResults);
  }

  get resultCSize() {
    return _.size(this.cheerioResults);
  }

  get isLoadMore$() {
    return this._searchService.isLoadMore$;
  }

  constructor(
    private readonly _searchService: SearchService,
    private readonly _fb: FormBuilder
  ) {
    this._initFormGroup();
  }

  search(isLoadMore = false) {
    if (this.formGrp.valid && !this.isSubmitted) {
      this._searchService.fetch(this.formGrp.value, isLoadMore)
        .pipe(
          take(1),
          finalize(() => this.isSubmitted = false)
        )
        .subscribe(() => this._subscribeSearchResult());
    }
  }

  scrape() {
    if (this.formGrpCheerio.valid && !this.isSubmitted) {
      this._searchService.scrape(this.formGrpCheerio.value)
        .pipe(
          take(1),
          finalize(() => this.isSubmitted = false)
        )
        .subscribe((res: any) => this.cheerioResults = res?.data || []);
    }
  }

  private _initFormGroup() {
    this.formGrp = this._fb.group({
      term: new FormControl('', [Validators.required]),
      keywords: new FormControl('', [Validators.required]),
      isExtract: new FormControl(true)
    });

    this.formGrpCheerio = this._fb.group({
      term: new FormControl('', [Validators.required]),
      keywords: new FormControl('', [Validators.required]),
      isExtract: new FormControl(true)
    });
  }

  private _subscribeSearchResult() {
    this._resultSub$?.unsubscribe();
    this._resultSub$ = this._searchService.siteResult$
      .subscribe((data: Array<any>) => (this.siteResults = data));
  }
}
