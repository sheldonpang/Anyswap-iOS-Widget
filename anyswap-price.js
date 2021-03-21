const widget = new ListWidget()

const anyStats = await fetchANYStats()

await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
	await widget.presentSmall()
}

widget.setPadding(10, 10, 10, 10)
widget.url = 'https://anyswap.exchange/dashboard'

Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {

	let line1, line2, line3
	let icon = widget.addStack()

	const coin = await getImage('anyswap')
	const coinImg = icon.addImage(coin)
	coinImg.imageSize = new Size(30, 30)
	coinImg.cornerRadius = 15

	icon.layoutHorizontally()
	icon.addSpacer(8)

	let iconRow = icon.addStack()
	iconRow.layoutVertically()

	let iconText = iconRow.addStack()
	line1 = iconText.addText("Anyswap")
	line1.font = Font.mediumRoundedSystemFont(13)
	// line1.leftAlignText()

    let percentageString = anyStats.price_change_percentage_24h.toFixed(2);
    let percentageSign = anyStats.price_change_percentage_24h > 0 ? "+" : ""
	let line1nxt = iconRow.addText(percentageSign + percentageString + "%")
    line1nxt.textColor = new Color('#'+signColouring(percentageString))
	line1nxt.font = Font.mediumRoundedSystemFont(13)
    line1nxt.rightAlignText()

	line2 = widget.addText("by 🚀")
	line2.font = Font.lightRoundedSystemFont(11)
	line2.leftAlignText()

	widget.addSpacer(10)

	let row = widget.addStack()
	row.layoutHorizontally()
	
	let currentPrice = row.addText("$" + anyStats.current_price.toString())
	currentPrice.textColor = new Color('#'+signColouring(percentageString))
	currentPrice.font = Font.regularMonospacedSystemFont(18)

    let volRow = widget.addStack()
	volRow.layoutHorizontally()
	
	let currentVolume = volRow.addText("Vol. " + "$" + (anyStats.market_cap_change_24h / 1000000).toFixed(2) + "M")
	currentVolume.font = Font.lightRoundedSystemFont(11);
    currentVolume.leftAlignText()

	widget.addSpacer(10)

	let row2 = widget.addStack()
	row2.layoutHorizontally()

	let currentMarketCap = row2.addText("Market Cap: " + "$" + (anyStats.market_cap / 1000000).toFixed(2) + "M")
	currentMarketCap.font = Font.lightRoundedSystemFont(11)
}

// Get coloring dependant on the percentage
function signColouring(percentage) {
	let colorCode = ''
	if (percentage >= 0) { colorCode = '65c64c'}
	if (percentage < 0) { colorCode = 'b74d34'}

	return colorCode
}

// fetches the anyswap stats
async function fetchANYStats() {

    let url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=anyswap'

	const req = new Request(url);
	const apiResult = await req.loadJSON();
    
	const stats = apiResult[0];
	return stats;
}

// get images from local filestore or download them once
async function getImage(image) {
	let fm = FileManager.local()
	let dir = fm.documentsDirectory()
	let path = fm.joinPath(dir, image)
	if (fm.fileExists(path)) {
		return fm.readImage(path)
	} else {
		// download once
		let imageUrl
		switch (image) {
			case 'bitcoin':
				imageUrl = "/coins/images/1/small/bitcoin.png?1547033579"
				break
            case 'anyswap':
                imageUrl = "/coins/images/12242/small/anyswap.jpg?1598443880"
                break
			default:
				console.log(`Sorry, couldn't find ${image}.`);
		}

		let iconImage = await loadImage('https://assets.coingecko.com'+imageUrl)
		fm.writeImage(path, iconImage)
		return iconImage
	}
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
	const req = new Request(imgUrl)
	return await req.loadImage()
}

// end of script