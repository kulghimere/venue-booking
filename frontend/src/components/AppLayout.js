import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <>{children}</>;
  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
        {children}
      </div>
    </div>
  );
}
