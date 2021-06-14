const pool = require('../../config/database');

module.exports = {
    create : (data, callback) => {
        pool.query(
            `insert into iiserv_client_users(firstname, lastname, gender, email, password, mobilenumber)
            values(?,?,?,?,?,?)`,
            [
                data.first_name,
                data.last_name,
                data.gender,
                data.email,
                data.password,
                data.mobilenumber
            ],
            (error, results, fields) => {
                if(error) {
                   return callback(error);
                }
                return callback(null, results);
            }
        ); 
    },
    getUsers : (callback) => {
        pool.query(
                `SELECT id, firstname, lastname, gender, email, mobilenumber FROM iiserv_client_users`,
                [],
                (error, result) =>{
                    if(error) {
                        return callback(error);
                     }
                     return callback(null, result);
                }
        );
    }
}