<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div
	class="w-full rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 lg:max-w-lg"
>
	<h2 class="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
	<div class="w-full space-y-4 lg:max-w-xs">
		{@render children()}
	</div>
</div>
