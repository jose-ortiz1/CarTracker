import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartrackerService } from '../cartracker.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.css'
})
export class AddVehicleComponent implements OnInit {
  vehicle = {
    user_id: '',
    vin_number: '',
    make: '',
    model: '',
    year: 0,
    trim: '',
    engine: '',
    transmission: '',
    fuel_type: '',
    mileage: 0,
    purchase_date: '',
    photo_url:'',
    nickname: '',

  };

  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  currentUser: any;

  constructor(private carTrackerService: CartrackerService, private router: Router, private http: HttpClient) { 
  }

  ngOnInit() {
    this.currentUser = this.carTrackerService.getCurrentUser();
    console.log('Current User:', this.currentUser);
  }

  removeSelectedImage() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Selected file:', this.selectedFile);

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
        console.log('Image preview URL:', this.imagePreviewUrl);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitVehicle() {
    const formData = new FormData();

    formData.append('user_id', this.currentUser.user_id);
    formData.append('vin_number', this.vehicle.vin_number);
    formData.append('make', this.vehicle.make);
    formData.append('model', this.vehicle.model);
    formData.append('year', this.vehicle.year.toString());
    formData.append('trim', this.vehicle.trim);
    formData.append('engine', this.vehicle.engine);
    formData.append('transmission', this.vehicle.transmission);
    formData.append('fuel_type', this.vehicle.fuel_type);
    formData.append('mileage', this.vehicle.mileage.toString());
    formData.append('purchase_date', this.vehicle.purchase_date);
    formData.append('nickname', this.vehicle.nickname);

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.http.post('http://localhost:3000/api/vehicles', formData).subscribe(
      (response: any) => {
        alert('Vehicle added successfully!');
        this.router.navigate(['/my-garage']);
      },
      (error) => {
        alert('Failed to add vehicle: ' + (error.error.message || error.message));
      }
    );
  }

  close() {
    this.router.navigate(['/my-garage']);
  }



}
