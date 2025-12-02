import React, { useState } from 'react';
// import logo from '../assets/logo.png'; // REMOVED: Optimization
// TODO: Reemplaza esta URL con la URL de descarga de tu archivo logo.png en Firebase Storage
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/abarrotesalex-ec387.firebasestorage.app/o/logo.png?alt=media";

import { useAuth } from '../context/auth.jsx';

export function LoginModal() {
    const { loginWithGoogle } = useAuth();
    const [error, setError] = useState(null);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err) {
            setError("Error al iniciar sesión con Google. Intenta de nuevo.");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'black',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                padding: '3px'
            }}>
                <img src={LOGO_URL} alt="Abarrotes Alex" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
            </div>

            <h1 style={{ color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>¡Bienvenido!</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', textAlign: 'center' }}>
                Inicia sesión con Google para continuar.
            </p>

            {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>}

            <button
                onClick={handleGoogleLogin}
                style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Continuar con Google
            </button>
        </div>
    );
}
