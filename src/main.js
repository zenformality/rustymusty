import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector('#app');
const datepicker = document.querySelector('#datepicker');
const goBtn = document.querySelector('#go-btn');
const todayBtn = document.querySelector('#today-btn');

function updateClock() {
    const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    second: '2-digit',
    hour12: false,
    });
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    });

  document.getElementById('clock').innerHTML =
    `<span class="clock-time">${time}</span><span class="clock-date">${date}</span>`
}
updateClock();
setInterval(updateClock, 1000);


function todayString() {
  return new Date().toISOString().split('T')[0];
}

datepicker.max = todayString();
datepicker.value = todayString();



function buildMedia(data) {
  if (data.media_type === 'image') {
    return `<img class="apod-img" src="${data.url}" alt="${data.title}" loading="lazy" />`;
  }
  if (data.url.includes('youtube') || data.url.includes('youtu.be')) {

    return `
         <div class="video-wrap">
           <iframe
             class="apod-iframe"
             src="${data.url}"
             title="${data.title}"
             frameborder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowfullscreen
           ></iframe>
         </div>`;
     }
     return `<video class="apod-video" src="${data.url}" controls></video>`;
   }
  
function fetchAPOD(date) {
  app.innerHTML = `<p class="loading">searching the cosmos for ${date}...</p>`;

  
  const dateParam = date ? `&date=${date}` : '';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${dateParam}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      
      const media = buildMedia(data);
      const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const copyright = data.copyright
        ? `<span class="copyright">© ${data.copyright.trim()}</span>`
               : '';

      app.innerHTML = `
              <article class="apod-card">
                <div class="apod-meta">
                  <span class="apod-date">${formattedDate}</span>
                  ${copyright}
                </div>
                <h1 class="apod-title">${data.title}</h1>
                <div class="apod-media">${media}</div>
                <p class="apod-explanation">${data.explanation}</p>
                <a
                  class="apod-hdlink"
                  href="${data.hdurl || data.url}"
                  target="_blank"
                  rel="noopener"
                >
                  view full resolution ↗
                </a>
              </article>
            `;
          })

    .catch((err) => {
      app.innerHTML = `
             <div class="error-card">
               <span class="error-icon">🛸</span>
               <h2>Houston, we have a problem.</h2>
               <p>${err.message}</p>
               <p class="error-hint">Check your API key in <code>.env</code> and restart the dev server.</p>
             </div>
           `;
         });
}

goBtn.addEventListener('click', () => {
  if (datepicker.value) fetchAPOD(datepicker.value);
});

datepicker.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchAPOD(datepicker.value);
});

todayBtn.addEventListener('click', () => {
  datepicker.value = todayString();
  fetchAPOD(todayString());
});

fetchAPOD(todayString());
