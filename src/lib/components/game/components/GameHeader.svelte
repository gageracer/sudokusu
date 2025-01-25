<script lang="ts">
import type { SudokuGame } from "../ts"
import { formatTime } from "../utils/formatTime";

let {
	game = $bindable(),
	isPaused = $bindable(false),
}: {
	game: SudokuGame
	isPaused: boolean
} = $props()


</script>

<div class="mb-4 flex justify-between items-center dark:text-white">
    <div>Mistakes: {game.mistakes.current} | Total: {game.mistakes.total}</div>
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
