import React, { useEffect, useState } from 'react';
import './App.css';
import 
{
  MenuItem,
  Select,
  Card,
  CardContent,
} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData} from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import {prettyPrintStat} from './util'


function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    });
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then(response => response.json())
      .then(data => {
        const countries = data.map(country => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      })
    };

    getCountriesData();
  },[])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? "https://disease.sh/v3/covid-19/all" : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  }

  return (
    <div className="app">
      <div className='app__left'>
      <div className='app__header'>
        <h1>COVID-19 TRACKER</h1>
        <formControl className='app__dropdown'>
          <Select
            variant='outlined'
            value={country}
            onChange = {onCountryChange}
          >
            <MenuItem value='worldwide'>worldwide</MenuItem>
            {
              countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }
          </Select>
        </formControl>
      </div>
      
      <div className='app__stats'>
          <InfoBox 
          isRed
          active={casesType === 'cases'}
          onClick = {e => setCasesType('cases')}
          title="Coronavirus Cases"
          total={prettyPrintStat(countryInfo.cases)}
          cases={prettyPrintStat(countryInfo.todayCases)}
          />
          <InfoBox 
          active={casesType === 'recovered'}
          onClick = {e => setCasesType('recovered')}
          title="Recovered" 
          total={prettyPrintStat(countryInfo.recovered)}
          cases={prettyPrintStat(countryInfo.todayRecovered)}
          />
          <InfoBox 
          isRed
          active={casesType === 'deaths'}
          onClick = {e => setCasesType('deaths')}
          title="Deaths" 
          total={prettyPrintStat(countryInfo.deaths)}
          cases={prettyPrintStat(countryInfo.todayDeaths)}
          />
      </div>
      <Map casesType={casesType} countries = {mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className='app__right'>
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          <h3 className='app__graphTitle'>Wordwide new {casesType}</h3>
          <LineGraph className='app__graph' casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
