import type { SvelteSet } from "svelte/reactivity"

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
	guess: SvelteSet<number>
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

export type GameMode = 2 | 4 | 6 | 8 | 9

export interface ModeStats {
	gamesWon: number
	fastestWin: number | null
	longestWin: number | null
	totalPlayTime: number
	mistakes: number
	perfectGames: number
	threeStarGames: number
	twoStarGames: number
	oneStarGames: number
}

export interface Statistics {
	modes: {
		[key in GameMode]: ModeStats
	}
	totalMistakes: number
	totalGamesWon: number
}

export const DEFAULT_MODE_STATS: ModeStats = {
	gamesWon: 0,
	fastestWin: null,
	longestWin: null,
	mistakes: 0,
	totalPlayTime: 0,
	perfectGames: 0,
	threeStarGames: 0,
	twoStarGames: 0,
	oneStarGames: 0,
}

export const DEFAULT_STATISTICS: Statistics = {
	modes: {
		2: { ...DEFAULT_MODE_STATS },
		4: { ...DEFAULT_MODE_STATS },
		6: { ...DEFAULT_MODE_STATS },
		8: { ...DEFAULT_MODE_STATS },
		9: { ...DEFAULT_MODE_STATS },
	},
	totalMistakes: 0,
	totalGamesWon: 0,
}
