
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/machine_history" | "/machines" | "/molds" | "/molds/[id]" | "/molds/[id]/graph";
		RouteParams(): {
			"/molds/[id]": { id: string };
			"/molds/[id]/graph": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/machine_history": Record<string, never>;
			"/machines": Record<string, never>;
			"/molds": { id?: string };
			"/molds/[id]": { id: string };
			"/molds/[id]/graph": { id: string }
		};
		Pathname(): "/" | "/machine_history" | "/machine_history/" | "/machines" | "/machines/" | "/molds" | "/molds/" | `/molds/${string}` & {} | `/molds/${string}/` & {} | `/molds/${string}/graph` & {} | `/molds/${string}/graph/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}