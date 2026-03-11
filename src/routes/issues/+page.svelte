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
		critical: '#dc3545',
		high: '#fd7e14',
		medium: '#ffc107',
		low: '#198754'
	};

	const statusLabels: Record<string, string> = {
		open: 'Open',
		in_progress: 'In Progress',
		done: 'Done',
		closed: 'Closed'
	};
</script>

<div class="header">
	<h1>Issues</h1>
	<a href="/issues/new" class="btn btn-primary">New Issue</a>
</div>

<form class="filters" onsubmit={(e) => { e.preventDefault(); applyFilters(); }}>
	<input
		type="text"
		placeholder="Search issues..."
		bind:value={search}
		class="input"
	/>
	<select bind:value={status} class="input" onchange={applyFilters}>
		<option value="">All statuses</option>
		<option value="open">Open</option>
		<option value="in_progress">In Progress</option>
		<option value="done">Done</option>
		<option value="closed">Closed</option>
	</select>
	<select bind:value={priority} class="input" onchange={applyFilters}>
		<option value="">All priorities</option>
		<option value="critical">Critical</option>
		<option value="high">High</option>
		<option value="medium">Medium</option>
		<option value="low">Low</option>
	</select>
	<button type="submit" class="btn">Filter</button>
</form>

{#if data.issues.length === 0}
	<p class="empty">No issues found.</p>
{:else}
	<div class="issue-list">
		{#each data.issues as issue (issue.id)}
			<a href="/issues/{issue.id}" class="issue-row">
				<div class="issue-main">
					<span class="issue-id">#{issue.id}</span>
					<span class="issue-title">{issue.title}</span>
				</div>
				<div class="issue-meta">
					<span class="priority-dot" style="background: {priorityColors[issue.priority]}"></span>
					<span class="status-badge">{statusLabels[issue.status] ?? issue.status}</span>
					<span class="date">{issue.createdAt.slice(0, 10)}</span>
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.input {
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: inherit;
	}

	.input:first-child {
		flex: 1;
		min-width: 200px;
	}

	.btn {
		padding: 0.4rem 1rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
		font-family: inherit;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
		text-decoration: none;
	}

	.btn-primary:hover {
		background: var(--primary-hover);
	}

	.empty {
		color: var(--text-muted);
		padding: 2rem;
		text-align: center;
	}

	.issue-list {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: white;
		overflow: hidden;
	}

	.issue-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: inherit;
		border-bottom: 1px solid var(--border);
		transition: background 0.1s;
	}

	.issue-row:last-child {
		border-bottom: none;
	}

	.issue-row:hover {
		background: #f8f9fa;
	}

	.issue-main {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}

	.issue-id {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.issue-title {
		font-weight: 500;
	}

	.issue-meta {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.priority-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
	}

	.status-badge {
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--border);
		border-radius: 3px;
		font-size: 0.75rem;
	}

	.date {
		font-size: 0.75rem;
	}
</style>
