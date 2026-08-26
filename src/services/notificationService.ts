import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabaseClient';

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize push notifications
   * Call this after user logs in
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) {
      console.log('Notifications already initialized');
      return;
    }

    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Not a native platform, skipping push notifications');
      await this.initializeWebNotifications(userId);
      return;
    }

    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        // Setup listeners
        this.setupListeners(userId);
        
        this.isInitialized = true;
        console.log('Push notifications initialized');
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Initialize web notifications (for browser)
   */
  private async initializeWebNotifications(userId: string): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Web notifications enabled');
        this.isInitialized = true;
      }
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(userId: string): void {
    // On registration success, save token to database
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      await this.saveTokenToDatabase(userId, token.value);
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration:', error);
    });

    // Show notification when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        
        // Show local notification when app is in foreground
        await this.showLocalNotification(
          notification.title || 'New Message',
          notification.body || '',
          notification.data
        );
      }
    );

    // Handle notification tap
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed:', notification);
        // You can navigate to specific screen based on notification.data
      }
    );
  }

  /**
   * Save FCM/APNS token to database
   */
  private async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      const platform = Capacitor.getPlatform();
      
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('notification_tokens')
        .select('id')
        .eq('token', token)
        .single();

      if (existingToken) {
        console.log('Token already exists in database');
        return;
      }

      // Insert new token
      const { error } = await supabase
        .from('notification_tokens')
        .insert({
          user_id: userId,
          token: token,
          platform: platform
        });

      if (error) {
        console.error('Error saving notification token:', error);
      } else {
        console.log('Notification token saved to database');
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  /**
   * Show local notification
   */
  async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      // Request permission for local notifications
      const permStatus = await LocalNotifications.requestPermissions();
      
      if (permStatus.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title,
              body: body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 100) }, // Show immediately
              sound: undefined,
              attachments: undefined,
              actionTypeId: '',
              extra: data
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Show web notification (for browser)
   */
  async showWebNotification(title: string, body: string, data?: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icon.png', // Add your app icon
        badge: '/badge.png',
        data: data
      });
    }
  }

  /**
   * Remove notification token when user logs out
   */
  async removeToken(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing notification token:', error);
      } else {
        console.log('Notification token removed');
      }

      // Unregister from push notifications
      if (Capacitor.isNativePlatform()) {
        await PushNotifications.removeAllListeners();
      }

      this.isInitialized = false;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

export const notificationService = NotificationService.getInstance();
