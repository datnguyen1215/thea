<script lang="ts">
  let { data } = $props();

  let message = $state("");
  let loading = $state(false);

  const spawnAgent = async () => {
    loading = true;
    try {
      const res = await fetch("/api/agents/spawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: data.issue.id }),
      });
      if (res.ok) location.reload();
      else alert((await res.json()).message ?? "Failed to spawn agent");
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      message = "";
    } finally {
      loading = false;
    }
  };

  const killAgent = async () => {
    if (!data.issue.agentSession) return;
    if (!confirm("Kill this agent session?")) return;

    loading = true;
    try {
      const session = encodeURIComponent(data.issue.agentSession);
      await fetch(`/api/agents/${session}/kill`, { method: "POST" });
      location.reload();
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Issue #{data.issue.id} - Thea</title>
</svelte:head>

<div class="page">
  <a href="/issues" class="back">&larr; Back to issues</a>

  <div class="header">
    <h1>{data.issue.title}</h1>
    <div class="badges">
      <span class="badge priority-{data.issue.priority}">{data.issue.priority}</span>
      <span class="badge status-{data.issue.status}">{data.issue.status.replace("_", " ")}</span>
    </div>
  </div>

  {#if data.issue.description}
    <div class="description">{data.issue.description}</div>
  {/if}

  {#if data.labels.length > 0}
    <div class="labels">
      {#each data.labels as label}
        <span class="label">{label.label}</span>
      {/each}
    </div>
  {/if}

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
                if (e.key === "Enter") sendMessage();
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
        {loading ? "Spawning..." : "Spawn Agent"}
      </button>
    {/if}
  </section>

  {#if data.events.length > 0}
    <section class="events">
      <h2>Activity</h2>
      <ul>
        {#each data.events as event}
          <li>
            <span class="event-type">{event.type.replace(/_/g, " ")}</span>
            <span class="event-date">{event.createdAt}</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <p class="meta">Created: {data.issue.createdAt} | Updated: {data.issue.updatedAt}</p>
</div>

<style>
  .page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .back {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .header {
    margin: 1rem 0;
  }

  .header h1 {
    margin: 0 0 0.5rem;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
  }

  .badge {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: capitalize;
  }

  .priority-low { background: #d1ecf1; color: #0c5460; }
  .priority-medium { background: #fff3cd; color: #856404; }
  .priority-high { background: #f8d7da; color: #721c24; }
  .priority-critical { background: #dc3545; color: #fff; }

  .status-open { background: #d4edda; color: #155724; }
  .status-in_progress { background: #cce5ff; color: #004085; }
  .status-done { background: #e2e3e5; color: #383d41; }
  .status-closed { background: #f5f5f5; color: #666; }

  .description {
    margin: 1rem 0;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    white-space: pre-wrap;
  }

  .labels {
    display: flex;
    gap: 0.4rem;
    margin: 0.5rem 0;
  }

  .label {
    padding: 0.15rem 0.5rem;
    background: #e9ecef;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .agent-section {
    margin: 2rem 0;
    padding: 1.25rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .agent-section h2 {
    margin: 0 0 1rem;
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
    border: 1px solid #ccc;
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
    background: #007bff;
    color: #fff;
  }

  .spawn-btn {
    background: #28a745;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-size: 1rem;
  }

  .kill-btn {
    background: #dc3545;
    color: #fff;
  }

  .send-form button:disabled,
  .spawn-btn:disabled,
  .kill-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .events {
    margin: 2rem 0;
  }

  .events h2 {
    margin-bottom: 0.75rem;
  }

  .events ul {
    list-style: none;
    padding: 0;
  }

  .events li {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
  }

  .event-type {
    text-transform: capitalize;
  }

  .event-date {
    color: #888;
    font-size: 0.85rem;
  }

  .meta {
    margin-top: 2rem;
    color: #888;
    font-size: 0.85rem;
  }
</style>
