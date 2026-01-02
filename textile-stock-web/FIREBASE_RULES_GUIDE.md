# 🔧 Firebase Permission Error Fix Guide

## 🚨 **Issue Identified**
```
Firestore (10.14.1): Uncaught Error in snapshot listener: 
FirebaseError: [code=permission-denied]: Missing or insufficient permissions
```

## 🎯 **Root Cause**
The Firebase Firestore security rules are not properly configured or deployed, preventing access to the database collections.

## ✅ **Solution Steps**

### **Step 1: Deploy Firestore Rules**

You need to deploy the security rules I created to your Firebase project:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase (this will open browser for authentication)
firebase login

# Navigate to your project directory
cd /home/owenoz/textile-stock-web

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### **Step 2: Verify Firebase Project**

Make sure you're connected to the correct Firebase project:
```bash
# Check current project
firebase projects:list

# Set project if needed
firebase use textile-shop-app
```

### **Step 3: Create Required Collections**

The Firestore collections might not exist yet. Here's what you need:

#### **Collections to Create:**
1. **`stock_items`** - For storing inventory items
2. **`sales`** - For storing shop transactions  
3. **`users`** - For user information (optional)

#### **How to Create Collections:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `textile-shop-app`
3. Click on "Firestore Database"
4. Click "Create Collection"
5. Create the collections mentioned above
6. For each collection, you can add a test document or leave empty

### **Step 4: Test Authentication**

The permission rules I created require authentication:
```javascript
// Make sure users are properly authenticated
// The current login credentials are:
// Admin: admin@textile.com / password
// Shop: shop1@textile.com / password
```

## 📋 **Security Rules Created**

I've created `firestore.rules` with these permissions:
- **Authenticated users only**: All operations require user login
- **Read/Write access**: For authenticated users to stock_items, sales, and users collections
- **Wildcard matching**: Applies to all documents in the collections

## 🔧 **Alternative Quick Fix**

If you want to temporarily disable rules for testing:
```javascript
// In firestore.rules (NOT RECOMMENDED FOR PRODUCTION)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORARY - REMOVE FOR PRODUCTION
    }
  }
}
```

## ⚡ **Immediate Actions Required**

1. **Deploy rules**: `firebase deploy --only firestore:rules`
2. **Create collections**: Add stock_items and sales collections in Firebase Console
3. **Test login**: Verify authentication works with provided credentials
4. **Restart dev server**: Stop and restart `npm run dev`

## 🎯 **Expected Result**

After these steps:
- ✅ No more permission errors
- ✅ AddStock functionality will work
- ✅ Dashboard data will load properly
- ✅ Tab navigation will work correctly

## 📞 **If Issues Persist**

If you still encounter issues:
1. Check Firebase Console for any error messages
2. Verify the project ID matches: `textile-shop-app`
3. Ensure you're logged into the correct Google account
4. Check browser console for additional error details

---

**The Firebase rules file has been created and configured. You just need to deploy them to fix the permission error!** 🚀

