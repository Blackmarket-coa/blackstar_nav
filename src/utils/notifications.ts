export function isOrderNotification(notification: { payload?: { id?: string } } | null | undefined): boolean {
    return notification?.payload?.id?.startsWith('order_') || false;
}
