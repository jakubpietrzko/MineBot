from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import time
from selenium.webdriver.common.action_chains import ActionChains

app = Flask(__name__)
user_data_path = r""# Ścieżka do folderu "User Data" Chrome powinna wygladac podobnie: AppData\Local\Google\Chrome\User Data

# Ustawienia dla Chrome
options = webdriver.ChromeOptions()
options.add_argument(f"user-data-dir={user_data_path}")  # Ścieżka do danych użytkownika
options.add_argument("profile-directory=Profile 8")  # Określenie, który profil ma być używany
options.add_experimental_option("detach", True)  

# Ścieżka do ChromeDriver
service = Service(executable_path=r"\chromedriver-win64\chromedriver.exe") # Ścieżka do pliku chromedriver.exe ktory nalezy pobrac
link = "https://chatgpt.com"
driver = None
goal=False
guide = None

def extract_response(driver):
    # Pobierz odpowiedzi z HTML
    html_content = driver.page_source
    soup = BeautifulSoup(html_content, 'html.parser')

    # Znalezienie wszystkich paragrafów <p> (bez <li>)
    paragraphs = soup.find_all('p')

    # Formatowanie odpowiedzi
    response = {
        "paragraphs": [para.get_text() for para in paragraphs]
    }
    response_text = response["paragraphs"][-2]
    print(response_text)
    return response_text

    
@app.route('/ask-chatgpt', methods=['POST'])
def ask_chatgpt():
    global driver, goal, guide, link,actions
    # Pobierz pytanie z żądania POST
    data = request.json
    question = data.get("question", "")

    if not question:
        return jsonify({"error": "No question provided"}), 400
    info = question
    question = """Będziesz kontrolować bota w grze Minecraft, używając określonych komend. Komendy muszą być wprowadzane pojedynczo, w osobnych wiadomościach. Nie używaj ukośników ani innych symboli w swoich komendach. Oto lista komend, które możesz używać: goto x y z - Przenieś się do określonych współrzędnych. craft x 3 - Wykonaj 3 przedmioty x. attack x - Zaataakuj cel x (może to być mob, zwierzę lub nazwa gracza, jeśli chcesz zaatakować gracza). mine diamond_ore 5 - Zbierz określoną liczbę materiałów (np. drewno, kamień, ziemia, wszystko, co można zebrać za pomocą komendy mine). Musisz podać dokładną nazwę materiału tak, jak występuje w grze (np. stone, dirt), wraz z liczbą, którą chcesz zebrać. Jeśli powiesz coś bez użycia komendy, bot powie to na czacie z graczami w grze. Możesz tego używać, aby komunikować problemy lub odpowiadać użytkownikom. think - Jeśli zadanie jest zbyt trudne, aby je wykonać jedną komendą, możesz użyć tej komendy. Umożliwia ona dostęp do internetu, co pozwala znaleźć sposób na osiągnięcie końcowego celu. Twoje odpowiedzi powinny składać się wyłącznie z tekstu. Jeśli musisz wymienić zadania, zrób to w jednym ciągłym tekście (np. 1 zbierz drewno, 2 wykonaj deski itd.), bez używania punktów czy list. Po zastanowieniu się musisz wrócić z wiadomością zawierającą kroki do rozwiązania zadania w możliwie najprostszy sposób. Kroki te zostaną zapamiętane i później będziesz mógł wykonać zadanie, używając poszczególnych komend. Kiedy używasz komendy think lub help, nie możesz użyć ich ponownie od razu. Musisz poczekać na odpowiedź przed kontynuacją. Możesz używać wyłącznie komend. Twoje wiadomości powinny być w zwykłym tekście, bez formatowania jako kod ani listy. Jeśli spróbujesz wysłać coś innego niż komendę, gra może nie działać prawidłowo. Twoim zadaniem jest odpowiadanie za pomocą komend zgodnych z instrukcjami użytkownika. Nie używaj klawisza Enter, nie twórz list, nie dodawaj filmikow, używaj tylko surowego tekstu, a każda komenda powinna być w osobnej wiadomości. pamiętaj mozesz uzyc teraz naraz tylko jednej komendy i wykonac jeden krok, reszzta zajmiemy się pozniej, jeśli zadnaie jest szbyt skomplikowane zeby zrobic je jedna komenda uzyj think, aby zaplonowac zadanie, a pozniej pojedynczo wpisuj komendy aby je zrealizowac.                """ + question+'\n'
    
    # Uruchom Selenium
    
    driver = webdriver.Chrome(service=service, options=options)

    try:
        # Otwórz stronę (np. ChatGPT)
        
        driver.get(link)
        time.sleep(2)
        help = False
        repeat = True
        while repeat:
            repeat = False
            if  goal:
                question="your guide, if you think is done say only done, do next step:"+guide
            # Kliknij przycisk (jeśli to konieczne)
            if help:
                button = driver.find_element(By.XPATH, "//button[@aria-label='Przeszukaj sieć']")
                button.click()
                help_question = """Jesteś w trybie myślenia! Teraz nie używaj komendy "think"!!! to wazne bo zepsujesz caly program, ale stwórz przewodnik dla swojego zadania. Napisz swoje kolejne kroki ale w ciaglym tekscie!! to wazne aby tekst byl ciagly bez zadnych podpunktow!! i przeszukaj internet, aby stworzyć przewodnik, jak rozwiązać zadanie, które zostało Ci przedstawione. Napisz teraz swój przewodnik, który rozwiąże przedstawiony problem. Pamiętaj, że zadania powinny być na tyle proste, abyś mógł je wykonać, używając wyłącznie dostępnych komend. Nie używaj komendy "think" w następnej odpowiedzi. pamietaj ze musi to byc bardzo szczegolowe i przemyslane, musisz uwzglednic czynniki takie jak to czymasz odpowiednie rzeczy w eksipunkut oraz czy mozesz wydobyc np material przy uzyciu obecnych itemow  w ewkipunku, np diament mozna wydonyc kilofem zelaznym lubn lepszym, zelazo kamiennym lub lepszym, kamien, drewnianym lub lepszym.  nie dodawaj filmikow. nienumeruj krokow. koniecznie napisz to ciaglym tekstm bez zadnych akapitow podpunktow i nie numeruj krokow. przykladowy poradnik jak zrobic diamentowy kilof, napisz to w podobnym stylu i tak samo szczegolow pozwalajac zeby nawet od zera udalo sie zrealizwaoc zadanie:"Aby stworzyć diamentowy kilof w Minecraft, nawet zaczynając od zera, musisz przejść przez kilka etapów. Najpierw zbierz drewno, ścinając drzewa, co dostarczy ci kłody (log). najpopularniejsze to np oak_log, ale mozesz uzyc innych log jesli masz lub sa blisko. jak uzwyasz mine to zbieraj na zaps np mine oak_log 10 .Następnie przetwórz kłody na deski (planks), które posłużą do stworzenia patyków (sticks) oraz stołu rzemieślniczego (crafting table). Użyj stołu rzemieślniczego, aby z desek i patyków wykonać drewniany kilof (wooden pickaxe). Z drewnianym kilofem wydobądź kamień (stone), który po zebraniu stanie się brukiem (cobblestone). Z bruku i patyków stwórz kamienny kilof (stone pickaxe). Następnie użyj kamiennego kilofa, aby wydobyć rudę żelaza (iron ore). Zbuduj piec (furnace) z bruku i przetop rudę żelaza na sztabki żelaza (iron ingots). Wykorzystaj sztabki żelaza i patyki do stworzenia żelaznego kilofa (iron pickaxe). Z żelaznym kilofem poszukaj rudy diamentu (diamond ore), którą można znaleźć na niższych poziomach świata, zwykle między poziomami 5 a 12. Wydobądź co najmniej trzy diamenty. Na koniec, używając stołu rzemieślniczego, połącz trzy diamenty z dwoma patykami, aby stworzyć diamentowy kilof (diamond pickaxe). Gratulacje, teraz posiadasz jedno z najtrwalszych i najwydajniejszych narzędzi w grze!" Problem jest przedstawiony tutaj: """+ info
                input_box = driver.find_element(By.ID, "prompt-textarea")


                input_box.send_keys(help_question)
                actions = ActionChains(driver)

    # Skupienie na elemencie
                actions.move_to_element(input_box).click().perform()

                for _ in range(4):
                    actions.send_keys(Keys.TAB).perform() 
    
                # Wysłanie Enter
                input_box.send_keys(Keys.RETURN)
                time.sleep(8) 
                response = extract_response(driver)
                print(response)
                guide = response
                
                question="to twój poradnik, jak zrobić zadanie: "+guide+" teraz wykonaj pierwszy krok, używając tylko poznanych wcześniej komend i tylko ich, pamiętaj aby uzyc teraz tylko jednej komendy i wykonac jeden krok, reszzta zajmiemy się pozniej, jeśli zadnaie jest szbyt skomplikowane dla jednej komendy uzyj think, aby zaplonowac zadanie a pozniej pojedynczo wpisuje komendy aby je zrealizowac. to sa komendy przypominam jeszcze raz: "+"goto x y z - Przejdź do określonych współrzędnych. attack - Zaatakuj cel. mine diamond_ore 5 - Zbierz określoną liczbę materiałów. Musisz wprowadzić nazwę materiału dokładnie tak, jak pojawia się w grze (np. stone, dirt itp.), wraz z liczbą, którą chcesz zebrać. - Jeśli powiesz coś bez komend, użyjesz tego, by rozmawiać z graczami w grze. Używaj tego, aby przekazać problemy lub odpowiedzi użytkownikowi. think - Jeśli zadanie jest zbyt trudne do wykonania jedną komendą, możesz użyć tej komendy. Pozwoli ci to uzyskać dostęp do internetu i znaleźć sposób na osiągnięcie swojego celu. Proszę, aby pierwsze 10 znaków w twojej odpowiedzi było tytułem poradnika, nazwij go dobrze, ponieważ w przyszłości będziesz musiał rozpoznać, co jest w poradniku, znając tylko jego nazwę, a to będzie nazwa pliku z twoją odpowiedzią. Twoje odpowiedzi powinny składać się wyłącznie z tekstu. Możesz poświęcić trochę czasu na przemyślenie swoich następnych kroków. Po przemyśleniu musisz wrócić do mnie z wiadomością zawierającą kroki do rozwiązania zadania w najprostszy możliwy sposób. Te kroki zostaną zapamiętane i będziesz mógł później wykonać zadanie, używając pojedynczych komend. Gdy użyjesz komendy think lub help, pamiętaj, że nie możesz ich używać kolejno. Musisz poczekać na odpowiedź przed kontynuowaniem. Możesz używać tylko komend. Twoje wiadomości powinny być zwykłym tekstem i nie powinieneś formatować ich jako kod ani listy. Jeśli spróbujesz wysłać coś innego niż komendę, gra może nie działać poprawnie. Twoim zadaniem jest odpowiedzieć komendami, które są potrzebne do wykonania rzeczywistego zadania w poradniku. Nie pokazuj mi filmów, jeśli chcesz liczyć kroki, zrób to w jednym ciągłym zdaniu,  nie używaj enterów, nie używaj list, tylko ciągły tekst, nienumeruj krokow. tylko jedna komenda w jednej wiadomości. Jeśli uważasz, że zadanie zostało ukończone i cały poradnik jest już zakończony, i np widzisz ze masz odpowiednie rzeczy w ekwipuku te ktore miales zrobic, napisz samo: done"
                goal = True
                
            help = False
            # Wprowadź pytanie
            
            input_box = driver.find_element(By.ID, "prompt-textarea")


            input_box.send_keys(question)
            actions = ActionChains(driver)

    # Skupienie na elemencie
            actions.move_to_element(input_box).click().perform()

            for _ in range(4):
                actions.send_keys(Keys.TAB).perform() 
            # Wysłanie Enter
            input_box.send_keys(Keys.RETURN)
            time.sleep(2) 

            # Czekaj na odpowiedź
            link = driver.current_url

            response = extract_response(driver)
            done=""
            if response == "think":
                help = True
                repeat = True
            if response == "done":
                goal = False
                done = "True"
                repeat = False
        return jsonify({"response": response, "guide": guide, "done": done})
    finally:
        # Zamknij przeglądarkę
        driver.quit()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
