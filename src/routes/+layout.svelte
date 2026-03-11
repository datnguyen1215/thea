<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen">
	<nav class="w-55 shrink-0 bg-[#1a1a2e] text-gray-300 py-4">
		<div class="text-xl font-bold px-5 pb-6 text-white tracking-wide">thea</div>
		<ul class="list-none">
			<li>
				<a href="/" class="flex items-center justify-between px-5 py-2.5 text-gray-300 no-underline text-sm transition-[background] duration-150 hover:bg-white/[0.08] hover:text-white">
					Dashboard
				</a>
			</li>
			<li>
				<a href="/issues" class="flex items-center justify-between px-5 py-2.5 text-gray-300 no-underline text-sm transition-[background] duration-150 hover:bg-white/[0.08] hover:text-white">
					Issues
					{#if data.openIssues > 0}
						<span class="bg-white/15 px-2 py-0.5 rounded-xl text-xs">{data.openIssues}</span>
					{/if}
				</a>
			</li>
			<li>
				<a href="/agents" class="flex items-center justify-between px-5 py-2.5 text-gray-300 no-underline text-sm transition-[background] duration-150 hover:bg-white/[0.08] hover:text-white">
					Agents
				</a>
			</li>
		</ul>
	</nav>
	<main class="flex-1 p-8 max-w-[1100px]">
		{@render children()}
	</main>
</div>
