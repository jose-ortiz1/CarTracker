import { Component, OnInit } from '@angular/core';
import { CartrackerService } from '../cartracker.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit{

  vehicles: any[] = [];
  selectedVehicle: any;
  serviceRecords: any[] = [];
  selectedService: any = null;
  modalInstance: any;
  currentMileage: any;
  availableServices: any[] = [];
  isReadOnly: boolean = false;

  serviceData = {
    vehicle_id: null,
    service_type_id: null,
    service_date: '',
    mileage: null,
    provider: '',
    cost: null,
    notes: '',
    receipt_url: ''
  };

  constructor(private carTrackerService: CartrackerService) { }

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
          this.fetchServices();
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

  fetchServices() {
    if (!this.selectedVehicle) return;
    this.carTrackerService.getServicesByVehicle(this.selectedVehicle.vehicle_id)
      .subscribe(services => {
        this.serviceRecords = services;
        this.currentMileage = this.selectedVehicle.mileage;
      });
  }

  deleteService(service_id: number) {
    this.carTrackerService.deleteService(service_id).subscribe(() => {
      this.fetchServices();
    });
  }

  editService(service: any) {
    this.isReadOnly = false;
    this.selectedService = { ...service };
    this.serviceData = {
      vehicle_id: this.selectedVehicle.vehicle_id,
      service_type_id: service.service_type_id,
      service_date: this.formatDate(service.service_date),
      mileage: service.mileage,
      provider: service.provider,
      cost: service.cost,
      notes: service.notes,
      receipt_url: service.receipt_url
    };
  
    const modalElement = document.getElementById('serviceModal');
    this.modalInstance = new bootstrap.Modal(modalElement!);
    this.modalInstance.show();
  }

  openServiceModal(service: any = null) {
    this.isReadOnly = false;
    this.selectedService = service;

    if (service) {
      this.serviceData = { ...service };
    } else {
      this.serviceData = {
        vehicle_id: this.selectedVehicle.vehicle_id,
        service_type_id: null,
        service_date: this.formatDate(service.service_date),
        mileage: null,
        provider: '',
        cost: null,
        notes: '',
        receipt_url: ''
      };
    }

    const modalElement = document.getElementById('serviceModal');
    this.modalInstance = new bootstrap.Modal(modalElement!);
    this.modalInstance.show();
  }

  saveService() {
    if (this.selectedService) {
      this.carTrackerService.updateService(this.selectedService.service_id, this.serviceData)
        .subscribe(() => {
          this.fetchServices();
          this.modalInstance.hide();
        });
    } else {
      this.carTrackerService.addService(this.serviceData)
        .subscribe(() => {
          this.fetchServices();
          this.modalInstance.hide();
        });
    }
  }

  viewService(service: any) {
    this.isReadOnly = true;
    this.selectedService = { ...service };
  
    this.serviceData = {
      vehicle_id: this.selectedVehicle.vehicle_id,
      service_type_id: service.service_type_id,
      service_date: this.formatDate(service.service_date),
      mileage: service.mileage,
      provider: service.provider,
      cost: service.cost,
      notes: service.notes,
      receipt_url: service.receipt_url
    };
  
    const modalElement = document.getElementById('serviceModal');
    this.modalInstance = new bootstrap.Modal(modalElement!);
    this.modalInstance.show();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
  
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  
  }




}
