import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartrackerService } from './cartracker.service';

@Injectable({
  providedIn: 'root'  
})
export class AuthGuard implements CanActivate {

  constructor(
    private cartrackerService: CartrackerService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.cartrackerService.isAuthenticated()) {
      return true; // Allow navigation
    } else {
      this.router.navigate(['/signin']); // Redirect to login
      return false; // Deny navigation
    }
  }
}