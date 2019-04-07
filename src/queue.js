
const queue = [];

function skipTo(index) {
    queue.splice(0, index);
    return queue[0];
}
function next() {
    return queue.shift();
}

function enqueue(array) {
    queue.push(...array);
}

function view() {
    return [ ...queue ];
}

function length() {
    return queue.length;
}

module.exports = {
    next, enqueue, skipTo, view, length
};