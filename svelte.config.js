import adapter from "@sveltejs/adapter-vercel"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { execSync } from "child_process"
import { readFileSync } from "fs"

// Get version from multiple sources
let version
try {
	// Try Vercel deployment ID first (unique per deployment)
	if (process.env.VERCEL_GIT_COMMIT_SHA) {
		version = process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
	} else {
		// Local development: use git hash
		version = execSync("git rev-parse --short HEAD", {
			encoding: "utf8",
		}).trim()
	}
} catch {
	// Fallback to package.json version
	const pkg = JSON.parse(readFileSync("./package.json", "utf8"))
	version = pkg.version
}
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		version: {
			// ideally, this should be something deterministic
			// like the output of `git rev-parse HEAD`
			name: version,
			// if undefined, no polling will occur
			pollInterval: 30000,
		},
	},
}

export default config
