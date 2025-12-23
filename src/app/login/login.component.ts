import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = ''; 

  constructor(private router: Router) { }

  ngOnInit() {
    // Clear storage on load
    localStorage.clear();
  }

  login() {
    if (!this.email) {
      alert("Please enter an email address");
      return;
    }

    // 1. Save User Email
    localStorage.setItem('userEmail', this.email);

    // 2. Determine Role (Mock Logic)
    let role = 'employee'; // Default

    if (this.email.toLowerCase().includes('admin')) {
      role = 'admin';
    } 
    else if (
        this.email.toLowerCase().includes('manager') || 
        this.email === 'mike@test.com' || 
        this.email === 'andrew@test.com'
    ) {
      role = 'manager';
    }

    // 3. Save Role
    localStorage.setItem('userRole', role);
    console.log(`Logging in as ${this.email} (Role: ${role})`);

    // 4. Redirect Based on Role (FIXED PATHS)
    if (role === 'admin') {
        // Requirement: Admin sees User Tab first
        this.router.navigate(['/admin-users']);
    } 
    else if (role === 'manager') {
        // Managers usually want to see their team status
        this.router.navigate(['/my-team']);
    } 
    else {
        // Employees go to Dashboard
        this.router.navigate(['/dashboard']);
    }
  }
}