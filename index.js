require( 'dotenv' ).config();
let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    crypto = require('crypto'),
    xlsxtojson = require('xlsx-to-json'),
    xlstojson = require("xls-to-json"),
    request = require('request-promise');
    fs = require('fs');


var api = process.env.API;
var port = parseInt(process.env.PORT) || 3000;
var path = "output/"+"modified"+Date.now()+".json"
var data;

let fileExtension = require('file-extension');

app.use(bodyParser.json());  

let storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + fileExtension(file.mimetype));
            });
    }
});

let upload = multer({storage: storage}).single('file');

app.post('/sendFile', function(req, res) {
    let excel2json;
    upload(req,res,function(err){
        if(err){
                res.json({error_code:401,err_desc:err});
                return;
        }
        if(!req.file){
            res.json({error_code:404,err_desc:"File not found!"});
            return;
        }

        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            excel2json = xlsxtojson;
        } else {
            excel2json = xlstojson;
        }

        excel2json({
            input: req.file.path,  
            output: "output/"+Date.now()+".json",
            lowerCaseHeaders:true
        }, function(err, result) {
            if(err) {
                res.json(err);
            } else {
                let dataholder = JSON.stringify(result).split('"Unternehmen":').join('"Firma":').split('"Vorname":').join('"Name":').split('"E-Mail":').join('"Mail":').split('"Position in der Firma":').join('"Abteilung":').split('"Stadt":').join('"Ort":');
                data = JSON.parse(dataholder)
                data.forEach(element => {
                    if(element.Nachname !== "" && element.Name !== ""){
                        element.Name = element.Name + " " + element.Nachname;
                        delete element.Nachname;
                    }
                });
                console.log(data)
                fs.writeFile(path, JSON.stringify(data), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON data is saved.");
                });
                // Postalservice(data).then((response)=>{
                //     res.json(data);
                // })
                
            }
        });

    })

});
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.listen(port, function(){
    console.log("Server running on port " + port);
});



function Postalservice(bodydata){
    try{
      return new Promise((resolve, reject) => {
        
        const options = {
            method: 'POST',
            uri: api,
            body: JSON.stringify(bodydata),
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'TokenMeTokenYouTokenAllOfUs'
            }
        }

        request(options).then(function (response){
            if(response !== ""){
                resolve(response);
            }
        })
        .catch(err =>{console.log(err)})
        })
    }
    catch (err){
      console.log(err)
    }
  
  }