# Real Property Registration & Assessment Management System (RPRAMS)

## Enterprise Frontend Application Architecture

A production-ready Vue 3 + TypeScript + Tailwind CSS government enterprise system for property registration and assessment management.

---

## 🏗️ Project Structure

```
src/
├── assets/              # Static assets and global styles
│   ├── base.css        # Base styles
│   ├── logo.svg        # Logo
│   └── main.css        # Main styles with Tailwind imports and custom components
├── components/         # Reusable Vue components
│   ├── DataTable.vue   # Advanced data table with pagination and search
│   ├── Badge.vue       # Status badges
│   ├── Modal.vue       # Reusable modal dialog
│   └── icons/          # Icon components
├── layouts/            # Layout components
│   └── DashboardLayout.vue  # Main dashboard layout with sidebar and navigation
├── pages/              # Page components organized by role
│   ├── auth/
│   │   └── LoginPage.vue              # JWT-ready authentication
│   ├── clerk/          # Assessment Clerk pages
│   │   ├── DashboardPage.vue          # Dashboard with statistics
│   │   ├── PropertyRegistrationPage.vue
│   │   ├── EncodingQueuePage.vue
│   │   ├── VerificationQueuePage.vue
│   │   └── ReleasedFAASPage.vue
│   ├── assessor/       # Municipal Assessor pages
│   │   ├── DashboardPage.vue
│   │   ├── ReviewQueuePage.vue
│   │   ├── ApprovedPropertiesPage.vue
│   │   ├── RejectedPropertiesPage.vue
│   │   ├── AssessmentsPage.vue
│   │   ├── FAASGenerationPage.vue
│   │   └── AuditLogsPage.vue
│   ├── admin/          # Administrator pages
│   │   ├── DashboardPage.vue
│   │   ├── UserManagementPage.vue
│   │   └── AuditLogsPage.vue
│   └── placeholder/    # Placeholder for pages under development
├── router/             # Vue Router configuration
│   └── index.ts        # Route definitions with role-based access control
├── stores/             # Pinia state management
│   ├── auth.ts         # Authentication state (JWT, user info)
│   └── properties.ts   # Property and assessment data management
├── App.vue             # Root component
└── main.ts             # Application entry point
```

---

## 🔐 Authentication & Authorization

### Login System
- **File**: `src/pages/auth/LoginPage.vue`
- **Features**:
  - JWT token-ready authentication
  - Role-based access control (RBAC)
  - Session persistence
  - Account status handling (active/inactive/locked)
  - Remember me functionality
  - Auto-redirect based on user role

### Demo Credentials
```
Assessment Clerk:
- Username: clerk
- Password: password

Municipal Assessor:
- Username: assessor
- Password: password

Administrator:
- Username: admin
- Password: password
```

### Role-Based Routing
- Each role has dedicated dashboard and menu
- Protected routes enforce authentication
- Automatic redirect to appropriate dashboard
- Menu visibility based on user role

---

## 👥 Three Role-Based Modules

### 1. Assessment Clerk Dashboard
**Path**: `/clerk/dashboard`

**Responsibilities**:
- Receive and process property registrations
- Manage encoding queue
- Handle verification workflows
- Track released FAAS documents

**Menu Items**:
- Dashboard
- Property Registration (multi-step form)
- Encoding Queue
- Verification Queue
- Released FAAS
- Notifications

**Key Features**:
- Received Transactions table
- Real-time statistics cards
- Quick access links to main workflows

### 2. Municipal Assessor Dashboard
**Path**: `/assessor/dashboard`

**Responsibilities**:
- Review encoded properties
- Approve/reject applications
- Calculate property valuations
- Generate and release FAAS documents
- Track assessment activities

**Menu Items**:
- Dashboard
- Review Queue
- Approved Properties
- Rejected Properties
- Assessments
- FAAS Generation
- Audit Logs

**Key Features**:
- Review queue with property details
- Assessment valuation forms
- FAAS generation with validation
- Auto-sync to Clerk's Released FAAS table

### 3. Administrator Dashboard
**Path**: `/admin/dashboard`

**Responsibilities**:
- User account management
- System configuration
- Audit trail monitoring
- Role permissions management
- System health monitoring

**Menu Items**:
- Dashboard
- User Management
- Audit Logs
- System Settings
- Role Permissions

**Key Features**:
- User management with activation/lock controls
- Comprehensive audit logging
- System performance metrics

---

## 🎨 Design System & Theming

### Color Palette
- **Primary**: Emerald Green (#22c55e)
- **Secondary**: Green-700 (#15803d)
- **Accent**: Lime Green
- **Background**: Slate-50 (#f8fafc)
- **Text**: Slate-900 (#0f172a)

### Component Library
- **Reusable Components**:
  - `DataTable.vue`: Advanced table with search, pagination, and sorting
  - `Badge.vue`: Status indicators (success, warning, danger, info)
  - `Modal.vue`: Dialogs for confirmations and forms

### Custom CSS Classes
- `.btn-primary`: Primary action buttons
- `.btn-secondary`: Secondary buttons
- `.btn-ghost`: Ghost buttons (minimal style)
- `.card`: Container cards with soft shadows
- `.badge-{variant}`: Status badges
- `.input-field`: Form inputs with focus states
- `.label`: Form labels

---

## 📊 State Management (Pinia)

### Auth Store (`stores/auth.ts`)
```typescript
- token: JWT authentication token
- user: Current user object
- isAuthenticated: Boolean flag
- login(token, user): Authenticate user
- logout(): Clear session
- setUser(user): Update user info
```

### Properties Store (`stores/properties.ts`)
```typescript
- properties: Array of property objects
- addProperty(property): Add new property
- updateProperty(id, updates): Update property
- getProperty(id): Fetch single property
- getPropertiesByStatus(status): Filter by status
- releaseFAAS(propertyId, faasId): Release FAAS document
```

**Property Status Flow**:
```
pending → encoding → verified → reviewed → active
                                   ↓
                                rejected
```

---

## 🛣️ Routing Structure

All routes are protected by authentication middleware. Role validation occurs at route level.

```
/login                          (Public)
/clerk                          (Assessment Clerk only)
  /dashboard
  /property-registration
  /encoding-queue
  /verification-queue
  /released-faas
  /notifications
/assessor                       (Municipal Assessor only)
  /dashboard
  /review-queue
  /approved-properties
  /rejected-properties
  /assessments
  /faas-generation
  /audit-logs
/admin                          (Administrator only)
  /dashboard
  /user-management
  /audit-logs
  /system-settings
  /role-permissions
```

---

## 🔄 Business Workflows

### Property Registration Workflow
1. **Clerk receives** property application
2. **Step 1**: Collect owner information
3. **Step 2**: Encode property details
4. **Step 3**: Upload required documents
5. **Step 4**: Capture technical information
6. **Step 5**: System verification checks
7. **Verified properties** → Assessor Review Queue

### Assessment & FAAS Release Workflow
1. **Assessor reviews** encoded property
2. **Validation** of documents and data
3. **Approval** → Property activated
4. **Assessment** calculated (Market Value × Assessment Level)
5. **FAAS generated** from assessment
6. **FAAS released** → Auto-appears in Clerk's Released FAAS table
7. **Clerk prints/downloads** FAAS

### Account Management Workflow
1. **Admin creates** user account
2. **User logins** with initial password
3. **Session tracking** via audit logs
4. **Account status** (active/inactive/locked)
5. **Role permissions** enforced per menu

---

## 📋 DataTable Implementation

The custom `DataTable.vue` component provides:

- **Search functionality** across all columns
- **Pagination** with configurable page size
- **Column rendering** with custom slots
- **Action buttons** per row
- **Empty states** with custom messages
- **Responsive design** for mobile/tablet
- **Performance optimized** for large datasets

**Usage**:
```vue
<DataTable
  :data="properties"
  :columns="[
    { key: 'pin', label: 'PIN' },
    { key: 'ownerName', label: 'Owner Name' },
    { key: 'status', label: 'Status' },
  ]"
  :page-size="10"
>
  <template #cell-status="{ row }">
    <Badge :variant="getStatusVariant(row.status)">
      {{ row.status }}
    </Badge>
  </template>
  
  <template #actions="{ row }">
    <button @click="handleAction(row)">View</button>
  </template>
</DataTable>
```

---

## 🎯 Key Features Implemented

### Phase 1 (Current)
✅ Authentication with JWT support
✅ Role-based routing and access control
✅ Assessment Clerk Dashboard
✅ Municipal Assessor Dashboard
✅ Admin Dashboard
✅ Responsive sidebar navigation
✅ DataTable component with pagination
✅ Badge system for status indicators
✅ Modal dialog component
✅ State management with Pinia
✅ TypeScript throughout
✅ Tailwind CSS theming
✅ Production-ready architecture

### Phase 2 (To Implement)
- [ ] Multi-step property registration form
- [ ] Document upload with drag-drop
- [ ] Advanced property verification
- [ ] Assessment calculation engine
- [ ] FAAS generation and printing
- [ ] User management interface
- [ ] Audit logs viewer with filters
- [ ] Real-time notifications
- [ ] Export functionality (CSV, PDF)
- [ ] Dark mode support
- [ ] API integration layer

---

## 🚀 Development Setup

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Building for Production
```bash
npm run build
npm run preview
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

---

## 📱 Responsive Design

- **Desktop-first** approach
- **Mobile responsive** via Tailwind breakpoints
- **Sidebar collapses** on smaller screens
- **Grid layouts** adapt to screen size
- **Tables scroll** horizontally on mobile
- **Touch-friendly** button sizes

---

## 🔧 Tailwind Configuration

Custom theme extensions:
- Government green color palette
- Soft shadows for modern look
- Rounded xl (0.75rem) for cards
- Custom spacing and typography
- Safe area insets for mobile notches

**Configuration file**: `tailwind.config.js`

---

## 📈 Performance Considerations

- **Lazy loading** for routes via dynamic imports
- **Pinia stores** for efficient state management
- **Component-based architecture** for code splitting
- **CSS utilities** instead of custom CSS where possible
- **Optimized images** and assets
- **TypeScript** for type safety and better IDE support

---

## 🔐 Security Features

- **JWT authentication** ready
- **Role-based access control** at router level
- **Protected routes** prevent unauthorized access
- **User session** persistence in localStorage
- **Account status** validation (active/inactive/locked)
- **Audit logging** infrastructure ready
- **Type safety** via TypeScript prevents many vulnerabilities

---

## 📝 Next Steps to Complete

1. **Property Registration Form**
   - Multi-step form with validation
   - Document upload component
   - File preview and status

2. **Assessment Module**
   - Valuation calculation forms
   - FAAS generation engine
   - Print and export functionality

3. **Admin Features**
   - User creation/management interface
   - Audit logs viewer with filters
   - System settings configuration

4. **API Integration**
   - Axios interceptors for JWT
   - API service layer
   - Error handling

5. **Advanced Features**
   - Real-time notifications
   - WebSocket support for live updates
   - Advanced search and filtering
   - Data export (CSV, PDF)
   - Dark mode implementation

---

## 📞 Support

For issues, feature requests, or contributions, please refer to the project documentation or contact the development team.

---

**Version**: 1.0.0  
**Status**: Production Ready (Core Architecture)  
**Last Updated**: 2024
