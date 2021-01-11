(function(){
    "use strict";

    const onecallURL = 'https://api.openweathermap.org/data/2.5/onecall';
    const homeCoords = [-98.4951, 29.4246];

    mapboxgl.accessToken = mapboxToken;
    let map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/outdoors-v11",
        zoom: 10,
        center: [homeCoords[0], homeCoords[1]]
    })

    let marker = new mapboxgl.Marker({color: "#AEFFE2"})
        .setLngLat([homeCoords[0], homeCoords[1]])
        .addTo(map);

    function getCurrentData(lon, lat){
        return new Promise((resolve) => {
            $.ajax({
                url: onecallURL,
                type: 'GET',
                data: {
                    lat: lat,
                    lon: lon,
                    appid: owmKey,
                    units: "imperial",
                    exclude: "minutely, hourly, daily"
                },
                success: function(data) {
                    resolve(data)
                }
            })
        })
    }

    function formatCurrentData (data){
        let resultCurrent = {};
        resultCurrent = {
            date: new Date(data.current.dt * 1000).toDateString(),
            dew_point: data.current.dew_point,
            humidity: data.current.humidity,
            pressure: data.current.pressure,
            description: data.current.weather[0].description,
            icon_large: "http://openweathermap.org/img/wn/"+ data.current.weather[0].icon +"@2x.png",
            icon_small: "http://openweathermap.org/img/wn/"+ data.current.weather[0].icon +".png",
            feels: data.current.feels_like,
            temp: data.current.temp,
            sunrise: new Date(data.current.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(data.current.sunset * 1000).toLocaleTimeString()
        };
        return resultCurrent;
    }

    function getForecastData(lon, lat){
        return new Promise((resolve) => {
            $.ajax({
                url: onecallURL,
                type: 'GET',
                data: {
                    lat: lat,
                    lon: lon,
                    appid: owmKey,
                    units: "imperial",
                    exclude: "minutely, hourly, current"
                },
                success: function(data) {
                    resolve(data)
                }
            })
        })
    }

    function formatForecastData (data){
        let resultForecast = [];
        for (let i = 1; i<= 4; i++){
            let dailyForecast = {
                date: new Date(data.daily[i].dt * 1000).toDateString(),
                dew_point: data.daily[i].dew_point,
                humidity: data.daily[i].humidity,
                pressure: data.daily[i].pressure,
                description: data.daily[i].weather[0].description,
                icon_large: "http://openweathermap.org/img/wn/"+ data.daily[i].weather[0].icon + "@2x.png",
                icon_small: "http://openweathermap.org/img/wn/"+ data.daily[i].weather[0].icon + ".png",
                maxtemp: data.daily[i].temp.max,
                mintemp: data.daily[i].temp.min
            }
            resultForecast.push(dailyForecast);
        }

        return resultForecast;
    }

    function buildCurrentCard(currentObject){
        let cardHTML = "";
        cardHTML += "<div class='card bg-sun m-2 col-12 p-0 mx-auto'>"
        cardHTML += "<div class='card-header bg-mint text-center heading-font'><i class='fas fa-calendar-day text-peach'></i>  Today's Weather</div>"
        cardHTML += "<img src='" + currentObject.icon_large + "' class='card-img-top img-thumbnail img-fluid mx-auto mt-2 p-3 bg-sky' style='max-width: 50%; height: auto;' alt='weather icon'>";
        cardHTML += "<div class='card-body'>";
        cardHTML += "<h6 class='text-center pb-3 heading-font'>Currently: <span class='font-weight-bold'>"+ parseInt(currentObject.temp) +" °F</span></h6>"
        cardHTML += "<p class='card-text'>Description: <span class='font-weight-bold'>"+ currentObject.description +"</span></p>"
        cardHTML += "<p class='card-text'>Feels like: <span class='font-weight-bold'>"+ parseInt(currentObject.feels) +" °F</span></p>"
        cardHTML += "<p class='card-text'>Humidity: <span class='font-weight-bold'>"+ currentObject.humidity +"%</span></p>"
        cardHTML += "<p class='card-text d-none d-md-block'>Dew Point: <span class='font-weight-bold'>"+ currentObject.dew_point +"</span></p>"
        cardHTML += "<p class='card-text d-none d-md-block'>Sunrise: <span class='font-weight-bold'>"+ currentObject.sunrise +"  CST</span></p>"
        cardHTML += "<p class='card-text d-none d-md-block'>Sunset: <span class='font-weight-bold'>"+ currentObject.sunset +"  CST</span></p>"
        cardHTML += "</div>"

        $("#current-row").append(cardHTML)
    }

    function buildForecastCards(forecastArray){
        forecastArray.forEach(function(forecastObject){
            let cardHTML = "";
            cardHTML += "<div class='card m-2 col-12 col-md-5 p-0 bg-sun mx-auto'>"
            cardHTML += "<div class='card-header bg-mint text-center heading-font'><i class='fas fa-calendar-day text-peach'></i>  "+ forecastObject.date +"</div>"
            cardHTML += "<img src='" + forecastObject.icon_large + "' class='card-img-top img-thumbnail img-fluid mx-auto mt-2 bg-sky' style='max-width: 50%; height: auto;' alt='weather icon'>";
            cardHTML += "<div class='card-body mt-1'>";
            cardHTML += "<h6 class='text-center pb-3 heading-font'>Low: <span class='font-weight-bold'>"+ parseInt(forecastObject.mintemp) +" °F</span> / High: <span class='font-weight-bold'>" + parseInt(forecastObject.maxtemp) + " °F</span></h6>"
            cardHTML += "<p class='card-text'>Description: <span class='font-weight-bold'>"+ forecastObject.description +"</span></p>"
            cardHTML += "<p class='card-text'>Dew Point: <span class='font-weight-bold'>"+ parseInt(forecastObject.dew_point) + "</span></p>"
            cardHTML += "<p class='card-text'>Humidity: <span class='font-weight-bold'>"+ forecastObject.humidity +"%</span></p>"
            cardHTML += "</div>"

            $("#forecast-row").append(cardHTML)
        })
    }

    function setMarker(lon, lat){
        marker.remove();
        marker = new mapboxgl.Marker({color: "#AEFFE2"})
            .setLngLat([lon, lat])
            .addTo(map);
    }

    function mapFly(lon, lat){
        map.flyTo({center: [lon, lat], zoom: 9});
    }


    $("#search-btn").click(function(event){
        event.preventDefault();
        let userInput = $("#search-input").val();

        geocode(userInput, mapboxToken)
            .then(function(result){
                $("#current-city").empty().text(result[1])
                $("#current-city2").empty().text(result[1])
                setMarker(result[0][0], result[0][1]);
                mapFly(result[0][0], result[0][1])
                getCurrentData(result[0][0], result[0][1])
                    .then((data) => {
                        let currentObject = formatCurrentData(data);
                        $("#current-row").empty();
                        buildCurrentCard(currentObject);
                    })
                getForecastData(result[0][0], result[0][1])
                    .then((data) => {
                        let forecastArray = formatForecastData(data);
                        $("#forecast-row").empty();
                        buildForecastCards(forecastArray);
                    })
            })
    })

    $(document).ready(function(){
        console.log("ready");
        getCurrentData(homeCoords[0], homeCoords[1])
            .then((data) => {
                let currentObject = formatCurrentData(data);
                buildCurrentCard(currentObject);
            })
        getForecastData(homeCoords[0], homeCoords[1])
            .then((data) => {
                let forecastArray = formatForecastData(data);
                buildForecastCards(forecastArray);
            })

        map.on('click', function(e) {
            console.log('Lat: ' + e.lngLat.lat);
            console.log('Lon: ' + e.lngLat.lng);
            console.log(e);
            reverseGeocode({lat: e.lngLat.lat, lng: e.lngLat.lng}, mapboxToken)
                .then((data) => {
                    $("#current-city").empty().text(data);
                    $("#current-city2").empty().text(data);
                });

            setMarker(e.lngLat.lng, e.lngLat.lat);
            mapFly(e.lngLat.lng, e.lngLat.lat);
            getCurrentData(e.lngLat.lng, e.lngLat.lat)
                .then((data) => {
                    let currentObject = formatCurrentData(data);
                    $("#current-row").empty();
                    buildCurrentCard(currentObject);
                })
            getForecastData(e.lngLat.lng, e.lngLat.lat)
                .then((data) => {
                    let forecastArray = formatForecastData(data);
                    $("#forecast-row").empty();
                    buildForecastCards(forecastArray);
                })
        });
    })
})();
