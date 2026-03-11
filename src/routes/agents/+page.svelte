<script lang="ts">
	let { data } = $props();

	let sessions = $derived((data.status as any)?.sessions ?? []);
	let messageInputs: Record<string, string> = $state({});
	let loading: Record<string, boolean> = $state({});

	const sendMessage = async (session: string) => {
		const message = messageInputs[session]?.trim();
		if (!message) return;

		loading[session] = true;
		try {
			const res = await fetch(`/api/agents/${encodeURIComponent(session)}/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message })
			});
			if (res.ok) messageInputs[session] = '';
		} finally {
			loading[session] = false;
		}
	};

	const killAgent = async (session: string) => {
		if (!confirm(`Kill session "${session}"?`)) return;

		loading[session] = true;
		try {
			await fetch(`/api/agents/${encodeURIComponent(session)}/kill`, {
				method: 'POST'
			});
			location.reload();
		} finally {
			loading[session] = false;
		}
	};
</script>

<svelte:head>
	<title>Agents - Thea</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Agent Sessions</h1>

{#if sessions.length === 0}
	<p class="text-gray-500">No active agent sessions.</p>
{:else}
	<div class="flex flex-col gap-4">
		{#each sessions as session (session.name)}
			{@const issue = data.sessionToIssue[session.name]}
			<div class="rounded-lg border border-gray-200 bg-white p-5">
				<div class="mb-3 flex items-center justify-between">
					<h2 class="text-lg font-semibold">{session.name}</h2>
					<span
						class="rounded-full px-2.5 py-0.5 text-xs {session.status === 'running'
							? 'bg-green-100 text-green-800'
							: 'bg-gray-200 text-gray-500'}"
					>
						{session.status}
					</span>
				</div>

				{#if session.branch}
					<p class="my-1 text-sm text-gray-500">
						Branch: <code class="rounded bg-gray-100 px-1 py-0.5">{session.branch}</code>
					</p>
				{/if}

				{#if session.pr}
					<p class="my-1 text-sm text-gray-500">PR: {session.pr}</p>
				{/if}

				{#if issue}
					<p class="my-1 text-sm text-gray-500">
						Issue: <a href="/issues/{issue.id}" class="text-indigo-500 hover:underline"
							>#{issue.id} - {issue.title}</a
						>
					</p>
				{/if}

				{#if session.lastActivity}
					<p class="my-1 text-sm text-gray-500">Last activity: {session.lastActivity}</p>
				{/if}

				<div class="mt-4 flex items-center gap-2">
					<div class="flex flex-1 gap-2">
						<input
							type="text"
							placeholder="Send message..."
							bind:value={messageInputs[session.name]}
							onkeydown={(e) => {
								if (e.key === 'Enter') sendMessage(session.name);
							}}
							disabled={loading[session.name]}
							class="flex-1 rounded border border-gray-200 px-2.5 py-1.5 text-sm font-[inherit]"
						/>
						<button
							onclick={() => sendMessage(session.name)}
							disabled={loading[session.name] || !messageInputs[session.name]?.trim()}
							class="cursor-pointer rounded border-none bg-indigo-500 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							Send
						</button>
					</div>
					<button
						onclick={() => killAgent(session.name)}
						disabled={loading[session.name]}
						class="cursor-pointer rounded border-none bg-red-600 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						Kill
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
