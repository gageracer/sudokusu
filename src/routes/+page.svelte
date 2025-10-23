<script lang="ts">
import Sudoku from "$lib/components/game/Sudoku.svelte"
import { browser } from "$app/environment"
import { onMount } from "svelte"

type ThemeMode = "auto" | "light" | "dark"

let size: 2 | 4 | 6 | 8 | 9 = $state(2)
let darkMode: ThemeMode = $state("auto")
let isGuess = $state(false)

// Compute the actual dark boolean from the theme mode
let isDarkActive = $derived.by(() => {
	if (darkMode === "dark") return true
	if (darkMode === "light") return false
	if (darkMode === "auto" && browser) {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
	}
	return false
})

onMount(() => {
	const savedSize = localStorage.getItem("gamemode-size")
	if (savedSize && savedSize !== null) {
		size = JSON.parse(savedSize)
	}
})

$effect(() => {
	if (browser) {
		localStorage.setItem("gamemode-size", String(size))
		localStorage.setItem("sudoku-theme-mode", darkMode)
	}
})
</script>

<div class="min-h-screen transition-colors" class:dark={isDarkActive} data-theme={darkMode}>
    <div class="min-h-screen mx-auto p-4 {isGuess ? 'bg-green-50 dark:bg-[#08130b]': 'bg-yellow-50 dark:bg-gray-900'}">


    	<Sudoku bind:size bind:darkMode bind:isGuess />
    </div>
</div>

<style>
/* Add smooth transitions */
div {
    transition: all 500ms ease-in-out;
}
</style>
