function onlyUnique(value, index, self) { return self.indexOf(value) === index; }
function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) { arr.splice(index, 1); }
    return arr;
  }
  
let gAqiData = loadMnAqiData().map((d) => ({date: d3.timeParse("%m/%d/%Y")(d.Date), aqi: parseFloat(d.DAILY_AQI_VALUE), siteName: d['Site Name'] }));
let gSiteNames = gAqiData.map((d) => d.siteName).filter(onlyUnique);
let gSelectedSite = 'Near Road I-35/I-94';
let gSvg = null;
let gXAxis = null;
let gYAxis = null;
let gSceneNbr = 1;

function getSiteData() {
    return gAqiData.filter((d) => d.siteName == gSelectedSite);
}
function getSiteDataBetween(start, end) {
    return gAqiData.filter((d) => d.siteName == gSelectedSite && d.date >= start && d.date <= end);
}

function init() {
    gSiteNames.sort();
    // Remove incomplete data sets
    removeItem(gSiteNames, 'Andersen Windows South');
    removeItem(gSiteNames, 'Andersen Windows North');
    removeItem(gSiteNames, 'Bottineau / Marshall Terrace');
    removeItem(gSiteNames, 'Great River Bluffs');
    removeItem(gSiteNames, 'Ramsey Health Center');
    removeItem(gSiteNames, 'St. Louis Park City Hall');
    removeItem(gSiteNames, 'Voyageurs NP - Sullivan Bay');

    gAqiData.sort((a, b) => a.date - b.date);

    d3.selectAll('.site-select select')
        .each(function(ignored, idx) {
            let sceneNbr = idx + 1;

            d3.select(this)
            .selectAll('option')
            .data(gSiteNames)
            .enter()
            .append('option')
            .attr('value', (n) => n)
            .text((n) => n)
            .each(function(n) {
                if (n == gSelectedSite) {
                    d3.select(this).attr('selected', true);
                }
            });
        });

    // d3.select('#dataSiteName')
    //     .selectAll('option')
    //     .data(gSiteNames)
    //     .enter()
    //     .append('option')
    //     .attr('value', (n) => n)
    //     .text((n) => n)
    //     .each(function(n) {
    //         if (n == gSelectedSite) {
    //             d3.select(this).attr('selected', true);
    //         }
    //     });

    // const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    // const width = 800 - margin.right - margin.left;
    // const height = 400 - margin.top - margin.bottom;
    // const maxAqi = 180;

    // gSvg = d3.select('#vizLine')
    //     .append('svg')
    //     .attr('width', width + margin.right + margin.left)
    //     .attr('height', height + margin.top + margin.bottom)
    //     .append('g')
    //     .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // let data = getSiteData();

    // // Add X axis --> it is a date format
    // gXAxis = d3.scaleTime()
    //     .domain(d3.extent(data, function(d) { return d.date; }))
    //     .range([ 0, width ]);
    // gSvg.append("g")
    //     .attr("transform", `translate(0, ${height})`)
    //     .call(d3.axisBottom(gXAxis));

    // // Add Y axis
    // gYAxis = d3.scaleLinear()
    //     .domain([0, maxAqi])
    //     .range([ height, 0 ]);
    // gSvg.append("g")
    //     .call(d3.axisLeft(gYAxis));

    // // Add the line
    // gSvg.append("path")
    //     .datum(data)
    //     .attr("class", "line-path")
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", d3.line()
    //         .x(function(d) { return gXAxis(d.date) })
    //         .y(function(d) { return gYAxis(d.aqi) })
    //     );
}

function dataSiteChanged() {
    gSvg.select("path.line-path").remove();
    gSelectedSite = d3.select('#dataSiteName').property('value');

    let data = getSiteData();
    gSvg.append("path")
        .datum(data)
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return gXAxis(d.date) })
            .y(function(d) { return gYAxis(d.aqi) })
        );
}

function showScene(nbr) {
    gSceneNbr = nbr;
    d3.selectAll('.scene').classed('hidden', true);
    d3.select(`#scene${nbr}`).classed('hidden', false);

    refreshData();
}

function refreshData() {
    gSelectedSite = 'Near Road I-35/I-94';
    if (gSceneNbr != 1) {
        gSelectedSite = d3.select(`#s${gSceneNbr}site`).property('value');
    }

    switch (gSceneNbr) {
        case 1:
            // Intro, no data
            break;
        case 2:
            // COVID-19
            var july4dy=-20;
            if(gSelectedSite=="Andersen School"){
                july4dy=20;
            }

            showGraph('s2g2020', dt(2020, 2, 1), dt(2020, 7, 31), { maxAqi: 'auto', minAqi: 150,height: 450, annotate: [
                { date:dt(2020, 3, 15), dy: -120, label: "Start of COVID-19 lockdowns. The AQI was 32 on 3/15/2020." }, 
                { date:dt(2020, 7, 4), dx: 10, dy: july4dy, label: "After July 4th Fireworks, the AQI spiked to 156 report by Andersen school station on 7/4/2020." },
                { date:dt(2020, 5, 25), dx: 10, dy: -120, label: "George Floyd riots & protests in Minnesota 5/25 to 6/10."},
                { date:dt(2020, 6, 17), dx: 10, dy: -200, label: "George Floyd riots & protests in Minnesota 5/25 to 6/10."}
            ] });
            //showGraph('s2g2019', dt(2019, 2, 1), dt(2019, 7, 31), { maxAqi: 100, height: 350 });
            //showGraph('s2g2018', dt(2018, 2, 1), dt(2018, 7, 31), { maxAqi: 100, height: 350 });
            break;
        case 3:
            // July 4
            var july4dy=10;
            if(gSelectedSite=="Andersen School"){
                july4dy=25;
            }

            showGraph('s3g2021', dt(2021, 6, 30), dt(2021, 7, 8), {maxAqi: 'auto', minAqi: 150, height: 250, annotate:[
                { date:dt(2021, 7, 4), dy: -9, label: "July 4th landed on a Sunday. AQI was at 52, MODERATE level of concern. My speculation is that this is due to lack to firework supplies as not all cities were able to do fireworks." }, 
                { date:dt(2021, 7, 3), dx: -20, dy: -20, label: "Highest reported AQI was at 63 by the Grand Portage Band station on July 3rd." }
            ] 
        });

            showGraph('s3g2020', dt(2020, 6, 30), dt(2020, 7, 8), { maxAqi: 'auto', minAqi: 150, height: 250, annotate:[
                { date:dt(2020, 7, 4), dy: july4dy, label: "July 4th landed on a Saturday. Highest AQI was 152, reported by Andersen School. UNHEALTHY level of concern." }, 
            ] 
        
        
        
        });

            //showGraph('s3g2019', dt(2019, 6, 30), dt(2019, 7, 8), { maxAqi: 'auto', minAqi: 150, height: 250 });
            //showGraph('s3g2018', dt(2018, 6, 30), dt(2018, 7, 8), { maxAqi: 'auto', minAqi: 150, height: 250 });
            break;
        case 4:
            // Wildfires
            showGraph('s4g2021', dt(2021, 6, 1), dt(2021, 7, 31), {maxAqi: 'auto', minAqi: 150, height: 500, annotate:[
                { date:dt(2021, 7, 29),dx:-10, dy: 20, label: "AQI reached a level of 155 as reported by the station near I-35/I-94" }, 
                { date:dt(2021, 7, 20),dx:-10, dy: 20, label: "AQI reached a level of 251 reported by Leech Lake Nation station. VERY UNHEALTHY Air." }, 
            ] 
        });
            // showGraph('s4g2020', dt(2020, 6, 1), dt(2020, 7, 29));
            // showGraph('s4g2019', dt(2019, 6, 1), dt(2019, 7, 29));
            // showGraph('s4g2018', dt(2018, 6, 1), dt(2018, 7, 29));
            break;
        default:
            // Final scene
            //dx:50, dy:60 - Ben Franklin
            //Default : dx:10, dy:-100
            var bendx=10;
            var bendy=-100
            if(gSelectedSite=="Ben Franklin School"){
                bendx=50;
                bendy=-100;
            }

            showGraph('s5g2021', dt(2021, 1, 1), dt(2021, 12, 31), {maxAqi: 'auto', minAqi: 150, height: 250, annotate:[
                { date:dt(2021, 5, 31),bendx, bendy, label: "AQI reached a level of 165 as reported by the station Ben Franklin School. VERY UNHEALTHY Air." }, 
            ]        
            });
            showGraph('s5g2020', dt(2020, 1, 1), dt(2020, 12, 31), { maxAqi: 'auto', minAqi: 150, height: 250, annotate:[
                    { date:dt(2020, 7, 4), dy: 25, label: "Highest AQI was 152, reported by Andersen School. UNHEALTHY level of concern." }, 
                ]                 
            });
            showGraph('s5g2019', dt(2019, 1, 1), dt(2019, 12, 31), { maxAqi: 'auto', minAqi: 150, height: 250, annotate:[
                { date:dt(2019, 12, 13), dy: -10, label: "Highest AQI was 94, reported by Andersen School. MODERATE level of concern." }, 
            ]                 
            });
            //showGraph('s5g2018', dt(2018, 1, 1), dt(2018, 12, 31));
            break;
    }
}

function showGraph(id, start, end, opts) {
    // Clear everything
    d3.select(`#${id}`).html('');

    let data = getSiteDataBetween(start, end);

    // This allows to find the closest X index of the mouse:
    let bisect = d3.bisector(function(d) { return d.date; }).left; 
    
    if (opts == null) { opts = {}; }
    if (opts.height == null) { opts.height = 400; }
    if (opts.maxAqi == null) { opts.maxAqi = 150; }
    if (opts.maxAqi == 'auto') { opts.maxAqi = d3.max(data.map((d) => d.aqi)); }
    if (opts.minAqi != null && opts.maxAqi < opts.minAqi ) { opts.maxAqi = opts.minAqi; }

    const margin = { top: 10, right: 150, bottom: 30, left: 60 };
    const width = 1000 - margin.right - margin.left;
    const height = opts.height - margin.top - margin.bottom;
    const maxAqi = opts.maxAqi;

    let svg = d3.select(`#${id}`)
        .append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Add X axis --> it is a date format
    let x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    let y = d3.scaleLinear()
        .domain([0, maxAqi])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.aqi) })
        );
    
    if (opts.annotate != null) {
        for (let i=0; i < opts.annotate.length; i++) {
            let a = opts.annotate[i];

            if (a.dx == null) a.dx = 2;
            if (a.dy == null) a.dy = -40;

            // ==== RIGHT ====== //
            const annotationsRight = [
                {
                note: {
                    label: a.label
                    //title: ""
                },
                connector: {
                    end: "dot",        // none, or arrow or dot
                    type: "line",       // Line or curve
                    //points: 3,           // Number of break in the curve
                    lineType : "horizontal"
                },
                color: ["red"],
                x: x(a.date),
                y: y(data[bisect(data, a.date)].aqi),
                dy: a.dy,
                dx: a.dx
                }
            ]

            
            
            // Add annotation to the chart
            const makeAnnotationsRight = d3.annotation()
                .annotations(annotationsRight);

            //d3.select("#example3")
            svg
                .append("g")
                .call(makeAnnotationsRight);
        }
            
        // // ==== CHANGE STYLE ATTRIBUTE ====== //
        // d3.select("#example3").selectAll(".connector")
        //     .attr('stroke', "blue")
        //     .style("stroke-dasharray", ("3, 3"))
        // d3.select("#example3").selectAll(".connector-end")
        //     .attr('stroke', "blue")
        //     .attr('fill', "blue")
    }


    // Create the circle that travels along the curve of chart
    let focus = svg
    .append('g')
    .append('circle')
        .style("fill", "red")
        .attr("stroke", "black")
        .attr('r', 4)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    let focusText = svg
    .append('g')
    .append('text')
        .style("opacity", 20)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .attr("class", "tooltip")

    // What happens when the mouse move -> show the annotations at the right positions.
    let mouseover = function() {
        focus.style("opacity", 1)
        focusText.style("opacity",1)
    };

    let mousemove = function() {
        // recover coordinate we need
        let x0 = x.invert(d3.mouse(this)[0]);
        let i = bisect(data, x0);
        selectedData = data[i]

        if ( selectedData != null) {
            focus
                .attr("cx", x(selectedData.date))
                .attr("cy", y(selectedData.aqi));
            focusText
                .text(
                    "AQI: " + selectedData.aqi + " on " +
                    + (selectedData.date.getMonth()+1) + "/" + selectedData.date.getDate() + "/" + selectedData.date.getFullYear() 
                    )
                .attr("x", x(selectedData.date)+15)
                .attr("y", y(selectedData.aqi));
        }
    };

    let mouseout = function() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    };

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
}

function dt(year, month, day) {
    return new Date(year, month - 1, day);
}


