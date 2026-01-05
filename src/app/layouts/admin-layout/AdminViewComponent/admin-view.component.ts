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
  // Fixed to 'Project' as per your requirement
  filterType: string = 'Project'; 
  filterValue: any = null; // Stores selected Project ID

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
    
    // Initial Load: Show all users by default until a filter is applied
    this.filteredUsers = [...this.allUsers]; 
  }

  // 3. FILTER LOGIC
  applyFilter() {
      // Logic simplified: We only check for Project ID now
      if (this.filterValue) {
          // Filter by the selected Project ID
          this.filteredUsers = this.allUsers.filter(u => u.projectId == this.filterValue);
      } else {
          // If no project selected, show all users (or you can make this [] to show nothing)
          this.filteredUsers = [...this.allUsers];
      }
  }

  // 4. REPORT GENERATION
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
        // Format date as YYYY-MM-DD
        const dateKey = `${year}-${month + 1 < 10 ? '0'+(month+1) : month+1}-${day < 10 ? '0'+day : day}`;
        
        // Find leaves for this specific date
        const leavesOnThisDay = relevantLeaves.filter(l => l.date === dateKey);

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

    // 4. Create Header Row
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
    a.download = `Attendance_Report_${year}-${month+1}.csv`;
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