import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-view-map',
  standalone: true,
  imports: [],
  templateUrl: './view-map.component.html',
  styleUrl: './view-map.component.css'
})
export class ViewMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() title: string = 'Ubicación aproximada';

  private map!: L.Map;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initDisplayMap();
  }

  initDisplayMap(): void {
    if (!this.latitude || !this.longitude) {
      console.warn('Coordenadas no proporcionadas para el mapa');
      return;
    }
    
    const approxLat = this.latitude;
    const approxLng = this.longitude; 

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [approxLat, approxLng],
      zoom: 14,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: true,
      keyboard: false,
      dragging: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);


    const proximityCircle = L.circle([approxLat, approxLng], {
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 0.3,
      radius: 300 
    }).addTo(this.map);

    proximityCircle.bindPopup(`
      <div style="text-align: center;">
        <strong>${this.title}</strong><br>
        <small>Ubicación aproximada</small>
      </div>
    `);

    this.map.fitBounds(proximityCircle.getBounds(), {
      padding: [20, 20]
    });
  }

  updateLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
    if (this.map) {
      this.map.remove();
      setTimeout(() => {
        this.initDisplayMap();
      }, 100);
    }
  }
}

