# Overview

This is a presell landing page cloning system that allows users to create affiliate marketing campaigns by cloning external sales pages and adding cookie consent modals. The system automatically attempts to clone pages and falls back to screenshot mode if cloning fails due to security restrictions.

The application uses a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Database ORM**: Drizzle ORM with PostgreSQL
- **File Structure**: Modular route-based architecture
- **Static Files**: Express static middleware for screenshots

## Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with migrations
- **Schema**: Two main tables - users and campaigns
- **Storage Strategy**: Hybrid approach with in-memory fallback (MemStorage class)

# Key Components

## Campaign Management System
- **Campaign Creation**: Form-based campaign setup with validation using Zod schemas
- **Page Cloning**: Automatic HTML cloning with Cheerio for DOM manipulation
- **Screenshot Fallback**: Puppeteer-based screenshot capture for blocked pages
- **Cookie Modal Injection**: Customizable cookie consent modals

## Cloning Service
- **Primary Mode**: Direct HTML cloning with URL rewriting
- **Fallback Mode**: Multi-device screenshot capture (desktop, tablet, mobile)
- **Processing**: Asynchronous campaign processing with status tracking
- **Error Handling**: Graceful degradation from cloning to screenshot mode

## User Interface
- **Dashboard**: Campaign management with statistics cards
- **Campaign Table**: Full CRUD operations with inline actions
- **Form System**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

# Data Flow

## Campaign Creation Flow
1. User fills campaign form with source URL and affiliate URL
2. Form validation using Zod schemas
3. Campaign stored in database with "pending" status
4. Asynchronous processing begins:
   - Attempt page cloning
   - If cloning fails, capture screenshots
   - Update campaign status and content

## Presell Page Rendering
1. User visits generated short URL (`/p/:shortUrl`)
2. System retrieves campaign data
3. Serves cloned HTML or screenshot-based page
4. Injects cookie modal if enabled
5. Redirects to affiliate URL on any modal interaction

## Data Storage Strategy
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage class)
- **File Storage**: Local filesystem for screenshots in campaign-specific directories
- **Session Management**: Connect-pg-simple for PostgreSQL sessions
- **Schema**: Automated migrations via `npm run db:push`

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **cheerio**: Server-side HTML parsing and manipulation
- **puppeteer**: Headless browser for screenshot capture
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management

## UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers

## Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production

# Deployment Strategy

## Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script

## Environment Configuration
- **Development**: `npm run dev` - runs with tsx and hot reloading
- **Production**: `npm run start` - runs compiled JavaScript
- **Database**: Requires `DATABASE_URL` environment variable

## Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Port Configuration**: Internal port 5000, external port 80

# Changelog

- June 20, 2025: Initial setup
- June 20, 2025: Fixed Puppeteer dependencies and screenshot functionality
- June 20, 2025: Improved deletion modal with Portuguese text
- June 20, 2025: Added cookie modal preview functionality
- June 20, 2025: Implemented HTML download feature
- June 20, 2025: Enhanced responsive screenshot display with proper media queries
- June 20, 2025: Migrated from in-memory storage to PostgreSQL database with Drizzle ORM
- January 20, 2025: Successfully migrated from Replit Agent to Replit environment
- January 20, 2025: Fixed PostgreSQL database configuration and table creation
- January 20, 2025: Updated database connection from Neon to postgres-js for better compatibility
- January 21, 2025: Complete TurboPresell visual identity redesign with gradients and modern UI
- January 21, 2025: Enhanced navbar with clean TurboPresell branding and user menu dropdown
- January 21, 2025: Added light sweep animation effects on stats cards for visual feedback
- June 21, 2025: Fixed screenshot functionality by installing Chromium system dependency and configuring Puppeteer executable path
- June 21, 2025: Expanded screenshot capture range from 1224px to 2124px, now capturing 20 different widths (270px to 2124px in 100px increments)
- June 21, 2025: Added bulk campaign selection and deletion functionality with confirmation modal and warning messages
- June 21, 2025: Created comprehensive Settings page with dark mode toggle, visual effects control, and bulk delete protection
- June 21, 2025: Integrated settings navigation in user menu with modern UI design
- June 21, 2025: Fixed settings persistence with localStorage implementation and moved bulk delete button to header next to master checkbox
- June 21, 2025: Corrected DOM nesting validation errors in alert dialogs and improved layout structure
- June 21, 2025: Implemented dark mode theme system with ThemeProvider and CSS variables
- June 21, 2025: Added comprehensive Settings page with tabs layout (Aparência, Efeitos, Segurança, Sons)
- June 21, 2025: Implemented sound notifications system with MP3 file selection and preview functionality
- June 21, 2025: Fixed modal close bug by preventing event propagation on internal action buttons
- June 21, 2025: Configured sound file serving via Express static middleware for MP3 playback functionality
- June 21, 2025: Added click sound trigger to "Total de Cliques" card in stats dashboard
- June 21, 2025: Implemented automatic sound notification when click counter increases in real-time
- June 21, 2025: Fixed sound triggering on page load/refresh by adding initialization state tracking
- June 21, 2025: Ensured sounds only play on actual counter increases, not decreases or page updates
- June 21, 2025: Fixed card highlight animation timeout and removed manual click sound trigger
- June 21, 2025: Implemented proper timeout management with useRef to ensure highlights clear after 3 seconds
- June 22, 2025: Created comprehensive AI Dashboard with statistics visualization and chat interface
- June 22, 2025: Added AI configuration section in Settings with API key input and personality selection
- June 22, 2025: Enhanced main dashboard with larger "Nova Presell" button and quick access to AI Dashboard
- June 22, 2025: Integrated AI Dashboard navigation in user menu and header actions
- June 22, 2025: Moved Dashboard button to after "Nova Presell" button on main page
- June 22, 2025: Simplified AI Dashboard to just "Dashboard" with same navbar and stats cards
- June 22, 2025: Removed AI chat interface and integrated StatsCards component with sound effects
- June 22, 2025: Added complete navbar with TurboPresell branding to Dashboard page
- June 22, 2025: Adjusted Dashboard navbar to match Home navbar exactly with centered "Dashboard" title and AI button
- June 22, 2025: Enhanced Dashboard title styling with gradient colors and improved typography
- June 22, 2025: Implemented comprehensive AI Chat system with ChatGPT-style interface
- June 22, 2025: Added AI Configuration section in Settings with API key and personality selection
- June 22, 2025: Created chat history management with conversation persistence and deletion
- June 22, 2025: Added real-time markdown rendering for AI responses with proper formatting
- June 22, 2025: Enhanced AI configuration with custom behavior prompt and question suggestions
- June 22, 2025: Improved chat interface with proper scrolling and clean response formatting
- June 22, 2025: Removed repetitive headers from AI responses and added contextual follow-up questions
- June 22, 2025: Fixed chat modal overflow and implemented internal scrolling for better UX
- June 22, 2025: Added "Personalidade Padrão" checkbox with Iana default personality preset
- June 22, 2025: Implemented proper scroll behavior in chat modal to prevent modal expansion
- June 22, 2025: Enhanced AI response generation with contextual and varied responses
- June 22, 2025: Fixed chat layout with proper flex containers and scroll areas
- June 22, 2025: Implemented inline CSS styles for chat modal to ensure fixed height and prevent expansion
- June 22, 2025: Removed external CSS file and used direct height constraints for robust scroll behavior
- June 22, 2025: Fixed "Falar com a IA" menu option to properly open AI chat modal
- June 22, 2025: Completely revamped AI response system to use contextual analysis instead of random pre-made responses
- June 22, 2025: Implemented intelligent response generation based on user message content and configured AI settings
- June 22, 2025: AI now properly applies custom behavior prompts and personality configurations from settings
- June 22, 2025: Fixed conversation deletion bug - no auto-creation when deleting last conversation
- June 22, 2025: Enhanced AI response system with real contextual analysis and keyword detection
- June 22, 2025: Added proper empty state with "Start New Conversation" button when no conversations exist
- June 22, 2025: Input field now properly disabled when no active conversation
- June 22, 2025: Fixed menu "Falar com a IA" to properly trigger chat modal opening
- June 22, 2025: Created database tables for settings and chat conversations/messages
- June 22, 2025: Fixed updateConversationTitle function error by adding proper function definition
- June 22, 2025: Updated default AI prompt to "Consultora Liana" with comprehensive marketing expertise
- June 22, 2025: Migrated chat and settings storage from localStorage to PostgreSQL database
- June 22, 2025: Completely integrated settings menu with PostgreSQL database for all tabs and checkboxes
- June 22, 2025: Created comprehensive performance dashboard with interactive line chart and dynamic table
- June 22, 2025: Implemented time filters (hour/day/week/month/year) and metric selection (views/clicks) in performance chart
- June 22, 2025: Added campaign selection system (max 10 campaigns) with real-time chart updates
- June 22, 2025: Created sortable and searchable performance table with CTR calculation and status indicators
- June 22, 2025: Enhanced AI Dashboard with both performance chart and table components for comprehensive analytics
- June 24, 2025: Migrated analytics from mock data to real PostgreSQL database with separate tables for views and clicks
- June 24, 2025: Created individual timestamp tracking for each view and click event for precise historical analysis
- June 24, 2025: Implemented database-driven chart data with grouping by time periods (hour/day/week/month)
- June 24, 2025: Fixed analytics API endpoints and completed real-time historical data visualization system
- June 24, 2025: Identified and fixing chart data inconsistency - API returning total counts instead of period-specific counts
- June 24, 2025: Fixed analytics chart data by replacing Drizzle ORM query with raw SQL to ensure correct period-specific counts
- June 24, 2025: Resolved Drizzle ORM parameter binding issues causing analytics chart to return empty data
- June 24, 2025: Fixed SQL execution method to properly return result arrays instead of undefined rows
- June 24, 2025: Implemented direct PostgreSQL client queries bypassing Drizzle ORM for analytics chart data
- June 24, 2025: Fixed postgres-js tagged template syntax for GROUP BY queries to resolve chart data display issues
- June 24, 2025: Implemented real-time dynamic chart updates with auto-refresh every 3-5 seconds
- June 24, 2025: Created automatic top 3 campaign selection based on views/clicks metrics
- June 24, 2025: Built custom select component with checkboxes showing campaign name (character limited) and creation date
- June 24, 2025: Added campaign sorting by creation date with automatic reordering when switching between views/clicks
- June 24, 2025: Enhanced performance chart with popover-based campaign selection and real-time data visualization

# User Preferences

Preferred communication style: Simple, everyday language.
Visual Identity: TurboPresell brand with modern gradient design (blue-cyan-orange), rounded corners, shadows, and hover animations.
Language: Portuguese interface text preferred.