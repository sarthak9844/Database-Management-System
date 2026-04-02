
function getReport() {
    const roll = document.getElementById("roll").value;

    fetch(`http://localhost:3000/report/${roll}`)
    .then(res => res.json())
    .then(data => {
        const percent = data[0].percentage.toFixed(2);

        document.getElementById("overall").innerHTML =
            "Overall: " + percent + "%";

        const ctx = document.getElementById("chart").getContext("2d");

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [percent, 100 - percent]
                }]
            }
        });
    });
}

function getSubject() {
    const roll = document.getElementById("roll").value;

    fetch(`http://localhost:3000/subject-report/${roll}`)
    .then(res => res.json())
    .then(data => {
        let html = "<h3>Subjects</h3>";
        data.forEach(d => {
            html += `<p>${d.subject_name}: ${d.percentage.toFixed(2)}%</p>`;
        });
        document.getElementById("subject").innerHTML = html;
    });
}

function getByDate() {
    const roll = document.getElementById("roll").value;
    const date = document.getElementById("date").value;

    fetch(`http://localhost:3000/by-date/${roll}/${date}`)
    .then(res => res.json())
    .then(data => {
        let html = "<h3>Date</h3>";
        data.forEach(d => {
            html += `<p>${d.subject_name}: ${d.status}</p>`;
        });
        document.getElementById("datewise").innerHTML = html;
    });
}
