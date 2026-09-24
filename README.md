# Product Admin Dashboard

A responsive product administration dashboard built with Next.js, React, Tailwind CSS, Axios, and the DummyJSON API.

## Links

- Live demo: Not deployed yet
- GitHub: https://github.com/Rani-168/product-admin-dashboard

## Tech Stack

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- Axios
- DummyJSON API
- LocalStorage
- Git and GitHub

## Features

### Authentication

- Login through the DummyJSON authentication API
- Demo credentials: `emilys` / `emilyspass`
- Token storage in LocalStorage
- Protected product routes through `AuthGuard`
- Logout and centralized Axios error handling
- Loading and duplicate-submit prevention

### Product Management

- Responsive desktop table and mobile cards
- Product details with image gallery and reviews
- Add, edit, and delete product workflows
- Client-side validation for product forms
- Delete confirmation dialog
- Loading, empty, error, and retry states

### Search, Filtering, and Pagination

- Debounced product search
- Axios request cancellation to prevent stale results
- Category filtering
- Price, rating, and title sorting
- Page sizes of 10, 20, and 50
- URL-based page, search, category, sort, and order state
- Invalid and out-of-range page normalization

## API

All API calls use the shared Axios instance in `services/api.js`.

- `POST /auth/login`
- `GET /products`
- `GET /products/search`
- `GET /products/categories`
- `GET /products/category/{category}`
- `GET /products/{id}`
- `POST /products/add`
- `PATCH /products/{id}`
- `DELETE /products/{id}`

## Project Structure

```text
app/
├── page.js
├── login/page.js
└── products/
    ├── page.js
    ├── ProductsDashboard.js
    ├── add/page.js
    └── [id]/
        ├── page.js
        └── edit/page.js

components/
├── AuthGuard.js
└── ProductForm.js

services/
├── api.js
├── auth.js
├── products.js
└── localProducts.js
```

## Installation

```bash
git clone https://github.com/Rani-168/product-admin-dashboard.git
cd product-admin-dashboard
npm install
npm run dev
```

Open http://localhost:3000.

## Production Build

```bash
npm run build
npm start
```

## Implementation Decisions

### Shared Axios instance

`services/api.js` centralizes the DummyJSON base URL, JSON headers, token injection, and response error logging. UI components call service functions rather than Axios directly.

### URL-based state

Page, page size, search, category, sort, and order values are stored in the URL. This makes dashboard state refreshable and shareable and supports browser navigation naturally.

### Debounced search and cancellation

Search waits 500 ms after the last keystroke before updating the URL. Each product request receives an `AbortSignal`, so a newer search cancels an older request before its response can replace current results.

### Local CRUD persistence

DummyJSON simulates POST, PATCH, and DELETE operations without permanently changing its dataset. The app stores local additions, edits, and deleted IDs in LocalStorage and merges them with API results so CRUD changes remain visible in the dashboard.

### Search and category behavior

DummyJSON exposes separate search and category endpoints. They are mutually exclusive in the UI: selecting a category clears search, and starting a search clears the category.

## Interview Summary

The application flow is:

```text
Login -> Axios auth request -> token in LocalStorage -> protected products

Product list -> URL state -> service function -> shared Axios -> DummyJSON

Search -> debounce -> cancel previous request -> latest results

Add/Edit/Delete -> validate or confirm -> Axios mutation -> LocalStorage overlay
```

## AI Usage

AI tools were used as a development assistant for understanding Next.js and React patterns, reviewing API integration, debugging, exploring edge cases, and preparing project documentation. The implementation was reviewed and tested locally.

## Future Improvements

- Deploy a live demo on Vercel
- Add a real persistent backend database
- Add server-side authentication and authorization
- Add automated unit and integration tests
- Add richer analytics and product image management

## Author

Rani Bhosale  
B.Tech Computer Engineering
