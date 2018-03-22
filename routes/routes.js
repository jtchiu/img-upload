const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'hw4' });
var bodyParser = require('body-parser');
var multer = require('multer');
//var upload = multer({ dest: __dirname + '/public/uploads/' });
var fs = require('fs');
var url = require('url');
const storage = multer.memoryStorage()
const upload = multer({ storage })
var Blob = require('blob');

client.connect(function(err, result){
    console.log('Connected to Cassandra');

});

var router = function(app){
    app.get('/', (req, res) => {
        res.send('Hello World');
    });
    
    app.post('/', (req, res) => {
        res.send(req.body.filename);
    });

    app.post('/deposit', upload.single('contents'), (req, res) => {
        var filename = req.body.filename;
        var mimetype = req.file.mimetype;
        const cql_query = 'INSERT INTO imgs (filename, contents) VALUES (?, ?)';
        var contents = new Buffer(req.file.buffer, 'binary').toString('base64');
        const params = [filename, contents];
        client.execute(cql_query, params, (err, result) => {
            if(err){
                res.status(404).send({msg: err});
            }
            else {
                res.send('DEPOSIT SUCCESS');
            }
        });
    });

    app.get('/retrieve', (req, res) => {
        const cql_query  = 'SELECT * FROM imgs WHERE filename=?'
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var filename = req.query.filename;
        console.log(filename);
        const params = [filename];
        client.execute(cql_query, params, (err, result) => {
            if(!err) {
                if (result.rows.length > 0){
                    var image = result.first();
                    console.log('READ SUCCESSFUL');
                    response = new Buffer(image.contents, 'binary');
                    res.send(response);
                }
                else{
                    console.log('READ FAILED');
                }
            }
    
        });
    });
}

module.exports = router;
