import { Bot } from 'mineflayer';
import { pathfinder, Movements } from 'mineflayer-pathfinder';
import { plugin as pvp } from 'mineflayer-pvp';
import { Vec3 } from 'vec3';
import { registerChatCommands } from './chatCommands';
import { plugin as collectblock } from 'mineflayer-collectblock';
import armorManager from 'mineflayer-armor-manager';

// @ts-ignore
import blockFinderPlugin from 'mineflayer-blockfinder';
export function loadPlugins(bot: Bot, movements: Movements) {
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);
  bot.loadPlugin(blockFinderPlugin);
  bot.loadPlugin(collectblock);
  bot.loadPlugin(armorManager);
  bot.once('resourcePack', () => {
    bot.acceptResourcePack();
});
  registerChatCommands(bot, movements);
  // Dodaj inne pluginy lub funkcjonalności tutaj
}
