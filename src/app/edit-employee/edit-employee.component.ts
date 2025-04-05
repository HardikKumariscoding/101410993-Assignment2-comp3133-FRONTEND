import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../employee.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.css',
  encapsulation:ViewEncapsulation.None
})
export class EditEmployeeComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  error: any;
  employeeId: string | null = null;
  employee: Employee | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
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

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.loadEmployeeDetails(this.employeeId);
    } else {
      this.error = 'No employee ID provided.';
      this.loading = false;
    }
  }

  loadEmployeeDetails(id: string): void {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.loading = false;
        this.populateForm();
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error fetching employee details for edit:', err);
      },
    });
  }

  populateForm(): void {
    if (this.employee) {
      this.editForm.patchValue({
        first_name: this.employee.first_name,
        last_name: this.employee.last_name,
        email: this.employee.email,
        gender: this.employee.gender,
        designation: this.employee.designation,
        salary: this.employee.salary,
        date_of_joining: this.employee.date_of_joining,
        department: this.employee.department,
        employee_photo: this.employee.employee_photo || '',
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid && this.employeeId) {
      this.loading = true;
      const updatedEmployeeData = this.editForm.value;
      this.employeeService.updateEmployee(this.employeeId, updatedEmployeeData).subscribe({
        next: (employee) => {
          this.loading = false;
          console.log('Employee updated:', employee);
          this.router.navigate(['/employees/detail', this.employeeId]); 
        },
        error: (err) => {
          this.loading = false;
          this.error = err;
          console.error('Error updating employee:', err);
        }
      });
    } else {
      Object.values(this.editForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees/detail', this.employeeId]);
  }
}