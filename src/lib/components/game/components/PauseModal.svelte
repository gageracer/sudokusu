<script lang="ts">
import { fade, fly } from "svelte/transition"
import { getSudokusuContent, type SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"
import StatisticsView from "./StatisticView.svelte"

let {
	darkMode = $bindable(false),
	onResume,
	onReset,
	onNewGame,
	onEnableTutorial,
}: {
	darkMode: boolean
	onResume: () => void
	onReset: () => void
	onNewGame: () => void
	onEnableTutorial: () => void
} = $props()

const game = getSudokusuContent()

let showStats = $state(false)
let currentMode: GameMode | null = $state(null)
let autoPauseEnabled = $derived(game.autoPause > 0)
function handleReset() {
	onReset()
	onResume()
}

$effect(() => {
	if (!showStats) {
		currentMode = null
	}
	game.saveGame()
})
</script>



<div class="fixed inset-0 z-40 bg-transparent"></div>
<div transition:fade={{duration: 500}} class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
    <div in:fly|global={{x:-200}} out:fly|global={{x:200}} class="bg-yellow-50 dark:bg-gray-800 max-h-[90vh] overflow-y-auto p-6 rounded-lg text-center min-w-[300px] max-w-2xl w-full mx-4">
        {#if !showStats}
            <h2 class="text-xl font-bold mb-4 dark:text-white">Game Paused</h2>
            <div class="text-sm mb-4 dark:text-gray-300">
                <p>Current Game: {formatTime(game.time.timeElapsed)}</p>
                <p>Total Playtime: {formatTime(game.time.totalTime)}</p>
                <p class="mt-2">Current Mistakes: {game.mistakes.current}</p>
            </div>

            <!-- Auto Pause Controls -->
            <div class="mb-6 flex flex-col items-center gap-2">
              <label class="flex items-center gap-2 text-sm dark:text-gray-300">
                {autoPauseEnabled ?"Disable":"Enable"} Auto-Pause
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded accent-blue-500"
                  checked={autoPauseEnabled}
                  onclick={()=> game.autoPause = game.autoPause === 0 ? 30:0}
                />
                {#if autoPauseEnabled}
                    <input
                      disabled={!autoPauseEnabled}
                      type="range"
                      min="30"
                      step="5"
                      max="300"
                      class="w-24 px-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      bind:value={game.autoPause}
                    />
                  <div class="flex items-center gap-2">
                    <span class="px-2 text-sm dark:text-gray-300">{game.autoPause} seconds</span>
                  </div>
                {/if}
              </label>


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
                {@render menuButton(onResume,"Resume")}
                {@render menuButton(() => showStats = true,"Statistics","rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors")}
                {@render menuButton(onNewGame,"New Game","rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 transition-colors")}
                {@render menuButton(handleReset,"Reset Game","rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors")}
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

{#snippet menuButton(onclick:()=> void, text:string, btnclass = "rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 transition-colors")}
    <button
        class={btnclass}
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
