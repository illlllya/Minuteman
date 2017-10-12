$(document).ready(function() {
    var now = moment();
    var timeStamp = now.format('MMMM Do YYYY, h:mm a');
    var fileTime = now.format('l')

    $('#timestamp').html(timeStamp);

    var $taskBlock = $("#tasks").html();
    $("#addtask").click(function() {
        $("#tasks").append($taskBlock);
    });


    function getValues() {
        var values = {};

        values.prep = $('#leader').val();
        values.atten = $('#attendees').val();
        values.notes = $('#notes').val();
        values.savefilename = $('#savefilename').val();
        values.tasks = [];

        $("#tasks .form-horizontal").each(function(idx, group) {
            var $group = $(group);
            var taskObj = {};
            taskObj.text = $group.find('textarea').val();
            taskObj.owner = $group.find('input[name="owner"]').val();
            taskObj.due = $group.find('input[name="due"]').val();

            values.tasks.push(taskObj);
        });

        return values;
    }


    $('#cmd').click(function(event) {
        event.preventDefault();

        var doc = new jsPDF();
        doc.setFontSize(12);

        var values = getValues();
        var prep = values.prep;
        var atten = values.atten;
        var notes = values.notes;
        var filename = values.savefilename;
        var marginCounter = 130;
        var taskCounter = 1;

        doc.text(20, 20, 'Preparer: ' + prep);
        doc.text(20, 30, 'Attendees: ' + atten);
        doc.text(20, 50, 'Notes: ' + notes.replace(/(.{70})/g, "$1\n"));

        values.tasks.forEach(function(task) {
            doc.text(20, marginCounter, 'Task ' + taskCounter + ': ' + task.text.replace(/(.{62})/g, "$1\n") + ' (' + task.owner + ' -- to follow up on ' + task.due + ')');

            marginCounter += 25;
            taskCounter += 1;
        });


        if (!filename) {
            doc.save('meeting_notes_' + fileTime + '.pdf');
        } else {
            filename = filename.replace(/[^a-z0-9+]+/gi, '+');
            doc.save(filename + '_' + fileTime + '.pdf');
        }
    });



    $('#cmd_email').click(function(event) {
        console.log('clicked');
        event.preventDefault();
        var values = getValues();
        values.allText = '';
        var taskCounter = 1;

        values.tasks.forEach(function(task) {
            values.allText += '%0A%0A Task ' + taskCounter + ':%0A- ' + task.text + ' (' + task.owner + ' -- to follow up on ' + task.due + ')';

            taskCounter += 1;
        });

        window.open('mailto:ENTER EMAIL?subject=Meeting Minutes ' + fileTime + '&body=' +
            'Attendees: ' + values.atten + '%0A Notes: ' + values.notes + values.allText
        );
    });

    $('#cmd_txt').click(function(event) {
        event.preventDefault();
        var values = getValues();
        values.allText = '';
        var filename = values.savefilename;
        var taskCounter = 1;

        values.tasks.forEach(function(task) {
            values.allText += 'Task #' + taskCounter + ': ' + task.text + ' (' + task.owner + ' -- to follow up on ' + task.due + ')\n\n';

            taskCounter += 1;
        });


        filename = filename.replace(/[^a-z0-9+]+/gi, '+');

        var blob = new Blob(['Meeting Date: ' + fileTime + '\n' + 'Preparer: ' + values.prep + '\n' + 'Attendees: ' + values.atten + '\n\n' + 'Notes: ' + values.notes + '\n\n\n' + values.allText], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename + '_' + fileTime + '.txt');


        console.log(
            'Meeting Date: ' + fileTime +
            '\nAttendees: ' + values.atten +
            '\n' + values.allText
        );
    });


});