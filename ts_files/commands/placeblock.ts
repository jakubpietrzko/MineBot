import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import { equipItem } from './equip'
export async function placeBlock(bot: Bot, blockName: string): Promise<boolean> {
  try {
    // Znajdź wszystkie bloki powietrza w promieniu 40
    const airBlocks = bot.findBlocks({
      matching: bot.registry.blocksByName.air.id,
      maxDistance: 40,
      count: 1000, // Maksymalna liczba do znalezienia
    });

    // Przejdź przez znalezione bloki powietrza
    for (const airPos of airBlocks) {
      const airVec = new Vec3(airPos.x, airPos.y, airPos.z);
      const blockBelow = bot.blockAt(airVec.offset(0, -1, 0));

      // Sprawdź, czy blok pod powietrzem jest solidny i nie jest powietrzem, wodą ani lawą
      if (
        blockBelow &&
        blockBelow.boundingBox === 'block' &&
        !['air', 'water', 'lava'].includes(blockBelow.name)
      ) {
        try {
          // Skieruj kamerę na blok poniżej miejsca, gdzie ma być blok
          await bot.lookAt(blockBelow.position.offset(1, 1, 1));
          
          // Sprawdź, czy bot ma odpowiedni blok w ekwipunku
          const blockItem = bot.inventory.items().find((i) => i.name === blockName);
          if (!blockItem) {
            bot.chat(`Nie posiadam ${blockName} w ekwipunku!`);
            return false;
          }

          // Przypisz blok do ręki i postaw go
          await equipItem(bot, blockItem.name);
          await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
          bot.chat(`Postawiłem ${blockName}!`);
          return true;
        } catch (err) {
          bot.chat(`Nie udało się postawić ${blockName}.`);
          continue;
        }
      }
    }

    bot.chat('Nie znalazłem miejsca na postawienie bloku.');
    return false;
  } catch (err) {
    bot.chat('Wystąpił błąd podczas próby postawienia bloku.');
    return false;
  }
}
