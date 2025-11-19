# GreatForce CRM - Feature List

## Core Features

### 1. **Dashboard**
- Sales performance overview
- Total contacts and companies metrics
- Pipeline visualization by stage (Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost)
- Real-time statistics with monthly growth indicators
- Quick access to key metrics

### 2. **Contact Management**
- Complete contact database
- Contact details (name, email, phone, title)
- Company association
- Contact status tracking (Active/Inactive)
- Tags and notes support
- Activity history per contact
- Search and filter capabilities
- Import/Export functionality

### 3. **Company Management**
- Company directory
- Company profiles with details:
  - Industry classification
  - Company size
  - Website
  - Description
- Associated contacts and deals tracking
- Company-level analytics

### 4. **Deal Pipeline**
- Deal tracking through sales stages
- Deal value and probability management
- Expected close date tracking
- Contact and company association
- Deal descriptions and notes
- Stage-based pipeline visualization
- Deal value calculations
- Won/Lost deal tracking

### 5. **Activities & Tasks**
- Activity types: Call, Email, Meeting, Task, Demo
- Due date management
- Activity completion tracking
- Contact and deal association
- Overdue activity alerts
- Upcoming activities dashboard
- Activity history and timeline

### 6. **Products & Catalog**
- Product database
- SKU management
- Pricing and cost tracking
- Product categories
- Product descriptions
- Active/Inactive status
- Product availability management

### 7. **Quote Management**
- Quote creation and management
- Quote numbering system
- Multi-item quotes
- Quote status (Draft, Sent, Accepted, Rejected)
- Product integration
- Subtotal, tax, and total calculations
- Quote validity period tracking
- Deal association
- Notes and custom terms

### 8. **Email Templates**
- Pre-built email templates
- Template categories
- Subject line customization
- HTML email body support
- Active/Inactive template management
- Template organization

### 9. **User Management** (Admin/Manager only)
- User account creation and management
- Role-based access (Admin, Manager, Sales, Marketing, Support)
- User activation/deactivation
- Email and name management
- Password management

### 10. **Import/Export** (Admin/Manager/Sales/Marketing)
- Data import capabilities
- Data export functionality
- Bulk data operations
- CSV/Excel support

### 11. **Bulk Actions** (Admin/Manager only)
- Mass update operations
- Bulk status changes
- Multi-record operations
- Batch processing

### 12. **Permissions Management** (Admin only)
- Role-based permission control
- Resource-level permissions
- Action-based access control
- Custom permission configuration
- Permission enabling/disabling

## Advanced Features

### 13. **Global Search**
- Cross-entity search (Contacts, Companies, Deals)
- Keyboard shortcut (⌘K / Ctrl+K)
- Real-time search results
- Quick navigation

### 14. **Authentication & Security**
- Secure login system
- Role-based access control (RBAC)
- Session management
- Password encryption (bcrypt)
- Protected routes

### 15. **Responsive Design**
- Desktop optimized layout with sidebar navigation
- Mobile-responsive design with bottom navigation
- Swipeable mobile navigation
- Touch-friendly interface
- Adaptive layouts

### 16. **Data Relationships**
- Contact-Company associations
- Deal-Contact-Company linking
- Activity-Deal-Contact connections
- Product-Quote relationships
- Hierarchical data structure

## Technical Features

### 17. **Real-time Updates**
- Automatic data refresh
- Live statistics updates
- Dynamic pipeline visualization

### 18. **Database Management**
- SQLite database
- Prisma ORM
- Indexed queries for performance
- Relational data integrity

### 19. **Type Safety**
- Full TypeScript implementation
- Type-safe API routes (tRPC)
- Validated forms and inputs

### 20. **Modern UI/UX**
- Dark mode support
- Tailwind CSS v4 styling
- shadcn/ui components
- Smooth animations and transitions
- Intuitive navigation

## User Roles & Permissions

- **Admin**: Full access to all features
- **Manager**: Access to all features except permissions management
- **Sales**: Access to core CRM features (contacts, deals, activities, products, quotes)
- **Marketing**: Similar to sales with import/export capabilities
- **Support**: Basic access to contacts, companies, deals, activities, and templates

## Key Metrics Tracked

- Total contacts
- Active contacts
- Total companies
- Deal pipeline by stage
- Deal values and probabilities
- Activity completion rates
- Overdue vs upcoming activities
- Monthly growth indicators
