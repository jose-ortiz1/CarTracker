require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const connection = require('./connection');
const port = 3000;
const multer= require('multer');
const path = require('path');

//const fs = require('fs');
//const path = require('path');

const app = express();

const formatDate = (dateString) => {
    if (!dateString) return null; // Handle null dates
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extracts 'YYYY-MM-DD'
};

app.use(express.json());
app.use(cors());


// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });



app.get('/', (req, res) => {
    res.send('CarTrack Database Connected!');
})

//get all the users
app.get('/api/users', async (req, res) => {
    try{
        const [data] = await connection.promise().query('SELECT * FROM car_tracker.users');
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})

//ADD NEW USER
app.post('/api/signup', async (req, res) => {
    const {name, email, password, phone} = req.body;
    try{
        const [data] = await connection.promise().query(
            `INSERT INTO car_tracker.users (name, email, password, phone)
            VALUES (?,?,?,?)`, [name, email, password, phone]
        );
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})

//AUTHENTICATE EXISTING USER
app.post('/api/signin', async (req, res) => {
    const {email, password} = req.body;
    try{
        const [data] = await connection.promise().query(
            `SELECT * FROM car_tracker.users
            WHERE email =? AND password =?`, [email, password]
        );

        if(data.length === 0) return res.status(401).send('Invalid credentials');

        return res.json(data[0]);

    } catch(err){
        res.send('Error: ' + err);
    }
})


//GET ALL THE VEHICLES
app.get('/api/vehicles', async (req, res) => {
    try{
        const [data] = await connection.promise().query('SELECT * FROM car_tracker.vehicles');
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})

//get all the vehicles by User

app.get('/api/vehicles/:user_id', async (req, res) => {
    const user_id = req.params.user_id;
    try{
        const [data] = await connection.promise().query(
            `SELECT * 
            FROM car_tracker.vehicles
            WHERE user_id = ? `, user_id
        );
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})

//ADD NEW VEHICLE
app.post('/api/vehicles/', upload.single('photo'), async (req, res) => {
    const {user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchase_date, nickname  } = req.body;
    const photo_url = req.file ? req.file.filename : null;
    const purchaseDateFormatted = purchase_date ? purchase_date : null;

    try{
        const [data] = await connection.promise().query(
            `INSERT INTO 
            car_tracker.vehicles (user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchase_date, photo_url, nickname) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchaseDateFormatted, photo_url, nickname]
        );
        return res.json({ message: 'Vehicle added successfully', id: data.insertId });

    } catch(err){
        res.send('Error: ' + err);
    }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//UPDATE A VEHICLE
app.put('/api/vehicles/:vehicle_id', async (req, res) => {
    const vehicle_id = req.params.vehicle_id;
    let { user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchase_date, photo_url, nickname } = req.body;

    try {
        // Convert `purchase_date` to YYYY-MM-DD
        purchase_date = formatDate(purchase_date);
        const [result] = await connection.promise().query(
            `UPDATE car_tracker.vehicles 
            SET user_id = ?, vin_number = ?, make = ?, model = ?, year = ?, trim = ?, 
                engine = ?, transmission = ?, fuel_type = ?, mileage = ?, 
                purchase_date = ?, photo_url = ?, nickname = ?
            WHERE vehicle_id = ?`,
            [user_id, vin_number, make, model, year, trim, engine, transmission, fuel_type, mileage, purchase_date, photo_url, nickname, vehicle_id]
        );

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found or no changes made' });
        }

        res.json({ message: 'Vehicle updated successfully' });

    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'Database error while updating vehicle' });
    }
});

//DELETE A VEHICLE

app.delete('/api/vehicles/:vehicle_id', async (req, res) => {
    const vehicle_id = req.params.vehicle_id; 

    try{
        const [data] = await connection.promise().query(
            `DELETE 
            FROM car_tracker.vehicles 
            WHERE vehicle_id =?`,
            [vehicle_id]
        );

        if(data.affectedRows === 0) return res.status(404).send('Vehicle not found');

        return res.json({ message: 'Vehicle deleted successfully' });

    } catch(err){
        res.send('Error: ' + err);
    }
});


//GET SERVICE BY VEHICLE
app.get('/api/service_history/:vehicle_id', async (req, res) => {
    const vehicle_id = req.params.vehicle_id;
    try{
        const [data] = await connection.promise().query(`
            SELECT sh.*, st.service_type, st.icon_url 
            FROM car_tracker.service_history sh
            LEFT JOIN service_types st ON sh.service_type_id = st.service_type_id
            WHERE vehicle_id =? `, vehicle_id
        );
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
});

//add new service record
app.post('/api/service_history', async (req, res) => {
    const { vehicle_id, service_type_id, service_date, mileage, provider, cost, notes, receipt_url } = req.body;

    if (!vehicle_id || !service_type_id || !service_date || !mileage || !provider || !cost) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await connection.promise().query(
            `INSERT INTO car_tracker.service_history 
            (vehicle_id, service_type_id, service_date, mileage, provider, cost, notes, receipt_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehicle_id, service_type_id, service_date, mileage, provider, cost, notes, receipt_url]
        );

        res.status(201).json({ message: "Service history added successfully", service_id: result.insertId });

    } catch (error) {
        console.error("Error adding service history:", error);
        res.status(500).json({ message: "Failed to add service history" });
    }
});

//update service history by service id

app.put('/api/service_history/:service_id', async (req, res) => {
    const service_id = req.params.service_id;
    let { vehicle_id, service_type_id, service_date, mileage, provider, cost, notes, receipt_url } = req.body;
    
    if (!service_id) {
        return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
        service_date = service_date ? formatDate(service_date) : null;

        const [result] = await connection.promise().query(
            `UPDATE car_tracker.service_history 
             SET vehicle_id = ?, service_type_id = ?, service_date = ?, mileage = ?, provider = ?, cost = ?, notes = ?, receipt_url = ?
             WHERE service_id = ?`,
            [vehicle_id, service_type_id, service_date, mileage, provider, cost, notes, receipt_url, service_id]
        );

        console.log("Update successful:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service record not found or no changes made' });
        }
        res.json({ message: 'Service record updated successfully', updatedRows: result.affectedRows });

    } catch (error) {
        console.error('Error updating service record:', error);
        res.status(500).json({ error: 'Database error while updating service record' });
    }
});



//delete service history by service id

app.delete('/api/service_history/:service_id', async (req, res) => {
    const service_id = req.params.service_id;
    try {
        await connection.promise().query('DELETE FROM car_tracker.service_history WHERE service_id =?', [service_id]);
        res.status(204).send();

    } catch (error) {
        console.error('Error deleting service history:', error);
        res.status(500).json({ error: 'Database error while deleting service history' });
    }
});



//get all the reminders by User
app.get('/api/reminders', async (req, res) => {
    const user_id = req.params.user_id;
    try{
        const [data] = await connection.promise().query(`
            SELECT * 
            FROM car_tracker.reminders
            WHERE user_id =? `, user_id
        );
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})

//GET REMINDERS BY USER TO NOTIFCATION

app.get('/api/reminders/notifications/:user_id', async (req, res) => {
    const user_id = req.params.user_id;

    try {
    const [data] = await connection.promise().query(`
      SELECT r.*, st.service_type, st.icon_url, v.make, v.model, v.year
      FROM car_tracker.reminders r
      JOIN car_tracker.vehicles v ON r.vehicle_id = v.vehicle_id
      JOIN car_tracker.service_types st ON r.service_type_id = st.service_type_id
      WHERE v.user_id = ? AND r.due_date IS NOT NULL AND
        DATEDIFF(r.due_date, CURDATE()) <= 30
    `, [user_id]);

    return res.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch reminder notifications' });
  }
});

//Get all the reminders by vehicle
app.get('/api/reminders/:vehicle_id', async (req, res) => {
    const vehicle_id = req.params.vehicle_id;
    try{
        const [data] = await connection.promise().query(`
            SELECT r.reminder_id, r.vehicle_id, r.due_date, r.due_mileage, r.status, r.recurring, r.repeat_interval, r.service_type_id, 
                   st.service_type, st.icon_url 
            FROM car_tracker.reminders r
            LEFT JOIN car_tracker.service_types st 
                ON r.service_type_id = st.service_type_id
            WHERE r.vehicle_id = ? 
            ORDER BY r.due_date ASC`, [vehicle_id]
        );
        return res.json(data);

    } catch(error){
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Database error while fetching reminders' });
    }
})

//ADD NEW REMINDER

app.post('/api/reminders/', async (req, res) => {
    const {vehicle_id, service_type_id, due_date, due_mileage, status, recurring, repeat_interval } = req.body;

    try{
        const safeRepeatInterval = repeat_interval === '' ? null : repeat_interval;
        const [data] = await connection.promise().query(
            `INSERT INTO car_tracker.reminders 
            (vehicle_id, service_type_id, due_date, due_mileage, status,recurring, repeat_interval)
            VALUES (?,?,?,?,?,?,?)`,
            [vehicle_id, service_type_id, due_date && due_date !== '' ? due_date : null, due_mileage || null, status || null, recurring || null, safeRepeatInterval]
        );
        return res.json({ message: 'Reminder added successfully', id: data.insertId });

    } catch(error){
        console.error('Error adding reminder:', error);
        res.status(500).json({ error: 'Database error while adding reminder' });
    }
})

//UPDATE A REMINDER
app.put('/api/reminders/:reminder_id', async (req, res) => {
    const reminder_id = req.params.reminder_id;
    let {vehicle_id, service_type_id, due_date, due_mileage, status, recurring, repeat_interval } = req.body;
    
    console.log("Updating reminder with ID:", reminder_id);
    console.log("Request body:", req.body);

    if (!reminder_id) {
        return res.status(400).json({ error: 'Reminder ID is required' });
    }

    try {
        const safeRepeatInterval = repeat_interval === '' ? null : repeat_interval;
        const [data] = await connection.promise().query(
            `UPDATE car_tracker.reminders 
            SET vehicle_id = ?, service_type_id = ?, due_date = ?, due_mileage = ?, status = ?, recurring = ?, repeat_interval = ? 
            WHERE reminder_id = ?`,
            [ vehicle_id, service_type_id, due_date, due_mileage, status,recurring, safeRepeatInterval, reminder_id]
        );
        console.log("Update successful:", data);
        res.json({ message: 'Reminder updated successfully' });
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ error: 'Database error while updating reminder' });
    }

});

//DELETE A REMINDER

app.delete('/api/reminders/:reminder_id', async (req, res) => {
    const reminder_id = req.params.reminder_id; 

    try{
        const [data] = await connection.promise().query(
            `DELETE 
            FROM car_tracker.reminders 
            WHERE reminder_id =?`,
            [reminder_id]
        );

        if(data.affectedRows === 0) return res.status(404).send('Reminder not found');

        return res.json({ message: 'Reminder deleted successfully' });

    } catch(err){
        res.send('Error: ' + err);
    }
})






//DELETE A USER
app.delete('/api/users/:user_id', async (req, res) => {
    const user_id = req.params.user_id; 

    try{
        const [data] = await connection.promise().query(
            `DELETE 
            FROM car_tracker.users 
            WHERE user_id =?`,
            [user_id]
        );

        if(data.affectedRows === 0) return res.status(404).send('User not found');

        return res.json({ message: 'User deleted successfully' });

    } catch(err){
        res.send('Error: ' + err);
    }
})



//GET ALL SERVICE TYPES

app.get('/api/service_types/', async (req, res) => {
    try{
        const [data] = await connection.promise().query(
            `SELECT * 
            FROM car_tracker.service_types`
        );
        return res.json(data);

    } catch(err){
        res.send('Error: ' + err);
    }
})




app.listen(port,() => {
    console.log(`Server running on port ${port}`);
})