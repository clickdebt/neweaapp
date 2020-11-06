import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CaseService, CommonService, StorageService } from 'src/app/services';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Router } from '@angular/router';
declare var google;
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
})
export class MapViewPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;

  isMapDirectionVisible;
  map: any;
  cases = [];
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  markers = [];
  circle = new google.maps.Circle();
  polygon = new google.maps.Polygon();
  drawingManager: any;
  stepPolyline: any;
  routeLegs: any[];
  radius: any;
  center: any;
  polygonMarkers = [];
  currLang = -0.8051583;
  currLat = 51.8218729;
  centerLng = -0.8051583;
  centerLat = 51.8218729;
  index = 0;
  casesLength;
  infowindow: any;
  page = 1;
  limit = 20;
  apiReq;
  icons = {
    red: 'assets/icon/pin-red.png',
    grey: 'assets/icon/pin-grey.png'
  };
  destination: string;

  constructor(
    private commonService: CommonService,
    private caseService: CaseService,
    private geolocation: Geolocation,
    private storageService: StorageService,
    private router: Router,
    private launchNavigator: LaunchNavigator
  ) { }

  ngOnInit() {
    this.storageService.remove('not_reload_map');
  }

  async ionViewDidEnter() {
    this.page = 1;
    this.markers = [];
    this.index = 0;
    this.commonService.checkLocation();
    this.getCurrentLocation();
    this.getCases();
  }
  ionViewWillLeave() {
    this.storageService.remove('selected_cases_for_map');
    this.apiReq.unsubscribe();
  }
  async getCases() {
    const caseIds = await this.storageService.get('selected_cases_for_map');
    const back = await this.storageService.get('not_reload_map');
    this.storageService.remove('not_reload_map');
    if (!back) {
      let params: any;
      if (caseIds) {
        params = { cases: caseIds, nonblocking: 1 };
      } else {
        params = { page: this.page++, limit: this.limit, nonblocking: 1 };
      }
      this.apiReq = this.caseService.getCases(params).subscribe((res: any) => {
        this.cases = this.cases.concat(res.data);
        console.log(this.cases);
        if (res.data && res.data.length) {
          console.log(res);
          this.getAddresses(res.data);
          if (!caseIds) {
            this.getCases();
          }
        }
      });
    }
  }
  getAddresses(cases) {
    if (cases) {
      cases.forEach((da, caseIndex) => {
        if (da.debtor.enforcement_addresses.length) {
          da.address_str = `${da.debtor.enforcement_addresses[0].address_ln1}, ` +
            `${da.debtor.enforcement_addresses[0].address_ln2}, ` +
            `${da.debtor.enforcement_addresses[0].address_ln3}, ` +
            `${da.debtor.enforcement_addresses[0].address_postcode}`;
        } else if (da.debtor.addresses.length) {
          da.address_str = `${da.debtor.addresses[0].address_ln1}, ` +
            `${da.debtor.addresses[0].address_ln2}, ` +
            `${da.debtor.addresses[0].address_ln3}, ` +
            `${da.debtor.addresses[0].address_postcode}`;
        } else {
          da.address_str = '';
        }

        da.location = {};
        console.log(da.address_str);
        if (da.address_str) {
          this.getGeocodesLatLongs(da, caseIndex);
        }
      });

    }

  }

  getGeocodesLatLongs(obj, caseIndex) {
    this.caseService.geoCodeAddress(obj.address_str).subscribe((res: any) => {
      if (res.status === 'OK' && res.results && res.results[0]) {
        obj.location = res.results[0]['geometry']['location'];
        if (this.index === 0) {
          this.centerLat = obj.location.lat;
          this.centerLng = obj.location.lng;
          this.initMap();
          this.index++;
        }
        this.setCaseMarkers(obj);
      } else {
        if (this.index === 0 && caseIndex === this.cases.length - 1) {
          this.initMap(); this.index++;
        }
        console.log(obj, res);
      }
    }, err => {
      console.log(err);
    });
  }

  setCaseMarkers(obj) {
    if (obj.location) {
      const isVisit = obj.stage.stage_type.stage_type === 'Visit' ? true : false;
      const contentString = '<div id="content">' +
        '<h5>(Case # ' + obj.id + ')</h5>' +
        '<div id="bodyContent">' +
        '<p> <b>' + obj.address_str + '</b></p>' +
        (obj.debtor.debtor_name ? '<p> <b>' + obj.debtor.debtor_name + '</b></p>' : '') +
        (obj.debtor.debtor_mobile ? '<p> <b>' + obj.debtor.debtor_mobile + '</b></p>' : '') +
        (obj.debtor.debtor_phone ? '<p> <b>' + obj.debtor.debtor_phone + '</b></p>' : '') +
        '</div>' +
        '</div>' +
        '<ion-button size="small" color="secondary" id="' + obj.id + '" class="detail-' + obj.id + ' detailsButton">Details</ion-button>' +
        (isVisit ? '<ion-button size="small" color="tertiary" id="' + obj.id + '" class="' + obj.id + ' visitButton">Visit</ion-button>' : '');
      const infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      google.maps.event.addDomListener(infowindow, 'domready', () => {
        const btn = document.querySelector('.visitButton');
        const detailsButton = document.querySelector('.detailsButton');
        google.maps.event.addDomListener(btn, 'click', () => {
          const caseId = btn.getAttribute('id');
          if (caseId) {
            this.setCaseForBackLink();

            this.router.navigate(['/home/visit-form/' + caseId]);
          }
        });
        google.maps.event.addDomListener(detailsButton, 'click', () => {
          const caseId = detailsButton.getAttribute('id');
          if (caseId) {
            const currentCase = this.cases.find((currenCase) => {
              return currenCase.id === caseId;
            });
            localStorage.setItem('detais_case_data', JSON.stringify(currentCase));
            this.setCaseForBackLink();
            this.router.navigate(['/home/case-details/' + caseId]);
          }
        });
      });
      const markerIcon = isVisit ? this.icons.red : this.icons.grey;
      const marker = new google.maps.Marker({
        position: obj.location,
        title: obj.address_str,
        map: this.map,
        icon: markerIcon
      });
      this.markers.push(marker);
      marker.addListener('click', () => {
        if (this.infowindow) { this.infowindow.close(); }
        this.infowindow = infowindow;
        infowindow.open(this.map, marker);
      });
    }
  }
  async setCaseForBackLink() {
    this.storageService.set('from_map_page', true);
  }
  async getCurrentLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.currLang = coords.longitude;
    this.currLat = coords.latitude;
    // console.log(this.currLang, this.currLat);
    return coords;
  }

  initMap() {

    const pOptions = {
      map: this.map,
      strokeColor: '#347EE7',
      strokeOpacity: 0.9,
      strokeWeight: 3,

    };
    const mDirectionsRendererOptions = {
      map: this.map,
      polylineOptions: pOptions
    };
    this.directionsDisplay = new google.maps.DirectionsRenderer(mDirectionsRendererOptions);
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 12,
      center: new google.maps.LatLng(this.centerLat, this.centerLng),
      streetViewControl: false,
      mapTypeControl: false
    });
    this.drawingManager = new google.maps.drawing.DrawingManager({
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
        strokeColor: '#CC0092',
        strokeWeight: 1,
        editable: true,
        zIndex: 1
      },
      polygonOptions: {
        strokeColor: '#CC0092',
        strokeOpacity: 1.0,
        strokeWeight: 1,
        fillColor: '#CC0092',
        fillOpacity: 0.1,
        editable: true,
        draggable: true,
        zIndex: 1
      }
    });

    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (evt) => {

      // clear old circle, polyline
      if (this.circle.getMap() != null) {
        this.circle.setMap(null);
        if (this.stepPolyline) {
          this.stepPolyline.setMap(null);
        }
        this.routeLegs = [];
        this.directionsDisplay.setMap(null);
      }
      // clear old circle, polyline
      if (this.polygon.getMap() != null) {
        this.polygon.setMap(null);
        if (this.stepPolyline) {
          this.stepPolyline.setMap(null);
        }
        this.routeLegs = [];
        this.directionsDisplay.setMap(null);
      }

      if (evt.type === 'circle') {
        this.circle = evt.overlay;
        this.radius = this.circle.getRadius();
        this.center = this.circle.getCenter();
        this.addCirclePoints(evt);
      }
      if (evt.type === 'polygon') {
        this.polygon = evt.overlay;
        console.log(this.polygon);
        this.addPolyPoints(evt);

      }
      google.maps.event.addListener(this.circle, 'radius_changed', (e) => {
        console.log(e);

        if (this.stepPolyline !== undefined) {
          this.stepPolyline.setMap(null);
        }
        this.routeLegs = [];

        this.directionsDisplay.setMap(null);
        this.radius = this.circle.getRadius();
        this.center = this.circle.getCenter();
        console.log('center chnage');
        this.addCirclePoints(e);
      });

      google.maps.event.addListener(this.circle, 'center_changed', (e) => {

        if (this.stepPolyline !== undefined) {
          this.stepPolyline.setMap(null);
        }
        this.routeLegs = [];

        this.directionsDisplay.setMap(null);
        this.radius = this.circle.getRadius();
        this.center = this.circle.getCenter();
        console.log('center change');
        this.addCirclePoints(e);
      });
      google.maps.event.addListener(this.polygon, 'dragend', (e) => {

        if (this.stepPolyline !== undefined) {
          this.stepPolyline.setMap(null);
        }
        this.routeLegs = [];

        this.directionsDisplay.setMap(null);
        this.addPolyPoints(e);
      });
      this.drawingManager.setDrawingMode(null);
    });
  }
  addCirclePoints(event) {
    this.polygonMarkers = [];
    this.markers.forEach(m => {
      if (google.maps.geometry.spherical.computeDistanceBetween(m.getPosition(), this.circle.getCenter()) <= this.radius && !m.visited) {
        if (this.polygonMarkers.indexOf(m) === -1) {
          this.polygonMarkers.push(m);
        }
      }
    });
    // console.log(this.polygonMarkers);
  }

  addPolyPoints(event) {
    this.polygonMarkers = [];
    this.markers.forEach(m => {
      if (google.maps.geometry.poly.containsLocation(m.getPosition(), this.polygon) && !m.visited) {
        if (this.polygonMarkers.indexOf(m) === -1) {
          this.polygonMarkers.push(m);
        }
      }
    });
    console.log(this.polygonMarkers);
  }

  calculateAndDisplayRoutes() {
    if (this.polygonMarkers.length) {
      let wayps = (this.polygonMarkers.length > 1) ? this.polygonMarkers.map(m => ({ location: m.position, stopover: true })) : [];
      wayps.splice(-1, 1);
      const start = new google.maps.LatLng(this.currLat, this.currLang);
      this.directionsService.route({
        origin: start,
        destination: this.polygonMarkers[this.polygonMarkers.length - 1].position,
        waypoints: wayps,
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: new Date(Date.now()),
          trafficModel: 'bestguess'
        }

      }, (response, status) => {
        this.destination = '';
        if (status === 'OK') {
          if (response.routes.length > 0) {
            this.routeLegs = response.routes[0].legs;
            this.routeLegs.forEach(leg => {
              this.destination = this.destination + ' to:' + leg.end_address;
            });
            this.directionsDisplay.setDirections(response);
            this.directionsDisplay.setMap(this.map);
          }
          // const camOption = {
          //   target: start,
          //   zoom: 16,
          //   tilt: 10
          // };
          // this.map.moveCamera(camOption);
        } else if (status === 'MAX_WAYPOINTS_EXCEEDED') {
          this.commonService.showToast('Maximum waypoints exceeded');
        } else {
          this.commonService.showToast('Directions request failed due to ' + status);
        }
      });
    }
  }

  async navigateLocation() {
    await this.launchNavigator.navigate(this.destination);
  }
}
