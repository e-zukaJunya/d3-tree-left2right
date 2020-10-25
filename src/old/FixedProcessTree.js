// JavaScript source code
$(function () {
    const rectSize = {
        height: 20,
        width: 80
    };

    const basicSpace = {
        padding: 30,
        height: 50,
        width: 120
    };

    const data = {
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

    //�c���[�p�f�[�^�ݒ�
    let root = d3.hierarchy(data);
    let tree = d3.tree();
    tree(root);
    root.count();

    //svg�v�f
    const height = root.value * rectSize.height + (root.value - 1) * (basicSpace.height - rectSize.height) + basicSpace.padding * 2;
    const width = (root.height + 1) * rectSize.width + root.height * (basicSpace.width - rectSize.width) + basicSpace.padding * 2;
    const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

    //�C���f�b�N�X���̕t�^
    root.each((d, i) => {
        d.index = i;
    });
    console.log(root);

    //�K�w�T��
    const seekParent = (hierarchy, name) => {
        const crntHrcy = hierarchy.parent.children;
        const target = crntHrcy.find((contents) => contents.data.name == name);
        return target ? crntHrcy : seekParent(crntHrcy[0].parent, name);
    };

    //��������ɂ��閖�[�m�[�h�̐���z��Ƃ��Ď��o��
    const calcLeaves = (names, crntData) => {
        const leaves = names.map((name, idx, ary) => {
            //�K�w�T��
            const myHierarchy = seekParent(crntData, name);
            //�����̃C���f�b�N�X�擾
            var myIdx = myHierarchy.findIndex((contents) => contents.data.name == name);
            //���̊K�w�ō��̃f�[�^�����Value�����ׂĉ��Z
            const fitered = myHierarchy.filter((hrcyItem, hrcyIdx, hrcyAry) => hrcyIdx < myIdx);
            console.log("fitered.length")
            console.log(fitered.length)
            console.log("reduce")
            console.log(fitered.reduce((previous, current, index, array) => previous + current.value, 0))
            const val = (fitered.length === 0) ? 0 : fitered.reduce((previous, current, index, array) => previous + current.value, 0);
            return val;
        })
        return leaves;
    }

    //y���W�̌v�Z
    const defineY = (eachData, spaceInfo) => {
        let posY;
        if (eachData.depth === 0) {
            //�ŏ�ʂ̏ꍇ
            posY = spaceInfo.padding;
        } else {
            //�e�����ǂ�z�񂩂�o�C���h���ꂽ�f�[�^�𒊏o
            const ancestorValues = eachData.ancestors().map((item) => { return item.data.name });
            //��������ɂ��閖�[�m�[�h�̐���z��Ƃ��Ď��o��
            const leaves = calcLeaves(ancestorValues.slice(0, ancestorValues.length - 1), eachData);
            //�m�[�h�̐������v����x���W���v�Z
            const sumLeaves = leaves.reduce((previous, current, index, array) => previous + current);
            posY = spaceInfo.padding + sumLeaves * spaceInfo.height;
        }
        return posY;
    }

    //�ʒu����
    const definePos = (treeData, spaceInfo) => {
        treeData.each((d) => {
            d.x = d.depth * spaceInfo.width + spaceInfo.padding;
            d.y = defineY(d, spaceInfo);
        })
    }

    definePos(root, basicSpace);

    //�S�̂��O���[�v��
    const g = svg.append("g");

    //path�v�f�̒ǉ�
    g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("d", function (d) {
            return "M" + d.x + "," + d.y +
                "L" + (d.parent.x + rectSize.width + (basicSpace.width - rectSize.width) / 2) + "," + d.y +
                " " + (d.parent.x + rectSize.width + (basicSpace.width - rectSize.width) / 2) + "," + d.parent.y +
                " " + (d.parent.x + rectSize.width) + "," + d.parent.y
        })
        .attr("transform", function (d) { return "translate(0," + rectSize.height / 2 + ")"; });

    //�e�m�[�h�p�O���[�v�̍쐬
    const node = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    //�l�p
    node.append("rect")
        .attr("width", rectSize.width)
        .attr("height", rectSize.height)
        .attr("fill", "#fff")
        .attr("stroke", "black");

    //�e�L�X�g
    node.append("text")
        .text(function (d) { return d.data.name; })
        .attr("transform", "translate(" + 10 + "," + 15 + ")");

    //�摜�N���b�N����class��toggle
    const toggleMenu = $(".node");
    toggleMenu.on("click", function () {
        toggleMenu.each((idx, item) => {
            item.classList.remove("selected")
        })
        this.classList.toggle("selected")
    });
})
