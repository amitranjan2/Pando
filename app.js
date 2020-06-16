	var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var xlsx= require("xlsx");
    const path = require('path');



    app.use(bodyParser.json());

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {



            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //multer settings
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter




                        if (['xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            // console.log(filename);
                            return callback(new Error(''));
                        }
                        callback(null, true);
                    }
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        // console.log(req.file.originalname);
        upload(req,res,function(err){
            // console.log(req.file);

            if(err){
                 res.json({error_code:1,err_desc:"Wrong Extension"});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }


            console.log(req.file.path);
            var wb=xlsx.readFile(req.file.path,{cellDates:true});
             var d=wb.Sheets.Sheet1;
                        var e=xlsx.utils.sheet_to_json(d);
                        console.log(e);
                        var data=e.map(function(record){

                        delete record.Sno;
                        delete record.Username;
                        delete record.Address;


                        return record;
                        });
                        console.log(data);
                        var nw=xlsx.utils.book_new();
                        var ns=xlsx.utils.json_to_sheet(data);
                        xlsx.utils.book_append_sheet(nw,ns,"s");




                         xlsx.writeFileSync(nw,path.join(__dirname,"Application",Date.now()+"result.xlsx"))


                        res.json({ data: e});

        })

    });

	app.get('/',function(req,res){
		res.sendFile(__dirname + "/index.html");
	});

    app.listen('3000', function(){
        console.log('running on 3000...');
    });
