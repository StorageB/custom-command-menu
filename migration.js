/* migration.js 
 *
 * This function exists to migrate existing version 12 users from the 
 * existing schema keys where separate keys exist for the name, command, 
 * icon, and visibility settings for each command, to new keys that store 
 * all four elements in a single tuple: [string, string, string, boolean].
 * This significantly reduces the number of keys used. The previous format
 * required 120 keys to store 30 commands. The new format now stores 99 
 * command entries in 99 keys. 
 * 
 * This migration function will be modified in the next release to clear 
 * legacy keys if necessary, and then removed in the release after that.
 * 
 */


import GLib from 'gi://GLib';

export function migrateSettings(settings) {

    if (settings.get_boolean('v13-migration-complete')) return;

    console.log("[Custom Command Menu] Starting migration of legacy keys to new format");

    const OLD_MAX = 30;
    const NEW_MAX = 99;


    // begin migration

    let count = 0;

    for (let i = 1; i <= OLD_MAX; i++) {

        if (!settings.settings_schema.has_key(`entryrow${i}a-setting`)) continue;
        
        try {
            const name = settings.get_string(`entryrow${i}a-setting`);
            const cmd   = settings.get_string(`entryrow${i}b-setting`);
            const icon  = settings.get_string(`entryrow${i}c-setting`);
            const vis   = settings.get_boolean(`visible${i}-setting`);

            if (name === '' && cmd === '') continue;

            settings.set_value(`command${i}`, new GLib.Variant('(sssb)', [name, cmd, icon, vis]));

            count ++;
        } catch (e) {
            console.log(`[Custom Command Menu] Error reading legacy key ${i}: ${e}`);
        }
    }
    console.log(`[Custom Command Menu] Migrated ${count} legacy commands to new format`);
    

    // update existing command order array to handle additional command entries
    
    let order = settings.get_value('command-order').deep_unpack();
    if (order.length < NEW_MAX) {
        console.log("[Custom Command Menu] Adding entries to command-order.");
        for (let j = order.length + 1; j <= NEW_MAX; j++) order.push(j);
        settings.set_value('command-order',new GLib.Variant('ai', order));
    }

    // migration complete
    settings.set_boolean('v13-migration-complete', true);
    console.log("[Custom Command Menu] Migration complete");

}