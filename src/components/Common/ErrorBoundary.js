import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // 記錄錯誤到控制台
    console.error('應用程式錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-content">
            <h2>🚨 系統發生錯誤</h2>
            <p>很抱歉，應用程式遇到了預期外的問題。</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-warning"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                aria-label="重新載入應用程式"
              >
                🔄 重新載入
              </button>
              
              <button 
                className="btn"
                onClick={() => window.location.reload()}
                aria-label="刷新整個頁面"
              >
                🔃 刷新頁面
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details" style={{ marginTop: '20px' }}>
                <summary>技術細節（開發模式）</summary>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;