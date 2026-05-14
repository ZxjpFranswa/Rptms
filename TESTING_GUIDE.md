# RPRAMS Testing Guide

## Quick Start - All 3 Roles Tested

This guide walks you through testing the complete RPRAMS system with all three user roles.

---

## 🔓 Login Credentials

### Assessment Clerk
```
Username: clerk
Password: password
```

### Municipal Assessor
```
Username: assessor
Password: password
```

### Administrator
```
Username: admin
Password: password
```

---

## ✅ Testing Checklist

### Phase 1: Assessment Clerk Role

**1. Login as Clerk**
- Username: `clerk`
- Password: `password`
- ✅ Should redirect to `/clerk/dashboard`

**2. Verify Dashboard**
- [ ] See 4 statistics cards:
  - Received Transactions: 24
  - Pending Encodings: 8
  - Returned Applications: 5
  - Released FAAS: 12
- [ ] View "Recent Transactions" table with data
- [ ] See 3 quick access cards below

**3. Test Sidebar Navigation**
- [ ] Dashboard (highlighted green when active)
- [ ] Property Registration
- [ ] Encoding Queue
- [ ] Verification Queue
- [ ] Released FAAS
- [ ] Notifications
- [ ] Logout button at bottom

**4. Navigate Between Pages**
- [ ] Click "Property Registration" → Shows development placeholder
- [ ] Click "Encoding Queue" → Shows development placeholder
- [ ] Click "Verification Queue" → Shows development placeholder
- [ ] Click "Released FAAS" → Shows development placeholder
- [ ] All pages show "Back to Dashboard" link
- [ ] All pages maintain sidebar navigation

**5. Test Quick Access Cards**
- [ ] Click "Encoding Queue" card → Navigates to `/clerk/encoding-queue`
- [ ] Click "Verification Queue" card → Navigates to `/clerk/verification-queue`
- [ ] Click "Released FAAS" card → Navigates to `/clerk/released-faas`

**6. Test Logout**
- [ ] Click "Logout" button
- [ ] Should redirect to login page
- [ ] Session cleared (no user info in sidebar)

---

### Phase 2: Municipal Assessor Role

**1. Login as Assessor**
- Username: `assessor`
- Password: `password`
- ✅ Should redirect to `/assessor/dashboard`

**2. Verify Dashboard**
- [ ] See 4 statistics cards:
  - Pending Reviews: 6
  - Approved Properties: 18
  - FAAS Generated: 15
  - Rejected Applications: 3
- [ ] View "Review Queue" table with properties
- [ ] See 3 quick access cards below

**3. Test Sidebar Navigation**
- [ ] Menu shows DIFFERENT items than Clerk:
  - Dashboard
  - Review Queue
  - Approved Properties
  - Rejected Properties
  - Assessments
  - FAAS Generation
  - Audit Logs (not same as Admin)
- [ ] User name shows: "Maria Assessor"
- [ ] Role shows: "Municipal Assessor"

**4. Navigate Assessment Pages**
- [ ] Click "Review Queue" → Development placeholder
- [ ] Click "Approved Properties" → Development placeholder
- [ ] Click "Rejected Properties" → Development placeholder
- [ ] Click "Assessments" → Development placeholder
- [ ] Click "FAAS Generation" → Development placeholder (important for FAAS release sync)

**5. Test Quick Access Cards**
- [ ] "Approved Properties" card shows "18 approved"
- [ ] "FAAS Generation" card shows "15 ready"
- [ ] "Assessments" card shows valuation info

---

### Phase 3: Administrator Role

**1. Login as Admin**
- Username: `admin`
- Password: `password`
- ✅ Should redirect to `/admin/dashboard`

**2. Verify Dashboard**
- [ ] See 4 statistics cards:
  - Total Users: 23
  - Active Sessions: 7
  - Audit Activities: 142
  - System Health: 99.8%
- [ ] See 3 quick access cards

**3. Test Sidebar Navigation**
- [ ] Menu shows ADMIN specific items:
  - Dashboard
  - User Management
  - Audit Logs (Admin version)
  - System Settings
  - Role Permissions
- [ ] User name shows: "Admin User"
- [ ] Role shows: "Administrator"
- [ ] Completely different menu from Clerk and Assessor

**4. Navigate Admin Pages**
- [ ] Click "User Management" → Development placeholder
- [ ] Click "Audit Logs" → Development placeholder
- [ ] Click "System Settings" → Development placeholder
- [ ] Click "Role Permissions" → Development placeholder

**5. Test Quick Access Cards**
- [ ] "User Management" card shows "Manage 23 users"
- [ ] "Audit Logs" card shows "142 activities"
- [ ] "System Settings" card shows "Configure system"

---

## 🔐 Security Verification

### Role-Based Access Control
- [ ] After logging in as **Clerk**, manually try to access `/assessor/dashboard` → Should redirect to login
- [ ] After logging in as **Assessor**, manually try to access `/admin/dashboard` → Should redirect to login
- [ ] After logging in as **Admin**, manually try to access `/clerk/dashboard` → Should redirect to login

### Authentication Persistence
- [ ] Log in as clerk
- [ ] Refresh page (F5)
- [ ] ✅ Should remain logged in and stay on dashboard
- [ ] Close browser DevTools → Application → Cookies/Storage
- [ ] ✅ Should see `token` and `user` in localStorage

### Session Management
- [ ] Log out from any role
- [ ] Try to access protected route (e.g., `/clerk/dashboard`)
- [ ] ✅ Should redirect to login page with optional `?redirect=` query parameter

---

## 🎨 UI/UX Verification

### Design System
- [ ] Login page has emerald green theme (top card)
- [ ] Dashboards use emerald green for primary buttons
- [ ] Cards have soft shadows
- [ ] Sidebar is dark slate-900
- [ ] Active menu items highlight in emerald green
- [ ] Status badges show in correct colors:
  - Success (emerald)
  - Warning (amber)
  - Danger (red)
  - Info (blue)

### Responsive Design
- [ ] Open DevTools (F12) → Toggle device toolbar
- [ ] Test on mobile (375px width):
  - [ ] Sidebar navigation still accessible
  - [ ] Cards stack vertically
  - [ ] DataTable scrolls horizontally
  - [ ] Buttons remain clickable
- [ ] Test on tablet (768px width):
  - [ ] 2-column grid for cards
  - [ ] Sidebar visible
- [ ] Test on desktop (1920px width):
  - [ ] 4-column grid for cards
  - [ ] Full sidebar with all text

### Component Testing
- [ ] **DataTable**: Search works, pagination buttons functional
- [ ] **Badges**: Display correct status colors
- [ ] **Cards**: Soft shadows render correctly
- [ ] **Forms**: Input fields have proper focus states
- [ ] **Buttons**: Hover states work, active states show scale

---

## 📊 Dashboard Statistics Verification

### Clerk Dashboard Numbers
- Received Transactions: 24
- Pending Encodings: 8
- Returned Applications: 5
- Released FAAS: 12
- **Total shown in Recent Transactions table**: 2 items (Juan dela Cruz, Maria Santos)

### Assessor Dashboard Numbers
- Pending Reviews: 6
- Approved Properties: 18
- FAAS Generated: 15
- Rejected Applications: 3
- **Review Queue table**: Shows 2 properties (verified and reviewed status)

### Admin Dashboard Numbers
- Total Users: 23
- Active Sessions: 7
- Audit Activities: 142
- System Health: 99.8%

---

## 🧭 Navigation Map

### Complete URL Structure

```
Login:
/login

Clerk Routes:
/clerk/dashboard
/clerk/property-registration
/clerk/encoding-queue
/clerk/verification-queue
/clerk/released-faas
/clerk/notifications

Assessor Routes:
/assessor/dashboard
/assessor/review-queue
/assessor/approved-properties
/assessor/rejected-properties
/assessor/assessments
/assessor/faas-generation
/assessor/audit-logs

Admin Routes:
/admin/dashboard
/admin/user-management
/admin/audit-logs
/admin/system-settings
/admin/role-permissions

Error:
/404 (or any undefined route)
```

---

## 🔄 Cross-Role Navigation Test

**Objective**: Verify role-based menu isolation

**Steps**:
1. Log in as **clerk** → Check sidebar only shows clerk menu items
2. Log in as **assessor** → Check sidebar shows DIFFERENT items
3. Log in as **admin** → Check sidebar shows THIRD set of items
4. Verify no role can see another role's menu items
5. Verify users cannot access other role's routes by typing URL directly

**Expected Result**: ✅ Complete role isolation with proper RBAC

---

## 🚀 Performance Checklist

- [ ] Login page loads in < 1 second
- [ ] Dashboard page loads in < 1 second after login
- [ ] Navigation between pages is smooth
- [ ] No console errors (check F12 → Console)
- [ ] No red error badges in Vue DevTools
- [ ] Page transitions are animated smoothly
- [ ] Images/icons load without errors

---

## 🐛 Known Limitations (Placeholder Pages)

The following pages are intentionally shown as development placeholders:
- Property Registration (needs multi-step form)
- Encoding Queue (needs DataTable with specific columns)
- Verification Queue (needs verification checklist UI)
- Document Upload (needs drag-drop upload)
- Review Screen (needs document preview)
- User Management (needs CRUD forms)
- Audit Logs (needs filtering/export)

All placeholders show:
- Development icon
- Brief description of what will be built
- "Back to Dashboard" link
- Professional styling

---

## ✨ What's Working in Phase 1

✅ **Authentication System**
- Login/Logout flow
- JWT token ready
- Session persistence
- Account status checks

✅ **Role-Based Access Control**
- Three complete role modules
- Route protection
- Menu isolation
- Auto-redirect on login

✅ **Three Dashboard Layouts**
- Clerk Dashboard with 4 cards + table
- Assessor Dashboard with 4 cards + table
- Admin Dashboard with 4 cards + quick links

✅ **Navigation System**
- Responsive sidebar (dark theme)
- Active route highlighting
- Role-specific menus
- Quick access cards

✅ **Reusable Components**
- DataTable (with search, pagination)
- Badge component (4 variants)
- Modal component (ready for confirmations)
- Professional card layout

✅ **Design System**
- Emerald green government theme
- Soft shadows and rounded corners
- Responsive grid layouts
- Status color coding

✅ **Developer Experience**
- TypeScript throughout
- Pinia state management
- Vue Router with guards
- Hot module reloading
- Production-ready build

---

## 📝 Next Steps to Implement

1. **Multi-Step Property Registration Form**
   - Owner information step
   - Property details step
   - Document upload (drag-drop)
   - Technical information
   - Verification checklist

2. **DataTable Implementation for Sub-Pages**
   - Encoding Queue table
   - Verification Results
   - User Management CRUD
   - Audit Logs with filtering

3. **Assessment Module**
   - Valuation form
   - FAAS generation
   - FAAS release (with auto-sync to clerk)

4. **Advanced Features**
   - Real-time notifications
   - Export functionality
   - Dark mode toggle
   - API integration

---

## 📞 Testing Support

If you encounter any issues during testing:
1. Check the browser console (F12 → Console) for errors
2. Clear localStorage if session is stuck: `localStorage.clear()`
3. Hard refresh the page: `Ctrl+Shift+R` (or Cmd+Shift+R on Mac)
4. Verify you're using the correct demo credentials above

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Phase 1 Complete - Ready for Phase 2 Development
