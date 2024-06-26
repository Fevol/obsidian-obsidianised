import {MATERIAL_TIERS, ObsidianisedSettings, PICK_LEVEL} from "./types";
import {cumulative_percentages} from "./util";

export const DEFAULT_SETTINGS: ObsidianisedSettings = {
	storedResources: {
		[MATERIAL_TIERS.STONE]: 0,
		[MATERIAL_TIERS.IRON]: 0,
		[MATERIAL_TIERS.GOLD]: 0,
		[MATERIAL_TIERS.DIAMOND]: 0,
		[MATERIAL_TIERS.OBSIDIAN]: 0
	},
	pickaxeLevel: PICK_LEVEL.WOOD,
	unlockedUpgrades: {
		stonePickaxe: false,
		ironPickaxe: false,
		goldPickaxe: false,
		diamondPickaxe: false,
		disableStoneGeneration: false,
		disableIronGeneration: false,
		disableGoldGeneration: false,
		disableDiamondGeneration: false,
		disableObsidianGeneration: false,
	},
	enabledUpgrades: {
		disableStoneGeneration: false,
		disableIronGeneration: false,
		disableGoldGeneration: false,
		disableDiamondGeneration: false,
		disableObsidianGeneration: false,
	},
	playerWon: false,
	player: "193c"
}

export const ELEMENT_SPAWN_CHANCE = Object.freeze(cumulative_percentages({
	stone: 0.44,
	iron: 0.26,
	gold: 0.15,
	obsidian: 0.10,
	diamond: 0.05,
}));

export const ELEMENT_SPAWN_CHANCE_ALT = Object.freeze(cumulative_percentages({
	stone: 0.01,
	iron: 0.01,
	gold: 0.01,
	obsidian: 0.96,
	diamond: 0.01
}));

export const ELEMENT_CLICK_REQUIREMENTS = Object.freeze({
	stone: 3,
	iron: 5,
	gold: 7,
	diamond: 10,
	obsidian: 15,
});

export const LAYOUT_CHANGE_SPAWN_PERCENTAGES = Object.freeze(cumulative_percentages({
	"0": 0.6,
	"1": 0.3,
	"2": 0.1
}));

export const LAYOUT_CHANGE_SPAWN_PERCENTAGES_ALT = Object.freeze(cumulative_percentages({
	"0": 0.05,
	"1": 0.1,
	"2": 0.2,
	"3": 0.3,
	"4": 0.35
}));

export const KEYBOARD_INPUT_SPAWN_PERCENTAGES = Object.freeze(cumulative_percentages({
	"0": 0.9,
	"1": 0.1
}));

export const KEYBOARD_INPUT_SPAWN_PERCENTAGES_ALT = Object.freeze(cumulative_percentages({
	"0": 0.1,
	"1": 0.2,
	"2": 0.3,
	"3": 0.4
}));

export const CLICK_INPUT_SPAWN_PERCENTAGES = Object.freeze(cumulative_percentages({
	"0": 0.6,
	"1": 0.3,
	"2": 0.1
}));

export const CLICK_INPUT_SPAWN_PERCENTAGES_ALT = Object.freeze(cumulative_percentages({
	"0": 0.05,
	"1": 0.1,
	"2": 0.2,
	"3": 0.3,
	"4": 0.35
}));

export const PICK_UPGRADE_PRICES = Object.freeze({
	[PICK_LEVEL.STONE]: 20,
	[PICK_LEVEL.IRON]: 15,
	[PICK_LEVEL.GOLD]: 10,
	[PICK_LEVEL.DIAMOND]: 5
});

export const DISABLE_UPGRADE_PRICES = Object.freeze({
	stone: 25,
	iron: 25,
	gold: 20,
	diamond: 10,
	obsidian: 20
});

export const PICKAXE_TIERS = Object.freeze({
	[PICK_LEVEL.WOOD]: "Wood",
	[PICK_LEVEL.STONE]: "Stone",
	[PICK_LEVEL.IRON]: "Iron",
	[PICK_LEVEL.GOLD]: "Gold",
	[PICK_LEVEL.DIAMOND]: "Diamond",
});
