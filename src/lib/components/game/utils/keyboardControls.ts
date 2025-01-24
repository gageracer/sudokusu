export const numberKeyMap: Record<string, number> = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	q: 5,
	w: 6,
	e: 7,
	r: 8,
	t: 9,
}

export type KeyboardHandlers = {
	onNumberSelect: (num: number) => void
	onToggleGuess: () => void
	onTogglePause: () => void
	onMoveCursor: (x: number, y: number) => void
}

export function handleKeyboardInput(
	event: KeyboardEvent,
	handlers: KeyboardHandlers,
	isPaused: boolean,
	size: number,
) {
	// Prevent all inputs except space when paused
	if (isPaused && event.key !== " ") {
		return
	}

	const key = event.key.toLowerCase()

	// Handle mapped number keys
	if (key in numberKeyMap) {
		const num = numberKeyMap[key]
		if (num <= size) {
			handlers.onNumberSelect(num)
		}
		return
	}

	// Handle Backspace/Delete for erasing
	if (key === "backspace" || key === "delete" || key === "d") {
		handlers.onNumberSelect(0)
		return
	}

	// Handle Guess Mode
	if (key === "c") {
		handlers.onToggleGuess()
		return
	}

	// space for pause/resume
	if (key === " ") {
		handlers.onTogglePause()
		return
	}

	// Handle arrow keys for navigation
	if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
		event.preventDefault() // Prevent page scrolling
		const moveX = key === "arrowleft" ? -1 : key === "arrowright" ? 1 : 0
		const moveY = key === "arrowup" ? -1 : key === "arrowdown" ? 1 : 0
		handlers.onMoveCursor(moveX, moveY)
	}
}
