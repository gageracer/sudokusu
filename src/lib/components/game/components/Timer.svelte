<script lang="ts">
import { getSudokusuContent, type SudokuGame } from "../ts"

let {
    isPaused = $bindable(false),
    isWon = $bindable(false),
    showTutorial = $bindable(false),
    autoPauseTimeout = 30, // 30 seconds default
}: {
	isPaused: boolean
	isWon: boolean
	showTutorial: boolean
	autoPauseTimeout: number 
} = $props()

const game = getSudokusuContent()

$effect(() => {
    if (!isPaused) {
        const checkInactivity = setInterval(() => {
            if (!isWon || !showTutorial) {
                game.updateTime()
                const timeSinceLastInteraction = Date.now() - game.lastInteractionTime
                if (timeSinceLastInteraction >= autoPauseTimeout * 1000) {
                    isPaused = true
                }
            }
        }, 1000)

        return () => clearInterval(checkInactivity)
    }
})
</script>