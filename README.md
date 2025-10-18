# DocFlow

**Pet Project**: Internal document management system for local company

A comprehensive document workflow management system designed as an alternative to internal document management solutions. Successfully implemented and actively used by a local company for streamlining document approval processes and internal communications.

## About the Project

DocFlow is a full-stack document management system built with modern web technologies. It serves as a pet project that evolved into a practical solution for a local company's internal document workflow needs.

### Key Features

- **Document Management**: Upload, organize, and manage documents
- **Approval Workflow**: Streamlined document approval process
- **User Management**: Role-based access control
- **Analytics Dashboard**: Track document flow and user activity
- **Real-time Notifications**: Stay updated on document status changes

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling

### Features
- **File Upload** - Document storage and management
- **Authentication** - Secure user authentication
- **Role-based Access** - Different permission levels
- **Real-time Updates** - Live document status tracking

## Project Structure

```
DocFlow/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   └── lib/              # Utilities and contexts
├── backend/              # Backend API (Express.js)
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
└── public/               # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ilyasidk/DocFlow.git
cd DocFlow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with required variables
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

The application can be deployed on platforms like Vercel (frontend) and Railway/Heroku (backend).

## Success Story

This pet project was successfully implemented for a local company and is actively used for:
- Managing internal document workflows
- Streamlining approval processes
- Reducing paper-based processes
- Improving team collaboration

The system has proven its value in real-world business operations, demonstrating the practical application of modern web development technologies.

## Contributing

This is a pet project, but contributions and suggestions are welcome!

## License

This project is open source and available under the [MIT License](LICENSE).