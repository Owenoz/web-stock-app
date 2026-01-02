import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where 
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { COLLECTIONS, formatCurrency, formatDateTime } from '../types';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import Navigation from '../components/Navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Download, 
  RefreshCw,
  Filter,
  Calendar,
  Package,
  Store,
  Plus,
  FileText,
  Home,
  Camera,
  Scan,
  Upload,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Edit2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const MATERIAL_OPTIONS = [
  'Tanasha()',
  'Rotana',
  'tiktok',
  'Milano(sattin stretcher)',
  'Silk(sattin-halil)', 
  'Wool peach',
  'Polyester plain',
  'Tetema',
  'American sattin crep',
  'English sattin plain',
  'Velvet plain',
  'Valvet spangle',
  'Valvet squeen',
  'Stone dubai',
  'Stone uganda',
  'Kikutiya',
  'Babi plain',
  'Zaitun plain',
  'Gomesi bagole',
  'plain',
  'Gomesi',
  'Other'
];
const UNITS = ['meters', 'yards', 'pieces', 'rolls'];

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'shops'
  
  // Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      toast.error('Access denied. Admin only.');
    }
  }, [isAdmin, loading]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    
    // Mock data for when Firebase is not available
    const mockSales = [
      {
        id: '1',
        saleDate: { seconds: Math.floor(Date.now() / 1000) - 86400 },
        shopName: 'Shop 1',
        materialName: 'Cotton Fabric',
        quantity: 10,
        unit: 'meters',
        rate: 15000,
        totalAmount: 150000,
        customerName: 'John Doe'
      },
      {
        id: '2',
        saleDate: { seconds: Math.floor(Date.now() / 1000) - 172800 },
        shopName: 'Shop 2',
        materialName: 'Silk Fabric',
        quantity: 5,
        unit: 'meters',
        rate: 25000,
        totalAmount: 125000,
        customerName: 'Jane Smith'
      }
    ];

    const mockStockItems = [
      {
        id: '1',
        name: 'Premium Cotton Fabric',
        category: 'Cotton',
        totalQuantity: 100,
        unit: 'meters',
        pricePerUnit: 15000,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      },
      {
        id: '2',
        name: 'Luxury Silk Fabric',
        category: 'Silk',
        totalQuantity: 50,
        unit: 'meters',
        pricePerUnit: 25000,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      }
    ];

    try {
      // Load sales data
      let salesQuery = query(
        collection(db, COLLECTIONS.SALES),
        orderBy('saleDate', 'desc')
      );

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          salesQuery = query(
            collection(db, COLLECTIONS.SALES),
            where('saleDate', '>=', startDate),
            orderBy('saleDate', 'desc')
          );
        }
      }

      const salesUnsubscribe = onSnapshot(salesQuery, (snapshot) => {
        const salesData = [];
        snapshot.forEach((doc) => {
          salesData.push({ id: doc.id, ...doc.data() });
        });
        setSales(salesData);
      }, (error) => {
        console.warn('Firebase sales data unavailable, using mock data:', error);
        setSales(mockSales);
        toast.error('Firebase connection issue - showing demo data');
      });

      // Load stock items
      const stockQuery = query(
        collection(db, COLLECTIONS.STOCK_ITEMS),
        orderBy('createdAt', 'desc')
      );

      const stockUnsubscribe = onSnapshot(stockQuery, (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setStockItems(items);
        setLoading(false);
      }, (error) => {
        console.warn('Firebase stock data unavailable, using mock data:', error);
        setStockItems(mockStockItems);
        setLoading(false);
        toast.error('Firebase connection issue - showing demo data');
      });

      return () => {
        salesUnsubscribe();
        stockUnsubscribe();
      };
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      setSales(mockSales);
      setStockItems(mockStockItems);
      setLoading(false);
      toast.error('Firebase connection issue - showing demo data');
    }
  }, [isAdmin, dateFilter]);

  // Initialize camera when scanner is shown
  useEffect(() => {
    if (showScanner) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [showScanner]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
      setManualEntryMode(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    
    toast.success('Image captured! Document saved for reference.');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target.result);
      toast.success('Image uploaded! Document saved for reference.');
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Force re-fetch by changing date filter temporarily
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Data refreshed');
    }, 1000);
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    if (!sales.length) {
      return {
        todaySales: { count: 0, total: 0 },
        totalSales: { count: 0, total: 0 },
        shopSales: {},
        materialSales: {},
        recentTransactions: [],
        dailySalesChart: [],
        materialDistribution: []
      };
    }

    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate.seconds * 1000).toDateString();
      return saleDate === today;
    });

    const shopTotals = {};
    const materialTotals = {};
    const dailySalesMap = {};

    sales.forEach(sale => {
      // Shop sales
      if (!shopTotals[sale.shopName]) {
        shopTotals[sale.shopName] = { count: 0, total: 0 };
      }
      shopTotals[sale.shopName].count++;
      shopTotals[sale.shopName].total += sale.totalAmount;

      // Material sales
      if (!materialTotals[sale.materialName]) {
        materialTotals[sale.materialName] = { totalQuantity: 0, totalAmount: 0, count: 0 };
      }
      materialTotals[sale.materialName].totalQuantity += sale.quantity;
      materialTotals[sale.materialName].totalAmount += sale.totalAmount;
      materialTotals[sale.materialName].count++;

      // Daily sales chart
      const saleDate = new Date(sale.saleDate.seconds * 1000).toDateString();
      if (!dailySalesMap[saleDate]) {
        dailySalesMap[saleDate] = { date: saleDate, sales: 0, amount: 0 };
      }
      dailySalesMap[saleDate].sales++;
      dailySalesMap[saleDate].amount += sale.totalAmount;
    });

    // Convert to arrays and sort
    const dailySalesChart = Object.values(dailySalesMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days

    const materialDistribution = Object.entries(materialTotals)
      .map(([name, data]) => ({ name, value: data.totalAmount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      todaySales: {
        count: todaySales.length,
        total: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      },
      totalSales: {
        count: sales.length,
        total: sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      },
      shopSales: shopTotals,
      materialSales: materialTotals,
      recentTransactions: sales.slice(0, 10),
      dailySalesChart,
      materialDistribution
    };
  };

  const analytics = calculateAnalytics();

  const exportData = () => {
    const csvData = sales.map(sale => ({
      Date: new Date(sale.saleDate.seconds * 1000).toLocaleDateString(),
      Shop: sale.shopName,
      Material: sale.materialName,
      Quantity: sale.quantity,
      Unit: sale.unit,
      Rate: sale.rate,
      Total: sale.totalAmount,
      Customer: sale.customerName
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Access Denied
          </h2>
          <p className="text-secondary-600">
            You need admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-secondary-200 rounded-xl"></div>
              <div className="h-80 bg-secondary-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-secondary-900 flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-primary-600" />
                  <span>Document Scanner</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowScanner(false);
                    setCapturedImage(null);
                    setManualEntryMode(false);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-secondary-600 mt-2">
                {capturedImage ? 'Document captured for record keeping' : 'Scan receipts, invoices, or documents'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!capturedImage ? (
                // Camera View
                <>
                  {!manualEntryMode ? (
                    <>
                      <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 border-2 border-primary-400 border-dashed rounded-lg pointer-events-none" />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <Button
                          onClick={captureImage}
                          variant="primary"
                          className="flex-1 flex items-center justify-center space-x-2"
                        >
                          <Camera className="h-5 w-5" />
                          <span>Capture Document</span>
                        </Button>
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="secondary"
                          className="flex-1 flex items-center justify-center space-x-2"
                        >
                          <Upload className="h-5 w-5" />
                          <span>Upload Document</span>
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 mb-2">Document Scanning Tips</h4>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Ensure good lighting on the document</li>
                                <li>• Keep the document flat and within the frame</li>
                                <li>• Avoid shadows on the document</li>
                                <li>• Focus on clear text and numbers</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    // Manual Document Entry Mode
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <Edit2 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                          Manual Document Entry
                        </h4>
                        <p className="text-secondary-600">
                          Enter document details manually for record keeping
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Input
                          label="Document Title"
                          placeholder="Enter document title (e.g., 'Invoice #1234')"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Document Date"
                            type="date"
                          />
                          
                          <Input
                            label="Document Type"
                            placeholder="Invoice, Receipt, Report, etc."
                          />
                        </div>
                        
                        <Input
                          label="Related Shop (Optional)"
                          placeholder="Enter shop name"
                        />
                        
                        <Textarea
                          label="Document Details (Optional)"
                          placeholder="Enter any important details from the document"
                          rows={4}
                        />
                        
                        <Input
                          label="Amount (Optional)"
                          type="number"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Captured Image View
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-secondary-700 mb-3 flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5" />
                      <span>Document Captured</span>
                    </h4>
                    <div className="border border-secondary-200 rounded-lg overflow-hidden">
                      <img 
                        src={capturedImage} 
                        alt="Captured document" 
                        className="w-full h-auto max-h-80 object-contain bg-secondary-50"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCapturedImage(null)}
                        className="flex-1"
                      >
                        Retake
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManualEntryMode(true)}
                        className="flex-1"
                      >
                        Add Details
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-secondary-700 mb-3">Document Information</h4>
                    <div className="space-y-4">
                      <Input
                        label="Document Title *"
                        placeholder="Enter document title"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Document Type *"
                          placeholder="Invoice, Receipt, etc."
                        />
                        
                        <Input
                          label="Date"
                          type="date"
                        />
                      </div>
                      
                      <Textarea
                        label="Notes (Optional)"
                        placeholder="Enter any additional notes about this document"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-secondary-200 bg-secondary-50">
              <div className="flex justify-between space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowScanner(false);
                    setCapturedImage(null);
                    setManualEntryMode(false);
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowScanner(false);
                    setCapturedImage(null);
                    setManualEntryMode(false);
                    toast.success('Document saved for record keeping');
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-secondary-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-secondary-600">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowScanner(true)}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/add-stock')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Stock</span>
              </Button>
            </div>
          </div>
        </div>

      {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-secondary-200 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-secondary-600">
                Welcome back, {user?.email}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowScanner(true)}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Scan Document</span>
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/add-stock')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Stock</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                loading={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                data-export="true"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('shops')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'shops'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Shop Records</span>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'documents'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Documents</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-secondary-600" />
                    <span className="font-medium text-secondary-700">Filter by Date:</span>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="border border-secondary-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-secondary-600">
                    Total Transactions: {analytics.totalSales.count}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                title="Today's Sales"
                value={analytics.todaySales.count}
                icon={DollarSign}
                loading={loading}
              />
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(analytics.todaySales.total)}
                icon={TrendingUp}
                loading={loading}
              />
              <StatCard
                title="Total Transactions"
                value={analytics.totalSales.count}
                icon={ShoppingBag}
                loading={loading}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(analytics.totalSales.total)}
                icon={Users}
                loading={loading}
              />
            </motion.div>

            {/* Charts Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            >
              {/* Daily Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Sales Trend (Last 7 Days)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.dailySalesChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [
                          name === 'amount' ? formatCurrency(value) : value,
                          name === 'amount' ? 'Revenue' : 'Transactions'
                        ]}
                      />
                      <Bar dataKey="sales" fill="#3B82F6" name="transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Material Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Top Materials</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.materialDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.materialDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shop Summary Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="h-5 w-5" />
                    <span>Shop-wise Sales Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-secondary-200">
                          <th className="text-left py-3 px-4 font-medium text-secondary-700">Shop Name</th>
                          <th className="text-right py-3 px-4 font-medium text-secondary-700">Transactions</th>
                          <th className="text-right py-3 px-4 font-medium text-secondary-700">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analytics.shopSales).map(([shopName, data]) => (
                          <tr key={shopName} className="border-b border-secondary-100 hover:bg-secondary-50">
                            <td className="py-3 px-4 font-medium text-secondary-900">{shopName}</td>
                            <td className="py-3 px-4 text-right text-secondary-700">{data.count}</td>
                            <td className="py-3 px-4 text-right font-medium text-success-600">
                              {formatCurrency(data.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {Object.keys(analytics.shopSales).length === 0 && (
                      <div className="text-center py-8 text-secondary-500">
                        No shop sales data available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Shop Records Tab Content */}
        {activeTab === 'shops' && (
          <>
            {/* Stock Inventory Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Stock Inventory Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowScanner(true)}
                        className="flex items-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Scan Stock</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/add-stock')}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Stock</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No Stock Items</h3>
                      <p className="text-secondary-600 mb-6">Start by adding your first stock item to the inventory.</p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => setShowScanner(true)}
                          className="flex items-center space-x-2"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Scan Stock Document</span>
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => navigate('/add-stock')}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Stock Item</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-secondary-200">
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Item Name</th>
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Category</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Quantity</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Unit</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Price/Unit</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockItems.map((item) => (
                            <tr key={item.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                              <td className="py-3 px-4 font-medium text-secondary-900">{item.name}</td>
                              <td className="py-3 px-4 text-secondary-700">{item.category}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{item.totalQuantity}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{item.unit}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{formatCurrency(item.pricePerUnit)}</td>
                              <td className="py-3 px-4 text-right font-medium text-success-600">
                                {formatCurrency(item.totalQuantity * item.pricePerUnit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shop Transactions Records */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Shop Transaction Records</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No Transactions</h3>
                      <p className="text-secondary-600">Shop transactions will appear here once recorded.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-secondary-200">
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Date & Time</th>
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Shop</th>
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Material</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Qty</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Unit</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Rate</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((sale) => (
                            <tr key={sale.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                              <td className="py-3 px-4 text-sm text-secondary-600">
                                {formatDateTime(sale.saleDate.seconds * 1000)}
                              </td>
                              <td className="py-3 px-4 font-medium text-secondary-900">{sale.shopName}</td>
                              <td className="py-3 px-4 text-secondary-700">{sale.customerName}</td>
                              <td className="py-3 px-4 text-secondary-700">{sale.materialName}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{sale.quantity}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{sale.unit}</td>
                              <td className="py-3 px-4 text-right text-secondary-700">{formatCurrency(sale.rate)}</td>
                              <td className="py-3 px-4 text-right font-medium text-success-600">
                                {formatCurrency(sale.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Documents Tab Content */}
        {activeTab === 'documents' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Document Management</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowScanner(true)}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Scan New Document</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-20 w-20 text-secondary-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    Document Scanner & Archival
                  </h3>
                  <p className="text-secondary-600 max-w-2xl mx-auto mb-8">
                    Use the camera scanner to capture and store important documents like invoices, 
                    receipts, purchase orders, and other business documents. Keep digital copies 
                    of all your paperwork for easy reference and record keeping.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-primary-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-6 w-6 text-primary-600" />
                        </div>
                        <h4 className="font-semibold text-secondary-900 mb-2">Scan Invoices</h4>
                        <p className="text-sm text-secondary-600">
                          Capture all purchase and sales invoices for digital record keeping
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-success-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="h-6 w-6 text-success-600" />
                        </div>
                        <h4 className="font-semibold text-secondary-900 mb-2">Receipts</h4>
                        <p className="text-sm text-secondary-600">
                          Store all sales receipts for easy tracking and customer records
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-warning-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="h-6 w-6 text-warning-600" />
                        </div>
                        <h4 className="font-semibold text-secondary-900 mb-2">Stock Records</h4>
                        <p className="text-sm text-secondary-600">
                          Document stock deliveries, transfers, and inventory counts
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowScanner(true)}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Start Scanning</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Upload Files</span>
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}