const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const User = require("./models/user");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById(1)
    .then(([row, _]) => {
        const user = row[0];
        if (user){
            req.user = user;
        }
        else{
            console.log("No Admin User Found");
        }
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

User.findById(1)
.then(([row, _ ]) => {
    const user = row[0];
    if (!user){
        const adminUser = new User(null, "jeremy", 'test@test.com');
        adminUser.save(); 
    }
    app.listen(3000);
})
.catch(err => console.log(err));

