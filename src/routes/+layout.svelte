<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<style>
		:root {
			--bg: #f8f9fa;
			--bg-sidebar: #1a1a2e;
			--text: #212529;
			--text-muted: #6c757d;
			--text-sidebar: #e0e0e0;
			--text-sidebar-active: #ffffff;
			--border: #dee2e6;
			--primary: #4361ee;
			--primary-hover: #3a56d4;
			--danger: #dc3545;
			--success: #198754;
			--warning: #fd7e14;
			--badge-bg: rgba(255, 255, 255, 0.15);
			font-family: system-ui, -apple-system, sans-serif;
		}

		* { box-sizing: border-box; margin: 0; padding: 0; }

		body {
			background: var(--bg);
			color: var(--text);
			line-height: 1.5;
		}
	</style>
</svelte:head>

<div class="app-shell">
	<nav class="sidebar">
		<div class="sidebar-brand">thea</div>
		<ul class="sidebar-nav">
			<li><a href="/">Dashboard</a></li>
			<li>
				<a href="/issues">
					Issues
					{#if data.openIssues > 0}
						<span class="badge">{data.openIssues}</span>
					{/if}
				</a>
			</li>
			<li><a href="/agents">Agents</a></li>
		</ul>
	</nav>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 220px;
		background: var(--bg-sidebar);
		color: var(--text-sidebar);
		padding: 1rem 0;
		flex-shrink: 0;
	}

	.sidebar-brand {
		font-size: 1.25rem;
		font-weight: 700;
		padding: 0.5rem 1.25rem 1.5rem;
		color: var(--text-sidebar-active);
		letter-spacing: 0.05em;
	}

	.sidebar-nav {
		list-style: none;
	}

	.sidebar-nav li a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 1.25rem;
		color: var(--text-sidebar);
		text-decoration: none;
		font-size: 0.9rem;
		transition: background 0.15s;
	}

	.sidebar-nav li a:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-sidebar-active);
	}

	.badge {
		background: var(--badge-bg);
		padding: 0.1rem 0.5rem;
		border-radius: 10px;
		font-size: 0.75rem;
	}

	.content {
		flex: 1;
		padding: 2rem;
		max-width: 1100px;
	}
</style>
