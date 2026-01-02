import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ 
  children, 
  className = '', 
  padding = 'md', 
  hover = false,
  gradient = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-soft border border-secondary-100 overflow-hidden';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:shadow-medium transition-shadow duration-300' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-primary-50 to-secondary-50' : '';
  
  const classes = `${baseClasses} ${paddings[padding]} ${hoverClasses} ${gradientClasses} ${className}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-secondary-100 pb-4 mb-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon,
  loading = false,
  className = '' 
}) => {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-danger-600',
    neutral: 'text-secondary-600',
  };
  
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {Icon && (
        <div className="absolute top-4 right-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      )}
      
      <div className="pr-16">
        <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 bg-secondary-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
        )}
        
        {change && (
          <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
};
