[![Backend CI](https://github.com/Vitalisn4/LinkSphere/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Vitalisn4/LinkSphere/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/Vitalisn4/LinkSphere/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Vitalisn4/LinkSphere/actions/workflows/frontend-ci.yml)
# LinkSphere - Your Personal Link Management Platform

LinkSphere is a modern, user-friendly web application that helps you organize, manage, and share your links efficiently. Built with React and TypeScript for the frontend, and Rust with SQLx for the backend, it offers a beautiful and intuitive interface with both light and dark mode support.

## 🌟 Features

### Authentication & Security
- Secure user registration and login system with JWT
- Email verification with OTP
- Protected routes and secure session management
- Password hashing with bcrypt
- Rate limiting and CSRF protection
- OTP attempt management and reset functionality
- Secure session timeout handling

### Link Management
- Create and organize your links with custom titles and descriptions
- Upload and manage link preview images
- Search functionality to quickly find your links
- Responsive grid layout for easy browsing
- Link categorization and tagging (coming soon)
- Automatic link preview generation

### User Interface
- Beautiful, modern UI with smooth animations
- Dual theme support (Light/Dark mode)
- Responsive design for all devices
- Custom scrollbars and focus states
- Loading states and error handling
- Toast notifications for user feedback

### Account Management
- Profile customization(coming soon)
- Account settings(coming soon)
- Secure password updates(coming soon)
- Account deletion with (coming soon)

### Technical Features
#### Frontend
- Built with React and TypeScript
- Styled with Tailwind CSS
- Framer Motion for smooth animations
- Responsive and mobile-first design
- Modern development practices
- Type-safe codebase

#### Backend
- Built with Rust for high performance
- SQLx for type-safe database operations
- PostgreSQL database
- JWT-based authentication
- Email integration with RESEND
- Docker containerization
- Comprehensive error handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Rust (latest stable)
- PostgreSQL
- Docker (optional)
- Git

### Frontend Installation

1. Clone the repository:
```bash
git clone https://github.com/Nkwenti-Severian-Ndongtsop/LinkSphere.git
cd LinkSphere/my-link-uploader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory and add your environment variables:
```env
VITE_API_URL=your_api_url
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Set up your environment variables in a `.env` file:
```env
DATABASE_URL=postgres://user:password@localhost:5432/linksphere
JWT_SECRET=your_jwt_secret
FRONTEND_REQUEST_URL=http://localhost:5173
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
RESEND_API_KEY=""
PORT=""
HOST=""
```

3. Run database migrations:
```bash
cargo install sqlx-cli
sqlx migrate run
```

4. Start the backend server:
```bash
cargo run
```

The backend API will be available at `http://HOST:PORT`

## 🛠️ Tech Stack

### Frontend
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Context
- **Routing:** React Router
- **Form Handling:** React Hook Form
- **API Client:** Axios
- **Build Tool:** Vite

### Backend
- **Language:** Rust
- **Web Framework:** Axum
- **Database:** PostgreSQL
- **ORM:** SQLx
- **Authentication:** JWT
- **Email:** Lettre
- **Containerization:** Docker

## 🎨 Theme Support

LinkSphere features a beautiful dual theme system:

### Light Theme
- Soft, muted colors for reduced eye strain
- Semi-transparent backgrounds for depth
- Gentle shadows and transitions
- Optimized contrast for readability

### Dark Theme
- Rich, deep colors for night viewing
- Carefully selected contrast ratios
- Smooth transitions between states
- Reduced blue light emission

## 🔒 Security Features

- Secure password hashing with bcrypt
- JWT-based authentication
- Protected API endpoints
- CSRF protection
- Rate limiting
- Input sanitization
- SQL injection prevention through SQLx
- Secure headers
- OTP attempt tracking and management
- Session timeout mechanisms

## 📱 Responsive Design

- Mobile-first approach
- Fluid layouts
- Adaptive components
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Future Enhancements

- Link analytics and tracking
- Custom link shortener
- Social sharing integration
- Browser extension
- API for third-party integration
- Advanced search filters
- Link collections and folders
- Real-time collaboration features
- Others...

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite](https://vitejs.dev/)

### Backend
- [Rust](https://www.rust-lang.org/)
- [Axum](https://github.com/tokio-rs/axum)
- [SQLx](https://github.com/launchbadge/sqlx)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## System Monitoring

### Health Check Endpoint

The system includes an automated health monitoring system that checks the database connection status. This is implemented through:

- **Endpoint**: `/api/admin/db/health`
- **Method**: GET
- **Authentication**: Requires `X-Admin-Token`
- **Automated Monitoring**: GitHub Actions workflow runs every 5 minutes

## Development Setup

### Frontend
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Context
- **Routing:** React Router
- **Form Handling:** React Hook Form
- **API Client:** Axios
- **Build Tool:** Vite

### Backend
- **Language:** Rust
- **Web Framework:** Axum
- **Database:** PostgreSQL
- **ORM:** SQLx
- **Authentication:** JWT
- **Email:** Lettre
- **Containerization:** Docker

---
