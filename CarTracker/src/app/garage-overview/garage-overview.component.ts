import { Component, OnInit } from '@angular/core';
import { CartrackerService } from '../cartracker.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-garage-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './garage-overview.component.html',
  styleUrl: './garage-overview.component.css'
})
export class GarageOverviewComponent implements OnInit {

  vehicles: any[] = [];
  serviceLogs: any[] = [];
  reminders: any[] = [];
  selectedVehicleId: any = null;
  currentUser: any = null;
  availableServices: any[] = [];

  constructor(private carTrackerService: CartrackerService) {}

  ngOnInit() {
    this.currentUser = this.carTrackerService.getCurrentUser();
    if (this.currentUser && this.currentUser.user_id) {
      this.fetchVehicles();
    }
  }

  fetchVehicles() {
    this.carTrackerService.getVehiclesByUser(this.currentUser.user_id).subscribe(vehicles => {
      this.vehicles = vehicles;
      if (vehicles.length > 0) {
        this.selectedVehicleId = vehicles[0].vehicle_id;
        this.fetchReminders();
        this.fetchServiceLogs();
        
      }
    });
  }

  fetchServiceTypes() {
    this.carTrackerService.getServiceTypes()
      .subscribe(types => {
        this.availableServices = types; // Store fetched service types
        console.log('Fetched service types:', this.availableServices);
      }, error => {
        console.error('Error fetching service types:', error);
      });
  }

  fetchServiceLogs() {
    if (!this.selectedVehicleId) return;
    this.carTrackerService.getServicesByVehicle(this.selectedVehicleId)
      .subscribe(logs => {
        this.serviceLogs = logs;
      });
  }

  fetchReminders() {
    if (!this.selectedVehicleId) return;
    this.carTrackerService.getRemindersByVehicle(this.selectedVehicleId)
      .subscribe(reminders => {
        this.reminders = reminders;
      });
  }

  onVehicleChange() {
    this.fetchReminders();
    this.fetchServiceLogs();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Overdue': return 'overdue';
      case 'Due Soon': return 'due-soon';
      case 'Upcoming': return 'upcoming';
      default: return '';
    }
  }

  getReminderIcon(reminderType: string): string {
    if (!reminderType) return 'assets/icons/default.png'; // Fallback icon
    return `assets/icons/${reminderType.toLowerCase().replace(/\s+/g, '-')}.png`;
  }

}