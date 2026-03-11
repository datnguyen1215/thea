<script lang="ts">
	let { data } = $props();
</script>

<h1>Dashboard</h1>
<div class="stats">
	<div class="stat-card">
		<div class="stat-value">{data.totalIssues}</div>
		<div class="stat-label">Total Issues</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{data.openIssues}</div>
		<div class="stat-label">Open Issues</div>
	</div>
</div>

<style>
	h1 { margin-bottom: 1.5rem; }

	.stats {
		display: flex;
		gap: 1rem;
	}

	.stat-card {
		background: white;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.5rem 2rem;
		min-width: 160px;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
	}

	.stat-label {
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}
</style>
