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

/**
 * Parses a date in a given timezone using the locale string trick.
 * 'sv-SE' always formats as "YYYY-MM-DD HH:MM:SS" which is safe to parse.
 * This avoids midnight-crossing bugs from hour subtraction.
 */
function toTZDate(date: Date, timeZone: string): Date {
  const str = date.toLocaleString('sv-SE', { timeZone }).replace(' ', 'T');
  return new Date(str);
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();

    // Italian offset in ms — computed correctly even across midnight
    const italyOffsetMs = toTZDate(now, 'Europe/Rome').getTime() - toTZDate(now, 'UTC').getTime();

    // Italian local date (today and tomorrow) for querying appointments
    const nowInItaly = new Date(now.getTime() + italyOffsetMs);
    const todayStr = nowInItaly.toISOString().split('T')[0];
    const tomorrowStr = new Date(nowInItaly.getTime() + 86400000).toISOString().split('T')[0];

    // Notification window: 5 to 20 minutes from now (UTC)
    const windowStart = new Date(now.getTime() + 5 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 20 * 60 * 1000);

    console.log(`UTC: ${now.toISOString()}, italyOffset: ${italyOffsetMs / 3600000}h, dates: ${todayStr}/${tomorrowStr}, window: ${windowStart.toISOString()} - ${windowEnd.toISOString()}`);

    // Query appointments with notify=true for today AND tomorrow (handles midnight crossing)
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('id, text, date, time, user_id')
      .eq('notify', true)
      .in('date', [todayStr, tomorrowStr]);

    if (appError) throw appError;

    console.log(`Found ${appointments?.length ?? 0} appointments`);

    if (!appointments?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No notify appointments' }), { status: 200 });
    }

    let sent = 0;

    for (const appointment of appointments) {
      // Sanitize time to HH:MM (DB may store HH:MM or HH:MM:SS)
      const timeStr = appointment.time.substring(0, 5);

      // The appointment datetime stored in Italian local time.
      // Parse as UTC (JS default), then subtract offset → real UTC time.
      const dtAsUTCParsed = new Date(`${appointment.date}T${timeStr}:00Z`);
      const dtUTC = new Date(dtAsUTCParsed.getTime() - italyOffsetMs);

      if (isNaN(dtUTC.getTime())) {
        console.log(`Skipping "${appointment.text}" — invalid time: ${appointment.time}`);
        continue;
      }

      const inWindow = dtUTC >= windowStart && dtUTC <= windowEnd;
      console.log(`"${appointment.text}" ${appointment.date} ${timeStr} IT → ${dtUTC.toISOString()} UTC, in window: ${inWindow}`);

      if (!inWindow) continue;

      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription, language')
        .eq('user_id', appointment.user_id)
        .single();

      if (!subData?.subscription) {
        console.log(`No subscription for user ${appointment.user_id}`);
        continue;
      }

      const isEnglish = subData.language === 'en';
      const title = isEnglish ? '📅 Appointment Reminder' : '📅 Promemoria Appuntamento';
      const bodyText = isEnglish
        ? `${appointment.text} — in about 15 minutes (${timeStr})`
        : `${appointment.text} — tra circa 15 minuti (${timeStr})`;

      try {
        await webpush.sendNotification(subData.subscription, JSON.stringify({
          title: title,
          body: bodyText,
          icon: '/icons/icon-192x192.png',
          tag: `appointment-${appointment.id}`,
          url: '/',
        }));
        sent++;
        console.log(`✅ Push sent for ${appointment.id}`);
        // Mark notify=false to prevent duplicate notifications
        await supabase.from('appointments').update({ notify: false }).eq('id', appointment.id);
      } catch (pushError) {
        console.error(`❌ Push failed for ${appointment.id}:`, pushError);
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
