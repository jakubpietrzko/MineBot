# Minecraft LLM Bot

Ten projekt to **bot sterowany przez model językowy (LLM)** działający w grze **Minecraft**.  
Bot potrafi wykonywać złożone zadania, takie jak zbieranie surowców, tworzenie przedmiotów, walka czy budowanie – wszystko na podstawie inteligentnych decyzji podejmowanych przez model językowy.

## Dokumentacja
Projekt stworzenia autonomicznego bota do gry Minecraft, w pełni sterowanego przez duże modele językowe (LLaMA 3 70B oraz GPT-4). Umożliwia komunikację z botem w języku naturalnym oraz wydawanie mu złożonych poleceń, które wymagają wielu etapów do realizacji (np. zbieranie zasobów, tworzenie przedmiotów, budowa struktur).  

Bot potrafi tworzyć i zapisywać własne **poradniki wykonania zadań** na podstawie wyników wyszukiwania w internecie, a następnie z nich korzystać w przyszłości. Dzięki implementacji **pamięci kontekstowej** (FIFO + wzorce projektowe), potrafi dostosowywać swoje działania do bieżącej sytuacji oraz wcześniejszych interakcji z użytkownikiem.  

**Kluczowe funkcje:**
- Interpretacja języka naturalnego i zamiana go na planowane działania w grze
- Generowanie i zapisywanie poradników (np. jak stworzyć konkretny przedmiot)
- Możliwość odtworzenia budynków na podstawie skanów (JSON)
- Mechanizmy walki, snu, eksploracji, craftingu, gotowania i zarządzania ekwipunkiem
- Zdobywanie infrmacji o grze z internetu

**Zastosowane technologie:**
- Python, TypeScript (Mineflayer), Selenium, Flask
- API dużych modeli językowych (LLM)
- JSON do zapisu wiedzy proceduralnej
- Własny system pamięci kontekstowej (wzorzec Singleton, FIFO)

Szczegółowy opis działania znajduje się w pliku **`dokumentacja.pdf`** dołączonym do repozytorium.

## Uruchomienie 
Aby móc uruchomić bota należy:
- zainstalować zależności
```bash
npm install
```
- wpisać dane serwera w pliku ts_files/bot_minecraft.ts,
- wpisać własny klucz api ze strony https://console.groq.com/home w pliku ts_files/config.ts

Aby uruchomić bota z eksperymentalnym trybem przeszukiwania internetu i pisania poradnikow należy:
- pobrać przegladarke google chrome
- pobrac chromedriver do przegladarki i wpisać ścieżke do niego w python_files/chatgpt.py
- zainstalować zależności z pliku requirments.txt
- wpisać własną scieżke do swojego profilu chrome w python_files/chatgpt.py
