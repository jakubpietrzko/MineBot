import * as fs from 'fs';
import * as path from 'path';
import { sendRequest } from '../chat';
import { handleResponse } from './handling_prompt';
import { set_guide } from './config';
import { Bot } from 'mineflayer';
import { Movements } from 'mineflayer-pathfinder';

// Ścieżka do folderu "guides"
const directoryPath = path.join(__dirname, '../guides');

// Funkcja opakowująca fs.readdir w Promise
function readdirAsync(directoryPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// Funkcja opakowująca fs.readFile w Promise
function readFileAsync(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Główna funkcja
export async function has_guide(bot: Bot, task: string, movements: Movements) {
  try {
    // Pobierz listę plików w katalogu
    const files = await readdirAsync(directoryPath);

    // Filtruj pliki z rozszerzeniem .txt
    const txtFiles = files.filter(file => path.extname(file) === '.txt');
    const xd = txtFiles.join(' ');

    const prompt = `to dotyczy minecraft. Czy mamy poradnik do naszego zadania? ${task}. Odpowiedz tylko nazwą pliku txt lub napisz samo "nie". Jeśli tak, to jest wymieniona jego nazwa tutaj: ${xd}. Czy coś brzmi dobrze jako możliwy poradnik?`;
    console.log(`Prompt czy mamy poradnik: ${prompt}`);

    let response = await sendRequest(prompt, false);
    console.log(`LLM response czy mamy poradnik: ${response}`);

    if (response.toLowerCase().startsWith('nie')) {
      return;
    }

    if (response.includes('.txt')) {
      const filePath = path.join(directoryPath, response.trim());

      try {
        // Odczytaj zawartość poradnika
        const guide = await readFileAsync(filePath);
        const verifyPrompt = `czy ten poradnik - Poradnik: ${guide}. czy on dotyczy tego zadania: ${task} Odpowiedz tylko "tak" lub "nie".`;

        response = await sendRequest(verifyPrompt, false);
        console.log(`LLM response czy to faktycznie dobry poradnik: ${response}`);
        if (response.toLowerCase().startsWith('tak')) {
          set_guide(true, guide);
          console.log('Poradnik został wczytany z pliku txt w folderze guides');
          return;
        }
      } catch (err) {
        console.error('Błąd podczas odczytu pliku:', err);
      }
    }
  } catch (err) {
    console.error('Błąd podczas odczytu folderu:', err);
  }
}
