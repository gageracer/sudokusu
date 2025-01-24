export function formatTime(seconds: number) {
    if (!seconds || Number.isNaN(seconds)) return "0:00"
    
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    return `${mins}:${secs.toString().padStart(2, '0')}`
}