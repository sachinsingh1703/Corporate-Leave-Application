import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {

  // 1. DATA CONTAINERS
  allUsers: any[] = [];
  filteredUsers: any[] = []; 
  projects: any[] = [];
  managers: any[] = [];

  // 2. FILTER STATE
  filterType: string = 'All'; 
  filterValue: any = null;
  filterOptions: any[] = []; 

  constructor(private service: AttendanceService) { }

  ngOnInit() {
    this.loadData();
    this.service.dataChanged$.subscribe(() => {
        this.loadData();
    });
  }

  loadData() {
    this.allUsers = this.service.getEmployees();
    this.projects = this.service.getProjects();
    this.managers = this.service.getManagers();
    this.applyFilter(); 
  }

  // 3. EVENT HANDLERS
  onFilterTypeChange() {
      this.filterValue = null; 
      if (this.filterType === 'Project') {
          this.filterOptions = this.projects;
      } else if (this.filterType === 'Manager') {
          this.filterOptions = this.managers;
      } else {
          this.filterOptions = [];
          this.applyFilter(); 
      }
  }

  applyFilter() {
      if (this.filterType === 'All') {
          this.filteredUsers = [...this.allUsers];
      } 
      else if (this.filterType === 'Project' && this.filterValue) {
          this.filteredUsers = this.allUsers.filter(u => u.projectId == this.filterValue);
      } 
      else if (this.filterType === 'Manager' && this.filterValue) {
          this.filteredUsers = this.allUsers.filter(u => u.managerId == this.filterValue);
      }
      else {
          this.filteredUsers = [...this.allUsers];
      }
  }

  // 4. REPORT GENERATION (UPDATED CSV FORMAT)
  downloadReport() {
    const allLeaves = this.service.getAllRequests();
    
    // 1. Filter leaves for currently visible employees only
    const visibleEmpNames = new Set(this.filteredUsers.map(u => u.name));
    const relevantLeaves = allLeaves.filter(l => visibleEmpNames.has(l.employeeName));

    // 2. Define Time Range (Current Month)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let csvDataRows = [];
    let maxCols = 0;

    // 3. Iterate through every day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        // Format date as YYYY-MM-DD to match leave data
        const dateKey = `${year}-${month + 1 < 10 ? '0'+(month+1) : month+1}-${day < 10 ? '0'+day : day}`;
        
        // Find leaves for this specific date
        const leavesOnThisDay = relevantLeaves.filter(l => l.date === dateKey);

        // Update max columns needed
        if (leavesOnThisDay.length > maxCols) {
            maxCols = leavesOnThisDay.length;
        }

        // Create the Row: [Date, Emp1, Emp2, ...]
        let row = [`"${dateKey}"`];

        leavesOnThisDay.forEach(leave => {
            const emp = this.filteredUsers.find(u => u.name === leave.employeeName);
            const empCode = emp ? emp.empCode : 'N/A';
            const project = emp ? this.getProjectName(emp.projectId) : 'N/A';
            
            // Format: "Name (ID) - Project - Type"
            const cellData = `${leave.employeeName} (${empCode}) - ${project} - ${leave.type}`;
            row.push(`"${cellData}"`);
        });

        csvDataRows.push(row);
    }

    // 4. Create Header Row dynamically based on maxCols
    let headerRow = ['Date'];
    for (let i = 1; i <= maxCols; i++) {
        headerRow.push(`Employee ${i}`);
    }

    // 5. Combine and Download
    const csvContent = [headerRow.join(','), ...csvDataRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monthly_Attendance_${this.filterType}_${year}-${month+1}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 5. HELPERS
  getProjectName(id: any) {
    const p = this.projects.find(proj => proj.id == id);
    return p ? p.name : '-';
  }

  getManagerName(id: number) {
    const m = this.managers.find(mgr => mgr.id == id);
    return m ? m.name : '-';
  }
}