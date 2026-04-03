const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* =========================
   GET ALL STUDENTS
========================= */
app.get('/students', (req, res) => {
    db.query('SELECT roll_no, name FROM Student ORDER BY roll_no', (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});

/* =========================
   ADD ATTENDANCE
========================= */
app.post('/attendance', (req, res) => {

    const { subject_id, date, attendance } = req.body;

    const day = new Date(date).getDay();

    if (day === 0 || day === 6) {
        return res.send("Holiday - Cannot mark attendance");
    }

    const query1 = "INSERT INTO Attendance (subject_id, date) VALUES (?, ?)";

    db.query(query1, [subject_id, date], (err, result) => {
        if (err) return res.send(err);

        const attendance_id = result.insertId;

        const values = attendance.map(a => [attendance_id, a.roll_no, a.status]);

        const query2 = "INSERT INTO Attendance_Detail (attendance_id, roll_no, status) VALUES ?";

        db.query(query2, [values], (err2) => {
            if (err2) return res.send(err2);

            res.send("Attendance Saved Successfully");
        });
    });
});

/* =========================
   GET OVERALL ATTENDANCE %
========================= */
app.get('/report/:roll_no', (req, res) => {
    const roll_no = req.params.roll_no;

    const query = `
        SELECT 
            s.roll_no,
            s.name,
            COUNT(CASE WHEN ad.status='P' THEN 1 END)*100.0/COUNT(*) AS percentage
        FROM Student s
        JOIN Attendance_Detail ad ON s.roll_no = ad.roll_no
        WHERE s.roll_no = ?
        GROUP BY s.roll_no
    `;

    db.query(query, [roll_no], (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});

/* =========================
   SUBJECT-WISE REPORT
========================= */
app.get('/subject-report/:roll_no', (req, res) => {
    const roll = req.params.roll_no;

    const query = `
        SELECT sub.subject_name,
        COUNT(CASE WHEN ad.status='P' THEN 1 END)*100.0/COUNT(*) AS percentage
        FROM Attendance_Detail ad
        JOIN Attendance a ON ad.attendance_id = a.attendance_id
        JOIN Subject sub ON a.subject_id = sub.subject_id
        WHERE ad.roll_no = ?
        GROUP BY sub.subject_name
    `;

    db.query(query, [roll], (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});

/* =========================
   DATE-WISE ATTENDANCE
========================= */
app.get('/by-date/:roll/:date', (req, res) => {
    const { roll, date } = req.params;

    const dayName = new Date(date).toLocaleString('en-US', { weekday: 'long' });

    const query = `
        SELECT 
            sub.subject_name,
            COALESCE(ad.status, 'Not Marked') AS status
        FROM Timetable t
        JOIN Subject sub ON t.subject_id = sub.subject_id
        LEFT JOIN Attendance a 
            ON a.subject_id = t.subject_id AND a.date = ?
        LEFT JOIN Attendance_Detail ad 
            ON ad.attendance_id = a.attendance_id AND ad.roll_no = ?
        WHERE t.day = ?
    `;

    db.query(query, [date, roll, dayName], (err, result) => {
        if (err) return res.send(err);

        // Weekend check
        if (dayName === 'Saturday' || dayName === 'Sunday') {
            return res.json([{ subject_name: "Holiday", status: "No Classes" }]);
        }

        res.json(result);
    });
});
/* =========================
   LOGIN API
========================= */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM Users WHERE username=? AND password=?";

    db.query(query, [username, password], (err, result) => {
        if (err) return res.send(err);

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json({ message: "Invalid" });
        }
    });
});

/* =========================
   ROOT
========================= */
app.get('/', (req, res) => {
    res.send('Server Running');
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
    console.log('Server running on port 3000');
});