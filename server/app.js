//Main application setUp
const express = require('express');
require('dotenv').config();
const cors= require('cors');
const bodyParser = require('body-parser');
//External import
const loginRoutes=require('./routes/auth/loginRoute');
const NewsRouters=require('./CrudAPI/Activitise');
const EventsRouters=require('./CrudAPI/Event');
//configaration......
const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/auth',loginRoutes);
app.use('/api',NewsRouters,EventsRouters);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


