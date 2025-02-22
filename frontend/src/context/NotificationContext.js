import { createContext, useContext, useRef } from 'react';
import Notification from '../components/common/Notification';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const notificationRef = useRef();

  const showNotification = (message, severity = 'success') => {
    notificationRef.current?.show(message, severity);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification ref={notificationRef} />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 