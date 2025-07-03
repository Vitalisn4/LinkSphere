# Changelog

All notable changes to the LinkSphere project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Initial Setup
- Created repository structure
- Set up basic project structure
- Initialized Git repository
- Created initial commit

### Backend Development
- Added Rust backend with Axum framework
- Implemented SQLx for type-safe database operations
- Set up CI pipeline for Rust linting and formatting
- Added Docker configuration for backend service
- Fixed SQLx offline mode configuration in CI
- Added environment variables handling for database connection
- Set up PostgreSQL database structure
- Created database migrations
- Added error handling middleware
- Implemented basic API endpoints structure

### Frontend Development
- Created React + TypeScript project structure
- Migrated to Vite from Create React App
- Added TypeScript strict mode configurations
- Fixed import path issues in components
- Updated frontend dependencies to latest versions
- Improved error handling in components
- Set up basic routing with React Router
- Added theme context for dark/light mode
- Created authentication context and hooks
- Implemented basic UI components:
  - Navigation bar
  - Link cards
  - Authentication forms
  - Loading states

### Authentication
- Implemented JWT-based authentication
- Added email verification system
- Set up protected routes
- Added user registration and login flows
- Added OTP attempt tracking and management
- Implemented admin endpoint for OTP attempt reset
- Enhanced session security with timeout mechanisms
- Removed deprecated delete endpoint

### Infrastructure
- Set up GitHub Actions workflows
  - Backend CI for Rust linting (clippy and rustfmt)
  - Frontend CI for TypeScript checks
- Added Docker containerization
- Configured development environment

### Documentation
- Added README with project overview
- Added setup instructions
- Added contribution guidelines
- Added changelog

### Added
- Database health monitoring endpoint at `/api/admin/db/health`
- Automated health checks every 5 minutes via GitHub Actions
- Admin token authentication for system endpoints
- Improved error handling and standardized API responses

### Changed
- Moved admin endpoints under `/api/admin/*` path
- Enhanced security with `ADMIN_SECRET_KEY` for system operations

### Security
- Added `X-Admin-Token` header validation for admin endpoints
- Protected system endpoints with environment-based secret key

[Unreleased]: https://github.com/Nkwenti-Severian-Ndongtsop/LinkSphere/ 
 