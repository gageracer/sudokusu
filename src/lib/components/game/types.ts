export interface BoxSize {
	width: number
	height: number
}
export interface MistakeCount {
	current: number
	total: number
}
export interface TimeCount {
	timeElapsed: number
	totalTime: number
}

export interface SudokuCell {
	x: number
	y: number
	val: number
	isFixed: boolean
	isValid: boolean
	solution: number
}

export type gameState = {
	size: number
	sudoku: [number, SudokuCell][]
	remainingNumbers: [number, number][]
	mistakes: MistakeCount
}
