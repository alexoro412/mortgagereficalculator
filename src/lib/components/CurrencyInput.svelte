<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value: string;
		oninput: (e: Event) => void;
	}

	let { id, label, value, oninput }: Props = $props();
</script>

<div>
	<label for={id} class="mb-2 block text-sm font-medium text-gray-700">
		{label}
	</label>
	<div class="relative">
		<span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
			$
		</span>
		<input
			{id}
			type="text"
			{value}
			{oninput}
			class="block w-full rounded-md border-0 py-2 pr-3 pl-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
		/>
	</div>
</div>
