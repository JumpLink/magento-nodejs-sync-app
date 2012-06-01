function getTotalWidth(element) {
	var theElement = element;
	var totalWidth = theElement.width();
	totalWidth += parseInt(theElement.css("padding-left"), 10) + parseInt(theElement.css("padding-right"), 10); //Total Padding Width
	totalWidth += parseInt(theElement.css("margin-left"), 10) + parseInt(theElement.css("margin-right"), 10); //Total Margin Width
	totalWidth += parseInt(theElement.css("borderLeftWidth"), 10) + parseInt(theElement.css("borderRightWidth"), 10); //Total Border Width
	return totalWidth;
}