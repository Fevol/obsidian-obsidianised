import esbuild from "esbuild";
import {sassPlugin} from "esbuild-sass-plugin";
import process from "process";
import builtins from "builtin-modules";

const banner =
`/*
THIS IS A JOKE PLUGIN BY FEVOL
Please, do not attempt to reverse-engineer this plugin's API, as it is not worth your time.
This is also a not-so-thinly-veiled attempt to prevent you from cheating.
Further, please don't forget that the Anti-Cheat Nefarious Engine™ is still in effect.
*/
`;

const prod = (process.argv[2] === "production");
const dir = prod ? "./" : process.env.OUTDIR || "./";

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts', 'src/styles.css'],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins],
	plugins: [
		sassPlugin(),
	],
	loader: {
		".png": "dataurl",
	},
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outdir: dir,
});

await context.rebuild();
process.exit(0);
