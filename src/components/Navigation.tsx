'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/scan', label: 'Scan', icon: '📷' },
    { href: '/dashboard', label: 'Dashboard', icon: '📋' },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span className="text-2xl">📄</span>
            <span>DocScan</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;