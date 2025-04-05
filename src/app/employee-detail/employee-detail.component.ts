import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { EmployeeService, Employee } from '../employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  error: any;
  employeeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private router: Router 
  ) {}

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
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error fetching employee details:', err);
      },
    });
  }

  deleteEmployee(id: string): void {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        console.log('Employee deleted successfully.');
        this.router.navigate(['/employees']); 
      },
      error: (err) => {
        console.error('Error deleting employee:', err);
        this.error = err;
      },
    });
  }
}