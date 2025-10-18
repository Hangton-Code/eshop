# EShop Website Sitemap & Hierarchy

> 🔒 **Note:** All routes are protected by Clerk Authentication

## Customer-Facing Pages (Protected)

```
/
├── Home (/)
│   ├── Chat Tab - AI Shopping Assistant
│   │   └── AI Chat
│   │       └── /chat/[id]
│   │           └── Conversational Shopping Interface
│   │               ├── Product recommendations
│   │               ├── Web search integration
│   │               ├── Order checking
│   │               └── File attachments support
│   └── Explore Tab - Product Discovery
│
├── Shopping & Products
│   ├── /product/[id]
│   │   └── Product Detail Page
│   │       ├── Product Information
│   │       ├── Add to Cart
│   │       └── Merchant Information
│   │
│   ├── /category/[category]
│   │   └── Category Listing Page
│   │       └── Filtered Products by Category
│   │
│   ├── /search/[query]
│   │   └── Search Results Page
│   │       └── Products matching search query
│   │
│   └── /merchant/[id]
│       └── Merchant Store Page
│           └── All products from specific merchant
│
├── Shopping Cart & Checkout
│   ├── Cart (Sheet Component)
│   │   └── View cart items & quantities
│   │
│   ├── /checkout
│   │   └── Checkout Process
│   │       ├── Cart Review
│   │       ├── Stripe Payment
│   │       └── Order Confirmation
│   │
│   ├── /congratulations
│   │   └── Order Success Page
│   │
│   └── /return
│       └── Stripe Payment Return Handler
│
├── Customer Account
│   ├── /account
│   │   └── Account Settings & Profile
│   │
│   └── /orders
│       └── Order History
│           ├── View past orders
│           └── Order status tracking
│

```

## CMS/Merchant Dashboard (Protected)

```
/cms
├── Landing Page (/cms)
│   └── Shop Selection Dashboard
│       ├── View all merchant shops
│       └── Create new shop
│
└── Merchant Dashboard (/cms/[id])
    │
    ├── Overview (/cms/[id])
    │   └── Dashboard Home
    │       ├── Sales statistics
    │       ├── Recent orders
    │       └── Quick actions
    │
    ├── Products Management (/cms/[id]/products)
    │   └── Product Administration
    │       ├── Product table/list
    │       ├── Add new product
    │       ├── Edit product
    │       ├── Delete product
    │       └── Inventory management
    │
    ├── Orders Management (/cms/[id]/orders)
    │   └── Order Administration
    │       ├── Order table/list
    │       ├── View order details
    │       ├── Update order status
    │       ├── Track shipments
    │       └── Process returns/refunds
    │
    └── Profile Settings (/cms/[id]/profile)
        └── Merchant Profile Management
            ├── Business information
            ├── Contact details
            ├── Store settings
            └── Payment configuration
```

## API Routes Structure

```
/api
├── /api/chat
│   └── POST - AI Chat streaming endpoint
│
├── /api/files
│   └── /upload
│       └── POST - File upload handler
│
├── /api/history
│   └── GET - Retrieve chat history
│
├── /api/orders
│   └── GET - Fetch user orders
│
└── /api/products
    ├── GET - List all products
    ├── /explore
    │   └── GET - Featured/recommended products
    └── /category/[category]
        └── GET - Products by category
```

## User Flow Diagrams

### Customer Shopping Flow

```
Home → Browse/Search Products → Product Detail → Add to Cart →
Checkout → Payment (Stripe) → Congratulations → Order History
```

### AI-Assisted Shopping Flow

```
Home (Chat Tab) → AI Conversation → Product Recommendations →
Click Product → Add to Cart → Checkout → Payment → Congratulations
```

### Merchant Management Flow

```
CMS Landing → Select Shop → Dashboard Overview →
├── Manage Products (Add/Edit/Delete)
├── Process Orders (View/Update Status)
└── Update Profile (Business Settings)
```

## Authentication & Authorization

- **All Routes Protected**: Every route in the application requires authentication
- **Authentication Provider**: Clerk (via middleware `createRouteMatcher(["/(.*)")])`)
- **Customer Routes**: /, /product, /category, /search, /merchant, /account, /orders, /checkout, /chat, /congratulations, /return
- **Merchant Routes**: /cms and all subroutes
- **Payment Integration**: Stripe

## Key Features by Section

### Customer Features

- ✨ AI-powered shopping assistant with chat interface
- 🔍 Advanced product search and filtering
- 🛒 Shopping cart with persistent state
- 💳 Secure Stripe payment processing
- 📦 Order tracking and history
- 🌐 Multi-language support (i18n)
- 🔐 User authentication and profile management

### CMS Features

- 🏪 Multi-shop management
- 📊 Product inventory management
- 📋 Order processing and fulfillment
- 👤 Merchant profile configuration
- 📈 Dashboard analytics
- ✏️ CRUD operations for products and orders
- 🎨 Category management

## Technology Stack Context

- **Framework**: Next.js 14+ (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **Payment**: Stripe
- **AI**: OpenRouter (Gemini 2.5 Flash)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Server Actions
