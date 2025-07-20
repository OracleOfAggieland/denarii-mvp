'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#6366f1'
    }}>
      Loading Purchase Advisor...
    </div>
  )
});

export default function Home() {
  return <App />;
}