const NEWS_ISSUES = [
    {
        issueNumber: 1,
        date: "16 Августа 2026",
        tgPostId: "740",
        content: `
            <h4 class="news-article-title">ОБНОВЛЕНИЕ ЭМОУТОВ</h4>
            <p><span class="dropcap">Н</span>а канале появились абсолютно новые эмоуты! Наша прекрасная художница Маку подготовила пак шикарных реакций, которые вы уже можете использовать на стримах. Все они представлены на эксклюзивном превью ниже.</p>
            
            <div onclick="openLightbox(this)" role="button" tabindex="0" style="display: block; width: 100%; border: 2px solid #555; overflow: hidden; margin: 20px 0; cursor: pointer; transition: transform 0.2s;">
                <picture>
                    <source srcset="img/news/Маку смайлы.webp" type="image/webp">
                    <img src="img/news/Маку смайлы.png" alt="Новые эмоуты от Маку" style="width: 100%; height: auto; display: block;">
                </picture>
                <div style="display: none;"><h3>Новые эмоуты</h3><p>Автор: @Maku_q</p></div>
            </div>

            <h4 class="news-article-title" style="margin-top: 40px;">ИНЦИДЕНТ В 5 УТРА: ЮРУМИ ЗАСТИГНУТ ВРАСПЛОХ В СОБСТВЕННОЙ ПОСТЕЛИ</h4>
            <p><span class="dropcap">Э</span>то был обычный стримерский вечер, плавно переходящий в ночь. Но внезапно тишину разрезало зловещее жужжание. В мою комнату ворвался ОГРОМНЫЙ шершень. Я, как истинный герой, тактически отступил в коридор, чтобы надеть тяжёлую броню (читай: накинуть кофту). Вооружившись мужеством, я выглянул в окно и увидел улетающего монстра. <em>«Победа!»</em> — подумал я и спокойно лёг спать.</p>
            <p>Но враг оказался коварен. Тот улетевший шершень был лишь приманкой — его другом! А основной диверсант всё это время сидел в засаде где-то под потолком. Ровно в 5 утра по германскому времени я проснулся от того самого жужжания прямо над ухом. К счастью, обошлось без жертв — я благополучно открыл окно и депортировал нелегала на улицу.</p>

            <h4 class="news-article-title" style="margin-top: 40px;">САЙТ СТАЛ ЕЩЁ ЛУЧШЕ</h4>
            <p><span class="dropcap">Е</span>сли вы читаете этот текст, значит вы уже оценили наше главное нововведение — полноценную систему новостей в стиле ретро-газеты! Теперь мы сможем регулярно радовать вас свежими сводками из картонного мира.</p>
            <p>Кроме того, во вкладке <strong>Расписание</strong> рядом с календарём появился удобный чеклист марафона по Сонику, в котором я буду отмечать свой прогресс прохождения. А раздел <strong>Обо мне</strong> обзавёлся красивым блоком с особой благодарностью Маку. Оставайтесь на связи, впереди ещё много интересного!</p>
        `
    }
];

let currentIssueIndex = 0;

function renderNewsIssue(index) {
    if (index < 0 || index >= NEWS_ISSUES.length) return;
    
    currentIssueIndex = index;
    const issue = NEWS_ISSUES[index];
    
    // Update header
    document.getElementById('news-issue-number').innerText = `Ежедневный вестник картонного мира • Выпуск №${issue.issueNumber} • ${issue.date}`;
    
    // Update left column content
    document.getElementById('news-content-area').innerHTML = issue.content;
    
    // Update Telegram Widget
    const tgContainer = document.getElementById('news-tg-container');
    tgContainer.innerHTML = ''; // Clear previous widget
    
    // Telegram widget requires creating a fresh script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-post', `yurummiyt/${issue.tgPostId}`);
    // script.setAttribute('data-width', '100%'); // Removed to let widget center naturally
    script.setAttribute('data-dark', '1');
    
    tgContainer.appendChild(script);
    
    // Update pagination buttons state
    document.getElementById('news-btn-prev').style.visibility = (index < NEWS_ISSUES.length - 1) ? 'visible' : 'hidden'; // index + 1 is older
    document.getElementById('news-btn-next').style.visibility = (index > 0) ? 'visible' : 'hidden'; // index - 1 is newer
}

function changeNewsIssue(step) {
    // step = -1 means previous (older) issue -> which is +1 in the array index (0 is newest)
    // step = 1 means next (newer) issue -> which is -1 in the array index
    const newIndex = currentIssueIndex - step; 
    renderNewsIssue(newIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('news-content-area')) {
        renderNewsIssue(0); // 0 is always the latest issue
    }
});
