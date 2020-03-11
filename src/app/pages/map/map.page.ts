import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  GoogleMap,
  GoogleMaps,
  LatLng,
  GoogleMapsEvent,
  MarkerOptions,
  Marker,
  BaseArrayClass,
  GoogleMapsAnimation,
  MyLocation,
  LatLngBounds
} from '@ionic-native/google-maps/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { StorageService } from 'src/app/services';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: GoogleMap;
  currLang;
  currLat;
  points = [];
  loading: any;
  circle: any;
  latLngs: LatLng[];

  constructor(
    private googleMaps: GoogleMaps,
    private geolocation: Geolocation,
    private launchNavigator: LaunchNavigator,
    private storageService: StorageService,
    private nativeGeocoder: NativeGeocoder,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.initMap();
  }

  initMap() {
    const POINTS: BaseArrayClass<any> = new BaseArrayClass<any>([
      {
        position: { lng: -122.1180187, lat: 37.3960513 },
        title: 'Ardis G Egan Intermediate School'
      },
      {
        position: { lng: -122.1180190, lat: 37.3960600 },
        title: 'Portola School'
      },
      {
        position: { lng: -122.0848257, lat: 37.3818032 },
        title: 'Isaac Newton Graham Middle School'
      },
      {
        position: { lng: -122.1082962, lat: 37.3863294 },
        title: 'Los Altos High School'
      },
      {
        position: { lng: -122.013571, lat: 37.3874409 },
        title: 'The Kings Academy'
      },
      {
        position: { lng: -122.082462, lat: 37.3627189 },
        title: 'Georgina P Blach Intermediate School'
      },
      {
        position: { lng: -122.0421832, lat: 37.3766077 },
        title: 'Benner Junior High School'
      }
    ]);

    const bounds: LatLng[] = POINTS.map((data: any, idx: number) => {
      console.log(data);
      return data.position;
    });

    this.latLngs = bounds;

    const mapOptions = {
      camera: {
        target: bounds
      },
      zoomControl: true,
      zoom: 12,
      streetViewControl: true
    };

    const element = this.mapElement.nativeElement;
    this.map = GoogleMaps.create(element, mapOptions);

    POINTS.forEach(async (data: any) => {
      data.disableAutoPan = true;
      const marker: Marker = await this.map.addMarker(data);
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => this.onMarkerClick(params));
      marker.on(GoogleMapsEvent.INFO_CLICK).subscribe((params) => this.onMarkerClick(params));
      marker.on(GoogleMapsEvent.MARKER_DRAG).subscribe((position) => { });
    });

    this.map.setMyLocationEnabled(true);
    this.map.setMyLocationButtonEnabled(true);
    this.map.setAllGesturesEnabled(true);
    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(() => this.myLocation());

  }

  onMarkerClick(params: any) {
    const marker: Marker = params[1] as Marker;
    const iconData: any = marker.get('iconData');
    marker.setIcon(iconData);

    if (!this.points) {
      this.points = [];
    }

    this.points.push(marker.getPosition());

    this.map.addPolyline({
      points: this.points,
      color: '#AA00FF',
      width: 2,
      geodesic: true
    });
  }

  async myLocation() {
    this.map.clear();

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await this.loading.present();

    // Get the location of you
    await this.getCurrentLocation();

    this.loading.dismiss();

    const latLng: LatLng = new LatLng(this.currLat, this.currLang);

    console.log(JSON.stringify(location, null, 2));

    // Move the map camera to the location with animation
    await this.moveCamera(latLng);

    // add a marker
    const marker: Marker = await this.map.addMarker({
      title: `Latitude: ${this.currLat} Longitude: ${this.currLang}`,
      position: latLng,
      animation: GoogleMapsAnimation.BOUNCE
    });

    // show the infoWindow
    marker.showInfoWindow();

    // If clicked it, display the alert
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      this.showToast('clicked!');
    });
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'middle'
    });

    toast.present();
  }

  async moveCamera(loc: LatLng) {
    const camOption = {
      target: loc,
      zoom: 12,
      tilt: 10
    };
    await this.map.moveCamera(camOption);
  }

  async createMarkers(loc: LatLng, title: string) {
    const markerOption: MarkerOptions = {
      position: loc,
      title
    };

    return await this.map.addMarker(markerOption);
  }

  async addCircle() {
    const mapClickSub = this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(async (latLng) => {
      if (this.circle) {
        this.circle.remove();
      }
      this.circle = await this.map.addCircle({
        center: { lat: latLng[0].lat, lng: latLng[0].lng },
        radius: 3000,
        strokeColor: '#CC0092',
        strokeWidth: 5,
        fillColor: '#CC0092',
        fillOpacity: 0.1,
        strokeOpacity: 1.0,
        clickable: true,
        strokeWeight: 1,
        editable: true,
        zIndex: 1
      });

      this.map.set('fillOpacity', 0.1);

      this.map.animateCamera({
        target: this.circle.getBounds()
      });


      const data = this.circle.getBounds();
      console.log('---latLng----', latLng);
      console.log('---circle----', this.circle);
      console.log('---getBounds----', data);

      const coveredMarkers = [];
      console.log('---latLngs----', this.latLngs);
      for (const loc of this.latLngs) {
        console.log('---loc----', loc);
        if (data.contains(loc)) {
          coveredMarkers.push(loc);
        }
      }

      console.log('---values----', coveredMarkers);

      await this.addRouteInCircle(coveredMarkers)

      // Catch the CIRCLE_CLICK event
      this.circle.on(GoogleMapsEvent.CIRCLE_CLICK).subscribe(async (latLng) => {
        console.log('---latLng----', latLng);
      });

      mapClickSub.unsubscribe();


    });
  }

  async getCurrentLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.currLang = coords.longitude;
    this.currLat = coords.latitude;
    return coords;
  }

  async watchCurrentLocation() {
    const subscription = this.geolocation.watchPosition()
      .subscribe(position => {
        console.log(position.coords.longitude + ' ' + position.coords.latitude);
        this.currLang = position.coords.longitude;
        this.currLat = position.coords.latitude;
      });
  }

  async getLocations() {
    const locations = await this.storageService.get('locations');
    return await this.getGeocodesLatLongs(locations);
  }

  async getGeocodesLatLongs(addresses = []) {
    const latLongs = [];
    for (const address of addresses) {
      const data = await this.nativeGeocoder.forwardGeocode(address);
      latLongs.push(data);
    }
    return latLongs;
  }

  async getGeocodesAddress(locations = []) {
    const latLongs = [];
    for (const loc of locations) {
      const data = await this.nativeGeocoder.reverseGeocode(loc.latitude, loc.longitude);
      latLongs.push(data);
    }
    return latLongs;
  }

  async navigateLocation(destination) {
    await this.launchNavigator.navigate(destination);
  }

  async addRouteInCircle(coveredMarkers) {

  }
}

