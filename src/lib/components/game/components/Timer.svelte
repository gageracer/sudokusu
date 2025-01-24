<script lang="ts">
import type { SudokuGame } from "../ts"

let {
    game = $bindable<SudokuGame>(),
    isPaused = $bindable(false),
    isWon = $bindable(false),
    autoPauseTimeout = $bindable(30000), // 30 seconds default
} = $props()

$effect(() => {
    if (!isPaused) {
        const checkInactivity = setInterval(() => {
            if (!isWon) {
                game.updateTime()
                const timeSinceLastInteraction = Date.now() - game.lastInteractionTime
                if (timeSinceLastInteraction >= autoPauseTimeout) {
                    isPaused = true
                }
            }
        }, 1000)

        return () => clearInterval(checkInactivity)
    }
})
</script>