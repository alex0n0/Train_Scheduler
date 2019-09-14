// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDUo5g_RDJGaXxJZvxKG5eu6GcUU0zCF50",
    authDomain: "bootcamp-w7-d2.firebaseapp.com",
    databaseURL: "https://bootcamp-w7-d2.firebaseio.com",
    projectId: "bootcamp-w7-d2",
    storageBucket: "bootcamp-w7-d2.appspot.com",
    messagingSenderId: "934048003746",
    appId: "1:934048003746:web:25b8d971a71619f6ee89fb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();




















let arrTrains = [];


getTrainData();
function getTrainData() {
    db.collection("w7hw_train").orderBy('created').get().then(function (querySnapshot) {
        arrTrains = [];
        querySnapshot.forEach(function (doc) {
            arrTrains.push({
                trainId: doc.id,
                created: doc.data().created,
                trainName: doc.data().trainName,
                trainDestination: doc.data().trainDestination,
                trainStartTime: doc.data().trainStartTime,
                trainFrequency: doc.data().trainFrequency
            });
        });
    }).then(function () {
        renderTrainTable();
    });
}

function renderTrainTable() {
    $('#regionTrainSchedule').empty();

    let currentDate = new Date();
    $('#time').text(returnFormattedTime(currentDate));
    
    for (let i = 0; i < arrTrains.length; i++) {
        let tableRow = $('<tr>');
        tableRow.addClass('border-top');
        tableRow.append('<td class="py-3">' + arrTrains[i].trainName + '</td>');
        tableRow.append('<td class="py-3">' + arrTrains[i].trainDestination + '</td>');
        tableRow.append('<td class="py-3">' + arrTrains[i].trainFrequency + '</td>');

        let minutesToWait = calculateMinutesAway(arrTrains[i].trainStartTime, currentDate, arrTrains[i].trainFrequency);
        tableRow.append('<td class="py-3">' + calculateNextTrain(currentDate, minutesToWait) + '</td>');
        tableRow.append('<td class="py-3">' + minutesToWait + '</td>');

        let buttonEdit = $('<button>');
        buttonEdit.attr('data-id', arrTrains[i].trainId);
        buttonEdit.addClass('buttonUpdate btn btn-secondary d-flex align-items-center justify-content-center py-auto');
        buttonEdit.append('<i class="material-icons">edit</i>');
        let tableDataButtonEdit = $('<td>');
        tableDataButtonEdit.append(buttonEdit);
        tableRow.append(tableDataButtonEdit);

        let buttonDelete = $('<button>');
        buttonDelete.attr('data-id', arrTrains[i].trainId);
        buttonDelete.addClass('buttonDelete btn btn-danger d-flex align-items-center justify-content-center py-auto');
        buttonDelete.append('<i class="material-icons">delete</i>');
        let tableDataButtonDelete = $('<td>');
        tableDataButtonDelete.append(buttonDelete);
        tableRow.append(tableDataButtonDelete);

        $('#regionTrainSchedule').append(tableRow);
    }
    let isEditing = false;
    $('.buttonUpdate').on('click', function () {
        isEditing = !isEditing;
        let form = $('<form style="opacity: 0.3;"><div class="form-group"><label>*Train Name</label><input type="text" class="form-control" placeholder="Enter the train name"><small class="form-text text-muted" style="height: 1rem; color: red !important;"></small></div>' + 
        '<div class="form-group"><label>*Destination</label><input type="text" class="form-control" placeholder="Enter the train destination" value="><small class="form-text text-muted"style="height: 1rem; color: red !important;"></small></div>' +
        '<div class="form-group"><label>*First Train Time (HH:mm - military time)</label><input type="text" class="form-control" placeholder="Enter 05:00 for 5:00 AM"><small class="form-text text-muted"style="height: 1rem; color: red !important;"></small></div>' + 
        '<div class="form-group"><label>*Frequency (min)</label><input type="text" class="form-control" placeholder="Enter 50 for 50 minutes"><small class="form-text text-muted"style="height: 1rem; color: red !important;"></small></div></form>');

        if (isEditing) {
            $(this).parent().parent().addClass('bg-success');
            $(this).find('i').text('save');

            $(this).parent().parent().parent().parent().parent().append(form);
        } else {
            $(this).find('i').text('edit');
            $(this).parent().parent().removeClass('bg-success');
            $(this).parent().parent().parent().parent().parent().find('form').remove();
        }
    });

    $('.buttonDelete').on('click', function () {
        $(this).parent().parent().remove();
        db.collection('w7hw_train').doc(String($(this).attr('data-id'))).delete().then(function () {
            console.log("Document successfully deleted!");
            getTrainData();
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    });
}

function calculateMinutesAway(trainStartTimeMilitaryformat, currentDate, frequencyMins) {
    let time = trainStartTimeMilitaryformat.split(':');
    let startTimeInMins = parseInt(time[0]) * 60 + parseInt(time[1]);
    let currentTimeInMins = currentDate.getHours() * 60 + currentDate.getMinutes();
    let waitingTime = frequencyMins - ((currentTimeInMins - startTimeInMins) % frequencyMins);
    return waitingTime;
}

function calculateNextTrain(currentTimeMillis, waitTimeMins) {
    let newDate = new Date(currentTimeMillis.valueOf() + Number(waitTimeMins) * 60 * 1000);
    return returnFormattedTime(newDate);
}
function returnFormattedTime(date) {
    let hours = date.getHours();
    let mins = date.getMinutes()
    return ((hours < 10 || hours - 12 < 10) ? '0': '') + (hours < 12 ? hours : hours - 12) + ':' + (mins < 10 ? '0': '') + mins + (hours < 12 ? ' AM' : ' PM');
}




setInterval(function() {
    renderTrainTable();
    console.log('refresh');
}, 15000);












$('#addTrainSubmit').on('click', handlerAddTrain);
function handlerAddTrain(e) {
    e.preventDefault();

    let trainNameString;
    let trainDestinationString;
    let trainStartTimeMilitaryformat;
    let trainFrequencyMins;

    let addTrainInputName = $('#addTrainInputName').val().trim();
    let addTrainInputDestination = $('#addTrainInputDestination').val().trim();
    let addTrainInputStartTime = $('#addTrainInputStartTime').val().trim();
    let addTrainInputFrequency = $('#addTrainInputFrequency').val().trim();

    let isValid = true;

    if (addTrainInputName.length == 0) {
        $('#addTrainMessageName').text('This is required');
        isValid = false;
    }
    if (addTrainInputDestination.length == 0) {
        $('#addTrainMessageDestination').text('This is required');
        isValid = false; 
    }
    if (addTrainInputStartTime.length == 0) {
        $('#addTrainMessageStartTime').text('This is required');
        isValid = false;
    } else if (addTrainInputStartTime.length != 5 || addTrainInputStartTime.search(/[0-2][0-9]:[0-5][0-9]/) == -1 || Number(addTrainInputStartTime.substring(0,2)) > 23) {
        $('#addTrainMessageStartTime').text('Start time exists within a range from 00:00 to 23:59');
        isValid = false;
    }
    if (addTrainInputFrequency.length == 0) {
        $('#addTrainMessageFrequency').text('This is required');
        isValid = false;
    } else if (isNaN(addTrainInputFrequency) || addTrainInputFrequency <= 0 || addTrainInputFrequency.includes(".")) {
        $('#addTrainMessageFrequency').text('Enter a positive integer greater than 0');
        isValid = false;
    }




    if (isValid) {
        trainNameString = addTrainInputName;
        trainDestinationString = addTrainInputDestination;
        trainStartTimeMilitaryformat = addTrainInputStartTime;
        trainFrequencyMins = addTrainInputFrequency;

        db.collection("w7hw_train").add({
            created: new Date().valueOf(),
            trainName: trainNameString,
            trainDestination: trainDestinationString,
            trainStartTime: trainStartTimeMilitaryformat,
            trainFrequency: trainFrequencyMins
        })
            .then(function (docRef) {
                console.log("Document added with ID: ", docRef.id);
                getTrainData();
                $('#addTrainInputName').val('');
                $('#addTrainInputDestination').val('');
                $('#addTrainInputStartTime').val('');
                $('#addTrainInputFrequency').val('');

                $('#addTrainMessageName').text('');
                $('#addTrainMessageDestination').text('');
                $('#addTrainMessageStartTime').text('');
                $('#addTrainMessageFrequency').text('');
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    }
}

$('#addTrainInputName').on('focus', function () {
    $('#addTrainMessageName').text('');
});
$('#addTrainInputDestination').on('focus', function () {
    $('#addTrainMessageDestination').text('');
});
$('#addTrainInputStartTime').on('focus', function () {
    $('#addTrainMessageStartTime').text('');
});
$('#addTrainInputFrequency').on('focus', function () {
    $('#addTrainMessageFrequency').text('');
});



/* update data
var cityRef = db.collection('cities').doc('BJ');

var setWithMerge = cityRef.set({
    capital: true
}, { merge: true });
*/
