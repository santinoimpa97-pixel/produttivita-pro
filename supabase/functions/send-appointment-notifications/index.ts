// Supabase Edge Function: send-appointment-notifications
// Scheduled every 15 minutes to send push reminders for upcoming appointments.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore - web-push types not available in Deno
import webpush from 'npm:web-push';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL')!;

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Get the current Italian time offset in ms (handles CET/CEST automatically)
function getItalyOffsetMs(): number {
  const now = new Date();
  const romeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    hour: 'numeric', minute: 'numeric', hour12: false
  }).format(now);
  const utcStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric', minute: 'numeric', hour12: false
  }).format(now);
  const [rh, rm] = romeStr.split(':').map(Number);
  const [uh, um] = utcStr.split(':').map(Number);
  return ((rh * 60 + rm) - (uh * 60 + um)) * 60 * 1000;
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const italyOffsetMs = getItalyOffsetMs();

    // Convert "now" to Italian local time for date calculation
    const nowInItaly = new Date(now.getTime() + italyOffsetMs);
    const todayStr = nowInItaly.toISOString().split('T')[0];

    // Also include tomorrow to handle appointments just after midnight
    const tomorrowInItaly = new Date(nowInItaly.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrowInItaly.toISOString().split('T')[0];

    // Notification window: 5 to 20 minutes from now (UTC)
    const windowStart = new Date(now.getTime() + 5 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 20 * 60 * 1000);

    console.log(`Running at UTC: ${now.toISOString()}, Italy date: ${todayStr}, window: ${windowStart.toISOString()} - ${windowEnd.toISOString()}`);

    // Fetch appointments with notify=true for today AND tomorrow (handles midnight crossing)
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('id, text, date, time, user_id')
      .eq('notify', true)
      .in('date', [todayStr, tomorrowStr]);

    if (appError) throw appError;

    console.log(`Found ${appointments?.length ?? 0} appointments with notify=true for ${todayStr} / ${tomorrowStr}`);

    if (!appointments?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No notify appointments' }), { status: 200 });
    }

    let sent = 0;

    for (const appointment of appointments) {
      // Sanitize time to HH:MM (DB may store HH:MM or HH:MM:SS)
      const timeStr = appointment.time.substring(0, 5);
      // Parse appointment time as Italian local time → convert to UTC for comparison
      const dtLocal = new Date(`${appointment.date}T${timeStr}:00`);
      const dtUTC = new Date(dtLocal.getTime() - italyOffsetMs);

      if (isNaN(dtUTC.getTime())) {
        console.log(`Skipping "${appointment.text}" — invalid time format: ${appointment.time}`);
        continue;
      }

      console.log(`Appointment "${appointment.text}" at Italian ${appointment.date} ${timeStr}, UTC: ${dtUTC.toISOString()}, in window: ${dtUTC >= windowStart && dtUTC <= windowEnd}`);

      if (dtUTC < windowStart || dtUTC > windowEnd) continue;

      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', appointment.user_id)
        .single();

      if (!subData?.subscription) {
        console.log(`No push subscription for user ${appointment.user_id}`);
        continue;
      }

      const payload = JSON.stringify({
        title: '📅 Promemoria Appuntamento',
        body: `${appointment.text} — tra circa 15 minuti (${timeStr})`,
        icon: '/icons/icon-192x192.png',
        tag: `appointment-${appointment.id}`,
        url: '/',
      });

      try {
        await webpush.sendNotification(subData.subscription, payload);
        sent++;
        console.log(`✅ Push sent for appointment ${appointment.id}`);
        // Mark notify=false to prevent duplicate notifications on the next cron run
        await supabase.from('appointments').update({ notify: false }).eq('id', appointment.id);
      } catch (pushError) {
        console.error(`❌ Push failed for appointment ${appointment.id}:`, pushError);
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
