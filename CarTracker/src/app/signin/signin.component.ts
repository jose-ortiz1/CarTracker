import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CartrackerService } from '../cartracker.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email: string = '';
  password: string = '';

  constructor (
    private router: Router,
    private cartrackerService: CartrackerService
  ) {}

  ngOnInit() {
    if (this.cartrackerService.isAuthenticated()) {
      this.router.navigate(['/garage-overview']);
    }
  }

  signIn() {
    this.cartrackerService.signin(this.email, this.password).subscribe(user => {
      this.cartrackerService.saveUser(user);
      this.router.navigate(['/garage-overview']);
    }, error => {
      alert('Invalid login');
    });
  }





}
