<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
		class?: string;
	}

	let { title, children, class: className = 'bg-white' }: Props = $props();
</script>

<div class="max-w-md rounded-lg p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-2 {className}">
	<h3 class="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
	<div class="space-y-3">
		{@render children()}
	</div>
</div>
