// SUA CHAVE DE API
const API_KEY = 'b8a9e2f3590a4306c4085bac41b1d78a';

// URLs da API OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// Elementos do DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityButtons = document.querySelectorAll('.city-btn');
const loading = document.getElementById('loading');
const weatherContainer = document.getElementById('weather-container');
const errorContainer = document.getElementById('error-container');
const tryAgainBtn = document.getElementById('try-again-btn');

// Elementos para exibir dados
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const visibility = document.getElementById('visibility');
const cloudiness = document.getElementById('cloudiness');
const forecastCards = document.getElementById('forecast-cards');
const errorMessage = document.getElementById('error-message');

// Variáveis globais
let lastSearchedCity = 'São Paulo';

// Converter Kelvin para Celsius
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Converter metros/segundo para km/h
function mpsToKmph(mps) {
    return (mps * 3.6).toFixed(1);
}

// Formatar data
function formatDate(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatar hora
function formatTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
}

// Obter ícone do clima baseado no código da API
function getWeatherIcon(iconCode, description) {
    const iconMap = {
        '01d': 'fas fa-sun',           // céu limpo (dia)
        '01n': 'fas fa-moon',          // céu limpo (noite)
        '02d': 'fas fa-cloud-sun',     // poucas nuvens (dia)
        '02n': 'fas fa-cloud-moon',    // poucas nuvens (noite)
        '03d': 'fas fa-cloud',         // nuvens dispersas
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',         // nublado
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',    // chuva
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',// chuva com sol
        '10n': 'fas fa-cloud-moon-rain',// chuva com lua
        '11d': 'fas fa-bolt',          // tempestade
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',     // neve
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',          // névoa
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-cloud';
}

// Obter cor do ícone baseado na temperatura
function getTemperatureColor(temp) {
    if (temp < 10) return '#4dabf7';      // Azul (frio)
    if (temp < 20) return '#69db7c';      // Verde (ameno)
    if (temp < 30) return '#ffa94d';      // Laranja (quente)
    return '#ff6b6b';                     // Vermelho (muito quente)
}

// Obter cor do fundo baseado no clima
function getWeatherBackground(weatherId) {
    // IDs de clima da OpenWeatherMap
    if (weatherId >= 200 && weatherId < 300) {
        return 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)'; // Tempestade
    } else if (weatherId >= 300 && weatherId < 500) {
        return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'; // Garoa
    } else if (weatherId >= 500 && weatherId < 600) {
        return 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'; // Chuva
    } else if (weatherId >= 600 && weatherId < 700) {
        return 'linear-gradient(135deg, #bdc3c7 0%, #ecf0f1 100%)'; // Neve
    } else if (weatherId >= 700 && weatherId < 800) {
        return 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'; // Atmosfera
    } else if (weatherId === 800) {
        return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'; // Limpo
    } else {
        return 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'; // Nuvens
    }
}

// Verificar se a chave de API é válida
function validateApiKey() {
    if (!API_KEY || API_KEY === 'cole_sua_chave_aqui') {
        showError(
            'Chave de API não configurada!<br><br>' +
            'Por favor, siga estes passos:<br>' +
            '1. Crie uma conta gratuita em <a href="https://openweathermap.org" target="_blank">OpenWeatherMap</a><br>' +
            '2. Obtenha sua chave API<br>' +
            '3. Cole a chave no arquivo script.js (linha 6)<br>' +
            '4. Recarregue a página'
        );
        return false;
    }
    return true;
}

// Mostrar estado de carregamento
function showLoading() {
    loading.style.display = 'block';
    weatherContainer.style.display = 'none';
    errorContainer.style.display = 'none';
}

// Mostrar dados do clima
function showWeather() {
    loading.style.display = 'none';
    weatherContainer.style.display = 'block';
    errorContainer.style.display = 'none';
}

// Mostrar erro
function showError(message) {
    loading.style.display = 'none';
    weatherContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorMessage.innerHTML = message;
}

// Buscar coordenadas geográficas da cidade
async function getCityCoordinates(cityName) {
    try {
        const response = await fetch(`${GEO_URL}?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar coordenadas');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Cidade não encontrada');
        }
        
        return {
            lat: data[0].lat,
            lon: data[0].lon,
            name: data[0].name,
            country: data[0].country,
            state: data[0].state
        };
        
    } catch (error) {
        console.error('Erro nas coordenadas:', error);
        throw error;
    }
}

// Buscar dados meteorológicos atuais
async function fetchCurrentWeather(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=pt_br`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na API');
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Erro no clima atual:', error);
        throw error;
    }
}

// Buscar previsão para 5 dias
async function fetchWeatherForecast(lat, lon) {
    try {
        const response = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=pt_br&cnt=6`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na API');
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Erro na previsão:', error);
        throw error;
    }
}

// Processar e exibir dados do clima
async function fetchWeatherData(city) {
    // Validar chave de API
    if (!validateApiKey()) {
        return;
    }
    
    showLoading();
    lastSearchedCity = city;
    
    try {
        // 1. Obter coordenadas da cidade
        const coords = await getCityCoordinates(city);
        
        // 2. Buscar dados atuais e previsão em paralelo
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(coords.lat, coords.lon),
            fetchWeatherForecast(coords.lat, coords.lon)
        ]);
        
        // 3. Exibir os dados
        displayCurrentWeather(currentData, coords);
        displayForecast(forecastData);
        
        // 4. Atualizar data/hora local
        updateLocalDateTime(currentData.timezone);
        
        // 5. Atualizar fundo baseado no clima
        updateBackground(currentData.weather[0].id);
        
        // 6. Mostrar container do clima
        showWeather();
        
        // 7. Salvar no histórico (localStorage)
        saveToSearchHistory(city);
        
    } catch (error) {
        console.error('Erro completo:', error);
        
        let errorMsg = `Não foi possível obter dados para "${city}".`;
        
        if (error.message.includes('401')) {
            errorMsg = 'Chave de API inválida. Verifique se sua chave está correta.';
        } else if (error.message.includes('404')) {
            errorMsg = `Cidade "${city}" não encontrada. Verifique a ortografia.`;
        } else if (error.message.includes('429')) {
            errorMsg = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
        } else if (error.message.includes('network')) {
            errorMsg = 'Erro de conexão. Verifique sua internet.';
        }
        
        showError(errorMsg);
    }
}

// Exibir dados atuais do clima
function displayCurrentWeather(data, coords) {
    const tempC = kelvinToCelsius(data.main.temp);
    const feelsLikeC = kelvinToCelsius(data.main.feels_like);
    
    // Informações da cidade
    const locationName = coords.state 
        ? `${coords.name}, ${coords.state}, ${coords.country}`
        : `${coords.name}, ${coords.country}`;
    
    cityName.textContent = locationName;
    
    // Temperatura (com cor dinâmica)
    temperature.textContent = tempC;
    temperature.style.color = getTemperatureColor(tempC);
    
    // Ícone e descrição
    const iconClass = getWeatherIcon(data.weather[0].icon, data.weather[0].description);
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
    weatherIcon.querySelector('i').style.color = getTemperatureColor(tempC);
    
    // Descrição (capitalizada)
    const description = data.weather[0].description;
    weatherDesc.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Detalhes
    feelsLike.textContent = `${feelsLikeC}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${mpsToKmph(data.wind.speed)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Horários do sol
    sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
    sunset.textContent = formatTime(data.sys.sunset, data.timezone);
    
    // Visibilidade e nebulosidade
    visibility.textContent = data.visibility >= 10000 
        ? '> 10 km' 
        : `${(data.visibility / 1000).toFixed(1)} km`;
    
    cloudiness.textContent = `${data.clouds.all}%`;
    
    // Direção do vento (se disponível)
    if (data.wind.deg) {
        const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
        const index = Math.round(data.wind.deg / 45) % 8;
        windSpeed.textContent += ` (${directions[index]})`;
    }
}

// Exibir previsão para os próximos dias
function displayForecast(data) {
    forecastCards.innerHTML = '';
    
    // Pular o primeiro item (que é o atual) e pegar os próximos 5
    for (let i = 1; i < Math.min(data.list.length, 6); i++) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        
        // Formatar dia da semana
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dayName = i === 1 ? 'Amanhã' : days[date.getDay()];
        
        // Temperaturas
        const tempHigh = kelvinToCelsius(forecast.main.temp_max);
        const tempLow = kelvinToCelsius(forecast.main.temp_min);
        
        // Ícone
        const iconClass = getWeatherIcon(forecast.weather[0].icon, forecast.weather[0].description);
        
        // Criar card
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="forecast-day">${dayName}</p>
            <div class="forecast-icon">
                <i class="${iconClass}"></i>
            </div>
            <p class="forecast-desc">${forecast.weather[0].description}</p>
            <div class="forecast-temp">
                <span class="forecast-high" style="color: ${getTemperatureColor(tempHigh)}">${tempHigh}°</span>
                <span class="forecast-low" style="color: ${getTemperatureColor(tempLow)}">${tempLow}°</span>
            </div>
        `;
        
        forecastCards.appendChild(card);
    }
}

// Atualizar data e hora locais
function updateLocalDateTime(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    currentDate.textContent = localTime.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Atualizar fundo baseado no clima
function updateBackground(weatherId) {
    const container = document.querySelector('.current-weather');
    if (container) {
        container.style.background = getWeatherBackground(weatherId);
        container.style.color = 'white';
        
        // Ajustar cor dos textos para contraste
        const title = container.querySelector('h2');
        const details = container.querySelectorAll('.detail-label, .detail-value');
        
        if (title) title.style.color = 'white';
        details.forEach(el => {
            if (el.classList.contains('detail-label')) {
                el.style.color = 'rgba(255, 255, 255, 0.8)';
            } else {
                el.style.color = 'white';
            }
        });
    }
}

// Salvar pesquisa no histórico
function saveToSearchHistory(city) {
    try {
        let history = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
        
        // Remover se já existir
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Adicionar no início
        history.unshift(city);
        
        // Manter apenas os últimos 10
        history = history.slice(0, 10);
        
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    } catch (error) {
        console.warn('Não foi possível salvar no histórico:', error);
    }
}

// Carregar histórico de pesquisas
function loadSearchHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
        return history;
    } catch (error) {
        return [];
    }
}

// Buscar localização do usuário
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalização não suportada'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}

// Buscar clima pela localização
async function fetchWeatherByLocation(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=pt_br`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar localização');
        }
        
        const data = await response.json();
        await fetchWeatherData(data.name);
        
    } catch (error) {
        console.error('Erro na localização:', error);
        showError('Não foi possível detectar sua localização. Por favor, digite uma cidade manualmente.');
    }
}

// ============================
// EVENT LISTENERS
// ============================

// Buscar cidade
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        cityInput.value = '';
    }
});

// Buscar com Enter
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            cityInput.value = '';
        }
    }
});

// Cidades sugeridas
cityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const city = button.getAttribute('data-city');
        fetchWeatherData(city);
    });
});

// Tentar novamente
tryAgainBtn.addEventListener('click', () => {
    errorContainer.style.display = 'none';
    cityInput.focus();
});

// Buscar localização atual (nova funcionalidade)
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar botão de localização
    const searchBox = document.querySelector('.search-box');
    const locationBtn = document.createElement('button');
    locationBtn.id = 'location-btn';
    locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
    locationBtn.title = 'Usar minha localização atual';
    searchBox.appendChild(locationBtn);
    
    locationBtn.addEventListener('click', async () => {
        showLoading();
        try {
            const coords = await getUserLocation();
            await fetchWeatherByLocation(coords.lat, coords.lon);
        } catch (error) {
            showError('Não foi possível acessar sua localização. Verifique as permissões do navegador.');
        }
    });
});

// ============================
// INICIALIZAÇÃO
// ============================

window.addEventListener('load', async () => {
    // Verificar se há chave de API
    if (!validateApiKey()) {
        return;
    }
    
    // Tentar usar geolocalização ou buscar cidade padrão
    try {
        const coords = await getUserLocation();
        await fetchWeatherByLocation(coords.lat, coords.lon);
    } catch (error) {
        // Se falhar, usar cidade padrão
        await fetchWeatherData(lastSearchedCity);
    }
    
    // Focar no campo de busca
    cityInput.focus();
    
    // Adicionar efeito de digitação no placeholder
    let placeholderIndex = 0;
    const placeholders = [
        "Digite o nome da cidade...",
        "Ex: São Paulo, Brasil",
        "Ex: Paris, França",
        "Ex: Tóquio, Japão",
        "Ex: Nova York, EUA"
    ];
    
    setInterval(() => {
        cityInput.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }, 3000);
});

// ============================
// MENSAGENS DE DEBUG (remova em produção)
// ============================

console.log(`
🌟 WEATHER APP - CONFIGURAÇÃO 🌟

Para usar dados reais:
1. Obtenha uma chave API gratuita em: https://openweathermap.org/api
2. Substitua 'cole_sua_chave_aqui' pela sua chave real
3. Recarregue a página

📊 Limites da conta gratuita:
- 60 requisições por minuto
- 1,000,000 requisições por mês
- Dados atualizados a cada 2 horas

⚠️  NUNCA compartilhe sua chave API publicamente!
`);