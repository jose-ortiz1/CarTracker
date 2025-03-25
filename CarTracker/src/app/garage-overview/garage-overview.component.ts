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
      const now = new Date();

      this.reminders = reminders.map((reminder:any) => {
        const dueDate = new Date(reminder.due_date);
        const monthsDiff =
          (dueDate.getFullYear() - now.getFullYear()) * 12 +
          (dueDate.getMonth() - now.getMonth());

        if (monthsDiff < 1) {
          reminder.status = 'Overdue';
        } else if (monthsDiff >= 1 && monthsDiff < 4) {
          reminder.status = 'Due Soon';
        } else {
          reminder.status = 'Upcoming';
        }

        return reminder;
      });
    });
}

  onVehicleChange() {
    this.fetchReminders();
    this.fetchServiceLogs();
  }

  
  getRemainingMonths(dueDate: string): string {
    if (!dueDate) return '';
  
    const now = new Date();
    const due = new Date(dueDate);
  
    // Calculate year and month difference
    let monthsDiff =
      (due.getFullYear() - now.getFullYear()) * 12 +
      (due.getMonth() - now.getMonth());
  
      const monthName = due.toLocaleString('default', { month: 'long' });

      if (monthsDiff < 0) return `Overdue (${monthName})`;
      if (monthsDiff === 0) return `Due this month (${monthName})`;
    
      return `Due in ${monthsDiff} month${monthsDiff > 1 ? 's' : ''} (${monthName})`;
  }

  

}