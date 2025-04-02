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
  reminderToComplete: any;

  reminderData = {
    vehicle_id: null,
    service_type_id: null,
    due_date: '',
    due_mileage: null,
    recurring: false,
    repeat_interval: '',
    status: ''
  };

  completionData = {
    provider: '',
    cost: null,
    notes: ''
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

    this.selectedReminder = { ...reminder};
    this.reminderData = {
      vehicle_id: this.selectedVehicle.vehicle_id,
      service_type_id: reminder?.service_type_id || '',
      due_date: reminder?.due_date ? this.formatDate(reminder.due_date) : '',
      due_mileage: reminder?.due_mileage || null,
      recurring: reminder?.recurring || false,
      repeat_interval: reminder?.repeat_interval || '',
      status: reminder?.status || null
    };
    console.log(this.reminderData);

    this.currentMileage = this.selectedVehicle?.mileage || 0;

    const modalElement = document.getElementById('reminderModal');
    this.modalInstance = new bootstrap.Modal(modalElement!);
    this.modalInstance.show();
    
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
    service_type_id: reminder?.service_type_id || '', 
    due_date: reminder?.due_date ? this.formatDate(reminder.due_date) : '',  // Format date properly
    due_mileage: reminder?.due_mileage || null,
    status: reminder?.status || null,
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
      const status = this.calculateStatus(this.reminderData.due_date);
      this.reminderData.status = status;
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

  calculateStatus(dueDateString: string): string {
    const dueDate = new Date(dueDateString);
    const now = new Date();
  
    const monthsDiff =
      (dueDate.getFullYear() - now.getFullYear()) * 12 +
      (dueDate.getMonth() - now.getMonth());
  
    if (monthsDiff < 1) {
      return 'Overdue';
    } else if (monthsDiff >= 1 && monthsDiff < 4) {
      return 'Due Soon';
    } else {
      return 'Upcoming';
    }
  }

  completeReminder(reminder: any) {
    const confirmed = confirm(`Mark "${reminder.service_type}" as completed?`);
    if (!confirmed) return;
  
    // 1. Add it to the service history
    const serviceEntry = {
      vehicle_id: reminder.vehicle_id,
      service_type_id: reminder.service_type_id,
      service_date: new Date().toISOString().split('T')[0],
      mileage: reminder.due_mileage,
      provider: '', // You could ask the user via a modal
      cost: 0,      // Optional
      notes: 'Logged from Reminder',
      receipt_url: null
    };
  
    this.carTrackerService.addService(serviceEntry).subscribe(() => {
      // 2. Delete the reminder
      this.carTrackerService.deleteReminder(reminder.reminder_id).subscribe(() => {
        alert('Reminder marked as done and moved to Service History');
        this.fetchReminders(); // Refresh the view
      });
    });
  }

  openCompleteModal(reminder: any) {
    this.reminderToComplete = reminder;
    this.completionData = { provider: '', cost: null, notes: '' }; // Reset fields
  
    const modalEl = document.getElementById('completeReminderModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  markReminderAsCompleted() {
    if (!this.reminderToComplete) return;
    
    if (!this.completionData.provider || this.completionData.cost === null) {
      alert('Please provide both provider name and cost.');
      return;
    }
  
    const serviceRecord = {
      vehicle_id: this.selectedVehicle.vehicle_id,
      service_type_id: this.reminderToComplete.service_type_id,
      service_date: new Date().toISOString().split('T')[0], // today's date
      mileage: this.selectedVehicle.mileage,
      provider: this.completionData.provider,
      cost: this.completionData.cost,
      notes: this.completionData.notes,
      receipt_url: null
    };
  
    // 1. Save to service history
    this.carTrackerService.addService(serviceRecord).subscribe(() => {
      // 2. Delete the reminder
      this.carTrackerService.deleteReminder(this.reminderToComplete.reminder_id).subscribe(() => {
        this.fetchReminders(); // Refresh list
      });
    });
  
    // 3. Hide modal
    const modalEl = document.getElementById('completeReminderModal');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal?.hide();
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD
formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'

}



}
