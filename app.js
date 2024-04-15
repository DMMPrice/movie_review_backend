const express = require('express');

const userRouter = require('./routes/user');
const connectDatabase = require('./utils/connectDatabase');
const app = express();
app.use(express.json());

connectDatabase();
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
    res.send('Server is running');
})

app.listen(8000, () => {
    console.log("Server started on port 8000");
});