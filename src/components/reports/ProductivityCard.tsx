
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { ProductivityScore } from '@/services/ReportingService';

interface ProductivityCardProps {
  data: ProductivityScore;
}

const ProductivityCard: React.FC<ProductivityCardProps> = ({ data }) => {
  const { score, trend, completionRate, averageCompletionTime } = data;
  
  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="text-green-500 h-6 w-6" />;
      case 'down':
        return <ArrowDownIcon className="text-red-500 h-6 w-6" />;
      case 'stable':
        return <MinusIcon className="text-yellow-500 h-6 w-6" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Productivity Score</span>
          <span className="flex items-center gap-2">
            {renderTrendIcon()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-2xl font-bold">{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {trend === 'up' ? 'Good progress! Your productivity is improving.' :
               trend === 'down' ? 'Your productivity has decreased recently.' :
               'Your productivity is steady.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-xl font-bold">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completionRate > 75 ? 'Excellent rate!' :
               completionRate > 50 ? 'Good progress' :
               'Room for improvement'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg. Completion Time</span>
              <span className="text-xl font-bold">
                {averageCompletionTime !== null 
                  ? `${averageCompletionTime.toFixed(1)} days`
                  : 'N/A'}
              </span>
            </div>
            {averageCompletionTime !== null && (
              <>
                <Progress 
                  value={Math.max(0, 100 - (averageCompletionTime > 10 ? 100 : averageCompletionTime * 10))} 
                  className="h-2" 
                />
                <p className="text-sm text-muted-foreground">
                  {averageCompletionTime <= 1 ? 'Very fast completion!' :
                   averageCompletionTime <= 3 ? 'Good completion time' :
                   averageCompletionTime <= 7 ? 'Average completion time' :
                   'Tasks taking longer than ideal'}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityCard;
