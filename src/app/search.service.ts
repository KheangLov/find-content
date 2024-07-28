import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, map } from 'rxjs';
import _ from 'lodash';

const API_KEY = 'KEY';
const CX = 'KEY';
const GOOGLE_API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const CUSTOM_API_URL = 'http://localhost:3000';
const CHECK_LINK_ENDPOINT = '/check-link';
const GET_LINKS_ENDPOINT = '/get-links';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  siteResult$ = new BehaviorSubject<Array<any>>([]);
  isLoadMore$ = new BehaviorSubject<boolean>(false);

  next = '1';

  constructor(private readonly _httpClient: HttpClient) {}

  fetch(param: any, isLoadMore = false, safeSearch: 'off' | 'active' = 'active') {
    const params = new HttpParams()
      .set('key', API_KEY)
      .set('cx', CX)
      .set('q', param.term)
      .set('start', this.next)
      .set('safe', safeSearch);

    console.log({ next: this.next });
    !isLoadMore && this.siteResult$.next([]);
    this.isLoadMore$.next(false);

    return this._httpClient.get(GOOGLE_API_ENDPOINT, { params })
      .pipe(map((res: any) => {
        this.next = (_.first(res.queries?.nextPage) as any)?.startIndex;
        return this._filterResultByKeywords(param.keywords, res.items, param.isExtract);
      }));
  }

  scrape(param: any) {
    const params = new HttpParams()
      .set('q', param.term)
      .set('keywords', param.keywords)
      .set('isExtract', param.isExtract || true);

    return this._httpClient.get(`${CUSTOM_API_URL}${GET_LINKS_ENDPOINT}`, { params });
  }

  private _filterResultByKeywords(keywords: string, results: Array<any>, isExtract: boolean) {
    _.forEach(results, (item: any, index: number) => {
      const _sub$ = this._getCheckLink(item.link, keywords, isExtract)
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          if (res?.data?.isMatch) {
            const _curItem = this.siteResult$.getValue();
            this.siteResult$.next([..._curItem, item]);
          }

          ((index + 1) === _.size(results)) && this.isLoadMore$.next(true);

          setTimeout(() => _sub$.unsubscribe());
        });
    });

    return results;
  }

  private _getCheckLink(link: string, keywords: string, isExtract = true) {
    const params = new HttpParams()
      .set('link', link)
      .set('keywords', keywords)
      .set('isExtract', isExtract);

    return this._httpClient.get(`${CUSTOM_API_URL}${CHECK_LINK_ENDPOINT}`, { params });
  }
}
