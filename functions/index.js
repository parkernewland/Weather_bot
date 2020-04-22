'use strict';
const axios = require('axios'); //store main object from axios package as a function in "axios"
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

//creating and exporting the module as a firebase function
const weather_bot_firebase = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({request, response}); //creating "agent" as a blank javascript function that utilizes webhook client interface from the 'dialogflow-fulfillment' package
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    let intentMap = new Map; //creates a blank Map contained in the variable "intentMap"
    //allows for the pairing of each of the above functions created with an intent specified in dialogflow
    intentMap.set('Default Welcome Intent', welcome); //pairs the "welcome" function identified above with the "Default Welcome Intent" in dialogflow
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('tempinfo', weatherInfoPull);
    intentMap.set('humidinfo', humidInfoPull);
    intentMap.set('windinfo', windInfoPull);
    intentMap.set('weathstart', startinginfo);
    intentMap.set('sky', skyinfo);
    intentMap.set('press', pressureinfo);
    agent.handleRequest(intentMap);  //tells "agent" to handle each request based on the pairings identified in the "intentmap"

});

function welcome(agent) { //creates a function "welcome" for our dialogflow to call upon when the "default welcome" intent is triggered
    agent.add(`Welcome to my agent!`); //identifies the response from dialogflow when this intent is triggered
}

function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function KtoF(tempK) { //function to convert temperature in Kelvin to temperature in Fahrenheit
    return (((tempK -273.15) * (9/5))+32).toFixed(2);

}

function weatherInfoPull(agent) { //creates a function to receive and respond with temperature information if the user triggers the temperature intent
    const city = agent.parameters.city; //stores the parameter "city" that the user specified in dialogflow as the variable "city" here
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=afb178541f4af3e2e8ccd568dbe0ee6e`)
        //triggers the webhook to make the call to the weather api for the city specified
        .then((result) => {
            console.log(result.data);
            agent.add(`Current temperature in ${city} is ${KtoF(result.data.main.temp)} \xB0F, 
                it currently feels like ${KtoF(result.data.main.feels_like)} \xB0F, 
                today's minimum temperature is ${KtoF(result.data.main.temp_min)} \xB0F 
                and maximum is ${KtoF(result.data.main.temp_max)} \xB0F`);
        }).catch(err => console.log(err));
}

function humidInfoPull(agent) { //creates a function to receive and respond with humidity information if the user triggers the humidity intent
    const city = agent.parameters.city;
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=afb178541f4af3e2e8ccd568dbe0ee6e`)
        .then((result) => {
            console.log(result.data);
            agent.add(`Humidity in ${city} today is ${JSON.stringify(result.data.main.humidity)} %`);
        }).catch(err => console.log(err));
}

function windInfoPull(agent) { //creates a function to receive and respond with wind information if the user triggers the wind intent
    const city = agent.parameters.city;
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=afb178541f4af3e2e8ccd568dbe0ee6e`)
        .then((result) => {
            console.log(result.data);
            agent.add(`${city} wind today is ${((result.data.wind.speed)*2.24).toFixed(2)} miles per hour`);
        }).catch(err => console.log(err));
}

function startinginfo(agent) { //creates a function to receive and respond with a less general welcome response if the user triggers the weathstart intent
    agent.add(`What weather information are you interested in? (I have access to data for temperature, wind, humidity, pressure, and clouds/sky) (include city name)`);
}

function skyinfo(agent) { //creates a function to receive and respond with sky information if the user triggers the sky intent
    const city = agent.parameters.city;
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=afb178541f4af3e2e8ccd568dbe0ee6e`)
        .then((result) => {
            const skyyy = result.data.clouds.all;
            if (skyyy <= 33) {
                agent.add(`${city} has a clear sky today at ${skyyy}% clouds`);
            } else if (33 < skyyy & skyyy < 50) {
                agent.add(`${city} has a partly cloudy sky today at ${skyyy}% clouds`);
            } else {
                agent.add(`${city} has a cloudy sky today at ${skyyy}% clouds`);
            }
            agent.add(`${city} has a ${result.weather.description} today`);
        }).catch(err => console.log(err));
}

function pressureinfo(a) { //creates a function to receive and respond with pressure information if the user triggers the pressure intent
    const city = a.parameters.city;
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=afb178541f4af3e2e8ccd568dbe0ee6e`)
        .then((result) => {
            console.log(result.data);
            const pres = result.data.main.pressure;
            if (pres > 1013) {
                a.add(`${city} has a high pressure system today at a pressure of ${pres} hPa`);
            } else {
                a.add(`${city} has a low pressure system today at a pressure of ${pres} hPa`);
            }
        }).catch(err => console.log(err));
}

module.exports = {weather_bot_firebase, welcome, fallback, weatherInfoPull, humidInfoPull, windInfoPull, startinginfo, skyinfo, pressureinfo, KtoF};