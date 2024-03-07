import esbuild from "esbuild";
import {sassPlugin} from "esbuild-sass-plugin";
import process from "process";
import builtins from "builtin-modules";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
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
