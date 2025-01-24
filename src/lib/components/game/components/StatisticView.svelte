<script lang="ts">
import type { SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"

let {
	game = $bindable(),
	currentMode = $bindable(),
}: {
	game: SudokuGame
	currentMode: GameMode | null
} = $props()

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
</script>

<div class="space-y-6 text-gray-900 dark:text-white">
    <!-- Mode Selection -->
    <div class="flex flex-wrap justify-center gap-2">
        {#each difficulties as {size, label}}
            <button
                class="px-3 py-1 rounded-full text-sm transition-colors
                    {currentMode === size
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
                onclick={() => currentMode = size}
            >
                {label}
            </button>
        {/each}
    </div>

    <!-- Overall Stats -->
    {#if !currentMode}
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 class="font-bold mb-2">Total Games</h3>
                <p class="text-2xl font-bold text-blue-500 dark:text-blue-400">
                    {game.statistics.totalGamesWon}
                </p>
            </div>
            <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 class="font-bold mb-2">Total Mistakes</h3>
                <p class="text-2xl font-bold text-red-500 dark:text-red-400">
                    {game.statistics.totalMistakes}
                </p>
            </div>
        </div>
    {:else}
    <!-- Mode Stats -->
            <div class="space-y-4">
                <!-- Time Stats -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 class="font-bold mb-2">Best Time</h3>
                        <p class="text-xl font-bold text-green-500 dark:text-green-400">
                            {game.statistics.modes[currentMode].fastestWin 
                                ? formatTime(game.statistics.modes[currentMode].fastestWin)
                                : '--:--'}
                        </p>
                    </div>
                    <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 class="font-bold mb-2">Total Time</h3>
                        <p class="text-xl font-bold">
                            {formatTime(game.statistics.modes[currentMode].totalPlayTime) || "00:00"}
                        </p>
                    </div>
                </div>
    
                <!-- Games Stats -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 class="font-bold mb-2">Games Won</h3>
                        <p class="text-xl font-bold text-blue-500 dark:text-blue-400">
                            {game.statistics.modes[currentMode].gamesWon}
                        </p>
                    </div>
                    <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 class="font-bold mb-2">Mistakes</h3>
                        <p class="text-xl font-bold text-red-500 dark:text-red-400">
                            {game.statistics.modes[currentMode].mistakes}
                        </p>
                    </div>
                </div>
    
                <!-- Performance Distribution -->
                <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
</div>
