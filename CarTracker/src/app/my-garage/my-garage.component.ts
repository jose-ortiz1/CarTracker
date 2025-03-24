import { Component, OnInit } from '@angular/core';
import { CartrackerService } from '../cartracker.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-garage',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule],
  templateUrl: './my-garage.component.html',
  styleUrl: './my-garage.component.css'
})
export class MyGarageComponent implements OnInit {

  vehicles: any[] = [];
  selectedVehicle: any = null;
  currentUser:any;
  isEditing:boolean = false;

  constructor(
    private carTrackerService: CartrackerService,
    private router: Router
  ) { }

  ngOnInit(){
    this.currentUser = this.carTrackerService.getCurrentUser();
    console.log(this.currentUser);

    this.fetchVehicles();
    
  }

  fetchVehicles() {
    this.carTrackerService.getVehiclesByUser(this.currentUser.user_id).subscribe(
      (response) => {
        this.vehicles = response;
        if (this.vehicles.length > 0) {
          this.selectedVehicle = this.vehicles[0];
        }
      },
      (error) => {
        console.error('Failed to fetch vehicles:', error);
      }
    );
  }

  selectVehicle(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.isEditing = false;
  }
  

  deleteVehicle(vehicleId: number) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    this.carTrackerService.deleteVehicle(vehicleId).subscribe(
      () => {
        alert('Vehicle deleted successfully!');
        this.fetchVehicles();
      },
      (error) => {
        alert('Failed to delete vehicle: ' + error.error.message);
      }
    );
  }

  editVehicle() {
    this.isEditing = !this.isEditing;
  }

  saveChanges() {
    if (!this.selectedVehicle) return;

    // Convert `purchase_date` to 'YYYY-MM-DD'
    if (this.selectedVehicle.purchase_date) {
      this.selectedVehicle.purchase_date = this.selectedVehicle.purchase_date.split('T')[0]; 
    }

    this.carTrackerService.updateVehicle(this.selectedVehicle).subscribe(
      () => {
        alert('Vehicle updated successfully!');
        this.isEditing = false;
      },
      (error) => {
        alert('Failed to update vehicle: ' + error.error.message);
      }
    );
  }




}
