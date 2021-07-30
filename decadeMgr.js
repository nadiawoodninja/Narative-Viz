let gCurrentHighlightGenre;
function changeDecade(decade) {
	document.getElementById(`decade${gCurrentDecade}`).classList.remove("selectedDecade");
	gCurrentDecade = decade;
	document.getElementById(`decade${gCurrentDecade}`).classList.add("selectedDecade");
	updatePie();
	updateLine();
}

let gCurrentHighlightCategory;
function changeCategory(category) {
	document.getElementById(`category${gCurrentCategory}`).classList.remove("selectedCategory");
	gCurrentCategory = category;
	document.getElementById(`category${gCurrentCategory}`).classList.add("selectedCategory");
	updatePie();
	updateLine();
}
