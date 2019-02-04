const axios = require('axios')
const csv  = require('csvtojson')
const json2csv = require('json2csv')
const fs = require('fs')
const {conf} = require('./conf');

// Please Fill Appropriately for desired results
let settlementObject = {
    nameOfFile: '',
    settlementLongitudeField: '',
    settlementLatitudeField: '',
    healthFacilityLongitudeField: '',
    healthFacilityLatitudeField: '',
    nameToSaveFileAs: ''
}


getService = (service, coordinates) => {

    var url =  'http://router.project-osrm.org/'+service+'/v1/driving/'+coordinates+'?geometries=geojson&overview=simplified'
    return axios.get(url, 
    res=>{
        return res
    })
}
/********************************************/
/*           Get Route Service              */
/********************************************/

getRouteGeoJson = (response,coordinates) => {

    return getService("route", coordinates)
    .then(data => {
        response['distance']= data.data.routes[0].distance || 0;
        response['duration']= data.data.routes[0].duration || 0;
        console.log(data.data.routes[0].distance);
        return response;
    }).catch(err => {
        return getRouteGeoJson(response, coordinates)        
     //   return response;
   //     console.log('this error => ', err)
    })

}


/********************************************/
/*  Get Distance and Duration Service       */
/********************************************/

convertToJsonDistance = (filepath) => {
    let obj =  csv({
        noheader: false            
    })
    .fromFile(filepath)
    .on('end_parsed', jsonObj=>{
        let start = null;
        let stop = null;
        var results = [];
        for (x in jsonObj){
            results.push(
                getRouteGeoJson(jsonObj[x],`${jsonObj[x][conf.settlementLongitudeField]},${jsonObj[x][conf.settlementLatitudeField]};${jsonObj[x][conf.healthFacilityLongitudeField]},${jsonObj[x][conf.healthFacilityLatitudeField]}`).then(data => {
            return data
           }))
          
        }
        Promise.all(results).then(response => {return response}).then(response => {
        var fields     
    //        console.log(response)
            var cc = json2csv({data: response, fields: fields});
            fs.writeFile(`${conf.nameToSaveFileAs}`, cc, function(err) {
            if (err) console.log(err);
            console.log('file saved');
            });
     //           console.log(data)
            })
      

    })
    return obj
}
        

console.log('run')
convertToJsonDistance(`./${conf.nameOfFile}`)
