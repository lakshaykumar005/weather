let forecastChart; // Global variable to store the chart instance

async function getWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const response = await fetch(`/weather?city=${city}`);
        const data = await response.json();
        
        if (response.status !== 200) {
            document.getElementById('weatherResult').innerHTML = '<p style="color: red;">City not found!</p>';
            return;
        }

        document.body.style.background = getBackground(data.description);
        document.getElementById('weatherResult').innerHTML = `
            <p><strong>City:</strong> ${data.city}</p>
            <p><strong>Temperature:</strong> ${data.temperature}°C</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Humidity:</strong> ${data.humidity}%</p>
            <img src="${data.icon}" alt="Weather icon">
        `;

        document.getElementById('wind-speed').textContent = `${data.wind_speed} km/h`;
        document.getElementById('wind-compass').style.transform = `rotate(${data.wind_direction}deg)`;

        loadForecast(city);
        getAirQuality(city);
        getHealthData(data.country);

    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

async function loadForecast(city) {
    try {
        const response = await fetch(`/forecast?city=${city}`);
        const data = await response.json();

        if (!data.forecast || data.forecast.length === 0) {
            console.error("No forecast data available.");
            return;
        }

        const labels = data.forecast.map(entry => entry.date.split(" ")[0]);
        const temperatures = data.forecast.map(entry => parseFloat(entry.temperature));

        updateChart(labels, temperatures);

    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

function updateChart(labels, temperatures) {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    if (forecastChart) {
        forecastChart.destroy();
    }

    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        }
    });
}

async function getAirQuality(city) {
    const apiKey = 'c147ac7648ac055d9aa8cb9d085cad4a54c6907f';
    const url = `https://api.waqi.info/feed/@11859/?token=c147ac7648ac055d9aa8cb9d085cad4a54c6907f`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "ok") {
            document.getElementById('airQualityResult').innerHTML = '<p style="color: red;">Air Quality data not found!</p>';
            return;
        }

        document.getElementById('aqi').textContent = data.data.aqi;
        document.getElementById('pm25').textContent = data.data.iaqi.pm25?.v || "N/A";
        document.getElementById('pm10').textContent = data.data.iaqi.pm10?.v || "N/A";

    } catch (error) {
        console.error("Error fetching air quality data:", error);
    }
}

async function getHealthData(country) {
    const url = `https://disease.sh/v3/covid-19/all`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById('covid-cases').textContent = data.cases;
        document.getElementById('covid-deaths').textContent = data.deaths;
        document.getElementById('covid-recovered').textContent = data.recovered;

    } catch (error) {
        console.error("Error fetching health data:", error);
    }
}

function startVoiceSearch() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
        document.getElementById('city').value = event.results[0][0].transcript;
        getWeather();
    };
    recognition.start();
}

function getMyLocation() {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`/weather?lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            document.getElementById('city').value = data.city;
            getWeather();
        },
        (error) => {
            alert('Geolocation not supported or denied.');
        }
    );
}

function getBackground(description) {
    if (description.includes("rain")) return "lightblue";
    if (description.includes("cloud")) return "gray";
    if (description.includes("clear")) return "yellow";
    return "white";
}
