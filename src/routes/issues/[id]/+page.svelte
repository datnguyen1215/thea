<script lang="ts">
	import { enhance } from '$app/forms';
	import { Marked } from 'marked';

	let { data } = $props();

	const marked = new Marked();

	const renderedDescription = $derived(
		data.issue.description ? marked.parse(data.issue.description) : ''
	);

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

<div class="header">
	<div>
		<h1>#{data.issue.id} {data.issue.title}</h1>
		<div class="meta">
			<span class="priority-dot" style="background: {priorityColors[data.issue.priority]}"></span>
			<span>{data.issue.priority}</span>
			<span class="status-badge">{statusLabels[data.issue.status] ?? data.issue.status}</span>
			<span class="date">Created {data.issue.createdAt.slice(0, 10)}</span>
		</div>
	</div>
	<div class="actions">
		<a href="/issues/{data.issue.id}/edit" class="btn">Edit</a>
		<form method="POST" action="?/delete" use:enhance>
			<button type="submit" class="btn btn-danger">Delete</button>
		</form>
	</div>
</div>

{#if data.labels.length > 0}
	<div class="labels">
		{#each data.labels as label (label.id)}
			<span class="label-tag">{label.label}</span>
		{/each}
	</div>
{/if}

<section class="description">
	<h2>Description</h2>
	{#if renderedDescription}
		<div class="markdown">{@html renderedDescription}</div>
	{:else}
		<p class="empty">No description.</p>
	{/if}
</section>

<section class="status-actions">
	<h2>Actions</h2>
	<div class="status-buttons">
		{#each ['open', 'in_progress', 'done', 'closed'] as s (s)}
			{#if s !== data.issue.status}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value={s} />
					<button type="submit" class="btn btn-sm">
						Mark {statusLabels[s]}
					</button>
				</form>
			{/if}
		{/each}
	</div>
</section>

<section class="agent-section">
	<h2>Agent</h2>

	{#if data.issue.agentSession}
		<div class="agent-card">
			<div class="agent-header">
				<span class="agent-name">{data.issue.agentSession}</span>
				<span class="agent-status active">assigned</span>
			</div>

			<div class="agent-actions">
				<div class="send-form">
					<input
						type="text"
						placeholder="Send message to agent..."
						bind:value={message}
						onkeydown={(e) => {
							if (e.key === 'Enter') sendMessage();
						}}
						disabled={loading}
					/>
					<button onclick={sendMessage} disabled={loading || !message.trim()}>
						Send
					</button>
				</div>
				<button class="kill-btn" onclick={killAgent} disabled={loading}>
					Kill
				</button>
			</div>
		</div>
	{:else}
		<button class="spawn-btn" onclick={spawnAgent} disabled={loading}>
			{loading ? 'Spawning...' : 'Spawn Agent'}
		</button>
	{/if}
</section>

<section class="timeline">
	<h2>Activity</h2>
	{#if data.events.length === 0}
		<p class="empty">No activity yet.</p>
	{:else}
		<ul class="event-list">
			{#each data.events as event (event.id)}
				<li class="event-item">
					<span class="event-type">{eventLabels[event.type] ?? event.type}</span>
					{#if formatDetail(event.type, event.detail)}
						<span class="event-detail">{formatDetail(event.type, event.detail)}</span>
					{/if}
					<span class="event-date">{event.createdAt.slice(0, 16).replace('T', ' ')}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	h1 { font-size: 1.5rem; }
	h2 {
		font-size: 1rem;
		margin-bottom: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		font-size: 0.85rem;
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

	.date { font-size: 0.8rem; }

	.actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn {
		padding: 0.4rem 1rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.85rem;
		font-family: inherit;
		text-decoration: none;
		color: inherit;
	}

	.btn-danger {
		color: var(--danger);
		border-color: var(--danger);
	}

	.btn-danger:hover {
		background: var(--danger);
		color: white;
	}

	.btn-sm {
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
	}

	.labels {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1.5rem;
	}

	.label-tag {
		background: #e9ecef;
		padding: 0.15rem 0.5rem;
		border-radius: 3px;
		font-size: 0.8rem;
	}

	section {
		margin-bottom: 2rem;
	}

	.description {
		background: white;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.25rem;
	}

	.markdown {
		line-height: 1.7;
	}

	.markdown :global(pre) {
		background: #f1f3f5;
		padding: 0.75rem;
		border-radius: 4px;
		overflow-x: auto;
	}

	.markdown :global(code) {
		background: #f1f3f5;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		font-size: 0.9em;
	}

	.empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.status-actions .status-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.agent-section {
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: white;
	}

	.agent-card {
		background: #f9f9f9;
		padding: 1rem;
		border-radius: 6px;
	}

	.agent-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.agent-name {
		font-weight: 600;
		font-family: monospace;
	}

	.agent-status {
		padding: 0.2rem 0.6rem;
		border-radius: 12px;
		font-size: 0.8rem;
		background: #eee;
		color: #666;
	}

	.agent-status.active {
		background: #d4edda;
		color: #155724;
	}

	.agent-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.send-form {
		display: flex;
		gap: 0.5rem;
		flex: 1;
	}

	.send-form input {
		flex: 1;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.send-form button,
	.spawn-btn,
	.kill-btn {
		padding: 0.4rem 0.8rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.send-form button {
		background: var(--primary);
		color: #fff;
	}

	.spawn-btn {
		background: var(--success);
		color: #fff;
		padding: 0.5rem 1.2rem;
		font-size: 1rem;
	}

	.kill-btn {
		background: var(--danger);
		color: #fff;
	}

	.send-form button:disabled,
	.spawn-btn:disabled,
	.kill-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.event-list {
		list-style: none;
		border-left: 2px solid var(--border);
		padding-left: 1rem;
	}

	.event-item {
		padding: 0.5rem 0;
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		font-size: 0.85rem;
	}

	.event-type {
		font-weight: 500;
	}

	.event-detail {
		color: var(--text-muted);
	}

	.event-date {
		color: var(--text-muted);
		font-size: 0.75rem;
		margin-left: auto;
	}
</style>
