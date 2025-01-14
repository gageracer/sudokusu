<script lang="ts">
import type { SudokuCell } from "./types"
import { SudokuGame } from "./sudoku.svelte.ts"

let {
	size,
	darkMode = $bindable(false),
}: { size: number; darkMode?: boolean } = $props()

let isMobile = $derived(
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	),
)

const game = new SudokuGame()
let currentSize = $state(size)
game.reload(size)
let timeElapsed = $state(0)
let isPaused = $state(false)
let highlightedNumber: number | null = $state(null)
let selectedCell: SudokuCell | null = $state(null)
let usedNumbersInBox = $derived(
	selectedCell
		? game.getUsedNumbersInBox(selectedCell.x, selectedCell.y)
		: new Set<number>(),
)
$inspect("sudoku", game.sudoku)
$effect(() => {
	if (size !== currentSize) {
		currentSize = size
		selectedCell = null
		highlightedNumber = null
		game.reload(size)
	}
})

function handleReset() {
	game.reload(size)
	timeElapsed = 0
	selectedCell = null
	highlightedNumber = null
	isPaused = false
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

// Add timer logic
$effect(() => {
	if (!isPaused) {
		const interval = setInterval(() => {
			timeElapsed++
		}, 1000)

		return () => clearInterval(interval)
	}
})

// Handle keyboard input
function handleKeydown(event: KeyboardEvent) {
	if (isMobile) return

	const key = event.key

	// Handle numbers 1-9 (or 1-4 for smaller grids)
	if (/^[1-9]$/.test(key) && Number.parseInt(key) <= size) {
		handleNumberSelect(Number.parseInt(key))
	}

	// Handle Backspace/Delete for erasing
	if (key === "Backspace" || key === "Delete" || key === "d" || key === "D") {
		handleNumberSelect(0)
	}

	// r for Reset
	if (key === "r" || key === "R") {
		handleReset()
	}
	// space for pause/resume
	if (key === " ") {
		isPaused = !isPaused
	}

	// Handle arrow keys for navigation
	if (
		selectedCell &&
		["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)
	) {
		event.preventDefault() // Prevent page scrolling
		const x = selectedCell.x
		const y = selectedCell.y

		const newCell = game.sudoku.get(
			size * (key === "ArrowUp" ? y - 2 : key === "ArrowDown" ? y : y - 1) +
				(key === "ArrowLeft" ? x - 1 : key === "ArrowRight" ? x + 1 : x),
		)

		if (newCell && !newCell.isFixed) {
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
	// For fixed cells, just highlight the number
	if (cell.isFixed) {
		highlightedNumber = cell.val
		selectedCell = null
		return
	}

	// For non-fixed cells
	if (!cell.isFixed) {
		// If cell has a value, highlight it
		if (cell.val !== 0) {
			highlightedNumber = cell.val
		}

		// Always allow selection of non-fixed cells
		selectedCell = {
			x: cell.x,
			y: cell.y,
			val: cell.val,
			isFixed: cell.isFixed,
			isValid: cell.isValid,
			solution: cell.solution,
		}
	}
}

function handleNumberSelect(num: number) {
	highlightedNumber = num || null

	if (!selectedCell) return

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

	if (game.isPuzzleComplete()) {
		selectedCell = null
		highlightedNumber = null
		isPaused = true
	}
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
	].join(" ")

	// Text color - can be red for wrong answers
	const textColor =
		cell.val !== 0 && !cell.isValid ? "text-red-500" : "dark:text-white"

	// Background colors - can stack with text colors
	const bgClasses = [
		cell.isFixed ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800",
		highlightedNumber === cell.val && cell.val !== 0
			? "bg-yellow-100 dark:bg-yellow-900"
			: "",
		!cell.isFixed &&
		selectedCell &&
		selectedCell.x === cell.x &&
		selectedCell.y === cell.y
			? "bg-blue-50 dark:bg-blue-900"
			: "",
		// Add box highlighting for keyboard navigation
		selectedCell &&
		Math.floor((cell.x - 1) / game.boxSize.width) ===
			Math.floor((selectedCell.x - 1) / game.boxSize.width) &&
		Math.floor((cell.y - 1) / game.boxSize.height) ===
			Math.floor((selectedCell.y - 1) / game.boxSize.height)
			? "bg-blue-50/50 dark:bg-blue-900/50"
			: "",
		game.isPuzzleComplete() ? "bg-green-100 dark:bg-green-900" : "",
	]
		.filter(Boolean)
		.join(" ")

	return `${baseClasses} ${textColor} ${bgClasses}`
}

function isNumberDisabled(num: number): boolean {
	if (!selectedCell) return false
	return usedNumbersInBox.has(num)
}
</script>

<div class="mb-4 flex justify-between items-center dark:text-white">
	<div>Time: {formatTime(timeElapsed)}</div>
	<div>Mistakes: {game.mistakes.current}</div>
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
{#if game.isPuzzleComplete()}
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg text-center dark:text-white">
            <h2 class="text-2xl font-bold mb-4">Congratulations!</h2>
            <p class="mb-4">You completed the puzzle in {formatTime(timeElapsed)} with {game.mistakes.current} mistakes!</p>
            <button
                class="rounded bg-blue-500 px-4 py-2 text-white"
                onclick={handleReset}
            >
                Play Again
            </button>
        </div>
    </div>
{/if}

<!-- Remaining numbers display -->
<div class="mb-4 flex justify-center gap-4">
	{#if game.remainingNumbers}
		{#each game.remainingNumbers as [number, count]}
			<div class="flex flex-col items-center">
				<span class="text-lg font-bold dark:text-white {highlightedNumber === number ? 'bg-yellow-100' : ''}"
					>{number}</span
				>
				<span class="text-sm dark:text-gray-300" class:text-green-500={count === 0} class:dark:text-green-400={count === 0}>{count}</span>
			</div>
		{/each}
	{/if}
</div>

<!-- Sudoku grid -->
<div
	class="mx-auto grid gap-0"
	style:grid-template-columns={`repeat(${size}, minmax(0, 1fr))`}
	style:max-width="500px"
	onkeydown={handleKeydown}
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
</div>

<!-- Number pad -->
<div class="mx-auto mt-4 grid max-w-[500px] grid-cols-5 gap-2">
	{#each Array.from({ length: size }, (_, i) => i + 1) as number}
		<button
			class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg dark:text-white font-bold
        {highlightedNumber === number ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-white dark:bg-gray-800'}
        {isNumberDisabled(number)
				? 'cursor-not-allowed opacity-50'
				: 'hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700'}"
			onclick={() => handleNumberSelect(number)}
			disabled={isNumberDisabled(number)}
		>
			{number}
		</button>
	{/each}
	<button
	class="aspect-square rounded-md border border-gray-300 dark:border-gray-600
            text-lg font-bold dark:text-white
            bg-white dark:bg-gray-800
            hover:bg-gray-100 dark:hover:bg-gray-700"
		onclick={() => handleNumberSelect(0)}
	>
		⌫
	</button>
</div>
<style>
    /* Make the container focusable without outline */
    .container:focus {
        outline: none;
    }
</style>
