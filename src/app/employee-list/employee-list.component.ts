
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmployeeService, Employee } from '../employee.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  error: any;
  deletingId: string | null = null;

  searchQuery: string = '';
  department: string = '';
  designation: string = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService
      .getAllEmployees(this.designation, this.department, this.searchQuery)
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.loading = false;
          this.deletingId = null;
        },
        error: (err) => {
          this.error = err;
          this.loading = false;
          this.deletingId = null;
          console.error('Error fetching employees:', err);
        },
      });
  }

  confirmDelete(employeeId: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.deleteEmployee(employeeId);
    }
  }

  deleteEmployee(id: string): void {
    this.deletingId = id;
    this.employeeService.deleteEmployee(id).subscribe({
      next: (response) => {
        console.log('Employee deleted:', response);
        window.location.reload(); 
      },
      error: (err) => {
        this.error = err;
        this.deletingId = null;
        console.error('Error deleting employee:', err);
      },
    });
  }

  refreshList(): void {
    this.loadEmployees();
  }

  searchEmployees(): void {
    this.loadEmployees();
  }

  runTestQuery(): void {
    this.loading = true;
    this.employeeService.testEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error running test query:', err);
      },
    });
  }

    addEmployee(employeeData: any): void {
        this.employeeService.addEmployee(employeeData).subscribe({
            next: (response) => {
                console.log('Employee added:', response);
                window.location.reload(); 
            },
            error: (err) => {
                this.error = err;
                console.error('Error adding employee:', err);
            },
        });
    }
}