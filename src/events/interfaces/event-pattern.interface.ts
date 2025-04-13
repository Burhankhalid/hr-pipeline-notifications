// interfaces/event-pattern.interface.ts

export interface EventPattern {
    /**
     * The type of event (e.g., 'new_application', 'interview_scheduled')
     */
    type: string;
    
    /**
     * Optional source of the event (e.g., 'recruiting-service', 'interview-scheduler')
     */
    source?: string;
    
    /**
     * Optional version information for handling schema changes
     */
    version?: string;
  }