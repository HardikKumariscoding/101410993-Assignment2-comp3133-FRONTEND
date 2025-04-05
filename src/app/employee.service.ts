import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InMemoryCache } from '@apollo/client/core';

const GET_ALL_EMPLOYEES = gql`
  query GetAllEmployees($designation: String, $department: String, $searchQuery: String) {
    getAllEmployees(designation: $designation, department: $department, searchQuery: $searchQuery) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const GET_EMPLOYEE_BY_ID = gql`
  query SearchEmployeeByEid($eid: ID!) {
    searchEmployeeByEid(eid: $eid) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation AddEmployee(
    $first_name: String!
    $last_name: String!
    $email: String!
    $gender: String!
    $designation: String!
    $salary: Float!
    $date_of_joining: String!
    $department: String!
    $employee_photo: String
  ) {
    addEmployee(
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!
    $first_name: String
    $last_name: String
    $email: String
    $gender: String
    $designation: String
    $salary: Float
    $date_of_joining: String
    $department: String
    $employee_photo: String
  ) {
    updateEmployee(
      id: $id
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

const TEST_EMPLOYEES = gql`
  query TestEmployees {
    testEmployees {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  getAllEmployees(designation?: string, department?: string, searchQuery?: string): Observable<Employee[]> {
    return this.apollo
      .query<{ getAllEmployees: Employee[] }, { designation?: string; department?: string; searchQuery?: string }>({
        query: GET_ALL_EMPLOYEES,
        variables: { designation, department, searchQuery },
      })
      .pipe(map((response) => response.data.getAllEmployees));
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.apollo
      .query<{ searchEmployeeByEid: Employee }, { eid: string }>({
        query: GET_EMPLOYEE_BY_ID,
        variables: { eid: id },
      })
      .pipe(map((response) => response.data.searchEmployeeByEid));
  }

  addEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.apollo
      .mutate<{ addEmployee: Employee }, Omit<Employee, 'id'>>({
        mutation: ADD_EMPLOYEE,
        variables: employee,
        update: (cache, { data }) => { 
          if (data && data.addEmployee) {
            const { getAllEmployees } = cache.readQuery<{ getAllEmployees: Employee[] }>({ query: GET_ALL_EMPLOYEES }) || { getAllEmployees: [] };
            cache.writeQuery({
              query: GET_ALL_EMPLOYEES,
              data: { getAllEmployees: [...getAllEmployees, data.addEmployee] },
            });
          }
        },
      })
      .pipe(map((response) => response.data!.addEmployee));
  }

  updateEmployee(id: string, updates: Partial<Omit<Employee, 'id'>>): Observable<Employee> {
    return this.apollo
      .mutate<{ updateEmployee: Employee }, { id: string } & Partial<Omit<Employee, 'id'>>>({
        mutation: UPDATE_EMPLOYEE,
        variables: { id, ...updates },
        update: (cache, { data }) => { 
          if (data && data.updateEmployee) {
            const { getAllEmployees } = cache.readQuery<{ getAllEmployees: Employee[] }>({ query: GET_ALL_EMPLOYEES }) || { getAllEmployees: [] };
            cache.writeQuery({
              query: GET_ALL_EMPLOYEES,
              data: {
                getAllEmployees: getAllEmployees.map((emp) => (emp.id === data.updateEmployee.id ? data.updateEmployee : emp)),
              },
            });
          }
        },
      })
      .pipe(map((response) => response.data!.updateEmployee));
  }

  deleteEmployee(id: string): Observable<string> {
    return this.apollo
      .mutate<{ deleteEmployee: string }, { id: string }>({
        mutation: DELETE_EMPLOYEE,
        variables: { id },
        update: (cache, { data }) => { 
          if (data && data.deleteEmployee) {
            const { getAllEmployees } = cache.readQuery<{ getAllEmployees: Employee[] }>({ query: GET_ALL_EMPLOYEES }) || { getAllEmployees: [] };
            cache.writeQuery({
              query: GET_ALL_EMPLOYEES,
              data: { getAllEmployees: getAllEmployees.filter((emp) => emp.id !== id) },
            });
          }
        },
      })
      .pipe(map((response) => response.data!.deleteEmployee));
  }

  testEmployees(): Observable<Employee[]> {
    return this.apollo
      .query<{ testEmployees: Employee[] }>({
        query: TEST_EMPLOYEES,
      })
      .pipe(map((response) => response.data.testEmployees));
  }
}