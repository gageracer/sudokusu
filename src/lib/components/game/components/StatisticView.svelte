<script lang="ts">
import { getSudokusuContent, type SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"

let {
	currentMode = $bindable(),
}: {
	currentMode: GameMode | null
} = $props()

const game = getSudokusuContent()

const difficulties: { size: GameMode; label: string }[] = [
	{ size: 2, label: "2×2 Tutorial" },
	{ size: 4, label: "4×4 Easy" },
	{ size: 6, label: "6×6 Medium" },
	{ size: 8, label: "8×8 Hard" },
	{ size: 9, label: "9×9 Expert" },
]

function getStarDistribution(mode: GameMode) {
	const stats = game.statistics.modes[mode]
	return [
		{ stars: 4, count: stats.perfectGames },
		{ stars: 3, count: stats.threeStarGames },
		{ stars: 2, count: stats.twoStarGames },
		{ stars: 1, count: stats.oneStarGames },
	]
}

function totalTime(currentMode: GameMode) {
	return formatTime(game.statistics.modes[currentMode].totalPlayTime) || "00:00"
}

function bestTime(currentMode: GameMode) {
	return game.statistics.modes[currentMode].fastestWin
		? formatTime(game.statistics.modes[currentMode].fastestWin)
		: "--:--"
}
</script>

<div class="space-y-6 text-gray-900 dark:text-white">
    <!-- Mode Selection -->
    <div class="flex flex-wrap justify-center gap-2">
        {#each difficulties as {size, label}}
            <button
                class="px-3 py-1 rounded-full text-sm transition-colors
                    {currentMode === size
                        ? 'bg-yellow-500 dark:bg-blue-600 text-white'
                        : 'bg-yellow-200  dark:bg-gray-700 hover:bg-yellow-400  dark:hover:bg-gray-600'}"
                onclick={() => currentMode = size}
            >
                {label}
            </button>
        {/each}
    </div>

    <svelte:boundary>
    {@const stat = game.statistics}
    <!-- Overall Stats -->
    {#if !currentMode}
        <div class="grid grid-cols-2 gap-4">

            {@render stats("Total Games",stat.totalGamesWon)}
            {@render stats("Total Mistakes",stat.totalMistakes,"text-2xl font-bold text-red-500 dark:text-red-400")}
        </div>
    {:else}
    <!-- Mode Stats -->
            <div class="space-y-4">
                <!-- Time Stats -->
                <div class="grid grid-cols-2 gap-4">
                    {@render stats("Best Time",
                      bestTime(currentMode),
                      "text-xl font-bold text-green-500 dark:text-green-400")}
                    {@render stats("Total Time",
                      totalTime(currentMode),
                      "text-xl font-bold")}
                </div>

                <!-- Games Stats -->
                <div class="grid grid-cols-2 gap-4">
                    {@render stats("Games Won",
                      stat.modes[currentMode].gamesWon,
                      "text-xl font-bold text-blue-500 dark:text-blue-400")}
                    {@render stats("Mistakes",
                      stat.modes[currentMode].mistakes,
                      "text-xl font-bold text-red-500 dark:text-red-400")}
                </div>

                <!-- Performance Distribution -->
                <div class="bg-yellow-300/25 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 class="font-bold mb-3">Performance</h3>
                    <div class="space-y-2">
                        {#each getStarDistribution(currentMode) as { stars, count }}
                            <div class="flex justify-between items-center">
                                <div class="flex gap-1">
                                    {#each Array(stars) as _}
                                        <span class="text-yellow-400 dark:text-yellow-500">★</span>
                                    {/each}
                                </div>
                                <span class="font-bold">{count}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </svelte:boundary>
    <div class="flex justify-center items-center mt-4 text-gray-500 dark:text-gray-400">
        <a
          href="https://github.com/gageracer/sudokusu"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          title="View source on GitHub"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span class="text-sm font-medium">View on GitHub</span>
        </a>
      </div>
</div>

{#snippet stats(name:string,data:string|number,
    dataclass="text-2xl font-bold text-blue-500 dark:text-blue-400",
    nameclass="font-bold mb-2")}
    <div class="bg-yellow-300/25 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class={nameclass}>{name}</h3>
        <p class={dataclass}>
            {data}
        </p>
    </div>
{/snippet}
