# OneShelf: Unified Purchase & Personal Inventory Management

**OneShelf** is a personal inventory and collection management web application that unifies your purchase records—scattered across various shopping apps and stores (fashion, beauty, timepieces, lifestyle goods)—into a single shelf using just a screenshot of your order confirmation.

🌐 **Live Demo**: [https://mvp-oneshelf-1043680648816.asia-northeast3.run.app](https://mvp-oneshelf-1043680648816.asia-northeast3.run.app)

---

## 1. Key Features

- **Unified Inventory Archive (`/`)**: View your total inventory count, monthly additions, active items in use, and total portfolio valuation at a glance. Filter by category (*Clothing*, *Beauty*, *Watch & Jewelry*, *Lifestyle / Merch*, *Other*) and search instantly by keyword or brand.
- **Multimodal AI Receipt Scanner (`#/add/scan`)**: Upload an order confirmation or e-receipt screenshot. **Gemini 3.8 Flash** extracts structured product metadata (brand, name, category, purchase date, price, currency, merchant/store, quantity, confidence score, and visual evidence) strictly following a structured JSON schema.
- **Duplicate Purchase Warning**: Normalizes `brand + product name` with fuzzy similarity matching against your existing collection. If a matching item is found, an instant proactive alert is shown:  
  *e.g., "You already own a similar item: Nike Air Force 1 '07 (Purchased Oct 2025)"*
- **Manual Registration (`#/add/manual`) & Detail Lifecycle (`#/items/:id`)**: Quickly register items manually with just a name, or manage item lifecycles across four statuses (*New*, *In Use*, *Stored*, *Archived*). Store notes on warranties, storage locations, and toggle between the product image and original order receipt.
- **Bilingual Interface (Korean / English)**: Toggle between Korean and English at any time via the top navigation bar. Product categories, item statuses, and sample datasets are localized seamlessly.
- **Built-in Sample Presets**: Includes 4 realistic seed items (Nike Air Force 1, Aesop Resurrection Aromatique Hand Balm, Casio G-Shock Full Metal Silver Watch, Stanley Quencher Tumbler) initialized in `localStorage` so you can evaluate the full workflow without an empty state.
- **Zero-Failure Fallback System**: Even without a configured API key or under network interruptions, realistic extraction presets (Musinsa, Olive Young, 29CM) automatically populate the review form, guaranteeing an uninterrupted demo flow.

---

## 2. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Build Tool**: Vite
- **Backend / API**: Express 4, Node.js 22, tsx
- **AI & Multimodal Vision**: `@google/genai` SDK (`gemini-3.8-flash`)
- **Deployment**: Google Cloud Run (Containerized with Docker, hosted in `asia-northeast3` Seoul)

---

## 3. Getting Started

### Prerequisites

- Node.js (v20+ recommended, v22 tested)
- npm (v10+)

### Installation

```bash
# Clone the repository
git clone https://github.com/krooner/google-deepmind-ai-hackathon-2026.git
cd google-deepmind-ai-hackathon-2026

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Required for real-time Gemini AI extraction
GEMINI_API_KEY="your-gemini-api-key"

# Application URL (optional for local development, defaults to port 3000)
APP_URL="http://localhost:3000"
```

> [!NOTE]
> If `GEMINI_API_KEY` is not provided or remains empty, OneShelf gracefully falls back to built-in realistic mock extraction data so you can test all features seamlessly.

### Running Locally

```bash
# Start development server with Express API + Vite middleware
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### Running Unit Tests

```bash
# Execute pure domain and inventory logic tests
npm test
```

---

## 4. API Endpoints

### `POST /api/analyze-receipt`

Analyzes an uploaded receipt image or preset identifier and returns structured product metadata.

- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/png;base64,...",
    "mimeType": "image/png",
    "presetId": "musinsa-nike-af1",
    "fileName": "order_screenshot.png"
  }
  ```

- **Response**:
  ```json
  {
    "items": [
      {
        "brand": "Nike",
        "name": "Nike Air Force 1 '07 Low White",
        "category": "clothing",
        "purchaseDate": "2026-10-15",
        "price": 139000,
        "currency": "KRW",
        "store": "무신사",
        "quantity": 1,
        "confidence": 0.96,
        "evidence": "Header 'MUSINSA STORE', date '2026-10-15', price '139,000 KRW' verified"
      }
    ],
    "source": "gemini"
  }
  ```

---

## 5. Deployment to Google Cloud Run

The repository includes a production-ready [Dockerfile](Dockerfile) and [.dockerignore](.dockerignore).

### Deploy using Google Cloud CLI:

```bash
# Build from source and deploy to Cloud Run
gcloud run deploy mvp-oneshelf \
  --source . \
  --region asia-northeast3 \
  --project YOUR_PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
```

---

## 6. License

This project was built for the Google DeepMind AI Hackathon 2026.
