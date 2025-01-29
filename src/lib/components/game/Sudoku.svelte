<script lang="ts">
import { getSudokusuContent, setSudokusuContent, SudokuGame, type SudokuCell } from "./ts"
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
import { SvelteSet } from "svelte/reactivity"

const AUTO_PAUSE_TIMEOUT = 60 // 30 seconds

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

setSudokusuContent()
const game = getSudokusuContent()

if (game.size !== 0 && game.size !== size) {
	size = game.size
}

let isPaused = $state(true)
let highlightedNumber: number | null = $state(null)
let selectedCell: SudokuCell = $state({
	x: 0,
	y: 0,
	guess: new SvelteSet([]),
	val: 0,
	isFixed: false,
	isValid: false,
	solution: 0,
})
let usedNumbersInBox = $derived(
	selectedCell.x !== 0
		? game.getUsedNumbersInBox(selectedCell.x, selectedCell.y)
		: new Set<number>(),
)

function handleNewGame(selectedSize: GameMode) {
	size = selectedSize
	handleReset()
	showMenu = false
	isPaused = false
	// Start tutorial if it's never been completed
	if (localStorage.getItem("tutorial-completed") !== "true") {
		showTutorial = true
	}
}

function handleContinueGame() {
	showMenu = false
	isPaused = false
}

$effect(() => {
	if (size !== game.size) {
		selectedCell.x = 0
		highlightedNumber = null
		game.reload(size)
	}
})

function handleReset() {
	game.reset()
	game.time.timeElapsed = 0
	selectedCell = {
		x: 0,
		y: 0,
		guess: new SvelteSet([]),
		val: 0,
		isFixed: false,
		isValid: false,
		solution: 0,
	}
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
	const difficulties: GameMode[] = [2, 4, 6, 8, 9]
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
			if (!selectedCell || selectedCell.x === 0) return

			const x = selectedCell.x
			const y = selectedCell.y
			
			const newCell = game.sudoku.get(game.cellID(x+moveX,y+moveY))

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
	selectedCell = {
		x: cell.x,
		y: cell.y,
		guess: cell.guess,
		val: cell.val,
		isFixed: cell.isFixed,
		isValid: cell.isValid,
		solution: cell.solution,
	}
}

async function handleNumberSelect(num: number) {
    if (isPaused) return
    game.updateInteraction()

    if (!selectedCell || selectedCell.x === 0) return

    // If selected cell is fixed, don't modify it  
    if (selectedCell.isFixed) return

    const id = game.cellID(selectedCell.x, selectedCell.y)
    const cell = game.sudoku.get(id)

    if (cell) {
        if (isGuess) {
            cell.guess?.has(num) ? cell.guess?.delete(num) : cell.guess?.add(num)
        } else {
            cell.val = num
            // Always update isValid
            const isValidGuess = num === 0 || game.isValid(id, num)
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
            
            // Force a reactive update by accessing selectedCell
            selectedCell = {
                ...selectedCell,
                val: cell.val,
                isFixed: cell.isFixed,
                isValid: cell.isValid
            };
        }
    }

    highlightedNumber = num || null
    // Check completion after state updates
    const isComplete = await game.checkAndHandleCompletion()
    if (isComplete) {
        selectedCell = {
            x: 0,
            y: 0,
            guess: new SvelteSet([]),
            val: 0,
            isFixed: false,
            isValid: false,
            solution: 0
        }
        highlightedNumber = null
        isWon = true
    }

    game.saveGame()
}

function isNumberDisabled(num: number): boolean {
	if (!selectedCell || selectedCell.x === 0) return false
	return usedNumbersInBox.has(num)
}
</script>

{#if showTutorial && !showMenu && !isPaused}
    <Tutorial
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
    />
{/if}

<Timer
    bind:isPaused
    bind:isWon
    bind:showTutorial
    autoPauseTimeout={AUTO_PAUSE_TIMEOUT}
/>

<!-- Add Menu component -->
{#if showMenu}
    <GameMenu
        {isWon}
        onNewGame={handleNewGame}
        onContinue={handleContinueGame}
    />
{/if}

<GameHeader
    bind:isPaused
/>

<RemainingNumbers
    {highlightedNumber}
/>

<!-- Add a win message with reset option -->
{#if isWon && !showMenu}
    <WinModal
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
    {isGuess}
    bind:selectedCell
    {highlightedNumber}
    onKeydown={handleKeydown}
    onGridClick={handleGridClick}
    onCellClick={handleCellClick}
    onToggleGuess={toggleGuessMode}
/>

 <!-- Pause Overlay -->
 {#if isPaused && !isWon && !showMenu}
     <PauseModal
         bind:darkMode
         onReset={handleReset}
         onNewGame={() => {
                    showMenu = true
                    isPaused = true
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
