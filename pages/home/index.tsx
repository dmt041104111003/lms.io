import React from 'react';
import Layout from '@/components/layout/Layout';
import SearchSection from '@/components/home/SearchSection';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 py-8 md:py-12">
        <SearchSection />
      </div>
    </Layout>
  );
};

export default Home;

