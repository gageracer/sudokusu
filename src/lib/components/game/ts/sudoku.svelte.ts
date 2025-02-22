import { SvelteMap, SvelteSet } from "svelte/reactivity"
import {
	type BoxSize,
	type GameMode,
	type MistakeCount,
	type SudokuCell,
	type TimeCount,
	type Statistics,
  DEFAULT_STATISTICS,
  type gameState,
} from "./types"
import {
	storeInIndexedDB,
	fetchFromIndexedDB,
	saveTime,
	loadTime,
	GAME_STORE,
} from "./indexedDB"

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
	statistics: Statistics = $state(DEFAULT_STATISTICS)
	autoPause: number = $state(60)
	size: GameMode | 0 = $state(0)
	init = $state(true)
	time: TimeCount = $state({ timeElapsed: 0, totalTime: 0 })
	lastInteractionTime = $state(Date.now())
	remainingNumbers = new SvelteMap<number, number>()
	boxSize = $derived(this.getBoxSize())

	constructor() {
		Promise.all([this.loadGame(), this.loadTime(), this.loadStatistics()])
			.then(([loaded]) => {
				if (!loaded) {
					this.reload() // Default size if no saved game
				}
				this.init = false
			})
			.catch(console.error)
	}

	async reload(size = 9) {
		if (this.init) return
		if (size !== this.size) {
			this.size = size as GameMode
			this.generateSudoku()
			this.mistakes.current = 0
			this.time.timeElapsed = 0
			this.calculateRemainingNumbers()
			this.saveGame()
			this.saveStatistics()
		}
	}
	async reset() {
		this.generateSudoku()
		this.mistakes.current = 0
		this.calculateRemainingNumbers()
		this.saveGame()
		this.saveStatistics()
	}

	// Add method to update time
	updateTime() {
		this.time.timeElapsed++
		this.time.totalTime++

		const mode = this.size as GameMode
		this.statistics.modes[mode].totalPlayTime++

		this.saveTime().catch(console.error)
	}

	// Update interaction time
	updateInteraction() {
		this.lastInteractionTime = Date.now()
	}

	getStars(mistakes: number): number {
		if (mistakes === 0) return 4
		if (mistakes <= 2) return 3
		if (mistakes <= 4) return 2
		return 1
	}

	async loadTime(): Promise<void> {
		const loadedTime = await loadTime()
		this.time = {
			timeElapsed: loadedTime.timeElapsed ?? 0,
			totalTime: loadedTime.totalTime ?? 0,
		}
	}

	getBoxSize(): BoxSize {
		return GRIDSIZE.get(this.size) ?? { width: 3, height: 3 }
	}

	reduceRemainingNumbers(val: number) {
		const currentCount = this.remainingNumbers.get(val) ?? 0
		this.remainingNumbers.set(val, currentCount - 1 > 0 ? currentCount - 1 : 0)
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

	private async loadStatistics(): Promise<void> {
		const stats = (await fetchFromIndexedDB("statistics")) as Statistics
		if (stats) {
			this.statistics = stats
		}
	}

	private async saveStatistics(): Promise<void> {
		await storeInIndexedDB("statistics", this.statistics)
	}

	async handleGameWon() {
		const mode = this.size as GameMode
		const modeStats = this.statistics.modes[mode]

		modeStats.gamesWon++
		modeStats.mistakes += this.mistakes.current

		switch (this.getStars(this.mistakes.current)) {
			case 4:
				modeStats.perfectGames++
				break
			case 3:
				modeStats.threeStarGames++
				break
			case 2:
				modeStats.twoStarGames++
				break
			case 1:
				modeStats.oneStarGames++
				break
		}

		if (!modeStats.fastestWin || this.time.timeElapsed < modeStats.fastestWin) {
			modeStats.fastestWin = this.time.timeElapsed
		}
		if (!modeStats.longestWin || this.time.timeElapsed > modeStats.longestWin) {
			modeStats.longestWin = this.time.timeElapsed
		}

		this.statistics.totalMistakes += this.mistakes.current
		this.statistics.totalGamesWon++

		await this.saveStatistics()
	}

	generateSudoku(): void {
		const solution = this.generateFullSolution()
		this.sudoku.clear()

		// Calculate minimum and maximum numbers to show based on grid size
		const totalCells = this.size * this.size
		const minNumbers = Math.max(
			Math.floor(totalCells * 0.3), // At least 30%
			this.size > 2 ? this.size : 2, // At least 2 numbers for 2x2
		)
		const maxNumbers = Math.floor(totalCells * 0.7) // Never more than 70% filled

		let shownNumbers = 0

		// First pass: Create the puzzle by selectively hiding numbers
		for (let y = 1; y <= this.size; y++) {
			for (let x = 1; x <= this.size; x++) {
				const id = this.size * (y - 1) + x
				const solutionNum = solution.get(id) ?? 0
				// Adjust probability based on grid size
				const showProbability = this.size > 6 ? 0.4 : this.size > 2 ? 0.3 : 0.2
				const isFixed = Math.random() < showProbability

				this.sudoku.set(id, {
					x,
					y,
					val: isFixed ? solutionNum : 0,
					isFixed: isFixed,
					isValid: true,
					solution: solutionNum,
					guess: new SvelteSet(),
				})

				if (isFixed) shownNumbers++
			}
		}

		// Second pass: Adjust number of shown cells if needed
		const cells = Array.from(this.sudoku.entries())

		// If we have too many numbers showing, hide some
		if (shownNumbers > maxNumbers) {
			const fixedCells = cells
				.filter(([_, cell]) => cell.isFixed)
				.map(([id]) => id)

			// Shuffle fixed cells
			for (let i = fixedCells.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
				;[fixedCells[i], fixedCells[j]] = [fixedCells[j], fixedCells[i]]
			}

			// Hide cells until we reach maximum
			while (shownNumbers > maxNumbers && fixedCells.length > 0) {
				const id = fixedCells.pop()
				if (id !== undefined) {
					const cell = this.sudoku.get(id)
					if (cell) {
						cell.val = 0
						cell.isFixed = false
						shownNumbers--
					}
				}
			}
		}
		// If we don't have enough numbers showing, show more
		else if (shownNumbers < minNumbers) {
			const emptyCells = cells
				.filter(([_, cell]) => !cell.isFixed)
				.map(([id]) => id)

			// Shuffle empty cells
			for (let i = emptyCells.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
				;[emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]]
			}

			// Fill cells until we reach minimum
			while (shownNumbers < minNumbers && emptyCells.length > 0) {
				const id = emptyCells.pop()
				if (id !== undefined) {
					const cell = this.sudoku.get(id)
					if (cell) {
						cell.val = cell.solution
						cell.isFixed = true
						shownNumbers++
					}
				}
			}
		}

		// For larger grids (>6), ensure at least one of each number is shown
		if (this.size > 6) {
			const shownNumbers = new Set(
				Array.from(this.sudoku.values())
					.filter((cell) => cell.isFixed)
					.map((cell) => cell.val),
			)

			// For each missing number, find a cell with that solution and show it
			for (let num = 1; num <= this.size; num++) {
				if (!shownNumbers.has(num)) {
					const availableCell = cells.find(
						([_, cell]) => !cell.isFixed && cell.solution === num,
					)

					if (availableCell) {
						const [id, cell] = availableCell
						this.sudoku.set(id, {
							...cell,
							val: cell.solution,
							isFixed: true,
						})
					}
				}
			}
		}
	}

	cellID(x: number, y: number):number {
	return this.size * (y - 1) + x
	}
	
	isValid(id:number, num: number): boolean {
		const cell = this.sudoku.get(id)
		const result = cell?.solution === num

		if (!result && num !== 0) {
			this.mistakes.current++
			this.mistakes.total++

			const mode = this.size as GameMode
			this.statistics.modes[mode].mistakes++
			this.statistics.totalMistakes++
			this.saveStatistics()
		}
		if (result) this.reduceRemainingNumbers(num)
		return result
	}

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
				if (cell?.val && cell.val > 0) {
					usedNumbers.add(cell.val)
				}
			}
		}

		return usedNumbers
	}

	updateGuessesInBox(x: number, y: number, num: number): void {
		const boxStartX =
			Math.floor((x - 1) / this.boxSize.width) * this.boxSize.width + 1
		const boxStartY =
			Math.floor((y - 1) / this.boxSize.height) * this.boxSize.height + 1

		// Iterate through all cells in the same box
		for (let i = boxStartY; i < boxStartY + this.boxSize.height; i++) {
			for (let j = boxStartX; j < boxStartX + this.boxSize.width; j++) {
				const id = this.size * (i - 1) + j
				const cell = this.sudoku.get(id)
				// Remove the correctly guessed number from other cells' guesses
				if (cell?.guess.has(num)) {
					cell.guess.delete(num)
				}
			}
		}
	}
	
	getBoxBorders(x: number, y: number) {
		const boxRow = Math.floor((y - 1) / this.boxSize.height)
		const boxCol = Math.floor((x - 1) / this.boxSize.width)

		return {
			thickRight: x === this.boxSize.width * (boxCol + 1) && x !== this.size,
			thickBottom: y === this.boxSize.height * (boxRow + 1) && y !== this.size,
		}
	}
	
	async checkAndHandleCompletion(): Promise<boolean> {
		const complete = this.isPuzzleComplete()
		if (complete) {
			await this.handleGameWon()
		}
		return complete
	}
	
	isPuzzleComplete(): boolean {
		if (this.remainingNumbers.size === 0) return false
		const complete = Array.from(this.remainingNumbers.values()).every(
			(count) => count === 0,
		)
		return complete
	}

	async saveGame(): Promise<void> {
		const gameState = {
			size: this.size,
			mistakes: this.mistakes,
			autoPause: this.autoPause,
			sudoku: Array.from(this.sudoku.entries()).map(([id, cell]) => [
				id,
				{
					...cell,
					// Convert SvelteSet to Array before saving
					guess: Array.from(cell.guess.values()),
				},
			]),
			remainingNumbers: Array.from(this.remainingNumbers.entries()),
		}

		await storeInIndexedDB(GAME_STORE, gameState)
	}

	async loadGame(): Promise<boolean> {
		try {
			const gameState = await fetchFromIndexedDB(GAME_STORE)as gameState
			if (!gameState) {
				this.reset()
				return false
			}
			this.size = gameState.size as GameMode
			this.mistakes = gameState.mistakes
			this.autoPause = gameState.autoPause ?? this.autoPause
			// Clear existing maps
			this.sudoku.clear()
			this.remainingNumbers.clear()

			// Properly load sudoku entries into existing SvelteMap
			for (const [id, cell] of gameState.sudoku) {
				const guessSet = new SvelteSet<number>()

				if (cell.guess && Array.isArray(cell.guess)) {
					for (const num of cell.guess) {
						guessSet.add(num)
					}
				} else if (cell.guess && typeof cell.guess === "object") {
					for (const num of cell.guess) {
						guessSet.add(num)
					}
				}

				this.sudoku.set(Number(id), {
					x: cell.x,
					y: cell.y,
					val: cell.val,
					isFixed: cell.isFixed,
					isValid: cell.isValid,
					solution: cell.solution,
					guess: guessSet,
				})
			}

			// Load remaining numbers into existing SvelteMap
			for (const [num, count] of gameState.remainingNumbers) {
				this.remainingNumbers.set(Number(num), count)
			}
			
			return true
		} catch (error) {
			console.error("Error loading game:", error)
			this.reset()
			return false
		}
	}

	async saveTime(): Promise<void> {
		await saveTime(this.time)
	}
}
