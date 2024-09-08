<script lang="ts">
	import { page } from "$app/stores";
	import { base } from "$app/paths";
	import { env as envPublic } from "$env/dynamic/public";
	import type { BackendModel } from "$lib/server/models";
	import { useSettingsStore } from "$lib/stores/settings";
	import CopyToClipBoardBtn from "$lib/components/CopyToClipBoardBtn.svelte";
	import TokensCounter from "$lib/components/TokensCounter.svelte";
	import CarbonArrowUpRight from "~icons/carbon/arrow-up-right";
	import CarbonLink from "~icons/carbon/link";
	import { error, ERROR_MESSAGES } from "$lib/stores/errors";

	const settings = useSettingsStore();

	async function getPreprompt() {
		if (!$settings.currentConvId) {
			return $page.data.models.find((el: BackendModel) => el.id === $page.params.model)?.preprompt || "";
		}
		try {
			const res = await fetch(`${base}/conversation/${$settings.currentConvId}/preprompt`, {
				method: "GET",
			});

			if (!res.ok) {
				// Handle non-successful responses
				if (res.status === 204) {
					// No Content
					return $page.data.models.find((el: BackendModel) => el.id === $page.params.model)?.preprompt || "";
				} else {
					// Other errors
					throw new Error(`Error: ${res.statusText}`);
				}
			}

			// Parse the JSON response
			const preprompt = await res.json();
			return preprompt || "";

		} catch (err) {
			console.error('Error fetching preprompt:', err);
			return $page.data.models.find((el: BackendModel) => el.id === $page.params.model)?.preprompt || "";
		}
	}

	$: if ($settings.customPrompts[$settings.currentConvId] === undefined) {
		(async () => {
			const preprompt = await getPreprompt();
			$settings.customPrompts = {
				...$settings.customPrompts,
				[$settings.currentConvId]: preprompt,
			};
		})();
	}

	$: hasCustomPreprompt =
		$settings.customPrompts[$page.params.id] !==
		$page.data.models.find((el: BackendModel) => el.id === $settings.currentConvId)?.preprompt;

	$: isActive = $settings.activeModel === $page.params.model;

	$: model = $page.data.models.find((el: BackendModel) => el.id === $page.params.model);
</script>

<div class="flex flex-col items-start">
	<div class="mb-5 flex flex-col gap-1.5">
		<h2 class="text-lg font-semibold md:text-xl">
			{model.name}
		</h2>

		{#if model.description}
			<p class="whitespace-pre-wrap text-gray-600">
				{model.description}
			</p>
		{/if}
	</div>

	<div class="flex flex-wrap items-center gap-2 md:gap-4">
		{#if model.modelUrl}
			<a
				href={model.modelUrl || "https://huggingface.co/" + model.name}
				target="_blank"
				rel="noreferrer"
				class="flex items-center truncate underline underline-offset-2"
			>
				<CarbonArrowUpRight class="mr-1.5 shrink-0 text-xs " />
				Model page
			</a>
		{/if}

		{#if model.datasetName || model.datasetUrl}
			<a
				href={model.datasetUrl || "https://huggingface.co/datasets/" + model.datasetName}
				target="_blank"
				rel="noreferrer"
				class="flex items-center truncate underline underline-offset-2"
			>
				<CarbonArrowUpRight class="mr-1.5 shrink-0 text-xs " />
				Dataset page
			</a>
		{/if}

		{#if model.websiteUrl}
			<a
				href={model.websiteUrl}
				target="_blank"
				class="flex items-center truncate underline underline-offset-2"
				rel="noreferrer"
			>
				<CarbonArrowUpRight class="mr-1.5 shrink-0 text-xs " />
				Model website
			</a>
		{/if}
		<CopyToClipBoardBtn
			value="{envPublic.PUBLIC_ORIGIN || $page.url.origin}{base}/models/{model.id}"
			classNames="!border-none !shadow-none !py-0 !px-1 !rounded-md"
		>
			<div class="flex items-center gap-1.5 hover:underline">
				<CarbonLink />
				Copy direct link to model
			</div>
		</CopyToClipBoardBtn>
	</div>

	{#if model.available === true}
		<button
			class="{isActive
			? 'bg-gray-100'
			: 'bg-black text-white'} my-8 flex items-center rounded-full px-3 py-1"
			disabled={isActive}
			name="Activate model"
			on:click|stopPropagation={() => {
			$settings.activeModel = $page.params.model;
		}}
		>
			{isActive ? "Active model" : "Activate"}
		</button>
	{/if}

	{#if model.available === false}
		{#if model.isActive === true}
			<button
				class="{isActive
				? 'bg-gray-100'
				: 'bg-black text-white'} my-8 flex items-center rounded-full px-3 py-1"
				disabled={isActive}
				name="Activate model"
				on:click|stopPropagation={() => {
				$settings.activeModel = $page.params.model;
			}}
			>
				{isActive ? "Active model" : "Activate"}
			</button>
		{/if}

		<button
			class="bg-gray-100 my-8 flex items-center rounded-full px-3 py-1"
			disabled='true'
			name="Activate model"
		>
			서버가 동작하고 있지 않습니다. 사용하시려면 관리자에게 문의하세요.
		</button>
	{/if}

	<div class="relative flex w-full flex-col gap-2">
		<div class="flex w-full flex-row content-between">
			<h3 class="mb-1.5 text-lg font-semibold text-gray-800">System Prompt</h3>
			{#if hasCustomPreprompt}
				<button
					class="ml-auto underline decoration-gray-300 hover:decoration-gray-700"
					on:click|stopPropagation={() =>
						($settings.customPrompts[$settings.currentConvId] = model.preprompt)}
				>
					Reset
				</button>
			{/if}
		</div>
		<textarea
			rows="10"
			class="w-full resize-none rounded-md border-2 bg-gray-100 p-2"
			bind:value={$settings.customPrompts[$settings.currentConvId]}
		/>
		{#if model.tokenizer && $settings.customPrompts[$settings.currentConvId]}
			<TokensCounter
				classNames="absolute bottom-2 right-2"
				prompt={$settings.customPrompts[$page.params.id]}
				modelTokenizer={model.tokenizer}
				truncate={model?.parameters?.truncate}
			/>
		{/if}
	</div>
</div>
