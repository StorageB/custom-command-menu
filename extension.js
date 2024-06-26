/* extension.js */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */


import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GLib from 'gi://GLib';
import St from 'gi://St';

let entryrow1a = "";  let entryrow1b = "";  let entryrow1c = "";
let entryrow2a = "";  let entryrow2b = "";  let entryrow2c = "";
let entryrow3a = "";  let entryrow3b = "";  let entryrow3c = "";
let entryrow4a = "";  let entryrow4b = "";  let entryrow4c = "";
let entryrow5a = "";  let entryrow5b = "";  let entryrow5c = "";
let entryrow6a = "";  let entryrow6b = "";  let entryrow6c = "";
let entryrow7a = "";  let entryrow7b = "";  let entryrow7c = "";
let entryrow8a = "";  let entryrow8b = "";  let entryrow8c = "";
let entryrow9a = "";  let entryrow9b = "";  let entryrow9c = "";
let entryrow10a = ""; let entryrow10b = ""; let entryrow10c = "";


class CommandMenu extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super(0.5, _('Commands'));

        // Use this label to create the Commands menu text:
        let label = new St.Label({
            text: _('Commands'),
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        
        // Use this label to create an icon for the menu instead of the Commands text:
        //
        // let label = new St.Icon({
        //     icon_name: 'go-down-symbolic', 
        //     style_class: 'system-status-icon',
        // });
        

        this.add_child(label);

        if (entryrow1a.trim() !== '') {
            this._addMenuItem(entryrow1a, entryrow1b, entryrow1c.trim());
        }
        if (entryrow2a.trim() !== '') {
            this._addMenuItem(entryrow2a, entryrow2b, entryrow2c.trim());
        }
        if (entryrow3a.trim() !== '') {
            this._addMenuItem(entryrow3a, entryrow3b, entryrow3c.trim());
        }
        if (entryrow4a.trim() !== '') {
            this._addMenuItem(entryrow4a, entryrow4b, entryrow4c.trim());
        }
        if (entryrow5a.trim() !== '') {
            this._addMenuItem(entryrow5a, entryrow5b, entryrow5c.trim());
        }
        if (entryrow6a.trim() !== '') {
            this._addMenuItem(entryrow6a, entryrow6b, entryrow6c.trim());
        }
        if (entryrow7a.trim() !== '') {
            this._addMenuItem(entryrow7a, entryrow7b, entryrow7c.trim());
        }
        if (entryrow8a.trim() !== '') {
            this._addMenuItem(entryrow8a, entryrow8b, entryrow8c.trim());
        }
        if (entryrow9a.trim() !== '') {
            this._addMenuItem(entryrow9a, entryrow9b, entryrow9c.trim());
        }
        if (entryrow10a.trim() !== '') {
            this._addMenuItem(entryrow10a, entryrow10b, entryrow10c.trim());
        }
    }


    _addMenuItem(label, command, icon) {
        let newItem = new PopupMenu.PopupMenuItem('');
        if (icon) {
            let commandIcon = new St.Icon({
                icon_name: icon,
                style_class: 'popup-menu-icon',
            });
            newItem.add_child(commandIcon);
        }
        let commandLabel = new St.Label({ text: label });
        newItem.add_child(commandLabel);
        
        newItem.connect('activate', () => {
            // Run associated command when a menu item is clicked
            console.log(`Custom Command Menu extension attempting to execute command:\n${command}`);
            let [success, pid] = GLib.spawn_async(null, ["/bin/bash", "-c", command], null, GLib.SpawnFlags.SEARCH_PATH, null);
            if (!success) {
                console.log(`Error running command:\n${command}`);
            }
        });
        this.menu.addMenuItem(newItem);
    }

}


export default class CommandMenuExtension extends Extension {
    enable() {
        this._indicator = new CommandMenu();
        let pos = Main.sessionMode.panel.left.length;
        Main.panel.addToStatusArea('command-menu', this._indicator, pos, 'left');

        // Create a new GSettings object
        this._settings = this.getSettings();
        
        // Watch for changes to text entry fields:
        this._settings.connect('changed::entryrow1a-setting', (settings, key) => {
            entryrow1a = this._settings.get_string('entryrow1a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow1b-setting', (settings, key) => {
            entryrow1b = this._settings.get_string('entryrow1b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow1c-setting', (settings, key) => {
            entryrow1c = this._settings.get_string('entryrow1c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow2a-setting', (settings, key) => {
            entryrow2a = this._settings.get_string('entryrow2a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow2b-setting', (settings, key) => {
            entryrow2b = this._settings.get_string('entryrow2b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow2c-setting', (settings, key) => {
            entryrow2c = this._settings.get_string('entryrow2c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow3a-setting', (settings, key) => {
            entryrow3a = this._settings.get_string('entryrow3a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow3b-setting', (settings, key) => {
            entryrow3b = this._settings.get_string('entryrow3b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow3c-setting', (settings, key) => {
            entryrow3c = this._settings.get_string('entryrow3c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow4a-setting', (settings, key) => {
            entryrow4a = this._settings.get_string('entryrow4a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow4b-setting', (settings, key) => {
            entryrow4b = this._settings.get_string('entryrow4b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow4c-setting', (settings, key) => {
            entryrow4c = this._settings.get_string('entryrow4c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow5a-setting', (settings, key) => {
            entryrow5a = this._settings.get_string('entryrow5a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow5b-setting', (settings, key) => {
            entryrow5b = this._settings.get_string('entryrow5b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow5c-setting', (settings, key) => {
            entryrow5c = this._settings.get_string('entryrow5c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow6a-setting', (settings, key) => {
            entryrow6a = this._settings.get_string('entryrow6a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow6b-setting', (settings, key) => {
            entryrow6b = this._settings.get_string('entryrow6b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow6c-setting', (settings, key) => {
            entryrow6c = this._settings.get_string('entryrow6c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow7a-setting', (settings, key) => {
            entryrow7a = this._settings.get_string('entryrow7a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow7b-setting', (settings, key) => {
            entryrow7b = this._settings.get_string('entryrow7b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow7c-setting', (settings, key) => {
            entryrow7c = this._settings.get_string('entryrow7c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow8a-setting', (settings, key) => {
            entryrow8a = this._settings.get_string('entryrow8a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow8b-setting', (settings, key) => {
            entryrow8b = this._settings.get_string('entryrow8b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow8c-setting', (settings, key) => {
            entryrow8c = this._settings.get_string('entryrow8c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow9a-setting', (settings, key) => {
            entryrow9a = this._settings.get_string('entryrow9a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow9b-setting', (settings, key) => {
            entryrow9b = this._settings.get_string('entryrow9b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow9c-setting', (settings, key) => {
            entryrow9c = this._settings.get_string('entryrow9c-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow10a-setting', (settings, key) => {
            entryrow10a = this._settings.get_string('entryrow10a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow10b-setting', (settings, key) => {
            entryrow10b = this._settings.get_string('entryrow10b-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow10c-setting', (settings, key) => {
            entryrow10c = this._settings.get_string('entryrow10c-setting');
            refreshIndicator.call(this);
        });

        // Initial setup
        entryrow1a = this._settings.get_string('entryrow1a-setting');
        entryrow1b = this._settings.get_string('entryrow1b-setting');
        entryrow1c = this._settings.get_string('entryrow1c-setting');
        entryrow2a = this._settings.get_string('entryrow2a-setting');
        entryrow2b = this._settings.get_string('entryrow2b-setting');
        entryrow2c = this._settings.get_string('entryrow2c-setting');
        entryrow3a = this._settings.get_string('entryrow3a-setting');
        entryrow3b = this._settings.get_string('entryrow3b-setting');
        entryrow3c = this._settings.get_string('entryrow3c-setting');
        entryrow4a = this._settings.get_string('entryrow4a-setting');
        entryrow4b = this._settings.get_string('entryrow4b-setting');
        entryrow4c = this._settings.get_string('entryrow4c-setting');
        entryrow5a = this._settings.get_string('entryrow5a-setting');
        entryrow5b = this._settings.get_string('entryrow5b-setting');
        entryrow5c = this._settings.get_string('entryrow5c-setting');
        entryrow6a = this._settings.get_string('entryrow6a-setting');
        entryrow6b = this._settings.get_string('entryrow6b-setting');
        entryrow6c = this._settings.get_string('entryrow6c-setting');
        entryrow7a = this._settings.get_string('entryrow7a-setting');
        entryrow7b = this._settings.get_string('entryrow7b-setting');
        entryrow7c = this._settings.get_string('entryrow7c-setting');
        entryrow8a = this._settings.get_string('entryrow8a-setting');
        entryrow8b = this._settings.get_string('entryrow8b-setting');
        entryrow8c = this._settings.get_string('entryrow8c-setting');
        entryrow9a = this._settings.get_string('entryrow9a-setting');
        entryrow9b = this._settings.get_string('entryrow9b-setting');
        entryrow9c = this._settings.get_string('entryrow9c-setting');
        entryrow10a = this._settings.get_string('entryrow10a-setting');
        entryrow10b = this._settings.get_string('entryrow10b-setting');
        entryrow10c = this._settings.get_string('entryrow10c-setting');

        refreshIndicator.call(this);

        // Refresh indicator at initial setup and if entry row text has changed
        function refreshIndicator() {
            this._indicator.destroy();
            delete this._indicator;
            this._indicator = new CommandMenu();
            Main.panel.addToStatusArea('command-menu', this._indicator, pos, 'left');
        }
    }

    disable() {
        this._indicator.destroy();
        delete this._indicator;
        this._indicator = null;
        this._settings = null;
    }
}
