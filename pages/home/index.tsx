import React from 'react';
import Layout from '@/components/layout/Layout';
import SearchSection from '@/components/home/SearchSection';
import SEO from '@/components/ui/SEO';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home - lms.cardano2vn.io"
        description="Discover blockchain and Cardano courses. Learn from expert instructors and advance your knowledge in cryptocurrency, smart contracts, and DeFi."
        keywords="Cardano, blockchain, cryptocurrency, smart contracts, DeFi, education, courses, learning"
        url="/home"
      />
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 py-8 md:py-12">
          <SearchSection />
        </div>
      </Layout>
    </>
  );
};

export default Home;

