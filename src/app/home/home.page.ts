import { Component, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
  type Schedule,
} from '@capnative/capacitor-local-notifications';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

const NOW_ID = 1;
const LATER_ID = 2;
const REPEATING_ID = 3;
const EVERY_ID = 4;

interface LogEntry {
  title: string;
  detail: string;
  status: 'pass' | 'fail';
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  readonly native = Capacitor.isNativePlatform();
  readonly busy = signal(false);
  readonly latest = signal<LogEntry | null>(null);

  checkPermissions(): Promise<void> {
    return this.run('Check permissions', async () => {
      const status = await LocalNotifications.checkPermissions();
      return `display: ${status.display}`;
    });
  }

  requestPermissions(): Promise<void> {
    return this.run('Request permissions', async () => {
      const status = await LocalNotifications.requestPermissions();
      return `display: ${status.display}`;
    });
  }

  scheduleNow(): Promise<void> {
    return this.schedule(
      'Schedule now',
      {
        id: NOW_ID,
        title: 'Now',
        body: 'Shown immediately.',
        sound: 'default',
        extra: { source: 'schedule-now' },
      },
      'It posts immediately.',
    );
  }

  scheduleLater(): Promise<void> {
    return this.schedule(
      'Schedule in 15 seconds',
      {
        id: LATER_ID,
        title: 'In 15 seconds',
        body: 'One shot.',
        schedule: { at: new Date(Date.now() + 15_000) },
        extra: { source: 'schedule-later' },
      },
      'One shot, 15 seconds from now.',
    );
  }

  scheduleRepeating(): Promise<void> {
    return this.schedule(
      'Schedule in 90 seconds, then every 90 seconds',
      {
        id: REPEATING_ID,
        title: 'Repeating',
        body: 'Every 90 seconds.',
        schedule: { at: new Date(Date.now() + 90_000), repeats: true },
      },
      'Fires in 90 seconds, then every 90 seconds. Cancel all stops it.',
    );
  }

  scheduleEveryMinute(): Promise<void> {
    return this.schedule(
      'Schedule every minute',
      {
        id: EVERY_ID,
        title: 'Every minute',
        body: 'Fixed one minute interval.',
        schedule: { every: 'minute' },
      },
      'The first one is one minute from now, then every minute.',
    );
  }

  getPending(): Promise<void> {
    return this.run('Get pending', async () => {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length === 0) {
        return 'No pending notifications.';
      }
      return pending.notifications
        .map((notification) => `#${notification.id} ${notification.title}${formatSchedule(notification.schedule)}`)
        .join('\n');
    });
  }

  cancelAll(): Promise<void> {
    return this.run('Cancel all', async () => {
      await LocalNotifications.cancelAll();
      return 'Cancelled every pending notification. Delivered ones stay in the shade.';
    });
  }

  removeAllDelivered(): Promise<void> {
    return this.run('Remove all delivered', async () => {
      await LocalNotifications.removeAllDeliveredNotifications();
      return 'Removed delivered notifications posted by this plugin.';
    });
  }

  private async schedule(label: string, notification: LocalNotificationSchema, detail: string): Promise<void> {
    await this.run(label, async () => {
      const result = await LocalNotifications.schedule({ notifications: [notification] });
      const ids = result.notifications.map((item) => `#${item.id}`).join(', ');
      return `Scheduled ${ids}. ${detail}`;
    });
  }

  private async run(title: string, action: () => Promise<string>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      this.append({ title, detail: await action(), status: 'pass' });
    } catch (error) {
      this.append({ title, detail: errorMessage(error), status: 'fail' });
    } finally {
      this.busy.set(false);
    }
  }

  private append(entry: LogEntry): void {
    this.latest.set(entry);
  }
}

function formatSchedule(schedule: Schedule | undefined): string {
  if (!schedule) {
    return '';
  }
  if (schedule.at) {
    return schedule.repeats ? ` at ${String(schedule.at)}, repeating` : ` at ${String(schedule.at)}`;
  }
  if (schedule.every) {
    const count = schedule.count ?? 1;
    return ` every ${count} ${schedule.every}`;
  }
  if (schedule.on) {
    const on = schedule.on;
    return ` on weekday ${on.weekday ?? '*'} ${on.hour ?? '*'}:${on.minute ?? '*'}:${on.second ?? '*'}`;
  }
  return '';
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unknown error';
}
