<script lang="ts">
import type { SudokuGame } from "../ts"

let {
	game = $bindable(),
	highlightedNumber,
}: {
	game: SudokuGame
	highlightedNumber: number | null
} = $props()
</script>

<div class="mb-4 flex justify-center gap-4">
    {#if game.remainingNumbers}
        {#each game.remainingNumbers as [number, count]}
            <div class="flex flex-col items-center">
                <span
                    class="text-lg font-bold {highlightedNumber === number ? 'bg-yellow-300 dark:bg-yellow-800' : ''}"
                    class:text-green-500={count === 0}
                    class:dark:text-green-400={count === 0}
                    class:dark:text-white={count !== 0}
                >
                    {number}
                </span>
                <span
                    class="text-sm dark:text-gray-300"
                    class:text-green-500={count === 0}
                    class:dark:text-green-400={count === 0}
                >
                    {count}
                </span>
            </div>
        {/each}
    {/if}
</div>
