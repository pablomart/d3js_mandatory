import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { comunidad, covid_comunidades_autonomas_april, covid_comunidades_autonomas_november } from "./covid_comunidades_autonomas";


const aProjection = d3Composite.geoConicConformalSpain();

const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

aProjection.fitSize([1024, 800], geojson);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // use geoPath to convert the data into the current projection
  // https://stackoverflow.com/questions/35892627/d3-map-d-attribute
  .attr("d", geoPath as any);


svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", (d) => 20)
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);


const updateChart = (covid_cca: comunidad[]) => {
  
  let maxAffected = covid_cca.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );

  let affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([0, 50]); // 50 pixel max radius, we could calculate it relative to width and height

  let calculateRadiusBasedOnAffectedCases = (comunidad: string, covid_cca: comunidad[]) => {
    const entry = covid_cca.find((item) => item.name === comunidad);
  
    return entry ? affectedRadiusScale(entry.value) : 0;
  };

  return svg
  .selectAll("circle")
  .data(latLongCommunities)
  .transition()
  .duration(500)
  .attr("class", "affected-marker")
  .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, covid_cca))
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);
} 

document.getElementById('april').addEventListener('click', () => {
  updateChart(covid_comunidades_autonomas_april);
});

document.getElementById('november').addEventListener('click', () => {
  updateChart(covid_comunidades_autonomas_november);
});