<script lang="ts">
import Sudoku from "$lib/components/game/Sudoku.svelte"

let size: 2 | 4 | 6 | 8 | 9 = $state(2)
let darkMode = $state(false)
let isGuess = $state(false)
const savedSize = localStorage.getItem("gamemode-size")
if (savedSize && savedSize !== null) {
	size = JSON.parse(savedSize)
}


$effect(() => {
	localStorage.setItem("gamemode-size", String(size))
	localStorage.setItem("sudoku-dark-mode", String(darkMode))
})

</script>

<div class="min-h-screen transition-colors" class:dark={darkMode}>
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
