import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.page.html',
  styleUrls: ['./loader.page.scss'],
})
export class LoaderPage implements OnInit {

  isLoading: Subject<boolean> = this.loaderService.isLoading;
  displayText
  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.displayText.subscribe((data) => {      
      this.displayText = data;
    })
  }
}
