let gCurrentCategory = 'SmartDisplays';
const pieHeight = 500;
const pieWidth = 500;
const pieRadius = 250;
const widthPadding = 0;
const heighPadding = 0;
const legendDotRadius = 10;
let gSVGarea = d3
	.select("#donutChart")
	.append("svg")
	.attr("width", pieWidth + widthPadding)
	.attr("height", pieHeight + heighPadding);
let gPieArea = gSVGarea.append("g").attr("transform", `translate(${pieWidth / 2}, ${(pieHeight + heighPadding) / 2})`);
let gInfoArea = gSVGarea.append("g").attr("transform", `translate(500, 0)`);

const gArc = d3
	.arc()
	.innerRadius(pieRadius - 100)
	.outerRadius(pieRadius - 20);

const gOuterArc = d3
	.arc()
	.innerRadius(pieRadius + 10)
	.outerRadius(pieRadius + 10);

const gPie = d3
	.pie()
	.value((d) => d.cost)
	.sort(null);

function gColors(i) {
	switch (i) {
		case 0:
			return "#092b3b";
		case 2:
			return "#042e07";
		case 6:
			return "#ed5311";
		case 10:
			return "#0b4744";
		case 11:
			return "#c7c400";
		default:
			return d3.schemePaired[i];
	}
}

async function init() {
	d3.selectAll(".categoryButton").attr("disabled", true);
	gData = await fetchDataFromWeb();
	d3.selectAll(".categoryButton").attr("disabled", false);
	gCurrentCategory = 'SmartDisplays';

	gPieArea
		.selectAll("path")
		.data(gPie(getCostDataByCategory()))
		.enter()
		.append("path")
		.attr("class", "piePath")
		.attr("id", (d) => `${d.data.name}_path`)
		.attr("fill", (_d, i) => gColors(i))
		.attr("opacity", "0.8")
		.attr("d", gArc)
		.each((d) => (this._current = d))
		.attr("stroke-width", "2px")
		.on("mouseover", handlePiePieceHover)
		.on("mouseout", () => handlePiePieceLeave(false));
	const legendArea = gPieArea
		.selectAll(".legend")
		.data(CATEGORY_CONST)
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", (d, i) => {
			var height = legendDotRadius * 2 + 4;
			var offset = (height * CATEGORY_CONST.length) / 4;
			var horz = -2 * legendDotRadius * 3;
			var vert = (i % 6) * height - offset;
			return "translate(" + ((i / 6 < 1 ? horz : -1 * horz) - 40) + "," + vert + ")";
		});
	legendArea
		.append("circle")
		.attr("id", (d) => `${d}_legend`)
		.attr("r", legendDotRadius)
		.style("fill", (_d, i) => gColors(i))
		.attr("opacity", "0.8")
		.style("stroke", (_d, i) => gColors(i))
		.on("mouseover", handlePiePieceHover)
		.on("mouseout", () => handlePiePieceLeave(false));
	legendArea
		.append("text") // NEW
		.attr("x", legendDotRadius + 2) // NEW
		.attr("y", legendDotRadius - 2) // NEW
		.text((d) => d);

	changeCategory('SmartDisplays');
}

function updatePie() {
	d3.select("#donutChart")
		.selectAll("path")
		.data(gPie(getCostDataByCategory()))
		.transition()
		.duration(500)
		.attrTween("d", arcTween)
		.attr("id", (d) => `${d.data.name}_path`);
}

function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return gArc(i(t));
	};
}

function handlePiePieceLeave(toAnother) {
	if (gCurrentHighlightGenre) {
		d3.select(`[id='${gCurrentHighlightCategory}_legend']`).attr("opacity", "0.8");
		d3.select(`[id='${gCurrentHighlightCategory}_path']`).attr("opacity", "0.8");
	}
	d3.select("#posterCard").html("");
	if (toAnother) {
		d3.select("#donutInfoGeneral").html("");
		d3.select("#donutInfoProduct").html("");
	} else {
		d3.select("#donutInfoGeneral").html("Please hover over a section to see more details.");
		d3.select("#donutInfoProduct").html("Please hover over a section to see more details.");
	}
}

function handlePiePieceHover(_d, i) {
	handlePiePieceLeave(true);
	gCurrentHighlightCategory = CATEGORY_CONST[i];
	const costData = getCostDataByCategory()[i];
	d3.select(`[id='${gCurrentHighlightCategory}_legend']`).attr("opacity", "1");
	d3.select(`[id='${gCurrentHighlightCategory}_path']`).attr("opacity", "1");
	d3.select("#donutInfoGeneral")
		.append("ul")
		.style("list-style-type", "none")
		.selectAll("li")
		.data([{ name: "name", displayName: "Category" }, { name: "cost", displayName: "Cost" }])
		.enter()
		.append("li")
		.html((d) => {
			return d.displayName + ": " + costData[d.name];
		});

	const mostExpensiveProduct = costData["mostExpensiveProduct"];
	const ulEl = d3
		.select("#donutInfoProduct")
		.append("ul")
		.style("list-style-type", "none");
	ulEl.append("li").html(`${mostExpensiveProduct.title}(${mostExpensiveProduct.release})`);
	ulEl.append("li").html(`Cost: ${formatMoney(mostExpensiveProduct.cost)}`);
	ulEl.append("li")
		.html("Official Category:")
		.append("ul")
		.selectAll("li")
		.data(mostExpensiveProduct.category)
		.enter()
		.append("li")
		.html((d) => d);
}

function getCostDataByCategory() {
	console.log(gData);
	const categoryData = gData.filter((d) => d.category[0] === gCurrentCategory && !!d.category);
	const result = CATEGORY_CONST.map((g) => ({ name: g, cost: 0 }));
	console.log(categoryData);
	categoryData.forEach((d) => {
		const limitedCategories = d.category.filter((g) => CATEGORY_CONST.includes(g));
		console.log("Potato");
		console.log(limitedCategories);
		limitedCategories.forEach((g) => {
			const index = CATEGORY_CONST.indexOf(g);
			result[index]["cost"] = result[index]["cost"] + d.cost;
			if (d.cost > result[index]["mostExpensive"]) {
				result[index]["mostExpensive"] = d.cost;
				result[index]["mostExpensiveProduct"] = d;
			}
		});
	});
	return result;
}

function formatMoney(value) {
	if (value > 1000) {
		return `$${(value / 1000).toFixed(2)}B`;
	}
	return `$${value.toFixed(2)}M`;
}
