const axios = require('axios')
const csv  = require('csvtojson')
const json2csv = require('json2csv')
const fs = require('fs')


const origin = [10.18990352, 11.66615844]

getService = (service, coordinates) => {

    var url =  'http://router.project-osrm.org/'+service+'/v1/driving/'+coordinates+'?geometries=geojson&overview=simplified'
    return axios.get(url, 
    res=>{
        return res
    })
}

getRouteGeoJson = (response,coordinates) => {
    var json = {
        'State' : response.State,
        'Zone': response.Zone,
        'LGA Ward': response['LGA Ward'],
        'HF Name': response['HF Name'],
        'Hthfa_code':response.Hthfa_code,
        'Latitude': response.Latitude,
        'Longitude': response.Longitude,
        'Drop': response.Drop,
        'distance': '',
        'duration': '',
        'geometry': ''
}
    return getService("route", coordinates)
    .then(data => {
        json['distance']= data.data.routes[0].distance,
        json['duration']= data.data.routes[0].duration,
        json['geometry']= data.data.routes[0].geometry 
        return data.data
    }).catch(err => {
        console.log('this error => ', err)
    })

}

        
convertToJson = (filepath) => {
    let obj =  csv({
        noheader: false            
    })
    .fromFile(filepath)
    .on('end_parsed', jsonObj=>{
        let start = null;
        let stop = null;
        var results = [];
        for (x in jsonObj){
                   
            if (jsonObj[x].Drop.substring(1,2) === '1' ){
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
            
            fs.writeFile("path.json", content, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
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
convertToJson('./paths.csv')
