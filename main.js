//https://xmlopen.rejseplanen.dk/bin/rest.exe/location?input=m%C3%A5l%C3%B8v&format=json

const $form = document.querySelector("form");

$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  let [station, timeToStation] = event.originalTarget;
  timeToStation = timeToStation.value;
  const stationName = station.value;
  const stationId = await getStationId(stationName);
  const stationsFromLocalStorage = JSON.parse(localStorage.getItem("stations"));
  if (stationsFromLocalStorage) {
    stationsFromLocalStorage.push({
      name: stationName,
      id: stationId,
      timeToStation,
    });

    localStorage.setItem("stations", JSON.stringify(stationsFromLocalStorage));
  } else {
    localStorage.setItem(
      "stations",
      JSON.stringify([
        {
          name: stationName,
          id: stationId,
          timeToStation,
        },
      ])
    );
  }

  main();
});

async function getStationId(station) {
  return fetch(
    `https://xmlopen.rejseplanen.dk/bin/rest.exe/location?input=${station}&format=json`
  )
    .then((Response) => Response.json())
    .then((data) => data.LocationList.StopLocation[0].id);
}

async function getDeparturesFromStation(stationId, numberOfMinutesToStation) {
  const nowAfterTripToStation = new Date(
    new Date().setMinutes(new Date().getMinutes() + numberOfMinutesToStation)
  );

  const dayInMonth = nowAfterTripToStation.getDate();
  const month = nowAfterTripToStation.getMonth() + 1;
  const yearShort = `${nowAfterTripToStation.getFullYear()}`.substring(2, 4);
  const hours = nowAfterTripToStation.getHours();
  const minutes = nowAfterTripToStation.getMinutes();

  return fetch(
    `https://xmlopen.rejseplanen.dk/bin/rest.exe/departureBoard?id=${stationId}&date=${dayInMonth}.${month}.${yearShort}&time=${hours}:${minutes}&format=json`
  )
    .then((Response) => Response.json())
    .then((data) => {
      return data["DepartureBoard"]["Departure"];
    });
}

async function main() {
  const stations = JSON.parse(localStorage.getItem("stations"));

  stations.forEach(async (station) => {
    console.log(station);
    const stationText = await getStringFromStation(
      station.id,
      "S",
      "1",
      station.name,
      station.timeToStation,
      "C"
    );

    document.querySelector(".stations").innerHTML += stationText;
  });
}

main();

function getSubtractedDate(date) {}

function getDateFromDepartureString(departureString) {
  const now = new Date();
  now.setHours(departureString.time.substring(0, 2));
  now.setMinutes(departureString.time.substring(3, 5));

  return now;
}

async function getStringFromStation(
  stationId,
  transportType,
  track,
  station,
  numberOfMinutesToStation,
  trainNumber
) {
  let trainText = "";
  const firstDepartures = await getDeparturesFromStation(
    stationId,
    numberOfMinutesToStation
  );

  const trainDepartures = firstDepartures
    .filter((departure) => departure.type === transportType)
    .filter((departure) => departure.name == trainNumber);
  trainText += `<p>De næste tog fra <strong>${station}</strong></p>`;

  trainText += `<ul>`;
  trainText += `<li class="row"><ul>
  <li>Afgang station</li>
  <li>Afgang hjem</li>
  <li>Retning</li>
  <li>Spor</li>
  </ul></li>`;
  trainDepartures.forEach((departure) => {
    const dateFromDeparture = getDateFromDepartureString(departure);
    const MS_PER_MINUTE = 60000;
    var dateSubtractedTimeToStation = new Date(
      dateFromDeparture - numberOfMinutesToStation * MS_PER_MINUTE
    );

    trainText += `<li class="row"><ul>
    <li>${getFormattedTime(dateFromDeparture)}</li>
    <li>${getFormattedTime(dateSubtractedTimeToStation)}</li>
    <li>${departure.direction}</li>
    <li>${departure.rtTrack ? departure.rtTrack : "-"}</li>
    </ul></li>`;
  });

  trainText += `</ul>`;

  return trainText;
}

function getFormattedTime(time) {
  return `${time.getHours()}:${
    time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
  }`;
}
