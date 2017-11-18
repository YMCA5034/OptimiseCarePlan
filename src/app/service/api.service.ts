import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {
  }

  /**
   * 都道府県情報を取得します。
   * 取得形式
   * <p>{ "message": null, "result": [ { "prefCode": 1, "prefName": "北海道" }, ... ], }</p>
   */
  public getPrefectures(): Observable<any> {
    return this.http.get('https://opendata.resas-portal.go.jp/api/v1/population/sum/perYear?cityCode=11362&prefCode=11',
    { headers : new HttpHeaders({ 'X-API-KEY' : 'KbE45XmsIkvOFmi6rlyOjqhAjcM4hMifhRELvwmc'})});
  }
}
