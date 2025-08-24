// src/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so fallback UI is shown
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log errors (you can send to Sentry/LogRocket/etc.)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2>⚠️ Something went wrong</h2>
          <p>{this.state.error?.message || "Unexpected error occurred."}</p>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

