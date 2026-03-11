<script lang="ts">
	let { data } = $props();
</script>

<h1 class="mb-6 text-2xl font-bold">Dashboard</h1>
<div class="flex gap-4">
	<div class="rounded-lg border border-gray-200 bg-white px-8 py-6 min-w-40">
		<div class="text-3xl font-bold">{data.totalIssues}</div>
		<div class="text-gray-500 text-sm mt-1">Total Issues</div>
	</div>
	<div class="rounded-lg border border-gray-200 bg-white px-8 py-6 min-w-40">
		<div class="text-3xl font-bold">{data.openIssues}</div>
		<div class="text-gray-500 text-sm mt-1">Open Issues</div>
	</div>
</div>
