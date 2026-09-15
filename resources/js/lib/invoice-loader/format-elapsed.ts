/** Formatea segundos transcurridos como "45s", "3m 20s" o "2h 5m". */
export function formatElapsed(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}
