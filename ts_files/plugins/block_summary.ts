import * as fs from 'fs'

interface BlockSummary {
  id: number
  name: string
  count: number
}

export const  analyzeScannedBlocks = (filePath: string): BlockSummary[] => {
  try {
    // Wczytaj dane z pliku JSON
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const scannedBlocks: { id: number, name: string }[] = JSON.parse(fileData)

    // Tworzenie mapy do grupowania bloków
    const blockMap: { [key: string]: BlockSummary } = {}

    for (const block of scannedBlocks) {
      const key = `${block.id}-${block.name}`
      if (!blockMap[key]) {
        blockMap[key] = {
          id: block.id,
          name: block.name,
          count: 0,
        }
      }
      blockMap[key].count++
    }

    // Zwróć dane jako tablicę
    return Object.values(blockMap)
  } catch (error) {
    console.error('Błąd podczas analizy pliku:', error)
    return []
  }
}
