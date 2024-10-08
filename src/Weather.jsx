import React, {useEffect, useRef} from 'react';
function Weather({weatherForm, cityInput}) {
    /**
     * @type {React.RefObject<null>}
     * @description A reference to the weather card of the project. It helps to access its CSS property
     * in order to show the result (initially is hidden).
     */
    const cardRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to a city name result in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const cityDispRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to a temperature result in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const tempRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to a humidity result in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const humidityRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to a description result in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const descRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to an emoji result in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const emojiRef = useRef(null);
    /**
     * @type {React.RefObject<null>}
     * @description A reference to an error in a card. Helps to access its CSS property
     * in order to show the result within the weather card (initially is hidden).
     */
    const errorRef = useRef(null);
    /**
     * @type {string}
     * @description An API key used in a project in order to make requests and get data to users.
     * Not available in the repository.
     */
    const apiKey = import.meta.env.VITE_API_KEY; //taken from openweathermap.org
    /**
     * @description A useEffect() hook adding an event listener to make API requests. Runs on mount.
     */
    useEffect(() => {
        /**
         * @async
         * @function
         * @param {SubmitEvent} event An event object (when users click on a button and submit).
         * @listens submit
         * @description Assigns user input to a variable (trimming extra spaces). Tries to make a
         * request in order to get the data about the city. Invokes a displayWeatherInfo(), if the
         * request is successful, otherwise invokes displayError().
         */
        weatherForm.current.addEventListener("submit", async event => { //async arrow function
            event.preventDefault(); //"submit" events refresh the page by default (we need to prevent it)
            const request = cityInput.current.value.trim();
            if(request){ //if "request" has a value
                cardRef.current.style.display = "flex";
                try{ 
                    const weatherData = await getWeatherData(cityInput.current.value);
                    displayWeatherInfo(weatherData);
                }
                catch(error){
                    console.error(error);
                    displayError(error);
                }
            }
            else {
                cardRef.current.style.display = "flex";
                displayError("Please, enter a city!")
            }
        });
    }, []); //runs only on mount
    /**
     * @function displayWeatherInfo
     * @param {Object} data An object containing weather info.
     * @description Makes all the weather info variables visible (except for errors). Destructures
     * the "data" object and assigns its values to variables (to be shown in the weather card for users).
     */
    function displayWeatherInfo(data) {
        cityDispRef.current.style.display = "block";
        tempRef.current.style.display = "block";
        humidityRef.current.style.display = "block";
        descRef.current.style.display = "block";
        emojiRef.current.style.display = "block";
        errorRef.current.style.display = "none";

        //console.log(data); //look for properties within the console to assemble the info and destructure "data" below
        const {name: city, //"data" is an object (let's destructure it). Extract its "name" property with the "city" value (user input)
               main: {temp, humidity}, //"main" is an object (extract "temp" and "humidity" out of it)
               weather: [{description, id}]} = data; //"weather" is an array of an object (extract "id" and "description" out of it)

        cityDispRef.current.textContent = city;
        tempRef.current.textContent = `${(temp - 273.15).toFixed(1)}°C`; //initially the "temp" is in Kelvins
        humidityRef.current.textContent = `Humidity: ${humidity}`;
        descRef.current.textContent = description;
        emojiRef.current.textContent = getEmoji(id);
    }
    /**
     * @function getEmoji
     * @param {number} weatherId An ID of weather conditions (to define an emoji for it).
     * @returns {string} An emoji describing weather.
     * @description This function recieves a weather ID and based on it returns an emoji.
     * Check out {@link https://openweathermap.org/weather-conditions} for more info.
     */
    function getEmoji(weatherId) { //reference to https://openweathermap.org/weather-conditions for IDs
        switch(true) { //does the value of "true" match one of the elements?
            case (weatherId >= 200 && weatherId < 300):
                return "⛈"; //added "Segoe UI Emoji" font to the "Editor Font Family" in the VS Code settings in order to properly paste emojis
            case (weatherId >= 300 && weatherId < 400): //use "Shift+Tab" to tab backwards
                return "🌧";
            case (weatherId >= 500 && weatherId < 600):
                return "🌧";
            case (weatherId >= 600 && weatherId < 700):
                return "❄";
            case (weatherId >= 700 && weatherId < 800):
                return "🌫";
            case (weatherId === 800):
                return "☀";
            case (weatherId >= 801 && weatherId < 810):
                return "☁";
            default:
                return "❔";
        }
    }
    /**
     * @function displayError
     * @param {string} message An error message after a request.
     * @description Removes (if currently shown) all the weather info blocks out of the weather card and
     * adds an error block to show alongside with its message being assigned.
     */
    function displayError(message) {
        cityDispRef.current.style.display = "none";
        tempRef.current.style.display = "none";
        humidityRef.current.style.display = "none";
        descRef.current.style.display = "none";
        emojiRef.current.style.display = "none";
        errorRef.current.style.display = "block";
        errorRef.current.textContent = message;
    }
    /**
     * @async
     * @function getWeatherData
     * @param {string} request A city that users typed and submitted to get data for.
     * @returns {Object} A "data" object containing all the info about weather in a city.
     * @description This funcion makes a request via API URL. Waits for a response and
     * returs a "data" object, otherwise throws an error, if couldn't fetch weather data.
     */
    async function getWeatherData(request) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${request}&appid=${apiKey}`; //the link taken from https://openweathermap.org/current
        const response = await fetch(apiUrl);
        console.log(response); //for a developer
        if(!response.ok) {
            throw new Error("Could not fetch weather data"); //if an Error is detected, the next code lines won't be executed
        }
        return await response.json(); //response.json() is a "data" object
    }

    return(
        <>
            <div className="weather"> {/*BEM structure*/}
                <h1 className="weather__cap" data-test="capt">How Big, How Blue, How Beautiful is the sky now?</h1>
                <div className="weather__card"     style={{display: "none"}} ref={cardRef}     data-test ="card">
                    <h1 className="cityDisplay"    style={{display: "none"}} ref={cityDispRef} data-test="city"></h1>
                    <p className="tempDisplay"     style={{display: "none"}} ref={tempRef}     data-test="temp"></p>
                    <p className="humidityDisplay" style={{display: "none"}} ref={humidityRef} data-test="hum"></p>
                    <p className="descDisplay"     style={{display: "none"}} ref={descRef}     data-test="desc"></p>
                    <p className="emojiDisplay"    style={{display: "none"}} ref={emojiRef}    data-test="emoji"></p>
                    <p className="errorDisplay"    style={{display: "none"}} ref={errorRef}    data-test="error"></p>
                </div>
            </div>
        </>
    );
}
export default Weather;