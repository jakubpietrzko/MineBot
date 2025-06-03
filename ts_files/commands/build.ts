import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import * as fs from 'fs';
import { Movements } from 'mineflayer-pathfinder';
import { equipItem } from './equip'; // Funkcja przypisania przedmiotu
import { goToPosition } from './goToPosition';

// Funkcja czyszczenia obszaru na podstawie faktycznych pozycji
async function clearArea(bot: Bot, scannedBlocks: { relativePosition: Vec3, id: number, name: string }[]) {
  for (const blockData of scannedBlocks) {
    const absolutePos = blockData.relativePosition;
    await goToPosition(bot, bot.pathfinder.movements, absolutePos.x, absolutePos.y, absolutePos.z);
    const block = bot.blockAt(absolutePos);
    await equipItem(bot,"diamond_pickaxe"); 
    if (block && block.name !== 'air' && block.name !== 'water' && block.name !== 'lava') {
      
      await bot.dig(block);
    }
  }
  bot.chat('Obszar został oczyszczony.');
}

// Funkcja aktualizacji pliku na podstawie aktualnych pozycji bota
async function updateScanFile(bot: Bot, scannedBlocks: { relativePosition: Vec3, id: number, name: string }[], scanFile: string) {
  const botPos = new Vec3(
    Math.floor(bot.entity.position.x),
    Math.floor(bot.entity.position.y),
    Math.floor(bot.entity.position.z)
  );

  const newScanData = scannedBlocks.map(block => ({
    ...block,
    relativePosition: new Vec3(
      block.relativePosition.x + botPos.x,
      block.relativePosition.y + botPos.y,
      block.relativePosition.z + botPos.z
    ),
  }));

  const newFileName = `actual.json`;
  fs.writeFileSync(newFileName, JSON.stringify(newScanData, null, 2));

  bot.chat(`Zaktualizowano strukturę danych. Plik zapisany jako: ${newFileName}`);
}

// Funkcja odbudowy struktury
export async function rebuildStructure(bot: Bot, movements: Movements, scanFile: string) {
  try {
    movements.canDig = false;
    bot.pathfinder.setMovements(movements); // Upewnij się, że zmiany są stosowane

    // Wczytanie zeskanowanych bloków z pliku
    let scannedBlocks: { relativePosition: Vec3, id: number, name: string }[] = JSON.parse(fs.readFileSync(scanFile, 'utf-8')).map((block: any) => ({
      ...block,
      relativePosition: new Vec3(block.relativePosition.x, block.relativePosition.y, block.relativePosition.z),
    }));

    // Aktualizacja pliku na podstawie aktualnej pozycji bota
    

    // Wczytanie zaktualizowanych danych
    const botPos = new Vec3(
      Math.floor(bot.entity.position.x),
      Math.floor(bot.entity.position.y),
      Math.floor(bot.entity.position.z)
    );
    await updateScanFile(bot, scannedBlocks, scanFile);
    const updatedScanFile = `actual.json`;
    scannedBlocks = JSON.parse(fs.readFileSync(updatedScanFile, 'utf-8')).map((block: any) => ({
      ...block,
      relativePosition: new Vec3(block.relativePosition.x, block.relativePosition.y, block.relativePosition.z),
    }));

    // Wyczyść obszar na podstawie zaktualizowanych danych
    await clearArea(bot, scannedBlocks);
    console.log("Czysto");
    // Posortuj bloki według wysokości do budowy od dołu do góry
    const blocksToBuild = [...scannedBlocks].sort((a, b) => a.relativePosition.y - b.relativePosition.y);
 
    for (const blockData of blocksToBuild) {
     
      if (blockData.name === 'air' || blockData.name === 'grass' || blockData.name === 'water' || blockData.name === 'lava' || blockData.name === 'bedrock' || blockData.name === 'grass_block') {
        continue;
      }

      const absolutePos = blockData.relativePosition;
      const placePos = absolutePos.offset(0, 0, 0);
      
      // Przejdź na pozycję do budowy
      await goToPosition(bot, movements, placePos.x, placePos.y, placePos.z);

      const blockBelow = bot.blockAt(placePos.offset(0, -1, 0));
      if (!blockBelow) {
        bot.chat(`Nie można postawić ${blockData.name} w pozycji (${placePos.x}, ${placePos.y}, ${placePos.z}) - brak podłoża.`);
        continue;
      }
      const blockItem = bot.inventory.items().find(i => i.name === blockData.name);
      if (!blockItem) {
        bot.chat(`Brakuje ${blockData.name} w ekwipunku! Pomijam blok w pozycji (${placePos.x}, ${placePos.y}, ${placePos.z}).`);
        continue;
      }
      await equipItem(bot, blockItem.name);
      let attempt =0;
      const maxAttempts =30;
      while (attempt < maxAttempts) {
        
        // Sprawdź, czy miejsce pod botem jest puste
        
        
        // Wykonaj skok i spróbuj postawić blok
        try {
          await bot.setControlState('jump', true);
          const randomDelay = Math.random() * 0.25 ; // Losowy czas w przedziale 0,1 - 0,3 sekundy
          await new Promise(resolve => setTimeout(resolve, randomDelay * 1000)); // Rozpocznij skok
          await bot.placeBlock(blockBelow, new Vec3(0, 1, 0)); // Postaw blok
          bot.chat('Postawiłem blok pod sobą.');
          break; // Jeśli się uda, wyjdź z pętli
        } catch (err) {
          console.log(`Próba ${attempt + 1}`);
          attempt++;
        } finally {
          await bot.setControlState('jump', false); // Zatrzymaj skok
          // Mała pauza przed kolejną próbą
        }
      }
    
      if (attempt >= maxAttempts) {
        bot.chat('Nie udało się postawić bloku pod botem po maksymalnej liczbie prób.');
        continue;
      }

      bot.chat(`Postawiłem ${blockData.name} w pozycji (${placePos.x}, ${placePos.y}, ${placePos.z}).`);
    }

    bot.chat('Struktura została pomyślnie odbudowana.');
    movements.canDig = true;
    bot.pathfinder.setMovements(movements); // Upewnij się, że zmiany są stosowane

  } catch (error) {
    console.error('Błąd podczas odbudowy struktury:', error);
    bot.chat('Wystąpił błąd podczas odbudowy struktury.');
    movements.canDig = true;
    bot.pathfinder.setMovements(movements); // Upewnij się, że zmiany są stosowane

  }
}
