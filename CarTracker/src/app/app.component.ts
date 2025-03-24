import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet,RouterLink, NavigationEnd, Router } from '@angular/router';
import { GarageOverviewComponent } from './garage-overview/garage-overview.component';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MyGarageComponent } from './my-garage/my-garage.component';
import { CartrackerService } from './cartracker.service';
import { FormsModule } from '@angular/forms';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,CommonModule, MyGarageComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  pageTitle = 'CarTracker';

  users: any[] = [];
  vehicles: any[] = [];
  selectedUser: any | null = null;
  currentUser: any = null;
  showSidebar: boolean = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private carTrackerService: CartrackerService
  ) { }

  ngOnInit() {
    this.carTrackerService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.carTrackerService.getUsers().subscribe(users => {
      this.users = users;
      if (users.length > 0) {
        this.selectedUser = users[0]; // Set first user as default
        this.fetchVehicles(this.selectedUser.id);
      }
      console.log(this.users); // Debugging in console
    });

    // Update page title based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute.firstChild),
      filter(route => route !== null),
      map(route => route?.snapshot.data['title'] || 'Garage Overview')
    ).subscribe(title => {
      this.pageTitle = title;
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.activatedRoute.snapshot.firstChild?.routeConfig?.path;
        this.showSidebar = !['signin', 'signup'].includes(currentRoute || '');
      });
  }

  loadCurrentUser() {
    this.currentUser = this.carTrackerService.getCurrentUser();
  }

  onSelectUser(userId:number){
    this.selectedUser = userId;
    this.carTrackerService.getVehiclesByUser(userId).subscribe(vehicles => {
      this.vehicles = vehicles;
      console.log(this.vehicles); // Debugging in console
    });

    
  }

  onUserChange(){
    console.log("Selected user:", this.selectedUser);

  if (this.selectedUser) {
    this.fetchVehicles(this.selectedUser.id); // Fetch vehicles based on selected user
  }
  }

  fetchVehicles(userId: number) {
    this.carTrackerService.getVehiclesByUser(userId).subscribe(vehicles => {
      this.vehicles = vehicles;
      console.log("Fetched vehicles for user:", this.vehicles);
    });
  }

  //logout
  logout() {
    this.carTrackerService.logout();
    this.currentUser = null;
    this.router.navigate(['/signin']);
  }

}
