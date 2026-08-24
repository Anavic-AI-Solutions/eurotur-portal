export type ExchangeRate = {
    venta: number;
    fecha: string | null;
};

export function formatDay(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear() % 100).padStart(2, '0');

    return `${dd}·${mm}·${yy}`;
}

export function formatTimestamp(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Most recent business day strictly before today (weekends only; holidays
 * are not accounted for, matching the backend IataRateService).
 */
export function lastBusinessDay(): Date {
    const day = new Date();

    do {
        day.setDate(day.getDate() - 1);
    } while (day.getDay() === 0 || day.getDay() === 6);

    return day;
}

/**
 * A rate is stale when its source timestamp is older than the previous
 * business day: a Friday value still counts as current on Monday.
 */
export function isRateStale(updatedAt: string | null): boolean {
    if (updatedAt === null) {
        return false;
    }

    const updated = new Date(updatedAt);

    if (Number.isNaN(updated.getTime())) {
        return false;
    }

    const last = lastBusinessDay();
    last.setHours(0, 0, 0, 0);

    return updated.getTime() < last.getTime();
}
