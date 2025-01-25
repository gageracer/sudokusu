<script lang="ts">
import type { SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"
import StatisticsView from "./StatisticView.svelte"

let {
	game = $bindable(),
	darkMode = $bindable(false),
	onResume,
	onReset,
	onNewGame,
	onEnableTutorial,
}: {
	game: SudokuGame
	darkMode: boolean
	onResume: () => void
	onReset: () => void
	onNewGame: () => void
	onEnableTutorial: () => void
} = $props()

let showStats = $state(false)
let currentMode: GameMode | null = $state(null)

function handleReset() {
	onReset()
	onResume()
}

$effect(() => {
	if (!showStats) {
		currentMode = null
	}
})
</script>



<div class="fixed inset-0 z-40 bg-transparent"></div>
<div class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto p-6 rounded-lg text-center min-w-[300px] max-w-2xl w-full mx-4">
        {#if !showStats}
            <h2 class="text-xl font-bold mb-4 dark:text-white">Game Paused</h2>
            <div class="text-sm mb-4 dark:text-gray-300">
                <p>Current Game: {formatTime(game.time.timeElapsed)}</p>
                <p>Total Playtime: {formatTime(game.time.totalTime)}</p>
                <p class="mt-2">Current Mistakes: {game.mistakes.current}</p>
            </div>
            <!-- Dark Mode Toggle -->
            <div class="flex items-center justify-center gap-2 mb-6">
                <button
                    class="px-3 py-1 rounded-full text-sm transition-colors
                        {darkMode
                            ? 'bg-indigo-500 text-white'
                            : 'bg-yellow-500 text-white'}"
                    onclick={() => darkMode = !darkMode}
                >
                    {darkMode ? '🌙 Dark' : '☀️ Light'}
                </button>
                <button
                    class="px-3 py-1 rounded-full bg-purple-600 text-sm text-white hover:bg-purple-700 transition-colors"
                            onclick={() => {
                                onEnableTutorial();
                                onResume();
                                }}
                >
                Show Tutorial
                </button>
            </div>

            <div class="flex flex-col gap-3">
                {@render menuButton(onResume,"Resume Game","sky")}
                {@render menuButton(() => showStats = true,"Statistics","green")}
                {@render menuButton(onNewGame,"New Game","yellow")}
                {@render menuButton(handleReset,"Reset Game","red")}
            </div>
        {:else}
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold dark:text-white">Statistics</h2>
                <button
                    class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200
                           w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                           flex items-center justify-center"
                    onclick={() => showStats = false}
                >
                    ✕
                </button>
            </div>

            <StatisticsView
                {game}
                bind:currentMode
            />

            <button
                class="mt-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800
                       dark:hover:text-gray-200 text-sm"
                onclick={() => showStats = false}
            >
                Back to Game
            </button>
        {/if}
    </div>
</div>

{#snippet menuButton(onclick:()=> void, text:string, bgColor:string)}
    {console.log(bgColor)}
    <button
        class={`rounded bg-${bgColor}-600 px-4 py-2 text-white hover:bg-${bgColor}-700 transition-colors`}
        {onclick}
    >
        {text}
    </button>
{/snippet}

<style>
    /* Add smooth transitions */
    .fixed {
        transition: opacity 0.2s ease-in-out;
    }

    button {
        transition: all 0.2s ease-in-out;
    }
</style>
