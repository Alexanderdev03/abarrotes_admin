import React from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminPanel } from './AdminPanel';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminPromotions } from './AdminPromotions';
import { AdminContent } from './AdminContent';
import { AdminSettings } from './AdminSettings';
import { AdminCombos } from './AdminCombos';
import { AdminCategories } from './AdminCategories';
import { AdminPOS } from './AdminPOS';

export function AdminRouter({ activeView, onViewChange, onLogout, onExit }) {
    return (
        <AdminLayout
            activeView={activeView}
            onViewChange={onViewChange}
            onLogout={onLogout}
            onExit={onExit}
        >
            {activeView === 'dashboard' && <AdminPanel />}
            {activeView === 'products' && <AdminProducts />}
            {activeView === 'orders' && <AdminOrders />}
            {activeView === 'customers' && <AdminCustomers />}
            {activeView === 'promos' && <AdminPromotions />}
            {activeView === 'content' && <AdminContent />}
            {activeView === 'settings' && <AdminSettings />}
            {activeView === 'combos' && <AdminCombos />}
            {activeView === 'categories' && <AdminCategories />}
            {activeView === 'pos' && <AdminPOS />}

            {/* Placeholder for other views */}
            {activeView !== 'dashboard' && activeView !== 'products' && activeView !== 'orders' &&
                activeView !== 'customers' && activeView !== 'promos' && activeView !== 'content' &&
                activeView !== 'settings' && activeView !== 'combos' && activeView !== 'categories' && activeView !== 'pos' && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <h2>Sección en construcción: {activeView}</h2>
                        <p>Pronto podrás gestionar {activeView} desde aquí.</p>
                    </div>
                )}
        </AdminLayout>
    );
}
