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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) messageInputs[session] = "";
    } finally {
      loading[session] = false;
    }
  };

  const killAgent = async (session: string) => {
    if (!confirm(`Kill session "${session}"?`)) return;

    loading[session] = true;
    try {
      await fetch(`/api/agents/${encodeURIComponent(session)}/kill`, {
        method: "POST",
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

<div class="page">
  <h1>Agent Sessions</h1>

  {#if sessions.length === 0}
    <p class="empty">No active agent sessions.</p>
  {:else}
    <div class="grid">
      {#each sessions as session (session.name)}
        {@const issue = data.sessionToIssue[session.name]}
        <div class="card">
          <div class="card-header">
            <h2>{session.name}</h2>
            <span class="status" class:active={session.status === "running"}>
              {session.status}
            </span>
          </div>

          {#if session.branch}
            <p class="meta">Branch: <code>{session.branch}</code></p>
          {/if}

          {#if session.pr}
            <p class="meta">PR: {session.pr}</p>
          {/if}

          {#if issue}
            <p class="meta">
              Issue: <a href="/issues/{issue.id}">#{issue.id} - {issue.title}</a>
            </p>
          {/if}

          {#if session.lastActivity}
            <p class="meta">Last activity: {session.lastActivity}</p>
          {/if}

          <div class="actions">
            <div class="send-form">
              <input
                type="text"
                placeholder="Send message..."
                bind:value={messageInputs[session.name]}
                onkeydown={(e) => {
                  if (e.key === "Enter") sendMessage(session.name);
                }}
                disabled={loading[session.name]}
              />
              <button
                onclick={() => sendMessage(session.name)}
                disabled={loading[session.name] || !messageInputs[session.name]?.trim()}
              >
                Send
              </button>
            </div>
            <button
              class="kill-btn"
              onclick={() => killAgent(session.name)}
              disabled={loading[session.name]}
            >
              Kill
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .empty {
    color: #666;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.25rem;
    background: #fff;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .status {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    background: #eee;
    color: #666;
  }

  .status.active {
    background: #d4edda;
    color: #155724;
  }

  .meta {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #555;
  }

  .meta code {
    background: #f5f5f5;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }

  .actions {
    margin-top: 1rem;
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
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .send-form button,
  .kill-btn {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .send-form button {
    background: #007bff;
    color: #fff;
  }

  .send-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .kill-btn {
    background: #dc3545;
    color: #fff;
  }

  .kill-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
