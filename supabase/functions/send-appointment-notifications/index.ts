// Supabase Edge Function: send-appointment-notifications
// Scheduled every 15 minutes to send push reminders for upcoming appointments.
// Deploy with: supabase functions deploy send-appointment-notifications

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore - web-push types not available in Deno
import webpush from 'npm:web-push';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL')!;

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const windowStart = new Date(now.getTime() + 14 * 60 * 1000); // 14 min from now
    const windowEnd = new Date(now.getTime() + 31 * 60 * 1000);   // 31 min from now

    const todayStr = now.toISOString().split('T')[0];

    // Fetch appointments with notify=true for today
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('id, text, date, time, user_id')
      .eq('notify', true)
      .eq('date', todayStr);

    if (appError) throw appError;
    if (!appointments?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let sent = 0;

    for (const appointment of appointments) {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

      // Only notify if appointment is within the 15-30 minute window
      if (appointmentDateTime < windowStart || appointmentDateTime > windowEnd) continue;

      // Get the push subscription for this user
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', appointment.user_id)
        .single();

      if (!subData?.subscription) continue;

      const payload = JSON.stringify({
        title: '📅 Promemoria Appuntamento',
        body: `${appointment.text} — tra circa 15 minuti (${appointment.time.substring(0, 5)})`,
        icon: '/icons/icon-192x192.png',
        tag: `appointment-${appointment.id}`,
        url: '/',
      });

      try {
        await webpush.sendNotification(subData.subscription, payload);
        sent++;
      } catch (pushError) {
        console.error(`Failed to send push for appointment ${appointment.id}:`, pushError);
        // If subscription is expired/invalid, remove it
        if ((pushError as any)?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('user_id', appointment.user_id);
        }
      }
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
