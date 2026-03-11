<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<h1 class="mb-6 text-2xl font-bold">New Issue</h1>

{#if form?.error}
	<p class="text-red-600 mb-4">{form.error}</p>
{/if}

<form method="POST" use:enhance class="max-w-[600px] flex flex-col gap-4">
	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">Title</span>
		<input
			type="text"
			name="title"
			required
			class="rounded border border-gray-200 px-2.5 py-2 text-sm font-[inherit]"
		/>
	</label>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">Description</span>
		<textarea
			name="description"
			rows="8"
			class="rounded border border-gray-200 px-2.5 py-2 text-sm font-[inherit] resize-y"
		></textarea>
	</label>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">Priority</span>
		<select name="priority" class="rounded border border-gray-200 px-2.5 py-2 text-sm font-[inherit]">
			<option value="low">Low</option>
			<option value="medium" selected>Medium</option>
			<option value="high">High</option>
			<option value="critical">Critical</option>
		</select>
	</label>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">Labels</span>
		<input
			type="text"
			name="labels"
			placeholder="comma-separated"
			class="rounded border border-gray-200 px-2.5 py-2 text-sm font-[inherit]"
		/>
	</label>

	<div class="flex gap-2 mt-2">
		<button
			type="submit"
			class="cursor-pointer rounded border border-indigo-500 bg-indigo-500 px-5 py-2 text-sm text-white font-[inherit] hover:bg-indigo-600"
		>
			Create Issue
		</button>
		<a
			href="/issues"
			class="rounded border border-gray-200 bg-white px-5 py-2 text-sm no-underline text-inherit font-[inherit]"
		>
			Cancel
		</a>
	</div>
</form>
