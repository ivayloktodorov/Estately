import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { favorites, properties, propertyMessages, users } from '@/src/db/schema';

export interface AdminOverviewStats {
  totalUsers: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  totalFavorites: number;
  totalInquiries: number;
}

export interface RecentAdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface RecentAdminProperty {
  id: number;
  title: string;
  city: string;
  price: string;
  moderationStatus: string;
  createdAt: Date;
}

export interface RecentAdminInquiry {
  id: number;
  propertyId: number;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: Date;
}

export interface AdminOverview {
  stats: AdminOverviewStats;
  recentUsers: RecentAdminUser[];
  recentProperties: RecentAdminProperty[];
  recentInquiries: RecentAdminInquiry[];
}

function countValue(rows: { value: number }[]): number {
  return rows[0]?.value ?? 0;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    totalUsersRows,
    totalPropertiesRows,
    pendingPropertiesRows,
    approvedPropertiesRows,
    rejectedPropertiesRows,
    totalFavoritesRows,
    totalInquiriesRows,
    recentUsers,
    recentProperties,
    recentInquiries,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(properties),
    db.select({ value: count() }).from(properties).where(eq(properties.moderationStatus, 'pending')),
    db.select({ value: count() }).from(properties).where(eq(properties.moderationStatus, 'approved')),
    db.select({ value: count() }).from(properties).where(eq(properties.moderationStatus, 'rejected')),
    db.select({ value: count() }).from(favorites),
    db.select({ value: count() }).from(propertyMessages),
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(5),
    db
      .select({
        id: properties.id,
        title: properties.title,
        city: properties.city,
        price: properties.price,
        moderationStatus: properties.moderationStatus,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .orderBy(desc(properties.createdAt), desc(properties.id))
      .limit(5),
    db
      .select({
        id: propertyMessages.id,
        propertyId: properties.id,
        propertyTitle: properties.title,
        senderName: users.fullName,
        senderEmail: users.email,
        message: propertyMessages.message,
        createdAt: propertyMessages.createdAt,
      })
      .from(propertyMessages)
      .innerJoin(properties, eq(propertyMessages.propertyId, properties.id))
      .innerJoin(users, eq(propertyMessages.userId, users.id))
      .orderBy(desc(propertyMessages.createdAt), desc(propertyMessages.id))
      .limit(5),
  ]);

  return {
    stats: {
      totalUsers: countValue(totalUsersRows),
      totalProperties: countValue(totalPropertiesRows),
      pendingProperties: countValue(pendingPropertiesRows),
      approvedProperties: countValue(approvedPropertiesRows),
      rejectedProperties: countValue(rejectedPropertiesRows),
      totalFavorites: countValue(totalFavoritesRows),
      totalInquiries: countValue(totalInquiriesRows),
    },
    recentUsers,
    recentProperties,
    recentInquiries,
  };
}
