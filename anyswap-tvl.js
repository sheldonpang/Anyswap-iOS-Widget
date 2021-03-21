const widget = new ListWidget()

const anyInfo = await fetchANYInfo()

await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
	await widget.presentSmall()
}

widget.setPadding(5, 5, 5, 5)
widget.url = 'https://anyswap.net/'

Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {

	let mainStack = widget.addStack()

	let leftStack = mainStack.addStack()
	leftStack.layoutVertically()
	
	let nodesTitle = leftStack.addText("Nodes")
	let totalNodes = leftStack.addText(anyInfo.info.length.toFixed())
	totalNodes.textColor = new Color('#f7a437')

	mainStack.addSpacer(15)
	let rightStack = mainStack.addStack()
	rightStack.layoutVertically()
	let bridgesTitle = rightStack.addText("Bridges")
	let totalBridges = rightStack.addText(anyInfo.bridgeNum.toFixed())
	totalBridges.textColor = new Color('#0db9dd')

	widget.addSpacer(15)

	let tvlTitleStack = widget.addStack()
	tvlTitleStack.layoutHorizontally()
	let tvlTitle = tvlTitleStack.addText("Cross-Chain TVL")
	tvlTitle.font = Font.mediumRoundedSystemFont(13)
	let totalTVLStack = widget.addStack()
	totalTVLStack.layoutHorizontally()
	let totalTVL = totalTVLStack.addText((anyInfo.totalAmount / 1000000).toFixed(2) + "M (USD)")
	totalTVL.textColor = new Color('#65c64c')
}

// fetches the anyswap info
async function fetchANYInfo() {

    let infoUrl = 'https://netapi.anyswap.net/bridge/v2/info'
	const infoReq = new Request(infoUrl);
	const infoResult = await infoReq.loadJSON();

	let nodeUrl = 'https://netapi.anyswap.net/nodes/list'
	const nodeReq = new Request(nodeUrl);
	const nodeResult = await nodeReq.loadJSON();
	
	let result = {
		...infoResult,
		...nodeResult
	}

	console.log(result);
    
	return result;
}

// end of script