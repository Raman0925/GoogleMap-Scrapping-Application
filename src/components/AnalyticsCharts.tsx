import React from 'react';

interface CategoryData {
  name: string;
  count: number;
}

interface AnalyticsChartsProps {
  topCategories: CategoryData[];
  withWebsitePct: number;
  withPhonePct: number;
  totalItems: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  topCategories,
  withWebsitePct,
  withPhonePct,
  totalItems,
}) => {
  return (
    <div className="glass-card analytics-grid">
      {/* Chart 1: Categories Bar chart */}
      <div className="chart-card">
        <h3 className="chart-title">Top Business Categories</h3>
        <div className="bar-chart-container">
          {topCategories.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              No categories parsed yet
            </div>
          ) : (
            topCategories.map((cat) => {
              const pct = Math.round((cat.count / (totalItems || 1)) * 100);
              return (
                <div key={cat.name} className="bar-row">
                  <span className="bar-label" title={cat.name}>{cat.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="bar-value">{cat.count}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chart 2: Contact Coverage Gauges */}
      <div className="chart-card">
        <h3 className="chart-title">Data Coverage Breakdown</h3>
        <div className="donut-chart-container">
          {totalItems === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              Waiting for data extraction...
            </div>
          ) : (
            <>
              {/* Circular ring 1: Web Coverage */}
              <div className="progress-circle-wrapper">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    className="circle blue"
                    strokeDasharray={`${withWebsitePct}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{withWebsitePct}%</text>
                </svg>
                <span className="stat-label">Websites</span>
              </div>

              {/* Circular ring 2: Phone Coverage */}
              <div className="progress-circle-wrapper">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    className="circle green"
                    strokeDasharray={`${withPhonePct}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{withPhonePct}%</text>
                </svg>
                <span className="stat-label">Phones</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AnalyticsCharts;
