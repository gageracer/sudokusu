<script lang="ts">
	import { fade, fly } from "svelte/transition";
import { getSudokusuContent, type SudokuGame } from "../ts"
import type { GameMode } from "../ts/types"
import { formatTime } from "../utils/formatTime"

let {
	size = $bindable(),
	onReset,
	onNextDifficulty,
	onShowMenu,
}: {
	size: GameMode
	onReset: () => void
	onNextDifficulty: (size: GameMode) => void
	onShowMenu: () => void
} = $props()

const game = getSudokusuContent()

const stars = game.getStars(game.mistakes.current)
const modeStats = game.statistics.modes[size]
const isNewRecord = modeStats.fastestWin === game.time.timeElapsed

// Calculate improvement over average time
const previousWins = modeStats.gamesWon - 1 // Excluding current win
const averageTime =
	previousWins > 0
		? (modeStats.totalPlayTime - game.time.timeElapsed) / previousWins
		: null
const timeImprovement = averageTime ? averageTime - game.time.timeElapsed : null
</script>

<div  transition:fade={{duration: 200}} class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center">
    <div  in:fly|global={{y:300}} out:fly|global={{y:-300}} class="bg-white dark:bg-gray-800 p-8 rounded-lg text-center dark:text-white max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold mb-4">Congratulations!</h2>

        <!-- Stars Display -->
        <div class="flex justify-center gap-1 mb-4 text-3xl">
            {#each Array(stars) as _, i}
                <span
                    class="text-yellow-400 dark:text-yellow-500 transform"
                    style="animation: bounce 0.5s {i * 0.1}s"
                >
                    ★
                </span>
            {/each}
            {#each Array(4 - stars) as _}
                <span class="text-gray-300 dark:text-gray-600">★</span>
            {/each}
        </div>

        <div class="mb-6 space-y-4">
            <p class="text-lg">
                {size}×{size} puzzle completed!
            </p>

            <!-- Time Stats -->
            <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Your Time</p>
                        <p class="font-bold text-lg {isNewRecord ? 'text-green-500 dark:text-green-400' : ''}">
                            {formatTime(game.time.timeElapsed)}
                            {#if isNewRecord}
                                <span class="text-xs ml-1">New Record!</span>
                            {/if}
                        </p>
                        {#if timeImprovement && timeImprovement > 0}
                            <p class="text-xs text-green-500 dark:text-green-400">
                                {formatTime(timeImprovement)} faster than your average!
                            </p>
                        {/if}
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Mistakes</p>
                        <p class="font-bold text-lg {game.mistakes.current === 0
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'}">
                            {game.mistakes.current}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Mode Progress -->
            <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 class="font-bold mb-2 text-sm text-gray-600 dark:text-gray-400">Mode Progress</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Games Won</p>
                        <p class="font-bold">{modeStats.gamesWon}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Perfect Games</p>
                        <p class="font-bold text-yellow-500">{modeStats.perfectGames}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-3">
            <button
                class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
                onclick={onReset}
            >
                Play Again
            </button>

            {#if size < 9}
                {@const sizes = [2, 4, 6, 8, 9] as GameMode[]}
                {@const nextSize = sizes[sizes.indexOf(size) + 1]}
                <button
                    class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors"
                    onclick={() => onNextDifficulty(nextSize)}
                >
                    Try {nextSize}×{nextSize}
                </button>
            {/if}

            <button
                class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 transition-colors"
                onclick={onShowMenu}
            >
                Main Menu
            </button>
        </div>
    </div>
</div>

<style>
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
</style>
