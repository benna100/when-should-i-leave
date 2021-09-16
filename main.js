//http://xmlopen.rejseplanen.dk/bin/rest.exe/location?input=m%C3%A5l%C3%B8v&format=json

async function getDeparturesFromStation(stationId) {
  const today = new Date();

  const dayInMonth = today.getDate();
  const month = today.getMonth() + 1;
  const yearShort = `${today.getFullYear()}`.substring(2, 4);
  const hours = today.getHours();
  const minutes = today.getMinutes();

  return fetch(
    `https://xmlopen.rejseplanen.dk/bin/rest.exe/departureBoard?id=${stationId}&date=${dayInMonth}.${month}.${yearShort}&time=${hours}:${minutes}&format=json`
  )
    .then((Response) => Response.json())
    .then((data) => {
      return data["DepartureBoard"]["Departure"];
    });
}

async function main() {
  const numberOfMinutesToStation = 8;
  const stationTextMåløv = await getStringFromStation(
    "008600709",
    "S",
    "1",
    "Måløv",
    "København",
    numberOfMinutesToStation,
    "C"
  );
  console.log(stationTextMåløv);
  document.querySelector(".måløv").innerHTML = stationTextMåløv;

  const stationTextVesterport = await getStringFromStation(
    "008600645",
    "S",
    "4",
    "Vesterport",
    "Måløv",
    numberOfMinutesToStation,
    "C"
  );
  document.querySelector(".vesterport").innerHTML = stationTextVesterport;
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
  towards,
  numberOfMinutesToStation,
  trainNumber
) {
  let trainText = "";

  const firstDepartures = await getDeparturesFromStation(stationId);
  console.log(firstDepartures);

  const trainDepartures = firstDepartures
    .filter((departure) => departure.type === transportType)
    .filter((departure) => departure.name == trainNumber);
  console.log(trainDepartures);

  const trainDeparturesTowardsCopenhagen = trainDepartures;
  //.filter((departure) => departure.rtTrack === track)
  console.log(trainDeparturesTowardsCopenhagen);

  trainText += `De næste tog fra ${station} ${towards} kører kl<br>`;
  trainDeparturesTowardsCopenhagen.forEach((departure) => {
    const dateFromDeparture = getDateFromDepartureString(departure);

    const dateSubtractedTimeToStation = new Date(
      dateFromDeparture.setMinutes(
        dateFromDeparture.getMinutes() - numberOfMinutesToStation
      )
    );

    const leavesAfterNow =
      dateSubtractedTimeToStation.getTime() > new Date().getTime();
    console.log(leavesAfterNow);
    if (leavesAfterNow) {
      trainText += `- ${departure.time} mod <strong>${
        departure.direction
      }.</strong> Kør hjemmefra kl ${dateSubtractedTimeToStation.getHours()}:${
        dateSubtractedTimeToStation.getMinutes() < 10
          ? `0${dateSubtractedTimeToStation.getMinutes()}`
          : dateSubtractedTimeToStation.getMinutes()
      }<br>`;
    }
  });

  return trainText;
}
