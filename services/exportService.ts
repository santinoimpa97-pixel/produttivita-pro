import { Appointment } from '../types';

/**
 * Generates and downloads an RFC 5545 .ics file for calendar appointments.
 * Compatible with Apple Calendar, Google Calendar, Outlook, and mobile phones.
 */
export const exportAppointmentsToICS = (appointments: Appointment[]) => {
  if (appointments.length === 0) return;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatICSDate = (dateStr: string, timeStr: string) => {
    // dateStr: YYYY-MM-DD, timeStr: HH:MM
    const dateParts = dateStr.split('-');
    const timeParts = timeStr.split(':');
    if (dateParts.length < 3 || timeParts.length < 2) return '';

    const year = dateParts[0];
    const month = pad(parseInt(dateParts[1], 10));
    const day = pad(parseInt(dateParts[2], 10));
    const hour = pad(parseInt(timeParts[0], 10));
    const min = pad(parseInt(timeParts[1], 10));

    return `${year}${month}${day}T${hour}${min}00`;
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Produttività Pro//Suite//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  appointments.forEach(app => {
    const dtStart = formatICSDate(app.date, app.time);
    if (!dtStart) return;

    // End time is 1 hour after start by default
    const [h, m] = app.time.split(':').map(Number);
    const endH = (h + 1) % 24;
    const dtEnd = formatICSDate(app.date, `${pad(endH)}:${pad(m)}`);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${app.id}@produttivitapro.app`);
    lines.push(`DTSTAMP:${formatICSDate(new Date().toISOString().split('T')[0], '00:00')}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${app.text.replace(/,/g, '\\,')}`);
    lines.push('DESCRIPTION:Creato con Produttività Pro');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `appuntamenti_produttivita_pro_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Exports all user data as a timestamped JSON backup file.
 */
export const exportAllDataJSON = (data: {
  tasks: any[];
  routines: any[];
  templates: any[];
  appointments: any[];
  goals: any[];
  notes: any[];
}) => {
  const exportPayload = {
    app: 'Produttività Pro',
    exportedAt: new Date().toISOString(),
    version: '2.0',
    data,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produttivita_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
