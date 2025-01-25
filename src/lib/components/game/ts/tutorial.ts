export const TUTORIAL_STEPS: {
	title: string
	message: string
	highlight?: {
		type: 'cell' | 'number' | 'button' | 'area'
		target: string|number
	}
}[] = [
	{
		title: "Welcome to Sudoku!",
		message:
			"Let's learn how to play. Each puzzle has different sizes, let's start with 4×4!",
	},
	{
		title: "The Grid",
		message:
			"The grid is divided into boxes. Each row, column, and box must contain unique numbers.",
	},
	{
		title: "Select a Cell",
		message:
			"Click any empty cell to begin. Blue border means selecting. Empty cells are where you'll enter numbers.",
		highlight: { type: "cell", target: "empty" },
	},
	{
		title: "Enter Numbers",
		message: "Use the number pad below or your keyboard to enter numbers.",
		highlight: { type: "number", target: "pad" },
	},
	{
		title: "Taking Notes",
		message:
			"Not sure which number goes here? Click the ? button (or press C) to enter multiple possibilities. Or you can double click the cells. Green border means guessing.",
		highlight: { type: "button", target: "guess-mode" },
	},
	{
		title: "Mistakes",
		message:
			"Wrong numbers will show in red. Don't worry - everyone makes mistakes! You can remove the mistake by using the delete (or press D) option after selecting the cell. Try to keep them low for a better score.",
	},
	{
		title: "Stars",
		message:
			"Get stars based on your mistakes: ★★★★ for perfect play, ★★★ for 1-2 mistakes, ★★ for 3-4 mistakes.",
	},
	{
		title: "Ready to Play!",
		message: "That's all you need to know! Click Finish to start playing.",
	},
]
