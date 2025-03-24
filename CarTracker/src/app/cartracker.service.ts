import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartrackerService {

  private apiUrl = 'http://localhost:3000/api/';

  private userSubject = new BehaviorSubject<any>(this.getCurrentUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }


  getUsers(): Observable<any>{
    return this.http.get<any[]>(`${this.apiUrl}users`);
  }

  //get vehicle by User
  getVehiclesByUser(id: number): Observable<any>{
    console.log("Fetching vehicles for user id:", id);
    return this.http.get<any>(`${this.apiUrl}vehicles/${id}`);
  }

  //add vehicle
  addVehicle(user_id: number, vin_number: string, make: string, model: string, year: number, trim: string, engine: string, transmission: string, fuel_type: string, mileage: number, purchase_date: string, photo_url: string,nickname: string) {
    return this.http.post<any>(`${this.apiUrl}vehicles`, { user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchase_date, photo_url, nickname});
  }

  //update vehicle
  updateVehicle(vehicle: any) {
    return this.http.put<any>(`${this.apiUrl}vehicles/${vehicle.vehicle_id}`, vehicle);
  }

 

  
  //getServiceLogsByVehicle
  getServicesByVehicle(vehicleId: number): Observable<any>{
    console.log("Fetching service logs for vehicle id:", vehicleId);
    return this.http.get<any>(`${this.apiUrl}service_history/${vehicleId}`);
  }

  //Delete service by vehicle
  deleteService(service_id: number) {
    return this.http.delete(`${this.apiUrl}service_history/${service_id}`);
  }

  //update service
  updateService(service_id: number,service: any) {
    return this.http.put<any>(`${this.apiUrl}service_history/${service_id}`, service);
  }

  //add service
  addService(service: any) {
    return this.http.post<any>(`${this.apiUrl}service_history`, service);
  }

  //sign in
  signin(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}signin`, { email, password });
  }

  //sign up
  signup(name: string, email: string, password: string, phone: string) {
    return this.http.post<any>(`${this.apiUrl}signup`, { name, email, password, phone });
  }
  
  //save User
  saveUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
  }
  //get current User
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  //logout
  logout() {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.router.navigate(['/signin']);
  }

  isAuthenticated() {
    return !!localStorage.getItem('currentUser');
  }

  //delete vehicle
  deleteVehicle(vehicle_id: number) {
    return this.http.delete(`${this.apiUrl}vehicles/${vehicle_id}`);
  }

  // Fetch reminders for a specific vehicle
getRemindersByVehicle(vehicle_id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}reminders/${vehicle_id}`);
}

// Add a new reminder
addReminder(reminder: any): Observable<any> {
  return this.http.post(`${this.apiUrl}reminders`, reminder);
}

// Update a reminder
updateReminder(reminder_id: number, updateData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}reminders/${reminder_id}`, updateData);
}

// Delete a reminder
deleteReminder(reminder_id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}reminders/${reminder_id}`);
}

//get all available service types
getServiceTypes(){
  return this.http.get<any[]>(`${this.apiUrl}service_types`);
}


}
