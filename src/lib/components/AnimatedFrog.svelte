<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		monthlySavings: number;
	}

	let { monthlySavings }: Props = $props();

	let shouldCelebrate = $state(false);
	let previousSavings = $state(monthlySavings);

	// Trigger celebration when savings cross $500 threshold
	$effect(() => {
		if (monthlySavings > 500 && previousSavings <= 500) {
			shouldCelebrate = true;
			setTimeout(() => {
				shouldCelebrate = false;
			}, 2000);
		}
		previousSavings = monthlySavings;
	});
</script>

<div class="relative inline-block">
	<img
		src="/frog.svg"
		alt="Frog logo"
		class="h-12 w-12 transition-transform duration-300 hover:scale-110 cursor-pointer animate-bounce-gentle {shouldCelebrate ? 'animate-celebrate' : ''}"
	/>
</div>

<style>
	@keyframes bounce-gentle {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	@keyframes celebrate {
		0%, 100% {
			transform: rotate(0deg) scale(1);
		}
		25% {
			transform: rotate(-15deg) scale(1.2);
		}
		75% {
			transform: rotate(15deg) scale(1.2);
		}
	}

	.animate-bounce-gentle {
		animation: bounce-gentle 3s ease-in-out infinite;
	}

	.animate-celebrate {
		animation: celebrate 0.5s ease-in-out 4;
	}
</style>
