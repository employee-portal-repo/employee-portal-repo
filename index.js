var express =   require("express");
var multer  =   require('multer');
var app         =   express();
var fs = require("fs");
var pdfreader = require("pdfreader");

var listOfEmployees = [];
var employee;
var redundantData = false;
var headers = "false"

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname+'.pdf');
  }
});
var upload = multer({ storage : storage}).single('data');

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/pdf',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end(err.message);
        }
        fs.writeFile('parsedData.txt', "", (err)=>{
            if(err) throw err
          });
        
          
        fs.readFile("./uploads/data.pdf", (err, pdfBuffer) => {
            var pos = null;
            var startCell = 0;
            var firstFlag = false;
          // pdfBuffer contains the file content
          new pdfreader.PdfReader().parseBuffer(pdfBuffer, function(err, item) {
            
            if(item){
            if(item.text == "Consultant Availability Details"){
                headers = true;
              }
        
            if(!headers){
        
        
            if((pos == null  || item.x != pos)) {
        
              if(!firstFlag){
                startCell = item.x;
                firstFlag = true;
              }
              if(item.x <= startCell)
              {startCell = item.x;
                redundantData = false
                fs.appendFileSync('parsedData.txt', '\nNew Object')
              }
              pos = item.x;
              fs.appendFileSync('parsedData.txt', '\n')
            }
            if(item.text && checkFun(item.text) && !redundantData){
              if(item.text.includes("Primary Practice:")){
                fs.appendFileSync('parsedData.txt', item.x + "||" + item.text.split(',')[0])
                redundantData = true;
              }
              else {
                  fs.appendFileSync('parsedData.txt', item.x + "||" + item.text)
              }
            }
        
            }
        
            if(item.text == "Last Client (Rate)/Qualifications/Certifications"){
                  headers = false;
            }
	}
          });
        });
        
        function checkFun(data){
            var flag = true;
            var arr = ['Service Line:', '(', '[', ')', ']'];
            for(var i=0; i<5; i++){
                if(data.includes(arr[i])){
                    flag = false;
                    break;
                }
            }
            return flag;
            }
        res.end("File is uploaded");
    });
});

app.listen(80,function(){
    console.log("Working on port 80");
});