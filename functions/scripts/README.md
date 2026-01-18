# Populate Categories Script

This script creates default categories in Firebase for a user.

## Usage

1. Make sure you have a service account key file at `functions/service-account-key.json`
2. Run the script with your userId:

```bash
cd functions
npm run populate-categories YOUR_USER_ID
```

Replace `YOUR_USER_ID` with your actual Firebase user ID (e.g., `3zx3WWXBUCUVXgJ4tfc1aXoo6q82`).

## What it creates

The script creates the following categories:

### Expense Categories
- Groceries 🛒
- Food 🍔
- Transport 🚗
- Shopping 🛍️
- Entertainment 🎬
- Bills 💡
- Health ⚕️
- Education 📚
- Travel ✈️
- Utilities 🔌
- Rent 🏠
- Insurance 🛡️
- Clothing 👕
- Gifts 🎁
- Personal 👤
- Other 📦

### Income Categories
- Salary 💰
- Freelance 💼
- Investment 📈
- Bonus 🎉
- Gift 🎁
- Refund ↩️
- Other 💵

All categories will be associated with your userId and can be used by the AI agent.
