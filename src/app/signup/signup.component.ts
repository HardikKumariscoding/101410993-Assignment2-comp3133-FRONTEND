import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';

const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

interface SignupResponse {
  signup: {
    token: string;
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  encapsulation:ViewEncapsulation.None
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  loading = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private apollo: Apollo
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true; 
      const { username, email, password } = this.signupForm.value;
      this.apollo.mutate<SignupResponse>({
        mutation: SIGNUP_MUTATION,
        variables: { username, email, password },
      }).subscribe({
        next: (response) => {
          this.loading = false; 
          const token = response.data?.signup?.token;
          if (token) {
            this.authService.login(token); 
            this.router.navigate(['/employees']);
          } else {
            this.errorMessage = 'Signup successful, but no token received. Please log in.';
            this.router.navigate(['/login']); 
          }
        },
        error: (error) => {
          this.loading = false; 
          this.errorMessage = `Signup failed: ${error.message}`;
          console.error('Signup error:', error);
        },
      });
    } else {
      this.errorMessage = 'Please fill out all required fields and ensure passwords match.';
    }
  }
}