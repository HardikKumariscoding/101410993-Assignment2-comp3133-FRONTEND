import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router'; 

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

interface LoginResponse {
  login: {
    token: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None

})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading = false;
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apollo: Apollo,
    private router: Router 
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      this.apollo.mutate<LoginResponse>({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
      }).subscribe({
        next: (response) => {
          this.loading = false; 
          const token = response.data?.login?.token;
          if (token) {
            this.authService.login(token);
            this.router.navigate(['/employees']); 
          } else {
            this.errorMessage = 'Login failed: No token received.';
          }
        },
        error: (error) => {
          this.loading = false; 
          this.errorMessage = `Login failed: ${error.message}`;
          console.error('Login error:', error);
        },
      });
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }
}