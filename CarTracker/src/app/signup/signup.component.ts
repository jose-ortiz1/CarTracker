import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CartrackerService } from '../cartracker.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private cartrackerService: CartrackerService
  ){}

  signup() {

    if (this.password!==this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.cartrackerService.signup(this.name, this.email, this.password, this.phone)
     .subscribe(
      user => {
        this.cartrackerService.saveUser(user);
        this.router.navigate(['/garage-overview']);

      },
      error => {
        alert('Signup failed: ' + (error.error.message || 'Check your data'));
      });
  }
  ngOnInit() {
    if (this.cartrackerService.isAuthenticated()) {
      this.router.navigate(['/garage-overview']);
    }
  }


}
