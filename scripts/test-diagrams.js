import fs from 'fs';
import path from 'path';

// Read GEMINI_API_KEY from .env
const envPath = path.resolve(process.cwd(), '.env');
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log(`Using API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NONE'}`);

const TEST_CASES = [
  {
    category: 'flowchart',
    name: 'E-Commerce Checkout Flowchart',
    prompt: 'Create a flowchart for e-commerce checkout with payment check and error handling.',
    refactorPrompt: 'Add social login option and email confirmation node.',
    initialCode: `graph TD
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
    category: 'sequence',
    name: 'OAuth 2.0 Sequence Diagram',
    prompt: 'Sequence diagram showing OAuth 2.0 authorization code grant flow.',
    refactorPrompt: 'Add 3DS verification step and refresh token renewal.',
    initialCode: `sequenceDiagram
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
    category: 'architecture',
    name: 'Microservice System Architecture',
    prompt: 'Architecture diagram with client tier, API gateway, microservices, and databases.',
    refactorPrompt: 'Add Redis cache layer and RabbitMQ event bus.',
    initialCode: `flowchart TB
    subgraph ClientLayer [Client Tier]
        Web[Client Browser / SPA]
        Mobile["Mobile App (iOS/Android)"]
    end

    subgraph Gateway [API Layer]
        CDN["Cloudflare CDN & WAF"]
        APIGW["API Gateway / Ingress"]
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
    category: 'er',
    name: 'E-Commerce ER Diagram',
    prompt: 'ER diagram for Users, Orders, Products, and Reviews.',
    refactorPrompt: 'Add Category entity and ShippingAddress entity with relationships.',
    initialCode: `erDiagram
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
    }`
  },
  {
    category: 'mindmap',
    name: 'Product Roadmap Mindmap',
    prompt: 'Mindmap for an AI diagramming studio product roadmap.',
    refactorPrompt: 'Add team collaboration branch and export formats.',
    initialCode: `mindmap
  root((MermaidAI))
    Core Features
      Live Monaco Editor
      Interactive Canvas
      SVG and PNG Export
    AI Capabilities
      Natural Language to Diagram
      Syntax Self-Healing
      Iterative Diagram Edits`
  },
  {
    category: 'gantt',
    name: 'Sprint Execution Gantt Chart',
    prompt: 'Gantt chart for 2-week software sprint.',
    refactorPrompt: 'Add section for QA testing and code freeze.',
    initialCode: `gantt
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

function validateMermaidSyntax(code, category) {
  const errors = [];

  if (!code || code.trim().length === 0) {
    errors.push('Empty output');
    return errors;
  }

  // Check markdown ticks
  if (code.includes('```')) {
    errors.push('Contains unstripped markdown code fence (```)');
  }

  // Check starting keyword
  const validStarts = ['graph', 'flowchart', 'sequenceDiagram', 'erDiagram', 'mindmap', 'gantt', 'classDiagram', 'stateDiagram'];
  const firstLine = code.trim().split('\n')[0].trim();
  const startsWithValidKeyword = validStarts.some(kw => firstLine.toLowerCase().startsWith(kw.toLowerCase()));
  if (!startsWithValidKeyword) {
    errors.push(`Invalid start keyword on line 1: "${firstLine}"`);
  }

  // Check unquoted brackets with special chars like (Web/Mobile)
  const unquotedBracketMatch = code.match(/\b([A-Za-z0-9_\-]+)\[([^\]"\n]*[\(\)\/\:\&\#]+[^\]"\n]*)\]/);
  if (unquotedBracketMatch) {
    errors.push(`Unquoted bracket label with special chars: "${unquotedBracketMatch[0]}"`);
  }

  // Check same-line concatenated keywords without newlines (e.g. "task1section Next")
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[^\s]+.*\b(section|subgraph)\b/i.test(trimmed) && !/^(section|subgraph)\b/i.test(trimmed)) {
      errors.push(`Concatenated keyword on same line: "${trimmed}"`);
    }
  }

  return errors;
}

async function runTests() {
  console.log('==================================================');
  console.log(' Starting AI Diagram Generation & Refactoring Test');
  console.log('==================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Category: [${testCase.category.toUpperCase()}] ${testCase.name}`);
    console.log(`--------------------------------------------------`);

    // 1. Initial Generation Test
    totalTests++;
    console.log(`\n1. Testing Initial Prompt Generation...`);
    console.log(`   Prompt: "${testCase.prompt}"`);

    try {
      const res = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testCase.prompt })
      });

      const data = await res.json();

      if (data.error) {
        console.log(`   ❌ API Error: ${data.error}`);
      } else {
        const syntaxErrors = validateMermaidSyntax(data.code, testCase.category);
        if (syntaxErrors.length === 0) {
          console.log(`   ✅ PASS (Syntax Valid)`);
          console.log(`   Generated Snippet:\n   ${data.code.split('\n').slice(0, 4).join('\n   ')}...`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL - Syntax Errors: ${syntaxErrors.join(', ')}`);
          console.log(`   Code Output:\n${data.code}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Request Error: ${err.message}`);
    }

    // 2. Refactoring Test
    totalTests++;
    console.log(`\n2. Testing Incremental Refactoring...`);
    console.log(`   Refactor Prompt: "${testCase.refactorPrompt}"`);

    try {
      const res = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testCase.refactorPrompt,
          currentCode: testCase.initialCode
        })
      });

      const data = await res.json();

      if (data.error) {
        console.log(`   ❌ API Error: ${data.error}`);
      } else {
        const syntaxErrors = validateMermaidSyntax(data.code, testCase.category);
        if (syntaxErrors.length === 0) {
          console.log(`   ✅ PASS (Syntax Valid)`);
          console.log(`   Refactored Snippet:\n   ${data.code.split('\n').slice(0, 4).join('\n   ')}...`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL - Syntax Errors: ${syntaxErrors.join(', ')}`);
          console.log(`   Code Output:\n${data.code}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Request Error: ${err.message}`);
    }
  }

  console.log('\n==================================================');
  console.log(` TEST SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('==================================================\n');
}

runTests();
