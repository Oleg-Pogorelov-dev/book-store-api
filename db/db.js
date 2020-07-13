//connect db
const Sequelize = require("sequelize");

const db = new Sequelize('book_store', 'oleg', '12345678', {
    host: 'localhost',
    dialect: "postgres"
});

const User = db.define('user', {
    name: Sequelize.STRING,
}, {
    tableName: 'user'
})

db.sync({ force: true }).then(() => {
    User.create({
        name: 'admin',
    })
})

User.findAll({raw:true}).then(users => {
    console.log(users);
}).catch(err => console.log(err));

module.exports = {
    db,
    User,
}