# QuickKart Deployment Guide

This guide will walk you through deploying the QuickKart e-commerce platform, which consists of a Next.js frontend and an Express backend.

## Prerequisites

- GitHub account with your QuickKart repository
- Vercel account (free tier works fine)
- MongoDB Atlas database (or another MongoDB hosting service)

## Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Express + Prisma API deployed on Vercel (serverless functions)
- **Database**: MongoDB (hosted on MongoDB Atlas or similar)

---

## Part 1: Deploy Backend to Vercel

### Step 1: Prepare Backend for Deployment

The backend has been configured with a `vercel.json` file that sets it up as a serverless function.

### Step 2: Deploy Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `Anuragkumar-687/QuickKart`
4. **Important**: Set the **Root Directory** to `backend`
5. Configure environment variables (see below)
6. Click **"Deploy"**

### Step 3: Configure Backend Environment Variables

In the Vercel project settings for your backend, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | (generate a random string) | Secret for JWT token signing |
| `NODE_ENV` | `production` | Environment mode |

**To generate a secure JWT_SECRET**, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Note Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://your-backend-name.vercel.app
```

**Save this URL** - you'll need it for the frontend configuration.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Deploy Frontend

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** again
3. Import the same GitHub repository: `Anuragkumar-687/QuickKart`
4. **Important**: Set the **Root Directory** to `frontend`
5. Configure environment variables (see below)
6. Click **"Deploy"**

### Step 2: Configure Frontend Environment Variables

In the Vercel project settings for your frontend, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-name.vercel.app/api` | Your deployed backend URL + `/api` |
| `NEXTAUTH_URL` | `https://your-frontend-name.vercel.app` | Your deployed frontend URL |
| `NEXTAUTH_SECRET` | (generate a random string) | Secret for NextAuth.js |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string (if used directly in frontend) |

**To generate NEXTAUTH_SECRET**, run:
```bash
openssl rand -base64 32
```

### Step 3: Redeploy Frontend

After adding environment variables:
1. Go to the **"Deployments"** tab
2. Click the three dots on the latest deployment
3. Select **"Redeploy"**

---

## Part 3: Database Setup (MongoDB Atlas)

If you haven't set up MongoDB yet:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel serverless functions
5. Get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
6. Use this connection string for the `DATABASE_URL` environment variable

---

## Part 4: Verification

### Test Backend

Visit your backend URL:
```
https://your-backend-name.vercel.app/
```

You should see: **"QuickKart API is running"**

### Test Frontend

1. Visit your frontend URL: `https://your-frontend-name.vercel.app`
2. Try to register a new user
3. Log in with the registered user
4. Browse products
5. Add items to cart
6. Create an order
7. View orders

---

## Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to database"
- **Solution**: Check that `DATABASE_URL` is correctly set in Vercel environment variables
- **Solution**: Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)

**Problem**: "Module not found" errors
- **Solution**: Make sure `package.json` includes all dependencies
- **Solution**: Try redeploying with cleared build cache

### Frontend Issues

**Problem**: "Failed to fetch" or API errors
- **Solution**: Verify `NEXT_PUBLIC_API_URL` points to your deployed backend
- **Solution**: Check that backend is running and accessible

**Problem**: NextAuth authentication not working
- **Solution**: Ensure `NEXTAUTH_URL` matches your deployed frontend URL
- **Solution**: Verify `NEXTAUTH_SECRET` is set

### CORS Issues

**Problem**: "CORS policy" errors in browser console
- **Solution**: The backend CORS is configured to allow all origins. If issues persist, check browser console for specific error messages.

---

## Alternative: Deploy Backend to Render

If you prefer to deploy the backend to Render instead of Vercel:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add the same environment variables as listed above
6. Click **"Create Web Service"**

Render provides a persistent server (not serverless), which may be better for some use cases.

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:
- Every push to your `main` branch will trigger a new deployment
- You can configure deployment branches in the project settings
- Preview deployments are created for pull requests

---

## Need Help?

If you encounter issues during deployment:
1. Check the Vercel deployment logs for error messages
2. Verify all environment variables are correctly set
3. Ensure your MongoDB database is accessible
4. Check that both frontend and backend are using compatible API endpoints
