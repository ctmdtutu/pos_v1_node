let datbase = require('./datbase');


function creatTagsListFromInputs(inputs) {
    let tagsList = [];

    inputs.map((value)=>{

        if(value.indexOf('-') === -1){

            if(!tagsList[value]){
                tagsList[value] = {};
                tagsList[value].count = 1;
            }else {
                tagsList[value].count ++;
            }

        }else {

            let specialTags = value.split('-'),
                specialTagName = specialTags[0],
                specialTagCount = parseInt(specialTags[1]);

            if(!tagsList[specialTagName]){
                tagsList[specialTagName] = {};
                tagsList[specialTagName].count = specialTagCount;
            }else{
                tagsList[specialTagName].count += specialTagCount;
            }

        }
    });

    return tagsList;
}

// let tagsList = creatTagsListFromInputs(inputs);


function creatNewGoodList(tagsList){
    let allItems = datbase.loadAllItems();
    for(let key in tagsList){
        for(let item of allItems){
            if(item.barcode === key){
                tagsList[key].goodInfo = item;
                tagsList[key].subTotal = tagsList[key].count * item.price;
            }
        }
    }
    return tagsList;
}

// let chargeList = creatNewGoodList(tagsList);


function promotion(chargeList, type) {
    switch (type){
        case 'BUY_TWO_GET_ONE_FREE' :
            chargeList.save = chargeList.goodInfo.price;
            chargeList.subTotal -= chargeList.save;
    }
    return chargeList;
}

function matchPromotionToDiscountPrice(chargeList) {
    let promotions = datbase.loadPromotions();
    let result = [];
    for(let item of promotions){
        for(let key in chargeList){
            if(item.barcodes.includes(chargeList[key].goodInfo.barcode)){
                result.push(promotion(chargeList[key],item.type));
            }else {
                result.push(chargeList[key]);
            }
        }
    }
    return result;
}
// let chargeInfo = matchPromotionToDiscountPrice(chargeList);

function printReceipt(chargeInfo) {
    let allSave = 0,
        sum = 0;
    let str = `***<没钱赚商店>购物清单***
`;
    for(let item of chargeInfo){
        if(item.save){
            allSave += item.save;
        }
        str += `名称：${item.goodInfo.name}，数量：${item.count}${item.goodInfo.unit}，单价：${(item.goodInfo.price).toFixed(2)}(元)，小计：${item.subTotal.toFixed(2)}(元)
`;
        sum += item.subTotal;
    }
    str += `----------------------
挥泪赠送商品：
`;
    for(let item of chargeInfo){
        if(item.save){
            str += `名称：${item.goodInfo.name}，数量：${1}${item.goodInfo.unit}
`;
        }
    }

    str +=`----------------------
总计：${sum.toFixed(2)}(元)
节省：${allSave.toFixed(2)}(元)
**********************`;

    return str;
}

module.exports = function main(inputs) {
    let tagsList = creatTagsListFromInputs(inputs);
    let chargeList = creatNewGoodList(tagsList);
    let chargeInfo = matchPromotionToDiscountPrice(chargeList);
    let str = printReceipt(chargeInfo);
    console.log(str);
}

// main(inputs);