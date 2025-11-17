<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div class="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-2">
	<h2 class="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
	<div class="max-w-xs space-y-4">
		{@render children()}
	</div>
</div>
