<script lang="ts">
import type { SudokuCell } from "./ts"
import { SudokuGame } from "./ts"
import { browser } from "$app/environment"
import Timer from "./components/Timer.svelte"
import GameMenu from "./components/GameMenu.svelte"
import GameHeader from "./components/GameHeader.svelte"
import RemainingNumbers from "./components/RemainingNumbers.svelte"
import WinModal from "./components/WinModal.svelte"
import PauseModal from "./components/PauseModal.svelte"
import SudokuGrid from "./components/SudokuGrid.svelte"
import NumberPad from "./components/NumberPad.svelte"
import Tutorial from "./components/Tutorial.svelte"

import {
	handleKeyboardInput,
	type KeyboardHandlers,
} from "./utils/keyboardControls"
import type { GameMode } from "./ts/types"

const AUTO_PAUSE_TIMEOUT = 30000 // 30 seconds

let gridRef: HTMLDivElement
let isWon = $state(false)
let isGuess = $state(false)
let showMenu = $state(true)

let {
	size = $bindable(),
	darkMode = $bindable(false),
}: { size: GameMode; darkMode?: boolean } = $props()

let isMobile = $derived(
	browser &&
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		),
)

//Tutorial Stuff
let showTutorial = $state(false)

function handleTutorialComplete() {
	showTutorial = false
	localStorage.setItem("tutorial-completed", "true")
}
function handleTutorialSkip() {
	showTutorial = false
	localStorage.setItem("tutorial-completed", "true")
}

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

function handleNewGame(selectedSize: GameMode) {
	size = selectedSize
	handleReset()
	showMenu = false

	// Start tutorial if it's never been completed
	if (localStorage.getItem("tutorial-completed") !== "true") {
		showTutorial = true
	}
}

function handleContinueGame() {
	showMenu = false
	isPaused = false
}

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

function toggleGuessMode() {
	isGuess = !isGuess
}

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
	const handlers: KeyboardHandlers = {
		onNumberSelect: handleNumberSelect,
		onToggleGuess: toggleGuessMode,
		onTogglePause: () => (isPaused = !isPaused),
		onMoveCursor: (moveX, moveY) => {
			if (!selectedCell) return

			const x = selectedCell.x
			const y = selectedCell.y

			const newCell = game.sudoku.get(size * (y + moveY - 1) + (x + moveX))

			if (newCell) {
				handleCellClick(newCell)
			}
		},
	}

	game.updateInteraction()
	handleKeyboardInput(event, handlers, isPaused, size)
}

function handleCellClick(cell: SudokuCell) {
	if (isPaused) return
	game.updateInteraction()
	// If cell has a value, highlight it
	if (cell.val !== 0) {
		highlightedNumber = cell.val
	}

	// Always allow selection of any cell
	selectedCell = cell
}

async function handleNumberSelect(num: number) {
	if (isPaused) return
	game.updateInteraction()
	highlightedNumber = num || null

	if (!selectedCell) return

	// If selected cell is fixed, don't modify it
	if (selectedCell.isFixed) return

	const isValidGuess =
		!isGuess && (num === 0 || game.isValid(selectedCell.x, selectedCell.y, num))
	const id = size * (selectedCell.y - 1) + selectedCell.x
	const cell = game.sudoku.get(id)

	if (cell) {
		if (isGuess) {
			cell.guess?.has(num) ? cell.guess?.delete(num) : cell.guess?.add(num)
		} else {
			cell.val = num
			// Always update isValid
			cell.isValid = isValidGuess
			// Only make it fixed if it's a correct guess
			if (isValidGuess && num !== 0) {
				cell.isFixed = true
				cell.guess?.clear()
				game.updateGuessesInBox(selectedCell.x, selectedCell.y, num)
			} else {
				// Ensure cell stays unfixed if wrong or erased
				cell.isFixed = false
			}
		}
	}
	// Check completion after state updates
	const isComplete = await game.checkAndHandleCompletion()
	if (isComplete) {
		selectedCell = null
		highlightedNumber = null
		isWon = true
	}

	game.saveGame()
}

function isNumberDisabled(num: number): boolean {
	if (!selectedCell) return false
	return usedNumbersInBox.has(num)
}
</script>

{#if showTutorial && !showMenu && !isPaused}
    <Tutorial
        {game}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
    />
{/if}

<Timer
    {game}
    bind:isPaused
    bind:isWon
    autoPauseTimeout={AUTO_PAUSE_TIMEOUT}
/>

<!-- Add Menu component -->
{#if showMenu}
    <GameMenu
        {game}
        {isWon}
        onNewGame={handleNewGame}
        onContinue={handleContinueGame}
    />
{/if}

<GameHeader
    {game}
    bind:isPaused
/>

<RemainingNumbers
    {game}
    bind:highlightedNumber
/>

<!-- Add a win message with reset option -->
{#if isWon && !showMenu}
    <WinModal
        {game}
        {size}
        onReset={handleReset}
        onNextDifficulty={handleNextDifficulty}
        onShowMenu={() => {
                   showMenu = true
               }}
    />
{/if}

<!-- Sudoku grid -->
<SudokuGrid
    {game}
    bind:isGuess
    bind:selectedCell
    bind:highlightedNumber
    onKeydown={handleKeydown}
    onGridClick={handleGridClick}
    onCellClick={handleCellClick}
    onToggleGuess={toggleGuessMode}
/>

 <!-- Pause Overlay -->
 {#if isPaused && !isWon && !showMenu}
     <PauseModal
         {game}
         bind:darkMode
         onReset={handleReset}
         onNewGame={() => {
                    showMenu = true
                    isPaused = false
                }}
         onResume={() => {
             isPaused = false
             game.updateInteraction()
         }}
         onEnableTutorial={() => {
            showTutorial = true
        }}
     />
 {/if}

<!-- Number pad -->
<NumberPad
    {size}
    bind:isGuess
    {isMobile}
    bind:highlightedNumber
    isNumberDisabled={isNumberDisabled}
    onNumberSelect={handleNumberSelect}
    onToggleGuess={toggleGuessMode}
/>
