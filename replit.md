# Overview

StudyFlow is a modern student productivity platform built as a full-stack web application. The system provides intelligent homework tracking, class management, calendar integration, and personalized study insights to help students excel in their academic journey. The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and implementing Replit's OAuth authentication system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React and TypeScript, utilizing modern tooling and design patterns:

- **Framework**: React 18 with TypeScript for type safety and developer experience
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Component Structure**: Modular component architecture with reusable UI components in `/components/ui/`

## Backend Architecture

The server-side follows RESTful API principles with Express.js:

- **Runtime**: Node.js with TypeScript using ESM modules
- **Framework**: Express.js for HTTP server and middleware handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints organized by resource (users, classes, assignments, activities)

## Database Design

PostgreSQL database with type-safe schema definitions:

- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Tables**: Users, classes, assignments, activities, and sessions
- **Relationships**: Foreign key constraints with cascade deletion for data integrity
- **Data Validation**: Zod schemas for runtime validation and type inference

## Authentication & Authorization

Integrated Replit OAuth system:

- **Provider**: Replit's OpenID Connect implementation
- **Session Management**: Secure HTTP-only cookies with PostgreSQL storage
- **User Management**: Automatic user creation/updates from OAuth profile data
- **Route Protection**: Middleware-based authentication checks for protected endpoints

## Development & Deployment

Modern development workflow with production considerations:

- **Development**: Hot module replacement with Vite dev server
- **Type Checking**: Shared TypeScript configuration across client/server/shared modules
- **Build Process**: Client-side bundling with Vite, server-side bundling with esbuild
- **File Organization**: Monorepo structure with separate client, server, and shared directories

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

## Authentication Services
- **Replit OAuth**: OpenID Connect integration for user authentication
- **Session Store**: connect-pg-simple for PostgreSQL-backed session storage

## UI & Design Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide Icons**: Modern icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **Drizzle Kit**: Database migration and schema management tools
- **TanStack Query**: Server state management and caching solution

## Production Dependencies
- **Express**: Web application framework for Node.js
- **Passport**: Authentication middleware for OAuth integration
- **Date-fns**: Modern date utility library for date formatting and manipulation