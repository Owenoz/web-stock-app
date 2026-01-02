import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { COLLECTIONS, formatCurrency, formatDateTime } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import Navigation from '../components/Navigation';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calculator, 
  Package, 
  User,
  ShoppingCart,
  Save,
  X,
  Camera,
  Scan,
  Upload,
  Check,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function ShopDashboard() {
  const { user, logout, isShop } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    rate: '',
    quantity: '',
    unit: 'meters',
    customerName: ''
  });
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  
  // Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanData, setScanData] = useState({
    materialName: '',
    rate: '',
    quantity: '',
    unit: 'meters',
    customerName: '',
    notes: ''
  });
  const [manualEntryMode, setManualEntryMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const shopName = 'Shop 1'; // Default shop name

  // Redirect if not shop user
  useEffect(() => {
    if (!isShop && !loading) {
      toast.error('Access denied. Shop users only.');
    }
  }, [isShop, loading]);

  // Load user transactions
  useEffect(() => {
    if (!isShop) return;

    setLoading(true);
    const transactionsQuery = query(
      collection(db, COLLECTIONS.SALES),
      where('userId', '==', user?.uid || 'unknown')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsData.sort((a, b) => 
        b.saleDate.seconds - a.saleDate.seconds
      ));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isShop, user]);

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
    setIsScanning(false);
    
    toast.success('Image captured! Now fill in the details.');
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
      setIsScanning(false);
      toast.success('Image uploaded! Now fill in the details.');
    };
    reader.readAsDataURL(file);
  };

  const applyScanData = () => {
    // Apply scanned data to form
    if (scanData.materialName) {
      setFormData(prev => ({
        ...prev,
        materialName: scanData.materialName,
        rate: scanData.rate || prev.rate,
        quantity: scanData.quantity || prev.quantity,
        unit: scanData.unit || prev.unit,
        customerName: scanData.customerName || prev.customerName
      }));
    }
    
    setShowScanner(false);
    if (!showForm) {
      setShowForm(true);
    }
    
    toast.success('Scan data applied to form!');
    
    // Reset scanner state
    setCapturedImage(null);
    setScanData({
      materialName: '',
      rate: '',
      quantity: '',
      unit: 'meters',
      customerName: '',
      notes: ''
    });
    setManualEntryMode(false);
  };

  const handleScanDataChange = (field, value) => {
    setScanData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateAmount = () => {
    const rate = parseFloat(formData.rate) || 0;
    const quantity = parseFloat(formData.quantity) || 0;
    return (rate * quantity).toFixed(2);
  };

  const calculateScanAmount = () => {
    const rate = parseFloat(scanData.rate) || 0;
    const quantity = parseFloat(scanData.quantity) || 0;
    return (rate * quantity).toFixed(2);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.materialName.trim()) {
      newErrors.materialName = 'Material name is required';
    }
    
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Please enter a valid rate';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCalculating(true);
    try {
      const rate = parseFloat(formData.rate);
      const quantity = parseFloat(formData.quantity);
      const totalAmount = parseFloat(calculateAmount());

      if (editingTransaction) {
        // Update existing transaction
        await updateDoc(doc(db, COLLECTIONS.SALES, editingTransaction.id), {
          materialName: formData.materialName.trim(),
          rate,
          quantity,
          unit: formData.unit,
          customerName: formData.customerName.trim() || 'Walk-in Customer',
          totalAmount,
          updatedAt: Timestamp.now(),
        });

        toast.success('Transaction updated successfully!');
        setEditingTransaction(null);
      } else {
        // Create new transaction
        await addDoc(collection(db, COLLECTIONS.SALES), {
          materialName: formData.materialName.trim(),
          rate,
          quantity,
          unit: formData.unit,
          customerName: formData.customerName.trim() || 'Walk-in Customer',
          totalAmount,
          shopName,
          userId: user?.uid || 'unknown',
          saleDate: Timestamp.now(),
          createdAt: Timestamp.now(),
          day: new Date().toISOString().split('T')[0],
        });

        toast.success('Transaction recorded successfully!');
      }

      // Reset form
      setFormData({
        materialName: '',
        rate: '',
        quantity: '',
        unit: 'meters',
        customerName: ''
      });
      setShowForm(false);
      
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Failed to save transaction');
    } finally {
      setCalculating(false);
    }
  };

  const startEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      materialName: transaction.materialName,
      rate: transaction.rate.toString(),
      quantity: transaction.quantity.toString(),
      unit: transaction.unit,
      customerName: transaction.customerName || ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setFormData({
      materialName: '',
      rate: '',
      quantity: '',
      unit: 'meters',
      customerName: ''
    });
    setShowForm(false);
    setErrors({});
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.SALES, transactionId));
      toast.success('Transaction deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Calculate today's stats
  const todayStats = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.saleDate.seconds * 1000).toDateString();
    return transactionDate === new Date().toDateString();
  });

  const totalToday = todayStats.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

  if (!isShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Access Denied
          </h2>
          <p className="text-secondary-600">
            You need shop privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
            <div className="h-32 bg-secondary-200 rounded-xl"></div>
            <div className="h-64 bg-secondary-200 rounded-xl"></div>
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
                  <span>Scan Receipt/Invoice</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowScanner(false);
                    setCapturedImage(null);
                    setScanData({
                      materialName: '',
                      rate: '',
                      quantity: '',
                      unit: 'meters',
                      customerName: '',
                      notes: ''
                    });
                    setManualEntryMode(false);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-secondary-600 mt-2">
                {capturedImage ? 'Fill in the details from the scanned image' : 'Point camera at receipt or invoice'}
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
                          <span>Capture Image</span>
                        </Button>
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="secondary"
                          className="flex-1 flex items-center justify-center space-x-2"
                        >
                          <Upload className="h-5 w-5" />
                          <span>Upload Image</span>
                        </Button>
                        
                        <Button
                          onClick={() => setManualEntryMode(true)}
                          variant="outline"
                          className="flex-1 flex items-center justify-center space-x-2"
                        >
                          <Edit2 className="h-5 w-5" />
                          <span>Manual Entry</span>
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
                    </>
                  ) : (
                    // Manual Entry Mode
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <Edit2 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                          Manual Entry Mode
                        </h4>
                        <p className="text-secondary-600">
                          Enter the details from your receipt manually
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Input
                          label="Material Name"
                          placeholder="Enter material name from receipt"
                          value={scanData.materialName}
                          onChange={(e) => handleScanDataChange('materialName', e.target.value)}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Rate per Unit (UGX)"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={scanData.rate}
                            onChange={(e) => handleScanDataChange('rate', e.target.value)}
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Quantity
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={scanData.quantity}
                                onChange={(e) => handleScanDataChange('quantity', e.target.value)}
                                className="flex-1"
                              />
                              <select
                                value={scanData.unit}
                                onChange={(e) => handleScanDataChange('unit', e.target.value)}
                                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {UNITS.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <Input
                          label="Customer Name (Optional)"
                          placeholder="Enter customer name"
                          value={scanData.customerName}
                          onChange={(e) => handleScanDataChange('customerName', e.target.value)}
                        />
                        
                        <Textarea
                          label="Additional Notes (Optional)"
                          placeholder="Any additional information from the receipt"
                          value={scanData.notes}
                          onChange={(e) => handleScanDataChange('notes', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Captured Image View with Data Entry
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Captured Image */}
                    <div>
                      <h4 className="font-medium text-secondary-700 mb-3 flex items-center space-x-2">
                        <ImageIcon className="h-5 w-5" />
                        <span>Captured Image</span>
                      </h4>
                      <div className="border border-secondary-200 rounded-lg overflow-hidden">
                        <img 
                          src={capturedImage} 
                          alt="Captured receipt" 
                          className="w-full h-auto max-h-64 object-contain bg-secondary-50"
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
                          Switch to Manual
                        </Button>
                      </div>
                    </div>
                    
                    {/* Data Entry Form */}
                    <div>
                      <h4 className="font-medium text-secondary-700 mb-3">Enter Details from Image</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Material Name *
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                            {MATERIAL_OPTIONS.map((material) => (
                              <button
                                key={material}
                                type="button"
                                className={`p-2 text-sm rounded-lg border transition-all ${
                                  scanData.materialName === material
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-secondary-700 border-secondary-300 hover:border-primary-400'
                                }`}
                                onClick={() => handleScanDataChange('materialName', material)}
                              >
                                {material}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Rate per Unit (UGX) *"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={scanData.rate}
                            onChange={(e) => handleScanDataChange('rate', e.target.value)}
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Quantity *
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={scanData.quantity}
                                onChange={(e) => handleScanDataChange('quantity', e.target.value)}
                                className="flex-1"
                              />
                              <select
                                value={scanData.unit}
                                onChange={(e) => handleScanDataChange('unit', e.target.value)}
                                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {UNITS.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <Input
                          label="Customer Name (Optional)"
                          placeholder="Enter customer name from receipt"
                          value={scanData.customerName}
                          onChange={(e) => handleScanDataChange('customerName', e.target.value)}
                        />
                        
                        {scanData.rate && scanData.quantity && (
                          <Card className="bg-success-50 border-success-200">
                            <div className="text-center p-3">
                              <p className="text-sm text-success-700 mb-1">Total Amount</p>
                              <p className="text-xl font-bold text-success-800">
                                {formatCurrency(parseFloat(calculateScanAmount()))}
                              </p>
                            </div>
                          </Card>
                        )}
                      </div>
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
                    setScanData({
                      materialName: '',
                      rate: '',
                      quantity: '',
                      unit: 'meters',
                      customerName: '',
                      notes: ''
                    });
                    setManualEntryMode(false);
                  }}
                >
                  Cancel
                </Button>
                
                {capturedImage || manualEntryMode ? (
                  <Button
                    variant="primary"
                    onClick={applyScanData}
                    disabled={!scanData.materialName || !scanData.rate || !scanData.quantity}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Apply to Form
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setManualEntryMode(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Enter Manually
                  </Button>
                )}
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
                Shop Dashboard
              </h1>
              <p className="text-sm text-secondary-600">
                {shopName} • {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-secondary-200 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">
                Shop Dashboard
              </h1>
              <p className="text-sm text-secondary-600">
                {shopName} • {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-secondary-900">{todayStats.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-success-600">{formatCurrency(totalToday)}</p>
                </div>
                <div className="p-3 bg-success-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <Package className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Transaction Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {!showForm ? (
              <Card>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Record New Transaction
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Add a new sales transaction to your records
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setShowForm(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Transaction</span>
                    </Button>
                    <Button
                      onClick={() => setShowScanner(true)}
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan Receipt</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>{editingTransaction ? 'Edit Transaction' : 'Record Sales Transaction'}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowScanner(true)}
                        className="flex items-center space-x-1"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Scan</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Name */}
                    <Input
                      label="Customer Name (Optional)"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      icon={User}
                    />

                    {/* Material Name */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Material Name *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MATERIAL_OPTIONS.map((material) => (
                          <button
                            key={material}
                            type="button"
                            className={`p-3 text-sm rounded-lg border transition-all ${
                              formData.materialName === material
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-secondary-700 border-secondary-300 hover:border-primary-400'
                            }`}
                            onClick={() => handleInputChange('materialName', material)}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                      {errors.materialName && (
                        <p className="text-sm text-danger-600 mt-1">{errors.materialName}</p>
                      )}
                    </div>

                    {/* Rate and Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Rate per Unit (UGX) *"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.rate}
                        onChange={(e) => handleInputChange('rate', e.target.value)}
                        error={errors.rate}
                      />

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Quantity *
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            error={errors.quantity}
                            className="flex-1"
                          />
                          <select
                            value={formData.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                            className="px-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Amount Preview */}
                    {formData.rate && formData.quantity && (
                      <Card className="bg-success-50 border-success-200">
                        <div className="text-center">
                          <p className="text-sm text-success-700 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-success-800">
                            {formatCurrency(parseFloat(calculateAmount()))}
                          </p>
                          <p className="text-sm text-success-600 mt-1">
                            {formData.quantity} {formData.unit} × {formatCurrency(parseFloat(formData.rate))} = {formatCurrency(parseFloat(calculateAmount()))}
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={calculating}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      {editingTransaction ? (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Update Transaction</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Record Transaction</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Transactions List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span>My Transactions ({transactions.length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScanner(true)}
                      className="flex items-center space-x-1"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Quick Scan</span>
                    </Button>
                  </div>
                  {totalTransactions > 0 && (
                    <span className="text-sm font-normal text-secondary-600">
                      Total: {formatCurrency(totalRevenue)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      Start by recording your first sales transaction
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add First Transaction</span>
                      </Button>
                      <Button
                        onClick={() => setShowScanner(true)}
                        variant="secondary"
                        className="flex items-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Scan Receipt</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-secondary-900">
                                {transaction.materialName}
                              </h4>
                              <p className="text-sm text-secondary-600">
                                {transaction.customerName} • {transaction.quantity} {transaction.unit}
                              </p>
                              <p className="text-sm text-secondary-500">
                                {formatDateTime(transaction.saleDate.seconds * 1000)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-success-600">
                                {formatCurrency(transaction.totalAmount)}
                              </p>
                              <p className="text-sm text-secondary-500">
                                {transaction.quantity} × {formatCurrency(transaction.rate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(transaction)}
                            className="text-warning-600 hover:text-warning-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-danger-600 hover:text-danger-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}