import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout = ({ 
  children, 
  showHeader = true, 
  showFooter = false 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {showHeader && <Header />}
      <main className={showHeader ? "pt-0" : ""}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};