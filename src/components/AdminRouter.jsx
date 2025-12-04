import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

export function AdminRouter() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminPanel />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="promos" element={<AdminPromotions />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="combos" element={<AdminCombos />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="*" element={
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <h2>Página no encontrada</h2>
                    </div>
                } />
            </Route>
        </Routes>
    );
}

