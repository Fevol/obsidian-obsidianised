export function removeStageClasses(element: HTMLElement) {
	element.classList.forEach((cls) => {
		if (cls.startsWith('obsidianised-stage-')) {
			element.classList.remove(cls);
		}
	});
}

export function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function cumulative_percentages<T extends string>(obj: Record<T, number>) {
	let sum = 0;
	for (const key in obj) {
		sum += obj[key];
		obj[key] = sum;
	}
	return obj;
}

export function get_random_value(obj: { [key: string]: number }) {
	const random = Math.random();
	for (const key in obj) {
		if (random < obj[key])
			return key;
	}
	return Object.keys(obj)[0];
}


export const addRandomInterval = (cb: () => void, min: number, max: number) => {
	const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
	setTimeout(cb, randomTime);
}

export const continousRandomInterval = (cb: () => void, min: number, max: number) => {
	let breakLoop = false;
	let pause = false;
	const constantContinuousRandomInterval = (cb: () => void, min: number, max: number) => {
		addRandomInterval(() => {
			if (!pause)
				cb();
			if (breakLoop)
				return;
			constantContinuousRandomInterval(cb, min, max);
		}, min, max);
	}
	constantContinuousRandomInterval(cb, min, max);

	return {
		pause: () => { pause = !pause; },
		stop: () => { breakLoop = true; }
	}
}


export async function hashObject(obj: any) {
	const copy = structuredClone(obj);
	delete copy.player;

	const encoder = new TextEncoder();
	const data = encoder.encode(JSON.stringify(copy));
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex.substring(0, 4);
}
