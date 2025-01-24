<script lang="ts">
let {
    type,
    target,
}:{
  type: 'cell' | 'number' | 'button' | 'area'
  target:string | number
  
} = $props()

function getHighlightPosition() {
    if (!target) return null
    
    let element: HTMLElement | null = null
    switch (type) {
        case 'number':
            // Target number pad button
            element = document.querySelector(`[data-numpad="${target}"]`)
            break
        case 'button':
            // Target specific button like guess mode
            element = document.querySelector(`[data-tutorial="${target}"]`)
            break
        case 'cell':
            // Target specific cell or empty cells
            element = document.querySelector(`[data-cell="${target}"]`)
            break
        case 'area':
            // Target larger areas like the grid or number pad
            element = document.querySelector(`[data-area="${target}"]`)
            break
    }

    if (!element) return null

    const rect = element.getBoundingClientRect()
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
    }
}

let position = $derived(getHighlightPosition())
</script>

{#if position}
    <div 
        class="absolute pointer-events-none z-[95] transition-all duration-300"
        style="top: {position.top}px; left: {position.left}px; width: {position.width}px; height: {position.height}px;"
    >
        <div class="absolute inset-0 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg animate-pulse" ></div>
        <div class="absolute inset-0 bg-yellow-400/20 dark:bg-yellow-500/20 rounded-lg" ></div>
    </div>
{/if}