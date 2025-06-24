<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type SudokuCell = {
		x: number;
		y: number;
		val: number;
		isFixed: boolean;
		isValid: boolean;
		solution: number;
	};
	let isComplete = $state(false);
	let selectedCell: SudokuCell | null = $state(null);
	let sudoku: SvelteMap<number, SudokuCell> = new SvelteMap();
	let size: number = $state(2);
	let highlightedNumber = $state<number | null>(null);
	const options = [2, 4, 6, 8, 9];

	function handleCellClick(cell: SudokuCell) {
		if (cell.isFixed) {
			selectedCell = null;
			if (cell.val === 0) {
				highlightedNumber = null;
			} else {
				highlightedNumber = cell.val;
			}
		} else {
			selectedCell = cell;
			highlightedNumber = cell.val;
		}
	}

	function handleNumberSelect(num: number) {
		if (!selectedCell || selectedCell.isFixed) return;

		const id = size * (selectedCell.y - 1) + selectedCell.x;
		const isValidGuess = num === 0 || isValid(selectedCell.x, selectedCell.y, num);
		sudoku.set(id, { ...selectedCell, val: num, isValid: isValidGuess });

		if (num === 0) {
			highlightedNumber = null;
		} else {
			highlightedNumber = num;
		}
		isPuzzleComplete();
	}
	function getBoxSize(gridSize: number) {
		switch (gridSize) {
			case 9:
				return { width: 3, height: 3 }; // 3x3 boxes
			case 8:
				return { width: 4, height: 2 }; // 4x2 boxes
			case 6:
				return { width: 3, height: 2 }; // 3x2 boxes
			case 4:
				return { width: 2, height: 2 }; // 2x2 boxes
			case 2:
				return { width: 2, height: 1 }; // 1x2 boxes
			default:
				return { width: 3, height: 3 };
		}
	}

	function getBoxBorders(x: number, y: number) {
		const boxSize = getBoxSize(size);
		const boxRow = Math.floor((y - 1) / boxSize.height);
		const boxCol = Math.floor((x - 1) / boxSize.width);
		const result = {
			thickRight: x === boxSize.width * (boxCol + 1) && x !== size,
			thickBottom: y === boxSize.height * (boxRow + 1) && y !== size
		};
		return result;
	}

	function getRemainingNumbers() {
		const counts = new Map<number, number>();
		// Initialize counts for each possible number
		for (let i = 1; i <= size; i++) {
			counts.set(i, size);
		}
		// Count used numbers
		for (const cell of sudoku.values()) {
			if (cell.val > 0) {
				const current = counts.get(cell.val) || 0;
				counts.set(cell.val, current - 1);
			}
		}
		return counts;
	}

	function isPuzzleComplete() {
		const remaining = getRemainingNumbers();
		isComplete = Array.from(remaining.values()).every((count) => count === 0);
	}

	function generateFullSolution(): Map<number, number> {
		const solution = new Map<number, number>();

		// Initialize empty grid
		for (let y = 1; y <= size; y++) {
			for (let x = 1; x <= size; x++) {
				const id = size * (y - 1) + x;
				solution.set(id, 0);
			}
		}

		// Fill grid using backtracking
		fillGrid(solution, 1);
		return solution;
	}

	function fillGrid(grid: Map<number, number>, position: number): boolean {
		if (position > size * size) return true;

		const y = Math.floor((position - 1) / size) + 1;
		const x = ((position - 1) % size) + 1;
		const numbers = Array.from({ length: size }, (_, i) => i + 1);

		// Shuffle numbers for randomization
		for (let i = numbers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
		}

		for (const num of numbers) {
			if (isValidPlacement(grid, x, y, num)) {
				grid.set(position, num);
				if (fillGrid(grid, position + 1)) return true;
				grid.set(position, 0);
			}
		}

		return false;
	}

	function isValidPlacement(grid: Map<number, number>, x: number, y: number, num: number): boolean {
		if (num > size) return false;

		// Check row
		for (let i = 1; i <= size; i++) {
			const id = size * (y - 1) + i;
			if (i !== x && grid.get(id) === num) return false;
		}

		// Check column
		for (let i = 1; i <= size; i++) {
			const id = size * (i - 1) + x;
			if (i !== y && grid.get(id) === num) return false;
		}

		// Check box
		const boxSize = getBoxSize(size);
		const boxStartX = Math.floor((x - 1) / boxSize.width) * boxSize.width + 1;
		const boxStartY = Math.floor((y - 1) / boxSize.height) * boxSize.height + 1;

		for (let i = boxStartY; i < boxStartY + boxSize.height; i++) {
			for (let j = boxStartX; j < boxStartX + boxSize.width; j++) {
				const id = size * (i - 1) + j;
				if (x !== j && y !== i && grid.get(id) === num) return false;
			}
		}

		return true;
	}

	function isValid(x: number, y: number, num: number): boolean {
		const id = size * (y - 1) + x;
		const cell = sudoku.get(id);
		return cell?.solution === num;
	}

	function generateSudoku() {
		highlightedNumber = null;
		const solution = generateFullSolution();
		sudoku.clear();

		// Create the puzzle by selectively hiding numbers
		for (let y = 1; y <= size; y++) {
			for (let x = 1; x <= size; x++) {
				const id = size * (y - 1) + x;
				const solutionNum = solution.get(id) || 0;
				const isFixed = Math.random() > 0.6; // Adjust this value to control difficulty

				sudoku.set(id, {
					x,
					y,
					val: isFixed ? solutionNum : 0,
					isFixed: isFixed,
					solution: solutionNum,
					isValid: true
				});
			}
		}
	}

	function handleSizeChange(newSizeStr: number) {
		size = newSizeStr;
		generateSudoku();
	}

	generateSudoku();
</script>

{size}
<div class="container mx-auto p-4">
	<div class="mb-4">
		<RadioGroup.Root class="flex flex-row gap-4">
			{#each options as optionSize}
				<div class="flex items-center space-x-2">
					<RadioGroup.Item
						value={JSON.stringify(optionSize)}
						id={`option-${optionSize}`}
						onclick={() => handleSizeChange(optionSize)}
					/>
					<Label for={`option-${optionSize}`}>{optionSize}</Label>
				</div>
			{/each}
		</RadioGroup.Root>
	</div>

	<div class="mb-4 flex justify-center gap-4">
		{#each Array.from(getRemainingNumbers()) as [number, count]}
			<div class="flex flex-col items-center">
				<span class="text-lg font-bold">{number}</span>
				<span class="text-sm">{count}</span>
			</div>
		{/each}
	</div>

	<div class="grid gap-0" style:grid-template-columns={`repeat(${size}, minmax(0, 1fr))`}>
		{#each Array.from(sudoku.values()) as cell}
			<input
				readonly
				inputmode="none"
				value={cell.val || ''}
				disabled={cell.isFixed}
				class="aspect-square w-full text-center text-lg font-bold
        {cell.isFixed ? 'bg-gray-100' : 'bg-white'}
        {!cell.isFixed && cell.val && cell.val !== cell.solution ? 'text-red-500' : ''}
        {highlightedNumber === cell.val && cell.val !== 0 ? 'bg-yellow-100' : ''}
        {isComplete ? 'bg-green-100' : ''}
        {selectedCell === cell ? 'bg-blue-50' : ''}
        border border-gray-300"
				class:border-r-2={getBoxBorders(cell.x, cell.y).thickRight}
				class:border-b-2={getBoxBorders(cell.x, cell.y).thickBottom}
				class:border-r-black={getBoxBorders(cell.x, cell.y).thickRight}
				class:border-b-black={getBoxBorders(cell.x, cell.y).thickBottom}
				onclick={() => handleCellClick(cell)}
			/>
		{/each}
	</div>

	<!-- Add after the main grid -->
	<div class="mx-auto mt-4 grid max-w-[500px] grid-cols-5 gap-2">
		{#each Array.from({ length: size }, (_, i) => i + 1) as number}
			<button
				class="aspect-square rounded-md border border-gray-300 text-lg font-bold
                hover:bg-gray-100 active:bg-gray-200
                {highlightedNumber === number ? 'bg-yellow-100' : 'bg-white'}"
				onclick={() => handleNumberSelect(number)}
			>
				{number}
			</button>
		{/each}
		<!-- Add clear button -->
		<button
			class="aspect-square rounded-md border border-gray-300 text-lg font-bold
            hover:bg-gray-100 active:bg-gray-200"
			onclick={() => handleNumberSelect(0)}
		>
			⌫
		</button>
	</div>
	<!-- <div class="mt-8 rounded-lg bg-gray-50 p-4">
		<details>
			<summary class="mb-4 cursor-pointer text-gray-600">Debug: Show Solution</summary>
			<div class="grid gap-0" style:grid-template-columns={`repeat(${size}, minmax(0, 1fr))`}>
				{#each Array.from(sudoku.values()) as cell}
					<div
						class="aspect-square w-full border border-gray-300 bg-white text-center
							font-mono text-sm"
						class:border-r-2={getBoxBorders(cell.x, cell.y).thickRight}
						class:border-b-2={getBoxBorders(cell.x, cell.y).thickBottom}
						class:border-r-black={getBoxBorders(cell.x, cell.y).thickRight}
						class:border-b-black={getBoxBorders(cell.x, cell.y).thickBottom}
					>
						{cell.solution || ''}
					</div>
				{/each}
			</div>
		</details>
	</div> -->
</div>

<style>
	.grid {
		max-width: 500px;
		margin: 0 auto;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input:disabled {
		color: black;
	}

	input:focus {
		outline: none;
		background-color: #f0f9ff;
	}
</style>
