import {App, PluginSettingTab, Setting} from "obsidian";
import ObsidianisedPlugin from "./main";
import {MATERIAL_TIERS} from "./types";
import {DISABLE_UPGRADE_PRICES, PICK_UPGRADE_PRICES, PICKAXE_TIERS} from "./constants";
import {toTitleCase} from "./util";

export class ObsidianisedSettingsTab extends PluginSettingTab {
	plugin: ObsidianisedPlugin;

	constructor(app: App, plugin: ObsidianisedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.updateSettings();
	}

	updateSettings() {
		const {containerEl} = this;
		containerEl.empty();
		this.createResourceList(containerEl);
		this.createPickaxeSettingsMenu(containerEl);
		this.createUpgradeSettingsMenu(containerEl);
	}

	createResourceList(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Resources')
			.setHeading();

		const resources = Object.entries(this.plugin.settings.storedResources);
		for (const [resource, amount] of resources) {
			new Setting(containerEl)
				.setName(toTitleCase(resource) + ": " + amount)
		}
	}

	createPickaxeSettingsMenu(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Pickaxe Crafting')
			.setHeading();

		const lastUnlockedTier = Object.values(PICKAXE_TIERS).slice(1).findIndex((tier) => {
			return !this.plugin.settings.unlockedUpgrades[tier.toLowerCase() + 'Pickaxe' as keyof typeof this.plugin.settings.unlockedUpgrades];
		});

		if (lastUnlockedTier !== -1) {
			const lastTierName = Object.values(PICKAXE_TIERS).slice(1)[lastUnlockedTier];
			const pickaxeDescFragment = document.createDocumentFragment();
			pickaxeDescFragment.createEl('span', {text: `Requires ${PICK_UPGRADE_PRICES[lastUnlockedTier + 1 as keyof typeof PICK_UPGRADE_PRICES]} ${lastTierName.toLowerCase()} to craft`});
			pickaxeDescFragment.createEl('br');
			pickaxeDescFragment.createEl('span', {text: 'For your convenience, this button only requires one click'});

			new Setting(containerEl)
				.setName(`Craft ${lastTierName} pickaxe`)
				.setDesc(pickaxeDescFragment)
				.addButton((button) => {
					button.setButtonText('Upgrade')
						.setDisabled(PICK_UPGRADE_PRICES[lastUnlockedTier + 1 as keyof typeof PICK_UPGRADE_PRICES] > this.plugin.settings.storedResources.stone)
						.onClick(() => {
							this.plugin.settings.storedResources[lastTierName.toLowerCase() as keyof typeof this.plugin.settings.storedResources] -= PICK_UPGRADE_PRICES[lastUnlockedTier + 1 as keyof typeof PICK_UPGRADE_PRICES];
							this.plugin.settings.unlockedUpgrades[lastTierName.toLowerCase() + 'Pickaxe' as keyof typeof this.plugin.settings.unlockedUpgrades] = true;
							this.updateSettings();
							this.plugin.saveSettings();
							this.plugin.setPickaxeLevel();
						});
				});
		}

		let unlockedPickaxeTiers = Object.entries(PICKAXE_TIERS);
		if (lastUnlockedTier !== -1)
			unlockedPickaxeTiers = unlockedPickaxeTiers.slice(0, lastUnlockedTier + 1);

		new Setting(containerEl)
			.setName('Set pickaxe level')
			.setDesc('Set the pickaxe level')
			.addDropdown((dropdown) => {
				dropdown.addOptions(Object.fromEntries(unlockedPickaxeTiers.map(([value, name]) => [value, name])));
				dropdown.setValue(this.plugin.settings.pickaxeLevel.toString());
				dropdown.onChange(async (value) => {
					this.plugin.settings.pickaxeLevel = parseInt(value);
					this.updateSettings();
					this.plugin.saveSettings();
					this.plugin.setPickaxeLevel();
				});
			});

	}

	createUpgradeSettingsMenu(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Generation Upgrades')
			.setHeading();

		for (const [name, value] of Object.entries(MATERIAL_TIERS)) {
			const prettyName = toTitleCase(name);
			if (!this.plugin.settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.unlockedUpgrades]) {
				new Setting(containerEl)
					.setName('Buy Disable ' + prettyName + ' Generation Upgrade')
					.setDesc(`Requires ${DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES]} ${value}`)
					.addButton((button) => {
						button.setButtonText('Upgrade')
							.setDisabled(DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES] > this.plugin.settings.storedResources[value])
							.onClick(() => {
								this.plugin.settings.storedResources[value] -= DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES];
								this.plugin.settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.unlockedUpgrades] = true;
								this.plugin.settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.enabledUpgrades] = true;
								this.updateSettings();
								this.plugin.saveSettings();
							});
					});
			} else {
				new Setting(containerEl)
					.setName('Disable ' + prettyName + ' Generation')
					.addToggle((toggle) => {
						toggle.setValue(this.plugin.settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.enabledUpgrades])
							.onChange(async (value) => {
								this.plugin.settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.enabledUpgrades] = value;
								this.plugin.saveSettings();
							})
							.setDisabled(!this.plugin.settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof this.plugin.settings.unlockedUpgrades]);
					});
			}
		}
	}
}

