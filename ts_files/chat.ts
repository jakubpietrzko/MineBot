import axios, { AxiosError } from "axios";
import { sleep } from "../utils/sleep";
import * as fs from 'fs';
import {guide_b, set_guide} from './plugins/config';
import { executeCommand } from './commands/commandExecutor'; 
import * as path from 'path';
import {  GROQ_API_KEY } from './config'; //uzupelnij plik cofnig z wlasnym kluczem API

const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const FLASK_SERVER_ENDPOINT = "http://localhost:5000/ask-chatgpt";

let guide ='';
// Funkcja do wysyłania zapytań do GROQ API
const sendToGROQ = async (
  userMessage: string
): Promise<string> => {
  const model = "llama-3.1-70b-versatile";

  if (!GROQ_API_ENDPOINT || !GROQ_API_KEY) {
    console.error("Endpoint or API key is missing");
    return "Endpoint or API key is missing";
  }

  let tries = 1;
  while (tries <= 4) {
    try {
      console.log("Wysyłanie zapytania do GROQ API:", {
        userMessage,
        model,
      });
      const response = await axios.post(
        GROQ_API_ENDPOINT,
        {
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
          model: model,
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Odpowiedź z GROQ API:", response.data);
      
      return response.data.choices[0]?.message?.content || "";
    } catch (err: AxiosError | any) {
      console.log("Api error: ", err?.response || err);
      if (err?.status === 429) {
        // Too many requests
        await sleep(10000);
        tries++;
        continue;
      }

      return "Api error";
    }
  }

  return "Api error";
};


const sendToFlask = async (userMessage: string): Promise<string> => {
  try {
    console.log("Wysyłanie zapytania do Flask API:", { userMessage });

    const response = await axios.post(
      FLASK_SERVER_ENDPOINT,
      { question: userMessage },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Odpowiedź z Flask API:", response.data);

    // Sprawdzanie, czy odpowiedź zawiera pola 'response' i 'guide'
    const { response: flaskResponse, guide, done } = response.data; // Destrukturyzacja odpowiedzi
    if (done){
      return "done";
    }
    if (guide) {
      console.log("Jest guide:", guide);
      set_guide(true,guide);
      // Wykonaj specjalną reakcję, jeśli guide jest obecne
      /* jak bedziemyz apisywa cwiecej guide const regex = /User:([^.]*?)(?=!)/;

    // Wyciągamy tekst
      const match = userMessage.match(regex);

      if (match) {
        const userText = match[1].trim();  
        console.log(userText); 
    */

        try {
          // Utwórz nazwę pliku na podstawie pierwszych 10 znaków zmiennej `guide`
          let title = path.join(__dirname, 'guides', guide.substring(0, 10) + '.txt'); // Zapisz w folderze 'guides'
        
          // Zapisz poradnik do pliku
          fs.writeFileSync(title, guide, 'utf8');
          console.log('Poradnik został zapisany do pliku txt w folderze guides');
        } catch (err) {
          console.error('Błąd podczas zapisywania pliku:', err);
        }
      return flaskResponse; // Można połączyć odpowiedź z guide
    } else {
      console.log("Brak guide");
      
      return flaskResponse; // Zwróci poprzednią odpowiedź lub komunikat, że brak guide
    }

  } catch (err: AxiosError | any) {
    console.log("Flask API error: ", err?.response || err);
    return "Flask API error- wyłącz przegladarke ktorej uzywa api lub ustaw powiekszone okno";
  }
};

// Funkcja, która wybiera strategię
export const sendRequest = async (
  userMessage: string,
  useGPT: boolean = false
): Promise<string> => {

  if (useGPT) {
    return sendToFlask(userMessage);
  } else {
    return sendToGROQ(userMessage);
  }
};
