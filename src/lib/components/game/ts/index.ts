import { getContext, setContext } from "svelte"
import { SudokuGame } from "./sudoku.svelte"
import type { SudokuCell } from "./types"

export { SudokuGame }

export type { SudokuCell }

const key = Symbol("Sudokusu")

export function setSudokusuContent(){
  setContext(key, new SudokuGame())
}

export function getSudokusuContent():SudokuGame{
  return getContext(key)
}