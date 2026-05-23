import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  total: number;
  limit: number;
  avgRating: string;
  withWebsitePct: number;
  withPhonePct: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  total,
  limit,
  avgRating,
  withWebsitePct,
  withPhonePct,
}) => {
  return (
    <div className="stats-grid">
      <Card className="glass-card stat-card stat-card-purple">
        <CardContent className="p-0 flex flex-col gap-2">
          <span className="stat-label">Total Extracted</span>
          <span className="stat-value">
            {total}
            <span className="stat-value-suffix">/ {limit}</span>
          </span>
        </CardContent>
      </Card>

      <Card className="glass-card stat-card stat-card-yellow">
        <CardContent className="p-0 flex flex-col gap-2">
          <span className="stat-label">Average Rating</span>
          <span className="stat-value">
            {avgRating}
            <span className="stat-value-suffix">★</span>
          </span>
        </CardContent>
      </Card>

      <Card className="glass-card stat-card stat-card-blue">
        <CardContent className="p-0 flex flex-col gap-2">
          <span className="stat-label">Website Coverage</span>
          <span className="stat-value">
            {withWebsitePct}
            <span className="stat-value-suffix">%</span>
          </span>
        </CardContent>
      </Card>

      <Card className="glass-card stat-card stat-card-green">
        <CardContent className="p-0 flex flex-col gap-2">
          <span className="stat-label">Phone Coverage</span>
          <span className="stat-value">
            {withPhonePct}
            <span className="stat-value-suffix">%</span>
          </span>
        </CardContent>
      </Card>
    </div>
  );
};
export default StatsCards;
