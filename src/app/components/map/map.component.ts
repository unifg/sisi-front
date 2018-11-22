import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AclService } from 'ng2-acl';
import { Occurrence } from './../../models/occurrence.model';
import { MouseEvent } from '@agm/core';
import { OccurrenceService } from './../../services/occurrence.service';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  lat  = -8.05225025;
  lng  = -34.9450490084884;

  public occurrence: Occurrence;
  public data: Occurrence[];

  constructor(
    private router: Router,
    public aclService: AclService,
    private authService: AuthService,
    private occurrenceService: OccurrenceService
    ) { }

    clickedMarker(label: string, index: number) {
      console.log(`clicked the marker: ${label || index}`)
    }

    mapClicked($event: MouseEvent) {
      this.markers.push({
        lat: $event.coords.lat,
        lng: $event.coords.lng,
      });
    }

    markers: marker[] = [
      {
        lat: -8.05225025,
        lng: -34.9450490084884,
        label: 'A'
      },
      {
        lat: -8.05225025,
        lng: -34.9450490084884,
        label: 'B'
      },
      {
        lat: -8.05225025,
        lng: -34.9450490084884,
        label: 'C'
      }
    ]

    

  ngOnInit() {
    this.occurrenceService.getOccurrences()
    .subscribe(
      (listData:any) => {

        this.data = listData.data;
        console.log(listData);
        for (let item in this.data) {
          console.log(item);
        }
        //console.log(data.data);
      },
      error => {
        console.log(error);        
      });
  }

}

interface marker {
	lat: number;
	lng: number;
	label?: string;
}
