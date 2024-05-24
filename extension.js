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

let entryrow1a = "";
let entryrow1b = "";
let entryrow2a = "";
let entryrow2b = "";
let entryrow3a = "";
let entryrow3b = "";
let entryrow4a = "";
let entryrow4b = "";
let entryrow5a = "";
let entryrow5b = "";
let entryrow6a = "";
let entryrow6b = "";
let entryrow7a = "";
let entryrow7b = "";
let entryrow8a = "";
let entryrow8b = "";
let entryrow9a = "";
let entryrow9b = "";
let entryrow10a = "";
let entryrow10b = "";
let command = "";


class CommandMenu extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super(0.5, _('Commands'));

        let label = new St.Label({
            text: _('Commands'),
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(label);

        if (entryrow1a.trim() !== '') {
            this._addMenuItem(entryrow1a, entryrow1b);
        }
        if (entryrow2a.trim() !== '') {
            this._addMenuItem(entryrow2a, entryrow2b);
        }
        if (entryrow3a.trim() !== '') {
            this._addMenuItem(entryrow3a, entryrow3b);
        }
        if (entryrow4a.trim() !== '') {
            this._addMenuItem(entryrow4a, entryrow4b);
        }
        if (entryrow5a.trim() !== '') {
            this._addMenuItem(entryrow5a, entryrow5b);
        }
        if (entryrow6a.trim() !== '') {
            this._addMenuItem(entryrow6a, entryrow6b);
        }
        if (entryrow7a.trim() !== '') {
            this._addMenuItem(entryrow7a, entryrow7b);
        }
        if (entryrow8a.trim() !== '') {
            this._addMenuItem(entryrow8a, entryrow8b);
        }
        if (entryrow9a.trim() !== '') {
            this._addMenuItem(entryrow9a, entryrow9b);
        }
        if (entryrow10a.trim() !== '') {
            this._addMenuItem(entryrow10a, entryrow10b);
        }
    }


    _addMenuItem(label, command) {
        let newItem = new PopupMenu.PopupMenuItem(label);
        newItem.connect('activate', () => {
            // Run associated command when a menu item is clicked
            console.log(`Custom Command List extension attempting to execute command:\n${command}`);
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
        this._settings.connect('changed::entryrow2a-setting', (settings, key) => {
            entryrow2a = this._settings.get_string('entryrow2a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow2b-setting', (settings, key) => {
            entryrow2b = this._settings.get_string('entryrow2b-setting');
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
        this._settings.connect('changed::entryrow4a-setting', (settings, key) => {
            entryrow4a = this._settings.get_string('entryrow4a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow4b-setting', (settings, key) => {
            entryrow4b = this._settings.get_string('entryrow4b-setting');
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
        this._settings.connect('changed::entryrow6a-setting', (settings, key) => {
            entryrow6a = this._settings.get_string('entryrow6a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow6b-setting', (settings, key) => {
            entryrow6b = this._settings.get_string('entryrow6b-setting');
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
        this._settings.connect('changed::entryrow8a-setting', (settings, key) => {
            entryrow8a = this._settings.get_string('entryrow8a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow8b-setting', (settings, key) => {
            entryrow8b = this._settings.get_string('entryrow8b-setting');
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
        this._settings.connect('changed::entryrow10a-setting', (settings, key) => {
            entryrow10a = this._settings.get_string('entryrow10a-setting');
            refreshIndicator.call(this);
        });
        this._settings.connect('changed::entryrow10b-setting', (settings, key) => {
            entryrow10b = this._settings.get_string('entryrow10b-setting');
            refreshIndicator.call(this);
        });

        // Initial setup
        entryrow1a = this._settings.get_string('entryrow1a-setting');
        entryrow1b = this._settings.get_string('entryrow1b-setting');
        entryrow2a = this._settings.get_string('entryrow2a-setting');
        entryrow2b = this._settings.get_string('entryrow2b-setting');
        entryrow3a = this._settings.get_string('entryrow3a-setting');
        entryrow3b = this._settings.get_string('entryrow3b-setting');
        entryrow4a = this._settings.get_string('entryrow4a-setting');
        entryrow4b = this._settings.get_string('entryrow4b-setting');
        entryrow5a = this._settings.get_string('entryrow5a-setting');
        entryrow5b = this._settings.get_string('entryrow5b-setting');
        entryrow6a = this._settings.get_string('entryrow6a-setting');
        entryrow6b = this._settings.get_string('entryrow6b-setting');
        entryrow7a = this._settings.get_string('entryrow7a-setting');
        entryrow7b = this._settings.get_string('entryrow7b-setting');
        entryrow8a = this._settings.get_string('entryrow8a-setting');
        entryrow8b = this._settings.get_string('entryrow8b-setting');
        entryrow9a = this._settings.get_string('entryrow9a-setting');
        entryrow9b = this._settings.get_string('entryrow9b-setting');
        entryrow10a = this._settings.get_string('entryrow10a-setting');
        entryrow10b = this._settings.get_string('entryrow10b-setting');

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
