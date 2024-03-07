import { Plugin } from 'obsidian';
import {ObsianisedSettingsTab} from "./settings";

interface ObsidianisedSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianisedSettings = {
	mySetting: 'default'
}

export default class ObsidianisedPlugin extends Plugin {
	settings: ObsidianisedSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ObsianisedSettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

