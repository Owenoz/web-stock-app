import React from 'react';
import { motion } from 'framer-motion';

export const Input = ({ 
  label, 
  error, 
  helperText, 
  icon: Icon, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const inputClasses = error 
    ? `${baseClasses} border-danger-500 focus:ring-danger-500 focus:border-danger-500`
    : `${baseClasses} border-secondary-300 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-400`;
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        
        <input
          className={`${inputClasses} ${Icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger-600"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-vertical';
  
  const inputClasses = error 
    ? `${baseClasses} border-danger-500 focus:ring-danger-500 focus:border-danger-500`
    : `${baseClasses} border-secondary-300 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-400`;
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <textarea
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger-600"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};
