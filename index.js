require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/weather', async (req, res) => {
    const { city, lat, lon } = req.query;
    if (!city && (!lat || !lon)) {
        return res.status(400).json({ error: 'Provide city name or coordinates.' });
    }

    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
    url += city ? `&q=${city}` : `&lat=${lat}&lon=${lon}`;
    
    const { data } = await axios.get(url);
    res.json({
        city: data.name,
        temperature: `${data.main.temp}°C`,
        description: data.weather[0].description,
        humidity: `${data.main.humidity}%`,
        wind_speed: `${data.wind.speed} m/s`,
        wind_direction: data.wind.deg,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
    });
});

app.get('/forecast', async (req, res) => {
    const { city } = req.query;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    const { data } = await axios.get(url);

    const forecast = data.list.map(entry => ({
        date: entry.dt_txt,
        temperature: entry.main.temp,
        description: entry.weather[0].description
    }));

    res.json({ city: data.city.name, forecast });
});

app.listen(PORT, () => console.log(`✅ Running on http://localhost:${PORT}`));
