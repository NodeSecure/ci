export function formatMilliseconds(ms: number): string {
    const seconds = (ms / 1000);
    if (seconds < 1) {
        return `${ms.toFixed(2)}ms`;
    }

    return `${seconds.toFixed(2)}s`;
}
