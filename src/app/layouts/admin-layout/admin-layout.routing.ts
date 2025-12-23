import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { MyTeamComponent } from '../../my-team/my-team.component';

// Admin Components
import { AdminViewComponent } from './AdminViewComponent/admin-view.component';
import { AdminUsersComponent } from './AdminUsersComponent/admin-users.component';
import { AdminCalendarComponent } from './AdminCalenderComponent/admin-calendar.component';

export const AdminLayoutRoutes: Routes = [
    
    // 1. DEFAULT REDIRECT (Fixes the landing page issue)
    // When user logs in or goes to empty path, they go to 'admin-users'
    { path: '',      redirectTo: 'admin-users', pathMatch: 'full' },

    // 2. ADMIN ROUTES (Must match Sidebar paths exactly)
    { path: 'admin-users',    component: AdminUsersComponent },
    { path: 'admin-view',     component: AdminViewComponent },
    { path: 'admin-calendar', component: AdminCalendarComponent },
    
    // 3. EXISTING ROUTES
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'table-list',     component: TableListComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'upgrade',        component: UpgradeComponent },
    { path: 'my-team',        component: MyTeamComponent },
];