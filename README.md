# HR-SaaS Notification Service

A scalable event-driven microservice for handling notifications in an HR-SaaS platform focusing on hiring pipelines.

## Features

- **Event-Driven Architecture**: Consumes events from hiring pipeline services
- **Multi-Channel Notifications**: Support for email and in-app notifications
- **Templating System**: Customizable notification templates with variable substitution
- **Retry Mechanism**: Exponential backoff strategy for failed notifications
- **Delivery Tracking**: Full history of notification delivery attempts
- **Scalable Design**: Horizontal scaling capability for high volumes
- **API Documentation**: Full Swagger documentation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Message Broker**: RabbitMQ
- **Template Engine**: Handlebars
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- RabbitMQ

### Installation

1. Clone the repository

git clone https://github.com/yourusername/hr-saas-notification-service.git
cd hr-saas-notification-service


2. Install dependencies

npm install


3. Configure environment variables

cp .env.example .env
Edit the `.env` file with your database and RabbitMQ configuration.

4. Run database migrations
npm run migration