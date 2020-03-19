import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService, CaseService, CommonService } from 'src/app/services';
import { Geocoder } from '@ionic-native/google-maps/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
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
  infowindow: any;
  page = 1;
  limit = 20;

  constructor(
    private databaseService: DatabaseService,
    private commonService: CommonService,
    private caseService: CaseService,
    private geolocation: Geolocation,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.getCurrentLocation();
    this.getCases();
    this.initMap();
  }

  getCases() {
    this.caseService.getCases({ page: this.page++, limit: this.limit, nonblocking: 1 }).subscribe((res: any) => {
      this.cases = this.cases.concat(res.data);
      if (res.data && res.data.length) {
        this.getAddresses(res.data);
        this.getCases();
      }
    });
  }
  getAddresses(cases) {
    if (cases) {
      cases.forEach((da) => {
        const obj = {
          id: da.id,
          address: da.debtor.addresses[0],
          case: da,
          address_str: `${da.debtor.addresses[0].address_ln1}, ` +
            `${da.debtor.addresses[0].address_ln2}, ` +
            `${da.debtor.addresses[0].address_ln3}, ` +
            `${da.debtor.addresses[0].address_postcode}`,
          location: {}
        };
        this.getGeocodesLatLongs(obj);
      });

    }

  }

  getGeocodesLatLongs(obj) {
    this.caseService.geoCodeAddress(obj.address_str).subscribe((res: any) => {
      if (res.status === 'OK' && res.results && res.results[0]) {
        obj.location = res.results[0]['geometry']['location'];
        this.setCaseMarkers(obj);
      } else {
        console.log(obj, res);
      }
    }, err => {
      console.log(err);
    });
  }

  setCaseMarkers(obj) {
    if (obj.location) {
      const contentString = '<div id="content">' +
        '<h3>(Case # ' + obj.id + ')</h3>' +
        '<div id="bodyContent">' +
        '<p> <b>' + obj.address_str + '</b></p>' +
        '</div>' +
        '</div>' +
        '<button id="' + obj.id + '" class="' + obj.id + ' btn btn-primary visitButton">Visit Case</button>';
      const infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      const marker = new google.maps.Marker({
        position: obj.location,
        title: obj.address_str,
        map: this.map,
      });
      this.markers.push(marker);

      marker.addListener('click', () => {
        if (this.infowindow) { this.infowindow.close(); }
        this.infowindow = infowindow;
        infowindow.open(this.map, marker);
      });
    }
  }
  async getCurrentLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.currLang = coords.longitude;
    this.currLat = coords.latitude;
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
      center: new google.maps.LatLng(51.8218729, -0.8051583),
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
    console.log(this.polygonMarkers);
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
        if (status === 'OK') {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
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
}
