<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<h1>New Issue</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form method="POST" use:enhance class="form">
	<label class="field">
		<span>Title</span>
		<input type="text" name="title" required class="input" />
	</label>

	<label class="field">
		<span>Description</span>
		<textarea name="description" rows="8" class="input"></textarea>
	</label>

	<label class="field">
		<span>Priority</span>
		<select name="priority" class="input">
			<option value="low">Low</option>
			<option value="medium" selected>Medium</option>
			<option value="high">High</option>
			<option value="critical">Critical</option>
		</select>
	</label>

	<label class="field">
		<span>Labels</span>
		<input type="text" name="labels" placeholder="comma-separated" class="input" />
	</label>

	<div class="actions">
		<button type="submit" class="btn btn-primary">Create Issue</button>
		<a href="/issues" class="btn">Cancel</a>
	</div>
</form>

<style>
	h1 { margin-bottom: 1.5rem; }

	.form {
		max-width: 600px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field span {
		font-size: 0.85rem;
		font-weight: 500;
	}

	.input {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: inherit;
	}

	textarea.input {
		resize: vertical;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
		font-family: inherit;
		text-decoration: none;
		color: inherit;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
	}

	.btn-primary:hover {
		background: var(--primary-hover);
	}

	.error {
		color: var(--danger);
		margin-bottom: 1rem;
	}
</style>
