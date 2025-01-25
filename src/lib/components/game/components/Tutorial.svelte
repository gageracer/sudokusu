<script lang="ts">
import { TUTORIAL_STEPS } from "../ts/tutorial.ts"
import { SudokuGame } from "../ts"
import TutorialHighlight from "./TutorialHighlight.svelte"
let {
	game = $bindable(),
	onComplete,
	onSkip,
}: { game: SudokuGame; onComplete: () => void; onSkip: () => void } = $props()

let currentStep = $state(0)

const stepGroups = [
    { title: "Basics", steps: [0, 1, 2] },
    { title: "Numbers", steps: [3, 4] },
    { title: "Advanced", steps: [5, 6, 7] }
];

function getCurrentGroup() {
    return stepGroups.find(group => 
        group.steps.includes(currentStep)
    );
}

function handleNext() {
	if (currentStep < TUTORIAL_STEPS.length - 1) {
		currentStep++
	} else {
		onComplete()
	}
}
</script>


<!-- Highlight current element -->
{#if TUTORIAL_STEPS[currentStep].highlight}
    <TutorialHighlight
        type={TUTORIAL_STEPS[currentStep].highlight!.type}
        target={TUTORIAL_STEPS[currentStep].highlight!.target}
    />
{/if}

<!-- Tutorial Box -->
<div class="fixed bottom-1 left-1/2 -translate-x-1/2 z-[100] w-[70%] max-w-sm">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                p-4 border border-gray-200 dark:border-gray-600
                transform transition-all duration-300">
        <!-- Progress bar -->
        <div class="absolute -top-2 left-0 right-0 flex justify-center">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-1 w-32 overflow-hidden">
                <div 
                    class="bg-blue-500 h-full transition-all duration-300"
                    style="width: {(currentStep + 1) / TUTORIAL_STEPS.length * 100}%"
                ></div>
            </div>
        </div>

        <div class="flex justify-between items-start mb-3">
            <h3 class="text-base font-bold dark:text-white">
                {TUTORIAL_STEPS[currentStep].title}
            </h3>
            <button 
                class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onclick={onSkip}
            >
                Skip
            </button>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {TUTORIAL_STEPS[currentStep].message}
        </p>
        
        <div class="flex justify-end items-center gap-2">
            {#if currentStep > 0}
                <button
                    class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onclick={() => currentStep--}
                >
                    Back
                </button>
            {/if}
            <button
                class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onclick={handleNext}
            >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
    </div>
</div>