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

let numberOfCommands = 20;

class CommandMenu extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(mySettings) {
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

        for (let j = 1; j <= numberOfCommands; j++) {
            let entryRowA = mySettings.get_string(`entryrow${j}a-setting`);
            let entryRowB = mySettings.get_string(`entryrow${j}b-setting`);
            let entryRowC = mySettings.get_string(`entryrow${j}c-setting`);

            if (entryRowA.trim() !== '') {
                this._addMenuItem(entryRowA, entryRowB, entryRowC.trim());
            }
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

        // Create a new GSettings object
        this._settings = this.getSettings();

        this._indicator = new CommandMenu(this._settings);
        let pos = Main.sessionMode.panel.left.length;
        Main.panel.addToStatusArea('command-menu', this._indicator, pos, 'left');

        // Watch for changes to text entry fields:
        for (let k = 1; k <= numberOfCommands; k++) {
            this._settings.connect(`changed::entryrow${k}a-setting`, (settings, key) => {
                refreshIndicator.call(this);
            });
            this._settings.connect(`changed::entryrow${k}b-setting`, (settings, key) => {
                refreshIndicator.call(this);
            });
            this._settings.connect(`changed::entryrow${k}c-setting`, (settings, key) => {
                refreshIndicator.call(this);
            });
        }

        // Refresh indicator at initial setup and if entry row text has changed
        function refreshIndicator() {
            this._indicator.destroy();
            delete this._indicator;
            this._indicator = new CommandMenu(this._settings);
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
