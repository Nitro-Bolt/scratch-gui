HTMLHtmlElement.prototype.findNodesWithInnerText = function(text) {
    let list = [];
    for (const node of this.querySelectorAll('*')) {
        if (node && node.innerText && node.innerText == text) list.push(node);
    }
    return list;
}

HTMLHtmlElement.prototype.descendants = function(text) {
    let list = [];
    for (const node of this.querySelectorAll('*')) {
        if (node) list.push(node);
    }
    return list;
}