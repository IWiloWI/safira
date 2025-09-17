/**
 * User authentication and admin user type definitions
 * Handles admin authentication, user sessions, and authorization
 */

import { BaseEntity, Timestamps } from './common.types';

/**
 * User role definitions
 */
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

/**
 * Permission levels for different operations
 */
export type Permission = 
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'categories.view'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  | 'analytics.view'
  | 'settings.view'
  | 'settings.update'
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'tobacco.view'
  | 'tobacco.manage'
  | 'qr.generate'
  | 'files.upload'
  | 'translations.manage';

/**
 * Core user interface
 */
export interface User extends BaseEntity {
  /** User's username for login */
  username: string;
  /** User's email address */
  email: string;
  /** User's full name */
  fullName?: string;
  /** User's role in the system */
  role: UserRole;
  /** Whether the user account is active */
  isActive: boolean;
  /** Last login timestamp */
  lastLogin?: string;
  /** User's preferred language */
  preferredLanguage?: 'de' | 'da' | 'en';
  /** User avatar/profile picture URL */
  avatarUrl?: string;
  /** User's phone number */
  phoneNumber?: string;
  /** User's department/section */
  department?: string;
  /** Account verification status */
  isVerified: boolean;
  /** Password reset token timestamp */
  passwordResetAt?: string;
  /** Failed login attempts counter */
  failedLoginAttempts?: number;
  /** Account locked until timestamp */
  lockedUntil?: string;
  /** User preferences */
  preferences?: UserPreferences;
  /** Additional user metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User preferences configuration
 */
export interface UserPreferences {
  /** Dashboard layout preference */
  dashboardLayout?: 'grid' | 'list' | 'compact';
  /** Theme preference */
  theme?: 'light' | 'dark' | 'auto';
  /** Timezone setting */
  timezone?: string;
  /** Date format preference */
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  /** Time format preference */
  timeFormat?: '12h' | '24h';
  /** Notification preferences */
  notifications?: NotificationPreferences;
  /** Items per page for listings */
  itemsPerPage?: number;
  /** Auto-refresh intervals */
  autoRefresh?: boolean;
  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  /** Email notifications enabled */
  email: boolean;
  /** Browser push notifications enabled */
  push: boolean;
  /** Product update notifications */
  productUpdates: boolean;
  /** Analytics reports */
  analyticsReports: boolean;
  /** System maintenance alerts */
  systemAlerts: boolean;
  /** Login alerts */
  loginAlerts: boolean;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  /** Username or email */
  username: string;
  /** User password */
  password: string;
  /** Remember me option */
  rememberMe?: boolean;
  /** Device information for session tracking */
  deviceInfo?: {
    userAgent: string;
    ipAddress?: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** Success status */
  success: boolean;
  /** Authentication token */
  token: string;
  /** Refresh token for token renewal */
  refreshToken?: string;
  /** Token expiration timestamp */
  expiresAt: string;
  /** Authenticated user data */
  user: Omit<User, 'metadata'>;
  /** User permissions */
  permissions: Permission[];
  /** Session ID */
  sessionId: string;
}

/**
 * User session information
 */
export interface UserSession {
  /** Session ID */
  id: string;
  /** User ID */
  userId: string;
  /** Session token */
  token: string;
  /** Session creation timestamp */
  createdAt: string;
  /** Session expiration timestamp */
  expiresAt: string;
  /** Last activity timestamp */
  lastActivity: string;
  /** Device information */
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    location?: string;
  };
  /** Whether session is active */
  isActive: boolean;
}

/**
 * User creation data
 */
export interface UserCreateData {
  /** Username for login */
  username: string;
  /** Email address */
  email: string;
  /** User password */
  password: string;
  /** Full name */
  fullName?: string;
  /** User role */
  role: UserRole;
  /** Phone number */
  phoneNumber?: string;
  /** Department */
  department?: string;
  /** Preferred language */
  preferredLanguage?: 'de' | 'da' | 'en';
  /** Send welcome email */
  sendWelcomeEmail?: boolean;
}

/**
 * User update data
 */
export interface UserUpdateData {
  /** Updated email */
  email?: string;
  /** Updated full name */
  fullName?: string;
  /** Updated role */
  role?: UserRole;
  /** Updated phone number */
  phoneNumber?: string;
  /** Updated department */
  department?: string;
  /** Updated preferred language */
  preferredLanguage?: 'de' | 'da' | 'en';
  /** Updated preferences */
  preferences?: Partial<UserPreferences>;
  /** Account active status */
  isActive?: boolean;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** New password confirmation */
  confirmPassword: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  /** Email address for password reset */
  email: string;
  /** Optional callback URL */
  callbackUrl?: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  /** Reset token from email */
  token: string;
  /** New password */
  newPassword: string;
  /** New password confirmation */
  confirmPassword: string;
}

/**
 * Role permissions mapping
 */
export interface RolePermissions {
  [key: string]: {
    /** Role display name */
    name: string;
    /** Role description */
    description: string;
    /** Granted permissions */
    permissions: Permission[];
    /** Whether role can be assigned by current user */
    assignable: boolean;
  };
}

/**
 * User filter options for admin user management
 */
export interface UserFilters {
  /** Filter by role */
  role?: UserRole;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by verification status */
  isVerified?: boolean;
  /** Filter by department */
  department?: string;
  /** Search by name, username, or email */
  search?: string;
  /** Filter by last login date range */
  lastLoginRange?: {
    from: string;
    to: string;
  };
  /** Filter by creation date range */
  createdRange?: {
    from: string;
    to: string;
  };
}

/**
 * User statistics for dashboard
 */
export interface UserStatistics {
  /** Total number of users */
  totalUsers: number;
  /** Active users count */
  activeUsers: number;
  /** Users by role breakdown */
  usersByRole: Record<UserRole, number>;
  /** Recent registrations (last 30 days) */
  recentRegistrations: number;
  /** Users online now */
  usersOnline: number;
  /** Last login statistics */
  loginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * User activity log entry
 */
export interface UserActivity {
  /** Activity ID */
  id: string;
  /** User who performed the activity */
  userId: string;
  /** Activity type */
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'product_action' | 'admin_action';
  /** Activity description */
  description: string;
  /** Activity timestamp */
  timestamp: string;
  /** Additional activity data */
  data?: Record<string, unknown>;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Account verification data
 */
export interface AccountVerification {
  /** Verification token */
  token: string;
  /** Email being verified */
  email: string;
  /** Verification expiry */
  expiresAt: string;
  /** Verification type */
  type: 'email' | 'phone' | 'two_factor';
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorAuth {
  /** Whether 2FA is enabled */
  enabled: boolean;
  /** 2FA method */
  method?: 'app' | 'sms' | 'email';
  /** Secret key for TOTP apps */
  secret?: string;
  /** QR code for TOTP setup */
  qrCode?: string;
  /** Backup codes */
  backupCodes?: string[];
  /** Last verification timestamp */
  lastVerified?: string;
}

/**
 * User audit log for security tracking
 */
export interface UserAuditLog {
  /** Log entry ID */
  id: string;
  /** User ID */
  userId: string;
  /** Admin user who made changes */
  changedBy: string;
  /** Change type */
  changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'role_changed';
  /** Fields that were changed */
  changedFields?: string[];
  /** Old values */
  oldValues?: Record<string, unknown>;
  /** New values */
  newValues?: Record<string, unknown>;
  /** Change timestamp */
  timestamp: string;
  /** Reason for change */
  reason?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}