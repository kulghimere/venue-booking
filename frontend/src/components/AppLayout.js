import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <>{children}</>;
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
