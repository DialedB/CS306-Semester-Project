# Restaurant Manager — CSC306 Final Project

A full-stack web application for managing a restaurant's menu, orders, and customers.
Built with **Angular 21**, **Firebase Realtime Database**, **Bootstrap 5**, and **Chart.js**.

---

## Features

| Feature | Details |
|---------|---------|
| Menu Items | Add, edit, delete, search, filter by category, sort by name/price |
| Orders | Create orders from existing customers + menu items, update status, delete |
| Customers | Full CRUD, top-spender highlight (advanced feature) |
| Dashboard | Live stats: item count, order count, revenue, recent orders, top 3 customers |
| Analytics | Bar chart (popular items), line chart (7-day revenue), doughnut (order statuses), top customers table |

---

## Entities

1. **MenuItem** — `name`, `category`, `price`, `description`, `available`, `orderCount`
2. **Order** — `customerId`, `customerName`, `items[]`, `totalAmount`, `status`, `createdAt`
3. **Customer** — `name`, `email`, `phone`, `totalSpent`, `orderCount`

---

## Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI (`npm install -g @angular/cli`)
- A Firebase project with **Realtime Database** enabled

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Realtime Database** (start in test mode for development).
3. Copy your project config from **Project Settings → Your apps → Firebase SDK snippet**.
4. Paste the config into `src/app/services/firebase.ts` replacing the placeholder values.

---

## Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start development server
ng serve

# 3. Open browser
# http://localhost:4200
```

---

## Building for Production

```bash
ng build
```

Output is placed in `dist/restaurant-manager/`.

---

## Project Structure

```
src/app/
├── components/
│   ├── navbar/          # Navigation bar
│   ├── dashboard/       # Overview stats & top customers
│   ├── menu-items/      # Menu CRUD + search/sort
│   ├── orders/          # Order management + status updates
│   ├── customers/       # Customer CRUD + top-spender highlight
│   └── analytics/       # Chart.js charts + KPI summary
├── models/
│   ├── menu-item.model.ts
│   ├── order.model.ts
│   └── customer.model.ts
├── services/
│   ├── firebase.ts      # Generic Firebase CRUD service
│   ├── menu-item.ts
│   ├── order.ts
│   └── customer.ts
```

---

## Advanced Feature

**Analytics Dashboard** — Chart.js-powered visualisations:
- Most popular menu items (bar chart, top item highlighted in gold)
- 7-day revenue trend (line chart)
- Order status breakdown (doughnut chart)
- Top customers ranked by total spend (table + gold highlight for #1)

Customers who are in the top 25% of spenders are also highlighted with a gold badge throughout the Customers view.

---

## Screenshots

> Add screenshots here after running the app.

---

*CSC306 Advanced Web Development — Spring 1 2026*
