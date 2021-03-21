config.widgetFamily = config.widgetFamily || 'small'

// Text sizes
const majorSizeData = 20
const fontSizeData = 15
const lineNumberData = 2
const minimumScaleFactor = 1 // Value between 1.0 and 0.1

// Number of data by Size
const numberOfDisplayedDataBySize = {  
  small: 1,
  medium: 2,
  large: 4
}

// Colors
let backColor = new Color('FFFFFF')
let backColor2 = new Color('EDEDED')
let textColor = new Color('000000')
let positiveColor = new Color('65C64C')
let negativeColor = new Color('B74D34')
let nodesColor = new Color('F7A437')
let bridgesColor = new Color('0DB9DD')
let tvlColor = new Color('65C64C')

if (true) {
    backColor = Color.dynamic(backColor, new Color('111111'))
    backColor2 = Color.dynamic(backColor2, new Color('222222'))
    textColor = Color.dynamic(textColor, new Color('EDEDED'))
}

// Get coloring dependant on the percentage
function signColouring(percentage) {
	let colorCode = ''
	if (percentage >= 0) { colorCode = positiveColor}
	if (percentage < 0) { colorCode = negativeColor}

	return colorCode
}

// fetches the anyswap stats
async function fetchANYStats() {

    let url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=anyswap'
	const req = new Request(url);
	const apiResult = await req.loadJSON();

    let infoUrl = 'https://netapi.anyswap.net/bridge/v2/info'
	const infoReq = new Request(infoUrl);
	const infoResult = await infoReq.loadJSON();

	let nodeUrl = 'https://netapi.anyswap.net/nodes/list'
	const nodeReq = new Request(nodeUrl);
	const nodeResult = await nodeReq.loadJSON();

    

    let result = {
        ...apiResult[0],
        ...infoResult,
		...nodeResult
    }

    let percentageString = result.price_change_percentage_24h.toFixed(2);
    let percentageSign = result.price_change_percentage_24h > 0 ? "+" : ""
    let percentageColor = signColouring(percentageString)
    let currentPrice = "$" + result.current_price.toString();
    let marketCap = "$" + (result.market_cap / 1000000).toFixed(2) + "M";

    data = [
        {
            title: "Nodes",
            value: result.info.length.toFixed(),
            titleColor: textColor,
            valueColor: nodesColor
        },
        {
            title: "Bridges",
            value: result.bridgeNum.toFixed(),
            titleColor: textColor,
            valueColor: bridgesColor
        },
        {
            title: "TVL",
            value: "$" + (result.totalAmount / 1000000).toFixed(2) + "M",
            titleColor: textColor,
            valueColor: tvlColor
        }
    ]

    Object.assign(result, {
        percentageString,
        percentageSign,
        percentageColor,
        currentPrice,
        marketCap,
        data
    })

	console.log(result);

	return result;
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
				imageUrl = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579"
				break
            case 'anyswap':
                imageUrl = "https://assets.coingecko.com/coins/images/12242/small/anyswap.jpg?1598443880"
                break
			default:
				console.log(`Sorry, couldn't find ${image}.`);
		}

		let iconImage = await loadImage(imageUrl)
		fm.writeImage(path, iconImage)
		return iconImage
	}
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
	const req = new Request(imgUrl)
	return await req.loadImage()
}

async function prepareSmallWidget(widget, anyStats) {
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

	let line1nxt = iconRow.addText(anyStats.percentageSign + anyStats.percentageString + "%")
    line1nxt.textColor = anyStats.percentageColor
	line1nxt.font = Font.mediumRoundedSystemFont(13)
    line1nxt.rightAlignText()

	line2 = widget.addText("by 🚀")
	line2.font = Font.lightRoundedSystemFont(11)
	line2.leftAlignText()

	widget.addSpacer(10)

	let row = widget.addStack()
	row.layoutHorizontally()
	
	let currentPrice = row.addText(anyStats.currentPrice)
	currentPrice.textColor = anyStats.percentageColor
	currentPrice.font = Font.regularMonospacedSystemFont(18)

    let volRow = widget.addStack()
	volRow.layoutHorizontally()
	
	let currentVolume = volRow.addText("Vol. " + "$" + (anyStats.market_cap_change_24h / 1000000).toFixed(2) + "M")
	currentVolume.font = Font.lightRoundedSystemFont(11);
    currentVolume.leftAlignText()

	widget.addSpacer(10)

	let row2 = widget.addStack()
	row2.layoutHorizontally()

	let currentMarketCap = row2.addText("Market Cap: " + anyStats.marketCap)
	currentMarketCap.font = Font.lightRoundedSystemFont(11)
}

async function prepareMediumWidget(widget, anyStats) {
    let firstLineStack = widget.addStack()

    const coin = await getImage('anyswap')
	const coinImg = firstLineStack.addImage(coin)
	coinImg.imageSize = new Size(30, 30)
	coinImg.cornerRadius = 15

    firstLineStack.layoutHorizontally()
	firstLineStack.addSpacer(8)

	let providerRow = firstLineStack.addStack()
	providerRow.layoutVertically()

    let providerText = providerRow.addText("Anyswap 🚀")
    providerText.font = Font.mediumSystemFont(majorSizeData)
    providerText.textColor = textColor

    widget.addSpacer()

    // Price Info Row
    const infoStack = widget.addStack()
    infoStack.layoutHorizontally()

    // ============= Price ============== //
    let row
    row = widget.addStack()
    row.layoutHorizontally()
    widget.addSpacer(5)

    column = row.addStack()
    column.layoutVertically()
    column.centerAlignContent()

    // Price
    let priceValue;
    priceValue = anyStats.currentPrice
    textStack = column.addStack()
    textStack.layoutHorizontally()
    textStack.addSpacer()
    let priceValueText = textStack.addText(priceValue)
    priceValueText.font = Font.mediumSystemFont(majorSizeData)
    priceValueText.minimumScaleFactor = minimumScaleFactor
    priceValueText.lineLimit = lineNumberData
    priceValueText.centerAlignText()
    priceValueText.textColor = anyStats.percentageColor
    textStack.addSpacer()

    percentageValue = column.addStack()
    percentageValue.layoutHorizontally()
    percentageValue.addSpacer()
    let percentageValueText = percentageValue.addText(anyStats.percentageSign + anyStats.percentageString + "%")
    percentageValueText.font = Font.systemFont(fontSizeData)
    percentageValueText.minimumScaleFactor = minimumScaleFactor
    percentageValueText.lineLimit = 1
    percentageValueText.centerAlignText()
    percentageValueText.textColor = anyStats.percentageColor
    percentageValue.addSpacer()

    // ============= Market Cap ============== //
    column = row.addStack()
    column.layoutVertically()
    column.centerAlignContent()

    // Market Cap
    let marketCapTitle;
    marketCapTitle = "Market Cap"
    textStack = column.addStack()
    textStack.layoutHorizontally()
    textStack.addSpacer()
    let marketCapTitleText = textStack.addText(marketCapTitle)
    marketCapTitleText.font = Font.mediumSystemFont(fontSizeData)
    marketCapTitleText.minimumScaleFactor = minimumScaleFactor
    marketCapTitleText.lineLimit = lineNumberData
    marketCapTitleText.centerAlignText()
    marketCapTitleText.textColor = textColor
    textStack.addSpacer()

    marketCapValue = column.addStack()
    marketCapValue.layoutHorizontally()
    marketCapValue.addSpacer()
    let marketCapValueText = marketCapValue.addText(anyStats.marketCap)
    marketCapValueText.font = Font.systemFont(fontSizeData - 1)
    marketCapValueText.minimumScaleFactor = minimumScaleFactor
    marketCapValueText.lineLimit = 1
    marketCapValueText.centerAlignText()
    marketCapValueText.textColor = positiveColor
    marketCapValue.addSpacer()

    widget.addSpacer()

    // TVL Row
    const stack = widget.addStack()
    stack.layoutHorizontally()

    let i = 0
    let row2

    anyStats.data.forEach((v) => {
        if (++i % 3 == 1) {
            row2 = widget.addStack()
            row2.layoutHorizontally()
            widget.addSpacer(5)
        }
        column = row2.addStack()
        column.layoutVertically()
        column.centerAlignContent()

        // Total Values
        let displayTitle;
        displayTitle = v.title
        textStack = column.addStack()
        textStack.layoutHorizontally()
        textStack.addSpacer()
        let diagramText = textStack.addText(displayTitle)
        diagramText.font = Font.mediumSystemFont(fontSizeData)
        diagramText.minimumScaleFactor = minimumScaleFactor
        diagramText.lineLimit = lineNumberData
        diagramText.centerAlignText()
        diagramText.textColor = v.titleColor
        textStack.addSpacer()

        displayValue = column.addStack()
        displayValue.layoutHorizontally()
        displayValue.addSpacer()
        let diagramName = displayValue.addText(v.value)
        diagramName.font = Font.systemFont(fontSizeData - 1)
        diagramName.minimumScaleFactor = minimumScaleFactor
        diagramName.lineLimit = 1
        diagramName.centerAlignText()
        diagramName.textColor = v.valueColor
        displayValue.addSpacer()
    })
}

// Create Widget
let widget = new ListWidget()
widget.url = 'https://anyswap.exchange/dashboard'

const anyStats = await fetchANYStats()

widget.setPadding(10, 10, 10, 10)

if (anyStats != undefined) {

    const gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
        backColor,
        backColor2
    ]
    widget.backgroundGradient = gradient

    switch (config.widgetFamily) {
        case 'small': await prepareSmallWidget(widget, anyStats); break;
        case 'medium': await prepareMediumWidget(widget, anyStats); break;
        case 'large': await prepareMediumWidget(widget, anyStats); break;
        default: await prepareSmallWidget(widget, anyStats); break;
    }

} else {
    let fallbackText = widget.addText("Unexpected error.")
    fallbackText.font = Font.mediumSystemFont(12)
    fallbackText.textColor = textColor
}

if (!config.runsInWidget) {
    switch (config.widgetFamily) {
        case 'small': await widget.presentSmall(); break;
        case 'medium': await widget.presentMedium(); break;
        case 'large': await widget.presentLarge(); break;
        default: await widget.presentSmall(); break;
    }

} else {
    // Tell the system to show the widget.
    Script.setWidget(widget)
    Script.complete()
}