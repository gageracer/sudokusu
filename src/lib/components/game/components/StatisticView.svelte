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

function totalTime(currentMode: GameMode){
  return formatTime(game.statistics.modes[currentMode].totalPlayTime) || "00:00"
}

function bestTime(currentMode: GameMode){
  return game.statistics.modes[currentMode].fastestWin
    ? formatTime(game.statistics.modes[currentMode].fastestWin)
    : '--:--'
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