# LinkSphere

A modern link management application built with React and TailwindCSS.

## Features

- Responsive navigation with mobile support
- Dark/Light mode toggle
- Link upload functionality
- Link management dashboard
- Admin interface

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd my-link-uploader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
my-link-uploader/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Upload.js
│   │   ├── ViewLinks.js
│   │   └── Admin.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm eject`: Ejects from Create React App

## Dependencies

- React
- React Router
- TailwindCSS
- Heroicons
- Headless UI

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT
