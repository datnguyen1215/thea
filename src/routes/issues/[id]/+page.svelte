<script lang="ts">
	import { enhance } from '$app/forms';
	import { Marked } from 'marked';

	let { data } = $props();

	const marked = new Marked();

	const renderedDescription = $derived(
		data.issue.description ? marked.parse(data.issue.description) : ''
	);

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

	const eventLabels: Record<string, string> = {
		created: 'Created',
		status_changed: 'Status changed',
		priority_changed: 'Priority changed',
		edited: 'Edited',
		agent_assigned: 'Agent assigned',
		agent_unassigned: 'Agent unassigned',
		comment: 'Comment'
	};

	const formatDetail = (type: string, detail: string): string => {
		try {
			const parsed = JSON.parse(detail);
			if (type === 'status_changed') return `${parsed.from} → ${parsed.to}`;
			if (type === 'priority_changed') return `${parsed.from} → ${parsed.to}`;
			if (type === 'edited') return `field: ${parsed.field}`;
			if (type === 'agent_assigned') return `session: ${parsed.session}`;
			return '';
		} catch {
			return '';
		}
	};

	let message = $state('');
	let loading = $state(false);

	const spawnAgent = async () => {
		loading = true;
		try {
			const res = await fetch('/api/agents/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ issueId: data.issue.id })
			});
			if (res.ok) location.reload();
			else alert((await res.json()).message ?? 'Failed to spawn agent');
		} finally {
			loading = false;
		}
	};

	const sendMessage = async () => {
		const text = message.trim();
		if (!text || !data.issue.agentSession) return;

		loading = true;
		try {
			const session = encodeURIComponent(data.issue.agentSession);
			await fetch(`/api/agents/${session}/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: text })
			});
			message = '';
		} finally {
			loading = false;
		}
	};

	const killAgent = async () => {
		if (!data.issue.agentSession) return;
		if (!confirm('Kill this agent session?')) return;

		loading = true;
		try {
			const session = encodeURIComponent(data.issue.agentSession);
			await fetch(`/api/agents/${session}/kill`, { method: 'POST' });
			location.reload();
		} finally {
			loading = false;
		}
	};
</script>

<div class="flex items-start justify-between mb-6 gap-4">
	<div>
		<h1 class="text-2xl font-bold">#{data.issue.id} {data.issue.title}</h1>
		<div class="flex items-center gap-2 mt-2 text-sm text-gray-500">
			<span class="inline-block w-2 h-2 rounded-full {priorityColors[data.issue.priority] ?? 'bg-gray-400'}"></span>
			<span>{data.issue.priority}</span>
			<span class="rounded border border-gray-200 px-1.5 py-0.5 text-xs">
				{statusLabels[data.issue.status] ?? data.issue.status}
			</span>
			<span class="text-xs">Created {data.issue.createdAt.slice(0, 10)}</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/issues/{data.issue.id}/edit"
			class="rounded border border-gray-200 bg-white px-4 py-1.5 text-sm no-underline text-inherit cursor-pointer font-[inherit]"
		>
			Edit
		</a>
		<form method="POST" action="?/delete" use:enhance>
			<button
				type="submit"
				class="rounded border border-red-600 bg-white px-4 py-1.5 text-sm text-red-600 cursor-pointer font-[inherit] hover:bg-red-600 hover:text-white"
			>
				Delete
			</button>
		</form>
	</div>
</div>

{#if data.labels.length > 0}
	<div class="flex gap-1.5 mb-6">
		{#each data.labels as label (label.id)}
			<span class="rounded bg-gray-200 px-2 py-0.5 text-xs">{label.label}</span>
		{/each}
	</div>
{/if}

<section class="mb-8 rounded-lg border border-gray-200 bg-white p-5">
	<h2 class="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">Description</h2>
	{#if renderedDescription}
		<div class="leading-relaxed [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em]">
			{@html renderedDescription}
		</div>
	{:else}
		<p class="text-gray-500 italic">No description.</p>
	{/if}
</section>

<section class="mb-8">
	<h2 class="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">Actions</h2>
	<div class="flex flex-wrap gap-2">
		{#each ['open', 'in_progress', 'done', 'closed'] as s (s)}
			{#if s !== data.issue.status}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value={s} />
					<button
						type="submit"
						class="cursor-pointer rounded border border-gray-200 bg-white px-3 py-1 text-xs font-[inherit]"
					>
						Mark {statusLabels[s]}
					</button>
				</form>
			{/if}
		{/each}
	</div>
</section>

<section class="mb-8 rounded-lg border border-gray-200 bg-white p-5">
	<h2 class="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">Agent</h2>

	{#if data.issue.agentSession}
		<div class="rounded-md bg-gray-50 p-4">
			<div class="mb-3 flex items-center justify-between">
				<span class="font-semibold font-mono">{data.issue.agentSession}</span>
				<span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800">assigned</span>
			</div>

			<div class="flex items-center gap-2">
				<div class="flex flex-1 gap-2">
					<input
						type="text"
						placeholder="Send message to agent..."
						bind:value={message}
						onkeydown={(e) => {
							if (e.key === 'Enter') sendMessage();
						}}
						disabled={loading}
						class="flex-1 rounded border border-gray-200 px-2.5 py-1.5 text-sm font-[inherit]"
					/>
					<button
						onclick={sendMessage}
						disabled={loading || !message.trim()}
						class="cursor-pointer rounded border-none bg-indigo-500 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						Send
					</button>
				</div>
				<button
					onclick={killAgent}
					disabled={loading}
					class="cursor-pointer rounded border-none bg-red-600 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
				>
					Kill
				</button>
			</div>
		</div>
	{:else}
		<button
			onclick={spawnAgent}
			disabled={loading}
			class="cursor-pointer rounded border-none bg-green-600 px-5 py-2 text-base text-white disabled:cursor-not-allowed disabled:opacity-50"
		>
			{loading ? 'Spawning...' : 'Spawn Agent'}
		</button>
	{/if}
</section>

<section class="mb-8">
	<h2 class="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">Activity</h2>
	{#if data.events.length === 0}
		<p class="text-gray-500 italic">No activity yet.</p>
	{:else}
		<ul class="list-none border-l-2 border-gray-200 pl-4">
			{#each data.events as event (event.id)}
				<li class="flex items-baseline gap-3 py-2 text-sm">
					<span class="font-medium">{eventLabels[event.type] ?? event.type}</span>
					{#if formatDetail(event.type, event.detail)}
						<span class="text-gray-500">{formatDetail(event.type, event.detail)}</span>
					{/if}
					<span class="text-gray-500 text-xs ml-auto">{event.createdAt.slice(0, 16).replace('T', ' ')}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
