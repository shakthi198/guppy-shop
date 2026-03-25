# 🐟 GuppyShop — Full-Stack Guppy Fish Store

A production-ready full-stack web app for selling guppy fish, built with **React + MUI** on the frontend and **PHP REST API + MySQL** on the backend.

---

## 🗂️ Project Structure

```
guppy-shop/
├── frontend/                   # React.js app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Root app + routing
│   │   ├── index.js
│   │   ├── theme/
│   │   │   └── theme.js        # MUI custom theme
│   │   ├── context/
│   │   │   ├── AuthContext.js  # JWT auth state
│   │   │   ├── CartContext.js  # Shopping cart state
│   │   │   └── NotificationContext.js  # Real-time notifications
│   │   ├── utils/
│   │   │   └── api.js          # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.js       # Top nav with bell icon
│   │   │   ├── FishCard.js     # Fish product card
│   │   │   └── ProtectedRoute.js
│   │   └── pages/
│   │       ├── LoginPage.js
│   │       ├── RegisterPage.js
│   │       ├── HomePage.js         # Fish catalog
│   │       ├── FishDetailPage.js
│   │       ├── CartPage.js
│   │       ├── CheckoutPage.js     # Razorpay payment
│   │       ├── OrdersPage.js       # Customer orders
│   │       └── AdminDashboard.js   # Full admin panel
│   └── package.json
│
├── backend/                    # PHP REST API
│   ├── index.php               # Router + entry point
│   ├── .htaccess               # URL rewriting
│   ├── config/
│   │   ├── database.php        # MySQL connection
│   │   └── jwt.php             # JWT encode/decode
│   ├── middleware/
│   │   └── auth.php            # Auth + role guards
│   └── controllers/
│       ├── AuthController.php
│       ├── FishController.php
│       ├── OrderController.php
│       ├── NotificationController.php
│       └── UploadController.php
│
└── database/
    └── schema.sql              # Full MySQL schema + seed data
```

---

## 🚀 Local Setup (XAMPP)

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (PHP 8.0+, MySQL 5.7+, Apache)
- [Node.js](https://nodejs.org/) v18+
- npm v9+

---

### Step 1 — Database Setup

1. Start **XAMPP** → Start **Apache** and **MySQL**
2. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Click **"New"** → create database `guppy_shop`
4. Select `guppy_shop` → click **Import**
5. Upload `database/schema.sql` → click **Go**

---

### Step 2 — Backend Setup

1. Copy the entire `backend/` folder to your XAMPP htdocs:
   ```
   C:\xampp\htdocs\guppy-shop\backend\
   ```
   (On Linux/Mac: `/opt/lampp/htdocs/guppy-shop/backend/`)

2. Create uploads folder:
   ```
   C:\xampp\htdocs\guppy-shop\uploads\fish\
   ```

3. Edit `backend/config/database.php` if your MySQL credentials differ:
   ```php
   define('DB_USER', 'root');
   define('DB_PASS', '');        // Your MySQL password
   define('DB_NAME', 'guppy_shop');
   ```

4. Ensure Apache `mod_rewrite` is enabled (it is by default in XAMPP).

5. Test the API: [http://localhost/guppy-shop/backend/fish](http://localhost/guppy-shop/backend/fish)

---

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will open at [http://localhost:3000](http://localhost:3000)

> The `proxy` in `package.json` points to `http://localhost/guppy-shop/backend` — make sure the backend path matches.

---

### Step 4 — Razorpay Setup (Optional)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your **Test Key ID** from Dashboard → Settings → API Keys
3. Replace in `frontend/src/pages/CheckoutPage.js`:
   ```js
   const RAZORPAY_KEY = 'rzp_test_YOUR_KEY_HERE';
   ```

> Without a Razorpay key, use the **"Demo Payment"** button which simulates a successful payment.

---

## 🔑 Default Admin Login

| Field | Value |
|-------|-------|
| Email | admin@guppyshop.com |
| Password | Admin@123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create customer account |
| POST | `/login` | ❌ | Login, returns JWT |
| GET | `/me` | ✅ | Get current user |

### Fish
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/fish` | ❌ | List all fish (supports `?search=&type=`) |
| GET | `/fish/{id}` | ❌ | Get fish details |
| POST | `/fish` | 🔐 Admin | Add new fish |
| PUT | `/fish/{id}` | 🔐 Admin | Update fish |
| DELETE | `/fish/{id}` | 🔐 Admin | Soft delete fish |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | ✅ | Create order after payment |
| GET | `/orders` | ✅ | Admin: all orders / Customer: own orders |
| GET | `/orders/{id}` | ✅ | Order detail with items |
| PUT | `/orders/{id}` | 🔐 Admin | Update order status |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | Get user notifications + unread count |
| POST | `/notifications/read` | ✅ | Mark notifications as read |
| POST | `/notifications` | 🔐 Admin | Broadcast notification |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | 🔐 Admin | Upload fish image (multipart) |

---

## 📦 Sample API Requests

### Register
```bash
curl -X POST http://localhost/guppy-shop/backend/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","phone":"9876543210"}'
```

### Login
```bash
curl -X POST http://localhost/guppy-shop/backend/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@guppyshop.com","password":"Admin@123"}'
```

### Add Fish (Admin)
```bash
curl -X POST http://localhost/guppy-shop/backend/fish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Neon Guppy","type":"Neon","price":199,"stock":25,"description":"Vibrant neon guppy"}'
```

### Get All Fish with Filter
```bash
curl "http://localhost/guppy-shop/backend/fish?type=Fancy&search=dragon"
```

### Place Order
```bash
curl -X POST http://localhost/guppy-shop/backend/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"fish_id": 1, "quantity": 2, "price": 149}],
    "total_amount": 298,
    "payment_id": "pay_test123",
    "shipping_name": "John Doe",
    "shipping_address": "123 MG Road",
    "shipping_pincode": "600001",
    "shipping_phone": "9876543210"
  }'
```

---

## ✨ Feature Summary

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Customer Registration/Login | ✅ |
| Admin Login | ✅ |
| Fish Catalog with Search/Filter | ✅ |
| Fish Detail Page | ✅ |
| Shopping Cart (localStorage) | ✅ |
| Checkout with Razorpay | ✅ |
| Demo Payment Mode | ✅ |
| Order Management (Admin) | ✅ |
| Order Status Updates | ✅ |
| Fish CRUD (Admin) | ✅ |
| Image Upload | ✅ |
| Low Stock Alerts | ✅ |
| Notification Bell (Admin + Customer) | ✅ |
| Polling-based Real-time Notifications | ✅ |
| Admin notified on new order | ✅ |
| Customers notified on new fish | ✅ |
| Customer notified on order status update | ✅ |
| Responsive Design (MUI) | ✅ |
| Password Hashing (bcrypt) | ✅ |
| Input Validation | ✅ |
| Role-based Route Protection | ✅ |

---

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens expire in **24 hours**
- All admin routes require `role = admin` verification server-side
- File uploads validated by **MIME type**, not just extension
- SQL injection prevented via **prepared statements** throughout
- **Change `JWT_SECRET`** in `backend/config/jwt.php` before production!

---

## 📝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, MUI v5, React Router v6, Axios, Notistack |
| Backend | PHP 8, REST API (no framework) |
| Database | MySQL 5.7+ |
| Auth | JWT (custom implementation) |
| Payments | Razorpay (test mode) |
| Fonts | Outfit (Google Fonts) |
| Server | Apache (XAMPP) |
