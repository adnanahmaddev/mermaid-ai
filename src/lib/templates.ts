export interface DiagramTemplate {
  id: string;
  name: string;
  category: 'flowchart' | 'sequence' | 'er' | 'mindmap' | 'architecture' | 'gantt';
  description: string;
  code: string;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'e-commerce-checkout',
    name: 'E-Commerce Checkout Flow',
    category: 'flowchart',
    description: 'User purchase workflow with payment validation and error handling.',
    code: `graph TD
    A[🛒 Start Checkout] --> B{User Logged In?}
    B -- No --> C[🔑 Prompt Login / Signup]
    C --> B
    B -- Yes --> D[📦 Select Shipping Address]
    D --> E[💳 Select Payment Method]
    E --> F{Process Payment}
    F -- Success --> G[✅ Order Confirmed]
    F -- Failed --> H[⚠️ Show Payment Error]
    H --> E
    G --> I[📧 Send Email Receipt]`
  },
  {
    id: 'auth-sequence',
    name: 'OAuth 2.0 Authentication',
    category: 'sequence',
    description: 'Sequence diagram showing user authorization code grant flow.',
    code: `sequenceDiagram
    autonumber
    actor User
    participant App as Client Application
    participant Auth as Auth Server (OAuth)
    participant API as Resource Server (API)

    User->>App: Click "Login with Provider"
    App->>Auth: Redirect to /authorize
    Auth-->>User: Display Login & Consent Form
    User->>Auth: Approve Permissions
    Auth-->>App: Redirect with Authorization Code
    App->>Auth: POST /token (Code + Secret)
    Auth-->>App: Return Access & Refresh Token
    App->>API: GET /userinfo (Bearer Token)
    API-->>App: User Profile Data
    App-->>User: Render User Dashboard`
  },
  {
    id: 'system-architecture',
    name: 'Microservice System Architecture',
    category: 'architecture',
    description: 'High-level cloud service components and database architecture.',
    code: `flowchart TB
    subgraph ClientLayer [Client Tier]
        Web[Client Browser / SPA]
        Mobile[Mobile App iOS/Android]
    end

    subgraph Gateway [API Layer]
        CDN[Cloudflare CDN & WAF]
        APIGW[API Gateway / Ingress]
    end

    subgraph Services [Microservices Tier]
        AuthSvc[Auth Service]
        OrderSvc[Order Service]
        PaySvc[Payment Service]
        NotifSvc[Notification Service]
    end

    subgraph Storage [Data Tier]
        UserDB[(PostgreSQL Users)]
        OrderDB[(MongoDB Orders)]
        Cache[(Redis Cache)]
        MQ[[RabbitMQ Event Bus]]
    end

    Web & Mobile --> CDN --> APIGW
    APIGW --> AuthSvc & OrderSvc & PaySvc
    AuthSvc --> UserDB & Cache
    OrderSvc --> OrderDB & MQ
    PaySvc --> MQ
    MQ --> NotifSvc`
  },
  {
    id: 'database-schema',
    name: 'E-Commerce ER Diagram',
    category: 'er',
    description: 'Entity Relationship diagram for Users, Orders, Products, and Reviews.',
    code: `erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : included_in
    PRODUCT ||--o{ REVIEW : receives

    USER {
        uuid id PK
        string email UK
        string name
        datetime created_at
    }

    ORDER {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        string status
        datetime created_at
    }

    PRODUCT {
        uuid id PK
        string sku UK
        string name
        decimal price
        int stock_quantity
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }

    REVIEW {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        int rating
        string comment
    }`
  },
  {
    id: 'product-roadmap',
    name: 'AI Product Roadmap Mindmap',
    category: 'mindmap',
    description: 'Visual mindmap of features for an AI diagramming tool.',
    code: `mindmap
  root((MermaidAI))
    Core Features
      Live Monaco Editor
      Interactive Canvas
      SVG and PNG Export
    AI Capabilities
      Natural Language to Diagram
      Syntax Self-Healing
      Iterative Diagram Edits
      Custom Styling Prompts
    Integrations
      GitHub Sync
      Notion Embeds
      VS Code Extension`
  },
  {
    id: 'sprint-gantt',
    name: 'Sprint Execution Timeline',
    category: 'gantt',
    description: 'Gantt chart representing agile sprint task delivery.',
    code: `gantt
    title Sprint 1 Delivery Schedule
    dateFormat  YYYY-MM-DD
    section Setup & Core
    Project Setup           :done,    des1, 2026-08-01, 2026-08-03
    Monaco & Canvas Config  :active,  des2, 2026-08-03, 2026-08-06
    section AI Integration
    Gemini API Route Setup  :         des3, 2026-08-06, 2026-08-08
    Syntax Healing Loop     :         des4, 2026-08-08, 2026-08-10
    section Testing & Launch
    End-to-End QA           :         des5, 2026-08-10, 2026-08-12`
  }
];
