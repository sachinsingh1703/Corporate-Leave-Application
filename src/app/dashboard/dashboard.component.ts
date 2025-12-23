import { Component, OnInit } from '@angular/core';
import { AttendanceService, Employee, Project } from '../services/attendance.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // REMOVED: stats object

  userProfile = {
      name: '',
      projectId: '',
      projectName: '',
      managerName: ''
  };

  myLeaves: any[] = [];
  currentUser: string = 'Dakota Rice'; 

  constructor(private service: AttendanceService) { }

  ngOnInit() {
    this.loadDashboardData();
    this.service.dataChanged$.subscribe(() => {
        this.loadDashboardData();
    });
  }

  loadDashboardData() {
    // 1. Load Leaves
    this.myLeaves = this.service.getFutureLeaves(this.currentUser);

    // 2. Load Profile Info
    const employees: Employee[] = this.service.getEmployees();
    const projects: Project[] = this.service.getProjects();
    const managers: any[] = this.service.getManagers(); 
    
    const emp = employees.find(e => e.name === this.currentUser);
    
    if(emp) {
        const proj = projects.find(p => p.id == emp.projectId);
        const mgr = managers.find(m => m.id == emp.managerId);

        this.userProfile = {
            name: emp.name,
            projectId: emp.projectId ? String(emp.projectId) : 'N/A', 
            projectName: proj ? proj.name : 'Unassigned',
            managerName: mgr ? mgr.name : 'Unassigned'
        };
    }
    
    // REMOVED: Call to calculateLeaveStats()
  }

  withdrawLeave(leave: any) {
    if (this.canWithdraw(leave.date)) {
        if(confirm(`Are you sure you want to withdraw your leave on ${leave.date}?`)) {
            this.service.withdrawLeave(leave.date);
        }
    } else {
        alert('Withdrawal is only allowed 15 days in advance.');
    }
  }

  canWithdraw(dateStr: string): boolean {
    const today = new Date();
    const leaveDate = new Date(dateStr);
    const diffTime = leaveDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  }
}