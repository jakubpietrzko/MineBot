import { Bot } from 'mineflayer';

export async function equipItem(bot: Bot, itemName: string): Promise<boolean> {
  // Sprawdź, czy bot ma przedmiot w ekwipunku
  const item = bot.inventory.items().find((i) => i.name === itemName);

  if (!item) {
    //bot.chat(`Nie posiadam ${itemName} w ekwipunku!`);
    return false;
  }

  try {
    // Przypisz przedmiot do głównej ręki
    await bot.equip(item, 'hand');
    //bot.chat(`Mam ${itemName} w ręce.`);
    return true;
  } catch (err) {
    bot.chat(`Nie udało się przypisać ${itemName} do ręki.`);
    return false;
  }
}
