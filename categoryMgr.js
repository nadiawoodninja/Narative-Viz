let gCurrentHighlightCategory;
function changeCategory(category) {
	if (gCurrentCategory!=null){
		document.getElementById(`category${gCurrentCategory}`).classList.remove("selectedCategory");

	}
	gCurrentCategory = category;
	document.getElementById(`category${gCurrentCategory}`).classList.add("selectedCategory");
	console.log('Category changed to ' + gCurrentCategory);
	console.log(getCostDataByCategory());
	updatePie();
}