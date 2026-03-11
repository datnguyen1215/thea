<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let status = $state($page.url.searchParams.get('status') ?? '');
	let priority = $state($page.url.searchParams.get('priority') ?? '');
	let search = $state($page.url.searchParams.get('search') ?? '');

	const applyFilters = () => {
		const params = new URLSearchParams();
		if (status) params.set('status', status);
		if (priority) params.set('priority', priority);
		if (search) params.set('search', search);
		const qs = params.toString();
		goto(qs ? `/issues?${qs}` : '/issues');
	};

	const priorityColors: Record<string, string> = {
		critical: 'bg-red-600',
		high: 'bg-orange-500',
		medium: 'bg-yellow-400',
		low: 'bg-green-600'
	};

	const statusLabels: Record<string, string> = {
		open: 'Open',
		in_progress: 'In Progress',
		done: 'Done',
		closed: 'Closed'
	};
</script>

<div class="flex items-center justify-between mb-6">
	<h1 class="text-2xl font-bold">Issues</h1>
	<a
		href="/issues/new"
		class="rounded bg-indigo-500 border border-indigo-500 px-4 py-1.5 text-sm text-white no-underline hover:bg-indigo-600"
	>
		New Issue
	</a>
</div>

<form
	class="flex flex-wrap gap-2 mb-6"
	onsubmit={(e) => {
		e.preventDefault();
		applyFilters();
	}}
>
	<input
		type="text"
		placeholder="Search issues..."
		bind:value={search}
		class="flex-1 min-w-[200px] rounded border border-gray-200 px-2.5 py-1.5 text-sm font-[inherit]"
	/>
	<select bind:value={status} class="rounded border border-gray-200 px-2.5 py-1.5 text-sm font-[inherit]" onchange={applyFilters}>
		<option value="">All statuses</option>
		<option value="open">Open</option>
		<option value="in_progress">In Progress</option>
		<option value="done">Done</option>
		<option value="closed">Closed</option>
	</select>
	<select bind:value={priority} class="rounded border border-gray-200 px-2.5 py-1.5 text-sm font-[inherit]" onchange={applyFilters}>
		<option value="">All priorities</option>
		<option value="critical">Critical</option>
		<option value="high">High</option>
		<option value="medium">Medium</option>
		<option value="low">Low</option>
	</select>
	<button type="submit" class="cursor-pointer rounded border border-gray-200 bg-white px-4 py-1.5 text-sm font-[inherit]">
		Filter
	</button>
</form>

{#if data.issues.length === 0}
	<p class="text-gray-500 text-center py-8">No issues found.</p>
{:else}
	<div class="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
		{#each data.issues as issue (issue.id)}
			<a
				href="/issues/{issue.id}"
				class="flex items-center justify-between px-4 py-3 no-underline text-inherit border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-100"
			>
				<div class="flex items-baseline gap-2">
					<span class="text-gray-500 text-sm">#{issue.id}</span>
					<span class="font-medium">{issue.title}</span>
				</div>
				<div class="flex items-center gap-3 text-xs text-gray-500">
					<span class="inline-block w-2 h-2 rounded-full {priorityColors[issue.priority] ?? 'bg-gray-400'}"></span>
					<span class="rounded border border-gray-200 px-1.5 py-0.5 text-xs">
						{statusLabels[issue.status] ?? issue.status}
					</span>
					<span class="text-xs">{issue.createdAt.slice(0, 10)}</span>
				</div>
			</a>
		{/each}
	</div>
{/if}
