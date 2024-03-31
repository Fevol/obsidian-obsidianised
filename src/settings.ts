import {App, PluginSettingTab, Setting} from "obsidian";
import ObsidianisedPlugin from "./main";
import {MATERIAL_TIERS, ObsidianisedSettings} from "./types";
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
		const settings = this.plugin.getSettings();
		if (settings.playerTemp) {
			new Setting(containerEl)
				.setName('Remove cheat status')
				.setDesc('This will remove the effects from the cheat status, no strings attached')
				.addButton((button) => {
					button.setButtonText('Reset')
						.setWarning()
						.setClass("obsidianised-very-dangerous-button")
						.onClick(async () => {
							await this.plugin.resetSettings();
							this.plugin.app.commands.executeCommandById('app:reload');
						});
				});

		}

		this.createResourceList(containerEl, settings);
		this.createPickaxeSettingsMenu(containerEl, settings);
		this.createUpgradeSettingsMenu(containerEl, settings);
	}

	createResourceList(containerEl: HTMLElement, settings: ObsidianisedSettings) {
		new Setting(containerEl)
			.setName('Resources')
			.setHeading();

		const resources = Object.entries(settings.storedResources);
		for (const [resource, amount] of resources) {
			new Setting(containerEl)
				.setName(toTitleCase(resource) + ": " + amount)
		}
	}

	createPickaxeSettingsMenu(containerEl: HTMLElement, settings: ObsidianisedSettings) {
		new Setting(containerEl)
			.setName('Pickaxe Crafting')
			.setHeading();

		const lastUnlockedTier = Object.values(PICKAXE_TIERS).slice(1).findIndex((tier) => {
			return !settings.unlockedUpgrades[tier.toLowerCase() + 'Pickaxe' as keyof typeof settings.unlockedUpgrades];
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
						.setDisabled(PICK_UPGRADE_PRICES[lastUnlockedTier + 1 as keyof typeof PICK_UPGRADE_PRICES] > settings.storedResources[lastTierName.toLowerCase() as keyof typeof settings.storedResources])
						.onClick(async () => {
							settings.storedResources[lastTierName.toLowerCase() as keyof typeof settings.storedResources] -= PICK_UPGRADE_PRICES[lastUnlockedTier + 1 as keyof typeof PICK_UPGRADE_PRICES];
							this.plugin.setSetting("storedResources", settings.storedResources);
							settings.unlockedUpgrades[lastTierName.toLowerCase() + 'Pickaxe' as keyof typeof settings.unlockedUpgrades] = true;
							this.plugin.setSetting("unlockedUpgrades", settings.unlockedUpgrades);
							this.plugin.setSetting("pickaxeLevel", lastUnlockedTier + 1);

							await this.plugin.saveSettings();
							this.updateSettings();
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
				dropdown.setValue(settings.pickaxeLevel.toString());
				dropdown.onChange(async (value) => {
					this.plugin.setSetting("pickaxeLevel", parseInt(value));
					await this.plugin.saveSettings();
					this.updateSettings();
					this.plugin.setPickaxeLevel();
				});
			});

	}

	createUpgradeSettingsMenu(containerEl: HTMLElement, settings: ObsidianisedSettings) {
		new Setting(containerEl)
			.setName('Generation Upgrades')
			.setHeading();

		for (const [name, value] of Object.entries(MATERIAL_TIERS)) {
			const prettyName = toTitleCase(name);
			if (!settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.unlockedUpgrades]) {
				new Setting(containerEl)
					.setName('Buy Disable ' + prettyName + ' Generation Upgrade')
					.setDesc(`Requires ${DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES]} ${value}`)
					.addButton((button) => {
						button.setButtonText('Upgrade')
							.setDisabled(DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES] > settings.storedResources[value])
							.onClick(async () => {
								settings.storedResources[value] -= DISABLE_UPGRADE_PRICES[value as keyof typeof DISABLE_UPGRADE_PRICES];
								settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.unlockedUpgrades] = true;
								settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.enabledUpgrades] = true;

								this.plugin.setSetting("storedResources", settings.storedResources);
								this.plugin.setSetting("unlockedUpgrades", settings.unlockedUpgrades);
								this.plugin.setSetting("enabledUpgrades", settings.enabledUpgrades);

								await this.plugin.saveSettings();
								this.updateSettings();
							});
					});
			} else {
				new Setting(containerEl)
					.setName('Disable ' + prettyName + ' Generation')
					.addToggle((toggle) => {
						toggle.setValue(settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.enabledUpgrades])
							.onChange(async (value) => {
								settings.enabledUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.enabledUpgrades] = value;
								this.plugin.setSetting("enabledUpgrades", settings.enabledUpgrades);
								await this.plugin.saveSettings();
							})
							.setDisabled(!settings.unlockedUpgrades['disable' + prettyName + 'Generation' as keyof typeof settings.unlockedUpgrades]);
					});
			}
		}
	}
}

