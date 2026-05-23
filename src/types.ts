export type Frequency = 'monthly' | 'yearly' | 'weekly';
export type SubscriptionStatus = 'active' | 'paused' | 'unsubscribed';
export type PaymentStatus = 'completed' | 'failed' | 'pending';
export type PaymentMethod = 'usdc' | 'mastercard';

export type AppTheme = 'blue' | 'orange' | 'purple' | 'green' | 'slate' | 'yellow';

export interface UserProfile {
  uid: string;
  email: string;
  monthlyBudget?: number;
  currency?: string;
  theme?: AppTheme;
  createdAt: any;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: Frequency;
  nextPaymentDate: any;
  category: string;
  status: SubscriptionStatus;
  userId: string;
  spendingLimit?: number;
  paymentMethod?: PaymentMethod;
  createdAt: any;
  updatedAt: any;
}

export interface DiscoverItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  logo?: string;
  description: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  date: any;
  status: PaymentStatus;
  userId: string;
}
