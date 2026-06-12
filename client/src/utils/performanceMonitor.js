/**
 * Frontend Performance Monitoring Utility
 * Tracks and logs performance metrics for API calls and component renders
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.enabled = import.meta.env.DEV || localStorage.getItem('perfMonitor') === 'true';
  }

  // Start timing an operation
  start(label) {
    if (!this.enabled) return null;
    
    const id = `${label}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();
    
    return {
      id,
      label,
      startTime,
      end: () => this.end(id, label, startTime)
    };
  }

  // End timing an operation
  end(id, label, startTime) {
    if (!this.enabled) return;
    
    const duration = performance.now() - startTime;
    const metric = {
      id,
      label,
      duration: Math.round(duration),
      timestamp: new Date().toISOString()
    };
    
    this.metrics.push(metric);
    
    // Log to console with color coding
    if (duration < 100) {
      console.log(`✅ ${label}: ${Math.round(duration)}ms`);
    } else if (duration < 500) {
      console.log(`⚠️ ${label}: ${Math.round(duration)}ms`);
    } else {
      console.warn(`🐌 SLOW: ${label}: ${Math.round(duration)}ms`);
    }
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
    return metric;
  }

  // Track API call performance
  async trackAPI(label, apiCall) {
    const timer = this.start(`API: ${label}`);
    if (!timer) return apiCall();
    
    try {
      const result = await apiCall();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      console.error(`❌ API Error: ${label}`, error.message);
      throw error;
    }
  }

  // Track component render
  trackRender(componentName, renderFn) {
    if (!this.enabled) return renderFn();
    
    const timer = this.start(`Render: ${componentName}`);
    const result = renderFn();
    timer.end();
    return result;
  }

  // Get performance summary
  getSummary() {
    if (this.metrics.length === 0) return null;
    
    const byLabel = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.label]) {
        acc[metric.label] = [];
      }
      acc[metric.label].push(metric.duration);
      return acc;
    }, {});
    
    const summary = Object.entries(byLabel).map(([label, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      return {
        label,
        count: durations.length,
        avg: Math.round(avg),
        min,
        max
      };
    }).sort((a, b) => b.avg - a.avg);
    
    return summary;
  }

  // Log performance summary to console
  logSummary() {
    const summary = this.getSummary();
    if (!summary) {
      console.log('No performance metrics collected');
      return;
    }
    
    console.table(summary);
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    console.log('Performance metrics cleared');
  }

  // Enable/disable monitoring
  enable() {
    this.enabled = true;
    localStorage.setItem('perfMonitor', 'true');
    console.log('✅ Performance monitoring ENABLED');
  }

  disable() {
    this.enabled = false;
    localStorage.removeItem('perfMonitor');
    console.log('❌ Performance monitoring DISABLED');
  }
}

// Create singleton instance
const perfMonitor = new PerformanceMonitor();

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.perfMonitor = perfMonitor;
}

export default perfMonitor;
