// 2. 描画用のデータ準備
var width = document.querySelector("svg").clientWidth;
var height = document.querySelector("svg").clientHeight;
var data = {
    "name": "A",
    "children": [
        { "name": "B" },
        {
            "name": "C",
            "children": [{ "name": "D" }, { "name": "E" }, { "name": "F" }]
        },
        { "name": "G" },
        {
            "name": "H",
            "children": [{ "name": "I" }, { "name": "J" }]
        },
        { "name": "K" }
    ]
};

// 3. 描画用のデータ変換
root = d3.hierarchy(data);

var tree = d3.tree()
    .size([height, width - 160])
//  .nodeSize([50,300]) ;
//  .separation(function(a, b) { return(a.parent == b.parent ? 1 : 2); });

tree(root);
//各ノードが持つ末端ノードの数を付与
root.count();

//位置やサイズ情報
const rectSize = {
    height: 20,
    width: 80
};

const basicSpace = {
    padding: 30,
    height: 50,
    width: 120
};

//x座標の計算
const defineX = (wholeData, eachData, spaceInfo) => {
    //最上位から現在のデータまでの最短ルートを取得
    const path = wholeData.path(eachData);
    //渡された元データがJSONのままなのでHierarchy形式に変換
    const wholeTree = wholeData.descendants()
    //経由する各ノードのある階層から、経由地点より上に位置する末端ノードの個数を合計
    const leaves = path.map((ancestor) => {
        //経由地点のある階層のうちで親が同じデータを抽出
        const myHierarchy = wholeTree.filter((item, idx, ary) => item.depth === ancestor.depth && item.parent === ancestor.parent);
        //その階層における経由地点のインデックス取得
        var myIdx = myHierarchy.findIndex((item) => item.data.name == ancestor.data.name);
        //経由地点より上にあるものをフィルタリング
        const fitered = myHierarchy.filter((hrcyItem, hrcyIdx, hrcyAry) => hrcyIdx < myIdx);
        //valueを集計（配列が空の時があるので、reduceの初期値に0を設定）
        const sumValues = fitered.reduce((previous, current, index, array) => previous + current.value, 0);
        return sumValues;
    });
    //末端ノードの数を合計
    const sum = leaves.reduce((previous, current, index, array) => previous + current);
    return sum;
};

//位置決め
const definePos = (treeData, spaceInfo) => {
    treeData.each((d) => {
        d.y = spaceInfo.padding + d.depth * spaceInfo.width;
        const sum = defineX(treeData, d, spaceInfo);
        d.x = spaceInfo.padding + sum * spaceInfo.height;
    })
}

definePos(root, basicSpace);

// 4. svg要素の配置
g = d3.select("svg").append("g");
var link = g.selectAll(".link")
    .data(root.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", function (d) {
        return "M" + d.y + "," + d.x +
            "L" + (d.parent.y + rectSize.width + (basicSpace.width - rectSize.width) / 2) + "," + d.x +
            " " + (d.parent.y + rectSize.width + (basicSpace.width - rectSize.width) / 2) + "," + d.parent.x +
            " " + (d.parent.y + rectSize.width) + "," + d.parent.x
    })
    .attr("transform", function (d) { return "translate(0," + rectSize.height / 2 + ")"; });

var node = g.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })

node.append("rect")
    .attr("width", rectSize.width)
    .attr("height", rectSize.height)
    .attr("fill", "white")
    .attr("stroke", "black");

//テキスト
node.append("text")
    .text(function (d) { return d.data.name; })
    .attr("transform", "translate(" + 10 + "," + 15 + ")");