const { genSaltSync, hashSync } = require('bcrypt');
const {create,getUsers} = require('./user.service');

module.exports = {
    createUser : (req,res) => {
        const body = req.body;
        console.log(body);
        const salt = genSaltSync(10);
        console.log(body.fisrt_name);
        console.log(body.password);
         body.password=hashSync(body.password,salt);
         create( body,(error,result) => {
             if(error) {
                 return res.status(500).json({
                     success:0,
                     mesage: 'DB connection error'+error
                 })
             }else{
                 return res.status(500).json({
                    success:1,
                    data:result
                 });
             }
         })

    },
    getAllUsers: (req, res) => {
        const body = req.body;
        getUsers( (error, result) => {
            if(error) {
                return res.status(500).json({
                    success:0,
                    mesage: 'DB connection error'+error
                })
            }else{
                return res.status(500).json({
                   success:1,
                   data:result
                });
            }
        }
        )
    }
};