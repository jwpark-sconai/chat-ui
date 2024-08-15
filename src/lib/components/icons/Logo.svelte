<script lang="ts">
	import { page } from "$app/stores";
	import { env as envPublic } from "$env/dynamic/public";
	import { base } from "$app/paths";

	export let classNames = "";
</script>

{#if envPublic.PUBLIC_APP_ASSETS === "chatui"}
<!--	<svg-->
<!--		height="30"-->
<!--		width="30"-->
<!--		viewBox="0 0 30 30"-->
<!--		xmlns="http://www.w3.org/2000/svg"-->
<!--		class={classNames}-->
<!--	>-->
		<img
			alt="{envPublic.PUBLIC_APP_NAME} logo"
			src="https://sconchat.blob.core.windows.net/sconchat/static/sconx-logo1.png"
			width="30" height="30" style="margin-right: 0.25rem;"
		/>
<!--	</svg>-->
{:else}
	<img
		class={classNames}
		alt="{envPublic.PUBLIC_APP_NAME} logo"
		src="{envPublic.PUBLIC_ORIGIN || $page.url.origin}{base}/{envPublic.PUBLIC_APP_ASSETS}/logo.svg"
	/>
{/if}
