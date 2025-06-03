# Minecraft LLM Bot

Ten projekt to **bot sterowany przez model językowy (LLM)** działający w grze **Minecraft**.  
Bot potrafi wykonywać złożone zadania, takie jak zbieranie surowców, tworzenie przedmiotów, walka czy budowanie – wszystko na podstawie inteligentnych decyzji podejmowanych przez model językowy.

## Dokumentacja

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
