import { Bot } from 'mineflayer'
import { Vec3 } from 'vec3'
import * as fs from 'fs'

export const scanArea = async (bot: Bot, dimensions: { x: number, y: number, z: number }, scanDown: number, filename: string) => {
  try {
    const scannedBlocks: { relativePosition: Vec3, id: number, name: string }[] = []

    // Pobierz aktualną pozycję bota
    const botPos = bot.entity.position

    // Przeskanuj obszar wokół bota
    for (let dx = -Math.floor(dimensions.x / 2); dx <= Math.floor(dimensions.x / 2); dx++) {
      for (let dz = -Math.floor(dimensions.z / 2); dz <= Math.floor(dimensions.z / 2); dz++) {
        // Zmieniamy sposób skanowania w pionie
        for (let dy = -scanDown; dy <= 0; dy++) {  // W dół sprawdzamy tylko `scanDown` bloków
          const blockPos = botPos.offset(dx, dy, dz)
          const block = bot.world.getBlock(blockPos)

          if (block) {
            // Zapamiętanie względnej pozycji
            scannedBlocks.push({
              relativePosition: new Vec3(dx, dy, dz),  // Przechowywanie względnego przesunięcia
              id: block.type,
              name: block.name,
            })
          }
        }

        // W górę sprawdzamy więcej, aż do wyznaczonej liczby (dimensions.y)
        for (let dy = 1; dy <= Math.floor(dimensions.y / 2); dy++) {
          const blockPos = botPos.offset(dx, dy, dz)
          const block = bot.world.getBlock(blockPos)

          if (block) {
            // Zapamiętanie względnej pozycji
            scannedBlocks.push({
              relativePosition: new Vec3(dx, dy, dz),  // Przechowywanie względnego przesunięcia
              id: block.type,
              name: block.name,
            })
          }
        }
      }
    }

    // Zapisz dane do pliku JSON
    const filePath = filename;
    fs.writeFileSync(filePath, JSON.stringify(scannedBlocks, null, 2), 'utf-8')
    bot.chat(`Skanowanie zakończone. Dane zapisane w pliku: ${filePath}`)
  } catch (error) {
    console.error('Błąd podczas skanowania obszaru:', error)
    bot.chat('Wystąpił błąd podczas skanowania obszaru.')
  }
}
