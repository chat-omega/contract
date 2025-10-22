# Omega Workflow Backend

Express + TypeScript backend for the Omega Workflow application.

## Features

- Express.js web framework
- TypeScript for type safety
- CORS enabled
- Request logging with Morgan
- Custom error handling middleware
- Health check endpoint
- Static file serving for production builds
- Environment-based configuration

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration.

## Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## Building

Build the TypeScript code:
```bash
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`

## Production

Run the production server:
```bash
npm start
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run typecheck` - Check TypeScript types without building
- `npm run clean` - Remove compiled files

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route definitions
│   │   └── api.ts       # Main API router
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── index.ts
│   └── server.ts        # Main application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json        # TypeScript configuration
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### API Routes
- `GET /api` - API information
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Environment Variables

See `.env.example` for all available configuration options:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

## Error Handling

The application includes comprehensive error handling:
- Custom error classes
- Async error wrapper
- Detailed error logging
- Environment-specific error responses

## Logging

Request logging includes:
- Timestamp
- HTTP method and path
- Status code
- Response time
- Color-coded console output

## License

ISC
