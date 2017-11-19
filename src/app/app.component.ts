import { Component } from '@angular/core';

import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  prefectures: any;
  jsons: any;

  constructor(apiService: ApiService) {
    apiService.getPrefectures().subscribe(result => this.prefectures = result);
    apiService.getJson().subscribe(result => this.jsons = result);
  }
}
