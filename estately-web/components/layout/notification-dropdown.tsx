'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  getCurrentUserNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from '@/lib/notifications/actions';
import type { NotificationListItem, NotificationType } from '@/lib/notifications/service';

interface NotificationDropdownProps {
  className?: string;
  initialNotifications: NotificationListItem[];
  initialUnreadCount: number;
}

function unreadLabel(count: number): string {
  return count > 9 ? '9+' : count.toString();
}

function notificationIcon(type: NotificationType): string {
  switch (type) {
    case 'listing_pending':
      return '⌂';
    case 'listing_approved':
      return '✓';
    case 'listing_rejected':
      return '×';
    case 'listing_updated':
      return '✎';
    case 'inquiry_received':
      return '?';
    case 'message_received':
      return '✉';
    case 'system':
    default:
      return 'i';
  }
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationDropdown({
  className = '',
  initialNotifications,
  initialUnreadCount,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(true);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const refreshNotifications = useCallback(() => {
    if (hasLoadedRef.current || isPending) {
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const result = await getCurrentUserNotificationsAction();
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        hasLoadedRef.current = true;
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : 'Could not load notifications.');
      }
    });
  }, [isPending]);

  function markAsRead(notificationId: number) {
    setError('');
    startTransition(async () => {
      try {
        const result = await markNotificationAsReadAction(notificationId);
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      } catch (markError) {
        setError(markError instanceof Error ? markError.message : 'Could not update notification.');
      }
    });
  }

  function markAllAsRead() {
    setError('');
    startTransition(async () => {
      try {
        const result = await markAllNotificationsAsReadAction();
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      } catch (markError) {
        setError(markError instanceof Error ? markError.message : 'Could not update notifications.');
      }
    });
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open notifications"
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700 shadow-sm transition hover:border-estate-300 hover:bg-cream-50 hover:text-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 sm:h-12 sm:w-12"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) refreshNotifications();
        }}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-pink px-1 text-[11px] font-bold leading-none text-estate-900 ring-2 ring-white">
            {unreadLabel(unreadCount)}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="fixed left-3 right-3 top-24 z-50 max-h-[calc(100dvh-7rem)] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl shadow-slate-900/10 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(380px,calc(100vw-2rem))]"
          role="menu"
        >
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-4 py-4">
            <div>
              <h2 className="text-base font-semibold text-charcoal-950">Notifications</h2>
              <p className="mt-0.5 text-sm text-stone-500">Recent updates</p>
            </div>
            <button
              className="rounded-md px-2 py-1 text-xs font-semibold text-estate-700 transition hover:bg-estate-50 hover:text-estate-800 disabled:cursor-not-allowed disabled:text-stone-400 disabled:hover:bg-transparent"
              disabled={unreadCount === 0 || isPending}
              onClick={markAllAsRead}
              type="button"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-[min(420px,calc(100dvh-15rem))] overflow-y-auto py-2">
            {isPending && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-medium text-stone-500">Loading notifications...</p>
            ) : null}

            {error ? (
              <p className="mx-2 rounded-lg bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">{error}</p>
            ) : null}

            {!isPending && notifications.length === 0 && !error ? (
              <p className="px-4 py-8 text-center text-sm font-medium text-stone-500">No notifications yet.</p>
            ) : null}

            {notifications.map((notification) => {
              const content = (
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-estate-800">
                    {notificationIcon(notification.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-charcoal-950">{notification.title}</h3>
                      {!notification.isRead ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-purple" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <time className="text-xs font-medium text-stone-500">
                        {relativeTime(notification.createdAt)}
                      </time>
                      {!notification.isRead ? (
                        <button
                          className="text-xs font-semibold text-estate-700 hover:text-estate-800"
                          onClick={(event) => {
                            event.preventDefault();
                            markAsRead(notification.id);
                          }}
                          type="button"
                        >
                          Mark as read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );

              return (
                <article
                  className={`mx-2 rounded-lg px-3 py-3 transition ${
                    !notification.isRead ? 'bg-estate-50' : 'bg-white hover:bg-cream-50'
                  }`}
                  key={notification.id}
                >
                  {notification.href ? (
                    <Link
                      className="block"
                      href={notification.href}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        setIsOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </article>
              );
            })}
          </div>

          <div className="border-t border-stone-100 p-2">
            <Link
              className="flex h-10 items-center justify-center rounded-md text-sm font-semibold text-estate-700 transition hover:bg-estate-50 hover:text-estate-800"
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
