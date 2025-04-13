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

4. Start the application
npm run start

6. Access Swagger documentation
http://localhost:3000/api/docs


## API Endpoints

### Notifications

- `GET /api/notifications` - Get paginated notifications list
- `GET /api/notifications/:id` - Get notification by ID
- `POST /api/notifications` - Create and send a notification manually

### Templates

- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create a new template
- `PUT /api/templates/:id` - Update an existing template

### Statistics

- `GET /api/statistics` - Get notification delivery statistics

## Architecture

This service follows a modular, event-driven architecture:

1. **Event Consumption**: Listens to events from the hiring pipeline via RabbitMQ
2. **Event Processing**: Determines which notifications to send based on event type
3. **Template Rendering**: Applies event data to appropriate templates
4. **Multi-Channel Dispatch**: Sends notifications via email, in-app, etc.
5. **Delivery Tracking**: Records success/failure status for each attempt
6. **Retry Mechanism**: Automatically retries failed notifications with exponential backoff

## Implementation Decisions

- **Message Broker**: RabbitMQ chosen for reliable delivery and excellent NestJS integration
- **Adapter Pattern**: Channel implementations use adapters for easy extensibility
- **Repository Pattern**: Data access abstracted through repositories
- **Factory Pattern**: Notification creation centralized in factories
- **Exponential Backoff**: Retries use increasing delays to prevent overwhelming external systems

## Assumptions Made

- **User Service**: Assumes existence of a user service to resolve recipient details
- **Authentication**: Assumes JWT authentication handled by API gateway
- **Templates**: Assumes templates are managed through the API, not hardcoded
- **Delivery Confirmation**: For email, assumes delivery status based on SMTP response

## Future Improvements

With more time, the following enhancements could be added:

- **User Preferences**: Allow users to set preferred notification channels
- **Batching**: Group notifications to prevent overwhelming recipients
- **Rate Limiting**: Add protection against sending too many notifications
- **Analytics**: More comprehensive delivery and engagement analytics
- **A/B Testing**: Test different notification templates for effectiveness
- **Localization**: Support for multiple languages in templates
- **Push Notifications**: Add mobile push notification support
- **SMS Channel**: Add SMS notification support

## Testing

Run tests with the following commands:

npm run test
