<script lang="ts">
import "../app.css"
let { children } = $props()
</script>

<svelte:head>
	<title>Sudokusu</title>
	<meta name="description" content="A short sudoku treat" />
</svelte:head>

{@render children?.()}
