<script lang="ts">
import { getSudokusuContent, type SudokuGame } from "../ts"
import { formatTime } from "../utils/formatTime";

let {
	isPaused = $bindable(false),
}: {
	isPaused: boolean
} = $props()

const game = getSudokusuContent()
</script>

<div class="mb-4 flex justify-between items-center dark:text-white">
    <div class="flex items-center flex-col">
            <span>Mistakes: {game.mistakes.current}</span>
            <div class="flex gap-1">
                {#each Array(game.getStars(game.mistakes.current)) as _}
                    <span class="text-yellow-400 dark:text-yellow-500">★</span>
                {/each}
                {#each Array(4 - game.getStars(game.mistakes.current)) as _}
                    <span class="text-gray-300 dark:text-gray-600">★</span>
                {/each}
            </div>
        </div>
    <div>Time: {formatTime(game.time.timeElapsed)}</div>
    <div class="flex gap-2">
        <button
            class="rounded bg-sky-800 px-4 py-2 text-white"
            onclick={() => (isPaused = !isPaused)}
        >
            {isPaused ? 'Resume' : 'Pause'}
        </button>
    </div>
</div>
