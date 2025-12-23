import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnChanges {

  @Input() targetEmployee: string = ''; 

  currentDate: Date = new Date();
  displayMonth: string = ''; 
  
  calendarDays: any[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private attendanceService: AttendanceService) { }

  ngOnInit() {
    this.generateCalendar();
    this.attendanceService.dataChanged$.subscribe(() => {
        this.generateCalendar();
    });
  }

  ngOnChanges() {
    this.generateCalendar();
  }

  changeMonth(offset: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.displayMonth = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];

    // 1. Empty cells
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ date: null });
    }

    // 2. Days with Data
    const userToCheck = this.targetEmployee || 'Dakota Rice';

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1 < 10 ? '0' + (month+1) : month+1}-${day < 10 ? '0' + day : day}`;
      
      const statusText = this.attendanceService.getStatus(dateKey, userToCheck);
      const details = this.attendanceService.getLeaveDetails(dateKey, userToCheck);

      let statusClass = '';
      if (statusText.includes('Present')) statusClass = 'status-present';
      else if (statusText.includes('Holiday')) statusClass = 'status-holiday';
      else if (statusText.includes('Leave')) statusClass = 'status-leave';
      else if (statusText === 'Weekend') statusClass = 'status-weekend';

      this.calendarDays.push({
        date: day,
        fullDate: dateKey,
        status: statusText,
        cssClass: statusClass,
        details: details
      });
    }

    // 3. Fill Remaining
    const totalCells = this.calendarDays.length;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
        for (let i = 0; i < remaining; i++) {
            this.calendarDays.push({ date: null });
        }
    }
  }

  // ============================================================
  // UPDATED: ALLOW WHOLE CURRENT MONTH + NEXT MONTH
  // ============================================================
  applyLeaveFromCalendar(dateKey: string, type: string) {
      if(!dateKey) return;

      const userToCheck = this.targetEmployee || 'Dakota Rice';
      const selectedDate = new Date(dateKey);
      
      // 1. Get Base Reference Dates
      const today = new Date();
      
      // Start of Current Month (e.g., Dec 1, 2025)
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // End of Next Month (e.g., Jan 31, 2026)
      const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      // --- VALIDATION RULES ---
      
      // Rule A: Allow anything from the 1st of this month onwards
      // (Blocks Nov 30 and earlier, but allows Dec 2 even if today is Dec 22)
      if(selectedDate < startOfCurrentMonth) {
          alert("Cannot apply leave for past months.");
          return;
      }

      // Rule B: Cannot apply beyond next month
      if(selectedDate > endOfNextMonth) {
          alert("You can only apply for leaves in the current or upcoming month.");
          return;
      }

      if(confirm(`Apply ${type} for ${dateKey}?`)) {
          let reason = 'Applied from Calendar';
          
          if(type === 'Optional Holiday') {
             const used = this.attendanceService.getOptionalHolidayCount(userToCheck);
             if(used.startsWith('3')) {
                 alert("You have already used 3/3 Optional Holidays.");
                 return;
             }
             reason = 'Personal Festival';
          }

          this.attendanceService.applyLeave(dateKey, type, reason, userToCheck);
          alert('Leave Request Applied Successfully!');
      }
  }

  stopProp(event: Event) {
      event.stopPropagation();
  }
}