import { googleMapsKey, openWeatherKey } from "./keys.js";

let path = window.location.pathname;
let page = path.split("/").pop();

const days = [
	"Pazar",
	"Pazartesi",
	"Salı",
	"Çarşamba",
	"Perşembe",
	"Cuma",
	"Cumartesi"
];

const months = [
	"Ocak",
	"Şubat",
	"Mart",
	"Nisan",
	"Mayıs",
	"Haziran",
	"Temmuz",
	"Ağustos",
	"Eylül",
	"Ekim",
	"Kasım",
	"Aralık"
];

let unitOfMeasurement = "metric";

const locationField = document.getElementById("location");
const iconField = document.getElementById("weatherIcon");
const infoField = document.getElementsByClassName("weatherInfo")[0];
const humidityField = document.getElementsByClassName("humidity")[0];
const windInfo = document.getElementsByClassName("windInfo")[0];
const sunRiseField = document.getElementsByClassName("sunrise")[0];
const sunSetField = document.getElementsByClassName("sunset")[0];
const body = document.getElementsByTagName("body")[0];
const main = document.getElementsByTagName("main")[0];
const toggleButton = document.getElementById("toggle-button");
const menu = document.getElementById("menu");

toggleButton.addEventListener("click", () => {
	menu.style.display = menu.style.display === "none" ? "initial" : "none";
});

navigator.geolocation.getCurrentPosition(
	(location) => operations(location.coords.latitude, location.coords.longitude),
	(err) => console.log(err)
);

function operations(lat, long) {
	setLocationData(lat, long);
	getWeatherData(lat, long);
}

function setLocationData(lat, long) {
	fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=
		   ${lat},${long}&sensor=true&key=${googleMapsKey}`)
		.then((response) => response.json())
		.then(
			(data) =>
				(locationField.innerText = `${data.results[0].address_components[4].long_name}, ${data.results[0].address_components[5].long_name}`)
		);
}

function getWeatherData(lat, long) {
	fetch(
		`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&APPID=${openWeatherKey}&units=${unitOfMeasurement}`
	)
		.then((response) => response.json())
		.then((data) => setWeatherInfo(data));
}

function setWeatherInfo(data) {
	setBackGround(data.current);
	switch (page) {
		case "":
			setDailyInfo(data);
			break;
		case "index.html":
			setDailyInfo(data);
			break;
		case "weekly.html":
			setWeeklyInfo(data);
	}
}

// TODAY'S JS FUNCTIONS

function setDailyInfo(data) {
	setIcon(data.current);
	setTempInfo(data.current);
	setHumidityInfo(data.current);
	setWindInfo(data.current);
	setDaytimeInfo(data.current);
}

function setBackGround(current) {
	let date = new Date();
	if (date > current.sunset || date < current.sunrise) {
		body.style.background = `hsl(197, ${71 - current.clouds / 2}%, 13%)`;
	} else {
		body.style.background = `hsl(197, ${71 - current.clouds / 2}%, 73%)`;
	}
}

function setIcon(current) {
	iconField.src = `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
}

function setTempInfo(current) {
	infoField.innerText = `Sıcaklık: ${current.temp} ${getUnitSymbol(
		unitOfMeasurement
	)}`;
}

function setHumidityInfo(current) {
	humidityField.innerText = `Nem: %${current.humidity}`;
}

function getUnitSymbol(unit) {
	switch (unit) {
		case "metric":
			return "°C";
	}
}

function setWindInfo(current) {
	windInfo.innerText = `Rüzgar Hızı: ${current.wind_speed} 
	Rüzgar Derecesi: ${current.wind_deg}`;
}

function setDaytimeInfo(current) {
	sunRiseField.innerText = `Gün doğumu: ${formatUnixToHour(current.sunrise)}`;
	sunSetField.innerText = `Gün batımı: ${formatUnixToHour(current.sunset)}`;
}

function formatUnixToHour(unixTime) {
	let date = new Date(unixTime * 1000);
	let hour = date.getHours();
	let minute = date.getMinutes();
	return `${hour}:${minute}`;
}

// THIS WEEK'S JS FUNCTIONS

function setWeeklyInfo(data) {
	for (let i = 0; i < 8; i++) {
		createDiv(data, i);
	}
}

function formatUnixToDay(unixTime) {
	let date = new Date(unixTime * 1000);
	let day = date.getDate();
	let month = date.getMonth();
	let dayName = date.getDay();
	return `${day} ${months[month]} ${days[dayName]}`;
}

function createDiv(data, i) {
	let displayWeekly = document.createElement("div");
	displayWeekly.className = "display-weekly";

	let img = document.createElement("img");
	img.id = "weeklyIcon";
	let imageCode = data.daily[i].weather[0].icon;
	img.src = `http://openweathermap.org/img/wn/${imageCode}@2x.png`;
	displayWeekly.appendChild(img);

	let weeklyInfo = document.createElement("div");
	weeklyInfo.className = "weeklyInfo";
	displayWeekly.appendChild(weeklyInfo);

	let date = document.createElement("h4");
	date.className = "date";
	let dateInfo = data.daily[i].dt;
	date.innerText = formatUnixToDay(dateInfo);
	weeklyInfo.appendChild(date);

	let weeklyWeather = document.createElement("h4");
	weeklyWeather.className = "weeklyWeather";
	let dayDegree = `Gündüz: ${data.daily[i].temp.day}`;
	weeklyWeather.innerText = dayDegree;
	weeklyInfo.appendChild(weeklyWeather);

	let weeklyWeatherNight = document.createElement("h4");
	weeklyWeatherNight.className = "weeklyWeatherNight";
	let nightDegree = `Gece: ${data.daily[i].temp.night}`;
	weeklyWeatherNight.innerText = nightDegree;
	weeklyInfo.appendChild(weeklyWeatherNight);

	main.appendChild(displayWeekly);
}
