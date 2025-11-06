import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Loading from './Loading';
import BackgroundMotion from './BackgroundMotion';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, hideFooter = false, loading = false }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <BackgroundMotion />
      {loading && <Loading />}
      {!hideHeader && <Header />}
      <main className="flex-1 relative z-10">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;

