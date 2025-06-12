# LinkSphere

A modern web application for sharing and managing valuable links with the community. Built with React, TypeScript, and Node.js.

## Features

- 🔐 Secure user authentication with email verification
- 🔗 Share links with title and description
- 🎨 Beautiful, responsive UI with dark/light theme support
- 📊 Track link engagement with click statistics
- 🌐 Link preview generation
- ⚡ Real-time validation and feedback
- 🎭 Drag and drop URL support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LinkSphere.git
cd LinkSphere
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd my-link-uploader
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Create `.env` files in both `my-link-uploader` and `backend` directories:

Frontend `.env`:
```
VITE_API_URL=http://localhost:8080/api
```

Backend `.env`:
```
PORT=8080
DATABASE_URL=postgresql://username:password@localhost:5432/linksphere
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

4. Set up the database:
```bash
cd backend
npm run migrate
```

5. Start the development servers:

In one terminal:
```bash
cd backend
npm run dev
```

In another terminal:
```bash
cd my-link-uploader
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
LinkSphere/
├── my-link-uploader/          # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   └── services/         # API services
│   └── package.json
│
└── backend/                   # Backend Node.js application
    ├── src/
    │   ├── controllers/      # Route controllers
    │   ├── middleware/       # Express middleware
    │   ├── models/          # Database models
    │   └── routes/          # API routes
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)