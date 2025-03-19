const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY=`6992d99fd1f41bd24d7a2498adca1015`; //API Key for OpenWeatherMap API

const createWeatherCard = (cityName , weatherItem ,index)=>{
    console.log(weatherCardsDiv);
    if(index === 0){ //HTML for the main weather card
        return `<div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h6>Temp : ${Math.round(((weatherItem.main.temp - 273.15)))}°C</h6>
                <h6>Wind : ${weatherItem.wind.speed} M/S </h6>
                <h6>Humidity : ${weatherItem.main.humidity} % </h6>
            </div>

            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } 
    else{ //HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp : ${Math.round((weatherItem.main.temp - 273.15))}°C</h6>
                    <h6>Wind : ${weatherItem.wind.speed} M/S </h6>
                    <h6>Humidity : ${weatherItem.main.humidity} %</h6>   
                </li>`;
    }
    
}

const getWeatherDetails = (cityName , latitude , longitde) => {
    
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitde}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        //Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast=data.list.filter(forecast =>{
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        // console.log(fiveDaysForecast);

        //Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem , index) => {
            const html = createWeatherCard(cityName , weatherItem , index);
            if(index === 0 ){
                currentWeatherDiv.insertAdjacentHTML("beforeend" , html);
            }
            else{
               weatherCardsDiv.insertAdjacentHTML("beforeend" , html);
            }
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast! ");
    });
    
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //Get user entered city name and remove eaxtra spaces
    if( cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&units=metric&appid=${API_KEY}`;
    

    // const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates (latitude , longitude , and name) from the API response
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name , lat , lon} = data[0];
        getWeatherDetails(name , lat ,lon);
    })
    .catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
    
} 

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude ,longitude} = position.coords; //Get coordinates of user location
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get city name from coordinates using reverse geocoding API 

            fetch(API_URL)
            .then(response => response.json())
            .then(data => {
            const { name } =data[0];
            getWeatherDetails(name , latitude , longitude);
    })
    .catch(() => {
        alert("An error occured while fetching the city!");
    });
    },
        error => { //show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied.Please reset location permission to grant access again")
            }
            else{
                alert("Geolocation request error.Please reset location permission");
            }
            
            });
}

locationButton.addEventListener('click' , getUserCoordinates);
searchButton.addEventListener('click' , getCityCoordinates);
cityInput.addEventListener("keyup" , e => e.key ==="Enter" && getCityCoordinates());

