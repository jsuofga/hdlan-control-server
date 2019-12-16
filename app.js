const express = require('express');
const formidable = require('formidable');
const path = require('path');
const app = express();
const cors = require('cors')

//
var alreadyConnected  = 0;

// Opens Web Pages from selected Browser
const open = require('open');

//Enable CORS
app.use(cors()) 

// File System
var fs = require('fs');

app.listen(3000, () => console.log('fileupdate app listening on port 3000!'));

app.use(express.static('public')); /* this line tells Express to use the public folder as our static folder from which we can serve static files*/

//Telnet-Client Setup
const Telnet = require('telnet-client')
var connection = new Telnet()
const ReadyCMD = 'Connected to Cisco'

// Cisco Switch Model

var switchModel = ''

 // Telnet Server Login Credentials  
 var params = {
  host: '192.168.1.254',
  port: 23,
  shellPrompt:/switch.*/,  //RegEx-Regular Expression Format. 
  loginPrompt: 'User Name:',
  passwordPrompt: 'Password:',
  username: 'cisco',
  password: 'sg300-octava',
  timeout: 10000,

 }
 
// Do when Cisco Connected
connection.on('ready', function(prompt) {

    console.log(ReadyCMD)
    alreadyConnected  = 1
    connection.setMaxListeners(40)  // Need to increase beyond default of 10
    
})

// Do when there is problem connecting to the Cisco Switch
connection.on('error', function(prompt) {
    console.log('ooops')
    alreadyConnected  = 0
    open('public/error.html');  // Show Error Page
    
})


//Connect to Telnet Server. 
ConnectToCisco()

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
        console.log('Uploaded ' + file.name);
    });

    res.sendFile(__dirname + '/index_update.html');

    return res.send("Upload Done!");

});

// PoE Power ---------------------------------------------------------------------------------------------------
app.get('/poe/:on_off', function(req,res){

       var on_off = req.params.on_off;
    var total_ports = 0;
    res.send('OK!');

    ConnectToCisco();

    //Read Switch Configuration
    fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
        if (err) throw err;
                  
       total_ports  = parseInt(JSON.parse(data).TXports) + parseInt(JSON.parse(data).RXports)
   
    })

    // SG350 switchport access
    if(on_off == 'on'){
        setTimeout(function(){connection.exec('config\rinterface range gi1-'+ total_ports +'\rpower inline auto'+'\r'), function(err,data) {
     
        }},500);

    }else if(on_off == 'off' ){
        setTimeout(function(){connection.exec('config\rinterface range gi1-'+ total_ports +'\rpower inline never'+'\r'), function(err,data) {
     
        }},500);


    }



})


// Switch ALL RX Route ---------------------------------------------------------------------------------------------------
app.get('/switchAll/vlan/:vlan', function(req,res){

   
    let vlan = req.params.vlan
    let startRX= 0; // RX should be connected to offset RX + offsetRX based on UserSwitchConfig.txt
    let lastRX = 0;  //  Port that the last RX is connected to

    res.send('OK!');

    ConnectToCisco();

    //Read Switch Configuration to determine which port RX is mapped to
    fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
        if (err) throw err;
       // res.send(data) //
            
        startRX = parseInt(JSON.parse(data).TXports) + 1
        lastRX = parseInt(JSON.parse(data).TXports) + parseInt(JSON.parse(data).RXports )
          
    })

    // SG350 switchport access

    setTimeout(function(){connection.exec('config\rinterface range gi'+startRX+'-'+ lastRX +'\rswitchport access vlan'+ vlan+'\r'), function(err,data) {
     
    }},500);

})

// Switch Single RX Route ---------------------------------------------------------------------------------------------------
app.get('/switchRX/:rx/vlan/:vlan', function (req,res){
  
    let rx = req.params.rx
    let vlan = req.params.vlan
    let offsetRX = 0; // RX should be connected to offset RX + offsetRX based on UserSwitchConfig.txt


    res.send('OK!');

    ConnectToCisco();

    //Read Switch Configuration to determine which port RX is mapped to
    fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
        if (err) throw err;
      // res.send(data) 
        
        offsetRX = parseInt(JSON.parse(data).TXports)
    
    })

    // SG350 switchport access
  
    setTimeout(function(){ connection.exec('config\rinterface range gi'+(parseInt(rx)+offsetRX)+'\rswitchport access vlan'+ vlan+'\r'), function(err, data) {
     
    }}, 500);

})

// API Switch ALL RX Route (for Customized Applications) ---------------------------------------------------------------------------------------------------
app.get('/switchAllCustom/start/:startPort/end/:endPort/vlan/:vlan', function(req,res){

    res.send('ALL RX Route')
    let start = req.params.startPort
    let end = req.params.endPort
    let vlan = req.params.vlan

    ConnectToCisco();

    // SG350 switchport access
    setTimeout(function(){connection.exec('config\rinterface range gi'+start+'-'+ end+'\rswitchport access vlan'+ vlan+'\r'), function(err,data) {
     
    }},500);

})

// API Switch Single RX Route(for Customization) ---------------------------------------------------------------------------------------------------
app.get('/switchRXCustom/gi/:gi/vlan/:vlan', function (req,res){

    res.send('Single RX Route')
  
    let gi = req.params.gi  //The interface port on Cisco Switch that the RX is connected to.
    let vlan = req.params.vlan
 
    ConnectToCisco();
   
    // SG350 switchport access
    setTimeout(function(){ connection.exec('config\rinterface gi'+parseInt(gi)+'\rswitchport access vlan'+ vlan+'\r'), function(err, data) {
     
    }}, 500);

})

// Switch Preset 1,2,3 Route ---------------------------------------------------------------------------------------------------
app.get('/switchRX/UserPreset/:preset', function (req,res){
 
    res.send('OK!');

    var UserSwitchConfig_Obj = JSON.parse(fs.readFileSync('public/UserSwitchConfig.txt',"utf8")) //synchronous
    var UserInputNames_Obj = JSON.parse(fs.readFileSync('public/UserInputNames.txt',"utf8")) //synchronous
    var UserFavorite_Obj = JSON.parse(fs.readFileSync("public/UserPreset" + req.params.preset + ".txt" ,"utf8")) //synchronous

   ConnectToCisco();

    setTimeout(function(){ 
        for(i=1;i<=48;i++){  // Find the index of TV that is declared as "empty. For example, if tv5 = 'empty' then ignore all rx >5 "

            if(UserInputNames_Obj['tv'+i] !='empty'){

               connection.exec('config\rinterface gi'+(parseInt(UserSwitchConfig_Obj['TXports'])+i)+'\rswitchport access vlan'+ ((parseInt(UserFavorite_Obj['tv'+i]))+1) +'\r')
                
            }else {
              // Do Nothing.
              //  break;
            }
        }
            
    }, 1000);
      

})

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
            ConnectToCisco()
        
    })
    }else{}
  

})
//---------------------------------------------------------------------------------------------------

function ConnectToCisco(){

    if (alreadyConnected == 0){
        fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
            if (err) {
                throw err;
            }
      
            params.host = JSON.parse(data).ip // Read the IP address from UserSwitchConfig.txt stored and set params.host
            connection.connect(params)
     
         })

    }else {
        //Kill currenty Connection , then re-connect
        connection.destroy().then(function(){
            
            fs.readFile('public/UserSwitchConfig.txt',"utf8", function (err, data) {
                if (err) {
                    throw err;
                }

                params.host = JSON.parse(data).ip // Read the IP address from UserSwitchConfig.txt stored and set params.host
                connection.connect(params)
                               
            })

        })

    }

}


  




