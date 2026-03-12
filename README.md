# Farm Management Portal - MRL Monitoring System

A comprehensive web-based farm management system for tracking drug usage in livestock and monitoring compliance with Maximum Residue Limited (MRL) standards maintained by FSSAI (Food Safety and Standards Authority of India).

## Overview

The Farm Management Portal is a React-based application that helps farmers and farm managers:
- Track drug administration records for livestock
- Monitor residue limits based on FSSAI standards
- Manage animal inventory and identification
- Analyze drug usage patterns
- Ensure food safety compliance

## Project Structure

```
farm-management-portal/
├── public/
│   └── documents/
│       └── FSSAI_MRL_Database.json      # MRL standards database
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── UsageChart.tsx          # Drug usage visualization
│   │   │   └── RegulatoryResources.tsx # Reference documents
│   │   ├── forms/
│   │   │   └── DrugUsageForm.tsx       # Drug logging form
│   │   ├── tables/
│   │   │   └── MRLStatusTable.tsx      # MRL status display
│   │   └── AnimalManager.tsx           # Animal inventory management
│   ├── pages/
│   │   ├── AuthPage.tsx                # Authentication interface
│   │   └── Dashboard.tsx               # Main dashboard
│   ├── contexts/
│   │   └── AuthContext.tsx             # User authentication context
│   ├── lib/
│   │   ├── calculations/
│   │   │   └── mrlCalculator.ts        # MRL calculation logic
│   │   ├── supabase.ts                 # Database client
│   │   └── database.types.ts           # Database type definitions
│   ├── types/
│   │   ├── index.ts                    # Core type definitions
│   │   └── database.types.ts           # Supabase schema types
│   ├── styles/
│   │   └── index.css                   # Global styles
│   ├── vite-env.d.ts                   # Vite environment types
│   ├── main.tsx                        # Application entry point
│   └── App.tsx                         # Main application component
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Key Features

### 1. **Authentication**
- Secure user registration and login via Supabase
- Session management
- User-specific data isolation

### 2. **Drug Usage Logging**
- Log drug administration with detailed information:
  - Drug name
  - Animal type and individual animal ID
  - Dose amount and unit (mg, ml, g)
  - Number of animals
  - Administration date
  - Additional notes
- Automatic MRL status calculation
- Edit and delete existing logs

### 3. **MRL Compliance Monitoring**
- Time-aware MRL status tracking:
  - **Safe**: Residue levels within acceptable limits
  - **Warning**: Approaching MRL limits
  - **Exceeded**: Exceeds safe residue levels
- Status based on FSSAI standards
- Residue calculation considers time elapsed since administration

### 4. **Animal Management**
- Register animals with unique tag IDs
- Assign animals to specific types
- Link animals to drug usage logs
- Manage farm inventory

### 5. **Analytics & Reporting**
- Dashboard statistics:
  - Total drug usage logs
  - Safe vs. warning vs. exceeded entries
  - MRL alerts
- Drug usage visualization
  - Top 5 most-used drugs chart
  - Time-series tracking
- Usage history and trends

### 6. **Reference Resources**
- Links to regulatory documents
- FSSAI MRL database access
- Regulatory compliance information

## Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **Lucide React 0.344** - Icon library

### Backend & Database
- **Supabase** - PostgreSQL database and authentication
- **Supabase JS Client 2.57** - Database API

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account with configured database

### Steps

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Create a Supabase project
   - Set up authentication (email/password)
   - Update `src/lib/supabase.ts` with your credentials:
   ```typescript
   const supabaseUrl = "YOUR_SUPABASE_URL"
   const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
   ```

3. **Database Schema:**
   The application requires the following tables:
   - `users` - User accounts (handled by Supabase Auth)
   - `drugs` - Drug inventory
   - `animal_types` - Animal classification
   - `animals` - Individual animal records
   - `drug_usage_logs` - Drug administration history

4. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Component Guide

### Pages
- **AuthPage**: User authentication interface with sign up/login forms
- **Dashboard**: Main application hub with all features and statistics

### Components

#### Forms
- **DrugUsageForm**: Complete form for logging drug administration
  - Validates drug-animal combinations
  - Calculates MRL status
  - Supports add and edit operations

#### Tables
- **MRLStatusTable**: Data table displaying all drug usage logs
  - Shows current status with color coding
  - Edit and delete functionality
  - Sorted by most recent date

#### Common
- **UsageChart**: Bar chart visualizing top 5 drugs by usage frequency
- **RegulatoryResources**: Links to FSSAI and compliance documents

#### Managers
- **AnimalManager**: Interface for managing animal inventory
  - Add/edit/delete animals
  - Organize by animal type
  - Link to specific users

### Contexts
- **AuthContext**: Manages user authentication state and operations
  - Sign up and sign in functions
  - User session handling
  - Sign out functionality

### Utilities

#### MRL Calculator (`lib/calculations/mrlCalculator.ts`)
- `calculateTimeAwareMRLStatus()`: Calculates current MRL status considering time elapsed
- `FSSAI_STANDARDS_MRLS`: Database of MRL standards by drug and animal type
- Supports different regulatory standards (FSSAI)

## MRL Status Calculation

The system uses a time-aware algorithm to determine drug residue safety:

1. **Initial Status**: Based on dose amount vs. MRL for drug-animal combination
2. **Time Factor**: Considers pharmacokinetics and residue elimination rate
3. **Safety Thresholds**:
   - Safe: Residue < 50% of MRL
   - Warning: 50-100% of MRL
   - Exceeded: > 100% of MRL

Example:
- If a drug has MRL of 100 µg/kg for a specific animal
- And 50 µg/kg administered
- Status depends on time elapsed and elimination rate

## Data Flow

```
User Login
    ↓
AuthContext retrieves session
    ↓
Dashboard loads
    ↓
Fetch drug logs from Supabase
    ↓
Calculate current MRL status
    ↓
Display stats and tables
    ↓
User logs drug usage
    ↓
DrugUsageForm calculates status
    ↓
Save to database
    ↓
Refresh logs and stats
```

## Security Features

- **Authentication**: Supabase Auth handles secure user sessions
- **Authorization**: Database policies ensure users see only their data
- **Data Validation**: Form validation and TypeScript type safety
- **SQL Injection Prevention**: Supabase parameterized queries
- **HTTPS**: Secure data transmission

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Connection Issues
- Verify Supabase credentials in `src/lib/supabase.ts`
- Check network connectivity
- Ensure Supabase project is active

### MRL Status Not Updating
- Clear browser cache
- Check database connection
- Verify FSSAI_MRL_Database.json is loaded
- Check browser console for errors

### Authentication Failures
- Verify email format
- Check password requirements
- Ensure user account exists
- Check Supabase Auth settings

## Future Enhancements

- Multi-farm support
- Advanced reporting and analytics
- Batch operations for multiple animals
- Export functionality (CSV, PDF)
- Mobile app
- Integration with veterinary systems
- Predictive MRL analysis
- Compliance alert notifications
- 

---

**Last Updated**: 13 March 2026
