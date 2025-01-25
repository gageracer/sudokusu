<script lang="ts">
let {
	size = $bindable<number>(),
	isGuess = $bindable(false),
	isMobile = $bindable(false),
	highlightedNumber = $bindable(null),
	isNumberDisabled,
	onNumberSelect,
	onToggleGuess,
} = $props()
</script>

<div class="mx-auto mt-4 grid max-w-[500px] grid-cols-5 gap-2">
    {#each Array.from({ length: size }, (_, i) => i + 1) as number}
        <button
            data-numpad={number}
            class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg dark:text-white font-bold grid place-items-center relative
            {highlightedNumber === number ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-white dark:bg-gray-800'}
            {isNumberDisabled(number)
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700'}"
            onclick={() => onNumberSelect(number)}
            disabled={isNumberDisabled(number)}
        >
            <div class="flex flex-col items-center h-4 justify-start">
                <span class="leading-none mb-1">{number}</span>
                {#if !isMobile && number > 4}
                    <span class="text-xs opacity-50 leading-none">
                        {number === 5 ? 'Q' :
                         number === 6 ? 'W' :
                         number === 7 ? 'E' :
                         number === 8 ? 'R' :
                         number === 9 ? 'T' : ''}
                    </span>
                {/if}
            </div>
        </button>
    {/each}
    <button
        class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg font-bold dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 grid place-items-center"
        onclick={() => onNumberSelect(0)}
    >
        <div class="flex flex-col items-center h-4 justify-start">
            <span class="leading-none mb-1">⌫</span>
            {#if !isMobile}
                <span class="text-xs leading-none opacity-50">D</span>
            {/if}
        </div>
    </button>
    <button
        class="aspect-square rounded-md border border-gray-300 dark:border-gray-600 text-lg font-bold bg-white dark:bg-gray-800 dark:text-white grid place-items-center {isGuess ? 'bg-green-200 border-green-600 dark:border-green-600':''}"
        data-tutorial="guess-mode"
        onclick={onToggleGuess}
    >
        <div class="flex flex-col items-center h-4 justify-start">
            <span class="leading-none mb-1 {isGuess
                ? 'text-green-500 dark:text-green-600'
                : 'bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'} ">﹖</span>
            {#if !isMobile}
                <span class="text-xs leading-none opacity-50">C</span>
            {/if}
        </div>
    </button>
</div>
