import React from 'react';
import { Home, Grid, ShoppingCart, User, Settings } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange, cartCount, isAnimating, user }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.75rem 0.5rem',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <button
        onClick={() => onTabChange('home')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: activeTab === 'home' ? 'var(--color-primary)' : '#999',
          cursor: 'pointer'
        }}
      >
        <Home size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Inicio</span>
      </button>

      <button
        onClick={() => onTabChange('categories')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: activeTab === 'categories' ? 'var(--color-primary)' : '#999',
          cursor: 'pointer'
        }}
      >
        <Grid size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Deptos</span>
      </button>

      <button
        onClick={() => onTabChange('cart')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: activeTab === 'cart' ? 'var(--color-primary)' : '#999',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart
            size={24}
            className={isAnimating ? 'cart-shake' : ''}
          />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#d32f2f',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {cartCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Carrito</span>
      </button>

      <button
        onClick={() => onTabChange('points')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: activeTab === 'points' ? 'var(--color-primary)' : '#999',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>🪙</span>
        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Puntos</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: activeTab === 'profile' ? 'var(--color-primary)' : '#999',
          cursor: 'pointer'
        }}
      >
        <User size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Cuenta</span>
      </button>

      {/* Admin Tab - Only visible for admin role */}
      {user?.role === 'admin' && (
        <button
          onClick={() => onTabChange('admin')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: activeTab === 'admin' ? 'var(--color-primary)' : '#999',
            cursor: 'pointer'
          }}
        >
          <Settings size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Admin</span>
        </button>
      )}
    </nav>
  );
}
