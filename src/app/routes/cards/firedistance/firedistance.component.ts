import { Component, OnInit } from "@angular/core";
import { DeckService } from '../../../services/cards/deck.service'
import { OpenStreetMapProvider } from 'leaflet-geosearch';

declare let L;

@Component({
  selector: "app-firedistance",
  templateUrl: "./firedistance.component.html",
  styleUrls: ["./firedistance.component.scss"]
})
export class FiredistanceComponent implements OnInit {
  private rootIconDir = "../../../assets/decks/fire/location";

  private informerMarker;
  private fireMarker;
  private map;
  private distanceLine;
  private provider;
  public search;

  constructor(private deckService: DeckService) { }

  ngOnInit() {
    this.initMap();
  }

  private initMap() {
    let lat = -7.7;
    let lng = 110.2
    if (this.deckService.getFireLocation()) {
      lat = this.deckService.getLocation().lat
      lng = this.deckService.getLocation().lng
    }

    this.map = L.map('mapid', { center: [lat, lng], zoom: 18});    

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

    // Add compass
    this.map.addControl(new L.Control.Compass());

    // Add locate
    const locate = L.control.locate({ icon: 'locate', keepCurrentZoomLevel: true }).addTo(this.map);

    if (this.deckService.getLocation()) this.onLocateFound()
    else locate.start() // Locate user current location

    this.map.on("locationfound ", () => this.onLocateFound() );

    this.provider = new OpenStreetMapProvider();
  }

  private onLocateFound(): void {
    this.addMarker("informer");
    this.addMarker("fire");
    this.addDistanceLine();
  }

  private countDistance(): string {
    const distanceInMeter = this.map.distance(
      this.fireMarker.getLatLng(),
      this.informerMarker.getLatLng()
    );
    const ceiledDistance = Math.ceil(distanceInMeter);

    let distanceInString;
    if (ceiledDistance >= 1000) {
      distanceInString = `${(ceiledDistance / 1000).toString()} km`;
    } else {
      distanceInString = `${ceiledDistance.toString()} m`;
    }

    return distanceInString;
  }

  private addDistanceLine(): void {
    if (this.distanceLine) this.distanceLine.remove(this.map);

    this.distanceLine = L.polyline(
      [this.fireMarker.getLatLng(), this.informerMarker.getLatLng()],
      {
        color: "red"
      }
    ).addTo(this.map);

    this.distanceLine.setText(this.countDistance(), {
      repeat: false,
      offset: 12,
      center: true
    });
  }

  private addMarker(type: "informer" | "fire"): void {
    let latlng;
    switch (type) {
      case "informer":
        latlng = {
          lat: this.map.getCenter().lat,
          lng: this.map.getCenter().lng
        };
        this.deckService.setLocation(latlng);
        break;
      case "fire":
        if (!this.deckService.getFireLocation()) {
          latlng = {
            lat: this.map.getCenter().lat,
            lng: this.map.getCenter().lng - this.map.getCenter().lng / 1000000
          };
          this.deckService.setFireLocation(latlng);
        } else {
          latlng = this.deckService.getFireLocation()
        }
        break;
    }

    const marker = L.marker([latlng.lat, latlng.lng], {
      icon: this.getIcon(type),
      draggable: true
    });

    switch (type) {
      case "informer":
        if (this.informerMarker) this.informerMarker.remove(this.map);
        this.informerMarker = marker;
        break;
      case "fire":
        if (this.fireMarker) this.fireMarker.remove(this.map);
        this.fireMarker = marker;
        break;
    }
    marker.addTo(this.map);

    // Adjust distance line between informer and fire
    marker.on("move", (e) => {
      switch (type) {
        case "informer":
          this.deckService.setLocation(e.latlng)
          break;
        case "fire":
          this.deckService.setFireLocation(e.latlng)
          break;
      }
      this.addDistanceLine();
    });

    // // Change marker icon when drag and drop
    // marker.on("mouseover", () => {
    //   this.setMarkerIcon(marker, type, true);
    // });
    // marker.on("moveend", () => {
    //   this.setMarkerIcon(marker, type);
    // });
    // marker.on("mouseout", () => {
    //   this.setMarkerIcon(marker, type);
    // });
  }

  async onSearch() {
    const results = await this.provider.search({ query: this.search });

    this.map.setView({ lat: results[0].y, lng: results[0].x }, 18)

    this.addMarker("informer");

    this.deckService.setFireLocation(null);
    this.addMarker("fire");
    
    this.addDistanceLine();
  }

  getIcon(type: 'informer' | 'fire') {
    return L.icon({
      iconUrl: `${this.rootIconDir}/Select${
        type === "fire" ? "Fire" : ""
        }Location_Grey.png`,
      iconSize: [57.2 / 2, 103.5 / 2],
      iconAnchor: [15, 50]
    })
  }

  private setMarkerIcon(marker, type, highlight = false): void {
    marker.setIcon(
      L.icon({
        iconUrl:
          `${this.rootIconDir}` +
          `/Select${type === "fire" ? "Fire" : ""}` +
          `Location_${highlight ? "Highlight" : "Grey"}.png`
      })
    );
  }
}
