
import React from 'react';
import Layout from '@/components/layout/Layout';
import ReportsOverview from '@/components/reports/ReportsOverview';
import { useTasks } from '@/hooks/useTasks';

const Reports = () => {
  const { tasks, loading } = useTasks();
  
  return (
    <Layout>
      <ReportsOverview tasks={tasks} loading={loading} />
    </Layout>
  );
};

export default Reports;
