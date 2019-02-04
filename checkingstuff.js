const axios = require('axios')
const csv  = require('csvtojson')
const json2csv = require('json2csv')
const fs = require('fs')

// longitude and latitude
const origin = [9.83085, 10.3202]

getService = (service, coordinates) => {

    var url =  'http://router.project-osrm.org/'+service+'/v1/driving/'+coordinates+'?geometries=geojson&overview=simplified'
    return axios.get(url, 
    res=>{
        return res
    })
}

getRouteGeoJson = (response,coordinates) => {

    return getService("route", coordinates)
    .then(data => {  
        response['distance']= data.data.routes[0].distance || 0;
        response['duration']= data.data.routes[0].duration || 0;
        return response
    }).catch(err => {
        console.log('this error => ', err)
    })

}

        
convertToJson = (filepath) => {
    let obj =  csv({
        noheader: false            
    })
    .fromFile(filepath)
    .on('end_parsed', jsonObj => {
        let start = null;
        let stop = null;
        var results = [];






        










        for (x in jsonObj){
                   
            if (jsonObj[x].Drop === '1' ){
                start = origin
                stop = [jsonObj[x].Longitude, jsonObj[x].Latitude]
            } else {
                start = stop
                stop = [jsonObj[x].Longitude, jsonObj[x].Latitude]
            }

           results.push(getRouteGeoJson(jsonObj[x],`${start[0]},${start[1]};${stop[0]},${stop[1]}`).then(data => {
            return data
           }))
          
        }
        Promise.all(results).then(response => {return response}).then(response => {
    
    
            const content = JSON.stringify(response);
            
            var fields = ['Date', 'Driver',	'Drop',	'Kilometer',	'State',	'LGA',	'Ward',	'HF Name', 'Latitude',	'Longitude', 'distance', 'duration']  
            
            // fs.writeFile("path.json", content, 'utf8', function (err) {
            //     if (err) {
            //         return console.log(err);
            //     }
            
            //     console.log("The file was saved!");
            // });
    
            var cc = json2csv({data: response, fields: fields});
            fs.writeFile('file.csv', cc, function(err) {
            if (err) console.log(err);
            console.log('file saved');
            });
    
            //     var fields  =['State','Zone','LGA Ward','HF Name','Hthfa_code','Latitude','Longitude','Drop','distance', 'duration', 'geometry'] 
        //     console.log(response)
        //     var cc = json2csv({data: response, fields: fields});
        // fs.writeFile('file.csv', cc, function(err) {
        // if (err) console.log(err);
        // console.log('file saved');
        // });
           // console.log(data)
        })
      

    })
    return obj
}
console.log('run')
convertToJson('./Bauchi-vdd.csv')
