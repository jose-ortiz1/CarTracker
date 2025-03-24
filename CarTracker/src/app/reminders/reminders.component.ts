import { Component, OnInit } from '@angular/core';
import { CartrackerService } from '../cartracker.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reminders.component.html',
  styleUrl: './reminders.component.css'
})
export class RemindersComponent implements OnInit{
  vehicles: any[] = [];
  selectedVehicle: any;
  reminders: any[] = [];
  selectedReminder: any = null;
  modalInstance: any;
  currentMileage: any;
  availableServices: any[] = [];

  reminderData = {
    vehicle_id: null,
    service_type_id: null,
    due_date: '',
    due_mileage: null,
    recurring: false,
    repeat_interval: ''
  };
  

  constructor(private carTrackerService: CartrackerService, private router: Router) { }



  ngOnInit() {
    this.fetchVehicles();
    this.fetchServiceTypes();
  }

  fetchVehicles() {
    const user = this.carTrackerService.getCurrentUser();
    this.carTrackerService.getVehiclesByUser(user.user_id)
      .subscribe(vehicles => {
        this.vehicles = vehicles;
        if (vehicles.length > 0) {
          this.selectedVehicle = vehicles[0];
          this.currentMileage = this.selectedVehicle.mileage;
          this.fetchReminders();
          
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

  fetchReminders() {
    if (!this.selectedVehicle) return;
    this.carTrackerService.getRemindersByVehicle(this.selectedVehicle.vehicle_id)
      .subscribe(reminders => {
        this.reminders = reminders;
      });
  }

  editReminder(reminder: any){
    this.openReminderModal(reminder);
  }

  deleteReminder(reminder_id: number) {
    this.carTrackerService.deleteReminder(reminder_id).subscribe(() => {
      this.fetchReminders();
    });
  }

  openReminderModal(reminder: any = null) {
    this.selectedReminder = reminder ? { ...reminder } : null; // Ensure full copy is created

  this.reminderData = {
    vehicle_id: this.selectedVehicle.vehicle_id,
    service_type_id: reminder?.service_type_id || '',  // Ensure service type is selected
    due_date: reminder?.due_date ? this.formatDate(reminder.due_date) : '',  // Format date properly
    due_mileage: reminder?.due_mileage || null,
    recurring: reminder?.recurring || false,
    repeat_interval: reminder?.repeat_interval || ''
  };
    this.currentMileage = this.selectedVehicle?.mileage || 0;

    const modalElement = document.getElementById('reminderModal');
    this.modalInstance = new bootstrap.Modal(modalElement!);
    this.modalInstance.show();
  }

  saveReminder() {
    if (this.reminderData.due_date) {
      this.reminderData.due_date = this.reminderData.due_date;
    }
    if (this.selectedReminder) {
      this.carTrackerService.updateReminder(this.selectedReminder.reminder_id, this.reminderData)
        .subscribe(() => {
          this.fetchReminders();
          this.modalInstance.hide();
        });
    } else {
      this.carTrackerService.addReminder(this.reminderData)
        .subscribe(() => {
          this.fetchReminders();
          this.modalInstance.hide();
        });
    }
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD
formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'

}



}
