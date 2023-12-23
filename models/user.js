const db = require('../util/database');

module.exports = class User {
    constructor(id, name, email){
        this.id = id;
        this.name = name;
        this.email = email;
    }

    save(){
        if (!this.id){
            return db.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
                this.name, 
                this.email
            ]);
        }
        return db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [
            this.name,
            this.email,
            this.id
        ]);
    }

    static findById(id){
        return db.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    }
} 