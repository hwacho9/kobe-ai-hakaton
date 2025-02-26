# Fan Event Prediction App

A web application that helps fans plan ahead for their favorite artists' events by predicting upcoming events and associated expenses.

## Project Overview

This application helps fans:

- Predict upcoming events based on past patterns and social media activity
- Calculate and budget for expenses related to these events
- Track favorite artists and get personalized predictions

## Tech Stack

### Frontend

- Next.js (React) with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Radix UI and Shadcn UI for component foundations

### Backend

- FastAPI (Python)
- Pydantic for data validation
- JWT for authentication
- Azure services integration (Cosmos DB, OpenAI, AD B2C)

## Getting Started

### Using Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd fan-event-prediction-app

# Start the application with Docker Compose
./start.sh
# Or run directly:
# docker-compose up -d
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:8000 with API documentation at http://localhost:8000/docs

### Manual Setup

#### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- npm or yarn

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000 with API documentation at http://localhost:8000/docs

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Backend Environment Variables
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000

# Azure Services
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_COSMOS_DB_ENDPOINT=your-cosmos-db-endpoint
AZURE_COSMOS_DB_KEY=your-cosmos-db-key
AZURE_COSMOS_DB_DATABASE=fan_events

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

- User authentication and profile management
- Artist tracking and following
- Event prediction based on historical data and social media analysis
- Budget planning and expense tracking
- Personalized notifications for upcoming events

## Project Structure

```
project-root/
├── frontend/                   # Next.js (TypeScript) frontend
│   ├── public/                 # Static files (images, fonts, etc.)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (Next.js routing)
│   │   ├── styles/             # CSS/stylesheets
│   │   └── utils/              # API client, utility functions
│   ├── Dockerfile              # Docker configuration for frontend
├── backend/                    # FastAPI (Python) backend
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── core/               # Core settings and security
│   │   ├── models/             # Database models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── Dockerfile              # Docker configuration for backend
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
└── start.sh                    # Startup script
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
