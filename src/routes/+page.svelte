<script lang="ts">
import * as RadioGroup from "$lib/components/ui/radio-group/index.js"
import { Label } from "$lib/components/ui/label/index.js"
import Sudoku from "$lib/components/game/Sudoku.svelte"

let size: 2 | 4 | 6 | 8 | 9 = $state(4)
let darkMode = $state(false)
const options = [2, 4, 6, 8, 9]
const savedSize = localStorage.getItem("gamemode-size")
if (savedSize !== null) {
	size = JSON.parse(savedSize)
}

$effect(() => {
	localStorage.setItem("gamemode-size", String(size))
})
</script>

<div class="min-h-screen transition-colors" class:dark={darkMode}>
    <div class="min-h-screen mx-auto p-4 dark:bg-gray-900">
    	<!-- Grid size selector -->
    	<div class="mb-4">
    		<RadioGroup.Root class="flex justify-around gap-4" bind:value={size}>
            <span class="dark:text-white">Size</span>
    			{#each options as optionSize}
    				<div class="flex items-center space-x-2">
    					<RadioGroup.Item value={optionSize} id={`option-${optionSize}`} />
    					<Label for={`option-${optionSize}`}  class="dark:text-white">{optionSize}</Label>
    				</div>
    			{/each}
    		</RadioGroup.Root>
    	</div>

    	<Sudoku bind:size bind:darkMode />
    </div>
</div>
