<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value: number;
		unit: string;
		min?: number;
	}

	let { id, label, value = $bindable(), unit, min }: Props = $props();
</script>

<div>
	<label for={id} class="mb-2 block text-sm font-medium text-gray-700">
		{label}
	</label>
	<div class="relative transform-gpu">
		<input
			{id}
			type="number"
			bind:value
			min={min}
			class="block w-full rounded-md border-0 px-3 py-2 pr-16 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-indigo-600 focus:ring-inset focus:shadow-lg focus:shadow-indigo-200/50 sm:text-sm sm:leading-6"
		/>
		<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 z-10">
			{unit}
		</span>
	</div>
</div>
