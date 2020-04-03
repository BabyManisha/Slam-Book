var express = require("express");
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
    if(req.isAuthenticated()){
        res.redirect('/user/questions');
    }else{
        res.render('index');
    }
});

router.get('/home', (req, res) => {
    const weatherDetails = {
        name: false,
        temp: '',
        description: '',
        img: ''
    };
    const lat = req.query.lat || null;
    const long = req.query.long || null;
    if(lat && long){
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${process.env.WEATHER_APPID}`)
        .then((response) => {
            // handle success
            let weather = response.data;
            weatherDetails.name = weather.name;
            weatherDetails.temp = `${weather.main.temp}°C`;
            weatherDetails.description = `${(weather.weather[0].description)}`;
            weatherDetails.img =  `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
            res.render('home', {weatherDetails, msg: false});
        })
        .catch((error) => {
            // handle error
            console.log(error);
            res.render('home', {weatherDetails, msg: false});
        })
    }else{
        res.render('home', {weatherDetails, msg: false});
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/home");
});

module.exports = router;