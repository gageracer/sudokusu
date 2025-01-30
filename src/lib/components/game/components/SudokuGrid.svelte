<script lang="ts">
import { getSudokusuContent, type SudokuCell, type SudokuGame } from "../ts"

let {
	isGuess = $bindable(false),
	selectedCell = $bindable(null),
	highlightedNumber = null,
	onKeydown,
	onGridClick,
	onCellClick,
	onToggleGuess,
}: {
	isGuess: boolean
	selectedCell: SudokuCell | null
	highlightedNumber: number | null
	onKeydown: (event: KeyboardEvent) => void
	onGridClick: () => void
	onCellClick: (cell: SudokuCell) => void
	onToggleGuess: () => void
} = $props()

const game = getSudokusuContent()

function getCellClasses(cell: SudokuCell): string {
	const baseClasses = [
		"aspect-square",
		"w-full",
		"text-center",
		"text-lg",
		"font-bold",
		"border",
		"border-gray-300 dark:border-gray-600",
		"focus:outline-none",
	]

	const borderClasses = [
		game.getBoxBorders(cell.x, cell.y).thickRight
			? "border-r-2 border-r-black dark:border-r-yellow-800"
			: "",
		game.getBoxBorders(cell.x, cell.y).thickBottom
			? "border-b-2 border-b-black dark:border-b-yellow-800"
			: "",
	]

	if (selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y) {
		baseClasses.push(
			isGuess
				? "ring-2 ring-green-500 dark:ring-green-400 z-10"
				: "ring-2 ring-blue-500 dark:ring-blue-400 z-10",
		)
	}

	const textColor =
		cell.val !== 0 && !cell.isValid
			? "text-red-500"
			: cell.guess?.size > 0
				? "text-green-600 dark:text-green-400"
				: "dark:text-white"

	const bgClasses = [
		cell.isFixed ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-gray-800",
		highlightedNumber === cell.val && cell.val !== 0
			? "bg-yellow-100 dark:bg-yellow-900"
			: "",
		selectedCell &&
		Math.floor((cell.x - 1) / game.boxSize.width) ===
			Math.floor((selectedCell.x - 1) / game.boxSize.width) &&
		Math.floor((cell.y - 1) / game.boxSize.height) ===
			Math.floor((selectedCell.y - 1) / game.boxSize.height)
			? "bg-blue-50/50 dark:bg-blue-900/50"
			: "",
		game.isPuzzleComplete() ? "bg-green-100 dark:bg-green-900" : "",
	]

	return [...baseClasses, ...borderClasses, textColor, ...bgClasses]
		.filter(Boolean)
		.join(" ")
}
</script>

<div
    class="mx-auto grid gap-0 relative rounded-md border border-gray-500 dark:border-gray-600 {isGuess ? 'border-green-500 dark:border-green-600':''}"
    style:grid-template-columns={`repeat(${game.size}, minmax(0, 1fr))`}
    style:max-width="500px"
    onkeydown={onKeydown}
    onclick={onGridClick}
    role="button"
    tabindex="0"
>
    {#each game.sudoku.values() as cell}
        <div data-cell={`${cell.x}-${cell.y}`} class="relative {getCellClasses(cell)}">
            <input
                readonly
                value={cell.guess.size > 0 && !cell.val ? "" : cell.val || ""}
                data-fixed={cell.isFixed}
                class={getCellClasses(cell)}
                ondblclick={onToggleGuess}
                onclick={() => onCellClick(cell)}
            />
            {#if cell.guess.size > 0 && !cell.val}
                <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none text-xs p-0.5">
                    {#each Array.from({length: 9}, (_, i) => i + 1) as num}
                        <div class="flex items-center justify-center">
                            {#if cell.guess.has(num)}
                                <span class="text-green-600 dark:text-green-400 opacity-70">{num}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    div[tabindex="0"] {
        transition: all 0.1s ease-in-out;
    }

    input {
        transition: all 0.1s ease-in-out;
    }
</style>
