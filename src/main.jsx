import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <main className="fatal"><h1>Study Atlas could not open.</h1><p>Reload this page. Your existing saved progress is not reset.</p><button onClick={() => location.reload()}>Reload</button></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')).render(<AppBoundary><App /></AppBoundary>);
