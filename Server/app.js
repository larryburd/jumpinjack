var fs      = 	require('fs'),
    express = 	require('express'),
    path    =   require('path');
const index = path.join(__dirname, '../Client/TF_Train');
  
// Create a new Express application.
var app = express();

app.use(express.static(index));

app.get('/', (req, res) => {
    res.sendFile(path.join(index, '/src/tfTrain.html'));
});

module.exports = app;