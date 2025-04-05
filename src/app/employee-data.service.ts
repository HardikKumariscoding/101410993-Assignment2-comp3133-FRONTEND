import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Employee } from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDataService {
  private employeeCreatedSource = new Subject<Employee>();
  employeeCreated$: Observable<Employee> = this.employeeCreatedSource.asObservable(); 

  notifyEmployeeCreated(employee: Employee): void {
    this.employeeCreatedSource.next(employee);
  }
}