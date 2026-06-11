import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    // Load notifications from API
    api.get('/api/notifications')
      .then(res => setNotifications(res.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const notificationTypes = {
    exam: { icon: '📅', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    resource: { icon: '📄', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    announcement: { icon: '📢', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    update: { icon: '🔔', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const markAsRead = (id) => {
    api.put(`/api/notifications/${id}/read`)
      .then(() => {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
      })
      .catch(() => {});
  };

  const markAllAsRead = () => {
    api.put('/api/notifications/read-all')
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      })
      .catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay updated with latest announcements and resources
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-all"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'read', label: 'Read', count: notifications.length - unreadCount },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: filter === f.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              border: filter === f.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
              color: filter === f.id ? '#818cf8' : '#94a3b8',
            }}>
            {f.label} {f.count > 0 && `(${f.count})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="text-sm text-slate-400 mt-4">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
          <p className="text-sm text-slate-500">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, idx) => {
            const type = notificationTypes[notification.type] || notificationTypes.announcement;
            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer relative"
                style={{
                  background: notification.read 
                    ? 'rgba(255,255,255,0.02)' 
                    : type.bg,
                  border: `1px solid ${notification.read ? 'rgba(255,255,255,0.05)' : type.color + '40'}`,
                  opacity: notification.read ? 0.7 : 1,
                }}>
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full"
                    style={{ background: type.color, boxShadow: `0 0 10px ${type.color}` }}
                  />
                )}
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">{type.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">{notification.title}</h3>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>{notification.time || '2 hours ago'}</span>
                      {notification.category && (
                        <span className="px-2 py-0.5 rounded-full"
                          style={{ background: `${type.color}20`, color: type.color }}>
                          {notification.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Notifications;
