// 2. �`��p�̃f�[�^����
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

// 3. �`��p�̃f�[�^�ϊ�
root = d3.hierarchy(data);

var tree = d3.tree()
    .size([height, width - 160])
//  .nodeSize([50,300]) ;
//  .separation(function(a, b) { return(a.parent == b.parent ? 1 : 2); });

tree(root);
//�e�m�[�h�������[�m�[�h�̐���t�^
root.count();

//�ʒu��T�C�Y���
const rectSize = {
    height: 20,
    width: 80
};

const basicSpace = {
    padding: 30,
    height: 50,
    width: 120
};

//x���W�̌v�Z
const defineX = (wholeData, eachData, spaceInfo) => {
    //�ŏ�ʂ��猻�݂̃f�[�^�܂ł̍ŒZ���[�g���擾
    const path = wholeData.path(eachData);
    //�n���ꂽ���f�[�^��JSON�̂܂܂Ȃ̂�Hierarchy�`���ɕϊ�
    const wholeTree = wholeData.descendants()
    //�o�R����e�m�[�h�̂���K�w����A�o�R�n�_����Ɉʒu���閖�[�m�[�h�̌������v
    const leaves = path.map((ancestor) => {
        //�o�R�n�_�̂���K�w�̂����Őe�������f�[�^�𒊏o
        const myHierarchy = wholeTree.filter((item, idx, ary) => item.depth === ancestor.depth && item.parent === ancestor.parent);
        //���̊K�w�ɂ�����o�R�n�_�̃C���f�b�N�X�擾
        var myIdx = myHierarchy.findIndex((item) => item.data.name == ancestor.data.name);
        //�o�R�n�_����ɂ�����̂��t�B���^�����O
        const fitered = myHierarchy.filter((hrcyItem, hrcyIdx, hrcyAry) => hrcyIdx < myIdx);
        //value���W�v�i�z�񂪋�̎�������̂ŁAreduce�̏����l��0��ݒ�j
        const sumValues = fitered.reduce((previous, current, index, array) => previous + current.value, 0);
        return sumValues;
    });
    //���[�m�[�h�̐������v
    const sum = leaves.reduce((previous, current, index, array) => previous + current);
    return sum;
};

//�ʒu����
const definePos = (treeData, spaceInfo) => {
    treeData.each((d) => {
        d.y = spaceInfo.padding + d.depth * spaceInfo.width;
        const sum = defineX(treeData, d, spaceInfo);
        d.x = spaceInfo.padding + sum * spaceInfo.height;
    })
}

definePos(root, basicSpace);

// 4. svg�v�f�̔z�u
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

//�e�L�X�g
node.append("text")
    .text(function (d) { return d.data.name; })
    .attr("transform", "translate(" + 10 + "," + 15 + ")");