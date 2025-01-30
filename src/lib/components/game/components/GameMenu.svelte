<script lang="ts">
import { getSudokusuContent, type SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"
import StatisticsView from "../components/StatisticView.svelte"
import { fly } from "svelte/transition"

let {
	isWon = false,
	onNewGame,
	onContinue,
}: {
	isWon: boolean
	onNewGame: (size: GameMode) => void
	onContinue: () => void
} = $props()

const game = getSudokusuContent()

let showStats = $state(false)
let currentMode: GameMode | null = $state(null)
const difficulties: { size: GameMode; label: string }[] = [
	{ size: 2, label: "2×2 - Tutorial" },
	{ size: 4, label: "4×4 - Easy" },
	{ size: 6, label: "6×6 - Medium" },
	{ size: 8, label: "8×8 - Hard" },
	{ size: 9, label: "9×9 - Expert" },
]
</script>

<div class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center">
    <div in:fly|global={{x:-200}} out:fly|global={{x:200}} class="bg-yellow-50 dark:bg-gray-800 p-8 rounded-lg text-center dark:text-white max-w-md w-full mx-4">
        {#if !showStats}
            <h1 class="text-3xl font-bold mb-6">Sudoku</h1>

            {#if game.sudoku.size > 0 && !isWon}
                <div class="mb-6">
                    <h2 class="text-xl mb-2">Continue Previous Game?</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {game.size}×{game.size} puzzle
                        <br>
                        Time: {formatTime(game.time.timeElapsed)}
                        <br>
                        Mistakes: {game.mistakes.current}
                    </p>
                </div>
                <div class="flex flex-col gap-4">
                    <button
                        class="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        onclick={onContinue}
                    >
                        Continue
                    </button>
                    <button
                        class="w-full py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        onclick={() => showStats = true}
                    >
                        Statistics
                    </button>
                    <h3 class="text-lg font-bold mt-4 mb-2">New Game</h3>
                    <div class="grid grid-cols-1 gap-2">
                        {#each difficulties as {size, label}}
                            <button
                                class="w-full py-2 px-4 bg-yellow-300 dark:bg-gray-700 rounded-lg
                                       hover:bg-yellow-500 dark:hover:bg-gray-600 transition-colors"
                                onclick={() => onNewGame(size)}
                            >
                                {label}
                            </button>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="flex flex-col gap-4">
                    <h2 class="text-xl mb-2">Select Difficulty</h2>
                    {#each difficulties as {size, label}}
                        <button
                            class="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            onclick={() => onNewGame(size)}
                        >
                            {label}
                        </button>
                    {/each}
                    <button
                        class="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800
                               dark:hover:text-gray-200"
                        onclick={() => showStats = true}
                    >
                        View Statistics
                    </button>
                </div>
            {/if}
        {:else}
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Statistics</h2>
                <button
                    class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    onclick={() => showStats = false}
                >
                    Back
                </button>
            </div>
            <StatisticsView
                bind:currentMode
            />
        {/if}
    </div>
</div>
