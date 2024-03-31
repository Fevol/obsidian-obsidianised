import {Notice, Plugin} from 'obsidian';
import {ObsidianisedSettingsTab} from "./settings";
import {MATERIAL_TIERS, ObsidianisedSettings} from "./types";
import {
	addRandomInterval,
	continousRandomInterval,
	get_random_value,
	hashObject,
	removeStageClasses,
	toTitleCase
} from "./util";
import {
	DEFAULT_SETTINGS,
	ELEMENT_CLICK_REQUIREMENTS,
	CLICK_INPUT_SPAWN_PERCENTAGES, CLICK_INPUT_SPAWN_PERCENTAGES_ALT,
	ELEMENT_SPAWN_CHANCE, ELEMENT_SPAWN_CHANCE_ALT,
	KEYBOARD_INPUT_SPAWN_PERCENTAGES, KEYBOARD_INPUT_SPAWN_PERCENTAGES_ALT,
	LAYOUT_CHANGE_SPAWN_PERCENTAGES, LAYOUT_CHANGE_SPAWN_PERCENTAGES_ALT,
	PICKAXE_TIERS
} from "./constants";

export default class ObsidianisedPlugin extends Plugin {
	#settings: ObsidianisedSettings = DEFAULT_SETTINGS;

	interactedMap: Map<keyof DocumentEventMap, Map<HTMLElement, { clicks: number, lastClick: number }>> = new Map();
	keyboardMap: Map<string, { presses: number, lastPress: number }> = new Map();

	layout_change_spawn_percentages = LAYOUT_CHANGE_SPAWN_PERCENTAGES;
	element_spawn_percentage = ELEMENT_SPAWN_CHANCE;
	element_click_requirement = ELEMENT_CLICK_REQUIREMENTS;
	click_input_spawn_percentages = CLICK_INPUT_SPAWN_PERCENTAGES;
	keyboard_input_spawn_percentages = KEYBOARD_INPUT_SPAWN_PERCENTAGES;

	click_clear_timeout = 10000;
	click_clear_interval = 5000;

	element_clear_min = 30000;
	element_clear_max = 60000;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ObsidianisedSettingsTab(this.app, this));

		this.preventAction('click');
		this.preventAction('contextmenu');
		this.preventAction('dblclick');
		this.preventAction('auxclick');
		this.preventKeyPress()

		setInterval(() => {
			const currentTimestamp = Date.now();
			this.interactedMap.forEach((map, type) => {
				map.forEach((value, element) => {
					if (currentTimestamp - value.lastClick > this.click_clear_timeout) {
						map.delete(element);
						if (element)
							removeStageClasses(element);
					}
				})
			});
			this.keyboardMap.forEach((value, key) => {
				if (currentTimestamp - value.lastPress > this.click_clear_timeout) {
					this.keyboardMap.delete(key);
				}
			});
		}, this.click_clear_interval);

		const control = continousRandomInterval(this.spawnResource.bind(this), 5000, 60000);
		this.addCommand({
			id: 'disable-plugin',
			name: 'Disable Obsidianised',
			callback: () => {
				this.app.plugins.disablePlugin(this.manifest.id);
			}
		});

		this.registerEvent(this.app.workspace.on("layout-change", () => {
			this.spawnResources(parseInt(get_random_value(this.layout_change_spawn_percentages)));
		}));

		this.setPickaxeLevel();
	}

	spawnResources(num: number) {
		for (let i = 0; i < num; i++)
			this.spawnResource();
	}

	spawnResource() {
		const rarityType = get_random_value(this.element_spawn_percentage);
		if (this.#settings.enabledUpgrades['disable' + toTitleCase(rarityType) + 'Generation' as keyof typeof this.#settings.enabledUpgrades])
			return;

		const element = document.createElement('div');
		element.style.position = 'absolute';
		const left_pos = Math.clamp(Math.floor(Math.random() * window.innerWidth), 0, window.innerWidth - 100);
		const top_pos = Math.clamp(Math.floor(Math.random() * window.innerHeight), 0, window.innerHeight - 100);

		element.style.left = `${left_pos}px`;
		element.style.top = `${top_pos}px`;
		element.style.zIndex = '9999';

		element.classList.add('obsidianised-block', `obsidianised-${rarityType}`)
		document.body.appendChild(element);

		addRandomInterval(() => {
			element.remove();
		}, this.element_clear_min, this.element_clear_max);

	}

	onunload() {
		const elements = document.getElementsByClassName('obsidianised-block');
		while (elements.length > 0) {
			elements[0].remove();
		}
	}

	setPickaxeLevel() {
		const tierName = PICKAXE_TIERS[this.#settings.pickaxeLevel];
		document.documentElement.style.setProperty('--obsidianised-pickaxe', `var(--obsidianised-${tierName.toLowerCase()}-pickaxe)`);
	}

	preventAction(type: keyof DocumentEventMap) {
		const map = new Map<HTMLElement, { clicks: number, lastClick: number }>();
		this.interactedMap.set(type, map);
		const unregister = (event: Event) => {
			const element = event.target as HTMLElement;

			if (Array.from(element.classList).some((cls) => cls.startsWith('cm')))
				return;

			if (element.parentElement?.classList.contains('setting-item-control')) {
				// @ts-ignore
				const settingName = element.parentElement.parentElement!.children[0].children[0].innerText;
				if (settingName === 'Obsidianised')
					return;
				if (settingName.startsWith('Craft'))
					return;
			}

			let storedElement = map.get(element);
			let required_clicks = 0;

			const element_type = element.classList.contains("obsidianised-block") && (element.classList[1] as keyof typeof this.element_click_requirement).split('-')[1] as keyof typeof this.#settings.storedResources;
			if (element_type)
				required_clicks = this.element_click_requirement[element_type as keyof typeof this.element_click_requirement] - 2 * this.#settings.pickaxeLevel;
			else {
				if (element.classList.contains("obsidianised-very-dangerous-button"))
					required_clicks = 100;
				else
					required_clicks = 5 - this.#settings.pickaxeLevel;
			}
			if (required_clicks <= 1) {
				if (element_type) {
					const settings = this.getSettings();
					settings.storedResources[element_type]++;
					this.setSetting("storedResources", settings.storedResources);
					this.saveSettings();
					element.remove();
				}
				this.spawnResources(parseInt(get_random_value(this.click_input_spawn_percentages)));
				return true;
			}

			if (storedElement) {
				if (storedElement.clicks + 1 >= required_clicks) {
					storedElement.clicks = 0;
					storedElement.lastClick = Date.now();
					if (element_type) {
						const settings = this.getSettings();
						settings.storedResources[element_type]++;
						this.setSetting("storedResources", settings.storedResources);
						this.saveSettings();
						element.remove();
					} else {
						this.spawnResources(parseInt(get_random_value(this.click_input_spawn_percentages)));
					}
				} else {
					storedElement.clicks++;
					storedElement.lastClick = Date.now();
					if (element_type) {
						// Rotate the element 2 and -2 degrees
						element.animate([
							{transform: 'rotate(5deg)'},
							{transform: 'rotate(-5deg)'},
						], {
							duration: 100,
							iterations: 1
						});
					}

					event.preventDefault();
					event.stopPropagation();
				}
			} else {
				storedElement = {
					clicks: 1,
					lastClick: Date.now()
				}

				event.preventDefault();
				event.stopPropagation();
			}

			// Map current clicks and required clicks to range of 1-10
			const click_progress = Math.floor((storedElement.clicks / required_clicks) * 9) + 1;
			map.set(element, storedElement);
			if (element) {
				removeStageClasses(element);
				if (storedElement.clicks)
					element.classList.add(`obsidianised-stage-${click_progress}`);
			}
			return false;
		}

		this.registerDomEvent(document, type, unregister, true);
	}

	preventKeyPress() {
		const unregister = (event: KeyboardEvent) => {
			const keyCombo: string = (event.ctrlKey ? 'ctrl+' : '') + (event.altKey ? 'alt+' : '') + (event.shiftKey ? 'shift+' : '') + (event.key.toLowerCase());
			let storedElement = this.keyboardMap.get(keyCombo);

			const target = event.target as HTMLElement;
			if (Array.from(target.classList).some((cls) => cls.startsWith('prompt')))
				return;


			let required_presses = 5 - this.#settings.pickaxeLevel;
			if (target.classList.contains("obsidianised-very-dangerous-button"))
				required_presses = 100;

			if (required_presses <= 1) {
				this.spawnResources(parseInt(get_random_value(this.keyboard_input_spawn_percentages)));
				return false;
			}

			if (storedElement) {
				if (storedElement.presses + 1 >= required_presses) {
					storedElement.presses = 0;
					storedElement.lastPress = Date.now();
					this.spawnResources(parseInt(get_random_value(this.keyboard_input_spawn_percentages)));
				} else {
					storedElement.presses++;
					storedElement.lastPress = Date.now();

					event.preventDefault();
					event.stopPropagation();
				}
			} else {
				storedElement = {
					presses: 1,
					lastPress: Date.now()
				}

				event.preventDefault();
				event.stopPropagation();
			}
			this.keyboardMap.set(keyCombo, storedElement);
		};

		this.registerDomEvent(document, 'keydown', unregister, true);
	}

	async resetSettings() {
		this.#settings = DEFAULT_SETTINGS;
		this.app.saveLocalStorage("obsidianised:playerTemp", undefined);
		await this.saveSettings();
	}

	getSettings(): ObsidianisedSettings {
		return structuredClone(this.#settings);
	}

	setSetting(key: keyof ObsidianisedSettings, value: ObsidianisedSettings[keyof ObsidianisedSettings]) {
		key === "storedResources" && Object.values(MATERIAL_TIERS).reduce((acc, key) => acc + value[key.toLowerCase() as keyof typeof value] - this.#settings.storedResources[key.toLowerCase() as keyof typeof this.#settings.storedResources], 0) > 1 && this.cleanup();
		this.#settings[key] = value;
	}

	async loadSettings() {
		this.#settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		if (this.#settings) {
			if (this.#settings.playerTemp || this.app.loadLocalStorage("obsidianised:playerTemp") === 'true') {
				this.cleanup();
			} else if (this.#settings.player !== (this.#settings.player = await hashObject(this.#settings))) {
				this.cleanup();
				this.saveSettings();
			}
		}
	}

	cleanup() {
		this.app.saveLocalStorage("obsidianised:playerTemp", this.#settings.playerTemp = true);
		this.layout_change_spawn_percentages = LAYOUT_CHANGE_SPAWN_PERCENTAGES_ALT;
		this.element_spawn_percentage = ELEMENT_SPAWN_CHANCE_ALT;
		this.click_input_spawn_percentages = CLICK_INPUT_SPAWN_PERCENTAGES_ALT;
		this.keyboard_input_spawn_percentages = KEYBOARD_INPUT_SPAWN_PERCENTAGES_ALT;
		this.element_clear_min = 90000;
		this.element_clear_max = 180000;
	}

	async saveSettings() {
		this.#settings.player = await hashObject(this.#settings);
		await this.saveData(this.#settings);
		if (this.#settings.unlockedUpgrades.disableStoneGeneration && this.#settings.unlockedUpgrades.disableIronGeneration &&
			this.#settings.unlockedUpgrades.disableGoldGeneration && this.#settings.unlockedUpgrades.disableDiamondGeneration &&
			this.#settings.unlockedUpgrades.disableObsidianGeneration && !this.#settings.playerWon) {

			this.#settings.playerWon = true;
			new Notice("Congratulations, you won this ludicrously stupid and bad game! To preserve your future sanity, the plugin will self-destruct in 10 seconds", 0)
			await this.saveData(this.#settings);

			setTimeout(() => {
				this.app.plugins.uninstallPlugin(this.manifest.id);
			}, 10000);
		}
	}

	async onExternalSettingsChange() {
		await this.loadSettings();
	}
}

