let gData;

async function fetchDataFromWeb() {
	const isLocal = true;
	const url = (isLocal ? "https://nadiawoodninja.github.io/Narative-Viz/" : "") + "homeautomationProducts.csv";
	const data = await d3.csv(url, transformData);
	return data;
}

// Data keys:
// Vote Year
// Release
// Title
// Category
//PC Mag Ratings
function transformData(entry) {
	const processedCategory = processedCategory(entry["Category"]);
	if (!processedCategory) {
		console.warn("Invalid entry:" + entry["Category"]);
		return null;
	} else {
		return {
			title: entry["Title"],
			year: Number(entry["Best Device for Year"]),
			release: Number(entry["Release"]),
			cost: Number(entry["Cost"].replace(/,/g, "")) / 1000000,
			category: processedCategory,
		};
	}
}

const CATEGORY_CONST = [
	"Smart Displays",
	"Smart Speakers",
	"Smart Plugs",
	"Home Security Cameras",
	"Smart Locks and Home Security Systems",
	"Smart Heating and Cooling",
	"Smart Lighting",
];

function processedCategory(rawCategories) {
	try {
		const entryCategories = JSON.parse(rawCategories.replace(/\'/g, '"'));
		const categorysArray = entryCategories.map((catObj) => catObj.name);
		if (categorysArray.includes("")) {
			return undefined;
		}
		return categorysArray;
	} catch (e) {
		return undefined;
	}
}
