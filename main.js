const today = new Date();

const numberOfMinutesToStation = 8;

const dayInMonth = today.getDate();
const month = today.getMonth() + 1;
const yearShort = `${today.getFullYear()}`.substring(2, 4);
const hours = today.getHours();
const minutes = today.getMinutes();

let trainText = "";
fetch(
  `https://xmlopen.rejseplanen.dk/bin/rest.exe/departureBoard?id=008600709&date=${dayInMonth}.${month}.${yearShort}&time=${hours}:${minutes}&format=json`
)
  .then((Response) => Response.json())
  .then((data) => {
    const firstDepartures = data["DepartureBoard"]["Departure"];
    const trainDepartures = firstDepartures.filter(
      (departure) => departure.type === "S"
    );

    const trainDeparturesTowardsCopenhagen = firstDepartures
      .filter((departure) => departure.rtTrack === "1")
      .slice(0, 2);
    trainText += "The next trains from Måløv towards Copenhagen leaves a<br>";
    trainDeparturesTowardsCopenhagen.forEach((departure) => {
      const trainDate = new Date();
      trainDate.setHours(departure.time.substring(0, 2));
      trainDate.setMinutes(departure.time.substring(3, 5));
      trainDate.setMinutes(trainDate.getMinutes() - numberOfMinutesToStation);

      trainText += `- ${
        departure.time
      } leave from home at ${trainDate.getHours()}:${trainDate.getMinutes()}<br>`;
    });
    console.log(trainDeparturesTowardsCopenhagen);
    console.log(trainText);
    document.querySelector("div").innerHTML = trainText;
  });

//http://xmlopen.rejseplanen.dk/bin/rest.exe/location?input=m%C3%A5l%C3%B8v&format=json
