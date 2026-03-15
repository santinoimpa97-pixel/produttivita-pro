import { supabase } from '../supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

/**
 * Converts a base64 URL-encoded string to a Uint8Array for the push subscription.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the service worker. Call this once on app startup.
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser.');
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Checks if push notifications are currently enabled for this user.
 */
export const isPushEnabled = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
};

/**
 * Requests permission and subscribes to push notifications.
 * Saves the subscription to Supabase.
 * Returns true if successful.
 */
export const subscribeToPush = async (userId: string, language: string = 'it'): Promise<boolean> => {
  console.log('🔔 subscribeToPush called. userId:', userId);
  console.log('🔔 VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'MISSING!');

  if (!VAPID_PUBLIC_KEY) {
    console.error('❌ VITE_VAPID_PUBLIC_KEY is not set in env.');
    return false;
  }

  try {
    console.log('🔔 Step 1: Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('🔔 Step 1 result: permission =', permission);
    if (permission !== 'granted') {
      console.warn('❌ Permission denied.');
      return false;
    }

    console.log('🔔 Step 2: Waiting for service worker ready...');
    const reg = await navigator.serviceWorker.ready;
    console.log('🔔 Step 2 done: scope =', reg.scope);

    console.log('🔔 Step 3: Subscribing to PushManager...');
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });
    console.log('🔔 Step 3 done: endpoint =', subscription.endpoint.substring(0, 50));

    console.log('🔔 Step 4: Saving to Supabase...');
    // Delete existing subscription for this user first, then insert fresh
    await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: userId,
      subscription: subscription.toJSON(),
      language,
    });

    if (error) {
      console.error('❌ Supabase save failed:', error.message);
      return false;
    }

    console.log('✅ Push subscription saved successfully!');
    return true;
  } catch (error) {
    console.error('❌ Push subscription error:', error);
    return false;
  }
};

/**
 * Unsubscribes from push notifications and removes from Supabase.
 */
export const unsubscribeFromPush = async (userId: string): Promise<void> => {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    }
    await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    console.log('Push subscription removed.');
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
  }
};
