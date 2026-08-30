const NEWS_ISSUES = [
    {
        issueNumber: 3,
        date: "29 Августа 2026",
        html: `
        html: `
            <!-- РЯД 1: Косплей -->
            <div class="np-row" style="margin-bottom: 30px;">
                <div class="np-col-60" style="align-self: flex-start;">
                    <div class="np-image-box" onclick="openLightbox(this)" role="button" tabindex="0">
                        <picture style="width: 100%; display: block;">
                            <source srcset="img/news/news_29_08_2026_cosplay.webp" type="image/webp">
                            <img src="img/news/news_29_08_2026_cosplay.webp" alt="Теилзкосплей">
                        </picture>
                    </div>
                </div>
                
                <div class="np-col-40">
                    <h3 class="np-title">НОВЫЙ ДОНАТГОЛ: КОСПЛЕЙ-РУЛЕТКА</h3>
                    <p class="np-text"><span class="dropcap">О</span>ткрыт сбор на косплей персонажа из вселенной Соника. Костюмы сложные, полукастомные и дорогие, поэтому цель — <strong>60.000 RUB</strong>.</p>
                    <p class="np-text">Самое интересное — <strong>ПЕРСОНАЖА ВЫБИРАЕТЕ ВЫ!</strong> Чтобы закинуть персонажа в рулетку, вы просто отправляете донат с его именем.</p>
                    <p class="np-text" style="padding: 10px; background: #2a2a2a; border-left: 3px solid #ff3385;">Правило: 1 рубль = 1 балл. Чем больше сумма донатов за конкретного героя, тем выше шанс, что мне придётся это на себя надеть!</p>
                    <p class="np-text">Как только сбор закроется, мы сразу крутим колесо судьбы и узнаём победителя. Готовьте самые безумные идеи!</p>
                </div>
            </div>

            <!-- РЯД 2: Проклятие и Бейджи (Слайдер) -->
            <div class="np-row" style="margin-bottom: 30px;">
                <div class="np-col-60">
                    <h3 class="np-title">ПРОКЛЯТИЕ SONIC ADVANCE 3</h3>
                    <p class="np-text">Sonic Advance 3 официально стала самой проклятой игрой марафона. Приключения затянулись аж на 6 часов, а количество смертей побило все абсолютные антирекорды — <strong>205 смертей за стрим</strong>! Редакция советует запасаться валерьянкой.</p>
                    
                    <h3 class="np-title" style="margin-top: 30px;">БЕЙДЖИ ИВЕНТА</h3>
                    <p class="np-text">На Твиче запущены эксклюзивные значки! Ивент продлится <strong>до 22 сентября</strong> (15:00 по Немеции / 16:00 МСК).</p>
                    <p class="np-text">Выполняй условия из карточек справа, чтобы лутать уникальные бейджи в чат!</p>
                </div>
                
                <div class="np-col-40">
                    <!-- Слайдер бейджей -->
                    <div class="np-slider" style="aspect-ratio: 1/1;">
                        <div class="np-slide active" id="news3-slide-0">
                            <picture onclick="openLightbox(this.parentElement)" role="button" tabindex="0" style="cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; padding-bottom: 40px; box-sizing: border-box;">
                                <source srcset="img/news/news_29_08_2026_badge1.webp" type="image/webp">
                                <img src="img/news/news_29_08_2026_badge1.webp" alt="Бейдж Обычного Соника" style="width: auto; height: 100%; max-width: 80%; object-fit: contain;">
                            </picture>
                            <div style="position: absolute; bottom: 35px; left: 0; width: 100%; text-align: center; font-size: 13px; color: #333; font-weight: bold;">Бейдж Соника: 12 часов просмотра</div>
                        </div>
                        <div class="np-slide" id="news3-slide-1">
                            <picture onclick="openLightbox(this.parentElement)" role="button" tabindex="0" style="cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; padding-bottom: 40px; box-sizing: border-box;">
                                <source srcset="img/news/news_29_08_2026_badge2.webp" type="image/webp">
                                <img src="img/news/news_29_08_2026_badge2.webp" alt="Бейдж Супер Соника" style="width: auto; height: 100%; max-width: 80%; object-fit: contain;">
                            </picture>
                            <div style="position: absolute; bottom: 35px; left: 0; width: 100%; text-align: center; font-size: 13px; color: #333; font-weight: bold;">Супер Соник: 2 подарочные сабки</div>
                        </div>
                        <div class="np-slide" id="news3-slide-2">
                            <picture onclick="openLightbox(this.parentElement)" role="button" tabindex="0" style="cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; padding-bottom: 40px; box-sizing: border-box;">
                                <source srcset="img/news/news_29_08_2026_badge3.webp" type="image/webp">
                                <img src="img/news/news_29_08_2026_badge3.webp" alt="Бейдж Шэдоу" style="width: auto; height: 100%; max-width: 80%; object-fit: contain;">
                            </picture>
                            <div style="position: absolute; bottom: 35px; left: 0; width: 100%; text-align: center; font-size: 13px; color: #333; font-weight: bold;">Шэдоу: Топ-5 дарителям</div>
                        </div>
                        
                        <div class="np-slider-nav">
                            <button class="np-slider-btn" onclick="changeNewsSlide(-1)">&#10094;</button>
                            <button class="np-slider-btn" onclick="changeNewsSlide(1)">&#10095;</button>
                        </div>
                        
                        <div class="np-slider-dots">
                            <div class="np-dot active" id="news3-dot-0" onclick="setNewsSlide(0)"></div>
                            <div class="np-dot" id="news3-dot-1" onclick="setNewsSlide(1)"></div>
                            <div class="np-dot" id="news3-dot-2" onclick="setNewsSlide(2)"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- РЯД 3: Арт Маку и Драма -->
            <div class="np-row">
                <div class="np-col-60" style="align-self: flex-start;">
                    <div class="np-image-box" onclick="openLightbox(this)" role="button" tabindex="0">
                        <picture style="width: 100%; display: block;">
                            <source srcset="img/arts/Ya_i_Maku_final.webp" type="image/webp">
                            <img src="img/arts/Ya_i_Maku_final.webp" alt="Я и Маку">
                        </picture>
                    </div>
                </div>
                
                <div class="np-col-40">
                    <h3 class="np-title">НЕЙРОСЕТЬ ИЛИ ОБИДА?</h3>
                    <p class="np-text"><span class="dropcap">Г</span>рандиозный скандал потряс интернет! Недавно Юрумми нарисовал прекрасный арт, посвященный Маку. Но когда он скинул его ей на стриме и попросил заценить... она публично заявила, что это сгенерировано нейросетью!</p>
                    <p class="np-text">Итог: стример страшно обиделся и теперь принципиально заявляет всем, что он действительно нейросеть. Восстание машин началось с непризнанного искусства.</p>
                </div>
            </div>
        `
    },
    {
        issueNumber: 2,
        date: "24 Августа 2026",
        html: `
            <!-- РЯД 1 -->
            <div class="np-row">
                <!-- Левая колонка со слайдером (60%) -->
                <div class="np-col-60" style="align-self: flex-start;">
                    <div class="np-slider">
                        <picture class="np-slide active" id="news2-slide-0" onclick="openLightbox(this)" role="button" tabindex="0" style="cursor: pointer;">
                            <source srcset="img/news/news_24_08_2026_1.webp" type="image/webp">
                            <img src="img/news/news_24_08_2026_1.webp" alt="Мем 1">
                        </picture>
                        <picture class="np-slide" id="news2-slide-1" onclick="openLightbox(this)" role="button" tabindex="0" style="cursor: pointer;">
                            <source srcset="img/news/news_24_08_2026_2.webp" type="image/webp">
                            <img src="img/news/news_24_08_2026_2.webp" alt="Мем 2">
                        </picture>
                        <picture class="np-slide" id="news2-slide-2" onclick="openLightbox(this)" role="button" tabindex="0" style="cursor: pointer;">
                            <source srcset="img/news/news_24_08_2026_4.webp" type="image/webp">
                            <img src="img/news/news_24_08_2026_4.webp" alt="Мем 4">
                        </picture>
                        
                        <div class="np-slider-nav">
                            <button class="np-slider-btn" onclick="changeNewsSlide(-1)">&#10094;</button>
                            <button class="np-slider-btn" onclick="changeNewsSlide(1)">&#10095;</button>
                        </div>
                        
                        <div class="np-slider-dots">
                            <div class="np-dot active" id="news2-dot-0" onclick="setNewsSlide(0)"></div>
                            <div class="np-dot" id="news2-dot-1" onclick="setNewsSlide(1)"></div>
                            <div class="np-dot" id="news2-dot-2" onclick="setNewsSlide(2)"></div>
                        </div>
                    </div>
                    <p style="text-align: center; font-size: 13px; color: #777; font-style: italic; margin-top: 8px;">(Нажмите на картинку, чтобы увеличить. Листайте вправо, чтобы увидеть больше)</p>
                </div>
                
                <!-- Правая колонка с текстом (40%) -->
                <div class="np-col-40">
                    <h3 class="np-title">НЕЙРОСЛОП И МАРАФОН СОНИКА</h3>
                    <p class="np-text"><span class="dropcap">Н</span>едавние трансляции марафона Соника обернулись чем-то невероятным. Чат сорвался с цепи и начал массово генерировать нейросетевые мемы.</p>
                    <p class="np-text">Шуток было так много, и они были настолько абсурдными, что наш дорогой стример буквально умирал со смеху в прямом эфире. Все дружно смеялись над бедным ежом, а эфир наполнился настоящим нейрослопом. Некоторые из лучших перлов вы можете увидеть на соседних кадрах.</p>
                </div>
            </div>

            <!-- РЯД 2 -->
            <div class="np-row" style="margin-top: 40px;">
                <!-- Левая колонка с текстом (40%) -->
                <div class="np-col-40">
                    <h3 class="np-title">ВЫРЕЗАНО СО СТРИМА</h3>
                    <p class="np-text"><span class="dropcap">К</span>стати о шутках... В ходе марафона родились настолько специфичные пасты, что их пришлось вырезать из официальных записей. Но наша редакция раздобыла оригиналы:</p>
                    
                    <div id="quote-container" style="display: grid;">
                        <div class="np-quote quote-slide" style="grid-area: 1 / 1; opacity: 1; pointer-events: auto; transition: opacity 0.3s;">
                            «Соник взялся за свой огромный желатиновый стержень и начал неистово встряхивать его налево и направо, белая жидкость сочилась со всех щелей но он не останавливался и лишь с большим усилием сдавливал наконечник. И в момент когда пальцы его рук ощутили облегченение, пот и слезы полились по щекам бедного лисенка сидящего перед ним. Все было кончено.»
                        </div>
                        <div class="np-quote quote-slide" style="grid-area: 1 / 1; opacity: 0; pointer-events: none; transition: opacity 0.3s;">
                            «Соник дерётся со своим злейшим врагом, начинает проигрывать, но вдруг его накрывает волна воспоминаний о том что он сражается за то чтобы увидеть своих жён Юруми и Маку, которые вскоре должны родить ему детей. Тогда он собирает все силы в кулак и побеждает своего врага.»
                        </div>
                        <div class="np-quote quote-slide" style="grid-area: 1 / 1; opacity: 0; pointer-events: none; transition: opacity 0.3s;">
                            «<br>
                            — Теилз я хочу отойти пописать.<br>
                            — Делай это при мне.<br>
                            »
                        </div>
                        <div class="np-quote quote-slide" style="grid-area: 1 / 1; opacity: 0; pointer-events: none; transition: opacity 0.3s;">
                            «Соник снял свой красный ботинок прямо перед желтохвостым п да rassom <br>
                            - зачем ты это делаешь Соник <br>
                            - чаю?<br>
                            »
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: -10px; margin-bottom: 25px; padding-right: 15px;">
                        <button onclick="changeQuoteSlide(-1)" style="background: none; border: none; color: #ff3385; cursor: pointer; font-size: 18px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">&#10094; Пред.</button>
                        <button onclick="changeQuoteSlide(1)" style="background: none; border: none; color: #ff3385; cursor: pointer; font-size: 18px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">След. &#10095;</button>
                    </div>
                    
                    <p class="np-text" style="font-size: 13px; color: #666; margin-bottom: 40px;">Редакция газеты отказывается давать комментарии по поводу прочитанного.</p>

                    <h3 class="np-title">РАБОТА: ИЩЕМ МОНТАЖЁРА</h3>
                    <p class="np-text">Срочные новости из отдела кадров! Мы в поисках нового монтажёра, а возможно даже и нарезчика для канала.</p>
                    <p class="np-text">Что случилось со старым, спросите вы? Ну... прошлый почему-то обиделся на нас и ушёл. Хз когда вернётся и вернётся ли вообще.</p>
                    <p class="np-text">Так что если ты умеешь резать видосы, не боишься желатиновых стержней и готов работать за респект — откликайся! Если никто не откликнется, то и ладно, сами как-нибудь склеим. (Это замедлит выход нового контента, потому что придётся делать всё самому)</p>
                </div>
                
                <!-- Правая колонка с картинкой 3 (60%) -->
                <div class="np-col-60" style="align-self: flex-start;">
                    <div class="np-image-box" onclick="openLightbox(this)" role="button" tabindex="0">
                        <picture style="width: 100%; display: block;">
                            <source srcset="img/news/news_24_08_2026_3.webp" type="image/webp">
                            <img src="img/news/news_24_08_2026_3.webp" alt="Мем 3">
                        </picture>
                    </div>
                    <p style="text-align: center; font-size: 13px; color: #777; font-style: italic; margin-top: 8px;">Блядь где я? - Юрумми замечен в городе.</p>
                </div>
            </div>
        `
    },
    {
        issueNumber: 1,
        date: "17 Августа 2026",
        tgPostId: "740",
        html: `
            <div style="display: flex; flex-wrap: wrap; gap: 30px;">
                <div class="news-col-left">
                    <h4 class="news-article-title">ОБНОВЛЕНИЕ ЭМОУТОВ</h4>
                    <p><span class="dropcap">Н</span>а канале появились абсолютно новые эмоуты! Наша прекрасная художница Маку подготовила пак шикарных смайлов, которые вы уже можете использовать на стримах. Все они представлены на эксклюзивном превью ниже.</p>
                    
                    <div onclick="openLightbox(this)" role="button" tabindex="0" style="display: block; width: 100%; border: 2px solid #555; overflow: hidden; margin: 20px 0; cursor: pointer; transition: transform 0.2s;">
                        <picture>
                            <source srcset="img/news/Маку смайлы.webp" type="image/webp">
                            <img src="img/news/Маку смайлы.png" alt="Новые эмоуты от Маку" style="width: 100%; height: auto; display: block;">
                        </picture>
                        <div style="display: none;"><h3>Новые эмоуты</h3><p>Автор: @Maku_q</p></div>
                    </div>

                    <h4 class="news-article-title" style="margin-top: 40px;">ИНЦИДЕНТ В 5 УТРА: ЮРУМИ ЗАСТИГНУТ ВРАСПЛОХ В СОБСТВЕННОЙ ПОСТЕЛИ</h4>
                    <p><span class="dropcap">Э</span>то был обычный стримерский вечер, плавно переходящий в ночь. Но внезапно тишину разрезало зловещее жужжание. В мою комнату ворвался ОГРОМНЫЙ шершень. Я, как истинный герой, тактически отступил в коридор, чтобы надеть тяжёлую броню (накинуть кофту). Вооружившись мужеством, я выглянул в окно и увидел улетающего монстра. <em>«Победа!»</em> — подумал я и спокойно лёг спать.</p>
                    <p>Но враг оказался коварен. Тот улетевший шершень был лишь приманкой — его другом! А основной диверсант всё это время сидел в засаде где-то в комнате. Ровно в 5 утра по германскому времени я проснулся от того самого жужжания прямо над ухом. К счастью, обошлось без жертв — я благополучно открыл окно и депортировал нелегала на улицу.</p>

                    <h4 class="news-article-title" style="margin-top: 40px;">САЙТ СТАЛ ЕЩЁ ЛУЧШЕ</h4>
                    <p><span class="dropcap">Е</span>сли вы читаете этот текст, значит вы уже оценили наше главное нововведение — полноценную систему новостей в стиле ретро-газеты! Теперь время от времени я смогу радовать вас свежими сводками и краткими пересказами важных историй.</p>
                    <p>Кроме того, во вкладке <strong>Расписание</strong> рядом с календарём появился удобный чеклист марафона по Сонику, в котором я буду отмечать свой прогресс прохождения. А раздел <strong>Обо мне</strong> обзавёлся красивым блоком с особой благодарностью Маку. Оставайтесь на связи, впереди ещё много интересного!</p>
                </div>
                
                <div class="news-col-right">
                    <p style="color: #ff3385; font-size: 14px; margin-top: 0; margin-bottom: 15px; font-family: sans-serif; text-align: center;">
                        ⚠️ Лента Telegram (может нужен VPN)
                    </p>
                    <div id="news-tg-container">
                        <!-- Виджет загружается через JS -->
                    </div>
                    <a href="https://t.me/yurummiyt" target="_blank" class="btn-donate btn-da" style="font-size: 16px; padding: 12px; margin-top: 10px; width: 100%; box-sizing: border-box; display: block; text-align: center;">
                        Читать все новости ➔
                    </a>
                </div>
            </div>
        `
    }
];

let currentIssueIndex = 0;

function renderNewsIssue(index) {
    if (index < 0 || index >= NEWS_ISSUES.length) return;
    
    currentIssueIndex = index;
    const issue = NEWS_ISSUES[index];
    
    // Update header
    document.getElementById('news-issue-number').innerText = `Еженедельный вестник картонного мира • Выпуск №${issue.issueNumber} • ${issue.date}`;
    
    // Update body content
    document.getElementById('news-body').innerHTML = issue.html;
    
    // Update Telegram Widget (if the issue has it)
    const tgContainer = document.getElementById('news-tg-container');
    if (tgContainer && issue.tgPostId) {
        tgContainer.innerHTML = ''; 
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-post', `yurummiyt/${issue.tgPostId}`);
        script.setAttribute('data-width', '100%');
        script.setAttribute('data-dark', '1');
        tgContainer.appendChild(script);
    }
    
    // Update pagination buttons state (keep them permanently visible)
    document.getElementById('news-btn-prev').disabled = (index >= NEWS_ISSUES.length - 1);
    document.getElementById('news-btn-next').disabled = (index <= 0);
    
    // Reset timer and quotes
    if (typeof startNewsSliderTimer === 'function') {
        startNewsSliderTimer();
    }
    if (typeof currentQuoteIndex !== 'undefined') {
        currentQuoteIndex = 0;
    }
}

function changeNewsIssue(step) {
    const newIndex = currentIssueIndex - step; 
    renderNewsIssue(newIndex);
}

// Slider logic for Issue 2
let currentNewsSlideIndex = 0;
let newsSliderInterval;

function startNewsSliderTimer() {
    if (newsSliderInterval) clearInterval(newsSliderInterval);
    newsSliderInterval = setInterval(() => {
        if (document.querySelectorAll('.np-slide').length > 0) {
            changeNewsSlide(1);
        }
    }, 15000);
}

function setNewsSlide(index) {
    const slides = document.querySelectorAll('.np-slide');
    const dots = document.querySelectorAll('.np-dot');
    if (slides.length === 0) return;
    
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentNewsSlideIndex = index;
    startNewsSliderTimer(); // reset timer on manual change
}

function changeNewsSlide(direction) {
    const slides = document.querySelectorAll('.np-slide');
    if (slides.length === 0) return;
    
    let newIndex = currentNewsSlideIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    setNewsSlide(newIndex);
}

// Slider logic for Quotes
let currentQuoteIndex = 0;
function changeQuoteSlide(direction) {
    const slides = document.querySelectorAll('.quote-slide');
    if (slides.length === 0) return;
    
    slides.forEach(s => {
        s.style.opacity = '0';
        s.style.pointerEvents = 'none';
    });
    
    currentQuoteIndex += direction;
    if (currentQuoteIndex >= slides.length) currentQuoteIndex = 0;
    if (currentQuoteIndex < 0) currentQuoteIndex = slides.length - 1;
    
    slides[currentQuoteIndex].style.opacity = '1';
    slides[currentQuoteIndex].style.pointerEvents = 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('news-body')) {
        renderNewsIssue(0); // 0 is always the latest issue
        startNewsSliderTimer();
    }
});
