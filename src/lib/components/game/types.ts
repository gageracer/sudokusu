export interface BoxSize {
  width: number;
  height: number;
}
export interface MistakeCount {
  current: number;
  total: number;
}

export interface SudokuCell {
  x: number;
  y: number;
  val: number;
  isFixed: boolean;
  isValid: boolean;
  solution: number;
}


