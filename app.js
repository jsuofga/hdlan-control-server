const express = require('express');
const formidable = require('formidable');
const path = require('path');
const app = express();
const cors = require('cors')


// Opens Web Pages from selected Browser
const open = require('open');

//Enable CORS
app.use(cors()) 

// File System
var fs = require('fs');

app.listen(3000, () => {
    //console.log('fileupdate app listening on port 3000!');
});

app.use(express.static('public')); /* this line tells Express to use the public folder as our static folder from which we can serve static files*/


//Express Routes

app.get('/', function (req, res){
    // Update Index file  
  //   res.sendFile(path.join(__dirname + '/public/index.html'));
 
});

// Control Interface Update. User updates the 'UI' front-end interface here. 
app.get('/index_update', function (req, res){
    // Update Index file  
    res.sendFile(path.join(__dirname + '/public/index_update.html'));
});

app.post('/', function (req, res){
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
       
        file.path = __dirname + '/public/' + file.name;
    });

    form.on('file', function (name, file){
        //console.log('Uploaded ' + file.name);
    });

    res.sendFile(__dirname + '/index_update.html');

    return res.send("Upload Done!");

});


// Read User Stored Inputs Route. Send back JSON  -----------------------------------------------------------------------------------------------
app.get('/read/:userinput', function(req,res){

    let userinput = req.params.userinput
    if(userinput == 'UserSetting'){
        fs.readFile('public/UserSetting.txt',"utf8", function (err, data) {
            if (err) throw err;
            res.send(data)        
        })
        
    }else if(userinput == 'UserInputNames'){
        fs.readFile('public/UserInputNames.txt',"utf8", function (err, data) {
            if (err) throw err;
            res.send(data)        
        })

    }else if(userinput == 'UserPreset1'){
        
        fs.readFile('public/UserPreset1.txt', "utf8",function (err,data) {
            if (err) throw err;
            res.send(data) 
        });
    }else if(userinput == 'UserPreset2'){
        
        fs.readFile('public/UserPreset2.txt', "utf8",function (err,data) {
            if (err) throw err;
            res.send(data) 
        });

    }else if(userinput == 'UserPreset3'){
        
        fs.readFile('public/UserPreset3.txt', "utf8",function (err,data) {
            if (err) throw err;
            res.send(data) 
          });

    }else if(userinput == 'UserSwitchStatus'){
        fs.readFile('public/UserSwitchStatus.txt',"utf8", function (err, data) {
            if (err) throw err;
            res.send(data)        
        })
    }else if(userinput == 'UserSwitchConfig'){
        fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
            if (err) throw err;
            res.send(data) //
        
        })
    
    }else{}

})

// Write User Stored Inputs Route.  -----------------------------------------------------------------------------------------------
app.get('/write/:file/:dataIn', function(req,res){

    let userinput = req.params.file
    let dataIn = req.params.dataIn
    
    if(userinput == 'UserInputNames'){
        fs.writeFile('public/UserInputNames.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send('Updated InputNames')        
        })

    }else if(userinput == 'Preset1'){
        
        fs.writeFile('public/UserPreset1.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send(data)        
        })

    }else if(userinput == 'Preset2'){
        
        fs.writeFile('public/UserPreset2.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send(data)        
        })

    }else if(userinput == 'Preset3'){
        
        fs.writeFile('public/UserPreset3.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send(data)        
        })

    }else if(userinput == 'UserSwitchStatus'){
        fs.writeFile('public/UserSwitchStatus.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send('Updated SwitchStatus')        
        })
    }else if(userinput == 'UserSwitchConfig'){
        fs.writeFile('public/UserSwitchConfig.txt',dataIn, function (err, data) {
            if (err) throw err;
            res.send('Updated SwitchConfig') 
                    
    })
    }else{}
  

})





  




