# 💰 ApexUPI - Payments App

A secure, high-performance, full-stack UPI payments application. It enables instant account creation, secure login, card or bank account enrollment via a PCI-DSS compliant dynamic details form, single-click wallet funding, and peer-to-peer money transfers using custom virtual payment addresses (UPI IDs) with real-time balance calculations.

---

## 🛠️ Technology Stack

| Component | Tech Stack | Key Packages / Libraries |
|---|---|---|
| **Frontend** | React.js (V18), React Router (V6) | Styled Components, Lucide React Icons, Axios, QRCode.react |
| **Backend** | Node.js (V18), Express.js | CORS, JWT (jsonwebtoken), bcryptjs password hashing |
| **Database** | SQLite (Relational DB) | better-sqlite3 (High-performance native driver) |
| **Testing** | Jest, Supertest | Integration & API testing |
| **Styling** | Styled Components | Custom theme variables, responsive UI layouts, clean light theme |

---

## ⚙️ How This Application Works

The application operates as a three-tier architecture: a dynamic React Single-Page Application (SPA) client, a RESTful Node/Express server, and an SQLite database with relational schemas.

```
┌─────────────────┐       HTTP Requests       ┌──────────────────┐       SQL Query       ┌─────────────────┐
│   React Client  │ ────────────────────────> │  Express Server  │ ────────────────────> │ SQLite Database │
│   (Vite SPA)    │ <──────────────────────── │  (Node.js REST)  │ <──────────────────── │   (wallet.db)   │
└─────────────────┘       JSON Responses      └──────────────────┘     Result Rows       └─────────────────┘
```

### 1. Security & Authentication Flow
* **Registration:** Users sign up with their email, names, phone numbers, and passwords. The backend automatically hashes the passwords using `bcryptjs` (10 salt rounds) before storing them. It also auto-assigns a unique UPI handle (e.g., `firstnameusername@upi`).
* **Authentication:** Login endpoints verify credentials and return a signed JSON Web Token (JWT).
* **Route Protection:** On the frontend, a React Context-based `AuthContext` holds the logged-in state. Routes are guarded via a custom `ProtectedRoute` wrapper. If the token expires or is omitted, requests fail with a `401 Unauthorized` response and the user is redirected to the Login page.
* **Axios Interceptor:** An Axios interceptor automatically appends the user's JWT bearer token to the header of every outgoing API request.

---

### 2. Payment Method Enrollment & Wallet Funding Flow
To add money to the wallet balance, users must associate either a bank account or a credit/debit card. 
* **Dynamic Details Form:** If a user chooses to use a new bank account or card, they are prompted to fill out a secure, dynamic details form:
  * **Bank Accounts:** Collects Bank Name, Account Holder Name, Account Number (validated to 9–18 digits), and IFSC Code (exactly 11 characters).
  * **Credit / Debit Cards:** Collects Card Issuer, Cardholder Name, Card Number (formatted with real-time spaces `xxxx xxxx xxxx xxxx`), Expiry Date (formatted as `MM/YY`), and CVV (3 digits, masked).
* **Double-Step Atomic Funding:** When the user clicks "Add Money":
  1. The client sends a `POST` request to `/api/wallet/payment-methods` to register the details. For compliance, only the last four digits, the provider, and the holder's name are saved in the SQLite table.
  2. Upon successful registration, the client immediately triggers a second `POST` request to `/api/wallet/add-money` using the newly generated payment method ID.
  3. The backend updates the user's wallet balance inside a safe SQL transaction, issues a unique transaction reference ID starting with `ADD`, and adds a record of type `'added'`.

---

### 3. Instant Peer-to-Peer Transfer Flow
Users can search for any recipient using their UPI handle, first name, or last name, and execute an immediate transfer of funds.

* **Single-Row Relational Ledger:** Unlike legacy systems that write duplicated entries for a transfer, this engine creates a single row in the database with the `sender_id` pointing to the sender and the `receiver_id` pointing to the recipient, with the transaction type labeled as `'sent'`.
* **Atomic Deduct & Credit:** The transfer is executed inside a database transaction block. If the sender's balance is sufficient:
  * The sender's balance is decremented.
  * The recipient's balance is incremented.
  * Exactly one ledger row is written. If any query fails, the entire transaction is rolled back.

---

### 4. Automatic Relative History Translation
When retrieving transaction logs via `/api/wallet/transactions`, the server queries all records where `sender_id = ID OR receiver_id = ID`. It then translates the ledger dynamically relative to the current logged-in user:
* **As a Sender:** The transaction is returned as type `'sent'`. The system shows a negative sign (`-₹amount`), applies a red style, formats the default note as `"Sent to [Recipient]"`, and outputs the recipient's details as the counterparty.
* **As a Receiver:** The transaction is translated on-the-fly to type `'received'`. The system shows a positive sign (`+₹amount`), applies a green style, formats the default note as `"Received from [Sender]"`, and outputs the sender's details as the counterparty.
* **As an Add-Money Action:** The transaction is displayed as type `'added'` (positive sign, blue style).

This prevents any database duplicate entries while guaranteeing that sender and receiver see perfectly balanced, personalized debits and credits in their activity feeds.

---

## 👥 Demo Contacts & Live Transaction Walkthrough

The application's SQLite database is pre-seeded with multiple demo profiles. Every profile is configured with the standard login password: **`pass123`**

| Demo Contact | Email Login | UPI ID Handle | Initial Seeded Balance |
| :--- | :--- | :--- | :--- |
| **Arjun Mehta** | `arjun@example.com` | `arjunmehta@upi` | ₹5,000.00 |
| **Priya Patel** | `priya@example.com` | `priyapatel@upi` | ₹5,000.00 |
| **Rahul Sharma** | `rahul@example.com` | `rahulsharma@upi` | ₹5,000.00 |
| **Sneha Reddy** | `sneha@example.com` | `snehareddy@upi` | ₹5,000.00 |

### Walkthrough Scenario: Transferring ₹1,500 from Arjun to Priya

To observe the real-time balance calculations and dynamic relative ledger rendering in action, execute the following steps:

#### Step 1: Log in as Arjun Mehta (The Sender)
1. Open the application in your browser.
2. Log in using Arjun's email `arjun@example.com` and password `pass123`.
3. Arjun's dashboard will load, displaying an available balance of **₹5,000.00**.

#### Step 2: Search and Send Payment
1. Click on the **Send** option under Quick Actions.
2. In the Search input, type `"Priya"`. The search filter will instantly query and render Priya Patel's contact card.
3. Click her contact card. 
4. Enter the transfer amount: **`1500`**
5. Enter a custom note: `"Dinner split last night"`
6. Click **Pay ₹1,500**.
7. The success screen will display with a confirmation checkmark and updated balance readouts.

#### Step 3: Verify Arjun's Updated State
1. Navigate back to Arjun's Dashboard. 
2. His available wallet balance has atomically decremented to **₹3,500.00**.
3. Under **Recent Activity**, the transfer shows up cleanly with the receiver named as the counterparty, a negative amount of **`-₹1,500`** (styled in debit red), and the custom transfer note.

#### Step 4: Log in as Priya Patel (The Receiver)
1. Navigate to **Profile** and click **Log Out**.
2. Log in using Priya's email `priya@example.com` and password `pass123`.
3. Priya's dashboard loads, displaying her updated wallet balance of **₹6,500.00** (her initial ₹5,000 plus the ₹1,500 sent by Arjun).
4. Under her **Recent Activity**, the exact same transaction (matching reference ID) dynamically renders as a credit of **`+₹1,500`** (styled in credit green), indicating her receipt of funds with Arjun Mehta listed as her transaction counterparty.

---

## 📁 Repository Structure

```
ApexUPI/
├── server/                          # Node/Express Backend
│   ├── app.js                       # Server entry point
│   ├── seed.js                      # DB reset and user seeder
│   ├── config/
│   │   └── db.js                    # SQLite database creation & relational tables
│   ├── middleware/
│   │   └── auth.js                  # JWT guard & verified user validator
│   ├── routes/
│   │   ├── auth.js                  # Auth routing (Register, Login, Me)
│   │   └── wallet.js                # Core balance, funding, and ledger transfer routes
│   └── tests/
│       └── app.test.js              # Jest integration testing suite
│
└── client/                          # React Frontend
    ├── vite.config.js               # Vite environment config
    └── src/
        ├── App.jsx                  # Main router setup
        ├── context/
        │   └── AuthContext.jsx       # Global JWT state and notification dispatcher
        ├── components/
        │   ├── Layout.jsx            # Shell header and navigation tabs
        │   ├── ProtectedRoute.jsx    # Auth middleware guard
        │   └── SharedStyles.jsx      # Clean blue color theme & shared styles
        ├── pages/
        │   ├── Login.jsx             # User login page
        │   ├── Register.jsx          # Register account page
        │   ├── Dashboard.jsx         # Balance card, quick actions, and payment methods
        │   ├── AddMoney.jsx          # Security form for card/bank dynamic entries
        │   ├── SendMoney.jsx         # Instant search & UPI payment desk
        │   ├── ReceiveMoney.jsx      # QR code payment console
        │   ├── Transactions.jsx      # Dynamic filter and transactional ledgers
        │   └── Profile.jsx           # User statistics and configuration settings
        └── utils/
            └── api.js                # Axios setup with auth header interceptor
```

---

## 🔌 API Route Schema

### 🔑 Authentication Routes (`/api/auth`)
* `POST /register` — Create account and hash passwords with bcrypt.
* `POST /login` — Authenticate credentials and return signed JWTs.
* `GET /me` — Get current logged-in user profile (JWT protected).

### 💳 Wallet & Ledger Routes (`/api/wallet`)
* `GET /balance` — Get current wallet balance (JWT protected).
* `POST /add-money` — Fund balance using validated payment method IDs (JWT protected).
* `POST /send` — Transfer money atomically to recipients by UPI ID (JWT protected).
* `GET /transactions` — Fetch dynamically translated relative ledgers (JWT protected).
* `GET /payment-methods` — List registered bank or card methods (JWT protected).
* `POST /payment-methods` — Register a card or bank details with database (JWT protected).
* `DELETE /payment-methods/:id` — Delete a payment method from profile (JWT protected).
* `GET /search-users` — Search for transaction recipients dynamically (JWT protected).

---

## 🧪 Testing Suite

We use Jest and Supertest to verify authentication logic, payment method registration, and relative transaction flow ledger rules.

### How to Run Tests
Navigate to the server directory and execute the test command:
```bash
cd server
npm test
```

### Verified Test Cases Include:
1. **System Health:** Confirms the service responds to ping requests.
2. **Auth Handling:** Validates login failure on bad passwords, and retrieves proper profiles with valid JWTs.
3. **Strict Funding Rules:** Ensures adding money fails if no payment method is provided, fails if an invalid ID is provided, and succeeds only when a correctly matching payment ID is supplied.
4. **Relative Ledger Translation:** Simulates a live peer-to-peer transfer from user A to B, verifying that user A's ledger renders as a `'sent'` debit with B as the counterparty, and user B's ledger renders as a `'received'` credit with A as the counterparty, with zero double-writing in the database.

---

## 🚀 Running This Project Locally

To set up the application on your computer, follow these simple commands in order:

### 1. Set Up and Start the Backend
```bash
cd server
npm install
npm run seed      # Resets DB and seeds test profiles
npm start         # Starts backend API on port 5000
```

### 2. Set Up and Start the Frontend
```bash
cd client
npm install
npm run dev       # Starts local Vite development server on port 5173
```

Now, navigate to **http://localhost:5173** to log in and use the application!
