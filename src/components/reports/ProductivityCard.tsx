
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import { ProductivityScore } from '@/services/ReportingService';

interface ProductivityCardProps {
  data: ProductivityScore;
}

const ProductivityCard: React.FC<ProductivityCardProps> = ({ data }) => {
  const getIcon = () => {
    switch (data.trend) {
      case 'up':
        return <ArrowUpCircle className="h-8 w-8 text-green-500" />;
      case 'down':
        return <ArrowDownCircle className="h-8 w-8 text-red-500" />;
      default:
        return <MinusCircle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getTrendText = () => {
    switch (data.trend) {
      case 'up':
        return 'Trending Up';
      case 'down':
        return 'Trending Down';
      default:
        return 'Stable';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold">{data.score}</p>
            <p className="text-sm text-muted-foreground">
              Task completion rate: {data.completionRate.toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            {getIcon()}
            <span className="text-sm font-medium mt-1">{getTrendText()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityCard;
