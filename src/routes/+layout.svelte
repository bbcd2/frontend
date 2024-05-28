<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.css';
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Dropdown,
		DropdownItem,
		DropdownDivider,
		DarkMode,
		Button,
		Footer,
		FooterBrand,
		FooterCopyright,
		FooterIcon,
		FooterLink,
		FooterLinkGroup,
		Banner
	} from 'flowbite-svelte';
	import { ChevronDownOutline, BullhornSolid } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
	import {} from 'flowbite-svelte';

	let btnClass =
		'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xl p-2 center-content';
</script>

<div class="flex flex-col min-h-screen">
	<Navbar class="border-b-black dark:border-b-white border-b dark:bg-black">
		<NavBrand href="/">
			<img src="logo.svg" class="me-3 h-6 sm:h-9 dark:invert" alt="BBCD Logo" />
		</NavBrand>
		<NavHamburger />
		<NavUl {activeUrl}>
			<NavLi>
				<DarkMode {btnClass} />
			</NavLi>
		</NavUl>
	</Navbar>
	<main class="flex-1">
		<slot />
	</main>
	<div class="w-full border-t border-black dark:border-white mt-5">
		<p class="text-center m-5">Made with ❤️ by Kat 🏳️‍⚧️</p>
	</div>
</div>
