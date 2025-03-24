import { Routes } from '@angular/router';
import { GarageOverviewComponent } from './garage-overview/garage-overview.component';
import { MyGarageComponent } from './my-garage/my-garage.component';
import { Title } from '@angular/platform-browser';
import { RemindersComponent } from './reminders/reminders.component';
import { ServicesComponent } from './services/services.component';
import { OdometerComponent } from './odometer/odometer.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';

export const routes: Routes = [

    {path:'garage-overview', component: GarageOverviewComponent, data: { title : 'GARAGE OVERVIEW'}, canActivate: [AuthGuard]},
    {path:'add-vehicle', component: AddVehicleComponent, data: { title: 'ADD VEHICLE'}, canActivate: [AuthGuard]},
    {path:'my-garage', component: MyGarageComponent, data: { title: 'MY GARAGE'}, canActivate: [AuthGuard]},
    {path:'reminders', component: RemindersComponent, data: { title: 'REMINDERS'}, canActivate: [AuthGuard]},
    {path:'services', component: ServicesComponent, data: { title: 'SERVICES'}, canActivate: [AuthGuard]},
    {path:'odometer', component: OdometerComponent, data: { title: 'ODOMETER'}, canActivate: [AuthGuard]},
    {path:'signin', component: SigninComponent, data: { title: 'SIGN IN'}},
    {path:'signup', component: SignupComponent, data: { title: 'SIGN UP'}},
    {path: '**', redirectTo: 'garage-overview'},



];
