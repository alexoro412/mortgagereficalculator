<script lang="ts">
	interface Props {
		label: string;
		value: string;
		valueClass?: string;
	}

	let { label, value, valueClass = 'text-lg font-semibold text-gray-900' }: Props = $props();
</script>

<div class="flex items-baseline justify-between gap-4">
	<span class="text-sm text-gray-600">{label}</span>
	<span class={valueClass}>
		{value}
	</span>
</div>
