import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <AlertCircle size={64} color="#ff3b30" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '12px' }}>
              Алдаа гарлаа
            </h1>
            <p style={{ fontSize: '16px', color: '#808080', marginBottom: '32px' }}>
              Уучлаарай, системд алдаа гарлаа. Хуудсыг refresh хийнэ үү.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Хуудас refresh хийх
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;