export enum PICK_LEVEL {
	WOOD,
	STONE,
	IRON,
	GOLD ,
	DIAMOND
}

export enum MATERIAL_TIERS {
	STONE = "stone",
	IRON = "iron",
	GOLD = "gold",
	DIAMOND = "diamond",
	OBSIDIAN = "obsidian"

}

export interface ObsidianisedSettings {
	storedResources: {
		[key in MATERIAL_TIERS]: number;
	},
	pickaxeLevel: PICK_LEVEL,
	enabledUpgrades: {
		disableStoneGeneration: boolean,
		disableIronGeneration: boolean,
		disableGoldGeneration: boolean,
		disableDiamondGeneration: boolean,
		disableObsidianGeneration: boolean,
	},
	unlockedUpgrades: {
		stonePickaxe: boolean,
		ironPickaxe: boolean,
		goldPickaxe: boolean,
		diamondPickaxe: boolean,
		disableStoneGeneration: boolean,
		disableIronGeneration: boolean,
		disableGoldGeneration: boolean,
		disableDiamondGeneration: boolean,
		disableObsidianGeneration: boolean,
	},
	playerWon: boolean
}
