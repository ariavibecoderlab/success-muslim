

## Fix "Remind me" Button

The "Remind me" button currently does nothing. It should request notification permission and schedule a reminder for the next prayer using the existing notification infrastructure.

### Changes to `src/components/dashboard/HeroPrayerCard.tsx`:

1. Import `requestNotificationPermission`, `getNotificationPermission` from `usePrayerNotifications`
2. In the "Remind me" `onClick` handler:
   - If notifications not granted, request permission via `requestNotificationPermission()`
   - Show a toast confirming the reminder is set: "Reminder set for [Prayer] at [Time]"
   - If permission denied, show a toast explaining notifications are blocked
3. No new files needed -- just wire existing notification APIs to the button

This is a lightweight change in one file.

