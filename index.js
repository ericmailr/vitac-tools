const submitScheduleButton = document.getElementById("submitSchedule");
const rawScheduleInput = document.getElementById("rawSchedule");
const result = document.getElementById("result");
const submitRosterButton = document.getElementById("submitRoster");
const rawRosterInput = document.getElementById("rawRoster");
const rosterResult = document.getElementById("rosterResult");
const scheduleContainerDiv = document.getElementById("scheduleContainer");
const teamNameInput = document.getElementById("team-name-input");
const suffixInput = document.getElementById("suffix-input");

const prepTime = 15;

const getFileSuffix = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  var hh = today.getHours();
  var m = today.getMinutes();

  return `${mm}${dd}${yyyy}${hh}${m}`;
};

const getRoster = () => {
  let wordList = "";
  let rawRoster = rawRosterInput.value;
  let inputArray = rawRoster.split("\n");
  console.log(inputArray);
  inputArray.forEach((fullName) => {
    if (/\S/.test(fullName)) {
      let suffix = suffixInput.value === "" ? "praim" : suffixInput.value;
      let names = fullName.split(" ");
      let lastName = names.at(-1);
      console.log(fullName);
      console.log(fullName + "\\" + fullName + " " + suffix);
      console.log(lastName);
      console.log(lastName + "\\" + lastName + " " + suffix);
      wordList += `${fullName}\n${fullName}\\${fullName} ${suffix}\n${lastName}\n${lastName}\\${lastName} ${suffix}\n`;
    }
  });
  //rosterResult.innerHTML = wordList;

  window.URL = window.webkitURL || window.URL;
  var contentType = "text/plain";
  var rosterFile = new Blob([rawRoster], { type: contentType });
  var wordListFile = new Blob([wordList], { type: contentType });
  var a1 = document.createElement("a");
  var a2 = document.createElement("a");
  let teamName = teamNameInput.value;
  a1.download = `${teamName} roster.txt`;
  a2.download = `${teamName} word list.txt`;
  a1.href = window.URL.createObjectURL(rosterFile);
  a2.href = window.URL.createObjectURL(wordListFile);
  a1.dataset.downloadurl = [contentType, a1.download, a1.href].join(":");
  a2.dataset.downloadurl = [contentType, a2.download, a2.href].join(":");
  document.body.appendChild(a1);
  document.body.appendChild(a2);
  a1.click();
  a2.click();
};

submitRosterButton.addEventListener("click", getRoster);

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

var date = new Date();

const formatDate = (dateObject) => {
  let month = dateObject.getMonth() + 1;
  let day = dateObject.getDate();
  let year = dateObject.getFullYear();
  return `${month}/${day}/${year}`;
};

const getCSV = () => {
  const rawSchedule = rawScheduleInput.value;
  if (rawSchedule != "") {
    let dates = rawSchedule.match(/((\d\d)|(\d))\/((\d\d)|(\d))\/20\d\d/g);
    let times = rawSchedule.match(/((\d\d)|(\d)):\d\d(A|P)M/g);
    let descriptions = rawSchedule.match(/Description: .*/g);

    console.log(dates);
    if (descriptions) {
      descriptions = descriptions.map((d) => d.substring(13, d.length));
    }

    const militarizeTime = (time) => {
      let hour = parseInt(time.substring(0, 2));
      let minutes = time.substring(3, 5);
      if (time.charAt(time.length - 2) === "A") {
        return hour == 12 ? "00" + ":" + minutes : time.substring(0, 5);
      } else {
        let newHour = hour < 12 ? hour + 12 : 12;
        let newTime = newHour + ":" + time.substring(3, 5);
        return newTime;
      }
    };

    dates.forEach((date, i) => {
      dates[i] = new Date(dates[i]);
    });

    console.log("1" + dates);

    times.forEach((t, i) => {
      times[i] = militarizeTime(t);
    });

    let endDates = JSON.parse(JSON.stringify(dates));

    times.forEach((t, i) => {
      // add prep time
      if (i % 2 === 0) {
        let hour = parseInt(t.substring(0, 2));
        let minutes = parseInt(t.substring(3, 5));
        if (minutes < prepTime) {
          let newHour = hour - 1;
          if (hour == 0) {
            newHour = 23;

            let tempDate = new Date(dates[i / 2]);
            tempDate.setDate(tempDate.getDate() - 1);
            dates[i / 2] = tempDate;
          }
          if (newHour < 10) {
            newHour = "0" + newHour;
          }
          let newMinutes = (60 - (prepTime - minutes)) % 60;
          if (newMinutes < 10) {
            newMinutes = "0" + newMinutes;
          }
          times[i] = newHour + ":" + newMinutes;
        } else {
          let newMinutes = minutes - prepTime;
          if (newMinutes < 10) {
            newMinutes = "0" + newMinutes;
          }
          if (hour < 10) {
            hour = "0" + hour;
          }
          times[i] = hour + ":" + newMinutes;
        }
      }

      if (i % 2 == 1) {
        if (times[i].substring(0, 2) == "00") {
          let endDate = new Date(dates[(i - 1) / 2]);
          endDate.setDate(endDate.getDate() + 1);
          endDates[(i - 1) / 2] = formatDate(endDate);
        }
      }
    });

    dates.forEach((date, i) => {
      dates[i] = formatDate(new Date(dates[i]));
      endDates[i] = formatDate(new Date(endDates[i]));
    });

    let csvContent = "";
    csvContent +=
      "Subject, Start Date, Start Time, End Date, End Time, All Day Event, Description, Private,\n";

    dates.forEach((date, i) => {
      csvContent += `Work, ${dates[i]}, ${times[2 * i]}, ${endDates[i]}, ${
        times[2 * i + 1]
      }, false, ${descriptions?.[i]}, true,\n`;
    });
    console.log(csvContent);

    window.URL = window.webkitURL || window.URL;
    var contentType = "text/csv";
    var csvFile = new Blob([csvContent], { type: contentType });
    var a = document.createElement("a");
    a.download = `work-schedule-${getFileSuffix()}.csv`;
    a.href = window.URL.createObjectURL(csvFile);
    a.dataset.downloadurl = [contentType, a.download, a.href].join(":");
    document.body.appendChild(a);
    a.click();
  }
};

submitScheduleButton.addEventListener("click", getCSV);
