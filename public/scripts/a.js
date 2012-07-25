var _item_id = '123'; //Karina got this!
var path = window.location.pathname;
var items_id = path.match(/\d/g);
items_id.join("");
console.log(items_id);
var _html_loc = '<iframe src="http://gilterview.herokuapp.com/item/' + items_id + '" width="660px" height="350px" style="padding-left:160px;"></iframe>';

$(".product-detail").append(_html_loc);
