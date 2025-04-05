import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../employee.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeDataService } from '../employee-data.service'; 

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-employee.component.html',
  styleUrl: './create-employee.component.css',
  encapsulation:ViewEncapsulation.None
})
export class CreateEmployeeComponent implements OnInit {
  createForm: FormGroup;
  loading = false;
  error: any;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private employeeDataService: EmployeeDataService 
  ) {
    this.createForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      designation: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(1000)]],
      date_of_joining: ['', Validators.required],
      department: ['', Validators.required],
      employee_photo: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.createForm.valid) {
      this.loading = true;
      const newEmployeeData = this.createForm.value;
      this.employeeService.addEmployee(newEmployeeData).subscribe({
        next: (employee) => {
          this.loading = false;
          console.log('Employee created:', employee);
          this.employeeDataService.notifyEmployeeCreated(employee); 
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err;
          console.error('Error creating employee:', err);
        }
      });
    } else {
      Object.values(this.createForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}