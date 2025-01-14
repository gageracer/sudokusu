import { SvelteMap } from "svelte/reactivity"
import type { BoxSize, MistakeCount, SudokuCell } from "./types"

const GAME = "sudokusu"
const GRIDSIZE: Map<number, BoxSize> = new Map([
	[9, { width: 3, height: 3 }], // 3x3 boxes
	[8, { width: 4, height: 2 }], // 4x2 boxes
	[6, { width: 3, height: 2 }], // 3x2 boxes
	[4, { width: 2, height: 2 }], // 2x2 boxes
	[2, { width: 2, height: 1 }], // 2x1 boxes
])

export class SudokuGame {
	sudoku: SvelteMap<number, SudokuCell> = new SvelteMap()
	mistakes: MistakeCount = $state({ current: 0, total: 0 })
	size = $state(0)
	remainingNumbers = new SvelteMap<number, number>()
	boxSize = $derived(this.getBoxSize())

	reload(size = 9) {
		this.size = size
		this.generateSudoku()
		this.mistakes.current = 0
		this.calculateRemainingNumbers()
	}

	getBoxSize(): BoxSize {
		return GRIDSIZE.get(this.size) ?? { width: 3, height: 3 }
	}

	reduceRemainingNumbers(val: number) {
		this.remainingNumbers?.set(val, 
		(this.remainingNumbers.get(val) - 1 > 0 ? this.remainingNumbers.get(val) - 1: 0))
	}

	calculateRemainingNumbers() {
		this.remainingNumbers.clear()

		// Initialize counts
		for (let i = 1; i <= this.size; i++) {
			this.remainingNumbers.set(i, this.size)
		}

		// Subtract used numbers
		for (const cell of this.sudoku.values()) {
			if (cell.isFixed) {
				const current = this.remainingNumbers.get(cell.val) ?? 0
				this.remainingNumbers.set(cell.val, current - 1)
			}
		}
	}

	private isValidPlacement(
		grid: Map<number, number>,
		x: number,
		y: number,
		num: number,
	): boolean {
		if (num > this.size) return false

		// Check row
		for (let i = 1; i <= this.size; i++) {
			const id = this.size * (y - 1) + i
			if (i !== x && grid.get(id) === num) return false
		}

		// Check column
		for (let i = 1; i <= this.size; i++) {
			const id = this.size * (i - 1) + x
			if (i !== y && grid.get(id) === num) return false
		}

		// Check box
		const boxStartX =
			Math.floor((x - 1) / this.boxSize.width) * this.boxSize.width + 1
		const boxStartY =
			Math.floor((y - 1) / this.boxSize.height) * this.boxSize.height + 1

		for (let i = boxStartY; i < boxStartY + this.boxSize.height; i++) {
			for (let j = boxStartX; j < boxStartX + this.boxSize.width; j++) {
				const id = this.size * (i - 1) + j
				if (x !== j && y !== i && grid.get(id) === num) return false
			}
		}

		return true
	}

	private generateFullSolution(): Map<number, number> {
		const solution = new Map<number, number>()

		// Initialize empty grid
		for (let y = 1; y <= this.size; y++) {
			for (let x = 1; x <= this.size; x++) {
				const id = this.size * (y - 1) + x
				solution.set(id, 0)
			}
		}

		this.fillGrid(solution, 1)
		return solution
	}

	private fillGrid(grid: Map<number, number>, position: number): boolean {
		if (position > this.size * this.size) return true

		const y = Math.floor((position - 1) / this.size) + 1
		const x = ((position - 1) % this.size) + 1
		const numbers = Array.from({ length: this.size }, (_, i) => i + 1)

		// Shuffle numbers for randomization
		for (let i = numbers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
		}

		for (const num of numbers) {
			if (this.isValidPlacement(grid, x, y, num)) {
				grid.set(position, num)
				if (this.fillGrid(grid, position + 1)) return true
				grid.set(position, 0)
			}
		}

		return false
	}

	generateSudoku(): void {
		const solution = this.generateFullSolution()
		this.sudoku.clear()

		// Create the puzzle by selectively hiding numbers
		for (let y = 1; y <= this.size; y++) {
			for (let x = 1; x <= this.size; x++) {
				const id = this.size * (y - 1) + x
				const solutionNum = solution.get(id) ?? 0
				const isFixed = Math.random() > 0.6

				this.sudoku.set(id, {
					x,
					y,
					val: isFixed ? solutionNum : 0,
					isFixed: isFixed,
					isValid: true,
					solution: solutionNum,
				})
			}
		}
	}

	isValid(x: number, y: number, num: number): boolean {
		const id = this.size * (y - 1) + x
		const cell = this.sudoku.get(id)
		const result = cell?.solution === num
		if (!result && num !== 0) {
			this.mistakes.current++
			this.mistakes.total++
		}
		if (result) this.reduceRemainingNumbers(num)
		return result
	}

	// Add method to get numbers already in a box
	getUsedNumbersInBox(x: number, y: number): Set<number> {
		const boxStartX =
			Math.floor((x - 1) / this.boxSize.width) * this.boxSize.width + 1
		const boxStartY =
			Math.floor((y - 1) / this.boxSize.height) * this.boxSize.height + 1
		const usedNumbers = new Set<number>()

		for (let i = boxStartY; i < boxStartY + this.boxSize.height; i++) {
			for (let j = boxStartX; j < boxStartX + this.boxSize.width; j++) {
				const id = this.size * (i - 1) + j
				const cell = this.sudoku.get(id)
				if (cell?.val > 0) {
					usedNumbers.add(cell.val)
				}
			}
		}

		return usedNumbers
	}

	getBoxBorders(x: number, y: number) {
		const boxRow = Math.floor((y - 1) / this.boxSize.height)
		const boxCol = Math.floor((x - 1) / this.boxSize.width)

		return {
			thickRight: x === this.boxSize.width * (boxCol + 1) && x !== this.size,
			thickBottom: y === this.boxSize.height * (boxRow + 1) && y !== this.size,
		}
	}

	isPuzzleComplete(): boolean {
		return Array.from(this.remainingNumbers.values()).every(
			(count) => count === 0,
		)
	}

	saveGame(): void {
		const gameState = {
			size: this.size,
			sudoku: Array.from(this.sudoku.entries()),
			remainingNumbers: Array.from(this.remainingNumbers.entries()),
			// timeElapsed,
			// hintsRemaining: this.hintsRemaining,
			// difficulty: this.difficulty
		}
		localStorage.setItem("savedGame", JSON.stringify(gameState))
	}

	loadGame(): boolean {
		const saved = localStorage.getItem("savedGame")
		if (!saved) return false

		const gameState = JSON.parse(saved)
		this.size = gameState.size
		this.sudoku = new SvelteMap(gameState.sudoku)
		this.remainingNumbers = new SvelteMap(gameState.remainingNumbers)
		// this.hintsRemaining = gameState.hintsRemaining;
		// this.difficulty = gameState.difficulty;
		// timeElapsed = gameState.timeElapsed;
		return true
	}
}

// const GAME_KEY = Symbol(GAME)

// export function initGame(size = 9) {
// 	browser && setContext(GAME_KEY, new SudokuGame(size))
// }

// export function getGame() {
// 	return browser ? getContext<SudokuGame>(GAME_KEY) : new SudokuGame(9)
// }
