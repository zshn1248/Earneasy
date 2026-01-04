import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state = { error: null, info: null } }
  static getDerivedStateFromError(error){ return { error } }
  componentDidCatch(error, info){ this.setState({ error, info }) ; console.error('ErrorBoundary caught', error, info) }
  render(){
    if(this.state.error){
      return (
        <div className="card" style={{background:'#ffeef0',border:'1px solid #f2c6cb'}}>
          <h3>Something went wrong</h3>
          <p className="muted small">An unexpected error occurred while loading this page. You can try refreshing or navigate to another page.</p>
          <details style={{marginTop:8,whiteSpace:'pre-wrap'}}>
            <summary style={{cursor:'pointer'}}>Error details</summary>
            <div style={{marginTop:8,color:'#900'}}>{String(this.state.error && this.state.error.toString())}</div>
            <div style={{marginTop:8,fontSize:12,color:'#444'}}>{this.state.info && this.state.info.componentStack}</div>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
