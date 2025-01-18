<script lang="ts">
import type { SudokuCell } from "./types"
import { SudokuGame } from "./sudoku.svelte.ts"
import { browser } from "$app/environment"

const AUTO_PAUSE_TIMEOUT = 30000 // 30 seconds

const numberKeyMap: Record<string, number> = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	q: 5,
	w: 6,
	e: 7,
	r: 8,
	t: 9,
}

let gridRef: HTMLDivElement
let isWon = $state(false)

let {
	size = $bindable(),
	darkMode = $bindable(false),
}: { size: number; darkMode?: boolean } = $props()

let isMobile = $derived(
	browser &&
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		),
)

const game = new SudokuGame()

if (game.size !== 0 && game.size !== size) {
	size = game.size
}

let isPaused = $state(true)
let highlightedNumber: number | null = $state(null)
let selectedCell: SudokuCell | null = $state(null)
let usedNumbersInBox = $derived(
	selectedCell
		? game.getUsedNumbersInBox(selectedCell.x, selectedCell.y)
		: new Set<number>(),
)

$inspect("sudoku", size)
$effect(() => {
	if (size !== game.size) {
		selectedCell = null
		highlightedNumber = null
		game.reload(size)
		// console.log("size cange", size, game.size, game.sudoku)
	}
})

function handleReset() {
	game.reset()
	game.time.timeElapsed = 0
	selectedCell = null
	highlightedNumber = null
	isPaused = false
	isWon = false
}

$effect(() => {
	const savedPreference = localStorage.getItem("sudoku-dark-mode")
	if (savedPreference !== null) {
		darkMode = savedPreference === "true"
	} else {
		darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
	}
})

function toggleDarkMode() {
	darkMode = !darkMode
	localStorage.setItem("sudoku-dark-mode", String(darkMode))
}
// Add auto-pause effect
$effect(() => {
	if (!isPaused) {
		const checkInactivity = setInterval(() => {
			const timeSinceLastInteraction = Date.now() - game.lastInteractionTime
			if (timeSinceLastInteraction >= AUTO_PAUSE_TIMEOUT) {
				isPaused = true
			}
		}, 1000)

		return () => clearInterval(checkInactivity)
	}
})
// Add timer logic
$effect(() => {
	if (!isPaused) {
		const checkInactivity = setInterval(() => {
			if (!isWon) {
				// Don't auto-pause if game is won
				game.updateTime()
				const timeSinceLastInteraction = Date.now() - game.lastInteractionTime
				if (timeSinceLastInteraction >= AUTO_PAUSE_TIMEOUT) {
					isPaused = true
				}
			}
		}, 1000)

		return () => clearInterval(checkInactivity)
	}
})

function handleGridClick() {
	gridRef?.focus()
}

function handleNextDifficulty() {
	const difficulties = [2, 4, 6, 8, 9]
	const currentIndex = difficulties.indexOf(size)
	if (currentIndex < difficulties.length - 1) {
		size = difficulties[currentIndex + 1]
	}
	handleReset()
}

// Handle keyboard input
function handleKeydown(event: KeyboardEvent) {
	// Prevent all inputs except space when paused
	if (isPaused && event.key !== " ") {
		return
	}
	game.updateInteraction()
	const key = event.key.toLowerCase()

	// Handle mapped number keys
	if (key in numberKeyMap) {
		const num = numberKeyMap[key]
		if (num <= size) {
			handleNumberSelect(num)
		}
		return
	}

	// Handle Backspace/Delete for erasing
	if (key === "backspace" || key === "delete" || key === "d") {
		handleNumberSelect(0)
	}

	// space for pause/resume
	if (key === " ") {
		isPaused = !isPaused
	}

	// Handle arrow keys for navigation
	if (
		selectedCell &&
		["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
	) {
		event.preventDefault() // Prevent page scrolling
		const x = selectedCell.x
		const y = selectedCell.y

		const newCell = game.sudoku.get(
			size * (key === "arrowup" ? y - 2 : key === "arrowdown" ? y : y - 1) +
				(key === "arrowleft" ? x - 1 : key === "arrowright" ? x + 1 : x),
		)

		if (newCell) {
			handleCellClick(newCell)
		}
	}
}
function formatTime(seconds: number) {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, "0")}`
}

function handleCellClick(cell: SudokuCell) {
	if (isPaused) return
	game.updateInteraction()
	// If cell has a value, highlight it
	if (cell.val !== 0) {
		highlightedNumber = cell.val
	}

	// Always allow selection of any cell
	selectedCell = {
		x: cell.x,
		y: cell.y,
		val: cell.val,
		isFixed: cell.isFixed,
		isValid: cell.isValid,
		solution: cell.solution,
	}
}

function handleNumberSelect(num: number) {
	if (isPaused) return
	game.updateInteraction()
	highlightedNumber = num || null

	if (!selectedCell) return

	// If selected cell is fixed, don't modify it
	if (selectedCell.isFixed) return

	const isValidGuess =
		num === 0 || game.isValid(selectedCell.x, selectedCell.y, num)
	const id = size * (selectedCell.y - 1) + selectedCell.x
	const cell = game.sudoku.get(id)

	if (cell) {
		cell.val = num
		// Always update isValid
		cell.isValid = isValidGuess
		// Only make it fixed if it's a correct guess
		if (isValidGuess && num !== 0) {
			cell.isFixed = true
		} else {
			// Ensure cell stays unfixed if wrong or erased
			cell.isFixed = false
		}
	}
	isPaused = false
	if (game.isPuzzleComplete()) {
		selectedCell = null
		highlightedNumber = null
		isWon = true
	}

	game.saveGame()
}

function getCellClasses(cell: SudokuCell) {
	const baseClasses = [
		"aspect-square",
		"w-full",
		"text-center",
		"text-lg",
		"font-bold",
		"border",
		"border-gray-300 dark:border-gray-600",
		"focus:outline-none",
		cell.isFixed ? "" : "focus:bg-blue-50 dark:focus:bg-blue-900",
	]

	// Border classes for box borders
	const borderClasses = [
		game.getBoxBorders(cell.x, cell.y).thickRight
			? "border-r-2 border-r-black dark:border-r-yellow-800"
			: "",
		game.getBoxBorders(cell.x, cell.y).thickBottom
			? "border-b-2 border-b-black dark:border-b-yellow-800"
			: "",
	]

	// Selected cell highlight
	if (selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y) {
		baseClasses.push("ring-2 ring-blue-500 dark:ring-blue-400 z-10")
	}

	// Text color - can be red for wrong answers
	const textColor =
		cell.val !== 0 && !cell.isValid ? "text-red-500" : "dark:text-white"

	// Background colors
	const bgClasses = [
		cell.isFixed ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800",
		highlightedNumber === cell.val && cell.val !== 0
			? "bg-yellow-100 dark:bg-yellow-900"
			: "",
		selectedCell &&
		Math.floor((cell.x - 1) / game.boxSize.width) ===
			Math.floor((selectedCell.x - 1) / game.boxSize.width) &&
		Math.floor((cell.y - 1) / game.boxSize.height) ===
			Math.floor((selectedCell.y - 1) / game.boxSize.height)
			? "bg-blue-50/50 dark:bg-blue-900/50"
			: "",
		game.isPuzzleComplete() ? "bg-green-100 dark:bg-green-900" : "",
	]

	return [...baseClasses, ...borderClasses, textColor, ...bgClasses]
		.filter(Boolean)
		.join(" ")
}

function isNumberDisabled(num: number): boolean {
	if (!selectedCell) return false
	return usedNumbersInBox.has(num)
}
</script>

<div class="mb-4 flex justify-between items-center dark:text-white">
    <div>Mistakes: {game.mistakes.current} | Total: {game.mistakes.total}</div>
    <div>Time: {formatTime(game.time.timeElapsed)}</div>
	 <div class="flex gap-2">
	<button class="rounded bg-sky-800 px-4 py-2 text-white" onclick={() => (isPaused = !isPaused)}>
		{isPaused ? 'Resume' : 'Pause'}
	</button>
    <button
            class="rounded bg-red-500 px-4 py-2 text-white"
            onclick={handleReset}
            >
            Reset
    </button>
    <button
        class="rounded px-4 py-2 text-white"
        class:bg-yellow-500={!darkMode}
        class:bg-indigo-500={darkMode}
        onclick={toggleDarkMode}
    >
        {darkMode ? '☀️' : '🌙'}
    </button>
    </div>
</div>

<!-- Add a win message with reset option -->
{#if isWon}
    <div class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg text-center dark:text-white">
            <h2 class="text-2xl font-bold mb-4">Congratulations!</h2>
            <p class="mb-4">
                You completed {size}x{size} puzzle in {formatTime(game.time.timeElapsed)}
                <br>
                with {game.mistakes.current} mistakes
                and {game.mistakes.total} total!
            </p>
            <div class="flex gap-4 justify-center">
                <button
                    class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onclick={handleReset}
                >
                    Play Again
                </button>
                {#if size < 9}
                     {@const sizes = [2, 4, 6, 8, 9]}
                     {@const nextSize = sizes[sizes.indexOf(size) + 1]}
                    <button
                        class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                        onclick={handleNextDifficulty}
                    >
                        Next Size ({nextSize}x{nextSize})

                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Remaining numbers display -->
<div class="mb-4 flex justify-center gap-4">
	{#if game.remainingNumbers}
		{#each game.remainingNumbers as [number, count]}
			<div class="flex flex-col items-center">
				<span class="text-lg font-bold {highlightedNumber === number ? 'bg-yellow-300 dark:bg-yellow-800' : ''}" class:text-green-500={count === 0} class:dark:text-green-400={count === 0} class:dark:text-white ={count !== 0}
					>{number}</span
				>
				<span class="text-sm dark:text-gray-300" class:text-green-500={count === 0} class:dark:text-green-400={count === 0}>{count}</span>
			</div>
		{/each}
	{/if}
</div>

<!-- Sudoku grid -->
<div
    bind:this={gridRef}
    class="mx-auto grid gap-0 relative rounded-md"
	style:grid-template-columns={`repeat(${game.size}, minmax(0, 1fr))`}
	style:max-width="500px"
	onkeydown={handleKeydown}
	onclick={handleGridClick}
	role="button"
	tabindex="0"
>
	{#each game.sudoku.values() as cell}
    	<input
        readonly
        value={cell.val || ''}
        data-fixed={cell.isFixed}
        class={getCellClasses(cell)}
           class:border-r-2={game.getBoxBorders(cell.x, cell.y).thickRight}
           class:border-b-2={game.getBoxBorders(cell.x, cell.y).thickBottom}
           class:border-r-black={game.getBoxBorders(cell.x, cell.y).thickRight}
           class:border-b-black={game.getBoxBorders(cell.x, cell.y).thickBottom}
           class:dark:border-r-yellow-800={game.getBoxBorders(cell.x, cell.y).thickRight}
           class:dark:border-b-yellow-800={game.getBoxBorders(cell.x, cell.y).thickBottom}
        onclick={() => handleCellClick(cell)}
    />
	{/each}

 <!-- Pause Overlay -->
 {#if isPaused && !isWon}
     <!-- Add backdrop overlay -->
     <div class="fixed inset-0 z-40 bg-transparent"></div>
     <div class="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm
                 flex items-center justify-center">
         <div class="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
             <h2 class="text-xl font-bold mb-4 dark:text-white">Game Paused</h2>
             <div class="text-sm mb-4 dark:text-gray-300">
                 <p>Current Time: {formatTime(game.time.timeElapsed)}</p>
                 <p>Total Time: {formatTime(game.time.totalTime)}</p>
             </div>
             <button
                 class="rounded bg-sky-800 px-4 py-2 text-white hover:bg-sky-700"
                 onclick={() => {
                     isPaused = false;
                     game.updateInteraction();
                 }}
             >
                 Resume Game
             </button>
         </div>
     </div>
 {/if}
</div>

<!-- Number pad -->
<div class="mx-auto mt-4 grid max-w-[500px] grid-cols-5 gap-2">
	{#each Array.from({ length: size }, (_, i) => i + 1) as number}
		<button
			class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg dark:text-white font-bold grid place-items-center relative
        {highlightedNumber === number ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-white dark:bg-gray-800'}
        {isNumberDisabled(number)
				? 'cursor-not-allowed opacity-50'
				: 'hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700'}"
			onclick={() => handleNumberSelect(number)}
			disabled={isNumberDisabled(number)}
		>
		    <div class="flex flex-col items-center h-4 justify-start">
			<span class="leading-none mb-1">{number}</span>
		    {#if !isMobile && number > 4}
                <span class="text-xs opacity-50 leading-none">
                    {number === 5 ? 'Q' :
                     number === 6 ? 'W' :
                     number === 7 ? 'E' :
                     number === 8 ? 'R' :
                     number === 9 ? 'T' : ''}
                </span>
            {/if}
		    </div>
		</button>
	{/each}
	<button
	class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg font-bold dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 grid place-items-center"
		onclick={() => handleNumberSelect(0)}
	>
    	<div class="flex flex-col items-center h-4 justify-start">
            <span class="leading-none mb-1">⌫</span>
            {#if !isMobile}
                <span class="text-[10px] leading-none opacity-50">D</span>
            {/if}
        </div>
	</button>
</div>

<style>
    div[tabindex="0"] {
         transition: all 0.1s ease-in-out;
     }

     input {
         transition: all 0.1s ease-in-out;
     }
</style>
