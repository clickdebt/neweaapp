import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService, CaseService } from 'src/app/services';
import { Geocoder } from '@ionic-native/google-maps/ngx';
declare var google;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
})
export class MapViewPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;

  isMapDirectionVisible;
  gmarker = [];
  map: any;
  cases = [];
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  markers = [];

  constructor(
    private databaseService: DatabaseService,
    private caseService: CaseService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.getCases();
    this.initMap();
  }

  getCases() {
    this.caseService.getCases({limit: 1000}).subscribe(res => {
      this.cases = res['data'];
      this.getAddresses();
    });
    // const data = await this.databaseService.select('rdeb_cases');
    // if (data.rows) {
    //   for (let i = 0; i < data.rows.length; i++) {
    //     this.cases.push(data.rows.item(i));
    //   }
    // }
    // for (const ca of this.cases) {
    //   try {
    //     ca.data = JSON.parse(decodeURI(ca.data));
    //   } catch (error) { }
    // }
  }
  getAddresses() {
    if (this.cases) {
      let count= this.cases.length;
      console.log(count)
      var bar = new Promise((resolve, reject) => {
        this.cases.forEach((da, index) => {
          console.log(index)
          const obj = {
            id: da.id,
            address: da.debtor.addresses[0],
            address_str: `${da.debtor.addresses[0].address_ln1}, ` +
              `${da.debtor.addresses[0].address_ln2}, ` +
              `${da.debtor.addresses[0].address_ln3}, ` +
              `${da.debtor.addresses[0].address_postcode}`,
            location: {}
          };
          this.getGeocodesLatLongs(obj, resolve, reject, index, count);
        });
      });
      bar.then(() => this.setCaseMarkers());
    }

  }

  getGeocodesLatLongs(obj, resolve, reject, index, count) {
    this.caseService.geoCodeAddress(obj.address_str).subscribe(
      res => {
        if (res['results']) {
          obj.location = res['results'][0]['geometry']['location'];
          this.markers.push(obj);
        }
      },
      err => {
        console.log(err);
      }, () => {
        if (this.markers.length === count) resolve();
      });
  }
  initMap() {

    var pOptions = {
      map: this.map,
      strokeColor: "#347EE7",
      strokeOpacity: 0.9,
      strokeWeight: 3,

    };
    var mDirectionsRendererOptions = {
      map: this.map,
      polylineOptions: pOptions
    };
    this.directionsDisplay = new google.maps.DirectionsRenderer(mDirectionsRendererOptions);
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 12,
      center: new google.maps.LatLng(51.759080, 0.123160),
      streetViewControl: false,
      mapTypeControl: false
    });
    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP,
        drawingModes: ['circle', 'polygon']
      },
      circleOptions: {
        fillColor: '#CC0092',
        fillOpacity: 0.1,
        strokeOpacity: 1.0,
        strokeColor: "#CC0092",
        strokeWeight: 1,
        editable: true,
        zIndex: 1
      },
      polygonOptions: {
        strokeColor: "#CC0092",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        fillColor: "#CC0092",
        fillOpacity: 0.1,
        editable: true,
        draggable: true,
        zIndex: 1
      }
    });

    drawingManager.setMap(this.map);
  }

  setCaseMarkers() {
    console.log(this.markers);

    const markerPoints = this.markers.map(d => {
      return {
        position: {
          lat: d.location.lat,
          lng: d.location.lng
        },
        title: d.address_str,
        id: d.id
      };
    });
    markerPoints.forEach(marker => {
      new google.maps.Marker({
        position: marker.position,
        title: marker.title,
        map: this.map,

      });
    })

    // console.log(markerPoints);
  }

}
