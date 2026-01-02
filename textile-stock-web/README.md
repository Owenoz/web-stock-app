# NAKASOGA TEXTILES - Premium Stock Management System

A modern, premium web application for managing textile inventory and sales. This is the web version of the original React Native mobile app, enhanced with premium UI/UX and advanced features.

## 🌟 Features

### Core Functionality (Preserved from Original App)
- **Role-based Authentication**: Admin and Shop user roles
- **Admin Dashboard**: Comprehensive sales analytics and reporting
- **Shop Dashboard**: Transaction recording and management
- **Stock Management**: Add and track inventory items
- **Real-time Data Sync**: Live updates across all users
- **Firebase Backend**: Same database structure as original app

### Premium Enhancements
- **Modern UI/UX**: Clean, professional design with Tailwind CSS
- **Interactive Charts**: Sales trends and material distribution visualizations
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Advanced Tables**: Sortable, filterable data tables
- **Export Functionality**: Download reports as CSV
- **Real-time Notifications**: Toast notifications for user feedback
- **Dark/Light Theme Support**: Modern theme switching capability
- **Loading States**: Professional loading indicators
- **Form Validation**: Enhanced input validation with error handling

## 🚀 Technology Stack

- **Frontend**: React 18 with modern hooks
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore + Auth)
- **Package Manager**: npm

## 📁 Project Structure

```
textile-stock-web/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Base UI components (Button, Input, Card, Modal)
│   ├── pages/              # Main page components
│   │   ├── Login.jsx       # Login page
│   │   ├── AdminDashboard.jsx  # Admin interface
│   │   ├── ShopDashboard.jsx   # Shop interface
│   │   └── AddStock.jsx    # Stock management
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.js      # Authentication hook
│   ├── services/           # External services
│   │   └── firebase.js     # Firebase configuration
│   ├── types/              # Type definitions and utilities
│   │   └── index.js        # Data models and helpers
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles and Tailwind imports
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔐 Authentication

The app uses the same Firebase backend as the original React Native app. User roles are determined by email:

- **Admin Users**: Emails containing "admin" (e.g., admin@textile.com)
- **Shop Users**: All other email addresses

### Demo Credentials
- **Admin**: admin@textile.com / password
- **Shop**: shop@textile.com / password

## 📊 Key Features by Role

### Admin Dashboard
- **Sales Analytics**: Today's and total sales statistics
- **Interactive Charts**: 
  - Sales trend over time (bar chart)
  - Material distribution (pie chart)
- **Shop-wise Reports**: Sales breakdown by shop
- **Recent Transactions**: Latest sales across all shops
- **Data Export**: Download sales reports as CSV
- **Real-time Updates**: Live data synchronization
- **Advanced Filtering**: Date range filters

### Shop Dashboard
- **Transaction Recording**: Easy-to-use sales form
- **Material Selection**: Pre-defined textile categories
- **Real-time Calculations**: Automatic amount computation
- **Transaction History**: Personal sales records
- **Edit/Delete**: Full transaction management
- **Customer Tracking**: Optional customer name field
- **Daily Stats**: Today's sales summary

### Stock Management (Admin)
- **Add New Stock**: Comprehensive stock entry form
- **Category Management**: Organized textile categories
- **Inventory Tracking**: Real-time stock levels
- **Value Calculation**: Automatic inventory valuation
- **Unit Management**: Multiple measurement units

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main actions and navigation
- **Secondary**: Slate (#64748B) - Text and backgrounds
- **Success**: Green (#22C55E) - Positive actions and amounts
- **Warning**: Orange (#F59E0B) - Warnings and alerts
- **Danger**: Red (#EF4444) - Destructive actions
- **Neutral**: Various shades of gray for UI elements

### Typography
- **Primary Font**: Inter - Clean, readable sans-serif
- **Display Font**: Lexend - Modern headings

### Components
- **Cards**: Elevated containers with subtle shadows
- **Buttons**: Multiple variants (primary, secondary, success, etc.)
- **Inputs**: Consistent form fields with validation
- **Modals**: Overlay dialogs for confirmations and forms
- **Tables**: Sortable data tables with hover states

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase account (same as original app)

### Installation
```bash
cd textile-stock-web
npm install
```

### Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

### Code Style
- ESLint configuration for consistent code style
- Prettier integration for code formatting
- Tailwind CSS for utility-first styling

## 🔗 Firebase Configuration

The app uses the same Firebase project as the original React Native app:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA7CiM0w89CRZF-o6VQCVeKrEtjrAmdSV8",
  authDomain: "textile-shop-app.firebaseapp.com",
  projectId: "textile-shop-app",
  storageBucket: "textile-shop-app.firebasestorage.app",
  messagingSenderId: "628122484474",
  appId: "1:628122484474:web:c63221e789e65fc2c9d343",
  measurementId: "G-QG2LBCL3ZH"
};
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebars and multi-column layouts
- **Tablet**: Adapted layouts with collapsible navigation
- **Mobile**: Touch-friendly interface with optimized forms and navigation

## 🔒 Security

- Firebase Authentication for secure user management
- Role-based access control
- Protected routes for sensitive areas
- Input validation and sanitization
- Secure API calls through Firebase SDK

## 📈 Performance

- **Vite**: Lightning-fast development and building
- **Code Splitting**: Lazy loading for optimal performance
- **Tree Shaking**: Automatic dead code elimination
- **Optimized Bundle**: Minified and compressed production builds
- **Caching**: Efficient asset caching strategies

## 🚀 Deployment

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- Firebase Hosting
- GitHub Pages
- AWS S3 + CloudFront

## 📄 License

This project maintains the same license as the original React Native app.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please refer to the original app documentation or create an issue in the repository.

---

**NAKASOGA TEXTILES** - Premium Stock Management System  
*Professional textile inventory and sales management for modern businesses*
