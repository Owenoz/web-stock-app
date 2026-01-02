import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { COLLECTIONS, StockItem, generateId } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import Navigation from '../components/Navigation';
import { 
  Plus, 
  Package, 
  ArrowLeft, 
  Save, 
  DollarSign,
  Hash,
  Tag,
  Ruler
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Cotton',
  'Silk',
  'Wool',
  'Polyester',
  'Linen',
  'Denim',
  'Velvet',
  'Satin',
  'Chiffon',
  'Jersey',
  'Other'
];

const UNITS = ['pieces', 'meters', 'kg', 'yards', 'rolls'];

export default function AddStock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    totalQuantity: '',
    pricePerUnit: '',
  });
  const [errors, setErrors] = useState({});

  // Load existing stock items
  useEffect(() => {
    setLoading(true);
    const stockQuery = query(
      collection(db, COLLECTIONS.STOCK_ITEMS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(stockQuery, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setStockItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Please select a unit';
    }
    
    if (!formData.totalQuantity || parseFloat(formData.totalQuantity) <= 0) {
      newErrors.totalQuantity = 'Please enter a valid quantity';
    }
    
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Please enter a valid price per unit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const stockId = generateId();
      const quantity = parseFloat(formData.totalQuantity);
      const price = parseFloat(formData.pricePerUnit);
      
      // Create stock item
      const stockItemData = StockItem.create(
        stockId,
        formData.name.trim(),
        formData.category,
        formData.unit,
        quantity,
        price
      );
      
      // Add to Firestore
      await addDoc(collection(db, COLLECTIONS.STOCK_ITEMS), {
        ...stockItemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        unit: '',
        totalQuantity: '',
        pricePerUnit: '',
      });
      
    } catch (error) {
      console.error('Stock error:', error);
      toast.error('Failed to add stock item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
  };

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  const calculateTotalValue = () => {
    const quantity = parseFloat(formData.totalQuantity) || 0;
    const price = parseFloat(formData.pricePerUnit) || 0;
    return (quantity * price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
            <div className="h-96 bg-secondary-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-secondary-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">
                Add New Stock
              </h1>
              <p className="text-sm text-secondary-600">
                Add textile materials to your inventory
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-secondary-200 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">
                Add New Stock
              </h1>
              <p className="text-sm text-secondary-600">
                Add textile materials to your inventory
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Stock Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Item Name */}
                    <Input
                      label="Item Name"
                      placeholder="e.g., Premium Cotton Fabric"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                      icon={Tag}
                    />

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Category *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CATEGORIES.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`p-3 text-sm rounded-lg border transition-all ${
                              formData.category === category
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-secondary-700 border-secondary-300 hover:border-primary-400'
                            }`}
                            onClick={() => handleInputChange('category', category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      {errors.category && (
                        <p className="text-sm text-danger-600 mt-1">{errors.category}</p>
                      )}
                    </div>

                    {/* Unit and Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Unit *
                        </label>
                        <select
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                            errors.unit ? 'border-danger-500' : 'border-secondary-300'
                          }`}
                        >
                          <option value="">Select unit</option>
                          {UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        {errors.unit && (
                          <p className="text-sm text-danger-600 mt-1">{errors.unit}</p>
                        )}
                      </div>

                      <Input
                        label="Total Quantity"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 100"
                        value={formData.totalQuantity}
                        onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                        error={errors.totalQuantity}
                        icon={Hash}
                      />
                    </div>

                    {/* Price per Unit */}
                    <Input
                      label="Price per Unit (UGX)"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15.99"
                      value={formData.pricePerUnit}
                      onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                      error={errors.pricePerUnit}
                      icon={DollarSign}
                    />

                    {/* Preview */}
                    {formData.totalQuantity && formData.pricePerUnit && (
                      <Card className="bg-primary-50 border-primary-200">
                        <div className="text-center">
                          <p className="text-sm text-primary-700 mb-2">Inventory Value Preview</p>
                          <p className="text-2xl font-bold text-primary-800">
                            UGX {calculateTotalValue()}
                          </p>
                          <p className="text-sm text-primary-600 mt-1">
                            {formData.totalQuantity} {formData.unit} × UGX {formData.pricePerUnit} = UGX {calculateTotalValue()}
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={submitting}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{submitting ? 'Adding Stock...' : 'Add Stock Item'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Current Stock */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Current Stock ({stockItems.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                      <p className="text-secondary-600">No stock items yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stockItems.slice(0, 10).map((item) => (
                        <div key={item.id} className="p-3 bg-secondary-50 rounded-lg">
                          <h4 className="font-medium text-secondary-900 text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-secondary-600">
                            {item.category} • {item.totalQuantity} {item.unit}
                          </p>
                          <p className="text-xs text-success-600 font-medium">
                            UGX {item.pricePerUnit} per {item.unit}
                          </p>
                        </div>
                      ))}
                      {stockItems.length > 10 && (
                        <p className="text-xs text-secondary-500 text-center pt-2">
                          +{stockItems.length - 10} more items
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Stock Added Successfully!"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-success-600" />
          </div>
          <p className="text-secondary-600 mb-6">
            The stock item has been successfully added to your inventory.
          </p>
          <div className="flex space-x-3 justify-center">
            <Button
              variant="secondary"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={handleAddAnother}
            >
              Add Another Item
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
